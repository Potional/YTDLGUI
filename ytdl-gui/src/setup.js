/**
 * Post-Installation Setup Script
 * Handles initial configuration of yt-dlp
 * 
 * On first run, asks user to either:
 * 1. Download latest yt-dlp from GitHub
 * 2. Browse and select existing yt-dlp.exe
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { dialog, app } = require('electron');

// Use userData directory for tools (persists across updates)
const toolsDir = path.join(app.getPath('userData'), 'tools');
const ytdlpPath = path.join(toolsDir, 'yt-dlp.exe');

/**
 * Check if yt-dlp is already installed
 */
function isYtdlpInstalled(customPath = null) {
  const checkPath = customPath || ytdlpPath;
  return fs.existsSync(checkPath);
}

/**
 * Download yt-dlp from GitHub
 */
async function downloadYtdlp(mainWindow) {
  return new Promise((resolve, reject) => {
    try {
      // Create tools directory if needed
      if (!fs.existsSync(toolsDir)) {
        fs.mkdirSync(toolsDir, { recursive: true });
      }

      console.log('[SETUP] Fetching latest yt-dlp release...');

      // Get latest release info
      const options = {
        hostname: 'api.github.com',
        path: '/repos/yt-dlp/yt-dlp/releases/latest',
        method: 'GET',
        headers: {
          'User-Agent': 'YTDL-GUI',
          'Accept': 'application/vnd.github.v3+json'
        }
      };

      const req = https.get(options, (res) => {
        let data = '';

        console.log(`[SETUP] GitHub API Response: ${res.statusCode}`);

        if (res.statusCode !== 200) {
          console.error(`[SETUP] GitHub API Error: ${res.statusCode}`);
          return resolve(false);
        }

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const release = JSON.parse(data);
            console.log(`[SETUP] Latest release: ${release.tag_name}`);

            const asset = release.assets.find(a => a.name === 'yt-dlp.exe');

            if (!asset) {
              console.error('[SETUP] yt-dlp.exe not found in release assets');
              console.log('[SETUP] Available assets:', release.assets.map(a => a.name).join(', '));
              return resolve(false);
            }

            const sizeMB = Math.round(asset.size / 1024 / 1024 * 100) / 100;
            console.log(`[SETUP] Downloading yt-dlp.exe (${sizeMB} MB)...`);
            console.log(`[SETUP] Download URL: ${asset.browser_download_url}`);

            // Download the file
            const file = fs.createWriteStream(ytdlpPath);

            const downloadReq = https.get(asset.browser_download_url, (downloadRes) => {
              console.log(`[SETUP] Download Response: ${downloadRes.statusCode}`);

              if (downloadRes.statusCode >= 300 && downloadRes.statusCode < 400 && downloadRes.headers.location) {
                // Handle redirects
                file.close();
                fs.unlink(ytdlpPath, () => { });
                console.log('[SETUP] Following redirect...');
                https.get(downloadRes.headers.location, (redirectRes) => {
                  const fileRetry = fs.createWriteStream(ytdlpPath);
                  redirectRes.pipe(fileRetry);
                  fileRetry.on('finish', () => {
                    fileRetry.close();
                    console.log('[SETUP] yt-dlp successfully downloaded!');
                    resolve(ytdlpPath);
                  });
                  fileRetry.on('error', (err) => {
                    console.error('[SETUP] Redirect download error:', err.message);
                    fs.unlink(ytdlpPath, () => { });
                    resolve(false);
                  });
                }).on('error', (err) => {
                  console.error('[SETUP] Redirect request error:', err.message);
                  fs.unlink(ytdlpPath, () => { });
                  resolve(false);
                });
                return;
              }

              downloadRes.pipe(file);

              file.on('finish', () => {
                file.close();
                console.log('[SETUP] yt-dlp successfully downloaded!');
                resolve(ytdlpPath);
              });
            });

            downloadReq.on('error', (err) => {
              console.error('[SETUP] Download request error:', err.message);
              file.close();
              fs.unlink(ytdlpPath, () => { });
              resolve(false);
            });

            file.on('error', (err) => {
              console.error('[SETUP] File write error:', err.message);
              fs.unlink(ytdlpPath, () => { });
              resolve(false);
            });

          } catch (err) {
            console.error('[SETUP] Error parsing release info:', err.message);
            console.error('[SETUP] Response data:', data.substring(0, 200));
            resolve(false);
          }
        });
      });

      req.on('error', (err) => {
        console.error('[SETUP] GitHub API request error:', err.message);
        resolve(false);
      });

      req.setTimeout(30000, () => {
        console.error('[SETUP] Request timeout');
        req.destroy();
        resolve(false);
      });

    } catch (err) {
      console.error('[SETUP] Error:', err.message);
      resolve(false);
    }
  });
}

async function showYtdlpSetupDialog(mainWindow) {
  const response = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    title: 'Setup yt-dlp',
    message: 'yt-dlp is required to download videos. What would you like to do?',
    buttons: [
      'Download Latest Version',
      'Browse for Existing yt-dlp.exe',
      'Configure Later'
    ],
    defaultId: 0,
    cancelId: 2
  });

  return response.response;
}

/**
 * Browse for existing yt-dlp.exe
 */
async function browseForYtdlp(mainWindow) {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select yt-dlp.exe',
    properties: ['openFile'],
    filters: [
      {
        name: 'Executable Files',
        extensions: ['exe']
      },
      {
        name: 'All Files',
        extensions: ['*']
      }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const selectedPath = result.filePaths[0];

  // Verify it's actually yt-dlp
  if (!selectedPath.toLowerCase().includes('yt-dlp')) {
    dialog.showErrorBox(
      'Invalid Selection',
      'Please select yt-dlp.exe file'
    );
    return null;
  }

  return selectedPath;
}

/**
 * Run complete setup for both yt-dlp
 */
async function runSetup(mainWindow, configManager) {
  try {
    // Check if yt-dlp path is already configured
    const configuredPath = configManager.getConfig('ytdlExecPath');

    if (configuredPath && isYtdlpInstalled(configuredPath)) {
      console.log('[SETUP] yt-dlp already configured');
      return configuredPath;
    }

    // Check if default location has yt-dlp
    if (isYtdlpInstalled()) {
      console.log('[SETUP] yt-dlp found in default location');
      configManager.setConfig('ytdlExecPath', ytdlpPath);
      return ytdlpPath;
    }

    // Ask user what to do
    console.log('[SETUP] yt-dlp not found. Asking user...');
    const choice = await showYtdlpSetupDialog(mainWindow);

    switch (choice) {
      case 0: // Download Latest Version
        console.log('[SETUP] User chose to download latest version');
        const downloadedPath = await downloadYtdlp(mainWindow);
        if (downloadedPath) {
          configManager.setConfig('ytdlExecPath', downloadedPath);
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Download Complete',
            message: 'yt-dlp has been successfully downloaded!',
            buttons: ['OK']
          });
          return downloadedPath;
        } else {
          dialog.showErrorBox(
            'Download Failed',
            'Failed to download yt-dlp. Please configure it manually in settings.'
          );
          return null;
        }

      case 1: // Browse for Existing
        console.log('[SETUP] User chose to browse for existing yt-dlp');
        const selectedPath = await browseForYtdlp(mainWindow);
        if (selectedPath) {
          configManager.setConfig('ytdlExecPath', selectedPath);
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Configuration Complete',
            message: `yt-dlp configured at:\n${selectedPath}`,
            buttons: ['OK']
          });
          return selectedPath;
        }
        return null;

      case 2: // Configure Later
      default:
        console.log('[SETUP] User chose to configure later');
        return null;
    }
  } catch (err) {
    console.error('[SETUP] Error during setup:', err.message);
    return null;
  }
}

module.exports = {
  isYtdlpInstalled,
  downloadYtdlp,
  browseForYtdlp,
  showYtdlpSetupDialog,
  runSetup,
};

