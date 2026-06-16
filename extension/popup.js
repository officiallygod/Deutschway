document.addEventListener('DOMContentLoaded', () => {
  const xpCircle = document.getElementById('xpCircle');
  const xpCircleFill = document.getElementById('xpCircleFill');
  const toggle = document.getElementById('openOnNewTabToggle');
  const openAppBtn = document.getElementById('openAppBtn');
  const streakText = document.getElementById('streakText');

  const wordCarousel = document.getElementById('wordCarousel');
  const fallbackMsg = document.getElementById('fallbackMsg');
  const wordTitle = document.getElementById('wordTitle');
  const wordTrans = document.getElementById('wordTrans');
  const wordCounter = document.getElementById('wordCounter');
  const prevWordBtn = document.getElementById('prevWordBtn');
  const nextWordBtn = document.getElementById('nextWordBtn');

  let learnedWords = [];
  let currentCarouselIndex = 0;

  // Open App Button
  openAppBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://officiallygod.github.io/Deutschway/' });
  });

  // Settings
  chrome.storage.local.get(['openOnNewTab', 'theme', 'streak', 'currentDaily', 'completedIndices'], (result) => {
    // Theme
    if (result.theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
    }

    // Toggle
    toggle.checked = result.openOnNewTab !== false;

    // Streak
    streakText.textContent = `${result.streak || 0} Days`;

    // Hydrate Stats & Words
    if (result.currentDaily) {
      try {
        const words = JSON.parse(result.currentDaily);
        const completed = result.completedIndices ? JSON.parse(result.completedIndices) : [];
        
        const xp = completed.length * 10;
        const totalXp = words.length * 10;
        
        const pct = totalXp > 0 ? (xp / totalXp) * 100 : 0;
        xpCircleFill.style.strokeDasharray = `${pct}, 100`;
        xpCircle.title = `${xp} / ${totalXp} XP`;

        if (completed.length > 0) {
          fallbackMsg.style.display = 'none';
          wordCarousel.style.display = 'flex';
          
          learnedWords = words.filter((w, i) => completed.includes(i));
          currentCarouselIndex = 0;
          updateCarousel();
        }
      } catch (e) {
        console.error("Error parsing storage data:", e);
      }
    }
  });

  toggle.addEventListener('change', (e) => {
    chrome.storage.local.set({ openOnNewTab: e.target.checked });
  });

  function updateCarousel() {
    if (learnedWords.length === 0) return;
    const w = learnedWords[currentCarouselIndex];
    wordTitle.textContent = w.word;
    wordTrans.textContent = w.translation;
    wordCounter.textContent = `${currentCarouselIndex + 1} / ${learnedWords.length}`;

    prevWordBtn.disabled = currentCarouselIndex === 0;
    nextWordBtn.disabled = currentCarouselIndex === learnedWords.length - 1;
  }

  prevWordBtn.addEventListener('click', () => {
    if (currentCarouselIndex > 0) {
      currentCarouselIndex--;
      updateCarousel();
    }
  });

  nextWordBtn.addEventListener('click', () => {
    if (currentCarouselIndex < learnedWords.length - 1) {
      currentCarouselIndex++;
      updateCarousel();
    }
  });
});
