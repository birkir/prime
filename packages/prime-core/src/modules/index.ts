import { GraphQLModule } from '@graphql-modules/core';
import Container from 'typedi';
import { Connection } from 'typeorm';
import { createAccounts } from './accounts';
import { createInternal } from './internal';

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
        user: { id: '35416EC9-CA8D-4B7F-B36C-C16C1E88B255'.toLowerCase() }, //
      };
      container.set('context', ctx);
      return ctx;
    },
  });
};
