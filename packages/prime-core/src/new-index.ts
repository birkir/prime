require('dotenv').config(); // tslint:disable-line no-var-requires

import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { createServer } from './new-server';

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
}).then(connection => createServer({ port, connection }));
