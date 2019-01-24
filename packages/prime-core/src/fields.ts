// tslint:disable non-literal-require no-console
import fs from 'fs';
import path from 'path';
import { primeConfig } from './utils/primeConfig';

// Resolve fields
export const fields = (primeConfig.fields || [])
  .map((moduleName: string) => {
    try {
      const instance = new (require(moduleName)).default();
      const pkgDir = moduleName.replace(/\/*(src\/*?)?$/, '');
      let pkgJson;

      try {
        const dev = path.resolve(path.join('node_modules', pkgDir, 'package.json'));
        const devFile = fs.realpathSync(dev);
        instance.mode = 'development';
        instance.dir = devFile.replace(/\/package.json$/, '');
        pkgJson = require(devFile);
      } catch (err) {
        try {
          const dist = path.resolve(path.join('..', '..', 'node_modules', pkgDir, 'package.json'));
          const distFile = fs.realpathSync(dist);
          instance.mode = 'production';
          instance.dir = distFile.replace(/\/package.json$/, '');
          pkgJson = require(distFile);
        } catch (err2) {
          // noop
        }
      }

      if (pkgJson) {
        if (pkgJson.prime) {
          instance.ui = path.join(instance.dir, pkgJson.prime);
        }
      }

      return instance;
    } catch (err) {
      console.error('ERROR: Could not resolve field module', `"${moduleName}"`);
      console.error(err);
    }

    return null;
  })
  .filter(n => !!n);
