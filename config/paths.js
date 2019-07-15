'use strict';

const fs = require('fs');
const path = require('path');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveFile = relativePath => path.resolve(appDirectory, relativePath);

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx'
];

// Resolve file paths in the same order as webpack
const resolveModule = filePath => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFile(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFile(`${filePath}.${extension}`);
  }

  return resolveFile(`${filePath}.js`);
};

module.exports.resolveFile = resolveFile;
module.exports.resolveModule = resolveModule;
module.exports.moduleFileExtensions = moduleFileExtensions;
