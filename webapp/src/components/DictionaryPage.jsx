import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, ArrowRight, BookOpen, Flame, ChevronDown, Globe,
  Lightbulb, TrendingUp, Zap, Star, Sparkles
} from 'lucide-react';
import {
  getSuggestions, searchWords, lookupWord, getWordOfDay,
  getFeaturedByCategory, getRandomPsychologyTip
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

// ─── Language Selector (Future-Ready) ─────────────────────────────────────────
const LANGUAGES = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', available: true },
  { code: 'en', name: 'English', flag: '🇬🇧', available: false },
  { code: 'fr', name: 'Français', flag: '🇫🇷', available: false },
  { code: 'es', name: 'Español', flag: '🇪🇸', available: false },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', available: false },
];

const LangSelector = ({ current, onChange }) => {
  const [open, setOpen] = useState(false);
  const cur = LANGUAGES.find(l => l.code === current) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-2xl text-xs font-bold text-foreground/80 hover:text-foreground shadow-sm transition-all cursor-pointer"
        aria-label="Sprache wählen"
      >
        <span>{cur.flag}</span>
        <span>{cur.code.toUpperCase()}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 glass rounded-2xl overflow-hidden shadow-2xl z-50 min-w-[170px] border border-white/20 dark:border-white/10 backdrop-blur-xl"
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
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs transition-colors
                  ${lang.available ? 'hover:bg-primary/10 text-foreground font-semibold cursor-pointer' : 'text-foreground/35 cursor-not-allowed'}`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="flex-1">{lang.name}</span>
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

// ─── Word List Item (Never squished or truncated) ─────────────────────────────
const WordItem = React.memo(({ wordEntry, isActive, onClick }) => {
  const { word, translation } = wordEntry;
  const g = getWordGender(word);
  const bare = word.replace(/^(der|die|das)\s+/i, '');

  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl text-left transition-all group cursor-pointer
        ${isActive
          ? 'bg-primary/15 dark:bg-primary/25 shadow-sm'
          : 'hover:bg-black/[0.035] dark:hover:bg-white/[0.045]'}`}
    >
      {/* Article indicator badge */}
      <div
        className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-[11px] font-black tracking-tight shadow-sm"
        style={{ background: g.dot }}
      >
        {g.label}
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <div className="font-bold text-foreground text-sm sm:text-base leading-snug truncate">
          {bare}
        </div>
        <div className="text-xs text-foreground/55 truncate font-medium">
          {translation}
        </div>
      </div>

      <ArrowRight
        size={16}
        className={`flex-shrink-0 transition-transform duration-200
          ${isActive ? 'text-primary translate-x-1' : 'text-foreground/25 group-hover:text-foreground/60 group-hover:translate-x-1'}`}
      />
    </motion.button>
  );
});
WordItem.displayName = 'WordItem';

// ─── Suggestion Dropdown Row ──────────────────────────────────────────────────
const SuggestionRow = ({ word, translation, onClick }) => {
  const g = getWordGender(word);
  const bare = word.replace(/^(der|die|das)\s+/i, '');

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
    >
      <Search size={14} className="text-foreground/40 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-bold text-foreground">{bare}</span>
        <span className="text-xs text-foreground/50 ml-2 font-medium">{translation}</span>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${g.bg} ${g.text}`}>
        {g.label}
      </span>
    </button>
  );
};

// ─── Empty State on Desktop (Word of the Day + Streak + Tip) ──────────────────
const EmptyDetailDashboard = ({ streak, onSelectWord }) => {
  const wod = useMemo(() => getWordOfDay(), []);
  const tip = useMemo(() => getRandomPsychologyTip(), []);
  const bare = wod.word.replace(/^(der|die|das)\s+/i, '');
  const g = getWordGender(wod.word);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-5 w-full"
    >
      {/* Wort des Tages Card */}
      <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col gap-4 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-foreground/50">
              Wort des Tages
            </span>
          </div>
          <span className="text-xs font-semibold text-foreground/40">
            {new Date().toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>

        <div>
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">{bare}</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-xl uppercase tracking-wider ${g.bg} ${g.text}`}>
              {g.label}
            </span>
          </div>
          <p className="text-base text-foreground/60 font-medium">{wod.translation}</p>
        </div>

        {wod.example && (
          <div className="bg-black/[0.025] dark:bg-white/[0.03] rounded-2xl p-4 border border-black/[0.04] dark:border-white/[0.05]">
            <p className="text-sm font-medium text-foreground leading-relaxed italic">„{wod.example}"</p>
            {wod.exampleTranslation && (
              <p className="text-xs text-foreground/50 mt-1">{wod.exampleTranslation}</p>
            )}
          </div>
        )}

        <button
          onClick={() => onSelectWord(wod)}
          className="self-start flex items-center gap-2 text-xs font-bold text-primary hover:underline underline-offset-4 pt-1 cursor-pointer"
        >
          <span>Vollständige Details & Formen ansehen</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Streak & Engagement Card */}
      <div className="glass rounded-3xl p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-red-500/10 border border-red-500/20 shadow-inner">
            🔥
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-0.5">
              Tägliche Serie
            </div>
            <div className="text-2xl font-black text-foreground">
              {streak > 0 ? `${streak} ${streak === 1 ? 'Tag' : 'Tage'}` : '0 Tage'}
            </div>
            <div className="text-xs text-foreground/50 font-medium">
              {streak > 0 ? 'Hervorragend! Halte die Serie aktiv.' : 'Lerne heute deine 5 Wörter, um eine Serie zu starten!'}
            </div>
          </div>
        </div>
      </div>

      {/* Cognitive Psychology Tip */}
      <div className="glass rounded-3xl p-6 flex items-start gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-amber-500/10 border border-amber-500/20 flex-shrink-0">
          {tip.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-foreground/50">{tip.title}</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 text-foreground/50">
              {tip.tag}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed font-medium">
            {tip.text}
          </p>
        </div>
      </div>

      {/* Stats bar & API attribution */}
      <div className="glass rounded-3xl p-5 shadow-sm">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03]">
            <BookOpen size={16} className="text-primary" />
            <div className="text-sm font-black text-foreground">400+</div>
            <div className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider">Wörter</div>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03]">
            <Zap size={16} className="text-amber-500" />
            <div className="text-sm font-black text-foreground">Offline</div>
            <div className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider">Verfügbar</div>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03]">
            <Globe size={16} className="text-emerald-500" />
            <div className="text-sm font-black text-foreground">Wiktionary</div>
            <div className="text-[10px] font-bold text-foreground/45 uppercase tracking-wider">API Free</div>
          </div>
        </div>
      </div>

      {/* Small corner attribution */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-foreground/35 font-medium py-1">
        <span>Deutschway Dictionary Engine</span>
        <span>·</span>
        <a href="https://en.wiktionary.org" target="_blank" rel="noopener noreferrer" className="hover:text-foreground/60 underline underline-offset-2 transition-colors">
          Wiktionary API
        </a>
      </div>
    </motion.div>
  );
};

// ─── Category Tabs ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'all', label: '⭐ Alle' },
  { key: 'verbs', label: '🔤 Verben' },
  { key: 'der', label: '🔵 der' },
  { key: 'die', label: '🩷 die' },
  { key: 'das', label: '🟢 das' },
];

// ─── Main DictionaryPage Component ────────────────────────────────────────────
const DictionaryPage = ({
  theme,
  selectedWord: propSelectedWord,
  setSelectedWord: propSetSelectedWord,
  streak = 0
}) => {
  // Self-managed state if not controlled from parent
  const [internalSelectedWord, setInternalSelectedWord] = useState(null);
  const selectedWord = propSelectedWord !== undefined ? propSelectedWord : internalSelectedWord;
  const setSelectedWord = propSetSelectedWord || setInternalSelectedWord;

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lang, setLang] = useState('de');

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Live autocomplete suggestions (instant, 60ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const s = getSuggestions(query, 8);
      setSuggestions(s);
      setShowSuggestions(s.length > 0);
    }, 60);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Full search results as user types (debounced 200ms)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    const t = setTimeout(() => {
      const r = searchWords(query, 30);
      setResults(r);
      setHasSearched(true);
    }, 200);

    return () => clearTimeout(t);
  }, [query]);

  // Click outside suggestions
  useEffect(() => {
    const handleOutside = (e) => {
      if (!suggestionsRef.current?.contains(e.target) && e.target !== inputRef.current) {
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

  // Category-filtered words when not searching
  const featured = useMemo(() => {
    const cats = getFeaturedByCategory();
    if (activeCategory === 'all') {
      return [...cats.verbs, ...cats.der, ...cats.die, ...cats.das].slice(0, 20);
    }
    return cats[activeCategory]?.slice(0, 20) || [];
  }, [activeCategory]);

  const displayList = hasSearched ? results : featured;
  const isDetailActive = Boolean(selectedWord);

  return (
    <div className="w-full">
      {/* ── Responsive Two-Column Grid Layout (Mac / iPad / Mobile) ── */}
      <div className="dict-grid-container">

        {/* ── Left Column: Search & Results List ── */}
        <div className={`dict-panel-search ${isDetailActive ? 'hidden lg:flex' : 'flex'}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-none">
                  Wörterbuch
                </h1>
                <span className="p-1 rounded-lg bg-primary/10 text-primary">
                  <BookOpen size={16} />
                </span>
              </div>
              <p className="text-xs text-foreground/45 mt-1 font-medium">
                400+ deutsche Wörter · Bedeutungen &amp; Formen
              </p>
            </div>
            <LangSelector current={lang} onChange={setLang} />
          </div>

          {/* Search Input Box */}
          <div className="relative">
            <div className="glass flex items-center gap-2.5 px-4 py-3.5 rounded-2xl shadow-sm focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search size={18} className="text-foreground/40 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') setShowSuggestions(false);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Suche · z.B. Alltag, lernen, Haus, ü…"
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-foreground/35 text-sm sm:text-base font-medium"
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
                    aria-label="Suche löschen"
                  >
                    <X size={15} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  ref={suggestionsRef}
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl overflow-hidden z-50 shadow-2xl divide-y divide-black/[0.04] dark:divide-white/[0.04] border border-white/20 dark:border-white/10 backdrop-blur-xl"
                >
                  {suggestions.map((s, i) => (
                    <SuggestionRow
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

          {/* Category Tabs (shown when not actively searching) */}
          {!hasSearched && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer
                    ${activeCategory === cat.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'glass text-foreground/60 hover:text-foreground'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Results Count Header */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-foreground/40">
              {hasSearched
                ? `${results.length} Ergebnis${results.length !== 1 ? 'se' : ''}`
                : activeCategory === 'all'
                ? 'Empfohlene Wörter'
                : CATEGORIES.find(c => c.key === activeCategory)?.label}
            </span>
          </div>

          {/* Word List Scroll Container */}
          <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-1">
            {hasSearched && results.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-8 text-center mt-3"
              >
                <div className="text-3xl mb-2">🔍</div>
                <p className="font-bold text-foreground text-sm mb-1">Kein Treffer gefunden</p>
                <p className="text-xs text-foreground/50">
                  Überprüfe die Schreibweise oder probiere ein Synonym.
                </p>
              </motion.div>
            ) : (
              displayList.map((w, i) => (
                <WordItem
                  key={`${w.word}-${i}`}
                  wordEntry={w}
                  isActive={selectedWord?.word === w.word}
                  onClick={() => handleSelectWord(w)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right Column: Detail View or Dashboard ── */}
        <div className={`dict-panel-detail ${isDetailActive ? 'flex' : 'hidden lg:flex'}`}>
          <AnimatePresence mode="wait">
            {selectedWord ? (
              <motion.div
                key={selectedWord.word || 'loading'}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="w-full"
              >
                <DictionaryDetail
                  wordData={selectedWord}
                  onBack={() => setSelectedWord(null)}
                  onSelectWord={handleSelectWord}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty-dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full"
              >
                <EmptyDetailDashboard streak={streak} onSelectWord={handleSelectWord} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default DictionaryPage;
