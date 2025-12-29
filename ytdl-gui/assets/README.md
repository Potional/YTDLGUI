# Installer Assets

This directory contains customizable assets for your electron-builder installer.

## Required Files

### Icons
- **icon.ico** - Windows icon (256x256 or larger)
- **icon.png** - Linux icon (512x512 recommended)
- **icon.icns** - macOS icon (512x512)

### Optional Files
- **sidebar.bmp** - Windows NSIS installer sidebar image (164x314 pixels)
- **installerHeader.bmp** - Windows NSIS installer header image (600x75 pixels)

## Customization Guide

### 1. Installer Appearance
Edit `installer-config.js` to customize:
- Installer window size
- Colors and fonts (advanced)
- Installation directory options
- Shortcut creation

### 2. NSIS Script (Advanced)
For more advanced customization, create custom NSIS scripts:
- Copy installer header/sidebar images
- Add custom dialogs
- Modify installation flow

### 3. License Agreement
Place your LICENSE file in the root directory. It will be shown during installation.

## Supported Installer Types

| Platform | Installer Type | File |
|----------|----------------|------|
| Windows  | NSIS | ytdl-gui-0.0.1.exe |
| Windows  | Portable | ytdl-gui-0.0.1.exe (single file) |
| Linux    | AppImage | ytdl-gui-0.0.1.AppImage |
| Linux    | Debian | ytdl-gui-0.0.1.deb |
| macOS    | DMG | ytdl-gui-0.0.1.dmg |
| macOS    | ZIP | ytdl-gui-0.0.1.zip |

## Build Commands

```bash
# Build for all platforms
npm run build

# Build for Windows only
npm run build:win

# Build for Linux only
npm run build:linux

# Build for macOS only
npm run build:mac
```

## Notes

- Icons should be high quality (at least 256x256 for Windows)
- NSIS installer only works on Windows build systems
- For cross-platform building, consider using CI/CD pipelines
- Test installers on actual systems before distribution
