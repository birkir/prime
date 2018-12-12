import gql from 'graphql-tag';
import { types, flow } from 'mobx-state-tree';
import { client } from '../utils/client';
import { ContentType } from './models/ContentType';
import { CONTENT_TYPE_BY_ID, ALL_CONTENT_TYPES } from './queries';

export const ContentTypes = types.model('ContentTypes', {
  items: types.map(types.late(() => ContentType)),
  loading: false,
  loaded: false,
  error: false,
})
.views(self => ({
  get list() {
    const entries = Array.from(self.items.values());
    entries.sort((a, b) => a.title.localeCompare(b.title));
    return entries;
  },
}))
.actions(self => {

  const loadById = flow(function* loadById(id: string){
    let item = self.items.get(id);
    if (!item) {
      const { data } = yield client.query({
        query: CONTENT_TYPE_BY_ID,
        variables: { id },
        fetchPolicy: 'network-only',
      });
      if (data.ContentType) {
        item = ContentType.create(data.ContentType);
        self.items.put(item);
      }
    }
    return item;
  });

  const loadAll = flow(function*(clear = true){
    self.loading = true;

    if (clear) {
      self.items.clear();
    }

    try {
      const { data } = yield client.query({ query: ALL_CONTENT_TYPES });
      data.allContentTypes.forEach((contentType: any) => {
        const item = ContentType.create(contentType);
        self.items.put(item);
      });
      self.loaded = true;
    } catch (err) {
      self.error = true;
    }

    self.loading = false;
  });

  const create = flow(function*(input: { title: string; name?: string; isSlice?: boolean; }) {
    const mutation = gql`
      mutation CreateContentType($input:CreateContentTypeInput) {
        createContentType(input:$input) {
          id
          name
          title
          isSlice
        }
      }
    `;
    try {
      const { data } = yield client.mutate({ mutation, variables: { input }});
      if (data.createContentType) {
        const item = ContentType.create(data.createContentType);
        return self.items.put(item);
      }
    } catch (err) {
      throw new Error(err);
    }
  });

  const removeById = (id: string) => {
    self.items.delete(id);
  };

  return {
    loadAll,
    loadById,
    create,
    removeById,
  };
})
.create();
