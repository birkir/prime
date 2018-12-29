import { Auth } from './auth';
import { ContentReleases } from './contentReleases';
import { ContentEntries } from './contentEntries';
import { ContentTypes } from './contentTypes';
import { Users } from './users';
import { Settings } from './settings';
import { Webhooks } from './webhooks';

const stores = {
  Auth,
  Settings,
  ContentReleases,
  ContentEntries,
  ContentTypes,
  Users,
  Webhooks,
};

if ((window as any).prime && process.env.NODE_ENV !== 'production') {
  (window as any).prime.stores = stores;
}

export default stores;
