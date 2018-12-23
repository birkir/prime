import { types } from 'mobx-state-tree';
import { ContentRelease } from './models/ContentRelease';

export const ContentReleases = types.model('ContentReleases', {
  items: types.map(types.late(() => ContentRelease)),
  loading: false,
  loaded: false,
  error: false,
})
.actions((self) => {

  return {};
})
.create();
