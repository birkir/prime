const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');

module.exports = {
  entry: path.join(process.cwd(), 'src', 'ui'),
  module: {
    rules: [
      {
        test: /\.css?$/,
        loader: 'css-loader',
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.join(__dirname, '..', 'prime-ui', 'tsconfig.json'),
              compilerOptions: {
                noEmit: false,
                jsx: 'react',
              },
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
  mode: 'production',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    antd: 'Antd',
    lodash: 'lodash',
    moment: 'moment',
    'braft-editor': 'BraftEditor',
  },
  output: {
    filename: 'index.js',
    path: path.join(process.cwd(), 'lib', 'ui'),
  },
};
