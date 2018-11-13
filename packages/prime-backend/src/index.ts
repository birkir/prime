import * as express from 'express';
import * as http from 'http';
import { sequelize } from './sequelize';
import { seed } from './seed';
import { externalGraphql } from './routes/externalGraphql';
import { internalGraphql } from './routes/internalGraphql';

let currentApp;
const port = process.env.PORT || 4000;

console.log()
console.log('initializing');

(async () => {
  await sequelize.sync({ force: true });

  console.log('seeding');
  await seed();

  const app = express();
  const httpServer = http.createServer(app);
  currentApp = app;

  const start = async (req?, res?) => {
    httpServer.removeListener('request', currentApp);

    currentApp = express();
    currentApp.get('/refresh', start);
    currentApp.use(await externalGraphql());
    currentApp.use('/internal', await internalGraphql(start));

    httpServer.on('request', currentApp);

    if (res) {
      res.send('done');
    }
  }

  await start();

  httpServer.listen(port, () => {
    console.log();
    console.log(`🚀  Server listening on port ${port}\n`);
    console.log(`[Public API] http://localhost:${port}/graphql`);
    console.log(`[Internal API] http://localhost:${port}/internal/graphql`);
  });

})();
