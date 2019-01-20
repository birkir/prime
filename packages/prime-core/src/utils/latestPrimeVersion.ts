import { exec } from 'child_process';

export const latestPrimeVersion = async () => {
  const args = ['npm', 'show', '@primecms/core', 'version'];

  return new Promise((resolve, reject) => {
    exec(args.join(' '), (err, stdout) => {
      if (err) {
        reject(err);
      }
      resolve(stdout.trim());
    });
  });
};
