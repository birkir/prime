import * as fs from 'fs';
import { get } from 'lodash';
import * as path from 'path';

const fields = [
  '@primecms/field-asset',
  '@primecms/field-boolean',
  '@primecms/field-datetime',
  '@primecms/field-document',
  '@primecms/field-group',
  '@primecms/field-number',
  '@primecms/field-select',
  '@primecms/field-slice',
  '@primecms/field-string',
].map(pkg => {
  if (process.env.NODE_ENV === 'development') {
    return pkg + '/src';
  }
  return pkg;
});

// Make default heroku buildpacks work
if (process.env.CLOUDINARY_URL && !process.env.PRIME_CLOUDINARY_URL) {
  process.env.PRIME_CLOUDINARY_URL = process.env.CLOUDINARY_URL;
}

if (!process.env.CORE_URL && process.env.HEROKU_APP_NAME) {
  process.env.CORE_URL = `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`;
}

// tslint:disable-next-line no-require-imports no-var-requires
export const primeConfig = require('rc')('prime', {
  coreUrl: get(process.env, 'CORE_URL', `http://localhost:${process.env.PORT || 4000}`),
  fields,
});

const uiDir: string = (() => {
  try {
    return fs.realpathSync(path.join(__dirname, '..', '..', '..', 'ui', 'build'));
  } catch (e) {
    // noop
  }
  try {
    return fs.realpathSync(path.join(__dirname, '..', '..', '..', 'prime-ui', 'build'));
  } catch (e) {
    // noop
  }
  try {
    return fs.realpathSync(path.join(__dirname, '..', 'node_modules', '@primecms', 'ui', 'build'));
  } catch (e) {
    // noop
  }

  return '';
})();

primeConfig.uiDir = uiDir;
