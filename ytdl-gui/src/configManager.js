/**
 * Configuration Manager for YTDL GUI
 * Handles reading and writing user configuration to a JSON file
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Config file path - stored in user's app data directory
const configDir = path.join(app.getPath('userData'), 'config');
const configFile = path.join(configDir, 'config.json');

// Default configuration
const defaultConfig = {
  // Paths
  ytdlExecPath: '',
  saveDestinyDirPath: '',
  
  // Download options
  transformMP3: false,
  
  // UI preferences
  theme: 'light',
  language: 'en',
  windowSize: {
    width: 800,
    height: 600
  },
  
  // Advanced options
  autoUpdate: true,
  showLogs: true,
  logLevel: 'info'
};

/**
 * Initialize config directory and file
 */
function initializeConfig() {
  try {
    // Create config directory if it doesn't exist
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Create default config file if it doesn't exist
    if (!fs.existsSync(configFile)) {
      fs.writeFileSync(configFile, JSON.stringify(defaultConfig, null, 2));
      console.log('[CONFIG] Created default config file at:', configFile);
    }
  } catch (error) {
    console.error('[CONFIG] Error initializing config:', error);
  }
}

/**
 * Read configuration from file
 * @returns {Object} Configuration object
 */
function readConfig() {
  try {
    if (!fs.existsSync(configFile)) {
      initializeConfig();
    }
    
    const rawData = fs.readFileSync(configFile, 'utf8');
    const config = JSON.parse(rawData);
    
    // Merge with defaults to ensure all keys exist
    return { ...defaultConfig, ...config };
  } catch (error) {
    console.error('[CONFIG] Error reading config:', error);
    return { ...defaultConfig };
  }
}

/**
 * Write configuration to file
 * @param {Object} config - Configuration object to save
 * @returns {Boolean} True if successful
 */
function writeConfig(config) {
  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    console.log('[CONFIG] Configuration saved successfully');
    return true;
  } catch (error) {
    console.error('[CONFIG] Error writing config:', error);
    return false;
  }
}

/**
 * Get a specific config value
 * @param {String} key - Configuration key (supports dot notation: "key.nested.value")
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Configuration value
 */
function getConfig(key, defaultValue = null) {
  const config = readConfig();
  
  if (!key) {
    return config;
  }
  
  const keys = key.split('.');
  let value = config;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return defaultValue;
    }
  }
  
  return value;
}

/**
 * Set a specific config value
 * @param {String} key - Configuration key (supports dot notation: "key.nested.value")
 * @param {*} value - Value to set
 * @returns {Boolean} True if successful
 */
function setConfig(key, value) {
  const config = readConfig();
  
  if (!key) {
    return writeConfig(value);
  }
  
  const keys = key.split('.');
  let current = config;
  
  // Navigate/create nested structure
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in current) || typeof current[k] !== 'object') {
      current[k] = {};
    }
    current = current[k];
  }
  
  // Set the value
  current[keys[keys.length - 1]] = value;
  
  return writeConfig(config);
}

/**
 * Reset configuration to defaults
 * @returns {Boolean} True if successful
 */
function resetConfig() {
  return writeConfig({ ...defaultConfig });
}

/**
 * Export functions for use in main process
 */
module.exports = {
  initializeConfig,
  readConfig,
  writeConfig,
  getConfig,
  setConfig,
  resetConfig,
  configFile,
  configDir,
  defaultConfig
};
