import { types } from 'mobx-state-tree';

export const Asset = types
  .model('Asset', {
    id: types.identifier,
    fileName: types.string,
    fileSize: types.integer,
    mimeType: types.string,
    url: types.string,
    createdAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
  })
  .preProcessSnapshot(snapshot => ({
    ...snapshot,
    createdAt: snapshot.createdAt ? new Date(snapshot.createdAt) : null,
    updatedAt: snapshot.updatedAt ? new Date(snapshot.updatedAt) : null,
  }));
