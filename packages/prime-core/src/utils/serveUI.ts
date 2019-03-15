import express from 'express';
import fs from 'fs';
import path from 'path';
import { config } from './config';
import { log } from './log';

export const serveUI = (app: express.Application) => {
  const { uiDir } = config;

  if (!uiDir) {
    log('no ui dir found %o', uiDir);
  }

  app.use(
    config.pathClean,
    express.static(uiDir, {
      index: false,
    })
  );

  app.get(`${config.pathClean}*`, (req, res, next) => {
    if (req.url.substr(config.path.length, 4) === '/api') {
      return next();
    }

    fs.readFile(path.join(uiDir, 'index.html'), (err, data) => {
      if (err) {
        log(err);
        res.send('error');
      } else {
        res.send(
          data
            .toString()
            .replace('"$PRIME_CONFIG$"', `'${JSON.stringify(config)}'`)
            .replace(/\/static\//g, `${config.path}static/`)
        );
      }
    });
  });
};
