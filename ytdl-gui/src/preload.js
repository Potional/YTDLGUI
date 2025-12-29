// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer } = require('electron')

// Cuando se carga Electron
process.once('loaded', () => {
    // Escuchanos los eventos del window del navegador
    window.addEventListener('message', evt => {
        if (evt.data.type === 'select-dirs') {
            ipcRenderer.send('select-dirs')
        }
        if (evt.data.type === 'select-exec') {
            ipcRenderer.send('select-exec')
        }
        if (evt.data.type === 'download-start') {
            ipcRenderer.send('download-start', evt.data.data.urlDownload, evt.data.data);
        }
        // Config events
        if (evt.data.type === 'config-get') {
            ipcRenderer.send('config-get', evt.data.key);
        }
        if (evt.data.type === 'config-set') {
            ipcRenderer.send('config-set', evt.data.key, evt.data.value);
        }
        if (evt.data.type === 'config-read-all') {
            ipcRenderer.send('config-read-all');
        }
    });

    // Escuchanos los eventos del index.js
    ipcRenderer.on('download-error-status', (event, args) => {
        console.error("ERROR: " + args.errorMessage);
        window.postMessage({
            type: 'download-error',
            errorMessage: args.errorMessage
        });
    });

    ipcRenderer.on('download-success', (event, args) => {
        window.postMessage({
            type: 'download-success'
        });
    });

    ipcRenderer.on('download-update-status', (event, args) => {
        window.postMessage({
            type: 'download-update-status',
            updateMessage: args.statusMessage
        });
    });

    // Config responses
    ipcRenderer.on('config-response', (event, args) => {
        window.postMessage({
            type: 'config-response',
            data: args
        });
    });

    ipcRenderer.on('config-save-response', (event, args) => {
        window.postMessage({
            type: 'config-save-response',
            success: args.success
        });
    });

    // Add this function to handle folder selection response
    ipcRenderer.on('folder-selected', (event, folderPath) => {
        window.postMessage({
            type: 'folder-selected',
            path: folderPath
        });
    });

})
