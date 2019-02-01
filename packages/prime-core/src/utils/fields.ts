// tslint:disable non-literal-require no-console
import debug from 'debug';
import fs from 'fs';
import path from 'path';
import { config } from './config';

const log = debug('prime:fields');

// Resolve fields
export const fields = (config.fields || [])
  .map((moduleName: string) => {
    try {
      const field = require(moduleName).default;
      const pkgDir = moduleName.replace(/\/*(src\/*?)?$/, '');
      let pkgJson;

      try {
        const dev = path.resolve(path.join('node_modules', pkgDir, 'package.json'));
        const devFile = fs.realpathSync(dev);
        field.mode = 'development';
        field.dir = devFile.replace(/\/package.json$/, '');
        pkgJson = require(devFile);
      } catch (err) {
        try {
          const dist = path.resolve(path.join('..', '..', 'node_modules', pkgDir, 'package.json'));
          const distFile = fs.realpathSync(dist);
          field.mode = 'production';
          field.dir = distFile.replace(/\/package.json$/, '');
          pkgJson = require(distFile);
        } catch (err2) {
          // noop
        }
      }

      if (pkgJson) {
        if (pkgJson.prime) {
          field.ui = path.join(field.dir, pkgJson.prime);
        }
      }

      return field;
    } catch (err) {
      log('Could not resolve field module %o', moduleName);
    }

    return null;
  })
  .filter(n => !!n);
