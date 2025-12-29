# Configuration System Documentation

Your YTDL GUI application now has a complete configuration management system that automatically saves and loads user settings.

## Overview

The configuration system stores user settings in a `config.json` file located in the application's data directory. The system is divided into three main components:

1. **configManager.js** - Main configuration handler (Main Process)
2. **configHelper.js** - User-friendly API for the renderer (Renderer Process)
3. **preload.js** - IPC bridge between processes

## Configuration File Location

The `config.json` file is automatically created in:
- **Windows**: `C:\Users\[YourUsername]\AppData\Roaming\ytdl-gui\config\config.json`
- **Linux**: `~/.config/ytdl-gui/config/config.json`
- **macOS**: `~/Library/Application Support/ytdl-gui/config/config.json`

## Default Configuration

```json
{
  "ytdlExecPath": "",
  "saveDestinyDirPath": "",
  "transformMP3": false,
  "theme": "light",
  "language": "en",
  "windowSize": {
    "width": 800,
    "height": 600
  },
  "autoUpdate": true,
  "showLogs": true,
  "logLevel": "info"
}
```

## Usage Examples

### In Renderer Process (HTML/JavaScript)

The `appConfig` object is globally available in your HTML files. Include the helper script in your HTML:

```html
<script src="configHelper.js"></script>
```

#### Getting Configuration

```javascript
// Get a specific value
const ytdlPath = await appConfig.getYtdlPath();
const saveDir = await appConfig.getSaveDir();

// Get using dot notation (nested values)
const theme = await appConfig.get('theme');
const windowWidth = await appConfig.get('windowSize.width');

// Get all configuration
const allConfig = await appConfig.getAll();
```

#### Setting Configuration

```javascript
// Set specific values
await appConfig.setYtdlPath('C:\\path\\to\\youtube-dl.exe');
await appConfig.setSaveDir('D:\\Downloads');
await appConfig.setTransformMP3(true);

// Set using dot notation
await appConfig.set('theme', 'dark');
await appConfig.set('windowSize.width', 1024);
await appConfig.set('windowSize.height', 768);
```

#### Convenience Methods

```javascript
// Paths
appConfig.getYtdlPath()        // Get youtube-dl path
appConfig.setYtdlPath(path)    // Set youtube-dl path
appConfig.getSaveDir()         // Get save directory
appConfig.setSaveDir(path)     // Set save directory

// Download options
appConfig.getTransformMP3()    // Get MP3 conversion setting
appConfig.setTransformMP3(true) // Enable MP3 conversion

// UI preferences
appConfig.getTheme()           // Get current theme
appConfig.setTheme('dark')     // Set theme
appConfig.getLanguage()        // Get language
appConfig.setLanguage('es')    // Set language
appConfig.getWindowSize()      // Get window size
appConfig.setWindowSize(1024, 768) // Set window size
```

### In Main Process (Node.js)

```javascript
const { getConfig, setConfig } = require('./configManager');

// Synchronous operations in main process
const ytdlPath = getConfig('ytdlExecPath');
const theme = getConfig('theme', 'light'); // with default value

// Set values
setConfig('ytdlExecPath', 'C:\\path\\to\\youtube-dl.exe');
setConfig('theme', 'dark');

// Nested values
const windowSize = getConfig('windowSize');
setConfig('windowSize.width', 1024);
```

## Real-World Example

Here's an example of how to use the config system in your application:

```javascript
// In your render.js or HTML

// Load saved settings when app starts
async function loadSettings() {
  const ytdlPath = await appConfig.getYtdlPath();
  const saveDir = await appConfig.getSaveDir();
  const shouldTransformMP3 = await appConfig.getTransformMP3();
  
  // Update UI with saved settings
  document.getElementById('ytdlRoute').textContent = ytdlPath || 'Select...';
  document.getElementById('downloadedFilesRoute').textContent = saveDir || 'Select...';
  document.getElementById('transformMP3').checked = shouldTransformMP3;
}

// Save settings when user makes changes
async function onYtdlPathSelected(path) {
  await appConfig.setYtdlPath(path);
}

async function onSaveDirSelected(path) {
  await appConfig.setSaveDir(path);
}

document.getElementById('transformMP3').addEventListener('change', async (e) => {
  await appConfig.setTransformMP3(e.target.checked);
});

// Load settings on startup
loadSettings();
```

## Adding Custom Configuration Values

To add new configuration settings:

1. **Add to default config** in `configManager.js`:
```javascript
const defaultConfig = {
  // existing settings...
  myNewSetting: 'default value',
  myNestedSetting: {
    subKey: 'value'
  }
};
```

2. **Add convenience method** in `configHelper.js` (optional):
```javascript
getMyNewSetting() {
  return this.get('myNewSetting');
},

setMyNewSetting(value) {
  return this.set('myNewSetting', value);
}
```

3. **Use in your code**:
```javascript
// Using dot notation
await appConfig.get('myNewSetting');
await appConfig.set('myNewSetting', 'new value');

// Or using convenience method
await appConfig.getMyNewSetting();
await appConfig.setMyNewSetting('new value');
```

## Automatic Saving

Configuration is automatically saved to disk when:
- User selects a directory or file via the file dialog
- Download options are changed
- Any configuration is set via the `setConfig()` or `appConfig.set()` methods

## Accessing Config File Directly

If you need to access the config file path programmatically:

```javascript
// In main process
const { configFile, configDir } = require('./configManager');

console.log('Config file:', configFile);
console.log('Config directory:', configDir);
```

## Resetting Configuration

To reset configuration to defaults:

```javascript
// In main process
const { resetConfig } = require('./configManager');
resetConfig();
```

Or through IPC from renderer (add handler as needed).

## Error Handling

The configuration system handles errors gracefully:
- If the config file is corrupted, it returns default values
- If writing fails, it logs an error and returns false
- Directory creation is automatic and recursive

Example error handling:

```javascript
try {
  const success = await appConfig.set('myKey', 'myValue');
  if (!success) {
    console.error('Failed to save configuration');
  }
} catch (error) {
  console.error('Config error:', error);
}
```

## Tips & Best Practices

1. **Always await promises**: Configuration operations are asynchronous in the renderer process
2. **Use dot notation**: For nested values like `'windowSize.width'`
3. **Set defaults**: Use `getConfig(key, defaultValue)` in main process
4. **Check for null**: Settings might not be set initially, provide fallbacks
5. **Batch updates**: If updating multiple settings, consider doing them sequentially
6. **Cache values**: Store frequently accessed settings in variables to reduce IPC calls

Example:

```javascript
// Good - cache to avoid multiple IPC calls
let theme = await appConfig.getTheme();
function applyTheme() {
  // Use cached theme variable
}

// Less efficient - repeated IPC calls
function applyTheme() {
  const theme = await appConfig.getTheme();
}
```

## Troubleshooting

**Config not persisting?**
- Check file permissions in AppData folder
- Ensure config directory is writable
- Check console for error messages

**Can't read config?**
- Verify the config.json file exists
- Check JSON syntax if editing manually
- Look at logs in DevTools console

**Config file location**
- Open "Run" dialog (Win+R) and type: `%APPDATA%\ytdl-gui\config\`
