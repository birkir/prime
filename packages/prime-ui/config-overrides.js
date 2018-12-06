const fs = require('fs');
const path = require('path');
const { injectBabelPlugin, getBabelLoader } = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');
const rewireGqlTag = require('react-app-rewire-graphql-tag');
const primeConfig = require('rc')('prime', {
  fields: [
    '@primecms/field-asset',
    '@primecms/field-datetime',
    '@primecms/field-document',
    '@primecms/field-group',
    '@primecms/field-slice',
    '@primecms/field-string'
  ]
});

module.exports = function override(config, env) {
  config = injectBabelPlugin(
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
    config,
  );

  config = rewireLess.withLoaderOptions({
    modifyVars: {
      '@primary-color': '#318E9F',
      '@link-color': '#318E9F',
      // '@layout-header-background': '#010102',
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
          return fs.realpathSync(path.resolve(path.join('node_modules', absPackageName)));
        } catch (err) {
          return null;
        }
      })
      .filter(pkg => !!pkg);

    babelLoader.include = [].concat(
      babelLoader.include,
      fieldPaths,
    );
  }

  return config;
};
