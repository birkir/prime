import fs from 'fs';
import path from 'path';
import pkgUp from 'pkg-up';

export async function startCommand(cli) {
  const pkgJson = await pkgUp();

  if (!pkgJson) {
    throw new Error('did not find package.json in directory');
  }

  const coreDir = path.join(path.dirname(pkgJson), 'node_modules', '@primecms', 'core');

  if (!fs.existsSync(coreDir)) {
    throw new Error('did not find @primecms/core in node_modules');
  }

  if (!process.env.DEBUG) {
    process.env.DEBUG = 'prime:*';
  }

  if (cli.flags.debug) {
    process.env.DEBUG = `${process.env.DEBUG},typeorm:*`;
  }

  require(path.join(coreDir, 'lib', 'index.js'));
}
