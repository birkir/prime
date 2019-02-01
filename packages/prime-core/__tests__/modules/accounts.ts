import { GraphQLModule } from '@graphql-modules/core';
import { Container } from 'typedi';
import { Connection, useContainer } from 'typeorm';

import { createAccounts } from '../../src/modules/accounts';
import { connect } from '../../src/utils/connect';

useContainer(Container);

describe('AccountsModule', () => {
  let connection: Connection;
  let accounts: GraphQLModule;

  beforeAll(async () => {
    connection = await connect(process.env.TEST_DATABASE_URL);
    accounts = await createAccounts(connection);
  });

  afterAll(() => connection.close());

  describe('Accounts', () => {
    it('should have schema', () => {
      expect(accounts.schema).toBeTruthy();
    });
    it('should have resolvers', () => {
      expect(accounts.resolvers).toBeTruthy();
    });
  });
});
