#!/usr/bin/env node
const meow = require('meow');
const program = require('./program');
const path = require('path');
const fs = require('fs');

const helpText = `
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
`;

const config = {
  flags: {
    config: {
      type: 'string',
      alias: 'c',
    },
    json: {
      type: 'boolean',
      default: false,
    },
    verbose: {
      type: 'boolean',
      alias: 'v',
      default: false,
    },
  },
};

const cli = meow(helpText, config);

// generate program config
const configPath = cli.flags.config;
const programConfig = {
  ignore: [],
  parserConfig: {},
  pkg: './package.json',
  json: cli.flags.json,
  verbose: cli.flags.verbose,
};
if (configPath) {
  const absoluteConfigPath = path.resolve('./', configPath);
  const configFile = require(absoluteConfigPath);
  Object.assign(programConfig, configFile);
} else {
  // check for implicit config file
  const implicitPath = './rd.config.js';
  try {
    const stat = fs.statSync(implicitPath);
    if (stat.isFile()) {
      const configFile = require(path.resolve(implicitPath));
      Object.assign(programConfig, configFile);
    }
  } catch (err) {
    // no-op
  }
}

if (!cli.input[0]) {
  console.error(
    '\x1b[31m%s\x1b[0m',
    'Unable to parse target directory. Did you forget to specify the path?'
  );
  console.error(helpText);
  process.exit(0);
}

// run program
program(programConfig, cli.input[0]);
