import { types, flow, destroy } from 'mobx-state-tree';
import gql from 'graphql-tag';
import { client } from '../utils/client';
import { get } from 'lodash';
import { toJS } from 'mobx';

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

const Preview = types.model('Preview', {
  name: types.string,
  hostname: types.string,
  pathname: types.optional(types.string, ''),
})
.actions(self => ({
  update({ name, hostname, pathname }: any) {
    self.name = name;
    self.hostname = hostname;
    self.pathname = String(pathname || '');
  }
}));

const Locale = types.model('Locale', {
  id: types.string,
  name: types.string,
  flag: types.string,
  master: types.optional(types.boolean, false),
})
.actions(self => ({
  update({ id, name, flag }: any) {
    self.id = id;
    self.name = name;
    self.flag = flag;
  },
  setMaster(master: boolean) {
    self.master = master;
  },
}));

export const Settings = types.model('Settings', {
  isProd,
  coreUrl,
  env: types.frozen(),
  fields: types.frozen(),
  accessType: types.enumeration('AccessType', ['public', 'private']),
  previews: types.array(Preview),
  locales: types.array(Locale),
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

  const setAccessType = (accessType: any) => {
    self.accessType = accessType;
  };

  const setMasterLocale = (node: any) => {
    self.locales.forEach(locale => locale.setMaster(false));
    node.setMaster(true);
  }

  const save = flow(function*() {
    yield client.mutate({
      mutation: gql`
        mutation setSettings($input: SettingsInput) {
          setSettings(input: $input)
        }
      `,
      variables: {
        input: {
          accessType: self.accessType,
          previews: self.previews.map(({ name, hostname, pathname }) => ({ name, hostname, pathname })),
          locales: self.locales.map(({ id, name, flag, master }) => ({ id, name, flag, master })),
        },
      },
    });
    yield read();
  });

  const removePreview = (node: any) => {
    destroy(node);
  };

  const addPreview = (values: any) => {
    self.previews.push(Preview.create(values));
  }

  const removeLocale = (node: any) => {
    destroy(node);
  }

  const addLocale = (values: any) => {
    self.locales.push(Locale.create(values));
  }

  return {
    read,
    save,
    setAccessType,
    setMasterLocale,
    addPreview,
    addLocale,
    removePreview,
    removeLocale,
  };
})
.create({
  accessType: 'public',
  previews: [],
  locales: [],
  fields,
  env,
});
