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

export const User = types
  .model('User', {
    id: types.identifier,
    emails: types.array(UserEmail),
    profile: types.optional(UserProfile, {}),
    abilities: types.frozen(),
  })
  .preProcessSnapshot(snapshot => ({
    ...snapshot,
    abilities: (snapshot && (snapshot as any).ability) || [],
    profile: (snapshot && snapshot.profile) || {},
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
    updateProfile(profile: any) {
      self.profile = profile;
    },
    // updateLastPasswordChange() {
    //   self.lastPasswordChange = new Date();
    // },
    updateEmail(email: string) {
      self.emails[0].address = email;
    },
  }));
