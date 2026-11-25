import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, BookOpen } from 'lucide-react';
import { playAudio } from '../utils/audioService';
import { findLocalWord, stripHtml, isHoverableVocabWord } from '../services/dictionaryService';

const WordBubble = ({ entry, onSelectWord }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 p-3 rounded-2xl glass shadow-2xl border border-white/20 dark:border-white/10 flex flex-col gap-1.5 min-w-[200px] max-w-[280px] text-left cursor-default backdrop-blur-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-extrabold text-sm text-foreground truncate">{entry.word}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            playAudio(entry.word);
          }}
          className="p-1 text-primary hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
          title="Aussprache anhören"
        >
          <Volume2 size={14} />
        </button>
      </div>

      <div className="text-xs text-foreground/75 font-medium leading-tight">
        {entry.translation}
      </div>

      {onSelectWord && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectWord(entry);
          }}
          className="mt-1 flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-xl bg-primary text-white text-[11px] font-bold shadow-sm hover:opacity-95 transition-all cursor-pointer"
        >
          <BookOpen size={11} />
          <span>Im Wörterbuch öffnen</span>
        </button>
      )}

      {/* Triangle pointer */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-solid border-transparent border-t-white/80 dark:border-t-black/60 pointer-events-none" />
    </motion.div>
  );
};

const InteractiveWord = ({ text, entry, onSelectWord }) => {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-block cursor-pointer font-medium text-foreground hover:text-primary transition-colors hover:underline underline-offset-4 decoration-primary/40 px-0.5"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
    >
      {text}
      <AnimatePresence>
        {open && <WordBubble entry={entry} onSelectWord={onSelectWord} />}
      </AnimatePresence>
    </span>
  );
};

/**
 * InteractiveSentence
 * Clean, professional German sentence renderer with:
 * - Subtle highlight on the target word
 * - Hover / tap tooltips ONLY on true vocabulary words from hashmap (no pronouns, no sentence starters)
 * - Audio pronunciation and dictionary jump
 */
const InteractiveSentence = ({ text, mainWord, onSelectWord }) => {
  const clean = useMemo(() => stripHtml(text || ''), [text]);
  const mainBare = useMemo(() => mainWord?.replace(/^(der|die|das)\s+/i, '').trim().toLowerCase() || '', [mainWord]);

  // Tokenize words vs punctuation
  const tokens = useMemo(() => {
    const result = [];
    const re = /([A-ZÄÖÜa-zäöüß]+(?:-[A-ZÄÖÜa-zäöüß]+)*)|([^A-ZÄÖÜa-zäöüß]+)/g;
    let m;
    while ((m = re.exec(clean)) !== null) {
      result.push({ text: m[0], isWord: Boolean(m[1]) });
    }
    return result;
  }, [clean]);

  return (
    <span>
      {tokens.map((tok, i) => {
        if (!tok.isWord) return <span key={i}>{tok.text}</span>;

        const lower = tok.text.toLowerCase();

        // Main target word: elegant highlight
        if (mainBare && lower === mainBare) {
          return (
            <mark key={i} className="bg-amber-300/35 dark:bg-amber-400/25 text-inherit font-semibold rounded px-1 py-0.5 not-italic">
              {tok.text}
            </mark>
          );
        }

        // Check if this token is a genuine vocabulary word from our hashmap (and not a stop word)
        if (isHoverableVocabWord(tok.text)) {
          const entry = findLocalWord(tok.text);
          if (entry && entry.word.toLowerCase() !== mainWord?.toLowerCase()) {
            return (
              <InteractiveWord
                key={i}
                text={tok.text}
                entry={entry}
                onSelectWord={onSelectWord}
              />
            );
          }
        }

        return <span key={i}>{tok.text}</span>;
      })}
    </span>
  );
};

export default React.memo(InteractiveSentence);
