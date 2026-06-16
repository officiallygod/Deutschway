import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { getRandomFunFact } from '../utils/grammarEngine';
import { motion, AnimatePresence } from 'framer-motion';

const FunFactWidget = React.memo(() => {
  const [fact, setFact] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef(null);

  useEffect(() => {
    setFact(getRandomFunFact());
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!fact) return null;

  return (
    <div className="relative" ref={widgetRef}>
      <motion.button 
        whileTap={{ scale: 0.9 }}
        className={`icon-btn flex items-center justify-center w-11 h-11 rounded-full transition-colors ${isOpen ? 'bg-black/10 dark:bg-white/20' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Wusstest du schon?"
      >
        <Lightbulb size={24} className={isOpen ? "text-primary" : "text-foreground"} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-full mt-3 right-0 w-[280px] md:w-[320px] bg-white/95 dark:bg-[#1a1c23]/95 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-black/5 dark:border-white/10 rounded-2xl p-4 z-[9999] origin-top-right"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase opacity-70 text-primary">
                <Lightbulb size={14} />
                <span>Wusstest du schon?</span>
              </div>
              <button 
                className="opacity-50 hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 rounded-full p-1" 
                onClick={() => setIsOpen(false)} 
                aria-label="Schließen"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-[14px] leading-relaxed font-medium text-foreground/90">
              {fact}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

FunFactWidget.displayName = 'FunFactWidget';
export default FunFactWidget;
