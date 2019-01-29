import { GraphQLID, GraphQLNonNull } from 'graphql';
import { resolver } from 'graphql-sequelize';
import { Webhook } from '../../../models/Webhook';
import { Webhook as WebhookType } from '../types/Webhook';

export const oneWebhook = {
  type: WebhookType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: resolver(Webhook, {
    before(opts, args, context, info) {
      const { id } = args;
      return { where: { id }, ...opts };
    },
  }),
};
