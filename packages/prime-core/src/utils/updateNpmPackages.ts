import { exec } from 'child_process';
import whichpm from 'which-pm';

export const updateNpmPackages = async (packages: string[]) => {
  const pm = await whichpm(process.cwd());

  const args = [
    pm,
    pm.name === 'yarn' ? 'add' : 'install',
    ...packages,
  ];

  return new Promise((resolve, reject) => {
    exec(args.join(' '), (err,  stdout, stderr) => {
      if (err) {
        reject(err)
      }
      console.log(stdout);
      console.log(stderr);
      resolve();
    })
  });
}
