import express from 'express';
import fs from 'fs';
import path from 'path';
import { log } from './log';

export const serveUI = (app: express.Application, config) => {
  const { uiDir } = config;

  if (!uiDir) {
    log('no ui dir found %o', uiDir);
  }

  app.use(
    express.static(uiDir, {
      index: false,
    })
  );

  app.get('*', (req, res, next) => {
    if (req.url.substr(0, 4) === '/api') {
      return next();
    }

    fs.readFile(path.join(uiDir, 'index.html'), (err, data) => {
      if (err) {
        log(err);
        res.send('error');
      } else {
        res.send(data.toString().replace('"$PRIME_CONFIG$"', `'${JSON.stringify(config)}'`));
      }
    });
  });
};
