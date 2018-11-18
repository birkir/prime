require('dotenv').config();
import * as express from 'express';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import debug from 'debug';

import { sequelize } from './sequelize';
import { seed } from './seed';
import { auth } from './routes/auth';
import { externalGraphql } from './routes/external';
import { internalGraphql } from './routes/internal';

let currentApp;
const port = process.env.PORT || 4000;
const debug = require('debug')('prime:http');

debug('initializing');

(async () => {
  await sequelize.sync({ force: true });

  debug('seeding');
  await seed();

  const app = express();
  const httpServer = http.createServer(app);
  currentApp = app;

  const start = async () => {
    httpServer.removeListener('request', currentApp);
    debug('closing connections');

    currentApp = express();

    currentApp.use(bodyParser.json());
    currentApp.use(express.static(path.join(__dirname, '..', '..', 'prime-frontend', 'build')));
    currentApp.use(express.static(path.join(__dirname, '..', 'node_modules', 'prime-frontend', 'build')));
    currentApp.use('/auth', auth);
    currentApp.use(await externalGraphql());
    currentApp.use('/internal', await internalGraphql(start));

    httpServer.on('request', currentApp);

    debug('started');
  }

  await start();

  httpServer.listen(port, () => {
    console.log();
    console.log(`🚀  Server listening on port ${port}\n`);
    console.log(`[Public API] http://localhost:${port}/graphql`);
    console.log(`[Internal API] http://localhost:${port}/internal/graphql`);
  });

})();
