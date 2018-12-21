#!/usr/bin/env node
const path = require('path');
const arg = require('arg');
const fs = require('fs');
const exec = require('child_process').exec;


const spec = {
  '--force': Boolean,
  '--version': Boolean,
  '--help': Boolean,
  '-v': '--version',
  '-h': '--help',
};

const args = arg(spec);
const [command, ...commands] = args._;

const init = () => {
  const [projectName = '.'] = commands;
  const dir = path.join(__dirname, projectName);

  if (fs.existsSync(dir)) {
    if (fs.readdirSync(dir).length > 0) {
      return console.log('directory not empty');
    }
  } else {
    fs.mkdirSync(dir);
  }
  console.log('please wait while installing...');
  const npm = exec(`cd ${dir}; npm init -y >/dev/null; npm install -S @primecms/core @primecms/ui`);
  npm.stdout.pipe(process.stdout);
  console.log('')
  console.log('installation finished');
  console.log(`cd ./${projectName}`);
  console.log('npx primecms start');
};

(() => {
  if (command) {
    switch (command) {
      case 'init':
        return init();
      case 'start':
        return require('./lib/index.js');

      case 'db:seed':
        return require('./lib/db/seed.js');

      case 'db:init':
        return require('./lib/db/init.js');
    }
  }
  if (args['--version']) {
    return console.log(require('./package.json').version);
  }

  if (args['--help'] || !command) {
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
