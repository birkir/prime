require('dotenv').config();
import * as express from 'express';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as session from 'express-session';
import * as passport from 'passport';
import * as cors from 'cors';
import debug from 'debug';

import { sequelize } from './sequelize';
import { seed } from './seed';
import { auth } from './routes/auth';
import { externalGraphql } from './routes/external';
import { internalGraphql } from './routes/internal';
import { fields } from './routes/fields';

let app = express();
const port = process.env.PORT || 4000;
const debug = require('debug')('prime:http');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const store = new SequelizeStore({
  db: sequelize
});

debug('initializing');

(async () => {
  await sequelize.sync({ force: true });

  debug('seeding');
  await seed();

  const httpServer = http.createServer(app);

  const start = async () => {
    httpServer.removeListener('request', app);
    debug('closing connections');

    app = express();
    app.use(cors({
      credentials: true,
      origin: true,
    }));
    app.use(bodyParser.json());
    app.use(
      session({
        name: 'prime.sid',
        secret: process.env.SESSION_SECRET || 'keyboard cat dart',
        store,
        resave: false,
      }),
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static(path.join(__dirname, '..', '..', 'ui', 'build')));
    app.use('/fields', fields);
    app.use('/auth', auth);
    app.use(await externalGraphql());
    app.use('/internal', await internalGraphql(start));

    app.use((err, req, res, next) => {
      console.log('====== ERROR =======');
      console.error(err.stack);
      res.status(500);
    });

    httpServer.on('request', app);

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
