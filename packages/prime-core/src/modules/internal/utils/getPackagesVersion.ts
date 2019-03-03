import latest from 'latest';
import path from 'path';
import readPkg from 'read-pkg';
import { fields } from '../../../utils/fields';

const getLatestVersion = packageName =>
  new Promise(resolve => {
    try {
      latest(packageName, (err, version) => {
        return resolve(version);
      });
    } catch (err) {
      resolve(null as any);
    }
  });

export const getPackagesVersion = async () => {
  const packages = [
    { packageName: '@primecms/core' },
    { packageName: '@primecms/ui' },
    ...fields.map(({ packageName, dir }) => ({ packageName, dir })),
  ];

  return await Promise.all(
    packages.map(async pkg => {
      try {
        const { version } = await readPkg({
          cwd: pkg.dir || path.dirname(require.resolve(`${pkg.packageName}/package.json`)),
        });
        const latestVersion = await getLatestVersion(pkg.packageName);
        return { name: pkg.packageName, currentVersion: version, latestVersion };
      } catch (err) {
        return { name: pkg.packageName };
      }
    })
  );
};
