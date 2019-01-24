import Acl from 'acl';
import { SequelizeBackend } from './db/acl/backend';

export let acl;

export const setupAcl = async sequelize => {
  acl = new Acl(new SequelizeBackend(sequelize, { prefix: 'Acl' }));

  // Setup roles
  await acl.allow('admin', ['document', 'schema', 'settings', 'user', 'release'], '*');
  await acl.allow('developer', ['document', 'schema', 'release', 'settings'], '*');
  await acl.allow('publisher', ['document', 'release'], '*');
  await acl.allow('editor', 'document', ['read', 'create', 'update', 'deleteOwnDraft']);
};
