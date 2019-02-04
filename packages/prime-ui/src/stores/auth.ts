import { flow, types } from 'mobx-state-tree';
import { accountsClient, client } from '../utils/accounts';
import { fields } from '../utils/fields';
import { User } from './models/User';
import { GET_USER } from './queries';
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
          script.src = `${Settings.coreUrl}/prime/field/${field.type}/index.js`;
          script.id = `Prime_Field_${field.type}`;
          document.body.appendChild(script);
        }
      });
    };

    const login = flow(function*(email: string, password: string) {
      yield accountsClient.loginWithService('password', {
        user: {
          email,
        },
        password,
      });
      yield checkLogin();

      yield ensureFields();
    });

    const logout = flow(function*() {
      yield accountsClient.logout();
      self.isLoggedIn = false;
      self.user = null;
    });

    const checkLogin = flow(function*() {
      const tokens = yield accountsClient.getTokens();
      if (tokens) {
        const { data } = yield client.query({
          query: GET_USER,
        });
        if (data && data.getUser) {
          self.accessToken = tokens.accessToken;
          self.refreshToken = tokens.refreshToken;
          self.isLoggedIn = true;
          self.user = data.getUser;
          yield ensureFields();
        }
      }
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
