import { User } from '@accounts/typeorm';
import { GraphQLModule } from '@graphql-modules/core';
import { Container } from 'typedi';
import { Connection, getRepository, useContainer } from 'typeorm';

import { createInternal } from '../../src/modules/internal';
import { connect } from '../../src/utils/connect';

useContainer(Container);

describe('InternalModule', () => {
  let connection: Connection;
  let internal: GraphQLModule;
  let mutations: any;
  let queries: any;
  let context: any;
  let user: User;
  let info: any;

  beforeAll(async () => {
    connection = await connect(process.env.TEST_DATABASE_URL);
    internal = await createInternal(connection);
    mutations = internal.resolvers.Mutation;
    queries = internal.resolvers.Query;
    user = getRepository(User).create({ username: 'test ' });
    info = { session: { user } };
    await new Promise(r => setTimeout(r, 1000));
  });

  beforeEach(async () => {
    const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    const container = Container.of(requestId);
    context = { requestId, container, user, session: { user } };
    container.set('context', context);

    await connection.dropDatabase();
    await connection.synchronize();

    // settle db connection
    await new Promise(r => setTimeout(r, 1000));
  });

  afterAll(() => connection.close());

  describe('Webhook', () => {
    it('should be able to create webhooks', async () => {
      const input = { name: 'Hello', url: 'https://example.com', method: 'PUT' };
      const webhook = await mutations.createWebhook({}, { input }, context, info);
      expect(webhook).toBeTruthy();
      const result = await queries.Webhook({}, { id: webhook.id }, context, info);
      expect(result.id).toEqual(webhook.id);
    });

    it('should have no webhooks', async () => {
      const result = await queries.allWebhooks({}, { order: 'id_ASC' }, context, info);
      expect(result.edges).toHaveLength(0);
      expect(result.totalCount).toEqual(0);
    });

    it('should be able to update webhooks', async () => {
      const input = { name: 'Hello', url: 'https://example.com', method: 'PUT' };
      const webhook = await mutations.createWebhook({}, { input }, context, info);
      expect(webhook).toBeTruthy();
      const updatedUrl = 'http://noop.com';
      const updateVariables = { id: webhook.id, input: { ...webhook, url: updatedUrl } };
      const update = await mutations.updateWebhook({}, updateVariables, context, info);
      expect(update.url).toBe(updatedUrl);
      expect(update.name).toBe(webhook.name);
    });

    it('should be able to remove webhooks', async () => {
      const input = { name: 'Hello', url: 'https://example.com', method: 'PUT' };
      const { id } = await mutations.createWebhook({}, { input }, context, info);
      const result = await mutations.removeWebhook({}, { id }, context, info);
      expect(result).toBeTruthy();
      const webhook = await queries.Webhook({}, { id }, context, info);
      expect(webhook).toBeFalsy();
    });
  });

  describe('Authentication', () => {
    it('should be authorized', async () => {
      try {
        await queries.Webhook({}, { id: 'nah' }, { ...context, user: null }, { session: {} });
        throw new Error();
      } catch (e) {
        expect(e.message).toContain('Must be authenticated');
      }
    });
  });
});
