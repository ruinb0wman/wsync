const { loadConfig } = require('./config');

function checkConfig() {
  try {
    loadConfig();
    console.log('Config is valid');
  } catch (error) {
    console.error('Config is invalid:', error.message);
    process.exit(1);
  }
}

module.exports = { checkConfig };

