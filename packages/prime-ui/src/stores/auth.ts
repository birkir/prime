import { types, flow } from 'mobx-state-tree';
import { User } from './models/User';
import { client } from '../utils/client';
import { ALL_FIELDS } from './queries';
import { fields } from '../utils/fields';

export const Auth = types
  .model('Auth', {
    user: types.maybeNull(User),
    isLoggedIn: false,
  })
  .actions(self => {

    const ensureFields = async () => {
      if (!self.isLoggedIn) return;
      const { data }: any = await client.query({ query: ALL_FIELDS });
      if (data.allFields) {
        data.allFields.forEach((field: any) => {
          if (field.ui && !fields[field.id]) {
            const script = document.createElement('script');
            script.src = `http://localhost:4000/fields/${field.id}/index.js`;
            script.id = `Prime_Field_${field.id}`;
            document.body.appendChild(script);
          }
        });
      }
    };

    const login = flow(function*(email: string, password: string) {
      const res: any = yield fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }).then(res => res.json());

      self.isLoggedIn = Boolean(res.user);
      self.user = res.user;

      yield ensureFields();

      return res;
    });

    const logout = flow(function*() {
      yield fetch('http://localhost:4000/auth/logout', {
        credentials: 'include',
      });
      self.isLoggedIn = false;
      self.user = null;
    });

    const checkLogin = flow(function*() {

      const res: any = yield fetch('http://localhost:4000/auth/user', {
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
      }).then(res => res.json());

      self.isLoggedIn = Boolean(res.user);
      self.user = res.user;

      yield ensureFields();
    });

    return {
      login,
      logout,
      checkLogin,
    };
  })
  .create();
