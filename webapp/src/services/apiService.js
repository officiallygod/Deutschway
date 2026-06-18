import wordsData from '../data/words.json';

export const STORAGE_KEYS = {
  SEEN_INDICES: 'deutschway_seenIndices',
  CURRENT_DAILY: 'deutschway_currentDaily',
  LAST_VISIT: 'deutschway_lastVisit',
  COMPLETED_TODAY: 'deutschway_completedToday',
  COMPLETED_INDICES: 'deutschway_completedIndicesToday',
  XP: 'deutschway_totalXp',
  XP_HISTORY: 'deutschway_xpHistory',
  STREAK: 'deutschway_streak',
  LAST_STREAK: 'deutschway_lastStreakDate',
  DAILY_HISTORY: 'deutschway_dailyHistory'
};

const delay = (ms) => new Promise(res => setTimeout(res, ms));

class ApiService {
  /**
   * Fetch today's 5 words. Generates new ones if a new day.
   */
  async getDailySession() {
    await delay(300); // Simulate network latency
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem(STORAGE_KEYS.LAST_VISIT);
    let currentDaily = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_DAILY) || 'null');
    let showWelcomeBack = false;
    
    if (lastVisit !== today || !currentDaily || !currentDaily[0] || !currentDaily[0].synonyms) {
      // It's a new day (or legacy cache detected), pick 5 new words
      let seenIndices = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEEN_INDICES) || '[]');
      let availableIndices = wordsData.map((_, i) => i).filter(i => !seenIndices.includes(i));
      
      // Reset if we've seen all words
      if (availableIndices.length < 5) {
        seenIndices = [];
        availableIndices = wordsData.map((_, i) => i);
      }
      
      availableIndices.sort(() => 0.5 - Math.random());
      currentDaily = availableIndices.slice(0, 5).map(idx => ({ ...wordsData[idx], originalIndex: idx }));
      
      localStorage.setItem(STORAGE_KEYS.CURRENT_DAILY, JSON.stringify(currentDaily));
      localStorage.setItem(STORAGE_KEYS.LAST_VISIT, today);
      localStorage.removeItem(STORAGE_KEYS.COMPLETED_INDICES);
      localStorage.removeItem(STORAGE_KEYS.COMPLETED_TODAY);
      
      // Streak calculation
      if (lastVisit) {
        const diffDays = Math.ceil(Math.abs(new Date(today) - new Date(lastVisit)) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) localStorage.setItem(STORAGE_KEYS.STREAK, '0');
        if (diffDays >= 7) showWelcomeBack = true;
      }
    }
    
    // We should also check on normal loads if diffDays >= 7 was triggered, but we only want to show it once. 
    // Wait, if it's a new day and diffDays >= 7, we show it. If it's the same day, we don't.
    
    const completedIndices = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_INDICES) || '[]');
    const isSessionComplete = localStorage.getItem(STORAGE_KEYS.COMPLETED_TODAY) === today;
    
    return {
      words: currentDaily,
      completedIndices,
      isSessionComplete,
      showWelcomeBack
    };
  }

  /**
   * Mark a word index as completed and award XP
   */
  async markWordComplete(index) {
    const completedIndices = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_INDICES) || '[]');
    if (!completedIndices.includes(index)) {
      completedIndices.push(index);
      localStorage.setItem(STORAGE_KEYS.COMPLETED_INDICES, JSON.stringify(completedIndices));
      await this.addXp(10);
    }
    return completedIndices;
  }

  /**
   * Finish the daily session, update streak
   */
  async completeSession(dailyWords) {
    const today = new Date().toDateString();
    localStorage.setItem(STORAGE_KEYS.COMPLETED_TODAY, today);
    
    // Mark these words as seen
    let seenIndices = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEEN_INDICES) || '[]');
    const newSeen = [...seenIndices, ...dailyWords.map(w => w.originalIndex)];
    localStorage.setItem(STORAGE_KEYS.SEEN_INDICES, JSON.stringify([...new Set(newSeen)]));

    // Save to daily history
    const historyMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_HISTORY) || '{}');
    historyMap[today] = dailyWords.map(w => w.originalIndex);
    localStorage.setItem(STORAGE_KEYS.DAILY_HISTORY, JSON.stringify(historyMap));

    // Update streak
    const lastStreakDate = localStorage.getItem(STORAGE_KEYS.LAST_STREAK);
    let currentStreak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '0', 10);
    if (lastStreakDate !== today) {
      currentStreak += 1;
      localStorage.setItem(STORAGE_KEYS.STREAK, currentStreak.toString());
      localStorage.setItem(STORAGE_KEYS.LAST_STREAK, today);
    }
    
    return currentStreak;
  }

  /**
   * Add XP to total and today's history
   */
  async addXp(amount) {
    const totalXp = parseInt(localStorage.getItem(STORAGE_KEYS.XP) || '0', 10) + amount;
    localStorage.setItem(STORAGE_KEYS.XP, totalXp.toString());
    
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.XP_HISTORY) || '[]');
    const todayStr = new Date().toDateString();
    const todayIndex = history.findIndex(h => h.date === todayStr);
    
    if (todayIndex >= 0) {
      history[todayIndex].xp += amount;
    } else {
      history.push({ date: todayStr, xp: amount });
    }
    localStorage.setItem(STORAGE_KEYS.XP_HISTORY, JSON.stringify(history));
    
    return totalXp;
  }

  /**
   * Get user stats (streak, total XP, 7-day history)
   */
  async getUserStats() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.XP_HISTORY) || '[]');
    const last7Days = Array.from({length: 7}).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const found = history.find(h => h.date === d.toDateString());
      return { 
        name: d.toLocaleDateString('en-US', { weekday: 'short' }), 
        xp: found ? found.xp : 0 
      };
    });

    return {
      streak: parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '0', 10),
      totalXp: parseInt(localStorage.getItem(STORAGE_KEYS.XP) || '0', 10),
      chartData: last7Days
    };
  }

  async getHistoryMap() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_HISTORY) || '{}');
  }

  async getRevisionWords(dateStr) {
    const historyMap = await this.getHistoryMap();
    const indices = historyMap[dateStr];
    if (!indices) return null;
    return indices.map(idx => ({ ...wordsData[idx], originalIndex: idx }));
  }
}

export const apiService = new ApiService();
