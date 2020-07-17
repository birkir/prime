'use strict';

const packageName =
  'prime-' +
  require('./package.json')
    .name.split('@primecms/')
    .pop();

module.exports = {
  rootDir: '../..',
  preset: 'ts-jest',
  setupFiles: ['dotenv/config'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/__tests__/utils'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  roots: [`<rootDir>/packages/${packageName}`],
  testRegex: `(packages/${packageName}/__tests__/.*|\\.(test|spec))\\.tsx?$`,
  name: packageName,
  displayName: packageName,
  globals: {
    'ts-jest': {
      tsConfig: `<rootDir>/packages/${packageName}/tsconfig.json`,
    },
  },
};
