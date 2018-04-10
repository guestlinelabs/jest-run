#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const jest = require('jest');

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

// We force the output to be with colors
process.env.FORCE_COLOR = 1;

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Get the project root folder
const appDirectory = fs.realpathSync(process.cwd());

// Ensure environment variables are read.
require('dotenv').config({ silent: true, path: path.resolve(appDirectory, '.env') });

const argv = process.argv.slice(2);

// Watch unless on CI or in coverage mode
if (!process.env.CI && argv.indexOf('--coverage') < 0) {
  argv.push('--watch');
}

// Default config
const defaultConfig = {
  testURL: 'http://localhost',
  testEnvironment: 'node',
  rootDir: appDirectory,
  setupFiles: [path.resolve(__dirname, '..', 'config', 'polyfills.js')],
  setupTestFrameworkScriptFile: fs.existsSync(path.resolve(appDirectory, 'src', 'setupTests.js'))
    ? '<rootDir>/src/setupTests.js'
    : undefined,
  testMatch: ['<rootDir>/src/**/__tests__/**/*.js?(x)', '<rootDir>/src/**/?(*.)(spec|test).js?(x)'],
  transform: {
    // CSS files will return an empty object
    '^.+\\.css$': path.resolve(__dirname, '..', 'config', 'cssTransform.js'),
    // Running files through babel before testing
    '^.+\\.(js|jsx)$': path.resolve(__dirname, '..', 'config', 'babelTransform.js'),
    // If importing any other file format, it will return its own file name
    '^(?!.*\\.(js|jsx|css|json)$)': path.resolve(__dirname, '..', 'config', 'fileTransform.js')
  },
  collectCoverageFrom: ['src/**/*.{js,jsx,mjs}'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  moduleFileExtensions: ['web.js', 'js', 'json', 'web.jsx', 'jsx', 'node']
};

// Fetching custom config
let customConfig = {};

// First, check if there is a config in the package.json
const packageJson = require(path.resolve(appDirectory, 'package.json'));
if (packageJson.jest) {
  customConfig = packageJson.jest;
} else if (fs.existsSync(path.resolve(appDirectory, 'jest.config.js'))) {
  customConfig = require(path.resolve(appDirectory, 'jest.config.js'));
}

argv.push('--config', JSON.stringify(Object.assign({}, defaultConfig, customConfig)));

jest.run(argv);
