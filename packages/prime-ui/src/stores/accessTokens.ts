import { types } from 'mobx-state-tree';

export const AccessToken = types.model('AccessToken', {
  name: types.string,
});
