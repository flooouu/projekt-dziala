// content.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkLink") {
        sendResponse({ status: "checked" });
    }
    
    return true; 
});
