const { loadConfig } = require('./config');
const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');

async function syncFiles(specificFile = null) {
  // Handle commander.js passing options object as first parameter
  const actualSpecificFile = (specificFile && typeof specificFile === 'string') ? specificFile : null;

  const config = loadConfig();
  console.log('Syncing files...');

  try {
    let files = [];
    if (actualSpecificFile) {
      files = [actualSpecificFile];
    } else {
      // Convert exclude patterns to proper glob format (e.g., "node_modules" -> "node_modules/**")
      const ignorePatterns = config.exclude.map(pattern =>
        pattern.endsWith('**') ? pattern : `${pattern}/**`
      );

      // Process each include pattern separately and combine results
      for (const pattern of config.include) {
        const patternFiles = await glob(pattern, {
          ignore: ignorePatterns,
          nodir: true,
          absolute: true
        });
        files = files.concat(patternFiles);
      }
      // Remove duplicates
      files = [...new Set(files)];
    }

    // Ensure target directory exists
    await fs.ensureDir(config.target);

    // Sync each file
    for (const file of files) {
      const relativePath = path.relative(process.cwd(), file);
      const targetPath = path.join(config.target, relativePath);

      // If relativePath has .. then the file is outside the current directory
      if (relativePath.startsWith('..')) {
        console.error(`File ${file} is outside current directory: ${relativePath}`);
        continue;
      }

      // Make sure targetPath is a string and that the directory exists
      if (typeof targetPath === 'string' && targetPath && typeof file === 'string' && file) {
        const targetDir = path.dirname(targetPath);

        if (typeof targetDir === 'string' && targetDir) {
          await fs.ensureDir(targetDir);
          await fs.copy(file, targetPath);
          console.log(`Synced: ${file} → ${targetPath}`);
        } else {
          console.error(`Invalid target directory: ${targetDir}`);
        }
      } else {
        console.error(`Invalid parameters: file=${file}(${typeof file}), targetPath=${targetPath}(${typeof targetPath})`);
      }
    }

    // Clean up deleted files in target (only if not syncing a specific file)
    if (!specificFile) {
      // Check if target directory exists before trying to read it
      if (await fs.pathExists(config.target)) {
        // Get all files in target directory recursively
        const targetGlobPattern = path.join(config.target, "**", "*");
        const allTargetFiles = await glob(targetGlobPattern, {
          nodir: true,
          absolute: true
        });

        // Calculate expected target file paths from source files
        const expectedTargetFiles = files.map(file => {
          const relativePath = path.relative(process.cwd(), file);
          return path.join(config.target, relativePath);
        });

        // Remove files in target that are not in the source
        for (const targetFile of allTargetFiles) {
          if (!expectedTargetFiles.includes(targetFile)) {
            await fs.remove(targetFile);
            console.log(`Removed: ${targetFile}`);
          }
        }
      }
    }

    console.log('Sync completed successfully.');
  } catch (error) {
    console.error(`Sync failed: ${error.message}`);
  }
}

module.exports = { syncFiles };
