// tslint:disable no-require-imports no-var-requires no-console
require('dotenv').config();

import { sequelize } from '../sequelize';
import * as DBMigrate from 'db-migrate';

const dbmigrate = DBMigrate.getInstance(true, {
  cwd: './src',
});

dbmigrate.silence(true);

export const init = async () => {
  await sequelize.sync({ force: true });

  const migrations = await dbmigrate.check();

  await Promise.all(
    migrations.map(async (migration) => {
      return sequelize.query(`INSERT INTO migrations ("name", "run_on") VALUES (${sequelize.escape('/' + migration.name)}, now())`);
    })
  );
};

(async () => {
  if (process.argv.indexOf('--force') === -1) {
    const migrations = await dbmigrate.up();
    if (!migrations) {
      console.log('This is will wipe previous database. If you are sure, run:');
      console.log('npx primecms db:init --force');
    }
    console.log('Database was initialized');
  } else {
    await init()
    console.log('Database was (force) initialized');
  }

  process.exit(0)
})();

