// tslint:disable no-require-imports no-var-requires no-console
require('dotenv').config();

import * as path from 'path';
import * as DBMigrate from 'db-migrate';
import { sequelize } from '../sequelize';
import { acl } from '../acl';

const dbmigrate = DBMigrate.getInstance(true, {
  cwd: path.join(__dirname + '/../..')
});

if (process.env.NODE_ENV !== 'production') {
  dbmigrate.silence(true);
}

export const init = async () => {
  await sequelize.sync({ force: true });
  await dbmigrate.up();
};

(async () => {

  console.log('Setup default roles...');
  await acl.allow(['admin'], ['document', 'schema', 'settings', 'user', 'release'], '*');
  await acl.allow('developer', ['document', 'schema', 'release', 'settings'], '*');
  await acl.allow('publisher', ['document', 'release'], '*');
  await acl.allow('editor', 'document', ['read', 'create', 'update', 'deleteOwnDraft']);

  if (process.argv.indexOf('--force') === -1) {
    await sequelize.sync();
    const migrations = await dbmigrate.up();
    if (migrations) {
      console.log('Database was migrated');
    }
    console.log('Use --force to initialize fresh database (will overwrite data)');
  } else {
    await init()
    console.log('Database was initialized');
  }

  process.exit(0)
})();

