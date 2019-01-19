const path = require('path');

module.exports = {
  entry: './src',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            noEmit: false,
            jsx: 'react',
          },
        },
      },
    ],
  },
  mode: 'production',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  externals: {
    react: 'React',
    antd: 'Antd',
    lodash: 'lodash',
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '..', 'lib', 'ui'),
  },
};
