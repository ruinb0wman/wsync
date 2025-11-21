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
    usePolling: true,  // More reliable for WSL/Windows file system
    atomic: true,      // Handle atomic saves
    awaitWriteFinish: {
      stabilityThreshold: 500,  // Increased threshold
      pollInterval: 100
    },
    ignorePermissionErrors: true
  });

  watcher
    .on('add', (file) => {
      console.log(`File added: ${file}`);
      syncFiles(file);
    })
    .on('change', async (file) => {
      console.log(`File changed: ${file}`);
      try {
        // Verify file still exists before syncing
        await fs.access(file, fs.constants.F_OK);
        syncFiles(file);
      } catch (err) {
        console.log(`File ${file} temporarily unavailable, will retry...`);
        // Wait and retry once
        setTimeout(() => {
          fs.access(file, fs.constants.F_OK)
            .then(() => syncFiles(file))
            .catch(() => console.log(`File ${file} no longer exists`));
        }, 300);
      }
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
    .on('error', (error) => {
      console.error(`Watcher error: ${error}`);
    });

  process.on('SIGINT', () => {
    watcher.close();
    process.exit();
  });
}

module.exports = { watchFiles };
