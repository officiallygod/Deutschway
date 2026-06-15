import React, { useState, useEffect, Suspense } from 'react';
import './App.scss';
import { useDailySession } from './hooks/useDailySession';
import Sidebar from './components/Sidebar';
import WordCard from './components/WordCard';
import FunFactWidget from './components/FunFactWidget';

// Lazy load the StatsModal because it imports 'recharts' which is heavy
const StatsModal = React.lazy(() => import('./components/StatsModal'));

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
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
      <Sidebar 
        dailyWords={dailyWords}
        currentIndex={currentIndex}
        completedIndices={completedIndices}
        jumpToWord={jumpToWord}
        streak={stats.streak}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="main-content">
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
