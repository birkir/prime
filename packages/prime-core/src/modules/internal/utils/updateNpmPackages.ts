import { exec } from 'child_process';
import whichpm from 'which-pm';

export const updateNpmPackages = async (packages: string[]) => {
  const pm = await whichpm(process.cwd());
  const args = [pm.name, pm.name === 'yarn' ? 'add' : 'install --silent', ...packages];
  return new Promise((resolve, reject) => {
    exec(args.join(' '), (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(Boolean(res));
    });
  });
};
