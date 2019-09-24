const fs = require('fs');
const path = require('path');
const { override, fixBabelImports, addLessLoader, getBabelLoader } = require('customize-cra');
const rewireLess = require('react-app-rewire-less');
const rewireGqlTag = require('react-app-rewire-graphql-tag');
const primeConfig = require('rc')('prime', {
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
});

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {
      '@primary-color': '#318E9F',
      '@link-color': '#318E9F',
      '@font-family':
        '"Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      '@code-family':
        '"Source Code Pro", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;',
      '@font-size-base': '16px',
      '@layout-header-background': '#1F3E44',
    },
  }),
  rewireGqlTag,
  config => {
    const babelLoader = getBabelLoader(config);

    const fieldPaths = primeConfig.fields
      .map(packageName => {
        const absPackageName = packageName.replace(/\/(src|lib)\/?$/, '');
        try {
          return fs.realpathSync(path.resolve(path.join('../../node_modules', absPackageName)));
        } catch (err) {
          return null;
        }
      })
      .filter(pkg => !!pkg);

    babelLoader.include = [].concat(babelLoader.include, fieldPaths);

    return config;
  }
);
