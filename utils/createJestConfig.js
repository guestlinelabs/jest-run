'use strict';

const fs = require('fs');
const chalk = require('react-dev-utils/chalk');
const paths = require('../config/paths');

module.exports = (resolve, rootDir, isEjecting) => {
  // Use this instead of `paths.testsSetup` to avoid putting
  // an absolute filename into configuration after ejecting.

  const possibleTestFolders = ['src', 'test', 'tests'];
  const existingTestFolders = possibleTestFolders.filter((folder) => {
    const absolutePath = paths.resolveApp(folder);
    return fs.existsSync(absolutePath);
  });

  const setupFilesAfterEnv = [];
  existingTestFolders.forEach((testFolder) => {
    const filePath = paths.resolveModule(paths.resolveApp, `${testFolder}/setupTests`);
    const setupTestsMatches = filePath.match(/[/\\]setupTests\.(.+)/);
    const setupTestsFileExtension = (setupTestsMatches && setupTestsMatches[1]) || 'js';

    if (fs.existsSync(filePath)) {
      setupFilesAfterEnv.push(`<rootDir>/${testFolder}/setupTests.${setupTestsFileExtension}`);
    }
  });

  const config = {
    roots: existingTestFolders.map((testFolder) => `<rootDir>/${testFolder}`),

    collectCoverageFrom: existingTestFolders
      .map((testFolder) => [`${testFolder}/**/*.{js,jsx,ts,tsx}`, `!${testFolder}/**/*.d.ts`])
      .reduce((acc, folders) => [...acc, ...folders], []),

    setupFiles: [require.resolve('react-app-polyfill/jsdom')],

    setupFilesAfterEnv,
    testMatch: existingTestFolders
      .map((testFolder) => {
        if (testFolder.includes('test')) {
          return [`<rootDir>/${testFolder}/**/*.{js,jsx,ts,tsx}`];
        }
        return [
          `<rootDir>/${testFolder}/**/__tests__/**/*.{js,jsx,ts,tsx}`,
          `<rootDir>/${testFolder}/**/*.{spec,test}.{js,jsx,ts,tsx}`
        ];
      })
      .reduce((acc, folders) => [...acc, ...folders], []),

    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
      url: 'http://localhost'
    },
    transform: {
      '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': resolve('config/babelTransform.js'),
      '^.+\\.css$': resolve('config/cssTransform.js'),
      '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)': resolve('config/fileTransform.js')
    },
    transformIgnorePatterns: [
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
      '^.+\\.module\\.(css|sass|scss)$'
    ],
    moduleNameMapper: {
      '^react-native$': 'react-native-web',
      '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy'
    },
    moduleFileExtensions: [...paths.moduleFileExtensions, 'node'].filter(
      (ext) => !ext.includes('mjs')
    ),
    watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
    resetMocks: true
  };
  if (rootDir) {
    config.rootDir = rootDir;
  }
  const overrides = Object.assign({}, require(paths.appPackageJson).jest);
  const supportedKeys = [
    'clearMocks',
    'collectCoverageFrom',
    'coveragePathIgnorePatterns',
    'coverageReporters',
    'coverageThreshold',
    'displayName',
    'extraGlobals',
    'globalSetup',
    'globalTeardown',
    'moduleNameMapper',
    'resetMocks',
    'resetModules',
    'restoreMocks',
    'snapshotSerializers',
    'transform',
    'transformIgnorePatterns',
    'watchPathIgnorePatterns'
  ];
  if (overrides) {
    supportedKeys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(overrides, key)) {
        if (Array.isArray(config[key]) || typeof config[key] !== 'object') {
          // for arrays or primitive types, directly override the config key
          config[key] = overrides[key];
        } else {
          // for object types, extend gracefully
          config[key] = Object.assign({}, config[key], overrides[key]);
        }

        delete overrides[key];
      }
    });
    const unsupportedKeys = Object.keys(overrides);
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
              supportedKeys.map((key) => chalk.bold('  \u2022 ' + key)).join('\n') +
              '.\n\n' +
              'These options in your package.json Jest configuration ' +
              'are not currently supported by Jest Run:\n\n' +
              unsupportedKeys.map((key) => chalk.bold('  \u2022 ' + key)).join('\n') +
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
  return config;
};
