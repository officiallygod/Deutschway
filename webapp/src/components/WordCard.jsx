import React from 'react';
import { Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getGenderInfo } from '../utils/grammarEngine';
import { playAudio } from '../utils/audioService';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, Tab } from "@heroui/react";

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
          <Tabs 
            aria-label="Wörter" 
            selectedKey={currentIndex.toString()} 
            onSelectionChange={(key) => jumpToWord(Number(key))}
            color="primary"
            variant="light"
            classNames={{
              tabList: "bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-2xl shadow-sm",
              cursor: "w-full bg-primary",
              tab: "h-10 text-sm font-medium",
              tabContent: "group-data-[selected=true]:text-primary"
            }}
          >
            {dailyWords.map((w, idx) => (
              <Tab key={idx.toString()} title={`${idx + 1}`} />
            ))}
          </Tabs>
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

      <div className="controls hidden md:flex">
        <button 
          className="btn secondary" 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={20} /> Zurück
        </button>
        <button className="btn primary" onClick={handleNext}>
          {currentIndex === totalWords - 1 ? 'Lektion beenden' : 'Nächstes Wort'} <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="controls flex md:hidden justify-center mt-2">
        <button className="btn primary w-full" onClick={handleNext}>
          {currentIndex === totalWords - 1 ? 'Lektion beenden' : 'Weiter'} <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
});

WordCard.displayName = 'WordCard';
export default WordCard;
