// tslint:disable no-require-imports no-var-requires no-console
require('dotenv').config();

import { sequelize } from '../sequelize';
import * as DBMigrate from 'db-migrate';

const dbmigrate = DBMigrate.getInstance(true, {
  cwd: './src',
});

// tslint:disable-next-line max-func-body-length
export const init = async () => {
  await sequelize.sync({ force: true });

  const migrations = await dbmigrate.check();

  await Promise.all(
    migrations.map(async (migration) => {
      return sequelize.query(`INSERT INTO migrations ("name", "run_on") VALUES (${sequelize.escape('/' + migration.name)}, now())`);
    })
  );
};

if (process.argv.indexOf('--yes') === -1) {
  console.log('This is will wipe previous database. If you are sure, run:');
  console.log('npm run db:init -- --yes');
} else {
  init()
    .then(() => process.exit(0));
}

