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

module.exports = { loadConfig };

