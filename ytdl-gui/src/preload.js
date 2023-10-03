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
            ipcRenderer.send('download-start', evt.data.data.urlDownload, { transformMP3: evt.data.data.transformMP3 });
        }
    });

    // Escuchanos los eventos del index.js
    ipcRenderer.on('download-error-status', (event, args) => {
        console.error("ERROR: " + args.errorMessage);
    });

    ipcRenderer.on('download-error', (event, args) => {
        window.postMessage({
            type: 'download-error'
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


})