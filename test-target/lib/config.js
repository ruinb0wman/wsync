const fs = require('fs');
const path = require('path');

function loadConfig() {
  const configPath = path.join(process.cwd(), '.sync.config.json');
  if (!fs.existsSync(configPath)) {
    console.error('.sync.config.json not found! Run `wsync init` first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function initConfig() {
  const configPath = path.join(process.cwd(), '.sync.config.json');
  if (fs.existsSync(configPath)) {
    console.error('.sync.config.json already exists!');
    process.exit(1);
  }

  const defaultConfig = {
    include: [
      "src/**/*",
      "public/**/*"
    ],
    exclude: [
      "node_modules",
      "dist"
    ],
    target: "/mnt/d/Workspace/yourproject/"
  };

  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  console.log('Created .sync.config.json with default settings.');
}

module.exports = { loadConfig, initConfig };

