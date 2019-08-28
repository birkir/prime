import fetch from 'isomorphic-fetch';
import { getRepository } from 'typeorm';
import { Webhook } from '../entities/Webhook';
import { WebhookCall } from '../entities/WebhookCall';

const successCodes = [200, 201, 202, 203, 204];

export const processWebhooks = async (action, body) => {
  const webhookRepository = getRepository(Webhook);
  const webhookCallRepository = getRepository(WebhookCall);

  const webhooks = await webhookRepository.find();

  await Promise.all(
    webhooks
      .filter(webhook => {
        if (webhook.options && Array.isArray(webhook.options.actions)) {
          return webhook.options.actions.includes(action);
        }
        return true;
      })
      .map(async webhook => {
        const request: any = {
          headers: {
            'x-prime-action': action,
            'x-prime-webhook-name': webhook.name,
            'content-type': 'application/json',
            'user-agent': 'prime',
          },
          method: webhook.method,
          url: webhook.url,
          body,
        };

        let response;

        try {
          response = await fetch(request.url, {
            headers: request.headers,
            method: request.method,
            body: JSON.stringify(request.body),
          });
        } catch (err) {
          response = {
            headers: [],
            status: -1,
            statusText: err.message,
            text: async () => '',
          };
        }

        const headers = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });

        await webhookCallRepository.create({
          webhookId: webhook.id,
          success: successCodes.indexOf(response.status) >= 0,
          status: response.status,
          executedAt: new Date(),
          request,
          response: {
            headers,
            body: await response.text(),
            redirected: response.redirected,
            url: response.url,
            type: response.type,
            status: response.status,
            statusText: response.statusText,
          },
        });
      })
  );
};
