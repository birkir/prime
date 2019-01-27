import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import http from 'http';
import { ResolverData, useContainer as useTypeContainer } from 'type-graphql';
import { Container } from 'typedi';
import { useContainer } from 'typeorm';
import { createSchema } from './schema';
import { Context } from './types/Context';
import { ServerConfig } from './types/ServerConfig';
const debug = require('debug')('prime'); // tslint:disable-line no-var-requires

useContainer(Container);
useTypeContainer<Context>(({ context }) => context.container);

export const createServer = async ({ port, connection }: ServerConfig) => {
  const app = express();
  const server = http.createServer(app);
  const { schema, context, subscriptions } = await createSchema(connection);

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
    debug(`🚀 Server ready at http://localhost:${port}${apollo.graphqlPath}`);
    debug(`🚀 Subscriptions ready at ws://localhost:${port}${apollo.subscriptionsPath}`);
  });
};
