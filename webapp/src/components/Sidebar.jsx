import React, { useState, useEffect } from 'react';
import { Check, Flame, Moon, Sun, BarChart2, X, Calendar as CalendarIcon } from 'lucide-react';

const Sidebar = React.memo(({ 
  dailyWords, 
  currentIndex, 
  completedIndices, 
  jumpToWord, 
  streak, 
  theme, 
  toggleTheme,
  isOpen,
  onOpenStats,
  onOpenCalendar
}) => {
  const [animateStreak, setAnimateStreak] = useState(false);

  useEffect(() => {
    if (streak > 0) {
      setAnimateStreak(true);
      const timer = setTimeout(() => setAnimateStreak(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [streak]);

  const progressPercent = dailyWords.length > 0 ? (completedIndices.length / dailyWords.length) * 100 : 0;
  const xpEarned = completedIndices.length * 10;
  const totalXpGoal = dailyWords.length * 10;

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="brand">
          <img src="/Deutschway/logo.svg" alt="Deutschway Logo" />
          Deutschway
        </div>
        {isOpen && (
          <button className="theme-btn" onClick={() => jumpToWord(currentIndex)} aria-label="Schließen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={24} />
          </button>
        )}
      </div>

      <div className="daily-progress">
        <div className="progress-header">
          <span>Tagesziel</span>
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
        <div className={`streak-badge ${animateStreak ? 'animate-streak' : ''}`} title={`${streak} Days Streak`}>
          <Flame className="flame-icon" size={20} />
          {streak}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="theme-btn" onClick={onOpenStats} aria-label="Statistiken">
            <BarChart2 size={20} />
          </button>
          <button className="theme-btn" onClick={onOpenCalendar} aria-label="Kalender">
            <CalendarIcon size={20} />
          </button>
          <button className="theme-btn" onClick={toggleTheme} aria-label="Theme wechseln">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;
