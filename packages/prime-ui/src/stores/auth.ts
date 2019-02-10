import gql from 'graphql-tag';
import { flow, types } from 'mobx-state-tree';
import { accountsClient } from '../utils/accounts';
import { client } from '../utils/client';
import { fields } from '../utils/fields';
import { ContentTypes } from './contentTypes';
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
      await ContentTypes.loadAll();
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
      const { data } = yield client.query({
        query: GET_USER,
      });
      if (data && data.getUser) {
        self.isLoggedIn = true;
        self.user = data.getUser;
        console.log(self.user);
        yield ensureFields();
      }
      if (!self.isLoggedIn) {
        const onboarding = yield client.query({
          query: gql`
            query {
              isOnboarding
            }
          `,
        });
        if (onboarding.data && onboarding.data.isOnboarding === true) {
          self.isSetup = true;
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
      const { data } = yield client.mutate({
        mutation: gql`
          mutation onboard($email: String!, $password: String!, $profile: JSON!) {
            onboard(email: $email, password: $password, profile: $profile)
          }
        `,
        variables: {
          email,
          password,
          profile: {
            firstname,
            lastname,
          },
        },
      });

      if (data && data.onboard) {
        yield login(email, password);
        yield checkLogin();
        self.isSetup = false;
        return true;
      }

      return false;
    });

    return {
      login,
      logout,
      register,
      checkLogin,
    };
  })
  .create();
