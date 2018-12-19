#!/usr/bin/env node
const arg = require('arg');

const spec = {
  '--force': Boolean,
  '--version': Boolean,
  '--help': Boolean,
  '-v': '--version',
  '-h': '--help',
};

const args = arg(spec);
const [command] = args._;

(() => {
  if (command) {
    switch (command) {
      case 'start':
        return require('./lib/index.js');

      case 'db:seed':
        return require('./lib/migrations/seed.js');

      case 'db:init':
        return require('./lib/migrations/init.js');
    }
  }
  if (args['--version']) {
    return console.log(require('./package.json').version);
  }

  if (args['--help']) {
    return console.log(`Usage: primecms [command] [options]
        primecms start

  Options:
    start                      start primecms
    init <projectName>         generates a new project and installs its dependencies
    db:seed                    seed database with dummy data
    db:init                    initialize database
    -v, --version              print version
    -h, --help                 print help

  Documentation can be found at https://birkir.github.io/prime`);
  }

  return console.log('primecms: illegal command - ' + command);
})();
