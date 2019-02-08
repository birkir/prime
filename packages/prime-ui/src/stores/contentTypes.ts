import { when } from 'mobx';
import makeInspectable from 'mobx-devtools-mst';
import { flow, Instance, types } from 'mobx-state-tree';
import { client } from '../utils/client';
import { ContentType } from './models/ContentType';
import { CREATE_CONTENT_TYPE } from './mutations';
import { ALL_CONTENT_TYPES, CONTENT_TYPE_BY_ID } from './queries';

export const ContentTypes = types
  .model('ContentTypes', {
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
    const loadByName = flow(function*(name: string) {
      let item;
      const entries = Array.from(self.items.values());
      const entry = entries.find(n => n.name.toLocaleLowerCase() === name.toLocaleLowerCase());
      if (entry) {
        return entry;
      }

      const { data } = yield client.query({
        query: CONTENT_TYPE_BY_ID,
        variables: { name },
        fetchPolicy: 'network-only',
      });
      if (data.Schema) {
        item = ContentType.create(data.Schema);
        if (self.items.has(item.id)) {
          item = self.items.get(item.id);
          if (item) {
            item.replace(data.Schema);
          }
        } else {
          self.items.put(item);
        }
      }
      return item;
    });

    const loadById = flow(function*(id: string) {
      let item;
      const { data } = yield client.query({
        query: CONTENT_TYPE_BY_ID,
        variables: { id },
        fetchPolicy: 'network-only',
      });
      if (data.Schema) {
        item = ContentType.create(data.Schema);
        if (self.items.has(id)) {
          item = self.items.get(id);
          if (item) {
            item.replace(data.Schema);
          }
        } else {
          self.items.put(item);
        }
      }
      return item;
    });

    const loadAll = flow(function*() {
      if (self.loading) {
        yield new Promise(resolve => {
          when(() => self.loading === false, resolve);
        });
        return;
      }

      self.loading = true;

      try {
        const { data } = yield client.query({
          query: ALL_CONTENT_TYPES,
        });
        data.allSchemas.edges.forEach((contentType: any) => {
          const prevItem = self.items.get(contentType.id);
          if (prevItem) {
            prevItem.replace(contentType.node);
          } else {
            const item = ContentType.create(contentType.node);
            self.items.put(item);
          }
        });
        self.loaded = true;
      } catch (err) {
        self.error = true;
      }

      self.loading = false;
    });

    const create = flow(function*(input: any) {
      try {
        const { data } = yield client.mutate({
          mutation: CREATE_CONTENT_TYPE,
          variables: { input },
        });
        if (data.createSchema) {
          const item = ContentType.create(data.createSchema);
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
      loadByName,
      create,
      removeById,
    };
  })
  .create();

makeInspectable(ContentTypes);

export const ContentTypeRef = types.reference(ContentType, {
  get(identifier: string) {
    return ContentTypes.items.get(identifier);
  },
  set(value: Instance<typeof ContentType>) {
    return value.id;
  },
} as any);
