const { argv } = require('yargs');
const kebabCase = require('lodash.kebabcase');

const argvKnowKeys = ['_', '$0'];

const JestRunOptionsKeys = ['config', 'noWatch', 'watchAll', 'dir', 'env', 'config'];
const JestRunOptions = JestRunOptionsKeys.reduce((acc, key) => ({ ...acc, [key]: argv[key] }), {});

const jestOptionsKeys = Object.keys(argv).filter(
  key => ![...argvKnowKeys, ...JestRunOptionsKeys].includes(key)
);
const jestOptions = jestOptionsKeys.reduce((acc, key) => ({ ...acc, [key]: argv[key] }), {});

function optionsToArgv(options) {
  const argv = [];

  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      argv.push(`--${kebabCase(key)}`);

      if (typeof value === 'string') {
        argv.push(value);
      } else if (typeof value === 'number') {
        argv.push(value.toString());
      } else if (typeof value === 'object') {
        argv.push(JSON.stringify(value));
      }
    }
  });

  return argv;
}

module.exports = {
  options: JestRunOptions,
  jestOptions,
  optionsToArgv
};
