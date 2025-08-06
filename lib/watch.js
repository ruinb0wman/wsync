const chokidar = require('chokidar');
const { loadConfig } = require('./config');
const { syncFiles } = require('./sync');
const path = require('path');
const fs = require('fs-extra');

function watchFiles() {
  const config = loadConfig();
  console.log('Watching for changes...');

  const watcher = chokidar.watch(config.include, {
    ignored: config.exclude,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100
    }
  });

  watcher
    .on('add', (file) => {
      console.log(`File added: ${file}`);
      syncFiles(file);
    })
    .on('change', (file) => {
      console.log(`File changed: ${file}`);
      syncFiles(file);
    })
    .on('unlink', (file) => {
      console.log(`File removed: ${file}`);
      // Handle deletion by removing the corresponding file in the target
      const config = loadConfig();
      const relativePath = path.relative(process.cwd(), file);
      const targetPath = path.join(config.target, relativePath);
      fs.remove(targetPath)
        .then(() => console.log(`Removed: ${targetPath}`))
        .catch(error => console.error(`Failed to remove ${targetPath}: ${error.message}`));
    })
    .on('change', (file) => {
      console.log(`File changed: ${file}`);
      const config = loadConfig();
      const relativePath = path.relative(process.cwd(), file);
      const targetPath = path.join(config.target, relativePath);
      fs.copy(file, targetPath)
        .then(() => console.log(`Updated: ${targetPath}`))
        .catch(error => console.error(`Failed to update ${targetPath}: ${error.message}`));
    })
    .on('error', (error) => {
      console.error(`Watcher error: ${error}`);
    });

  process.on('SIGINT', () => {
    watcher.close();
    process.exit();
  });
}

module.exports = { watchFiles };
