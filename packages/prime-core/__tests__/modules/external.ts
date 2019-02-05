import 'reflect-metadata';

import { User } from '@accounts/typeorm';
import { GraphQLModule } from '@graphql-modules/core';
import { gql } from 'apollo-server-core';
import { execute } from 'graphql';
import Container from 'typedi';
import { Connection, getRepository, useContainer } from 'typeorm';

import { createModules } from '../../src/modules';
import { createExternal } from '../../src/modules/external';
import { connect } from '../../src/utils/connect';
import { createSchemaQuery } from '../utils/createSchemaQuery';

useContainer(Container);

describe('InternalModule', () => {
  let connection: Connection;
  let external: GraphQLModule;
  let internal: GraphQLModule;
  let user: User;
  const context: any = { req: { headers: {} } };

  const query = async (document, which = external, ctx = context) =>
    execute({
      schema: which.schema,
      contextValue: await which.context(ctx),
      document,
    });

  beforeAll(async () => {
    connection = await connect(process.env.TEST_DATABASE_URL);

    await connection.dropDatabase();
    await connection.synchronize();

    internal = await createModules(connection);
    external = await createExternal(connection);
    user = getRepository(User).create({ username: 'test ' });
    context.user = user;
  });

  afterAll(() => connection.close());

  describe('GraphQL Module', () => {
    it('should have schema', () => {
      expect(external.schema).toBeTruthy();
    });
    it('should have resolvers', () => {
      expect(external.resolvers).toBeTruthy();
    });
  });

  describe('No Schemas', () => {
    it('should work to query PrimeDocument', async () => {
      const result = await query(gql`
        query {
          Prime_Document {
            ... on Prime_Document_NotFound {
              message
            }
          }
        }
      `);
      expect(result).toEqual({ data: { Prime_Document: null } });
    });
  });

  describe('One Schema', () => {
    beforeAll(async () => {
      const fields = [{ name: 'name' }, { name: 'description' }];
      await query(
        gql`
          mutation {
            createSchema(
              input: ${createSchemaQuery('Author', fields)}
            ) {
              id
              title
              name
            }
          }
        `,
        internal
      );
      external = await createExternal(connection);
    });

    it('should have Author schema', async () => {
      const res = await query(
        gql`
          query {
            __schema {
              types {
                name
              }
            }
          }
        `
      );
      expect(res!.data!.__schema!.types.find(n => n.name === 'Author')).toEqual({ name: 'Author' });
    });
  });
});
