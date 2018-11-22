import gql from 'graphql-tag';
import { types, flow, getParent, Instance } from 'mobx-state-tree';
import { client } from '../utils/client';
import { ContentType } from './models/ContentType';
import { CONTENT_TYPE_BY_ID, ALL_CONTENT_TYPES } from './queries';

export const ContentTypes = types.model('ContentTypes', {
  items: types.map(ContentType),
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
    const { data } = yield client.query({
      query: CONTENT_TYPE_BY_ID,
      variables: { id },
      fetchPolicy: 'network-only',
    });
    if (data.ContentType) {
      self.items.put(data.ContentType);
      return self.items.get(data.ContentType.id);
    }
  });

  const loadAll = flow(function*(){
    self.loading = true;
    try {
      const { data } = yield client.query({ query: ALL_CONTENT_TYPES });
      data.allContentTypes.forEach((contentType: any) => {
        self.items.put(contentType);
      });
      self.loaded = true;
    } catch (err) {
      self.error = true;
    }

    self.loading = false;
  });

  const create = flow(function*(input: { title: string; name?: string; }) {
    const mutation = gql`
      mutation CreateContentType($input:CreateContentTypeInput) {
        createContentType(input:$input) {
          id
          name
          title
        }
      }
    `;
    try {
      const { data } = yield client.mutate({ mutation, variables: { input }});
      if (data.createContentType) {
        return self.items.put(data.createContentType);
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
