import { types } from 'mobx-state-tree';

export const User = types
  .model('User', {
    id: types.identifier,
    email: types.string,
    firstname: types.maybeNull(types.string),
    lastname: types.maybeNull(types.string),
    createdAt: types.string,
    updatedAt: types.string,
  });
