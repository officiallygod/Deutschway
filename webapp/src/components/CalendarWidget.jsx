import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { motion } from 'framer-motion';

const CalendarWidget = ({ onSelectDate }) => {
  const [historyMap, setHistoryMap] = useState({});

  useEffect(() => {
    apiService.getHistoryMap().then(setHistoryMap);
  }, []);

  // Generate last 28 days for the grid
  const today = new Date();
  const days = Array.from({ length: 28 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (27 - i));
    return d;
  });

  return (
    <div className="calendar-widget glass w-[280px] p-5 flex flex-col items-center gap-4 rounded-[24px]">
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary opacity-80">Aktivität (28 Tage)</h3>
      
      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {days.map((date, idx) => {
          const dateStr = date.toDateString();
          const hasHistory = !!historyMap[dateStr];
          const isToday = date.toDateString() === today.toDateString();
          
          return (
            <motion.div
              key={idx}
              whileHover={hasHistory ? { scale: 1.2 } : {}}
              onClick={() => hasHistory && onSelectDate(dateStr)}
              className={`w-6 h-6 sm:w-5 sm:h-5 rounded-md transition-colors ${
                hasHistory ? 'bg-primary cursor-pointer shadow-sm' : 'bg-black/5 dark:bg-white/10'
              } ${isToday && !hasHistory ? 'border-2 border-primary border-dashed' : ''}`}
              title={`${date.toLocaleDateString()}${hasHistory ? ' - Gelernt' : ''}`}
            />
          );
        })}
      </div>

      <div className="flex gap-6 mt-2 text-xs font-semibold text-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary"></div>
          <span>Gelernt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm border-2 border-primary border-dashed bg-transparent"></div>
          <span>Heute</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
