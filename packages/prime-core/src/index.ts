require('dotenv').config(); // tslint:disable-line no-var-requires

import 'reflect-metadata';
import { createServer } from './server';
import { connect } from './utils/connect';

const port = Number(process.env.PORT) || 4000;

export default connect(process.env.DATABASE_URL).then(connection =>
  createServer({ port, connection })
);
