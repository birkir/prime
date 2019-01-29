import { GraphQLModule } from '@graphql-modules/core';
import { PubSub } from 'apollo-server-express';
import Container from 'typedi';
import { Connection } from 'typeorm';
import { createAccounts } from './accounts';
import { createInternal } from './internal';

export const pubSub = new PubSub();

export const createModules = async (connection: Connection) => {
  const accounts = await createAccounts(connection);
  const internal = await createInternal(connection);

  return new GraphQLModule({
    imports: () => [internal, accounts],
    context() {
      const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
      const container = Container.of(requestId);
      const ctx = {
        requestId,
        container,
      };
      container.set('context', ctx);
      return ctx;
    },
  });
};
