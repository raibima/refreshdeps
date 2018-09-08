const globby = require('globby');
const fs = require('fs');
const path = require('path');
const babel = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const semver = require('semver');
const axios = require('axios').default;
const ora = require('ora');
const Table = require('easy-table');

module.exports = function(config, targetGlob) {
  const spinner = ora('Analyzing dependencies');
  if (!config.verbose) {
    spinner.start();
  }

  const files = globby.sync(targetGlob, {
    ignore: config.ignore,
    expandDirectories: {
      extensions: ['js', 'jsx'],
    },
  });

  function log(str) {
    if (config.verbose) {
      console.log(str);
    }
  }

  const pkg = require(path.resolve(config.pkg));
  const pkgDeps = pkg.dependencies;

  const deps = new Set();
  files.forEach((f) => {
    log(`Traversing ${f}`);
    const content = fs.readFileSync(f, 'utf-8');

    try {
      const ast = babel.parse(content, {
        sourceType: 'module',
        ...config.parserConfig,
      });
      traverse(ast, {
        ImportDeclaration(path) {
          const dep = path.node.source.value;
          if (!dep.startsWith('./')) {
            const depName = dep.split('/')[0];
            log(`Found dependency ${depName} in ${f}`);
            if (pkgDeps[depName]) {
              deps.add(depName);
            }
          }
        },
      });
    } catch (err) {
      if (/sourceType/.test(err.message)) {
        console.error(`Unable to parse ${f}: ${err.message}`);
      } else {
        console.error(
          `Unable to parse ${f}: ${err.message}. ` +
            `You may need some additional plugins to parse this source file. `
        );
        console.error(
          `See: https://babeljs.io/docs/en/next/babel-parser.html#plugins`
        );
      }
      process.exit(0);
    }
  });

  const depArray = Array.from(deps);
  const result = depArray.reduce((res, dep) => {
    return Object.assign(res, {
      [dep]: {
        local: pkgDeps[dep].replace('^', ''),
      },
    });
  }, {});

  // fetch latest package version from npm
  function fetchLatest(package) {
    return axios
      .get(`https://www.npmjs.com/package/${package}`, {
        headers: {
          'x-spiferack': '1',
        },
      })
      .then(
        (res) => {
          try {
            const remoteVersion = res.data.packument.distTags.latest;
            const localVersion = result[package].local;
            const safeLocalVersion =
              localVersion.split('.').length === 1
                ? `${localVersion}.0.0`
                : localVersion;

            result[package].remote = remoteVersion;
            result[package].isOutdated = semver.gt(
              remoteVersion,
              safeLocalVersion
            );
          } catch (err) {
            console.error(
              'TypeError: unable to fetch remote version. ' +
                'This is most likely a problem with npm API.'
            );
            process.exit(0);
          }
        },
        (err) => {
          console.error(
            'NetworkError: unable to fetch remote version. ' +
              'Please check your internet connection'
          );
          process.exit(0);
        }
      );
  }

  spinner.text = 'Fetching latest package versions from npm';
  log(spinner.text);
  const fetchers = depArray.map(fetchLatest);
  Promise.all(fetchers).then(() => {
    spinner.stop();
    if (config.json) {
      reportJson(result);
    } else {
      reportTable(result);
    }
  });
};

function reportTable(result) {
  const t = new Table();
  for (const [pkgName, data] of Object.entries(result)) {
    t.cell('Dependency', pkgName);
    t.cell('Local version', data.local);
    t.cell('Latest version', data.remote);
    t.cell('Outdated', String(data.isOutdated));
    t.cell(
      'Actionable',
      data.isOutdated ? `Upgrade to ${data.remote}` : 'None'
    );
    t.newRow();
  }
  console.log();
  console.log(t.toString());
}

function reportJson(result) {
  console.log(JSON.stringify(result));
}
