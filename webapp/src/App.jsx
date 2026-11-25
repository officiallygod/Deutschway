import React, { useState, useEffect, Suspense } from 'react';
import { Menu, ArrowLeft, Calendar as CalendarIcon, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.scss';
import { useDailySession } from './hooks/useDailySession';
import Sidebar from './components/Sidebar';
import WordCard from './components/WordCard';
import FunFactWidget from './components/FunFactWidget';
import DictionaryPage from './components/DictionaryPage';

const StatsModal = React.lazy(() => import('./components/StatsModal'));
const CalendarWidget = React.lazy(() => import('./components/CalendarWidget'));

// Pages
const PAGE = { HOME: 'home', STATS: 'stats', DICTIONARY: 'dictionary' };

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(PAGE.HOME);
  
  const {
    loading,
    dailyWords,
    currentIndex,
    completedIndices,
    isSessionComplete,
    stats,
    isRevisionMode,
    revisionDate,
    showWelcomeBack,
    setShowWelcomeBack,
    showSessionCompleteToast,
    setShowSessionCompleteToast,
    handleNext,
    handlePrev,
    jumpToWord,
    loadRevisionDay,
    exitRevisionMode
  } = useDailySession();

  useEffect(() => {
    if (showWelcomeBack) {
      const timer = setTimeout(() => setShowWelcomeBack(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeBack, setShowWelcomeBack]);

  useEffect(() => {
    if (showSessionCompleteToast) {
      const timer = setTimeout(() => setShowSessionCompleteToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSessionCompleteToast, setShowSessionCompleteToast]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const goHome = () => {
    setPage(PAGE.HOME);
    if (isRevisionMode) exitRevisionMode();
  };

  if (loading) {
    return (
      <div className="app-layout flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div 
            className="w-12 h-12 border-[4px] border-solid border-black/10 dark:border-white/10 rounded-full animate-spin"
            style={{ borderTopColor: 'var(--primary-accent)' }}
          ></div>
          <p className="text-foreground/60 font-semibold tracking-wide animate-pulse">Lade Wörter...</p>
        </div>
      </div>
    );
  }

  const currentWord = dailyWords[currentIndex];
  const isOnMainPage = page === PAGE.HOME && !isRevisionMode;

  const renderMainContent = () => {
    if (page === PAGE.STATS) {
      return (
        <Suspense fallback={<div className="animate-pulse text-foreground/60 text-center py-10">Lade Statistiken...</div>}>
          <StatsModal 
            xpEarned={completedIndices.length * 10} 
            chartData={stats.chartData} 
          />
        </Suspense>
      );
    }

    if (page === PAGE.DICTIONARY) {
      return (
        <DictionaryPage theme={theme} toggleTheme={toggleTheme} />
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
          isSessionComplete={isSessionComplete}
        />
      </>
    );
  };

  const showBackButton = page !== PAGE.HOME || isRevisionMode;

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
        jumpToWord={(idx) => { jumpToWord(idx); setSidebarOpen(false); setPage(PAGE.HOME); }}
        streak={stats.streak}
        theme={theme}
        toggleTheme={toggleTheme}
        isOpen={sidebarOpen}
        onOpenStats={() => { setPage(PAGE.STATS); setSidebarOpen(false); }}
        onOpenDictionary={() => { setPage(PAGE.DICTIONARY); setSidebarOpen(false); }}
        onSelectDate={(dateStr) => {
          loadRevisionDay(dateStr);
          setSidebarOpen(false);
          setPage(PAGE.HOME);
        }}
        onClose={() => setSidebarOpen(false)}
        activePage={page}
      />

      <main className="main-content flex-1 min-w-0 h-full flex flex-col items-center relative overflow-y-auto overflow-x-hidden pt-28 pb-10">
        
        <AnimatePresence>
          {showWelcomeBack && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] glass px-6 py-3 shadow-xl border-sky-300 dark:border-sky-500/50 flex items-center gap-3"
            >
              <span className="text-2xl">🎉</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">Willkommen zurück!</span>
                <span className="text-xs text-foreground/70 font-medium">Es ist schön, dich wiederzusehen.</span>
              </div>
              <button onClick={() => setShowWelcomeBack(false)} className="ml-4 text-foreground/50 hover:text-foreground">
                ✕
              </button>
            </motion.div>
          )}

          {showSessionCompleteToast && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] glass px-6 py-3 shadow-xl border-success dark:border-success/50 flex items-center gap-3"
            >
              <span className="text-2xl">🔥</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">Klasse gemacht!</span>
                <span className="text-xs text-foreground/70 font-medium">Du hast deine 5 Wörter für heute gemeistert.</span>
              </div>
              <button onClick={() => setShowSessionCompleteToast(false)} className="ml-4 text-foreground/50 hover:text-foreground">
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="top-bar flex justify-between items-center w-full px-4 pt-4 absolute top-0 left-0 z-50">
          <div className="left-controls flex items-center gap-2">
            {showBackButton ? (
              <motion.button 
                whileTap={{ scale: 0.9 }} 
                className="icon-btn flex items-center justify-center w-11 h-11 bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-full shadow-sm text-foreground hover:bg-black/5 dark:hover:bg-white/20 transition-colors" 
                onClick={goHome} 
                aria-label="Back"
              >
                <ArrowLeft size={24} />
              </motion.button>
            ) : (
              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="icon-btn flex items-center justify-center w-11 h-11 bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-full shadow-sm text-foreground hover:bg-black/5 dark:hover:bg-white/20 transition-colors" 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                aria-label="Toggle Menu"
              >
                <Menu size={24} />
              </motion.button>
            )}

            {/* Dictionary quick-access button on top bar */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setPage(page === PAGE.DICTIONARY ? PAGE.HOME : PAGE.DICTIONARY)}
              className={`icon-btn flex items-center justify-center w-11 h-11 backdrop-blur-md rounded-full shadow-sm transition-colors ${
                page === PAGE.DICTIONARY
                  ? 'text-white'
                  : 'bg-white/50 dark:bg-white/10 text-foreground hover:bg-black/5 dark:hover:bg-white/20'
              }`}
              style={page === PAGE.DICTIONARY ? { background: 'var(--primary-accent)' } : {}}
              aria-label="Wörterbuch"
              title="Wörterbuch"
            >
              <BookOpen size={22} />
            </motion.button>
          </div>
          
          <div className="right-controls flex items-center gap-2">
            <FunFactWidget />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-[800px] flex flex-col gap-6 z-10 mx-auto px-4 my-auto"
          >
            {renderMainContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
