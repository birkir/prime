import { GraphQLID, GraphQLList, GraphQLNonNull } from 'graphql';
import { resolver } from 'graphql-sequelize';
import { WebhookCall } from '../../../models/WebhookCall';
import { WebhookCall as WebhookCallType } from '../types/WebhookCall';

export const allWebhookCalls = {
  type: new GraphQLList(WebhookCallType),
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: resolver(WebhookCall, {
    before(opts, args) {
      return {
        attributes: {
          exclude: ['request', 'response'],
        },
        where: {
          webhookId: args.id,
        },
        order: [['executedAt', 'DESC']],
        ...opts,
      };
    },
  }),
};
