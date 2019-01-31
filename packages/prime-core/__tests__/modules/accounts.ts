import { GraphQLModule } from '@graphql-modules/core';
import { Container } from 'typedi';
import { Connection, createConnection, useContainer } from 'typeorm';
import { createAccounts } from '../../src/modules/accounts';

useContainer(Container);

describe('AccountsModule', () => {
  let connection: Connection;
  let accounts: GraphQLModule;

  beforeAll(async () => {
    connection = await createConnection({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgres://birkir@localhost:5432/prime-test',
      entities: require('@accounts/typeorm').entities,
      synchronize: true,
    });

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
