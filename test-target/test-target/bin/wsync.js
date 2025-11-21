#!/usr/bin/env node

const { program } = require('commander');
const { initConfig } = require('../lib/config');
const { syncFiles } = require('../lib/sync');
const { watchFiles } = require('../lib/watch');
const { checkConfig } = require('../lib/check');

program
  .command('init')
  .description('Initialize a .sync.config.json file')
  .action(initConfig);

program
  .command('sync')
  .description('Perform a one-time sync')
  .action(syncFiles);

program
  .command('watch')
  .description('Watch for changes and sync automatically')
  .action(watchFiles);

program
  .command('check')
  .description('Validate the .sync.config.json file')
  .action(checkConfig);

program.parse(process.argv);
