import { useState, useEffect } from 'react';
import './App.scss';
import wordsData from './data/words.json';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [dailyWords, setDailyWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(parseInt(localStorage.getItem('streak') || '0', 10));
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Logic to select 5 words for today
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('lastVisit');
    let seenIndices = JSON.parse(localStorage.getItem('seenIndices') || '[]');
    let currentDaily = JSON.parse(localStorage.getItem('currentDaily') || 'null');
    const completedToday = localStorage.getItem('completedToday') === today;

    if (lastVisit !== today) {
      // New day!
      // Check if streak was broken (didn't visit yesterday)
      if (lastVisit) {
        const lastDate = new Date(lastVisit);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays > 1) {
          // Streak broken
          setStreak(0);
          localStorage.setItem('streak', '0');
        }
      }

      // Select 5 new words
      let newDaily = [];
      let availableIndices = [];
      for (let i = 0; i < wordsData.length; i++) {
        if (!seenIndices.includes(i)) availableIndices.push(i);
      }
      
      // If we run out of words, reset seen
      if (availableIndices.length < 5) {
        seenIndices = [];
        availableIndices = wordsData.map((_, i) => i);
      }

      // Shuffle available
      availableIndices.sort(() => 0.5 - Math.random());
      newDaily = availableIndices.slice(0, 5).map(idx => ({ ...wordsData[idx], originalIndex: idx }));

      setDailyWords(newDaily);
      localStorage.setItem('currentDaily', JSON.stringify(newDaily));
      localStorage.setItem('lastVisit', today);
      setIsCompleted(false);
      setCurrentIndex(0);
    } else {
      // Same day
      if (currentDaily) {
        setDailyWords(currentDaily);
      }
      if (completedToday) {
        setIsCompleted(true);
      }
    }
  }, []);

  const handleNext = () => {
    if (currentIndex < 4) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finished today's session
      setIsCompleted(true);
      const today = new Date().toDateString();
      localStorage.setItem('completedToday', today);
      
      // Add to seen
      let seenIndices = JSON.parse(localStorage.getItem('seenIndices') || '[]');
      const newSeen = [...seenIndices, ...dailyWords.map(w => w.originalIndex)];
      localStorage.setItem('seenIndices', JSON.stringify([...new Set(newSeen)]));

      // Increment streak if not already done today
      const lastStreakDate = localStorage.getItem('lastStreakDate');
      if (lastStreakDate !== today) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('streak', newStreak.toString());
        localStorage.setItem('lastStreakDate', today);
      }
    }
  };

  const word = dailyWords[currentIndex];

  return (
    <div className="app-container">
      <div className="flag-accent-bar"></div>
      
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <header className="header">
        <div className="mascot-container">
          <img src="/mascot.png" alt="Deutschway Mascot" />
        </div>
        <h1>Deutschway</h1>
        <div className="streak">
          🔥 {streak} Day Streak
        </div>
      </header>

      <main className="cards-container">
        {isCompleted ? (
          <div className="completion-view">
            <div className="done-icon">🎉</div>
            <h2>Wunderbar!</h2>
            <p>You have learned 5 new German words today.</p>
            <p>Come back tomorrow to keep your streak alive!</p>
          </div>
        ) : (
          word && (
            <div className="word-card" key={word.word}>
              <div className="word-header">
                <h2>{word.word}</h2>
                <div className="translation">{word.translation}</div>
              </div>
              <div className="example-box">
                <div className="sentence">{word.example}</div>
                <div className="sentence-translation">{word.exampleTranslation}</div>
              </div>
            </div>
          )
        )}
      </main>

      {!isCompleted && dailyWords.length > 0 && (
        <div className="controls">
          <button className="btn" onClick={handleNext}>
            {currentIndex < 4 ? 'Next Word ➔' : 'Complete Session ✓'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
