import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

export const useDailySession = () => {
  const [loading, setLoading] = useState(true);
  const [dailyWords, setDailyWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIndices, setCompletedIndices] = useState([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [stats, setStats] = useState({ streak: 0, totalXp: 0, chartData: [] });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const session = await apiService.getDailySession();
      setDailyWords(session.words);
      setCompletedIndices(session.completedIndices);
      setIsSessionComplete(session.isSessionComplete);

      const userStats = await apiService.getUserStats();
      setStats(userStats);
    } catch (err) {
      console.error("Failed to load session", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const markCurrentWordComplete = async () => {
    if (!completedIndices.includes(currentIndex)) {
      const newCompleted = await apiService.markWordComplete(currentIndex);
      setCompletedIndices(newCompleted);
      
      // Update local XP stats instantly for UI
      setStats(prev => ({ ...prev, totalXp: prev.totalXp + 10 }));
    }
  };

  const handleNext = async () => {
    await markCurrentWordComplete();

    if (currentIndex < dailyWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completed all words
      const newStreak = await apiService.completeSession(dailyWords);
      setIsSessionComplete(true);
      setStats(prev => ({ ...prev, streak: newStreak }));
      
      // Reload stats to get fresh chart data
      const userStats = await apiService.getUserStats();
      setStats(userStats);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const jumpToWord = (index) => {
    setCurrentIndex(index);
  };

  return {
    loading,
    dailyWords,
    currentIndex,
    completedIndices,
    isSessionComplete,
    stats,
    handleNext,
    handlePrev,
    jumpToWord
  };
};
