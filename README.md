# Jest Run

This package is a Jest test runner using default configs similar to Create React App.

We assume that you tests are included inside the `src` folder just as CRA does, but all this can be configured.

All documentation regarding Jest can be found [here](https://facebook.github.io/jest).

## Install

```bash
# Using NPM
npm i -D jest-run

# Using Yarn
yarn add -D jest-run
```

## Running the tests

To run your tests, just add a new script in your `package.json` and run the test command:

```js
// package.json
{
  "scripts": {
    "test": "jest-run --env=jsdom"
  }
}
```

```bash
npm test
```

Remove `--env=jsdom` if you do not run tests that need a `document` nor a `window` object defined - e.g. node tests.

## Watch mode

By default running tests runs the watcher with interactive CLI. However, you can force it to run tests once and finish the process by setting an environment variable called CI.

Popular CI servers already set the environment variable CI by default but you can do this yourself too:

##### Windows (cmd.exe)

```cmd
set CI=true&&npm test
```

(Note: the lack of whitespace is intentional.)

##### Windows (Powershell)

```Powershell
($env:CI = $true) -and (npm test)
```

##### Linux, macOS (Bash)

```bash
CI=true npm test
```

## Initializing Test Environment

If your app uses a browser API that you need to mock in your tests or if you just need a global setup before running your tests, add a `src/setupTests.js` to your project. It will be automatically executed before running your tests.

For example:

```js
// src/setupTests.js
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;
```

## Importing non-JS files

More and more in your application you import files that are not readable by NodeJS like images, fonts, CSS, ... and this breaks the environment when running tests.

By default with this runner we:

* process any `.js|.jsx` files using babel so you can use newer JS syntax
* return an empty object when you import a `.css` file
* return the file name as a string when it is any other file type

## Custom configuration

If you wish to customize the Jest configuration even more, you can overwrite rules by adding a `jest` object to your `package.json` or creating a `jest.config.js`:

```js
// package.json
{
  "name": "my-project",
  "jest": {
    "verbose": true
  }
}
```

```js
// jest.config.js
module.exports = {
  verbose: true
};
```

Jest configuration properties can be found [here](https://facebook.github.io/jest/docs/en/configuration.html).
