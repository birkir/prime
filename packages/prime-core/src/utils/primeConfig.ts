import * as fs from 'fs';
import { get } from 'lodash';
import * as path from 'path';

// tslint:disable-next-line no-require-imports no-var-requires
export const primeConfig = require('rc')('prime', {
  coreUrl: get(process.env, 'CORE_URL',  `http://localhost:${process.env.PORT || 4000}`),
  fields: []
});

const uiDir: string = (() => {
  try { return fs.realpathSync(path.join(__dirname, '..', '..', '..', 'ui', 'build')); } catch (e) { // noop
  }
  try { return fs.realpathSync(path.join(__dirname, '..', '..', '..', 'prime-ui', 'build')); } catch (e) { // noop
  }
  try { return fs.realpathSync(path.join(__dirname, '..', 'node_modules', '@primecms', 'ui', 'build')); } catch (e) { // noop
  }

  return '';
})();

primeConfig.uiDir = uiDir;
