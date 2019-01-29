import { Webhook } from '../../../models/Webhook';
import { Webhook as WebhookType } from '../types/Webhook';
import { WebhookInput } from '../types/WebhookInput';

export const createWebhook = {
  type: WebhookType,
  args: {
    input: {
      type: WebhookInput,
    },
  },
  async resolve(root, args, context, info) {
    await context.ensureAllowed('settings', 'update');
    const webhook = await Webhook.create({
      name: args.input.name,
      url: args.input.url,
      method: args.input.method,
      userId: context.user.id,
    });
    return webhook;
  },
};
