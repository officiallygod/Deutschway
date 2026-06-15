import React, { useState, useEffect, Suspense } from 'react';
import { Menu, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import './App.scss';
import { useDailySession } from './hooks/useDailySession';
import Sidebar from './components/Sidebar';
import WordCard from './components/WordCard';
import FunFactWidget from './components/FunFactWidget';

const StatsModal = React.lazy(() => import('./components/StatsModal'));
const CalendarWidget = React.lazy(() => import('./components/CalendarWidget'));

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const {
    loading,
    dailyWords,
    currentIndex,
    completedIndices,
    isSessionComplete,
    stats,
    isRevisionMode,
    revisionDate,
    handleNext,
    handlePrev,
    jumpToWord,
    loadRevisionDay,
    exitRevisionMode
  } = useDailySession();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  if (loading) {
    return (
      <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p>Lade Wörter...</p>
      </div>
    );
  }

  const currentWord = dailyWords[currentIndex];

  const renderMainContent = () => {
    if (showStats) {
      return (
        <Suspense fallback={<div>Lade Statistiken...</div>}>
          <StatsModal 
            xpEarned={completedIndices.length * 10} 
            chartData={stats.chartData} 
          />
        </Suspense>
      );
    }
    
    if (showCalendar) {
      return (
        <Suspense fallback={<div>Lade Kalender...</div>}>
          <CalendarWidget 
            onSelectDate={(dateStr) => {
              loadRevisionDay(dateStr);
              setShowCalendar(false);
            }} 
          />
        </Suspense>
      );
    }

    return (
      <>
        {isRevisionMode && (
          <div className="revision-banner" style={{ background: 'var(--primary-accent)', color: 'white', padding: '0.5rem 1rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Revision: {new Date(revisionDate).toLocaleDateString()}</span>
            <button onClick={exitRevisionMode} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Zurück zu Heute</button>
          </div>
        )}
        <WordCard 
          word={currentWord}
          currentIndex={currentIndex}
          totalWords={dailyWords.length}
          handleNext={handleNext}
          handlePrev={handlePrev}
        />
      </>
    );
  };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar 
        dailyWords={dailyWords}
        currentIndex={currentIndex}
        completedIndices={completedIndices}
        jumpToWord={(idx) => { jumpToWord(idx); setSidebarOpen(false); setShowStats(false); setShowCalendar(false); }}
        streak={stats.streak}
        theme={theme}
        toggleTheme={toggleTheme}
        isOpen={sidebarOpen}
        onOpenStats={() => { setShowStats(true); setShowCalendar(false); setSidebarOpen(false); }}
        onOpenCalendar={() => { setShowCalendar(true); setShowStats(false); setSidebarOpen(false); }}
      />

      <main className="main-content">
        <div className="top-bar">
          <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle Menu">
            <Menu size={24} />
          </button>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(showStats || showCalendar || isRevisionMode) && (
              <button className="icon-btn" onClick={() => { setShowStats(false); setShowCalendar(false); if(isRevisionMode) exitRevisionMode(); }} aria-label="Back">
                <ArrowLeft size={24} />
              </button>
            )}
          </div>
        </div>

        {renderMainContent()}

      </main>
    </div>
  );
}

export default App;
