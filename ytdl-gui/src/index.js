// Dependencies
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
let spawn = require("child_process").spawn;
const path = require('path');

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
    mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Evento de añadir el path del directorio par las descargas
ipcMain.on('select-dirs', async(event, arg) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    saveDestinyDirPath = result.filePaths;
});

// Evento de añadir el path del directorio par las descargas
ipcMain.on('select-exec', async(event, arg) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{
            name: "youtube-dl",
            extensions: ["exe"]
        }]
    });
    ytdlExecPath = result.filePaths;
});

// Evento de añadir el path del directorio par las descargas
ipcMain.on('download-start', async(event, videoUrl, options) => {
    execOnWindows(videoUrl, options);
});

function execOnWindows(videoUrl, options) {
    let bat = spawn("cmd.exe", [
        "/c", // Argument for cmd.exe to carry out the specified script
        "cd " + saveDestinyDirPath + " && " + ytdlExecPath, // Path to youtube-dl
        videoUrl, // videoURL
        calculateCommandOptions(options)
    ]);

    bat.stdout.on("data", (data) => {
        console.log("Acabo con exito...");
    });

    bat.stderr.on("data", (err) => {
        console.log("ERROR: " + err);
        // Handle error...
    });

    bat.on("exit", (code) => {
        console.log("Salido exito...");
        // Handle exit
    });
}

function calculateCommandOptions(options) {

}