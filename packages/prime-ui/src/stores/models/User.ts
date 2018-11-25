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

// lastLogin: null
// password: "$2b$10$jRFXgwMSMNggCdFTH71KfOYX4vzr51CwyZc2Pe4leLpkcZofRozXS"
// refreshToken: "0d3870a4-c8b1-4b06-bce8-6438655d380f"
