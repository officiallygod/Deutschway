import React, { useState, useEffect } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { getRandomFunFact } from '../utils/grammarEngine';
import { motion, AnimatePresence } from 'framer-motion';

const FunFactWidget = React.memo(() => {
  const [fact, setFact] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    setFact(getRandomFunFact());
  }, []);

  if (!fact) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={isExpanded ? 'expanded' : 'collapsed'}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-6 right-6 z-50 flex md:block"
      >
        {!isExpanded ? (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="md:hidden w-14 h-14 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-2xl shadow-xl border border-white/20 dark:border-white/10 flex items-center justify-center cursor-pointer"
            onClick={() => setIsExpanded(true)}
            aria-label="Wusstest du schon?"
          >
            <Lightbulb size={24} color="var(--primary-accent)" />
          </motion.button>
        ) : (
          <div className="w-[calc(100vw-3rem)] max-w-[320px] bg-white/70 dark:bg-black/50 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/30 dark:border-white/10 rounded-[28px] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold opacity-70">
                <Lightbulb size={16} color="var(--primary-accent)" />
                <span>Wusstest du schon?</span>
              </div>
              <button 
                className="md:hidden opacity-50 hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 rounded-full p-1" 
                onClick={() => setIsExpanded(false)} 
                aria-label="Schließen"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-[15px] leading-relaxed font-medium">
              {fact}
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});

FunFactWidget.displayName = 'FunFactWidget';
export default FunFactWidget;
