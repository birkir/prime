// Meh...
// Until we find a better solution to dynamically load
// react components outside of Webpack with the global window.

const fs = require('fs');
const path = require('path');
const primeConfig = require('rc')('prime', {
  fields: [],
});

const lib = ['lib/ui/index.js', 'lib/ui.js', 'ui/index.js', 'ui.js'];
const src = ['src/ui/index.ts', 'src/ui.ts', 'src/ui.js', 'src/ui/index.js'];

function resolveWithEndings(part, endings) {
  return endings.map(ending => {
    return resolveRealPath(part + '/' + ending);
  }).find(n => !!n);
}

function resolveRealPath(notRealPath) {
  try {
    return fs.realpathSync(notRealPath);
  } catch (err) {
    return null;
  }
}

const fields = primeConfig.fields.map(packageName => {

  const res = {
    packageName,
    uiPackageName: packageName.replace(/\/+$/, '') + '/' + 'ui',
    // "@primecms/field-hello/src"
  };

  // Absolute package name (remove lib or src end directories)
  res.absPackageName = packageName.replace(/\/(src|lib)\/?$/, '');
  // "@primecms/field-hello"

  // Absolute path to package
  res.absPackagePath = resolveRealPath(path.resolve(path.join('node_modules', res.absPackageName)));
  // "/var/foo/home/node_modules/@primecms/field-hello"

  // Get absolute path to UI library
  res.uiPathSrc = resolveWithEndings(res.absPackagePath, src);
  // "@primecms/field-hello/src/ui/index.ts"

  res.uiPathLib = resolveWithEndings(res.absPackagePath, lib);
  // "@primecms/field-hello/lib/ui.ts"

  return res;
});

module.exports = {
  primeConfig,
  fields,
}
