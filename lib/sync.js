const { loadConfig } = require('./config');
const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');

async function syncFiles(specificFile = null) {
  const config = loadConfig();
  console.log('Syncing files...');

  try {
    const files = specificFile ? [specificFile] : await glob(config.include, { ignore: config.exclude, nodir: true });

    // Ensure target directory exists
    await fs.ensureDir(config.target);

    // Sync each file
    for (const file of files) {
      const relativePath = path.relative(process.cwd(), file);
      const targetPath = path.join(config.target, relativePath);
      await fs.ensureDir(path.dirname(targetPath));
      await fs.copy(file, targetPath);
      console.log(`Synced: ${file} → ${targetPath}`);
    }

    // Clean up deleted files in target (only if not syncing a specific file)
    if (!specificFile) {
      const targetFiles = await fs.readdir(config.target);
      for (const targetFile of targetFiles) {
        const sourcePath = path.join(config.target, targetFile);
        if (!files.some(file => path.basename(file) === targetFile)) {
          await fs.remove(sourcePath);
          console.log(`Removed: ${sourcePath}`);
        }
      }
    }

    console.log('Sync completed successfully.');
  } catch (error) {
    console.error(`Sync failed: ${error.message}`);
  }
}

module.exports = { syncFiles };
