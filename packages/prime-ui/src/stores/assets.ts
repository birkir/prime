import { destroy, flow, types } from 'mobx-state-tree';
import { client } from '../utils/client';
import { Asset } from './models/Asset';
import { CREATE_ASSET, REMOVE_ASSET } from './mutations';
import { ALL_ASSETS } from './queries';

export const Assets = types
  .model('Assets', {
    items: types.map(types.late(() => Asset)),
    loading: false,
    loaded: false,
    error: false,
  })
  .views(self => ({
    get list() {
      return Array.from(self.items.values());
    },
  }))
  .actions(self => {
    const loadAll = flow(function*(clear = true) {
      self.loading = true;

      if (clear) {
        self.items.clear();
      }

      try {
        const { data } = yield client.query({
          query: ALL_ASSETS,
        });
        data.allAssets.edges.forEach((asset: any) => {
          const item = Asset.create(asset.node);
          self.items.put(item);
        });
        self.loaded = true;
      } catch (err) {
        self.error = true;
      }

      self.loading = false;
    });

    const create = flow(function*(input: { upload: File }) {
      const { data } = yield client.mutate({
        mutation: CREATE_ASSET,
        variables: {
          input,
        },
      });
      if (data) {
        const item = Asset.create(data.createAsset);
        self.items.put(item);
        return item;
      }
    });

    const remove = flow(function*(asset: any) {
      const { data } = yield client.mutate({
        mutation: REMOVE_ASSET,
        variables: { id: asset.id },
      });
      if (data) {
        destroy(asset);
      }
    });

    return {
      loadAll,
      create,
      remove,
    };
  })
  .create();
