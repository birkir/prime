import { flow, types } from 'mobx-state-tree';
import { client } from '../utils/client';
import { User } from './models/User';
import { ALL_USERS } from './queries';

export const Users = types
  .model('Users', {
    items: types.map(User),
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
        const { data } = yield client.query({ query: ALL_USERS });
        data.allUsers.forEach((user: any) => {
          self.items.put(user);
        });
        self.loaded = true;
      } catch (err) {
        self.error = true;
      }

      self.loading = false;
    });

    return {
      loadAll,
    };
  })
  .create();
