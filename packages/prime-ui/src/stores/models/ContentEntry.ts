import { flow, Instance, types } from 'mobx-state-tree';
import { JSONObject } from '../../interfaces/JSONObject';
import { client } from '../../utils/client';
import { ContentTypeRef } from '../contentTypes';
import {
  PUBLISH_CONTENT_ENTRY,
  REMOVE_CONTENT_ENTRY,
  UNPUBLISH_CONTENT_ENTRY,
  UPDATE_CONTENT_ENTRY,
} from '../mutations';
import { ContentType } from './ContentType';
import { Version } from './Version';

export const ContentEntry = types
  .model('ContentEntry', {
    _id: types.identifier,
    id: types.string,
    documentId: types.string,
    schemaId: types.string,
    releaseId: types.maybeNull(types.string),
    locale: types.string,
    primary: types.maybeNull(types.string),
    publishedAt: types.maybeNull(types.Date),
    schema: types.maybeNull(ContentTypeRef),
    data: types.frozen<JSONObject>(),
    createdAt: types.Date,
    updatedAt: types.Date,
    versions: types.array(Version),
    loadedAt: types.Date,
    hasChanged: false,
  })
  .preProcessSnapshot(snapshot => {
    return {
      ...snapshot,
      _id: snapshot._id
        ? snapshot._id
        : [snapshot.documentId, snapshot.locale, snapshot.releaseId].join(':'),
      loadedAt: new Date(),
      schema: snapshot.schemaId ? snapshot.schemaId : null,
      publishedAt: snapshot.publishedAt ? new Date(snapshot.publishedAt) : null,
      createdAt: new Date(snapshot.createdAt),
      updatedAt: new Date(snapshot.updatedAt),
    };
  })
  .views(self => ({
    get display() {
      if (!self.data) {
        return self.documentId;
      }
      return self.data.title || self.data.name || Object.values(self.data).shift();
    },
    get hasBeenPublished() {
      return self.versions.findIndex(v => v.publishedAt !== null) >= 0;
    },
  }))
  .actions(self => {
    const setHasChanged = (hasChanged: boolean) => {
      self.hasChanged = hasChanged;
    };

    const setContentType = (contentType: Instance<typeof ContentType>) => {
      self.schema = contentType;
    };

    const setIsPublished = (isPublished: Date | null) => {
      self.publishedAt = isPublished;
    };

    const updateSelf = (data: any) => {
      if (self.id !== data.id) {
        self.versions.splice(0, 0, {
          id: data.id,
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        });
      } else if (self.versions.length > 0) {
        (self.versions[0].publishedAt = data.publishedAt ? new Date(data.publishedAt) : null),
          (self.versions[0].updatedAt = new Date(data.updatedAt));
      }
      self.id = data.id;
      self.schemaId = data.schemaId;
      self.releaseId = data.releaseId;
      self.data = data.data;
      self.locale = data.locale;
      self.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
      self.createdAt = new Date(data.createdAt);
      self.updatedAt = new Date(data.updatedAt);
    };

    const update = flow(function*({
      data,
      releaseId,
      locale,
    }: {
      data: any;
      releaseId?: string;
      locale?: string;
    }) {
      const res = yield client.mutate({
        mutation: UPDATE_CONTENT_ENTRY,
        variables: {
          id: self.id,
          data,
          ...(releaseId && { releaseId }),
          ...(locale && { locale }),
        },
      });
      if (res.data && res.data.updateDocument) {
        updateSelf(res.data.updateDocument);
      }
    });

    const publish = flow(function*() {
      const { data } = yield client.mutate({
        mutation: PUBLISH_CONTENT_ENTRY,
        variables: {
          id: self.id,
        },
      });
      if (data && data.publishDocument) {
        updateSelf(data.publishDocument);
      }
    });

    const unpublish = flow(function*() {
      const { data } = yield client.mutate({
        mutation: UNPUBLISH_CONTENT_ENTRY,
        variables: {
          id: self.id,
        },
      });
      if (data && data.unpublishDocument) {
        updateSelf(data.unpublishDocument);
      }
    });

    const remove = flow(function*(force = false) {
      return yield client.mutate({
        mutation: REMOVE_CONTENT_ENTRY,
        variables: {
          id: self.documentId,
          locale: force ? undefined : self.locale,
          releaseId: force ? undefined : self.releaseId,
        },
      });
    });

    return {
      setContentType,
      setHasChanged,
      setIsPublished,
      remove,
      update,
      publish,
      unpublish,
    };
  });
