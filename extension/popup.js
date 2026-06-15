document.addEventListener('DOMContentLoaded', () => {
  const xpText = document.getElementById('xpText');
  const progressFill = document.getElementById('progressFill');
  const wordList = document.getElementById('wordList');
  const toggle = document.getElementById('openOnNewTabToggle');
  const openAppBtn = document.getElementById('openAppBtn');

  // Open App Button
  openAppBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://officiallygod.github.io/Deutschway/' });
  });

  // Settings
  chrome.storage.local.get(['openOnNewTab'], (result) => {
    // Default to true if not set
    toggle.checked = result.openOnNewTab !== false;
  });

  toggle.addEventListener('change', (e) => {
    chrome.storage.local.set({ openOnNewTab: e.target.checked });
  });

  // Hydrate Stats & Words
  chrome.storage.local.get(['currentDaily', 'completedIndices'], (result) => {
    if (result.currentDaily) {
      try {
        const words = JSON.parse(result.currentDaily);
        const completed = result.completedIndices ? JSON.parse(result.completedIndices) : [];
        
        const xp = completed.length * 10;
        const totalXp = words.length * 10;
        
        xpText.textContent = `${xp} / ${totalXp} XP`;
        progressFill.style.width = `${(xp / totalXp) * 100}%`;

        if (completed.length > 0) {
          wordList.innerHTML = ''; // Clear fallback
          words.forEach((w, i) => {
            if (completed.includes(i)) {
              const div = document.createElement('div');
              div.className = 'word-item';
              
              const spanWord = document.createElement('span');
              spanWord.textContent = w.word;
              
              const spanTrans = document.createElement('span');
              spanTrans.className = 'word-translation';
              spanTrans.textContent = w.translation;

              div.appendChild(spanWord);
              div.appendChild(spanTrans);
              wordList.appendChild(div);
            }
          });
        }
      } catch (e) {
        console.error("Error parsing storage data:", e);
      }
    }
  });
});
