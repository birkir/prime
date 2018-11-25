import * as fs from 'fs';
import * as path from 'path';

export const primeConfig = require('rc')('prime', {
  coreUrl: `http://localhost:${process.env.PORT || 4000}`,
  fields: [],
});

const uiDir: string = (() => {
  try { return fs.realpathSync(path.join(__dirname, '..', '..', '..', 'ui', 'build')); } catch (e) {}
  try { return fs.realpathSync(path.join(__dirname, '..', '..', '..', 'prime-ui', 'build')); } catch (e) {}
  try { return fs.realpathSync(path.join(__dirname, '..', 'node_modules', '@primecms', 'ui', 'build')); } catch (e) {}
  return '';
})();

primeConfig.uiDir = uiDir;
