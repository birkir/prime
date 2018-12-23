import { types } from 'mobx-state-tree';

export const ContentRelease = types
  .model('ContentRelease', {
    id: types.identifier,
    name: types.maybeNull(types.string),
    description: types.maybeNull(types.string),
    scheduledAt: types.maybeNull(types.Date),
    publishedAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
  })
  .preProcessSnapshot(snapshot => ({
    ...snapshot,
    scheduledAt: snapshot.scheduledAt ? new Date(snapshot.scheduledAt) : null,
    publishedAt: snapshot.publishedAt ? new Date(snapshot.publishedAt) : null,
    updatedAt: snapshot.updatedAt ? new Date(snapshot.updatedAt) : null,
  }));
