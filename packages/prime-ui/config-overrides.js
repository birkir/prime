const fs = require('fs');
const path = require('path');
const { injectBabelPlugin, getBabelLoader } = require('react-app-rewired');
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
    '@primecms/field-richtext',
  ],
});

module.exports = function override(config, env) {
  config = injectBabelPlugin(
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
    config
  );

  config = rewireLess.withLoaderOptions({
    modifyVars: {
      '@primary-color': '#318E9F',
      '@link-color': '#318E9F',
      '@font-family':
        '"Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      '@code-family':
        '"Source Code Pro", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;',
      // '@layout-header-background': '#010102',
      '@font-size-base': '16px',

      // '@padding-lg': '32px',
      // '@padding-md': '24px',
      // '@padding-sm': '16px',
      // '@padding-xs': '8px',

      '@layout-header-background': '#1F3E44',
      // @link-color: #1890ff;                            // link color
      // @success-color: #52c41a;                         // success state color
      // @warning-color: #faad14;                         // warning state color
      // @error-color: #f5222d;                           // error state color
      // @font-size-base: 14px;                           // major text font size
      // @heading-color: rgba(0, 0, 0, .85);              // heading text color
      // @text-color: rgba(0, 0, 0, .65);                 // major text color
      // @text-color-secondary : rgba(0, 0, 0, .45);      // secondary text color
      // @disabled-color : rgba(0, 0, 0, .25);            // disable state color
      // @border-radius-base: 4px;                        // major border radius
      // @border-color-base: #d9d9d9;                     // major border color
      // @box-shadow-base: 0 2px 8px rgba(0, 0, 0, .15);  // major shadow for layers
    },
    javascriptEnabled: true,
  })(config, env);

  config = rewireGqlTag(config, env);

  if (config.mode !== 'production') {
    const babelLoader = getBabelLoader(config.module.rules);

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
  }

  return config;
};
