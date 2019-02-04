import { types } from 'mobx-state-tree';

export const Version = types
  .model('Version', {
    id: types.string,
    publishedAt: types.maybeNull(types.Date),
    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .preProcessSnapshot(snapshot => ({
    ...snapshot,
    publishedAt: snapshot.publishedAt ? new Date(snapshot.publishedAt) : null,
    createdAt: new Date(snapshot.createdAt),
    updatedAt: new Date(snapshot.updatedAt),
  }));
