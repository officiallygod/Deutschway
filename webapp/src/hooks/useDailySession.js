import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

export const useDailySession = () => {
  const [loading, setLoading] = useState(true);
  const [dailyWords, setDailyWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIndices, setCompletedIndices] = useState([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [showSessionCompleteToast, setShowSessionCompleteToast] = useState(false);
  const [stats, setStats] = useState({ streak: 0, totalXp: 0, chartData: [] });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const session = await apiService.getDailySession();
      setDailyWords(session.words);
      setCompletedIndices(session.completedIndices);
      setIsSessionComplete(session.isSessionComplete);
      if (session.showWelcomeBack) {
        setShowWelcomeBack(true);
      }

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
      setShowSessionCompleteToast(true);
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

  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [revisionDate, setRevisionDate] = useState(null);

  const loadRevisionDay = useCallback(async (dateStr) => {
    setLoading(true);
    try {
      const words = await apiService.getRevisionWords(dateStr);
      if (words) {
        setDailyWords(words);
        setCompletedIndices(words.map((_, i) => i)); // All completed in revision
        setIsSessionComplete(true);
        setIsRevisionMode(true);
        setRevisionDate(dateStr);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error("Failed to load revision", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const exitRevisionMode = useCallback(() => {
    setIsRevisionMode(false);
    setRevisionDate(null);
    loadData(); // reload today's normal session
  }, [loadData]);

  return {
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
  };
};
