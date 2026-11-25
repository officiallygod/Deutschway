import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Volume2, Sparkles, BookOpen, Flame, ArrowRight, Check,
  ChevronRight, ChevronLeft, HelpCircle
} from 'lucide-react';
import InteractiveSentence from './InteractiveSentence';

const STEPS = [
  {
    id: 'daily',
    badge: 'Schritt 1 von 4',
    title: '5 Wörter täglich meistern',
    icon: '🎯',
    description:
      'Lerne jeden Tag 5 sorgfältig ausgewählte deutsche Wörter mit Beispielsätzen, Grammatikregeln und nativer Aussprache.',
    preview: (
      <div className="glass rounded-2xl p-5 w-full flex flex-col items-center text-center gap-3 border border-white/20 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
            Maskulinum
          </span>
          <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Volume2 size={16} />
          </span>
        </div>
        <div>
          <div className="text-2xl font-black text-foreground">der Alltag</div>
          <div className="text-xs text-foreground/60 font-medium">Everyday life</div>
        </div>
        <div className="text-xs text-foreground/75 italic bg-black/[0.025] dark:bg-white/[0.03] p-2.5 rounded-xl w-full">
          „Der Alltag in Berlin ist oft sehr hektisch."
        </div>
      </div>
    )
  },
  {
    id: 'hover',
    badge: 'Schritt 2 von 4',
    title: 'Interaktive Wörter im Satz',
    icon: '✨',
    description:
      'Fahre mit der Maus über unterstrichene Wörter im Beispielsatz oder tippe darauf: Ein Dialog zeigt dir sofort Bedeutung und Aussprache!',
    preview: (
      <div className="glass rounded-2xl p-5 w-full flex flex-col items-center gap-3 border border-white/20 dark:border-white/10 shadow-sm text-left">
        <div className="text-[11px] font-bold uppercase tracking-wider text-foreground/45 flex items-center gap-1.5">
          <Sparkles size={12} className="text-amber-500" />
          <span>Probiere es hier aus (Hover / Tap):</span>
        </div>
        <div className="text-sm font-medium text-foreground bg-black/[0.025] dark:bg-white/[0.03] p-3.5 rounded-xl w-full leading-relaxed relative">
          <InteractiveSentence
            text="Die Erfahrung zeigt, dass Unterstützung und Vertrauen wichtig sind."
            mainWord="die Erfahrung"
          />
        </div>
        <div className="text-[11px] text-foreground/50 font-medium text-center w-full">
          💡 Tippe auf „Unterstützung" oder „Vertrauen" oben!
        </div>
      </div>
    )
  },
  {
    id: 'streaks',
    badge: 'Schritt 3 von 4',
    title: 'Serien & Tägliche XP',
    icon: '🔥',
    description:
      'Sammle 10 XP pro Wort (50 XP Tagesziel). Halte deine Serie aktiv und wiederhole vergangene Tage jederzeit über den Kalender.',
    preview: (
      <div className="glass rounded-2xl p-5 w-full flex flex-col gap-3 border border-white/20 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-foreground/40">Deine Serie</div>
              <div className="text-lg font-black text-foreground">7 Tage aktiv!</div>
            </div>
          </div>
          <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-red-500 text-white shadow-sm">
            Streak On!
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <Check size={18} className="text-emerald-500" />
            <span className="text-xs font-bold text-foreground">Tagesziel: 5 / 5 Wörter</span>
          </div>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">+50 XP</span>
        </div>
      </div>
    )
  },
  {
    id: 'dictionary',
    badge: 'Schritt 4 von 4',
    title: 'Vollständiges Wörterbuch',
    icon: '📖',
    description:
      'Über 400 Wörter mit automatischer Umlaut-Erkennung (z.B. „u" findet auch „ü"), Konjugationen (Partizip II) und Deklinationen.',
    preview: (
      <div className="glass rounded-2xl p-5 w-full flex flex-col gap-3 border border-white/20 dark:border-white/10 shadow-sm text-left">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-xs text-foreground/75 font-semibold">
          <span>🔍 Suche nach: „u"</span>
          <span className="ml-auto text-[10px] font-black uppercase text-primary">Findet auch „ü"</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-[10px] font-black uppercase text-primary">Partizip II</div>
            <div className="font-extrabold text-foreground">unterstützt</div>
          </div>
          <div className="p-2.5 rounded-xl bg-black/[0.025] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
            <div className="text-[10px] font-black uppercase text-foreground/40">Alle 4 Fälle</div>
            <div className="font-extrabold text-foreground">Nom, Akk, Dat, Gen</div>
          </div>
        </div>
      </div>
    )
  }
];

export const WALKTHROUGH_STORAGE_KEY = 'deutschway_walkthrough_seen';

const WalkthroughModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleComplete = () => {
    try {
      localStorage.setItem(WALKTHROUGH_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Frosted Glass Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleComplete}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/30 dark:border-white/10 z-10 flex flex-col gap-6 backdrop-blur-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-xl">
              {step.badge}
            </span>

            <button
              onClick={handleComplete}
              className="p-1.5 rounded-full text-foreground/40 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Schließen"
              title="Tour schließen"
            >
              <X size={20} />
            </button>
          </div>

          {/* Step Content */}
          <div className="flex flex-col gap-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <span className="text-2xl">{step.icon}</span>
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {step.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed font-medium">
              {step.description}
            </p>
          </div>

          {/* Interactive Preview Container */}
          <div className="w-full min-h-[160px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {step.preview}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls: Dots & Navigation Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] dark:border-white/[0.05]">
            {/* Step Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentStep === idx
                      ? 'w-6 bg-primary'
                      : 'w-2 bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40'
                  }`}
                  aria-label={`Gehe zu Schritt ${idx + 1}`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleComplete}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
              >
                Überspringen
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer"
              >
                <span>{isLastStep ? 'Los geht’s!' : 'Weiter'}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default React.memo(WalkthroughModal);
