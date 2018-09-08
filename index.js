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
};
if (configPath) {
  const absoluteConfigPath = path.resolve('./', configPath);
  const configFile = require(absoluteConfigPath);
  Object.assign(programConfig, configFile);
} else {
  // check for implicit config file
  const implicitPath = './rd.config.js';
  const stat = fs.statSync(implicitPath);
  if (stat.isFile()) {
    const configFile = require(path.resolve(implicitPath));
    Object.assign(programConfig, configFile);
  }
}

if (!cli.input[0]) {
  console.error(helpText);
  process.exit(0);
}

// run program
program(programConfig, cli.input[0]);
