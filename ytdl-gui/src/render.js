// Variables
const ytdlRoute = document.getElementById("ytdlRoute");
const downloadedFilesRoute = document.getElementById("downloadedFilesRoute");
const urlDownload = document.getElementById("urlDownload");
const downloadButton = document.getElementById("downloadButton");
const transformMP3 = document.getElementById("transformMP3");
const downloadSuccessMessage = document.getElementById("downloadSuccessMessage");
const downloadErrorMessage = document.getElementById("downloadErrorMessage");
const downloadingMessage = document.getElementById("downloadingMessage");
const divLogs = document.getElementById("divLogs");

// When select exe button click
ytdlRoute.addEventListener("click", () => {
    window.postMessage({
        type: 'select-exec'
    });
});

// When select destiny button click
downloadedFilesRoute.addEventListener("click", () => {
    window.postMessage({
        type: 'select-dirs'
    });
});

// When download button click
downloadButton.addEventListener("click", () => {
    downloadErrorMessage.hidden = true;
    downloadSuccessMessage.hidden = true;
    downloadingMessage.hidden = false;
    divLogs.hidden = true;
    window.postMessage({
        type: 'download-start',
        data: {
            urlDownload: urlDownload.value,
            transformMP3: transformMP3.checked
        }
    });
});

// When message from preload
window.addEventListener('message', (evt) => {
    if (evt.data.type === 'download-error') {
        downloadingMessage.hidden = true;
        downloadErrorMessage.hidden = false;
        divLogs.hidden = true;
        var child = e.lastElementChild;
        while (child) {
            e.removeChild(child);
            child = e.lastElementChild;
        }
    }

    if (evt.data.type === 'download-success') {
        downloadingMessage.hidden = true;
        downloadSuccessMessage.hidden = false;
    }

    if (evt.data.type === 'download-update-status') {
        divLogs.hidden = false;
        const logNode = document.createElement("p");
        logNode.textContent = evt.data.updateMessage;
        logNode.style.color = "green";
        logNode.style.fontFamily = "monospace";
        divLogs.appendChild(logNode);
        divLogs.scrollTop = divLogs.scrollHeight;
    }
});