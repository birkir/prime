// tslint:disable no-require-imports no-var-requires no-console
require('dotenv').config();

import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as session from 'express-session';
import * as fs from 'fs';
import * as http from 'http';
import * as passport from 'passport';
import * as path from 'path';

import { auth } from './routes/auth';
import { externalGraphql } from './routes/external';
import { fields } from './routes/fields';
import { internalGraphql } from './routes/internal';
import { sequelize } from './sequelize';
import { primeConfig } from './utils/primeConfig';

let app = express();
const port = process.env.PORT || 4000;
const debug = require('debug')('prime:http');
const sequelizeStore = require('connect-session-sequelize')(session.Store);
const store = new sequelizeStore({
  db: sequelize
});

debug('initializing');

(async () => {
  await sequelize.sync();

  const httpServer = http.createServer(app);

  if (!process.env.SESSION_SECRET && process.env.NODE_ENV !== 'development') {
    throw new Error('Unset environment variable in non-development mode: "SESSION_SECRET"');
  }

  const start = async () => {
    httpServer.removeListener('request', app);
    debug('closing connections');

    app = express();
    app.use(cors({
      credentials: true,
      origin: true
    }));
    app.use(bodyParser.json());
    app.use(
      session({
        name: 'prime.sid',
        secret: process.env.SESSION_SECRET || 'keyboard cat dart',
        store,
        resave: false,
        saveUninitialized: true
      })
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.use('/fields', fields);
    app.use('/auth', auth);
    app.use(await externalGraphql());
    app.use('/internal', await internalGraphql(start));

    if (primeConfig.uiDir) {
      app.use(express.static(primeConfig.uiDir, {
        index: false
      }));
      app.get('*', (req, res) => {
        fs.readFile(path.join(primeConfig.uiDir, 'index.html'), (err, data) => {
          if (err) {
            console.error(err);
            res.send('error');
          } else {
            res.send(data.toString().replace('"$PRIME_CONFIG$"', `'${JSON.stringify(primeConfig)}'`));
          }
        });
      });
    }

    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500);
    });

    httpServer.on('request', app);

    debug('started');
  };

  await start();

  httpServer.listen(port, () => {
    console.log();
    console.log(`🚀  Server listening on port ${port}\n`);
    console.log(`[UI] http://localhost:${port}`);
    console.log(`[API] http://localhost:${port}/graphql`);
  });

})();
