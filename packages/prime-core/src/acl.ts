import * as Acl from 'acl';
import { SequelizeBackend } from './db/acl/backend';
import { sequelize } from './sequelize';

export const acl = new Acl(new SequelizeBackend(sequelize, { prefix: 'Acl' }));

(async () => {
  await acl.allow('admin', ['document', 'schema', 'settings', 'user', 'release'], '*');
  await acl.allow('developer', ['document', 'schema', 'release', 'settings'], '*');
  await acl.allow('publisher', ['document', 'release'], '*');
  await acl.allow('editor', 'document', ['read', 'create', 'update', 'deleteOwnDraft']);
})();
