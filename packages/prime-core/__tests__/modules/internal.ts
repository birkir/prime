import { GraphQLModule } from '@graphql-modules/core';
import { Container } from 'typedi';
import { Connection, createConnection, useContainer } from 'typeorm';
import { createInternal } from '../../src/modules/internal';

useContainer(Container);

describe('InternalModule', () => {
  let connection: Connection;
  let internal: GraphQLModule;
  let mutations: any;
  let queries: any;
  let context: any;

  beforeAll(async () => {
    connection = await createConnection({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgres://birkir@localhost:5432/prime-test',
      entities: [
        ...require('@accounts/typeorm').entities,
        'src/entities/*.ts',
        'src/schema/internal/types/*.ts',
      ],
      synchronize: true,
    });

    internal = await createInternal(connection);
    mutations = internal.resolvers.Mutation;
    queries = internal.resolvers.Query;
  });

  beforeEach(async () => {
    const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    const container = Container.of(requestId);
    context = { requestId, container };
    container.set('context', context);

    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(() => connection.close());

  describe('Webhook', () => {
    it('should be able to create webhooks', async () => {
      const input = { name: 'Hello', url: 'https://example.com', method: 'PUT' };
      const webhook = await mutations.createWebhook.resolve({}, { input }, context);
      expect(webhook).toBeTruthy();
      const result = await queries.Webhook.resolve({}, { id: webhook.id }, context);
      expect(result.id).toEqual(webhook.id);
    });

    it('should have no webhooks', async () => {
      const result = await queries.allWebhooks.resolve({}, { order: 'id_ASC' }, context);
      expect(result.edges).toHaveLength(0);
      expect(result.totalCount).toEqual(0);
    });

    it('should be able to update webhooks', async () => {
      const input = { name: 'Hello', url: 'https://example.com', method: 'PUT' };
      const webhook = await mutations.createWebhook.resolve({}, { input }, context);
      expect(webhook).toBeTruthy();
      const updatedUrl = 'http://noop.com';
      const updateVariables = { id: webhook.id, input: { ...webhook, url: updatedUrl } };
      const update = await mutations.updateWebhook.resolve({}, updateVariables, context);
      expect(update.url).toBe(updatedUrl);
      expect(update.name).toBe(webhook.name);
    });

    it('should be able to remove webhooks', async () => {
      const input = { name: 'Hello', url: 'https://example.com', method: 'PUT' };
      const { id } = await mutations.createWebhook.resolve({}, { input }, context);
      const result = await mutations.removeWebhook.resolve({}, { id }, context);
      expect(result).toBeTruthy();
      const webhook = await queries.Webhook.resolve({}, { id }, context);
      expect(webhook).toBeFalsy();
    });
  });
});
