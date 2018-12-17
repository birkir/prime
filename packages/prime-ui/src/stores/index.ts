import { Auth } from './auth';
import { ContentEntries } from './contentEntries';
import { ContentTypes } from './contentTypes';
import { Users } from './users';
import { Settings } from './settings';

const stores = {
  Auth,
  Settings,
  ContentEntries,
  ContentTypes,
  Users,
};

if ((window as any).prime && process.env.NODE_ENV !== 'production') {
  (window as any).prime.stores = stores;
}

export default stores;
