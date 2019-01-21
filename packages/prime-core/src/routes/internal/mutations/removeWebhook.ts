import { GraphQLBoolean, GraphQLID, GraphQLNonNull } from 'graphql';
import { Webhook } from '../../../models/Webhook';

export const removeWebhook = {
  type: GraphQLBoolean,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  async resolve(root, args, context, info) {
    await context.ensureAllowed('settings', 'update');
    const success = await Webhook.destroy({ where: { id: args.id } });
    return Boolean(success);
  },
};
