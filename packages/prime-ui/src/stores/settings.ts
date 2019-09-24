import gql from 'graphql-tag';
import { get } from 'lodash';
import { toJS } from 'mobx';
import { destroy, flow, types } from 'mobx-state-tree';
import { client } from '../utils/client';

const isProd = process.env.NODE_ENV === 'production';

let config = get(window, 'prime.config', '');
let coreUrl = isProd ? '/' : 'http://localhost:4000';
let corePath = '';
const fields: any = [];
let env: any = {};

try {
  config = JSON.parse(config);
  coreUrl = config.coreUrl || coreUrl;
  corePath = config.path || '';
  env = config.env || env;
} catch (err) {
  if (isProd) {
    console.error('Could not parse prime config', err); // tslint:disable-line no-console
  }
}

const Preview = types
  .model('Preview', {
    name: types.string,
    hostname: types.string,
    pathname: types.optional(types.string, ''),
  })
  .actions(self => ({
    update({ name, hostname, pathname }: any) {
      self.name = name;
      self.hostname = hostname;
      self.pathname = String(pathname || '');
    },
  }));

const Locale = types
  .model('Locale', {
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

export const defaultLocale = Locale.create({ id: 'en', name: 'English', flag: 'en', master: true });

const PackageVersion = types.model('PackageVersion', {
  name: types.string,
  currentVersion: types.maybeNull(types.string),
  latestVersion: types.maybeNull(types.string),
});

export const Settings = types
  .model('Settings', {
    isProd,
    coreUrl,
    path: corePath,
    packages: types.array(PackageVersion),
    shouldReloadPlayground: false,
    env: types.frozen(),
    fields: types.frozen(),
    accessType: types.maybeNull(types.enumeration('AccessType', ['PUBLIC', 'PRIVATE'])),
    previews: types.array(Preview),
    locales: types.array(Locale),
  })
  .views(self => ({
    get masterLocale() {
      return self.locales.find(({ master }) => master) || defaultLocale;
    },
  }))
  .actions(self => {
    const read = flow(function*(): Generator<Promise<any>, void, any> {
      const { data } = yield client.query({
        query: gql`
          query {
            getSettings {
              accessType
              previews {
                name
                hostname
                pathname
              }
              locales {
                id
                name
                flag
                master
              }
              env
            }
            allFields {
              type
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

    const readVersion = flow(function*(): Generator<Promise<any>, void, any> {
      const { data } = yield client.query({
        query: gql`
          query {
            system {
              name
              currentVersion
              latestVersion
            }
          }
        `,
      });
      if (data) {
        self.packages.replace(data.system);
      }
    });

    const reloadPlayground = () => {
      self.shouldReloadPlayground = true;
    };

    const reloadPlaygroundAction = () => {
      if (!self.shouldReloadPlayground) {
        return false;
      }
      const node = document.getElementById('playground');
      if (node) {
        const iframe = node as HTMLIFrameElement;
        try {
          const doc =
            iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
          if (doc) {
            const reloadButton = doc.querySelector('[title="Reload Schema"]');
            if (reloadButton) {
              (reloadButton as HTMLButtonElement).click();
            }
          }
        } catch (err) {
          const parentNode = iframe.parentNode as HTMLDivElement;
          parentNode.setAttribute(
            'style',
            'opacity:0; pointer-events: none; position: fixed; top: 0'
          );
          parentNode.hidden = false;
          iframe.src = iframe.src.replace(/\?.*/g, '') + '?' + Math.random();
          setTimeout(() => {
            parentNode.hidden = true;
            parentNode.setAttribute('style', '');
          }, 100);
        }
      }
      self.shouldReloadPlayground = false;
    };

    const setAccessType = (accessType: any) => {
      self.accessType = accessType;
    };

    const setMasterLocale = (node: any) => {
      self.locales.forEach(locale => locale.setMaster(false));
      node.setMaster(true);
    };

    const save = flow(function*(): Generator<Promise<any>, void, any> {
      const { data } = yield client.mutate({
        mutation: gql`
          mutation setSettings($input: SettingsInput!) {
            setSettings(input: $input) {
              accessType
              previews {
                name
                hostname
                pathname
              }
              locales {
                id
                name
                flag
                master
              }
            }
          }
        `,
        variables: {
          input: {
            accessType: self.accessType,
            previews: self.previews.map(({ name, hostname, pathname }) => ({
              name,
              hostname,
              pathname,
            })),
            locales: self.locales.map(({ id, name, flag, master }) => ({ id, name, flag, master })),
          },
        },
      });
      if (data.setSettings) {
        self.accessType = data.setSettings.accessType;
        self.previews = data.setSettings.previews;
        self.locales = data.setSettings.locales;
        self.env = data.setSettings.env;
      }
      Settings.reloadPlayground();
    });

    const updateSystem = flow(function*(packages: string[]) {
      const versions = packages.map(pkg => {
        const fromList = self.packages.find(p => p.name === pkg);
        return {
          name: pkg,
          version: fromList && fromList.latestVersion,
        };
      });

      const res = yield client.mutate({
        mutation: gql`
          mutation SystemUpdate($versions: [PackageVersionInput!]!) {
            updateSystem(versions: $versions)
          }
        `,
        variables: {
          versions,
        },
      });
      return res;
    });

    const removePreview = (node: any) => {
      destroy(node);
    };

    const addPreview = (values: any) => {
      self.previews.push(Preview.create(values));
    };

    const removeLocale = (node: any) => {
      destroy(node);
    };

    const addLocale = (values: any) => {
      self.locales.push(Locale.create(values));
    };

    return {
      read,
      readVersion,
      save,
      updateSystem,
      reloadPlayground,
      reloadPlaygroundAction,
      setAccessType,
      setMasterLocale,
      addPreview,
      addLocale,
      removePreview,
      removeLocale,
    };
  })
  .create({
    accessType: 'PUBLIC',
    previews: [],
    locales: [],
    fields,
    env,
  });
