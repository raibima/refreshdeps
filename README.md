# refreshdeps

> A CLI utility that helps identify outdated dependencies in your JS project.

## Install

```
$ npm i -g refreshdeps
```

## Usage

```
$ refreshdeps --help

  Check for outdated packages in your JS project.

  Usage
    $ refreshdeps [options] <path>      run refreshdeps on the given path / glob pattern

  Options:
    --config, -c <path>   Path to refreshdeps config file
    --json                Use JSON output
    --verbose, -v         Verbose output
    --help                Prints help
    --version             Prints current version

  Examples:
    $ refreshdeps src
    $ refreshdeps "src/**/user/**/*.js"
    $ refreshdeps --config config/rd.config.js "src/**/components/**/*.js"


$ refreshdeps "src/**/flight/**/*.js"

Dependency               Local version  Latest version  Outdated  Actionable
-----------------------  -------------  --------------  --------  -----------------
react-loadable           5.3.1          5.5.0           true      Upgrade to 5.5.0
react                    16.4.0         16.5.0          true      Upgrade to 16.5.0
react-dom                16.4.0         16.5.0          true      Upgrade to 16.5.0
react-redux              5.0.5          5.0.7           true      Upgrade to 5.0.7
react-router-dom         4.2.0          4.3.1           true      Upgrade to 4.3.1
fuse.js                  3.2.0          3.2.1           true      Upgrade to 3.2.1
react-helmet             5.1.3          5.2.0           true      Upgrade to 5.2.0
classnames               2.2.5          2.2.6           true      Upgrade to 2.2.6
react-no-ssr             1.1.0          1.1.0           false     None
axios                    0.16.2         0.18.0          true      Upgrade to 0.18.0
```

## Configuration file

By default, refreshdeps will look for a file named `rd.config.js` in the current directory. However, you can also specify your config path manually by giving `--config` option when invoking the program.

```js
module.exports = {
  // List of ignored paths
  //
  // default: []
  ignore: ['**/__tests__/*.js'],

  // Config passed to the parser (@babel/parser).
  // See: https://babeljs.io/docs/en/next/babel-parser.html#options
  //
  // default: {
  //   sourceType: 'module',
  //   plugins: []
  // }
  parserConfig: {
    sourceType: 'module',
    plugins: ['jsx', 'flow'],
  },

  // Path to your package.json file.
  // This will be used for local version lookup.
  //
  // default: './package.json'
  pkg: '../package.json',
};
```

## License

MIT
