// Set environment before initialize sequelize
process.env.DATABASE_URL = 'postgresql://birkir@localhost:5432/prime-tests';

/* tslint:disable */
import { createTestClient } from 'apollo-server-testing';
import { ForbiddenError } from 'apollo-server-core';
import { sequelize } from '../../src/sequelize';
import { User } from '../../src/models/User';
import { setupAcl, acl } from '../../src/acl';
/* tslint:enable */

describe('@primecms/core', () => {
  describe('internal', () => {
    let server;
    let user;
    let webhookId;

    beforeAll(async () => {
      await sequelize.sync({ force: true });
      await setupAcl(sequelize);

      const { internalGraphql } = require('../../src/routes/internal');
      const internal = await internalGraphql(() => null);

      const ensureAllowed = async (resources, permissions) => {
        const isAllowed = await acl.isAllowed(user.id, resources, permissions);
        if (!isAllowed) {
          throw new ForbiddenError('Insufficient permissions');
        }
      };

      server = internal.server;

      user = await User.create({
        firstname: 'Sample',
        lastname: 'User',
        email: 'sample@user.com',
        password: 'sampleuser',
      });

      await acl.addUserRoles(user.id, 'admin');

      server.context = { user, ensureAllowed };
    });

    afterAll(() => {
      sequelize.close();
    });

    it('sequelize should have a connection manager', () => {
      expect(sequelize).toHaveProperty('connectionManager');
    });

    it('should show correct version', async () => {
      const { query } = createTestClient(server);
      const res = await query({
        query: `query { primeVersion { current } }`,
      });

      expect(res).toMatchSnapshot();
    });

    it('should be able to create WebHook', async () => {
      const { mutate } = createTestClient(server);

      const input = {
        name: 'Sample Webhook',
        url: 'https://address.com/endpoint',
        method: 'POST',
      };

      const res = await mutate({
        mutation: `mutation CreateWebhook($input: WebhookInput!) {
          createWebhook(
            input: $input
          ) {
            id
            name
            url
            method
          }
        }`,
        ...{ variables: { input } },
      });

      expect(res.errors).toBeUndefined();
      expect(res.data!.createWebhook!.name!).toBe(input.name);
      expect(res.data!.createWebhook!.url!).toBe(input.url);
      expect(res.data!.createWebhook!.method!).toBe(input.method);
      webhookId = res.data!.createWebhook!.id;
    });

    it('should be able to update webhook', async () => {
      const { mutate } = createTestClient(server);
      const input = {
        name: 'Sample Webhook 2',
        url: 'https://address.com/endpoint/2',
        method: 'GET',
      };
      const res = await mutate({
        mutation: `mutation UpdateWebhook($id:ID!, $input: WebhookInput!) {
          updateWebhook(id: $id, input: $input) {
            id
            name
            url
            method
          }
        }`,
        ...{ variables: { id: webhookId, input } },
      });

      expect(res.errors).toBeUndefined();
      expect(res.data!.updateWebhook!.name!).toBe(input.name);
      expect(res.data!.updateWebhook!.url!).toBe(input.url);
      expect(res.data!.updateWebhook!.method!).toBe(input.method);
    });

    it('should be able to delete webhook', async () => {
      const { query, mutate } = createTestClient(server);
      const res = await mutate({
        mutation: `mutation RemoveWebhook($id:ID!) { removeWebhook(id:$id) }`,
        ...{ variables: { id: webhookId } },
      });
      expect(res.errors).toBeUndefined();
      expect(res.data!.removeWebhook!).toBe(true);

      const exists = await query({
        query: `query Webhook($id:ID!) { Webhook(id:$id) { id } }`,
        ...{ variables: { id: webhookId } },
      });
      expect(exists.data!.Webhook!).toBeNull();
    });
  });
});
