'use strict';

const packageName =
  'prime-' +
  require('./package.json')
    .name.split('@primecms/')
    .pop();

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [`<rootDir>/packages/${packageName}`],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  setupFiles: ['dotenv/config'],
  testRegex: `(packages/${packageName}/__tests__/.*|\\.(test|spec))\\.tsx?$`,
  testPathIgnorePatterns: ['/__tests__/utils'],
  name: packageName,
  displayName: packageName,
  rootDir: '../..',
  globals: {
    'ts-jest': {
      tsConfig: `<rootDir>/packages/${packageName}/tsconfig.json`,
    },
  },
};
