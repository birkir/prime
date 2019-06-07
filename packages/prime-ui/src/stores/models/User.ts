import { Ability } from '@casl/ability';
import { types } from 'mobx-state-tree';

const UserEmail = types.model('UserEmail', {
  address: types.string,
  verified: types.boolean,
});

const UserProfile = types.model('UserProfile', {
  firstname: types.maybeNull(types.string),
  lastname: types.maybeNull(types.string),
  displayName: types.maybeNull(types.string),
  avatarUrl: types.maybeNull(types.string),
});

export const UserMeta = types.model('UserMeta', {
  profile: types.optional(UserProfile, {}),
});

export const User = types
  .model('User', {
    id: types.identifier,
    emails: types.array(UserEmail),
    meta: UserMeta,
    abilities: types.frozen(),
  })
  .preProcessSnapshot(snapshot => ({
    ...snapshot,
    abilities: (snapshot && (snapshot as any).ability) || [],
    meta: (snapshot && snapshot.meta) || {},
  }))
  .views(self => ({
    get gravatarUrl() {
      const hash = (window as any).md5(self.emails[0]);
      return `https://www.gravatar.com/avatar/${hash}`;
    },
    get ability() {
      return new Ability(self.abilities);
    },
  }))
  .actions(self => ({
    updateMeta(meta: any) {
      self.meta = meta;
    },
    // updateLastPasswordChange() {
    //   self.lastPasswordChange = new Date();
    // },
    updateEmail(email: string) {
      self.emails[0].address = email;
    },
  }));
