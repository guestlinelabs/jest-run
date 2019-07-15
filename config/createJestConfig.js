'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('react-dev-utils/chalk');

const { options } = require('./argv');

const { resolveFile, resolveModule, moduleFileExtensions } = require('./paths');

const folder = options.dir || 'src';
const setupTestsPath = resolveModule(`${folder}/setupTests`);
// // Use this instead of `setupTestsPath` to avoid putting
// // an absolute filename into configuration.
const setupTestsMatches = setupTestsPath.match(new RegExp(`${folder}[/\\\\]setupTests\.(.+)`));
const setupTestsFileExtension = (setupTestsMatches && setupTestsMatches[1]) || 'js';
const setupTestsFile = fs.existsSync(setupTestsPath)
  ? `<rootDir>/${folder}/setupTests.${setupTestsFileExtension}`
  : undefined;

const defaultConfig = {
  rootDir: resolveFile('.'),

  collectCoverageFrom: [`${folder}/**/*.{js,jsx,ts,tsx}`, `!${folder}/**/*.d.ts`],

  setupFiles: [require.resolve('react-app-polyfill/jsdom')],

  setupFilesAfterEnv: setupTestsFile ? [setupTestsFile] : [],
  testMatch: [
    `<rootDir>/${folder}/**/__tests__/**/*.{js,jsx,ts,tsx}`,
    `<rootDir>/${folder}/**/?(*.)(spec|test).{js,jsx,ts,tsx}`
  ],
  testEnvironment: 'jsdom',
  testURL: 'http://localhost',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': path.resolve(__dirname, 'babelTransform.js'),
    '^.+\\.css$': path.resolve(__dirname, 'cssTransform.js'),
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': path.resolve(__dirname, 'fileTransform.js')
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$'
  ],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy'
  },
  moduleFileExtensions: [...moduleFileExtensions, 'node'].filter(ext => !ext.includes('mjs')),
  watchPlugins: [
    require.resolve('jest-watch-typeahead/filename'),
    require.resolve('jest-watch-typeahead/testname')
  ]
};

const packageJsonPath = resolveFile('package.json');
const packageJsonConfig = require(packageJsonPath).jest;

const config = { ...defaultConfig };
if (packageJsonConfig) {
  const supportedKeys = [
    'collectCoverageFrom',
    'coverageReporters',
    'coverageThreshold',
    'extraGlobals',
    'globalSetup',
    'globalTeardown',
    'resetMocks',
    'resetModules',
    'snapshotSerializers',
    'watchPathIgnorePatterns'
  ];

  supportedKeys.forEach(key => {
    if (packageJsonConfig.hasOwnProperty(key)) {
      config[key] = packageJsonConfig[key];
      delete packageJsonConfig[key];
    }
  });
  const unsupportedKeys = Object.keys(packageJsonConfig);
  if (unsupportedKeys.length) {
    const isOverridingSetupFile = unsupportedKeys.indexOf('setupFilesAfterEnv') > -1;

    if (isOverridingSetupFile) {
      console.error(
        chalk.red(
          'We detected ' +
            chalk.bold('setupFilesAfterEnv') +
            ' in your package.json.\n\n' +
            'Remove it from Jest configuration, and put the initialization code in ' +
            chalk.bold('src/setupTests.js') +
            '.\nThis file will be loaded automatically.\n'
        )
      );
    } else {
      console.error(
        chalk.red(
          '\nOut of the box, Jest Run only supports overriding ' +
            'these Jest options:\n\n' +
            supportedKeys.map(key => chalk.bold('  \u2022 ' + key)).join('\n') +
            '.\n\n' +
            'These options in your package.json Jest configuration ' +
            'are not currently supported by Jest Run:\n\n' +
            unsupportedKeys.map(key => chalk.bold('  \u2022 ' + key)).join('\n') +
            '\n\nIf you wish to override other Jest options, you need to ' +
            'eject from the default setup. You can do so by running ' +
            chalk.bold('npm run eject') +
            ' but remember that this is a one-way operation. ' +
            'You may also file an issue with Jest Run to discuss ' +
            'supporting more options out of the box.\n'
        )
      );
    }

    process.exit(1);
  }
}

module.exports = config;
