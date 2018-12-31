import { types, flow, destroy } from 'mobx-state-tree';
import { ContentEntry } from './models/ContentEntry';
import { client } from '../utils/client';
import { CONTENT_ENTRY_BY_ID, CONTENT_ENTRIES_BY_CONTENT_TYPE } from './queries';
import { CREATE_CONTENT_ENTRY } from './mutations';

export const ContentEntries = types.model('ContentEntries', {
  items: types.map(types.late(() => ContentEntry)),
  loading: false,
  loaded: false,
  error: false,
})
.actions(self => {

  const loadByContentType = flow(function* loadByContentType(contentTypeId: string) {
    const { data } = yield client.query({
      query: CONTENT_ENTRIES_BY_CONTENT_TYPE,
      variables: {
        contentTypeId,
      },
    });
    return data.allContentEntries.edges.map(({ node }: any) => ContentEntry.create(node));
  });

  const loadById = flow(function* loadById(entryId: string, locale: string, release?: string) {
    self.loading = true;
    const id = [entryId, locale, release].join(':');

    let item = self.items.get(id);
    if (item && item.loadedAt > new Date(Date.now() - 5000)) {
      return item;
    }

    const { data } = yield client.query({
      query: CONTENT_ENTRY_BY_ID,
      variables: {
        entryId,
        contentReleaseId: release,
        language: locale,
      },
    });
    self.loading = false;
    self.loaded = true;
    if (data.ContentEntry) {
      item = ContentEntry.create({ id, ...data.ContentEntry });
      self.items.put(item);
    }
    return item;
  });

  const create = flow(function*(
    contentTypeId: string,
    proposedData: any,
    language: string,
    contentReleaseId: string | undefined | null,
    entryId?: string
  ) {
    const { data } = yield client.mutate({
      mutation: CREATE_CONTENT_ENTRY,
      variables: {
        language,
        contentTypeId,
        contentReleaseId,
        data: proposedData,
        entryId,
      },
    });
    if (data) {
      const entry = data.createContentEntry;
      const id = [entry.entryId, entry.language, entry.contentReleaseId].join(':');
      const item = ContentEntry.create({
        ...entry,
        id,
        versions: [{
          ...entry,
        }]
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
