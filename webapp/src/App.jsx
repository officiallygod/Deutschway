import { useState, useEffect } from 'react';
import { Volume2, ChevronRight, ChevronLeft, Check, Flame, Moon, Sun, BookOpen, Lightbulb, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './App.scss';
import wordsData from './data/words.json';

// Helper to determine gender based on article
const getGenderInfo = (word) => {
  if (word.startsWith('der ')) return { label: 'Masculine', rule: 'Often ends in -er, -ig, -ling' };
  if (word.startsWith('die ')) return { label: 'Feminine / Plural', rule: 'Often ends in -ung, -keit, -schaft, -tion' };
  if (word.startsWith('das ')) return { label: 'Neuter', rule: 'Often ends in -chen, -lein, -ment' };
  return null;
};

// Fun facts array
const FUN_FACTS = [
  "German is the most widely spoken native language in the European Union.",
  "All nouns in German are capitalized!",
  "The longest German word published is 'Donaudampfschifffahrtselektrizitätenhauptbetriebswerkbauunterbeamtengesellschaft'.",
  "German has three genders: masculine (der), feminine (die), and neuter (das).",
  "About 60% of English vocabulary shares roots with German."
];

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [dailyWords, setDailyWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIndices, setCompletedIndices] = useState([]);
  const [streak, setStreak] = useState(parseInt(localStorage.getItem('streak') || '0', 10));
  const [xp, setXp] = useState(parseInt(localStorage.getItem('totalXp') || '0', 10));
  const [showStats, setShowStats] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [funFact, setFunFact] = useState(FUN_FACTS[0]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Pick a random fun fact
    setFunFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);

    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('lastVisit');
    let seenIndices = JSON.parse(localStorage.getItem('seenIndices') || '[]');
    let currentDaily = JSON.parse(localStorage.getItem('currentDaily') || 'null');
    const completedToday = localStorage.getItem('completedToday') === today;
    
    // Load historical XP data for the graph
    const history = JSON.parse(localStorage.getItem('xpHistory') || '[]');
    // Ensure history has 7 days
    const last7Days = Array.from({length: 7}).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const found = history.find(h => h.date === d.toDateString());
      return { name: dateStr, xp: found ? found.xp : 0 };
    });
    setChartData(last7Days);

    if (lastVisit !== today) {
      // New day! Check streak
      if (lastVisit) {
        const diffTime = Math.abs(new Date(today) - new Date(lastVisit));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays > 1) {
          setStreak(0);
          localStorage.setItem('streak', '0');
        }
      }

      // Generate 5 new words
      let availableIndices = [];
      for (let i = 0; i < wordsData.length; i++) {
        if (!seenIndices.includes(i)) availableIndices.push(i);
      }
      if (availableIndices.length < 5) {
        seenIndices = [];
        availableIndices = wordsData.map((_, i) => i);
      }
      availableIndices.sort(() => 0.5 - Math.random());
      const newDaily = availableIndices.slice(0, 5).map(idx => ({ ...wordsData[idx], originalIndex: idx }));

      setDailyWords(newDaily);
      localStorage.setItem('currentDaily', JSON.stringify(newDaily));
      localStorage.setItem('lastVisit', today);
      setCompletedIndices([]);
      setCurrentIndex(0);
      setShowStats(false);
    } else {
      if (currentDaily) setDailyWords(currentDaily);
      if (completedToday) setShowStats(true);
      
      const savedCompleted = JSON.parse(localStorage.getItem('completedIndicesToday') || '[]');
      setCompletedIndices(savedCompleted);
    }
  }, []);

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    if (!completedIndices.includes(currentIndex)) {
      const newCompleted = [...completedIndices, currentIndex];
      setCompletedIndices(newCompleted);
      localStorage.setItem('completedIndicesToday', JSON.stringify(newCompleted));
      
      // Add XP (10 per word)
      const newXp = xp + 10;
      setXp(newXp);
      localStorage.setItem('totalXp', newXp.toString());
      
      // Update today's XP history
      const history = JSON.parse(localStorage.getItem('xpHistory') || '[]');
      const todayStr = new Date().toDateString();
      const todayIndex = history.findIndex(h => h.date === todayStr);
      if (todayIndex >= 0) {
        history[todayIndex].xp += 10;
      } else {
        history.push({ date: todayStr, xp: 10 });
      }
      localStorage.setItem('xpHistory', JSON.stringify(history));
      
      // Update chart dynamically
      setChartData(prev => {
        const newData = [...prev];
        newData[newData.length - 1].xp += 10;
        return newData;
      });
    }

    if (currentIndex < 4) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completed all 5!
      setShowStats(true);
      const today = new Date().toDateString();
      localStorage.setItem('completedToday', today);
      
      let seenIndices = JSON.parse(localStorage.getItem('seenIndices') || '[]');
      const newSeen = [...seenIndices, ...dailyWords.map(w => w.originalIndex)];
      localStorage.setItem('seenIndices', JSON.stringify([...new Set(newSeen)]));

      const lastStreakDate = localStorage.getItem('lastStreakDate');
      if (lastStreakDate !== today) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('streak', newStreak.toString());
        localStorage.setItem('lastStreakDate', today);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const word = dailyWords[currentIndex];
  const genderInfo = word ? getGenderInfo(word.word) : null;
  const progressPercent = (completedIndices.length / 5) * 100;

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <BookOpen className="icon" size={24} color="var(--primary-accent)" />
          Deutschway
        </div>

        <div className="daily-progress">
          <div className="progress-header">
            <span>Daily Goal</span>
            <span>{completedIndices.length * 10} / 50 XP</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="word-list">
          {dailyWords.map((w, idx) => (
            <button 
              key={w.word}
              className={`word-item ${idx === currentIndex ? 'active' : ''} ${completedIndices.includes(idx) ? 'completed' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            >
              {completedIndices.includes(idx) ? <Check size={18} /> : <div style={{width: 18, height: 18, border: '2px solid currentColor', borderRadius: '50%'}}></div>}
              {w.word}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="streak-badge">
            <Flame size={18} /> {streak}
          </div>
          <button className="theme-btn" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {!showStats ? (
          word && (
            <div className="card-container">
              <div className="word-card glass">
                <div className="card-top">
                  {genderInfo ? (
                    <div className="gender-badge" title={genderInfo.rule}>
                      {genderInfo.label}
                    </div>
                  ) : <div></div>}
                  <button className="audio-btn" onClick={() => playAudio(word.word + '. ' + word.example)}>
                    <Volume2 size={24} />
                  </button>
                </div>

                <div className="word-title">
                  <h2>{word.word}</h2>
                  <p>{word.translation}</p>
                </div>

                <div className="example-section">
                  <div className="sentence">{word.example}</div>
                  <div className="translation">{word.exampleTranslation}</div>
                  
                  <div className="grammar-breakdown">
                    <strong>Grammar Note:</strong>
                    <span>Notice how the verb is usually placed in the second position of the main clause. Pay attention to the article gender!</span>
                  </div>
                </div>
              </div>

              <div className="controls">
                <button className="btn secondary" onClick={handlePrev} disabled={currentIndex === 0}>
                  <ChevronLeft size={20} /> Previous
                </button>
                <button className="btn primary" onClick={handleNext}>
                  {currentIndex === 4 ? 'Finish Session' : 'Next Word'} <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="stats-modal glass">
            <h2><Trophy color="var(--ger-gold)" size={48} style={{verticalAlign: 'middle', marginRight: '10px'}}/>Session Complete!</h2>
            
            <div className="xp-circle">
              <span className="xp-amount">+{completedIndices.length * 10}</span>
              <span className="xp-label">XP Earned</span>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{background: 'var(--card-bg)', borderRadius: '10px', border: 'none', color: 'var(--text-color)'}}/>
                  <Bar dataKey="xp" fill="var(--primary-accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Fun Fact Widget */}
        <div className="fun-fact-corner glass">
          <h4><Lightbulb size={16} /> Did you know?</h4>
          <p>{funFact}</p>
        </div>
      </main>
    </div>
  );
}

export default App;
