import React, { useState, useEffect, Suspense } from 'react';
import { Menu, ArrowLeft, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.scss';
import { useDailySession } from './hooks/useDailySession';
import Sidebar from './components/Sidebar';
import WordCard from './components/WordCard';
import FunFactWidget from './components/FunFactWidget';
import DictionaryPage from './components/DictionaryPage';
import WalkthroughModal, { WALKTHROUGH_STORAGE_KEY } from './components/WalkthroughModal';
import StatsSkeleton from './components/StatsSkeleton';

const StatsModal = React.lazy(() => import('./components/StatsModal'));

// Pages enum
const PAGE = { HOME: 'home', STATS: 'stats', DICTIONARY: 'dictionary' };

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(PAGE.HOME);
  const [dictSelectedWord, setDictSelectedWord] = useState(null);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

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

  // One-time walkthrough check for new users
  useEffect(() => {
    try {
      const seen = localStorage.getItem(WALKTHROUGH_STORAGE_KEY);
      if (!seen) {
        const timer = setTimeout(() => setShowWalkthrough(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

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

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  const handleTopBack = () => {
    if (page === PAGE.DICTIONARY && dictSelectedWord) {
      // Step back from word detail to search results in dictionary
      setDictSelectedWord(null);
      return;
    }

    if (page === PAGE.DICTIONARY || page === PAGE.STATS) {
      // Return to daily learning
      setPage(PAGE.HOME);
      return;
    }

    if (isRevisionMode) {
      exitRevisionMode();
      return;
    }
  };

  const openDictionary = () => {
    setDictSelectedWord(null);
    setPage(PAGE.DICTIONARY);
    setSidebarOpen(false);
  };

  const openHome = () => {
    setPage(PAGE.HOME);
    if (isRevisionMode) exitRevisionMode();
  };

  const handleOpenDictionaryWord = (entry) => {
    setDictSelectedWord(entry);
    setPage(PAGE.DICTIONARY);
    setSidebarOpen(false);
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

  const renderMainContent = () => {
    if (page === PAGE.STATS) {
      return (
        <Suspense fallback={<StatsSkeleton />}>
          <StatsModal
            xpEarned={completedIndices.length * 10}
            chartData={stats.chartData}
          />
        </Suspense>
      );
    }

    if (page === PAGE.DICTIONARY) {
      return (
        <DictionaryPage
          theme={theme}
          selectedWord={dictSelectedWord}
          setSelectedWord={setDictSelectedWord}
          streak={stats.streak}
        />
      );
    }

    return (
      <>
        {isRevisionMode && (
          <div
            className="revision-banner"
            style={{
              background: 'var(--primary-accent)',
              color: 'white',
              padding: '0.6rem 1.2rem',
              borderRadius: '16px',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <span style={{ fontWeight: 700 }}>Revision: {new Date(revisionDate).toLocaleDateString()}</span>
            <button
              onClick={exitRevisionMode}
              style={{
                background: 'rgba(255,255,255,0.22)',
                border: 'none',
                color: 'white',
                padding: '0.35rem 0.9rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Zurück zu Heute
            </button>
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
          onOpenDictionaryWord={handleOpenDictionaryWord}
        />
      </>
    );
  };

  const showBackButton = page !== PAGE.HOME || isRevisionMode || Boolean(dictSelectedWord);

  return (
    <div className="app-layout">
      {/* Interactive Onboarding Walkthrough (One-time, can be reopened) */}
      <WalkthroughModal
        isOpen={showWalkthrough}
        onClose={() => setShowWalkthrough(false)}
      />

      {/* Mobile Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main Navigation Sidebar */}
      <Sidebar
        dailyWords={dailyWords}
        currentIndex={currentIndex}
        completedIndices={completedIndices}
        jumpToWord={(idx) => {
          jumpToWord(idx);
          setSidebarOpen(false);
          setPage(PAGE.HOME);
        }}
        streak={stats.streak}
        theme={theme}
        toggleTheme={toggleTheme}
        isOpen={sidebarOpen}
        onOpenStats={() => { setPage(PAGE.STATS); setSidebarOpen(false); }}
        onOpenDictionary={openDictionary}
        onOpenWalkthrough={() => { setShowWalkthrough(true); setSidebarOpen(false); }}
        onSelectDate={(dateStr) => {
          loadRevisionDay(dateStr);
          setSidebarOpen(false);
          setPage(PAGE.HOME);
        }}
        onClose={() => setSidebarOpen(false)}
        activePage={page}
      />

      {/* Main App Content Area */}
      <main className="main-content flex-1 min-w-0 h-full flex flex-col items-center relative overflow-y-auto overflow-x-hidden pt-24 pb-8 sm:pt-28 sm:pb-12">

        {/* Global Toast / Notification Banners */}
        <AnimatePresence>
          {showWelcomeBack && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.92 }}
              className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] glass px-6 py-3.5 shadow-2xl border-sky-400/40 flex items-center gap-3.5"
            >
              <span className="text-2xl">🎉</span>
              <div className="flex flex-col text-left">
                <span className="text-sm font-extrabold text-foreground">Willkommen zurück!</span>
                <span className="text-xs text-foreground/70 font-medium">Bereit für deine tägliche Deutsch-Dosis?</span>
              </div>
              <button onClick={() => setShowWelcomeBack(false)} className="ml-3 text-foreground/40 hover:text-foreground">
                ✕
              </button>
            </motion.div>
          )}

          {showSessionCompleteToast && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.92 }}
              className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] glass px-6 py-3.5 shadow-2xl border-emerald-400/40 flex items-center gap-3.5"
            >
              <span className="text-2xl">🔥</span>
              <div className="flex flex-col text-left">
                <span className="text-sm font-extrabold text-foreground">Klasse gemacht!</span>
                <span className="text-xs text-foreground/70 font-medium">Tagesziel erreicht (+50 XP). Morgen gehts weiter!</span>
              </div>
              <button onClick={() => setShowSessionCompleteToast(false)} className="ml-3 text-foreground/40 hover:text-foreground">
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Floating Action Bar */}
        <div className="top-bar flex justify-between items-center w-full px-4 sm:px-8 pt-4 absolute top-0 left-0 z-40">
          <div className="left-controls flex items-center gap-2.5">
            {showBackButton ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="icon-btn flex items-center justify-center w-11 h-11 bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-full shadow-sm text-foreground hover:bg-black/5 dark:hover:bg-white/20 transition-all cursor-pointer"
                onClick={handleTopBack}
                aria-label="Zurück"
                title="Zurück"
              >
                <ArrowLeft size={22} />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="icon-btn flex items-center justify-center w-11 h-11 bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-full shadow-sm text-foreground hover:bg-black/5 dark:hover:bg-white/20 transition-all cursor-pointer"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Menü öffnen"
                title="Menü"
              >
                <Menu size={22} />
              </motion.button>
            )}

            {/* Quick Dictionary Toggle Button with Badge */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (page === PAGE.DICTIONARY) {
                  openHome();
                } else {
                  openDictionary();
                }
              }}
              className={`flex items-center gap-2 px-3.5 h-11 backdrop-blur-md rounded-full shadow-sm transition-all cursor-pointer ${
                page === PAGE.DICTIONARY
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white/60 dark:bg-white/10 text-foreground hover:bg-black/5 dark:hover:bg-white/20'
              }`}
              aria-label="Wörterbuch umschalten"
              title="Wörterbuch öffnen"
            >
              <BookOpen size={19} />
              <span className="text-xs font-bold hidden sm:inline">
                {page === PAGE.DICTIONARY ? 'Lektion' : 'Wörterbuch'}
              </span>
            </motion.button>
          </div>

          <div className="right-controls flex items-center gap-3">
            <FunFactWidget />
          </div>
        </div>

        {/* Dynamic Responsive Container (Clean, Centered, No Overlaps) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full max-w-[840px] flex flex-col gap-6 z-10 mx-auto px-4 sm:px-6 my-auto"
          >
            {renderMainContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
