import { GraphQLID, GraphQLNonNull } from 'graphql';
import { resolver } from 'graphql-sequelize';
import { WebhookCall } from '../../../models/WebhookCall';
import { WebhookCall as WebhookCallType } from '../types/WebhookCall';

export const oneWebhookCall = {
  type: WebhookCallType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: resolver(WebhookCall, {
    before(opts, args, context, info) {
      const { id } = args;
      return { where: { id }, ...opts };
    },
  }),
};
