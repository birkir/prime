import path from 'path';
import { createConnection } from 'typeorm';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';

export const connect = (url = process.env.DATABASE_URL) =>
  createConnection({
    type: 'postgres',
    url,
    entities: [
      ...require('@accounts/typeorm').entities,
      path.join(__dirname, '..', 'entities', '*.ts'),
      path.join(__dirname, '..', 'entities', '*.js'),
    ],
    synchronize: true,
    logger: 'debug',
  }).then(connection => {
    const driver = connection.driver as PostgresDriver;

    // Fixes postgres timezone bug
    driver.postgres.defaults.parseInputDatesAsUTC = true;
    driver.postgres.types.setTypeParser(1114, (str: any) => new Date(str + 'Z'));

    return connection;
  });
