import * as Acl from 'acl';
import { SequelizeBackend } from './db/acl/backend';
import { sequelize } from './sequelize';

export const acl = new Acl(new SequelizeBackend(sequelize, { prefix: 'Acl' }));

// Lets role!

// const defaultRoles = ['Admin', 'Developer', 'Editor', 'User'];

// acl.allow(['developer'], ['settings'], ['read', 'write']);
// acl.allow(['developer'], ['schemas'], ['read', 'write', 'delete']);
// acl.allow(['developer'], ['users'], ['read', 'write', 'delete']);
// acl.allow(['developer'], ['documents', ':contentTypeId'], ['read', 'write', 'delete', 'publish']);

// acl.allow(['publisher'], ['documents'], ['read', 'write', 'publish']);
// acl.allow(['editor'], ['documents'], ['read', 'write']);
