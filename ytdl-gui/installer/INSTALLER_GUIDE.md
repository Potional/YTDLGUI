# Installer Configuration Guide

## Custom Installer with GitHub Release Download

Your YTDL GUI installer now includes an automatic download step that fetches the latest release from a GitHub repository during installation.

## How It Works

1. **User starts installation** - Standard NSIS installer wizard
2. **GitHub download page appears** - Custom step showing repository and release info
3. **User clicks "Download Now"** - Installer fetches latest release from GitHub
4. **Release is downloaded** - File is placed in installation folder
5. **Installation completes** - All files ready to use

## Configuration

Edit these files to customize the GitHub download:

### 1. Update Download Target

Edit `installer/nsis-installer.nsi` to change the GitHub repository:

```nsi
; Currently set to download yt-dlp:
$$uri = (Invoke-RestMethod -Uri 'https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest')

; Change to your repository:
$$uri = (Invoke-RestMethod -Uri 'https://api.github.com/repos/YOUR_OWNER/YOUR_REPO/releases/latest')
```

And the asset filename:

```nsi
; Currently downloads yt-dlp.exe
Where-Object {$$_.name -eq 'yt-dlp.exe'}

; Change to your asset filename
Where-Object {$$_.name -eq 'YOUR_ASSET_NAME'}
```

### 2. Update Installation Path

Change where the downloaded file is saved:

```nsi
; Currently: $INSTDIR\tools
CreateDirectory "$INSTDIR\tools"
CopyFiles "$DownloadedFile" "$INSTDIR\tools\yt-dlp.exe"

; Change to your preferred path:
CreateDirectory "$INSTDIR\bin"
CopyFiles "$DownloadedFile" "$INSTDIR\bin\YOUR_FILE.exe"
```

## Available Repositories

### YouTube Downloaders
- **yt-dlp**: `yt-dlp/yt-dlp`
  - Latest: `https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest`
  - Asset: `yt-dlp.exe` (Windows)

- **youtube-dl**: `ytdl-org/youtube-dl`
  - Latest: `https://api.github.com/repos/ytdl-org/youtube-dl/releases/latest`
  - Asset: `youtube-dl.exe` (Windows)

### Custom Repository
```
https://api.github.com/repos/OWNER/REPO/releases/latest
```

## Installation Steps

### Step 1: Welcome Page
- Standard installer welcome screen
- Shows application name and version

### Step 2: Directory Selection
- User chooses installation directory
- Default: `C:\Program Files\YTDL GUI`

### Step 3: GitHub Download (NEW)
- **Download Now** - Fetches latest release
- **Skip** - Proceed without downloading (can configure later)
- Shows download progress and status

### Step 4: Installation Files
- Copies application files
- Moves downloaded release to `\tools` folder

### Step 5: Completion
- Shows installation summary
- Option to launch application
- Shows where to configure yt-dlp path

## File Structure After Installation

```
C:\Program Files\YTDL GUI\
├── resources\
│   └── app\
├── tools\
│   └── yt-dlp.exe          (Downloaded from GitHub)
├── ytdl-gui.exe            (Your Electron app)
└── Uninstall.exe           (Uninstaller)
```

## Troubleshooting

### Download Fails During Installation

**Possible causes:**
- No internet connection
- GitHub API rate limited
- Release asset doesn't exist
- Firewall blocking HTTPS

**Solutions:**
1. Click "Skip" during installation
2. Manually download from GitHub after installation
3. Configure path in application settings
4. Check GitHub repository URL is correct

### Downloaded File Not Found

If the downloaded file isn't in the expected location:

1. Check installation folder under `\tools`
2. Verify asset name matches exactly (case-sensitive)
3. Check GitHub releases page for correct filename
4. Manually download and place file

### PowerShell Execution Error

If you see PowerShell errors during download:

1. **Windows 10/11 required** - Installer uses PowerShell 5+
2. **Windows 7 compatibility** - Edit installer to use Node.js method instead
3. **Security policies** - Installer temporarily bypasses execution policies

## Advanced Configuration

### Using Node.js Alternative

For Windows 7 or alternative methods, use the included Node.js downloader:

```bash
node installer/download-github-release.js yt-dlp yt-dlp yt-dlp.exe "C:\Program Files\YTDL GUI\tools"
```

### Parameters:
1. GitHub owner (e.g., `yt-dlp`)
2. GitHub repository (e.g., `yt-dlp`)
3. Asset filename (e.g., `yt-dlp.exe`)
4. Output directory (installation path)

### Building Modified Installer

After editing `nsis-installer.nsi`:

```bash
npm run build:win
```

This will rebuild the installer with your custom NSIS script.

## GitHub API Limits

- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5,000 requests/hour

For high-volume distributions, consider:
1. Adding GitHub token to installer
2. Implementing request caching
3. Using alternative download sources

## Security Considerations

- **HTTPS only** - All downloads use secure HTTPS
- **GitHub direct links** - No intermediate servers
- **Asset verification** - Check file permissions after download
- **No auto-update** - Downloaded files don't auto-execute

## Build Instructions

### Prerequisites
- Node.js 14+
- electron-builder
- NSIS compiler (optional, handled by electron-builder)

### Building Installer

```bash
# Install dependencies (if not done)
npm install

# Build Windows installer with GitHub download
npm run build:win

# Installer will be in: dist/YTDL-GUI-Installer.exe
```

### Building Without GitHub Download

If you want to disable GitHub download for a release:

1. Comment out the PowerShell download code in `nsis-installer.nsi`
2. Or use the standard `forge.config.js` instead of custom NSIS

## Support

For issues with:
- **NSIS scripts** - See NSIS documentation
- **GitHub API** - Check GitHub status page
- **Electron-builder** - See electron-builder docs

## Files Reference

- `installer/nsis-installer.nsi` - Main installer script (EDIT THIS)
- `installer/download-github-release.js` - Node.js download helper
- `package.json` - Build configuration

