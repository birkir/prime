import { types, flow } from 'mobx-state-tree';
import gql from 'graphql-tag';
import { client } from '../utils/client';
import { get } from 'lodash';

const isProd = process.env.NODE_ENV === 'production';

let config = get(window, 'prime.config', '');
let coreUrl = isProd ? '/' : 'http://localhost:4000';
let fields: any = [];
let env: any = {};

try {
  config = JSON.parse(config);
  coreUrl = config.coreUrl || coreUrl;
  env = config.env || env;
} catch (err) {
  if (isProd) console.error('Could not parse prime config', err);
}

export const Settings = types.model('Settings', {
  isProd,
  coreUrl,
  env: types.frozen(),
  fields: types.frozen(),

  accessType: types.enumeration('AccessType', ['public', 'private']),
  previews: types.array(types.model('Preview', {
    name: types.string,
    hostname: types.string,
    pathname: types.string,
  })),
  locales: types.array(types.model('Locale', {
    id: types.string,
    name: types.string,
    flag: types.string,
    master: types.boolean,
  })),
})
.actions(self => {
  const read = flow(function*() {
    const { data } = yield client.query({
      query: gql`
        query {
          getSettings
          allFields {
            id
            title
            description
            defaultOptions
            ui
          }
        }
      `,
    });
    if (data.getSettings) {
      self.accessType = data.getSettings.accessType;
      self.previews = data.getSettings.previews;
      self.locales = data.getSettings.locales;
      self.env = data.getSettings.env;
    }
    if (data.allFields) {
      self.fields = data.allFields;
    }
  });

  return {
    read,
  };
})
.create({
  accessType: 'public',
  previews: [],
  locales: [],
  fields,
  env,
});
