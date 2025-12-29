// Variables
const themeToggle = document.getElementById("themeToggle");
const urlDownload = document.getElementById("urlDownload");
const videoDownloadButton = document.getElementById("videoDownloadButton");
const audioDownloadButton = document.getElementById("audioDownloadButton");
const videoQuality = document.getElementById("videoQuality");
const videoFormat = document.getElementById("videoFormat");
const audioFormat = document.getElementById("audioFormat");
const transformMP3 = document.getElementById("transformMP3");
const downloadSuccessMessage = document.getElementById("downloadSuccessMessage");
const downloadErrorMessage = document.getElementById("downloadErrorMessage");
const downloadingMessage = document.getElementById("downloadingMessage");
const divLogs = document.getElementById("divLogs");
const downloadFolderInput = document.getElementById("downloadFolder");
const selectFolderButton = document.getElementById("selectFolderButton");

// Theme toggle functionality
function initializeTheme() {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme-preference') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
        updateThemeIcon(false);
    }
}

function updateThemeIcon(isDarkMode) {
    themeToggle.querySelector('.theme-icon').textContent = isDarkMode ? '☀️' : '🌙';
}

function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    document.documentElement.classList.toggle('dark-mode');
    updateThemeIcon(isDarkMode);
    localStorage.setItem('theme-preference', isDarkMode ? 'dark' : 'light');
}

function selectDownloadFolder() {
    window.postMessage({
        type: 'select-dirs'
    });
}

function checkEnableDownloadButtons() {
    const url = urlDownload.value.trim();
    const isValidUrl = url.startsWith("http://") || url.startsWith("https://");
    const folderPath = downloadFolderInput.value.trim();
    const isValidFolder = folderPath.length > 0; 
    videoDownloadButton.disabled = !isValidUrl || !isValidFolder;
    audioDownloadButton.disabled = !isValidUrl || !isValidFolder;
}

themeToggle.addEventListener('click', toggleTheme);

selectFolderButton.addEventListener("click", selectDownloadFolder);

// Initialize theme on page load
initializeTheme();
videoDownloadButton.disabled = true;
audioDownloadButton.disabled = true;

// When download button click
videoDownloadButton.addEventListener("click", () => {
    downloadErrorMessage.hidden = true;
    downloadSuccessMessage.hidden = true;
    downloadingMessage.hidden = false;
    divLogs.hidden = true;
    window.postMessage({
        type: 'download-start',
        data: {
            urlDownload: urlDownload.value,
            downloadType: 'video',
            quality: videoQuality.value,
            format: videoFormat.value,
            folderPath: downloadFolderInput.value
        }
    });
});

audioDownloadButton.addEventListener("click", () => {
    downloadErrorMessage.hidden = true;
    downloadSuccessMessage.hidden = true;
    downloadingMessage.hidden = false;
    divLogs.hidden = true;
    window.postMessage({
        type: 'download-start',
        data: {
            urlDownload: urlDownload.value,
            downloadType: 'audio',
            audioFormat: audioFormat.value,
            folderPath: downloadFolderInput.value
        }
    });
});

downloadFolderInput.addEventListener("change", () => {
    checkEnableDownloadButtons();
});

urlDownload.addEventListener("input", () => {
    checkEnableDownloadButtons();
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

    if (evt.data.type === 'folder-selected') {
        downloadFolderInput.value = evt.data.path.folderPath[0] ? evt.data.path.folderPath[0] : '';
        checkEnableDownloadButtons();
    }
});