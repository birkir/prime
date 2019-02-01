import { GraphQLModule } from '@graphql-modules/core';
import Container from 'typedi';
import { Connection } from 'typeorm';
import { createAccounts } from './accounts';
import { createInternal } from './internal';
import { isAuthenticated } from './internal/utils/isAuthenticated';

export const createModules = async (connection: Connection) => {
  const accounts = await createAccounts(connection);
  const internal = await createInternal(connection);

  return new GraphQLModule({
    imports: () => [internal, accounts],
    context(context) {
      const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
      const container = Container.of(requestId);
      const ctx = {
        requestId,
        container,
      };
      container.set('context', ctx);
      return ctx;
    },
    resolversComposition: {
      'Mutation.createUser': [isAuthenticated()],
    },
  });
};
