import { types, flow } from 'mobx-state-tree';
import { WebhookCall } from './WebhookCall';
import { client } from '../../utils/client';
import { UPDATE_WEBHOOK } from '../mutations';

const WebhookMethod = types.enumeration('WebhookMethod', ['POST', 'GET', 'PUT', 'PATCH', 'DELETE']);

export const Webhook = types
  .model('Webhook', {
    id: types.identifier,
    name: types.maybeNull(types.string),
    url: types.maybeNull(types.string),
    method: types.maybeNull(WebhookMethod),
    calls: types.maybeNull(types.array(WebhookCall)),
    count: types.number,
    success: types.number,
    createdAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
  })
  .preProcessSnapshot(snapshot => ({
    ...snapshot,
    count: Number(snapshot.count || 0),
    success: Number(snapshot.success || 0),
    createdAt: snapshot.createdAt ? new Date(snapshot.createdAt) : null,
    updatedAt: snapshot.updatedAt ? new Date(snapshot.updatedAt) : null,
  }))
  .actions(self => {
    const update = flow(function*(input: any) {
      const { data } = yield client.mutate({
        mutation: UPDATE_WEBHOOK,
        variables: { id: self.id, input },
      });
      if (data && data.updateWebhook) {
        self.name = data.updateWebhook.name;
        self.url = data.updateWebhook.url;
        self.method = data.updateWebhook.method;
      }
    });

    return {
      update,
    };
  });
