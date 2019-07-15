#!/usr/bin/env node
'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

// We force the output to be with colors
process.env.FORCE_COLOR = 1;

const jest = require('jest');
const path = require('path');
const { execSync } = require('child_process');

const { options, jestOptions, optionsToArgv } = require('../config/argv');

// Ensure environment variables are read.
require('../config/env');

function isInGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function isInMercurialRepository() {
  try {
    execSync('hg --cwd . root', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Watch unless on CI, in coverage mode, explicitly adding `--no-watch`,
// or explicitly running all tests
if (process.env.CI !== 'true' && !options.noWatch) {
  if (options.watchAll) {
    jestOptions.watchAll = true;
  } else if (!isInGitRepository() && !isInMercurialRepository()) {
    jestOptions.watchAll = true;
  } else {
    jestOptions.watch = true;
  }
}

jestOptions.config = require('../config/createJestConfig');

// // This is a very dirty workaround for https://github.com/facebook/jest/issues/5913.
// // We're trying to resolve the environment ourselves because Jest does it incorrectly.
// // TODO: remove this as soon as it's fixed in Jest.
const resolve = require('resolve');
function resolveJestDefaultEnvironment(name) {
  const jestDir = path.dirname(
    resolve.sync('jest', {
      basedir: __dirname
    })
  );
  const jestCLIDir = path.dirname(
    resolve.sync('jest-cli', {
      basedir: jestDir
    })
  );
  const jestConfigDir = path.dirname(
    resolve.sync('jest-config', {
      basedir: jestCLIDir
    })
  );
  return resolve.sync(name, {
    basedir: jestConfigDir
  });
}

const env = options.env || 'jsdom';
let resolvedEnv;
try {
  resolvedEnv = resolveJestDefaultEnvironment(`jest-environment-${env}`);
} catch (e) {
  // ignore
}
if (!resolvedEnv) {
  try {
    resolvedEnv = resolveJestDefaultEnvironment(env);
  } catch (e) {
    // ignore
  }
}
jestOptions.env = resolvedEnv || env;

jest.run(optionsToArgv(jestOptions));
