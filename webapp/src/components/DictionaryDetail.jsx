import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, MessageSquareText,
  Table, BookOpen, Lightbulb, Sparkles
} from 'lucide-react';
import AudioButtonWithSlider from './AudioButtonWithSlider';
import InteractiveSentence from './InteractiveSentence';

// ─── Shimmer Loading Skeleton ────────────────────────────────────────────────
const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse rounded-2xl bg-black/5 dark:bg-white/5 ${className}`} />
);

const LoadingSkeleton = ({ onBack }) => (
  <div className="flex flex-col gap-5 w-full">
    <div className="flex items-center gap-3">
      <button onClick={onBack} className="icon-btn w-10 h-10 shadow-sm" aria-label="Zurück">
        <ArrowLeft size={18} />
      </button>
      <Shimmer className="h-4 w-40 rounded-lg" />
    </div>
    <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <Shimmer className="h-7 w-24 rounded-xl" />
        <Shimmer className="h-10 w-10 rounded-full" />
      </div>
      <div className="flex flex-col items-center gap-3 py-6">
        <Shimmer className="h-12 sm:h-16 w-3/4 max-w-xs rounded-2xl" />
        <Shimmer className="h-5 w-40 rounded-lg" />
      </div>
      <div className="border-t border-black/5 dark:border-white/5 pt-5 flex flex-col gap-3">
        <Shimmer className="h-4 w-full rounded-lg" />
        <Shimmer className="h-4 w-5/6 rounded-lg" />
      </div>
    </div>
    <Shimmer className="h-48 w-full rounded-3xl" />
  </div>
);

// ─── Gender Badge ─────────────────────────────────────────────────────────────
const GENDER_BADGE = {
  masculine: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700/30',
  feminine:  'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700/30',
  neuter:    'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/30',
};

const GenderTag = ({ genderInfo }) => {
  if (!genderInfo) return null;
  const cls = GENDER_BADGE[genderInfo.gender] || 'bg-black/5 dark:bg-white/5 text-foreground/50';
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold tracking-wider uppercase border ${cls}`}>
      {genderInfo.label}
    </span>
  );
};

// ─── Section Card Wrapper ─────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.25, ease: 'easeOut' }}
    className="glass rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.05]">
      {Icon && <Icon size={16} className="text-primary" />}
      <h3 className="text-xs font-black uppercase tracking-widest text-foreground/55">{title}</h3>
    </div>
    <div className="px-6 py-5">{children}</div>
  </motion.div>
);

// ─── Form Table ──────────────────────────────────────────────────────────────
const FormTable = ({ rows, data }) => (
  <div className="flex flex-col divide-y divide-black/[0.04] dark:divide-white/[0.04]">
    {rows.map((row) => (
      <div key={row} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
        <span className="text-xs font-semibold text-foreground/50 capitalize w-24 sm:w-28 flex-shrink-0">{row}</span>
        <span className="text-sm font-semibold text-foreground text-right">{data[row] || '—'}</span>
      </div>
    ))}
  </div>
);

// ─── Example Sentence Card ────────────────────────────────────────────────────
const ExampleCard = ({ german, english, mainWord, onSelectWord, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-black/[0.02] dark:bg-white/[0.025] rounded-2xl p-4 sm:p-5 border border-black/[0.04] dark:border-white/[0.05] relative"
  >
    <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
      <InteractiveSentence text={german} mainWord={mainWord} onSelectWord={onSelectWord} />
    </p>
    {english && (
      <p className="text-xs sm:text-sm text-foreground/50 italic mt-2 leading-relaxed">{english}</p>
    )}
  </motion.div>
);

// ─── Main DictionaryDetail Component ──────────────────────────────────────────
const DictionaryDetail = ({ wordData, onBack, onSelectWord }) => {
  if (!wordData || wordData.loading) {
    return <LoadingSkeleton onBack={onBack} />;
  }

  const {
    word,
    bareWord,
    translation,
    genderInfo,
    isNoun,
    isVerb,
    example,
    exampleTranslation,
    grammarNote,
    synonyms,
    verbForms,
    nounForms,
    definitions,
    additionalExamples,
    smartExplainer,
  } = wordData;

  const hasExamples = example || (additionalExamples && additionalExamples.length > 0);

  return (
    <div className="flex flex-col gap-5 w-full pb-8">
      {/* ── Breadcrumb Navigation ── */}
      <div className="flex items-center gap-2.5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="icon-btn flex-shrink-0 w-10 h-10 shadow-sm cursor-pointer"
          aria-label="Zurück zum Wörterbuch"
          title="Zurück zum Wörterbuch"
        >
          <ArrowLeft size={18} />
        </motion.button>

        <button
          onClick={onBack}
          className="text-sm font-semibold text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
        >
          Wörterbuch
        </button>

        <ChevronRight size={14} className="text-foreground/30 flex-shrink-0" />
        <span className="text-sm font-bold text-foreground truncate">{bareWord || word}</span>
      </div>

      {/* ── 1. Main Hero Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="glass rounded-3xl overflow-hidden shadow-sm"
      >
        {/* Top: Gender Tag + Audio Slider */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-2">
          {genderInfo ? (
            <GenderTag genderInfo={genderInfo} />
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold tracking-wider uppercase bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/30">
              {isVerb ? 'Verb' : 'Wort'}
            </span>
          )}

          {/* Audio Pronunciation Button with Hover Volume Slider */}
          <AudioButtonWithSlider text={`${word}. ${example || ''}`} />
        </div>

        {/* Word + Translation */}
        <div className="flex flex-col items-center text-center px-6 sm:px-8 py-6 gap-2">
          <h2
            className="font-black tracking-tight text-foreground leading-tight select-text"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)' }}
          >
            {word}
          </h2>
          {translation && (
            <p className="text-foreground/60 font-medium" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
              {translation}
            </p>
          )}
        </div>

        {/* Synonyms if available */}
        {synonyms && synonyms.length > 0 && (
          <div className="border-t border-black/[0.04] dark:border-white/[0.05] px-6 sm:px-8 py-4 flex flex-wrap gap-2 items-center justify-center">
            <span className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Synonyme:</span>
            {synonyms.map((s) => (
              <button
                key={s}
                onClick={() => onSelectWord && onSelectWord({ word: s, translation: '' })}
                className="text-xs font-medium px-3 py-1 glass rounded-xl text-foreground/80 hover:text-primary transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── 2. Beispielsätze (Placed immediately below the main card as requested) ── */}
      {hasExamples && (
        <Section icon={MessageSquareText} title="Beispielsätze" delay={0.04}>
          <div className="flex flex-col gap-3">
            {example && (
              <ExampleCard
                german={example}
                english={exampleTranslation}
                mainWord={word}
                onSelectWord={onSelectWord}
                delay={0}
              />
            )}
            {additionalExamples && additionalExamples.map((ex, i) => (
              <ExampleCard
                key={i}
                german={ex}
                mainWord={word}
                onSelectWord={onSelectWord}
                delay={(i + 1) * 0.04}
              />
            ))}
          </div>
        </Section>
      )}

      {/* ── 3. Konjugation (for verbs) ── */}
      {isVerb && verbForms && (
        <Section icon={Table} title="Konjugation" delay={0.06}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-foreground/40 mb-3">Präsens</p>
              <FormTable rows={Object.keys(verbForms.present)} data={verbForms.present} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-foreground/40 mb-3">Präteritum</p>
              <FormTable rows={Object.keys(verbForms.simple_past)} data={verbForms.simple_past} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl p-4 bg-primary/10 border border-primary/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Partizip II</p>
              <p className="text-lg sm:text-xl font-black text-foreground">{verbForms.partizip2}</p>
            </div>
            <div className="rounded-2xl p-4 bg-black/[0.025] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Hilfsverb</p>
              <p className="text-lg sm:text-xl font-black text-foreground">{verbForms.auxiliary}</p>
            </div>
          </div>
        </Section>
      )}

      {/* ── 3. Deklination (for nouns) ── */}
      {isNoun && nounForms && (
        <Section icon={Table} title="Deklination (Alle 4 Fälle)" delay={0.06}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-foreground/40 mb-3">Singular</p>
              <FormTable rows={Object.keys(nounForms.singular)} data={nounForms.singular} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-foreground/40 mb-3">Plural</p>
              <FormTable rows={Object.keys(nounForms.plural)} data={nounForms.plural} />
            </div>
          </div>
        </Section>
      )}

      {/* ── 4. Wiktionary Definitions ── */}
      {definitions && definitions.length > 0 && (
        <Section icon={BookOpen} title="Bedeutungen & Definitionen (Wiktionary)" delay={0.08}>
          <div className="flex flex-col gap-4">
            {definitions.map((group, gi) => (
              <div key={gi} className="flex flex-col gap-2">
                {group.pos && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-black/[0.04] dark:bg-white/[0.06] text-foreground/60 self-start">
                    {group.pos}
                  </span>
                )}
                <ol className="list-decimal list-inside flex flex-col gap-2 pl-0.5">
                  {group.defs.map((def, di) => (
                    <li key={di} className="text-sm sm:text-base text-foreground/85 leading-relaxed font-normal">
                      {def.definition}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
            <p className="text-[11px] text-foreground/35 text-right pt-2 border-t border-black/[0.03] dark:border-white/[0.03]">
              Quelle: <a href="https://en.wiktionary.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground/50 transition-colors">Wiktionary</a>
            </p>
          </div>
        </Section>
      )}

      {/* ── 5. Endung-Regel & Grammatik (Placed at the end as requested) ── */}
      {(grammarNote || smartExplainer) && (
        <Section icon={Lightbulb} title="Grammatik & Wortbildung" delay={0.1}>
          <div className="flex flex-col gap-3">
            {grammarNote && (
              <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                {grammarNote}
              </p>
            )}
            {smartExplainer && (
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-black/[0.025] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary font-extrabold text-xs flex-shrink-0">
                  {smartExplainer.badge}
                </span>
                <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed font-medium">
                  {smartExplainer.note}
                </p>
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  );
};

export default DictionaryDetail;
