import React from 'react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { getGenderInfo } from '../utils/grammarEngine';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveSentence from './InteractiveSentence';
import AudioButtonWithSlider from './AudioButtonWithSlider';

const WordCard = React.memo(({
  word,
  currentIndex,
  totalWords,
  handleNext,
  handlePrev,
  dailyWords,
  jumpToWord,
  isSessionComplete,
  onOpenDictionaryWord
}) => {
  if (!word) return null;

  const isLastWord = currentIndex === totalWords - 1;
  const hideNextButton = isLastWord && isSessionComplete;
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
                  className={`relative flex-1 h-10 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
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
          <div className="card-top flex items-center justify-between">
            {genderInfo ? (
              <span className={`gender-badge ${genderInfo.color}`}>
                {genderInfo.label}
              </span>
            ) : (
              <span className="gender-badge opacity-0">...</span>
            )}

            {/* Quick Action Group: Dictionary Link + Audio Hover Slider */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenDictionaryWord && onOpenDictionaryWord(word)}
                className="w-10 h-10 rounded-full glass border border-white/20 dark:border-white/10 flex items-center justify-center text-foreground/60 hover:text-primary transition-colors cursor-pointer shadow-sm"
                title="Im Wörterbuch ansehen"
                aria-label="Im Wörterbuch ansehen"
              >
                <BookOpen size={18} />
              </button>

              <AudioButtonWithSlider text={`${word.word}. ${word.example}`} />
            </div>
          </div>

          <div className="word-title text-center">
            <h2>{word.word}</h2>
            <p>{word.translation}</p>
          </div>

          <div className="example-section">
            <div className="sentence">
              <InteractiveSentence
                text={word.example}
                mainWord={word.word}
                onSelectWord={onOpenDictionaryWord}
              />
            </div>
            <div className="translation">{word.exampleTranslation}</div>

            <div className="grammar-breakdown">
              <strong>Grammatik:</strong>
              <span>{word.grammarNote || "Achten Sie auf den spezifischen Kontext des Wortes."}</span>
            </div>

            {word.synonyms && word.synonyms.length > 0 && (
              <div className="synonyms">
                <strong>Ähnlich:</strong>
                {word.synonyms.map(syn => (
                  <span
                    key={syn}
                    onClick={() => onOpenDictionaryWord && onOpenDictionaryWord({ word: syn, translation: '' })}
                    className="syn-tag cursor-pointer hover:border-primary transition-colors"
                  >
                    {syn}
                  </span>
                ))}
              </div>
            )}

            {/* Dictionary Deep Link */}
            <div className="pt-2">
              <button
                onClick={() => onOpenDictionaryWord && onOpenDictionaryWord(word)}
                className="text-xs font-bold text-primary hover:underline underline-offset-4 cursor-pointer"
              >
                Formen, Konjugation & Wiktionary-Bedeutungen anzeigen →
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Unified Controls for all screens */}
      <div className="controls flex flex-col items-center justify-center mt-6 w-full gap-6">
        <div className="flex w-full justify-between items-center gap-4">
          <button
            className="btn secondary flex items-center gap-2 px-6 py-3 flex-1 md:flex-none justify-center cursor-pointer"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={20} /> <span className="hidden md:inline">Zurück</span>
          </button>

          {!hideNextButton && (
            <button
              className="btn primary flex items-center gap-2 px-6 py-3 flex-1 md:flex-none justify-center cursor-pointer"
              onClick={handleNext}
            >
              {isLastWord ? (
                <span className="font-semibold tracking-wide uppercase text-sm">Lektion beenden</span>
              ) : (
                <><span className="hidden md:inline">Nächstes Wort</span><span className="md:hidden">Weiter</span> <ChevronRight size={20} /></>
              )}
            </button>
          )}
        </div>

        {/* Minimal Pagination Dots */}
        {dailyWords && dailyWords.length > 0 && (
          <div className="flex justify-center w-full mt-2">
            <div className="flex items-center gap-2">
              {dailyWords.map((w, idx) => {
                const isSelected = currentIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => jumpToWord(idx)}
                    className={`relative rounded-full transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'w-6 h-2 bg-primary'
                        : 'w-2 h-2 bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40'
                    }`}
                    aria-label={`Gehe zu Wort ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

WordCard.displayName = 'WordCard';
export default WordCard;
