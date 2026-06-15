const TARGET_URL = "https://officiallygod.github.io/Deutschway/";

function checkAndOpenTab() {
  chrome.storage.local.get(['lastOpenedDate', 'openOnNewTab'], function(result) {
    // If setting explicitly disabled, do nothing
    if (result.openOnNewTab === false) return;

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
