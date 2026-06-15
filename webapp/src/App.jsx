import React, { useState, useEffect, Suspense } from 'react';
import { Menu } from 'lucide-react';
import './App.scss';
import { useDailySession } from './hooks/useDailySession';
import Sidebar from './components/Sidebar';
import WordCard from './components/WordCard';
import FunFactWidget from './components/FunFactWidget';

const StatsModal = React.lazy(() => import('./components/StatsModal'));

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const {
    loading,
    dailyWords,
    currentIndex,
    completedIndices,
    isSessionComplete,
    stats,
    handleNext,
    handlePrev,
    jumpToWord
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
        jumpToWord={(idx) => { jumpToWord(idx); setSidebarOpen(false); }}
        streak={stats.streak}
        theme={theme}
        toggleTheme={toggleTheme}
        isOpen={sidebarOpen}
      />

      <main className="main-content">
        <div className="top-bar">
          <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle Menu">
            <Menu size={24} />
          </button>
        </div>

        {!isSessionComplete ? (
          <WordCard 
            word={currentWord}
            currentIndex={currentIndex}
            totalWords={dailyWords.length}
            handleNext={handleNext}
            handlePrev={handlePrev}
          />
        ) : (
          <Suspense fallback={<div>Loading Stats...</div>}>
            <StatsModal 
              xpEarned={completedIndices.length * 10} 
              chartData={stats.chartData} 
            />
          </Suspense>
        )}

        <FunFactWidget />
      </main>
    </div>
  );
}

export default App;
