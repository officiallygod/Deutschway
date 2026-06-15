let syncInterval;

function syncToExtension() {
  const daily = localStorage.getItem('deutschway_currentDaily');
  const xp = localStorage.getItem('deutschway_totalXp');
  const streak = localStorage.getItem('deutschway_streak');
  const completed = localStorage.getItem('deutschway_completedIndices');
  const theme = localStorage.getItem('theme') || 'light';
  
  if (daily) {
    try {
      chrome.storage.local.set({
        currentDaily: daily,
        totalXp: xp || '0',
        streak: streak || '0',
        completedIndices: completed || '[]',
        theme: theme
      });
    } catch (e) {
      if (e.message && e.message.includes('Extension context invalidated')) {
        console.warn('Deutschway Extension updated. Please refresh the page.');
        if (syncInterval) clearInterval(syncInterval);
        window.removeEventListener('storage', syncToExtension);
      }
    }
  }
}

// Listen to local storage changes from the web app
window.addEventListener('storage', syncToExtension);

// Initial sync
syncToExtension();

// Periodic sync just in case
syncInterval = setInterval(syncToExtension, 2000);
