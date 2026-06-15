const TARGET_URL = "https://officiallygod.github.io/Deutschway/";

function checkAndOpenTab() {
  chrome.storage.local.get(['lastOpenedDate'], function(result) {
    const today = new Date().toDateString();
    if (result.lastOpenedDate !== today) {
      chrome.storage.local.set({ lastOpenedDate: today }, function() {
        chrome.tabs.create({ url: TARGET_URL });
      });
    }
  });
}

// Trigger when Chrome starts up
chrome.runtime.onStartup.addListener(checkAndOpenTab);

// Also trigger on install/update for the first time
chrome.runtime.onInstalled.addListener(checkAndOpenTab);

// Also trigger when the user clicks the extension icon
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: TARGET_URL });
});
