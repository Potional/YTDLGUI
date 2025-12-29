/**
 * GitHub Release Downloader for Electron Installer
 * 
 * Downloads the latest release from a GitHub repository
 * Usage: node download-github-release.js <owner> <repo> <filename> <output-path>
 * 
 * Example: node download-github-release.js yt-dlp yt-dlp yt-dlp.exe "C:\Program Files\ytdl-gui"
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration - modify these for your needs
const CONFIG = {
  // GitHub repository owner and name
  owner: process.env.GITHUB_OWNER || 'yt-dlp',
  repo: process.env.GITHUB_REPO || 'yt-dlp',
  
  // Asset filename to download (case-sensitive)
  assetName: process.env.ASSET_NAME || 'yt-dlp.exe',
  
  // Output directory
  outputDir: process.env.OUTPUT_DIR || process.argv[4] || './downloads'
};

// Parse command line arguments
if (process.argv.length > 2) {
  CONFIG.owner = process.argv[2];
}
if (process.argv.length > 3) {
  CONFIG.repo = process.argv[3];
}
if (process.argv.length > 4) {
  CONFIG.assetName = process.argv[4];
}
if (process.argv.length > 5) {
  CONFIG.outputDir = process.argv[5];
}

/**
 * Make HTTPS request
 */
function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'User-Agent': 'Electron-App-Installer',
      'Accept': 'application/vnd.github.v3+json',
      ...headers
    };

    https.get(url, { headers: defaultHeaders }, (response) => {
      let data = '';

      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        httpsGet(response.headers.location, headers).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Download file from URL
 */
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    const request = https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        downloadFile(response.headers.location, outputPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(outputPath, () => {});
        reject(new Error(`Download failed: HTTP ${response.statusCode}`));
        return;
      }

      // Get total file size for progress
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const progress = Math.round((downloadedSize / totalSize) * 100);
        process.stdout.write(`\rDownloading: ${progress}%`);
      });

      response.pipe(file);
    });

    file.on('finish', () => {
      file.close();
      console.log('\n✓ Download completed');
      resolve(outputPath);
    });

    file.on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });

    request.on('error', reject);
  });
}

/**
 * Main function
 */
async function main() {
  try {
    console.log(`Fetching latest release from ${CONFIG.owner}/${CONFIG.repo}...`);

    // Fetch latest release info from GitHub API
    const releaseUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/releases/latest`;
    const release = await httpsGet(releaseUrl);

    if (!release.assets || release.assets.length === 0) {
      throw new Error('No assets found in latest release');
    }

    // Find the asset matching our filename
    const asset = release.assets.find(a => a.name === CONFIG.assetName);
    if (!asset) {
      console.error(`Available assets: ${release.assets.map(a => a.name).join(', ')}`);
      throw new Error(`Asset "${CONFIG.assetName}" not found in release`);
    }

    console.log(`Found release: ${release.tag_name}`);
    console.log(`Asset: ${asset.name} (${Math.round(asset.size / 1024 / 1024 * 100) / 100} MB)`);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
      console.log(`Created directory: ${CONFIG.outputDir}`);
    }

    // Download the asset
    const outputPath = path.join(CONFIG.outputDir, CONFIG.assetName);
    console.log(`Downloading to: ${outputPath}`);
    
    await downloadFile(asset.browser_download_url, outputPath);
    
    console.log('\n✓ Successfully downloaded GitHub release');
    process.exit(0);

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
}

// Run
main();
