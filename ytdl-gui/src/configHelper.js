/**
 * Config Helper for Renderer Process
 * Provides easy-to-use functions to interact with application configuration
 * 
 * Usage:
 * - appConfig.get('key') - Get a config value
 * - appConfig.set('key', value) - Set a config value
 * - appConfig.getAll() - Get all config
 */

const appConfig = {
  /**
   * Get a configuration value
   * @param {String} key - Config key (supports dot notation: "key.nested.value")
   * @returns {Promise} Promise that resolves with the config value
   */
  get(key) {
    return new Promise((resolve) => {
      const handler = (evt) => {
        if (evt.data.type === 'config-response') {
          window.removeEventListener('message', handler);
          resolve(evt.data.data);
        }
      };
      window.addEventListener('message', handler);
      window.postMessage({
        type: 'config-get',
        key: key
      });
    });
  },

  /**
   * Set a configuration value
   * @param {String} key - Config key (supports dot notation: "key.nested.value")
   * @param {*} value - Value to set
   * @returns {Promise} Promise that resolves with success status
   */
  set(key, value) {
    return new Promise((resolve) => {
      const handler = (evt) => {
        if (evt.data.type === 'config-save-response') {
          window.removeEventListener('message', handler);
          resolve(evt.data.success);
        }
      };
      window.addEventListener('message', handler);
      window.postMessage({
        type: 'config-set',
        key: key,
        value: value
      });
    });
  },

  /**
   * Get all configuration
   * @returns {Promise} Promise that resolves with the entire config object
   */
  getAll() {
    return new Promise((resolve) => {
      const handler = (evt) => {
        if (evt.data.type === 'config-response') {
          window.removeEventListener('message', handler);
          resolve(evt.data.data);
        }
      };
      window.addEventListener('message', handler);
      window.postMessage({
        type: 'config-read-all'
      });
    });
  },

  /**
   * Convenience methods for common settings
   */

  // Paths
  setYtdlPath(path) {
    return this.set('ytdlExecPath', path);
  },

  getYtdlPath() {
    return this.get('ytdlExecPath');
  },

  setSaveDir(path) {
    return this.set('saveDestinyDirPath', path);
  },

  getSaveDir() {
    return this.get('saveDestinyDirPath');
  },

  // Download options
  setTransformMP3(enabled) {
    return this.set('transformMP3', enabled);
  },

  getTransformMP3() {
    return this.get('transformMP3');
  },

  // UI preferences
  setTheme(theme) {
    return this.set('theme', theme);
  },

  getTheme() {
    return this.get('theme');
  },

  setLanguage(language) {
    return this.set('language', language);
  },

  getLanguage() {
    return this.get('language');
  },

  setWindowSize(width, height) {
    return this.set('windowSize', { width, height });
  },

  getWindowSize() {
    return this.get('windowSize');
  }
};

// Make appConfig globally available
window.appConfig = appConfig;
