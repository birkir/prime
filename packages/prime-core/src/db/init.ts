// tslint:disable no-require-imports no-var-requires no-console
require('dotenv').config();

import * as path from 'path';
import * as DBMigrate from 'db-migrate';
import { sequelize } from '../sequelize';

const dbmigrate = DBMigrate.getInstance(true, {
  cwd: path.join(__dirname + '/../..')
});

if (process.env.NODE_ENV !== 'production') {
  dbmigrate.silence(true);
}

(async () => {

  process.stdout.write('Migrating database... ');
  const migrations = await dbmigrate.up();
  console.log('done (' + (migrations ? migrations.length : '0') + ' migrations)');

  process.stdout.write('Syncing sequelize... ');
  await sequelize.sync();
  console.log('done');

  process.exit(0)
})();

