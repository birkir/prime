import { types } from 'mobx-state-tree';

export const ContentRelease = types
  .model('ContentRelease', {
    id: types.identifier,
    name: types.maybeNull(types.string),
    documents: types.number,
    description: types.maybeNull(types.string),
    scheduledAt: types.maybeNull(types.Date),
    publishedAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
  })
  .preProcessSnapshot(snapshot => ({
    ...snapshot,
    documents: Number(snapshot.documents || 0),
    scheduledAt: snapshot.scheduledAt ? new Date(snapshot.scheduledAt) : null,
    publishedAt: snapshot.publishedAt ? new Date(snapshot.publishedAt) : null,
    updatedAt: snapshot.updatedAt ? new Date(snapshot.updatedAt) : null,
  }))
  .actions(self => ({
    update({ name, description, scheduledAt }: any) {
      self.name = name;
      self.description = description;
      self.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    },
    setIsPublished() {
      self.publishedAt = new Date();
    },
  }))
