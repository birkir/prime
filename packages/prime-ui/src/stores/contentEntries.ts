import { destroy, flow, types } from 'mobx-state-tree';
import { client } from '../utils/client';
import { ContentEntry } from './models/ContentEntry';
import { CREATE_CONTENT_ENTRY } from './mutations';
import { CONTENT_ENTRIES_BY_CONTENT_TYPE, CONTENT_ENTRY_BY_ID } from './queries';

export const ContentEntries = types
  .model('ContentEntries', {
    items: types.map(types.late(() => ContentEntry)),
    loading: false,
    loaded: false,
    error: false,
  })
  .actions(self => {
    const loadByContentType = flow(function*(contentTypeId: string) {
      const { data } = yield client.query({
        query: CONTENT_ENTRIES_BY_CONTENT_TYPE,
        variables: {
          contentTypeId,
        },
      });
      return data.allDocuments.edges.map(({ node }: any) => ContentEntry.create({ ...node }));
    });

    const loadById = flow(function*(entryId: string, locale: string, release?: string) {
      self.loading = true;
      const id = [entryId, locale, release].join(':');

      let item = self.items.get(id);
      if (item && item.loadedAt > new Date(Date.now() - 5000)) {
        return item;
      }

      const { data } = yield client.query({
        query: CONTENT_ENTRY_BY_ID,
        variables: {
          id: entryId,
          releaseId: release,
          locale,
        },
      });
      self.loading = false;
      self.loaded = true;
      if (data.Document) {
        item = ContentEntry.create(data.Document);
        self.items.put(item);
      }
      return item;
    });

    const create = flow(function*({
      schemaId,
      data,
      locale,
      releaseId,
      documentId,
    }: {
      schemaId: string;
      data: any;
      locale: string;
      releaseId?: string;
      documentId?: string;
    }) {
      const res = yield client.mutate({
        mutation: CREATE_CONTENT_ENTRY,
        variables: {
          input: {
            locale,
            schemaId,
            releaseId,
            data,
            documentId,
          },
        },
      });
      if (res.data) {
        const entry = res.data.createDocument;
        const item = ContentEntry.create({
          ...entry,
          versions: [
            {
              ...entry,
            },
          ],
        });
        self.items.put(item);
        return item;
      }
      return null;
    });

    return {
      loadByContentType,
      loadById,
      create,
    };
  })
  .create();
