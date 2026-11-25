import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, BookOpen, ChevronRight } from 'lucide-react';
import { playAudio } from '../utils/audioService';

// ---- Shimmer skeleton ----
const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl bg-black/5 dark:bg-white/5 ${className}`} />
);

const DetailSkeleton = () => (
  <div className="flex flex-col gap-6 w-full">
    <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col gap-5">
      <div className="flex justify-between items-start">
        <Shimmer className="h-5 w-24 rounded-lg" />
        <Shimmer className="h-10 w-10 rounded-full" />
      </div>
      <div className="text-center flex flex-col items-center gap-3">
        <Shimmer className="h-14 w-56 rounded-xl" />
        <Shimmer className="h-5 w-32 rounded-lg" />
      </div>
      <div className="border-t border-black/5 dark:border-white/5 pt-5 flex flex-col gap-3">
        <Shimmer className="h-4 w-full rounded-lg" />
        <Shimmer className="h-4 w-5/6 rounded-lg" />
        <Shimmer className="h-10 w-full rounded-xl" />
      </div>
    </div>
    <Shimmer className="h-48 w-full rounded-3xl" />
    <Shimmer className="h-32 w-full rounded-3xl" />
  </div>
);

// ---- Sub-components ----
const SectionCard = ({ title, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass rounded-3xl p-5 sm:p-6 flex flex-col gap-4"
  >
    <div className="flex items-center gap-2">
      <span className="text-base">{icon}</span>
      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const GenderBadge = ({ genderInfo }) => {
  if (!genderInfo) return null;
  const styles = {
    masculine: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
    feminine: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800/50',
    neuter: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/50',
  };
  return (
    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border ${styles[genderInfo.gender] || 'bg-black/5 dark:bg-white/5 text-foreground/60'}`}>
      {genderInfo.label}
    </span>
  );
};

// Conjugation / declension table
const GrammarTable = ({ rows, columns, data }) => (
  <div className="overflow-x-auto -mx-1">
    <table className="w-full text-sm border-collapse min-w-[280px]">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col} className="text-left text-xs font-bold uppercase tracking-wider text-foreground/40 py-2 px-3 border-b border-black/5 dark:border-white/5 first:pl-0">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row} className={i % 2 === 0 ? 'bg-black/[0.015] dark:bg-white/[0.015]' : ''}>
            <td className="py-2 px-3 pl-0 font-semibold text-foreground/60 text-xs capitalize">{row}</td>
            {columns.slice(1).map(col => (
              <td key={col} className="py-2 px-3 font-medium text-foreground">
                {data[row]?.[col] || data[row] || '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Example sentence card
const ExampleCard = ({ german, english, highlight }) => {
  // Highlight the target word
  const highlightWord = (text, word) => {
    if (!word || !text) return text;
    const bare = word.replace(/^(der|die|das)\s+/i, '');
    const regex = new RegExp(`(${bare})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/50 text-foreground rounded px-0.5">{part}</mark>
      ) : part
    );
  };

  return (
    <div className="bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl p-4 flex flex-col gap-1.5 border border-black/5 dark:border-white/5">
      <p className="font-medium text-foreground leading-relaxed">
        {highlight ? highlightWord(german, highlight) : german}
      </p>
      {english && <p className="text-sm text-foreground/50 italic">{english}</p>}
    </div>
  );
};

// ---- Main Detail Component ----
const DictionaryDetail = ({ wordData, onBack, theme }) => {
  if (!wordData || wordData.loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full flex flex-col gap-4"
      >
        {/* Back button */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="icon-btn flex items-center justify-center w-10 h-10 rounded-full"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <Shimmer className="h-5 w-32 rounded-lg" />
        </div>
        <DetailSkeleton />
      </motion.div>
    );
  }

  const { word, bareWord, translation, genderInfo, isNoun, isVerb, example, exampleTranslation, grammarNote, synonyms, verbForms, nounForms, definitions, additionalExamples } = wordData;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full flex flex-col gap-4"
    >
      {/* Back button */}
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="icon-btn flex items-center justify-center w-10 h-10 rounded-full"
          aria-label="Zurück"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <span className="text-sm text-foreground/50 font-medium">Wörterbuch</span>
        <ChevronRight size={14} className="text-foreground/30" />
        <span className="text-sm font-semibold text-foreground truncate">{bareWord || word}</span>
      </div>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="word-card glass relative overflow-hidden"
      >
        {/* Top row: gender + audio */}
        <div className="card-top">
          {genderInfo ? (
            <GenderBadge genderInfo={genderInfo} />
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/5 text-foreground/40">
              {isVerb ? 'Verb' : 'Wort'}
            </span>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="audio-btn"
            onClick={() => playAudio(`${word}. ${example || ''}`)}
            aria-label="Aussprache"
          >
            <Volume2 size={22} />
          </motion.button>
        </div>

        {/* Word + translation */}
        <div className="word-title">
          <h2 style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)' }}>{word}</h2>
          {translation && <p>{translation}</p>}
        </div>

        {/* Example sentence */}
        {example && (
          <div className="example-section">
            <div className="sentence">{example}</div>
            {exampleTranslation && <div className="translation">{exampleTranslation}</div>}
            {grammarNote && (
              <div className="grammar-breakdown">
                <strong>Grammatikhinweis:</strong>
                <span>{grammarNote}</span>
              </div>
            )}
          </div>
        )}

        {/* Synonyms */}
        {synonyms && synonyms.length > 0 && (
          <div className="synonyms" style={{ paddingTop: example ? 0 : '1rem' }}>
            <strong>Synonyme:</strong>
            {synonyms.map(syn => (
              <span key={syn} className="syn-tag">{syn}</span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Verb conjugation */}
      {isVerb && verbForms && (
        <SectionCard title="Konjugation" icon="🔤">
          <div className="flex flex-col gap-4">
            {/* Präsens */}
            <div>
              <p className="text-xs font-semibold text-foreground/50 mb-2 uppercase tracking-wide">Präsens</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                {Object.entries(verbForms.present).map(([pronoun, form]) => (
                  <div key={pronoun} className="flex justify-between py-1 border-b border-black/5 dark:border-white/5 last:border-0">
                    <span className="text-sm text-foreground/50 font-medium capitalize">{pronoun}</span>
                    <span className="text-sm font-semibold text-foreground">{form}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Präteritum */}
            <div>
              <p className="text-xs font-semibold text-foreground/50 mb-2 uppercase tracking-wide">Präteritum (Vergangenheit)</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                {Object.entries(verbForms.simple_past).map(([pronoun, form]) => (
                  <div key={pronoun} className="flex justify-between py-1 border-b border-black/5 dark:border-white/5 last:border-0">
                    <span className="text-sm text-foreground/50 font-medium capitalize">{pronoun}</span>
                    <span className="text-sm font-semibold text-foreground">{form}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Partizip II */}
            <div className="bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl p-4 border border-black/5 dark:border-white/5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1">Partizip II</p>
                  <p className="text-lg font-bold text-foreground">{verbForms.partizip2}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1 text-right">Hilfsverb</p>
                  <p className="text-lg font-bold text-foreground text-right">{verbForms.auxiliary}</p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Noun declension */}
      {isNoun && nounForms && (
        <SectionCard title="Deklination" icon="📐">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold text-foreground/50 mb-2 uppercase tracking-wide">Singular</p>
              <div className="flex flex-col gap-1">
                {Object.entries(nounForms.singular).map(([cas, form]) => (
                  <div key={cas} className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5 last:border-0">
                    <span className="text-sm text-foreground/50 font-medium">{cas}</span>
                    <span className="text-sm font-semibold text-foreground">{form}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground/50 mb-2 uppercase tracking-wide">Plural</p>
              <div className="flex flex-col gap-1">
                {Object.entries(nounForms.plural).map(([cas, form]) => (
                  <div key={cas} className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5 last:border-0">
                    <span className="text-sm text-foreground/50 font-medium">{cas}</span>
                    <span className="text-sm font-semibold text-foreground">{form}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Wiktionary definitions */}
      {definitions && definitions.length > 0 && (
        <SectionCard title="Bedeutungen (Wiktionary)" icon="📖">
          <div className="flex flex-col gap-4">
            {definitions.map((group, gi) => (
              <div key={gi} className="flex flex-col gap-2">
                {group.pos && (
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-foreground/50 self-start">
                    {group.pos}
                  </span>
                )}
                <ol className="list-decimal list-inside flex flex-col gap-1.5 pl-1">
                  {group.defs.map((def, di) => (
                    <li key={di} className="text-sm text-foreground leading-relaxed">
                      {def.definition}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Example sentences */}
      {(additionalExamples?.length > 0 || example) && (
        <SectionCard title="Beispielsätze" icon="💬">
          <div className="flex flex-col gap-3">
            {example && (
              <ExampleCard
                german={example}
                english={exampleTranslation}
                highlight={word}
              />
            )}
            {additionalExamples?.map((ex, i) => (
              <ExampleCard key={i} german={ex} highlight={word} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* Grammar note (standalone if no example) */}
      {grammarNote && !example && (
        <SectionCard title="Grammatik" icon="📝">
          <p className="text-sm text-foreground/80 leading-relaxed">{grammarNote}</p>
        </SectionCard>
      )}

      {/* Bottom spacing */}
      <div className="h-6" />
    </motion.div>
  );
};

export default DictionaryDetail;
