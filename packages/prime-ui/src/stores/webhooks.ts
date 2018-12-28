import { types, flow, destroy } from 'mobx-state-tree';
import { client } from '../utils/client';
import { Webhook } from './models/Webhook';
import { ALL_WEBHOOKS } from './queries';
import { CREATE_WEBHOOK, REMOVE_WEBHOOK } from './mutations';

export const Webhooks = types.model('Webhooks', {
  items: types.map(types.late(() => Webhook)),
  loading: false,
  loaded: false,
  error: false,
})
.views(self => ({
  get list() {
    const entries = Array.from(self.items.values());
    entries.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return entries;
  }
}))
.actions((self) => {

  const loadAll = flow(function*(clear = true){
    self.loading = true;

    if (clear) {
      self.items.clear();
    }

    try {
      const { data } = yield client.query({
        query: ALL_WEBHOOKS,
      });
      data.allWebhooks.forEach((webhook: any) => {
        const item = Webhook.create(webhook);
        self.items.put(item);
      });
      self.loaded = true;
    } catch (err) {
      self.error = true;
    }

    self.loading = false;
  });

  const create = flow(function*(input: any) {
    const { data } = yield client.mutate({
      mutation: CREATE_WEBHOOK,
      variables: {
        input
      },
    });
    if (data) {
      const item = Webhook.create(data.createWebhook);
      self.items.put(item);
      return item;
    }
  });

  const remove = flow(function*(webhook: any) {
    const { data } = yield client.mutate({
      mutation: REMOVE_WEBHOOK,
      variables: { id: webhook.id },
    });
    if (data) {
      destroy(webhook);
    }
  });

  return {
    loadAll,
    create,
    remove,
  };
})
.create();
