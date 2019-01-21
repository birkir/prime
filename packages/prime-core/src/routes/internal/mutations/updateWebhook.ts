import { GraphQLID, GraphQLNonNull } from 'graphql';
import { Webhook } from '../../../models/Webhook';
import { Webhook as WebhookType } from '../types/Webhook';
import { WebhookInput } from '../types/WebhookInput';

export const updateWebhook = {
  type: WebhookType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    input: {
      type: WebhookInput,
    },
  },
  async resolve(root, args, context, info) {
    await context.ensureAllowed('settings', 'update');
    const webhook = await Webhook.findOne({ where: { id: args.id } });
    if (webhook) {
      await webhook.update({
        name: args.input.name,
        url: args.input.url,
        method: args.input.method,
      });
    }
    return webhook;
  },
};
