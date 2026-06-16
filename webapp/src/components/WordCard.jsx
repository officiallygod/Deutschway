import React from 'react';
import { Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getGenderInfo } from '../utils/grammarEngine';
import { playAudio } from '../utils/audioService';
import { motion, AnimatePresence } from 'framer-motion';

const WordCard = React.memo(({ 
  word, 
  currentIndex, 
  totalWords, 
  handleNext, 
  handlePrev,
  dailyWords,
  jumpToWord
}) => {
  if (!word) return null;

  const genderInfo = getGenderInfo(word.word);

  return (
    <div className="w-full flex flex-col gap-4">
      {dailyWords && dailyWords.length > 0 && (
        <div className="md:hidden flex justify-center w-full mb-2">
          <div className="flex bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-2xl shadow-sm p-1 gap-1 w-full">
            {dailyWords.map((w, idx) => {
              const isSelected = currentIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => jumpToWord(idx)}
                  className={`relative flex-1 h-10 rounded-xl text-sm font-medium transition-colors ${
                    isSelected ? 'text-white' : 'text-foreground hover:bg-white/20'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="mobile-tab-indicator"
                      className="absolute inset-0 bg-primary rounded-xl shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{idx + 1}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="word-card glass"
        >
          <div className="card-top">
            {genderInfo ? (
              <span className={`gender-badge ${genderInfo.color}`}>
                {genderInfo.label}
              </span>
            ) : (
              <span className="gender-badge opacity-0">...</span>
            )}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="audio-btn" 
              onClick={() => playAudio(`${word.word}. ${word.example}`)}
              aria-label="Listen to pronunciation"
            >
              <Volume2 size={24} />
            </motion.button>
          </div>
          
          <div className="word-title">
            <h2>{word.word}</h2>
            <p>{word.translation}</p>
          </div>

          <div className="example-section">
            <div className="sentence">{word.example}</div>
            <div className="translation">{word.exampleTranslation}</div>
            
            <div className="grammar-breakdown">
              <strong>Grammatik:</strong>
              <span>{word.grammarNote || "Achten Sie auf den spezifischen Kontext des Wortes."}</span>
            </div>

            {word.synonyms && word.synonyms.length > 0 && (
              <div className="synonyms">
                <strong>Ähnlich:</strong>
                {word.synonyms.map(syn => (
                  <span key={syn} className="syn-tag">{syn}</span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Unified Controls for all screens */}
      <div className="flex flex-col items-center justify-center mt-6 w-full gap-6">
        {/* Pagination Tabs */}
        {dailyWords && dailyWords.length > 0 && (
          <div className="flex justify-center w-full max-w-[400px]">
            <div className="flex bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-2xl shadow-sm p-1 gap-1 w-full">
              {dailyWords.map((w, idx) => {
                const isSelected = currentIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => jumpToWord(idx)}
                    className={`relative flex-1 h-12 rounded-xl text-sm font-medium transition-colors ${
                      isSelected ? 'text-white' : 'text-foreground hover:bg-white/20'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="unified-tab-indicator"
                        className="absolute inset-0 bg-primary rounded-xl shadow-sm"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex w-full justify-between items-center gap-4">
          <button 
            className="btn secondary flex items-center gap-2 px-6 py-3 flex-1 md:flex-none justify-center" 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={20} /> <span className="hidden md:inline">Zurück</span>
          </button>
          
          <button 
            className="btn primary flex items-center gap-2 px-6 py-3 flex-1 md:flex-none justify-center" 
            onClick={handleNext}
          >
            {currentIndex === totalWords - 1 ? 'Lektion beenden' : <><span className="hidden md:inline">Nächstes Wort</span><span className="md:hidden">Weiter</span></>} 
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
});

WordCard.displayName = 'WordCard';
export default WordCard;
