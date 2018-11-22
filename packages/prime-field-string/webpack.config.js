const path = require('path');

module.exports = {
  entry: './src/ui',
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'ts-loader',
      exclude: /node_modules/,
      options: {
        compilerOptions: {
          module: 'es6',
          target: 'es5',
          jsx: 'react',
        }
      },
    }],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  externals: {
    react: 'React',
  },
  output: {
    filename: 'ui.js',
    path: path.resolve(__dirname, 'lib'),
  },
};
