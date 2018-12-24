import { types, flow } from 'mobx-state-tree';
import { client } from '../utils/client';
import { ContentRelease } from './models/ContentRelease';
import { ALL_CONTENT_RELEASES } from './queries';

export const ContentReleases = types.model('ContentReleases', {
  items: types.map(types.late(() => ContentRelease)),
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
        query: ALL_CONTENT_RELEASES,
      });
      data.allContentReleases.forEach((contentRelease: any) => {
        const item = ContentRelease.create(contentRelease);
        self.items.put(item);
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
