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
    } else {
      console.log('Database was initialized');
    }
  } else {
    await init()
    console.log('Database was (force) initialized');
  }

  process.exit(0)
})();

