import React from 'react';
import { Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, Tab } from '@heroui/react';
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
    <div className="card-container flex flex-col gap-4">
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
              <div className="gender-badge" title={genderInfo.rule}>
                {genderInfo.label}
              </div>
            ) : <div />}
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

      <div className="controls hidden md:flex justify-between items-center w-full mt-8">
        <button 
          className="btn secondary flex items-center justify-center gap-2 px-6 py-3" 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={20} /> Zurück
        </button>
        <button className="btn primary flex items-center justify-center gap-2 px-6 py-3" onClick={handleNext}>
          {currentIndex === totalWords - 1 ? 'Lektion beenden' : 'Nächstes Wort'} <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="controls flex flex-col md:hidden items-center justify-center mt-6 w-full gap-4">
        <Tabs 
          aria-label="Wort Navigation" 
          selectedKey={currentIndex.toString()} 
          onSelectionChange={(key) => jumpToWord(parseInt(key, 10))}
          color="primary"
          radius="full"
          size="sm"
          items={dailyWords.map((_, idx) => ({ id: idx.toString(), label: `Wort ${idx + 1}` }))}
        >
          {(item) => (
            <Tab key={item.id} title={item.label} />
          )}
        </Tabs>
        
        <button className="btn primary w-full flex items-center justify-center gap-2 px-6 py-3" onClick={handleNext}>
          {currentIndex === totalWords - 1 ? 'Lektion beenden' : 'Weiter'} <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
});

WordCard.displayName = 'WordCard';
export default WordCard;
