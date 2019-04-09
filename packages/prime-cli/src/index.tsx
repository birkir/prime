#!/usr/bin/env node
import meow from 'meow';
import { initCommand } from './commands/init';
import { startCommand } from './commands/start';

const cli = meow(
  `
    Usage
      $ primecms <command>

    Flags
      --help
      --debug

    Commands
      init
      init <projectName>
      start

    Examples
      $ primecms init example
      $ primecms start
`
);

switch (cli.input[0]) {
  case 'init':
    initCommand(cli);
    break;
  case 'start':
    startCommand(cli);
    break;
  default:
    console.log(cli.help); // tslint:disable-line no-console
    process.exit();
}
