// Variables
const ytdlRoute = document.getElementById("ytdlRoute");
const downloadedFilesRoute = document.getElementById("downloadedFilesRoute");
const urlDownload = document.getElementById("urlDownload");
const downloadButton = document.getElementById("downloadButton");
const transformMP3 = document.getElementById("transformMP3");

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
    window.postMessage({
        type: 'download-start',
        data: {
            urlDownload: urlDownload.value,
            transformMP3: transformMP3.checked
        }
    });
});