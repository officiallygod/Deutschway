import React from 'react';
import { BookOpen, Check, Flame, Moon, Sun } from 'lucide-react';

const Sidebar = React.memo(({ 
  dailyWords, 
  currentIndex, 
  completedIndices, 
  jumpToWord, 
  streak, 
  theme, 
  toggleTheme,
  isOpen
}) => {
  const progressPercent = dailyWords.length > 0 ? (completedIndices.length / dailyWords.length) * 100 : 0;
  const xpEarned = completedIndices.length * 10;
  const totalXpGoal = dailyWords.length * 10;

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : 'collapsed'}`}>
      <div className="brand">
        <img src="/Deutschway/logo.png" alt="Deutschway Logo" />
        Deutschway
      </div>

      <div className="daily-progress">
        <div className="progress-header">
          <span>Daily Goal</span>
          <span>{xpEarned} / {totalXpGoal} XP</span>
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
            onClick={() => jumpToWord(idx)}
          >
            {completedIndices.includes(idx) ? (
              <Check size={18} />
            ) : (
              <div style={{width: 18, height: 18, border: '2px solid currentColor', borderRadius: '50%'}}></div>
            )}
            {w.word}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="streak-badge">
          <Flame size={18} /> {streak}
        </div>
        <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;
