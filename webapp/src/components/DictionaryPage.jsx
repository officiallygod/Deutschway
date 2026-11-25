import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, ArrowRight, BookOpen, ChevronDown, Globe,
  Sparkles, Check
} from 'lucide-react';
import {
  getSuggestions, searchWords, lookupWord, getWordOfDay,
  getFeaturedByCategory
} from '../services/dictionaryService';
import DictionaryDetail from './DictionaryDetail';

// ─── Article & Gender Styling ────────────────────────────────────────────────
const GENDER_CONFIG = {
  masculine: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: '#007aff', label: 'der' },
  feminine:  { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', dot: '#ff2d55', label: 'die' },
  neuter:    { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: '#34c759', label: 'das' },
  verb:      { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: '#ff9500', label: 'Verb' },
};

function getWordGender(word) {
  if (/^der\s/i.test(word)) return GENDER_CONFIG.masculine;
  if (/^die\s/i.test(word)) return GENDER_CONFIG.feminine;
  if (/^das\s/i.test(word)) return GENDER_CONFIG.neuter;
  return GENDER_CONFIG.verb;
}

// ─── Language Selector (With Guaranteed Click-Outside Dismiss) ───────────────
const LANGUAGES = [
  { code: 'de', name: 'Deutsch', flag: 'DE', available: true },
  { code: 'en', name: 'English', flag: 'EN', available: false },
  { code: 'fr', name: 'Français', flag: 'FR', available: false },
  { code: 'es', name: 'Español', flag: 'ES', available: false },
];

const LangSelector = ({ current, onChange }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const cur = LANGUAGES.find(l => l.code === current) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-2xl text-xs font-bold text-foreground/80 hover:text-foreground shadow-sm transition-all cursor-pointer"
        aria-label="Sprache wählen"
      >
        <span className="font-extrabold">{cur.flag}</span>
        <span>{cur.code.toUpperCase()}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 glass rounded-2xl overflow-hidden shadow-2xl z-50 min-w-[170px] border border-white/20 dark:border-white/10 backdrop-blur-2xl"
          >
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                disabled={!lang.available}
                onClick={() => {
                  if (lang.available) {
                    onChange(lang.code);
                    setOpen(false);
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors cursor-pointer
                  ${lang.available ? 'hover:bg-primary/10 text-foreground font-semibold' : 'text-foreground/35 cursor-not-allowed'}`}
              >
                <span>{lang.name}</span>
                {!lang.available && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">Bald</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Word List Item ──────────────────────────────────────────────────────────
const WordItem = React.memo(({ wordEntry, onClick }) => {
  const { word, translation } = wordEntry;
  const g = getWordGender(word);
  const bare = word.replace(/^(der|die|das)\s+/i, '');

  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="glass w-full flex items-center gap-3.5 p-4 rounded-2xl text-left transition-all hover:border-primary/40 group cursor-pointer shadow-sm"
    >
      <div
        className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-[11px] font-black tracking-tight shadow-sm"
        style={{ background: g.dot }}
      >
        {g.label}
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <div className="font-bold text-foreground text-base leading-snug truncate">
          {bare}
        </div>
        <div className="text-xs text-foreground/60 truncate font-medium mt-0.5">
          {translation}
        </div>
      </div>

      <ArrowRight
        size={16}
        className="flex-shrink-0 text-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all"
      />
    </motion.button>
  );
});
WordItem.displayName = 'WordItem';

// ─── Main Dictionary Page Component ──────────────────────────────────────────
const DictionaryPage = ({
  theme,
  selectedWord: propSelectedWord,
  setSelectedWord: propSetSelectedWord,
  streak = 0
}) => {
  const [internalSelectedWord, setInternalSelectedWord] = useState(null);
  const selectedWord = propSelectedWord !== undefined ? propSelectedWord : internalSelectedWord;
  const setSelectedWord = propSetSelectedWord || setInternalSelectedWord;

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [lang, setLang] = useState('de');

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Instant suggestions (60ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const s = getSuggestions(query, 6);
      setSuggestions(s);
      setShowSuggestions(s.length > 0);
    }, 60);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Full search results as user types (150ms)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    const t = setTimeout(() => {
      const r = searchWords(query, 25);
      setResults(r);
      setHasSearched(true);
    }, 150);

    return () => clearTimeout(t);
  }, [query]);

  // Click outside to close autocomplete dropdown
  useEffect(() => {
    const handleOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) && e.target !== inputRef.current) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSelectWord = useCallback(async (wordEntry) => {
    setSelectedWord({ loading: true, word: wordEntry.word });
    setShowSuggestions(false);
    const detail = await lookupWord(wordEntry.word, lang);
    setSelectedWord(detail);
  }, [lang, setSelectedWord]);

  const handleSelectSuggestion = (s) => {
    setQuery(s.word.replace(/^(der|die|das)\s+/i, ''));
    setShowSuggestions(false);
    handleSelectWord(s);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Filtered words for the default view when no search query
  const featured = useMemo(() => {
    const cats = getFeaturedByCategory();
    if (activeFilter === 'verbs') return cats.verbs.slice(0, 16);
    if (activeFilter === 'der') return cats.der.slice(0, 16);
    if (activeFilter === 'die') return cats.die.slice(0, 16);
    if (activeFilter === 'das') return cats.das.slice(0, 16);
    return [...cats.verbs.slice(0, 5), ...cats.der.slice(0, 4), ...cats.die.slice(0, 4), ...cats.das.slice(0, 4)];
  }, [activeFilter]);

  // If a word is selected, show its full detail page
  if (selectedWord) {
    return (
      <div className="w-full max-w-3xl mx-auto px-2 sm:px-0">
        <DictionaryDetail
          wordData={selectedWord}
          onBack={() => setSelectedWord(null)}
          onSelectWord={handleSelectWord}
        />
      </div>
    );
  }

  // Main centered search page
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 pt-2 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <span>Wörterbuch</span>
            <span className="p-1 rounded-xl bg-primary/10 text-primary">
              <BookOpen size={20} />
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground/50 mt-1 font-medium">
            Deutsche Wörter mit Bedeutungen, Formen und Beispielsätzen
          </p>
        </div>
        <LangSelector current={lang} onChange={setLang} />
      </div>

      {/* Main Search Bar (Guaranteed No Overlaps) */}
      <div className="relative w-full">
        <div className="glass flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-sm focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/25 transition-all">
          <Search size={20} className="text-foreground/40 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowSuggestions(false);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder="Wort suchen · z.B. Alltag, lernen, Haus, ü..."
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-foreground/35 text-base font-medium"
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
                className="p-1 rounded-lg text-foreground/40 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Eingabe löschen"
              >
                <X size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Autocomplete Dropdown (Closes on outside click) */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl overflow-hidden z-50 shadow-2xl divide-y divide-black/[0.04] dark:divide-white/[0.04] border border-white/20 dark:border-white/10 backdrop-blur-2xl"
            >
              {suggestions.map((s, i) => {
                const g = getWordGender(s.word);
                const bare = s.word.replace(/^(der|die|das)\s+/i, '');
                return (
                  <button
                    key={`${s.word}-${i}`}
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    <Search size={14} className="text-foreground/40 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-foreground">{bare}</span>
                      <span className="text-xs text-foreground/50 ml-2 font-medium">{s.translation}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${g.bg} ${g.text}`}>
                      {g.label}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Chips (Properly spaced flex-wrap, NEVER clipping) */}
      {!hasSearched && (
        <div className="w-full flex flex-wrap gap-2 pt-1">
          {[
            { id: 'all', label: 'Alle Wörter' },
            { id: 'verbs', label: 'Verben' },
            { id: 'der', label: 'der (Maskulinum)' },
            { id: 'die', label: 'die (Femininum)' },
            { id: 'das', label: 'das (Neutrum)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'glass text-foreground/60 hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Results / Word List */}
      <div className="w-full flex flex-col gap-2.5">
        {hasSearched ? (
          <>
            <div className="text-xs font-bold uppercase tracking-wider text-foreground/45 px-1">
              {results.length} Ergebnis{results.length !== 1 ? 'se' : ''}
            </div>

            {results.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center mt-2">
                <div className="text-3xl mb-2">🔍</div>
                <p className="font-bold text-foreground text-sm mb-1">Kein Treffer gefunden</p>
                <p className="text-xs text-foreground/50">
                  Überprüfe die Schreibweise oder probiere ein Synonym.
                </p>
              </div>
            ) : (
              results.map((w, i) => (
                <WordItem
                  key={`${w.word}-${i}`}
                  wordEntry={w}
                  onClick={() => handleSelectWord(w)}
                />
              ))
            )}
          </>
        ) : (
          <>
            <div className="text-xs font-bold uppercase tracking-wider text-foreground/45 px-1">
              {activeFilter === 'all' ? 'Empfohlene Wörter' : 'Ausgewählte Wörter'}
            </div>
            {featured.map((w, i) => (
              <WordItem
                key={`${w.word}-${i}`}
                wordEntry={w}
                onClick={() => handleSelectWord(w)}
              />
            ))}
          </>
        )}
      </div>

      {/* Clean Bottom Attribution */}
      <div className="text-[11px] text-foreground/35 font-medium flex items-center justify-center gap-2 pt-4">
        <span>Deutschway Wörterbuch</span>
        <span>·</span>
        <a href="https://en.wiktionary.org" target="_blank" rel="noopener noreferrer" className="hover:text-foreground/60 underline underline-offset-2">
          Wiktionary API
        </a>
      </div>
    </div>
  );
};

export default DictionaryPage;
