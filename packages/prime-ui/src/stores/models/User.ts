import { types } from 'mobx-state-tree';

export const User = types
  .model('User', {
    id: types.identifier,
    email: types.string,
    firstname: types.maybeNull(types.string),
    lastname: types.maybeNull(types.string),
    displayName: types.maybeNull(types.string),
    avatarUrl: types.maybeNull(types.string),
    // lastPasswordChange: types.Date,
    // lastLogin: types.Date,
    // createdAt: types.Date,
    // updatedAt: types.Date,
  })
  .views(self => ({
    get gravatarUrl() {
      const hash = (window as any).md5(self.email);
      return `https://www.gravatar.com/avatar/${hash}`;
    },
  }))
  .actions(self => ({
    updateProfile({ firstname, lastname, displayName, avatarUrl }: any) {
      self.firstname = firstname;
      self.lastname = lastname;
      self.displayName = displayName;
      self.avatarUrl = avatarUrl;
    },
    // updateLastPasswordChange() {
    //   self.lastPasswordChange = new Date();
    // },
    updateEmail(email: string) {
      self.email = email;
    },
  }))
  .preProcessSnapshot(snapshot => ({
    ...snapshot,
    ...(snapshot &&
      {
        // lastPasswordChange: new Date(snapshot.lastPasswordChange),
        // lastLogin: new Date(snapshot.lastLogin),
        // createdAt: new Date(snapshot.createdAt),
        // updatedAt: new Date(snapshot.updatedAt),
      }),
  }));
