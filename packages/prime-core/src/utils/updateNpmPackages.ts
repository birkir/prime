import { exec } from 'child_process';
import * as whichpm from 'which-pm';

export const updateNpmPackages = async (packages: string[]) => {
  const pm = await whichpm(process.cwd());

  const args = [pm.name, pm.name === 'yarn' ? 'add' : 'install', ...packages];

  return new Promise((resolve, reject) => {
    exec(args.join(' '), (err, res1) => {
      if (err) {
        reject(err);
      }
      exec('"$(npm bin)/primecms" db:init', (err2, res2) => {
        if (err2) {
          reject(err2);
        }
        resolve(true);
      });
    });
  });
};
