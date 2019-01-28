import { ApolloServer } from 'apollo-server-express';
import debug from 'debug';
import express from 'express';
import http from 'http';
import { ResolverData, useContainer as useTypeContainer } from 'type-graphql';
import { Container } from 'typedi';
import { useContainer } from 'typeorm';
import { createModules } from './modules';
import { Context } from './types/Context';
import { ServerConfig } from './types/ServerConfig';

const log = debug('prime');

useContainer(Container);
useTypeContainer<Context>(({ context }) => context.container);

export const createServer = async ({ port, connection }: ServerConfig) => {
  const app = express();
  const server = http.createServer(app);
  const { schema, context, subscriptions } = await createModules(connection);

  const apollo = new ApolloServer({
    playground: true,
    subscriptions,
    context,
    schema,
    formatResponse(response: any, resolver: ResolverData<Context>) {
      Container.reset(resolver.context.requestId);
      return response;
    },
  });

  apollo.installSubscriptionHandlers(server);
  apollo.applyMiddleware({ app });

  return server.listen(port, () => {
    log(`🚀 Server ready at http://localhost:${port}${apollo.graphqlPath}`);
    log(`🚀 Subscriptions ready at ws://localhost:${port}${apollo.subscriptionsPath}`);
  });
};
