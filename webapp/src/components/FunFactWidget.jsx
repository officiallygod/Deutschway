import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { getRandomFunFact } from '../utils/grammarEngine';
import { motion, AnimatePresence } from 'framer-motion';

const FunFactWidget = React.memo(() => {
  const [fact, setFact] = useState('');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isExpandedDesktop, setIsExpandedDesktop] = useState(true);
  const widgetRef = useRef(null);

  useEffect(() => {
    setFact(getRandomFunFact());
  }, []);

  // Close mobile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsOpenMobile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!fact) return null;

  return (
    <>
      {/* MOBILE WIDGET (Dropdown from Top Bar) */}
      <div className="md:hidden relative" ref={widgetRef}>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className={`icon-btn flex items-center justify-center w-11 h-11 rounded-full transition-colors ${isOpenMobile ? 'bg-black/10 dark:bg-white/20' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          aria-label="Wusstest du schon?"
        >
          <Lightbulb size={24} className={isOpenMobile ? "text-primary" : "text-foreground"} />
        </motion.button>

        <AnimatePresence>
          {isOpenMobile && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute top-full mt-3 right-0 w-[280px] bg-white/95 dark:bg-[#1a1c23]/95 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-black/5 dark:border-white/10 rounded-2xl p-4 z-[9999] origin-top-right"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase opacity-70 text-primary">
                  <Lightbulb size={14} />
                  <span>Wusstest du schon?</span>
                </div>
                <button 
                  className="opacity-50 hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 rounded-full p-1" 
                  onClick={() => setIsOpenMobile(false)} 
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

      {/* DESKTOP WIDGET (Floating Bottom Right) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-[9999]">
        <AnimatePresence mode="wait">
          {!isExpandedDesktop ? (
            <motion.button 
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-full bg-white/90 dark:bg-[#1a1c23]/90 backdrop-blur-2xl shadow-xl border border-black/5 dark:border-white/10 flex items-center justify-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              onClick={() => setIsExpandedDesktop(true)}
              aria-label="Wusstest du schon?"
            >
              <Lightbulb size={24} className="text-primary" />
            </motion.button>
          ) : (
            <motion.div 
              key="expanded"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-[260px] bg-white/90 dark:bg-[#1a1c23]/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-black/5 dark:border-white/10 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold opacity-70 text-primary">
                  <Lightbulb size={14} />
                  <span>Wusstest du schon?</span>
                </div>
                <button 
                  className="opacity-50 hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 rounded-full p-1" 
                  onClick={() => setIsExpandedDesktop(false)} 
                  aria-label="Schließen"
                >
                  <X size={12} />
                </button>
              </div>
              <p className="text-[13px] leading-relaxed font-medium text-foreground/90">
                {fact}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
});

FunFactWidget.displayName = 'FunFactWidget';
export default FunFactWidget;
