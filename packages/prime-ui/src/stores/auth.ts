import { flow, types } from 'mobx-state-tree';
import { accountsClient, accountsGraphQL } from '../utils/accounts';
import { fields } from '../utils/fields';
import { User } from './models/User';
import { Settings } from './settings';

export const Auth = types
  .model('Auth', {
    user: types.maybeNull(User),
    accessToken: types.maybeNull(types.string),
    refreshToken: types.maybeNull(types.string),
    isSetup: types.optional(types.maybeNull(types.boolean), null),
    isLoggedIn: false,
  })
  .actions(self => {
    const ensureFields = async () => {
      if (!self.isLoggedIn) {
        return;
      }
      await Settings.read();
      Settings.fields.forEach((field: any) => {
        if (field.ui && !fields[field.id]) {
          const script = document.createElement('script');
          script.src = `${Settings.coreUrl}/fields/${field.id}/index.js`;
          script.id = `Prime_Field_${field.id}`;
          document.body.appendChild(script);
        }
      });
    };

    const login = flow(function*(email: string, password: string) {
      const result = yield accountsGraphQL.loginWithService('password', {
        email,
        password,
      });

      console.log(result);

      // self.isLoggedIn = Boolean(res.user);
      // self.user = res.user;

      yield ensureFields();

      // return res;
    });

    const logout = flow(function*() {
      yield accountsGraphQL.logout();
      self.isLoggedIn = false;
      self.user = null;
    });

    const checkLogin = flow(function*() {
      const tokens = yield accountsClient.getTokens();
      if (tokens) {
        self.accessToken = tokens.accessToken;
        self.refreshToken = tokens.refreshToken;
        self.isLoggedIn = true;
        yield accountsClient.refreshSession();
        const user = yield accountsGraphQL.getUser();
      }
      yield ensureFields();
    });

    const register = flow(function*({
      firstname = '',
      lastname = '',
      email,
      password,
    }: {
      firstname?: string;
      lastname?: string;
      email: string;
      password: string;
    }) {
      const res: any = yield fetch(`${Settings.coreUrl}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ firstname, lastname, email, password }),
      }).then(r => r.json());

      self.isSetup = false;
      self.isLoggedIn = Boolean(res.user);
      self.user = res.user;

      yield ensureFields();

      return res;
    });

    return {
      login,
      logout,
      register,
      checkLogin,
    };
  })
  .create();
