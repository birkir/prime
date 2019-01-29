require('dotenv').config(); // tslint:disable-line no-var-requires

import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import { createServer } from './server';

const port = Number(process.env.PORT) || 4000;

export default createConnection({
  type: 'postgres',
  url: 'postgres://birkir@localhost:5432/prime-typeorm',
  entities: [
    ...require('@accounts/typeorm').entities,
    'src/entities/*.ts',
    'src/schema/internal/types/*.ts',
  ],
  synchronize: true,
  logger: 'debug',
}).then(connection => {
  const driver = connection.driver as PostgresDriver;

  // Fixes postgres timezone bug
  driver.postgres.defaults.parseInputDatesAsUTC = true;
  driver.postgres.types.setTypeParser(1114, (str: any) => new Date(str + 'Z'));

  return createServer({ port, connection });
});
