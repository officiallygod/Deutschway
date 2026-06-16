import React, { useState, useEffect, Suspense } from 'react';
import { Menu, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
          dailyWords={dailyWords}
          jumpToWord={jumpToWord}
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
        jumpToWord={(idx) => { jumpToWord(idx); setSidebarOpen(false); setShowStats(false); }}
        streak={stats.streak}
        theme={theme}
        toggleTheme={toggleTheme}
        isOpen={sidebarOpen}
        onOpenStats={() => { setShowStats(true); setSidebarOpen(false); }}
        onSelectDate={(dateStr) => {
          loadRevisionDay(dateStr);
          setSidebarOpen(false);
        }}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content flex-1 w-[100vw] min-w-0 h-full flex flex-col items-center justify-center relative overflow-y-auto">
        <div className="top-bar flex justify-between items-center w-full px-4 pt-4 absolute top-0 left-0 z-50">
          <div className="left-controls">
            {(showStats || isRevisionMode) ? (
              <motion.button 
                whileTap={{ scale: 0.9 }} 
                className="icon-btn flex items-center justify-center w-11 h-11 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-full shadow-sm" 
                onClick={() => { setShowStats(false); if(isRevisionMode) exitRevisionMode(); }} 
                aria-label="Back"
              >
                <ArrowLeft size={24} />
              </motion.button>
            ) : (
              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="icon-btn flex items-center justify-center w-11 h-11 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-full shadow-sm" 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                aria-label="Toggle Menu"
              >
                <Menu size={24} />
              </motion.button>
            )}
          </div>
          
          <div className="right-controls flex items-center gap-2">
            <FunFactWidget />
          </div>
        </div>

        <div className="w-full max-w-[600px] flex flex-col gap-6 z-10 mx-auto px-4 mt-16">
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
