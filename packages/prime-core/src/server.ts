// tslint:disable no-console
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import fs from 'fs';
import http from 'http';
import passport from 'passport';
import path from 'path';

import { setupAcl } from './acl';
import { auth } from './routes/auth';
import { externalGraphql } from './routes/external';
import { fields } from './routes/fields';
import { internalGraphql } from './routes/internal';
import { sequelize } from './sequelize';
import { primeConfig } from './utils/primeConfig';

const debug = require('debug')('prime:http'); // tslint:disable-line no-var-requires

export const server = async ({ port }: { port: number }) => {
  let app = express();
  const sequelizeStore = require('connect-session-sequelize')(session.Store);
  const store = new sequelizeStore({
    db: sequelize,
  });

  debug('initializing');

  await sequelize.sync();
  await setupAcl(sequelize);

  const httpServer = http.createServer(app);

  if (!process.env.SESSION_SECRET && process.env.NODE_ENV !== 'development') {
    console.warn('Unset environment variable in non-development mode: "SESSION_SECRET"');
    console.warn('This can be very dangerous');
  }

  const start = async () => {
    httpServer.removeListener('request', app);
    debug('closing connections');

    app = express();
    app.use(
      cors({
        credentials: true,
        origin: true,
      })
    );
    app.use(bodyParser.json());
    app.use(
      session({
        name: 'prime.sid',
        secret: process.env.SESSION_SECRET || 'keyboard cat dart',
        store,
        resave: false,
        saveUninitialized: true,
      })
    );

    const external = await externalGraphql();
    const internal = await internalGraphql(start);

    app.use(passport.initialize());
    app.use(passport.session());
    app.use('/fields', fields);
    app.use('/auth', auth);
    app.use('/internal', internal.app);
    app.use(external.app);

    if (primeConfig.uiDir) {
      app.use(
        express.static(primeConfig.uiDir, {
          index: false,
        })
      );
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

  return httpServer.listen(port, () => {
    console.log();
    console.log(`🚀  Server listening on port ${port}\n`);
    console.log(`[UI] http://localhost:${port}`);
    console.log(`[API] http://localhost:${port}/graphql`);
  });
};
