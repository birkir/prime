import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import express from 'express';
import { buildSchema } from 'graphql';
import http from 'http';
import sofa from 'sofa-api';
import { ResolverData } from 'type-graphql';
import { Container } from 'typedi';
import { useContainer } from 'typeorm';
import { Context } from './interfaces/Context';
import { ServerConfig } from './interfaces/ServerConfig';
import { createExternal } from './modules/external';
import { createInternal } from './modules/internal';
import { config } from './utils/config';
import { fields } from './utils/fields';
import { log } from './utils/log';
import { previewRoutes } from './utils/preview';
import { pubSub } from './utils/pubSub';
import { serveUI } from './utils/serveUI';

useContainer(Container);

export const createServer = async ({ port, connection }: ServerConfig) => {
  const app = express();
  const server = http.createServer(app);
  const { schema, context, subscriptions } = await createInternal(connection);
  let external;

  app.use(
    cors({
      credentials: true,
      origin: true,
    })
  );

  const externalServer: any = new ApolloServer({
    introspection: true,
    playground: true,
    schema: buildSchema(`type Query { boot: Boolean }`),
  });

  pubSub.subscribe('REBUILD_EXTERNAL', async payload => {
    if (external) {
      log('schemas have changed', payload.name);
    }

    external = await createExternal(connection);
    externalServer.schema = external.schema;
    externalServer.context = external.context;

    if (config.sofaApi) {
      app.use(
        `${config.path}api`,
        sofa({
          schema: external.schema,
          ignore: ['Prime_Document'],
        })
      );
    }
  });

  pubSub.publish('REBUILD_EXTERNAL', { name: 'SERVER_BOOT' });

  externalServer.applyMiddleware({
    app,
    path: `${config.path}graphql`,
    cors: {
      origin: true,
    },
  });

  fields.forEach(
    field =>
      field.ui && app.use(`${config.pathClean}/prime/field/${field.type}`, express.static(field.ui))
  );

  const apollo = new ApolloServer({
    playground: false,
    introspection: true,
    subscriptions: {
      ...subscriptions,
      onConnect: (params, ws, ctx) => ctx,
    },
    async context(ctx) {
      if (!ctx.req && (ctx as any).connection) {
        return context({ req: (ctx as any).connection.context.request });
      }
      return context(ctx);
    },
    schema,
    formatResponse(response: any, resolver: ResolverData<Context>) {
      Container.reset(resolver.context.requestId);
      return response;
    },
  });

  apollo.installSubscriptionHandlers(server);
  apollo.applyMiddleware({
    app,
    path: `${config.path}prime/graphql`,
    cors: {
      origin: true,
    },
  });

  previewRoutes(app);
  serveUI(app);

  return server.listen(port, () => {
    log(`🚀 Server ready at http://localhost:${port}${apollo.graphqlPath}`);
    log(`🚀 Subscriptions ready at ws://localhost:${port}${apollo.subscriptionsPath}`);
  });
};
