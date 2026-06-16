import React, { useState, useEffect, useRef } from 'react';
import { Check, Flame, Moon, Sun, BarChart2, X, Calendar as CalendarIcon } from 'lucide-react';
import CalendarWidget from './CalendarWidget';
import Logo from './Logo';

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
  onSelectDate,
  onClose
}) => {
  const [animateStreak, setAnimateStreak] = useState(false);
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    if (streak > 0) {
      setAnimateStreak(true);
      const timer = setTimeout(() => setAnimateStreak(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [streak]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target) && !event.target.closest('.calendar-btn-toggle')) {
        setShowCalendarPopup(false);
      }
    };
    if (showCalendarPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendarPopup]);

  const progressPercent = dailyWords.length > 0 ? (completedIndices.length / dailyWords.length) * 100 : 0;
  const xpEarned = completedIndices.length * 10;
  const totalXpGoal = dailyWords.length * 10;

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'mobile-open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="brand">
            <Logo width={32} height={32} />
            Deutschway
          </div>
          {isOpen && (
            <button className="theme-btn text-foreground" onClick={onClose} aria-label="Schließen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={24} />
            </button>
          )}
        </div>

        <div className="daily-progress" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)', marginBottom: '1.5rem' }}>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Tagesziel</span>
            <span className="text-sm font-semibold text-foreground">{xpEarned} / {totalXpGoal} XP</span>
          </div>
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path className="fill-none stroke-black/5 dark:stroke-white/10" strokeWidth="3.5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="fill-none stroke-primary" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${progressPercent}, 100`} style={{ transition: 'stroke-dasharray 0.5s ease' }} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
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

      <div className="sidebar-footer" style={{ position: 'relative' }}>
        <div className={`streak-badge ${animateStreak ? 'animate-streak' : ''}`} title={`${streak} Days Streak`}>
          <Flame className="flame-icon" size={20} />
          {streak}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="theme-btn" onClick={() => { onOpenStats(); setShowCalendarPopup(false); }} aria-label="Statistiken">
            <BarChart2 size={20} />
          </button>
          <button className="theme-btn calendar-btn-toggle" onClick={() => setShowCalendarPopup(!showCalendarPopup)} aria-label="Kalender">
            <CalendarIcon size={20} />
          </button>
          <button className="theme-btn" onClick={toggleTheme} aria-label="Theme wechseln">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>

        {showCalendarPopup && (
          <div ref={calendarRef} className="fixed md:absolute z-[1000] bottom-[80px] md:bottom-[60px] left-[50%] md:left-[100%] -translate-x-1/2 md:translate-x-4">
            <CalendarWidget onSelectDate={(d) => { onSelectDate(d); setShowCalendarPopup(false); }} />
          </div>
        )}
      </div>
    </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;
