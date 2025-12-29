/**
 * Electron Builder Installer Configuration
 * Customize this file to change installer appearance and behavior
 */

module.exports = {
  // Windows NSIS Installer Customization
  nsis: {
    // Show custom installer UI (false = wizard-style, true = one-click)
    oneClick: false,
    
    // Allow users to choose installation directory
    allowToChangeInstallationDirectory: true,
    
    // Create desktop shortcut
    createDesktopShortcut: true,
    
    // Create start menu shortcut
    createStartMenuShortcut: true,
    
    // Custom shortcut name
    shortcutName: "YTDL GUI",
    
    // Installer window size (width x height)
    installerWindowWidth: 800,
    installerWindowHeight: 600,
    
    // Icon files (replace with your own)
    installerIcon: "assets/icon.ico",
    uninstallerIcon: "assets/icon.ico",
    installerHeaderIcon: "assets/icon.ico",
    
    // Welcome page customization
    installerSidebar: true,
    installerSidebarImage: null, // Set to "assets/sidebar.bmp" if you have a custom image
    
    // License agreement (optional)
    license: "LICENSE",
    
    // Languages (add more languages as needed)
    languages: ["en_US", "es_ES", "fr_FR"],
    
    // Custom install scripts (advanced)
    // beforeInstall: null,
    // afterInstall: null,
  },

  // Portable executable settings
  portable: {
    // No specific configuration needed - portable exe will be created
  },

  // Windows general settings
  win: {
    // Build for multiple architectures
    target: [
      {
        target: "nsis",
        arch: ["x64", "ia32"] // 64-bit and 32-bit
      },
      "portable" // Also create portable .exe
    ],
  },

  // Linux settings
  linux: {
    target: ["AppImage", "deb"],
    icon: "assets/icon.png",
    category: "Utility",
  },

  // macOS settings
  mac: {
    target: ["dmg", "zip"],
    icon: "assets/icon.icns",
  },

  // App metadata
  appId: "com.ytdlgui.app",
  productName: "YTDL GUI",
  
  // Build directories
  directories: {
    buildResources: "assets",
    output: "dist"
  },

  // Files to include in the build
  files: [
    "src/**/*",
    "node_modules/**/*",
    "package.json"
  ]
};
