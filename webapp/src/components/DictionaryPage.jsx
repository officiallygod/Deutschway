import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Volume2, BookOpen } from 'lucide-react';
import { getSuggestions, searchWords, lookupWord } from '../services/dictionaryService';
import { playAudio } from '../utils/audioService';
import DictionaryDetail from './DictionaryDetail';

// ---- Shimmer / Skeleton ----
const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl bg-black/5 dark:bg-white/5 ${className}`} />
);

const SearchResultSkeleton = () => (
  <div className="flex flex-col gap-3 w-full">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="glass p-4 rounded-2xl flex items-center gap-4">
        <Shimmer className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Shimmer className="h-4 w-32 rounded-lg" />
          <Shimmer className="h-3 w-20 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

// ---- Gender Badge ----
const GenderBadge = ({ genderInfo }) => {
  if (!genderInfo) return null;
  const colors = {
    masculine: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    feminine: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',
    neuter: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  };
  return (
    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${colors[genderInfo.gender] || 'bg-black/5 dark:bg-white/5 text-foreground/60'}`}>
      {genderInfo.label}
    </span>
  );
};

// ---- Word List Item ----
const WordListItem = ({ word, translation, genderInfo, onClick }) => (
  <motion.button
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="glass w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 hover:shadow-md group"
  >
    <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
      style={{ background: 'var(--primary-accent)', opacity: 0.12 }}>
      <BookOpen size={18} style={{ color: 'var(--primary-accent)', opacity: 1 / 0.12 }} className="opacity-100" />
    </div>
    <div className="flex flex-col flex-1 min-w-0">
      <span className="font-semibold text-foreground truncate">{word}</span>
      <span className="text-sm text-foreground/50 truncate">{translation}</span>
    </div>
    {genderInfo && <GenderBadge genderInfo={genderInfo} />}
    <ArrowRight size={16} className="text-foreground/30 group-hover:text-foreground/60 flex-shrink-0 transition-colors" />
  </motion.button>
);

// ---- Suggestion Dropdown Item ----
const SuggestionItem = ({ word, translation, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
  >
    <Search size={14} className="text-foreground/40 flex-shrink-0" />
    <div className="flex flex-col min-w-0">
      <span className="text-sm font-semibold text-foreground truncate">{word}</span>
      <span className="text-xs text-foreground/50 truncate">{translation}</span>
    </div>
  </button>
);

// ---- Main Dictionary Page ----
const DictionaryPage = ({ theme, toggleTheme }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Live suggestions while typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const results = getSuggestions(query, 6);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 100);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close suggestion dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (!suggestionsRef.current?.contains(e.target) && e.target !== inputRef.current) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = useCallback(async (q = query) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    setSearching(true);
    setHasSearched(true);
    setSelectedWord(null);

    // Instant local results
    const local = searchWords(trimmed, 20);
    setSearchResults(local);
    setSearching(false);
  }, [query]);

  const handleSelectWord = useCallback(async (wordEntry) => {
    setSelectedWord({ loading: true, word: wordEntry.word });
    setShowSuggestions(false);

    const detail = await lookupWord(wordEntry.word);
    setSelectedWord(detail);
  }, []);

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.word);
    handleSearch(suggestion.word);
    setTimeout(() => handleSelectWord(suggestion), 10);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') { setShowSuggestions(false); inputRef.current?.blur(); }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setSelectedWord(null);
    setHasSearched(false);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // If a word is selected, show its detail view
  if (selectedWord) {
    return (
      <DictionaryDetail
        wordData={selectedWord}
        onBack={() => setSelectedWord(null)}
        theme={theme}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col items-center gap-6"
    >
      {/* Hero heading */}
      <div className="text-center pt-2 pb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-2">
          🇩🇪 Wörterbuch
        </h1>
        <p className="text-foreground/50 text-sm sm:text-base font-medium">
          Suche nach deutschen Wörtern · Bedeutungen, Formen, Sätze
        </p>
      </div>

      {/* Search bar */}
      <div className="relative w-full max-w-xl">
        <div className="glass flex items-center gap-3 px-4 py-3 rounded-2xl shadow-sm focus-within:shadow-md transition-shadow">
          <Search size={20} className="text-foreground/40 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="z.B. lernen, das Haus, schön…"
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-foreground/30 text-base font-medium"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearSearch}
                className="p-1 rounded-lg text-foreground/40 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </motion.button>
            )}
          </AnimatePresence>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => handleSearch()}
            className="px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all"
            style={{ background: 'var(--primary-accent)' }}
          >
            Suchen
          </motion.button>
        </div>

        {/* Autocomplete suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl overflow-hidden z-50 shadow-xl divide-y divide-black/5 dark:divide-white/5"
            >
              {suggestions.map((s, i) => (
                <SuggestionItem
                  key={`${s.word}-${i}`}
                  word={s.word}
                  translation={s.translation}
                  onClick={() => handleSelectSuggestion(s)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results area */}
      <div className="w-full max-w-xl">
        {searching ? (
          <SearchResultSkeleton />
        ) : hasSearched && searchResults.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-8 text-center"
          >
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-semibold text-foreground mb-1">Kein Treffer</p>
            <p className="text-sm text-foreground/50">Versuche eine andere Schreibweise.</p>
          </motion.div>
        ) : searchResults.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-3"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 px-1">
              {searchResults.length} Ergebnis{searchResults.length !== 1 ? 'se' : ''}
            </p>
            {searchResults.map((w, i) => {
              const genderInfo = (() => {
                if (/^der\s/i.test(w.word)) return { gender: 'masculine', label: 'Maskulinum' };
                if (/^die\s/i.test(w.word)) return { gender: 'feminine', label: 'Femininum' };
                if (/^das\s/i.test(w.word)) return { gender: 'neuter', label: 'Neutrum' };
                return null;
              })();
              return (
                <WordListItem
                  key={`${w.word}-${i}`}
                  word={w.word}
                  translation={w.translation}
                  genderInfo={genderInfo}
                  onClick={() => handleSelectWord(w)}
                />
              );
            })}
          </motion.div>
        ) : !hasSearched ? (
          <QuickStartSection onSelect={handleSelectWord} />
        ) : null}
      </div>
    </motion.div>
  );
};

// ---- Quick start: show some words when no search yet ----
const FEATURED = [
  { word: 'der Alltag', translation: 'Everyday life' },
  { word: 'die Erfahrung', translation: 'Experience' },
  { word: 'unterstützen', translation: 'To support' },
  { word: 'das Vertrauen', translation: 'Trust' },
  { word: 'die Möglichkeit', translation: 'Possibility' },
  { word: 'entscheiden', translation: 'To decide' },
];

const QuickStartSection = ({ onSelect }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
    <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 px-1">Beliebte Wörter</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {FEATURED.map((w, i) => {
        const genderInfo = (() => {
          if (/^der\s/i.test(w.word)) return { gender: 'masculine', label: 'Maskulinum' };
          if (/^die\s/i.test(w.word)) return { gender: 'feminine', label: 'Femininum' };
          if (/^das\s/i.test(w.word)) return { gender: 'neuter', label: 'Neutrum' };
          return null;
        })();
        return (
          <WordListItem
            key={i}
            word={w.word}
            translation={w.translation}
            genderInfo={genderInfo}
            onClick={() => onSelect(w)}
          />
        );
      })}
    </div>
  </motion.div>
);

export default DictionaryPage;
