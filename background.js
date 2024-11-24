// background.js
chrome.browserAction.onClicked.addListener((tab) => {
    chrome.windows.create({
        url: chrome.runtime.getURL('popup.html'), // Ścieżka do pliku popup.html
        type: 'popup',
        width: 400, // Ustaw szerokość okna
        height: 600 // Ustaw wysokość okna
    });
});


