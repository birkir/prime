import { types } from 'mobx-state-tree';

export const Version = types
  .model('Version', {
    versionId: types.string,
    isPublished: types.boolean,
    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .preProcessSnapshot(snapshot => ({
    ...snapshot,
    isPublished: Boolean(snapshot.isPublished),
    createdAt: new Date(snapshot.createdAt),
    updatedAt: new Date(snapshot.updatedAt),
  }));
