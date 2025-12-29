// Dependencies
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
let spawn = require("child_process").spawn;
const path = require('path');
const { initializeConfig, getConfig, setConfig } = require('./configManager');
const { runSetup: setupYtdlp } = require('./setup');

// Variables
var mainWindow;
var ytdlExecPath = "";
var saveDestinyDirPath = "";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        },
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // Run setup for both yt-dlp
    const configManager = require('./configManager');
    setupYtdlp(mainWindow, configManager);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    // Initialize configuration
    initializeConfig();

    // Load saved config values
    ytdlExecPath = getConfig('ytdlExecPath', '');
    saveDestinyDirPath = getConfig('saveDestinyDirPath', '');

    createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Evento de añadir el path del directorio par las descargas
ipcMain.on('select-dirs', async (event, arg) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    saveDestinyDirPath = result.filePaths;
    // Save to config
    setConfig('saveDestinyDirPath', saveDestinyDirPath);

    mainWindow.send('folder-selected', { folderPath: saveDestinyDirPath });
});

// Evento de añadir el path del directorio par las descargas
ipcMain.on('select-exec', async (event, arg) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{
            name: "youtube-dl",
            extensions: ["exe"]
        }]
    });
    ytdlExecPath = result.filePaths;
    // Save to config
    setConfig('ytdlExecPath', ytdlExecPath);
});

// Evento de añadir el path del directorio par las descargas
ipcMain.on('download-start', async (event, videoUrl, options) => {
    execOnWindows(videoUrl, options);
});

// Config IPC handlers
ipcMain.on('config-get', (event, key) => {
    const value = getConfig(key);
    event.reply('config-response', value);
});

ipcMain.on('config-set', (event, key, value) => {
    const success = setConfig(key, value);
    event.reply('config-save-response', { success });
});

ipcMain.on('config-read-all', (event) => {
    const config = getConfig();
    event.reply('config-response', config);
});

function execOnWindows(videoUrl, options) {

    let bat = spawn("cmd.exe", [
        "/c", // Argument for cmd.exe to carry out the specified script
        calculateBaseCommandWin(), // Path to youtube-dl
        videoUrl, // videoURL
        calculateCommandOptionsWin(options) // options
    ]);

    bat.stdout.on("data", (data) => {
        const strStatus = new TextDecoder().decode(data);
        mainWindow.send('download-update-status', { statusMessage: strStatus });
    });

    bat.stderr.on("data", (err) => {
        const strErr = new TextDecoder().decode(err);
        console.log("ERROR: " + strErr);
        mainWindow.send('download-error-status', { errorMessage: strErr });
    });

    bat.on("exit", (code) => {
        if (code === 0) {
            console.log("Finalizado correctamente...");
            mainWindow.send('download-success', {});
        } else {
            console.log("Finalizado con errores...");
            mainWindow.send('download-error', {});
        }
    });
}

function calculateCommandOptionsWin(options) {
    var additionalArgs = " -R 5 --no-warnings ";

    // Use the specified folder path if available
    if (options.folderPath && options.folderPath.trim() !== "") {
        additionalArgs += "-P " + options.folderPath + " ";
    }

    if (options.downloadType === 'video') {
        additionalArgs = additionalArgs.concat(" -f " + options.format + " ");
    }

    if (options.downloadType === 'audio') {
        additionalArgs = additionalArgs.concat(" -x ");
        additionalArgs = additionalArgs.concat(" --audio-format " + options.audioFormat + " ");
    }

    console.log("Additional args: " + additionalArgs);

    return additionalArgs;
}

function calculateBaseCommandWin(params) {
    const base = ytdlExecPath + " ";
    console.log("Base command: " + base);
    return base;
}