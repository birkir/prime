import fs from 'fs';
import path from 'path';
import rc from 'rc';

export const config = rc('prime', {
  fields: [
    '@primecms/field-asset',
    '@primecms/field-boolean',
    '@primecms/field-datetime',
    '@primecms/field-document',
    '@primecms/field-geopoint',
    '@primecms/field-group',
    '@primecms/field-number',
    '@primecms/field-select',
    '@primecms/field-slice',
    '@primecms/field-string',
  ],
  sofaApi: true,
  uiDir: defaultUiDir(),
  coreUrl: defaultCoreUrl(),
});

function defaultUiDir() {
  try {
    const dir = require.resolve('@primecms/ui/package.json');
    return path.join(path.dirname(dir), 'build');
  } catch (err) {
    try {
      const dir = fs.realpathSync(path.join(process.cwd(), 'packages', 'prime-ui', 'build'));
      if (dir) {
        return dir;
      }
    } catch (err) {
      return null;
    }
  }
}

function defaultCoreUrl() {
  const { CORE_URL, HEROKU_APP_NAME, PORT } = process.env;
  if (CORE_URL) {
    return CORE_URL;
  }

  if (HEROKU_APP_NAME) {
    return `https://${HEROKU_APP_NAME}.herokuapp.com`;
  }

  return `http://localhost:${PORT || 4000}`;
}
