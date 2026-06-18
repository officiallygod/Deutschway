import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { STORAGE_KEYS } from '../services/apiService';

const CalendarWidget = React.memo(({ onSelectDate, isTodayCompleted }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [historyMap, setHistoryMap] = useState({});
  const [view, setView] = useState('days'); // 'days' | 'months' | 'years'

  useEffect(() => {
    try {
      const historyStr = localStorage.getItem(STORAGE_KEYS.LEARNING_HISTORY);
      if (historyStr) {
        setHistoryMap(JSON.parse(historyStr));
      }
    } catch (e) {
      console.error('Failed to load history for calendar', e);
    }
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const historyDates = Object.keys(historyMap).map(d => new Date(d));
  let firstStreakDate = today;
  if (historyDates.length > 0) {
    firstStreakDate = new Date(Math.min(...historyDates));
  }
  firstStreakDate.setHours(0, 0, 0, 0);

  const renderHeader = () => {
    let title = "";
    if (view === 'days') {
      title = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    } else if (view === 'months') {
      title = currentDate.getFullYear().toString();
    } else if (view === 'years') {
      const startYear = Math.floor(currentDate.getFullYear() / 10) * 10;
      title = `${startYear} - ${startYear + 9}`;
    }

    const handlePrev = () => {
      if (view === 'days') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
      if (view === 'months') setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
      if (view === 'years') setCurrentDate(new Date(currentDate.getFullYear() - 10, currentDate.getMonth(), 1));
    };

    const handleNext = () => {
      if (view === 'days') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
      if (view === 'months') setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
      if (view === 'years') setCurrentDate(new Date(currentDate.getFullYear() + 10, currentDate.getMonth(), 1));
    };

    const toggleView = () => {
      if (view === 'days') setView('months');
      else if (view === 'months') setView('years');
      else setView('days');
    };

    return (
      <div className="flex justify-between items-center px-2 mb-4">
        <button onClick={handlePrev} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-foreground/70"><ChevronLeft size={18} /></button>
        <button onClick={toggleView} className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-primary/10">
          {title}
        </button>
        <button onClick={handleNext} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-foreground/70"><ChevronRight size={18} /></button>
      </div>
    );
  };

  const renderDays = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const startOffset = startDay === 0 ? 6 : startDay - 1;
    const daysInPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    const prevMonthStart = daysInPrevMonth - startOffset + 1;

    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push({ date: prevMonthStart + i, isCurrentMonth: false, fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthStart + i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: i, isCurrentMonth: true, fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), i) });
    }
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ date: i, isCurrentMonth: false, fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i) });
    }

    return (
      <>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold tracking-wider uppercase text-foreground/40 mb-2">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((item, i) => {
            const isToday = item.fullDate.toDateString() === new Date().toDateString();
            const hasHistory = !!historyMap[item.fullDate.toDateString()] || (isToday && isTodayCompleted);
            const isFuture = item.fullDate > today;
            const isBeforeFirstStreak = item.fullDate < firstStreakDate;
            const isDisabled = isFuture || isBeforeFirstStreak;

            let customStyles = '';
            if (hasHistory) {
              customStyles = 'bg-sky-200 text-sky-800 dark:bg-sky-500/30 dark:text-sky-300 font-bold shadow-sm hover:bg-sky-300 dark:hover:bg-sky-500/50';
            } else if (isToday) {
              customStyles = 'ring-2 ring-inset ring-sky-300 text-sky-600 dark:ring-sky-500/60 dark:text-sky-300 font-bold';
            } else if (!isDisabled && item.isCurrentMonth) {
              customStyles = 'text-foreground hover:bg-black/5 dark:hover:bg-white/10';
            } else {
              customStyles = 'text-foreground/30';
            }

            return (
              <button
                key={i}
                disabled={isDisabled}
                onClick={() => onSelectDate && onSelectDate(item.fullDate.toDateString())}
                className={`aspect-square flex items-center justify-center rounded-full text-sm transition-all cursor-pointer 
                  ${isDisabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent' : ''}
                  ${customStyles}
                `}
              >
                {item.date}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-solid border-black/5 dark:border-white/10 text-xs text-foreground/60 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full ring-2 ring-inset ring-sky-300 dark:ring-sky-500/60"></div>
            <span>Heute</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sky-200 dark:bg-sky-500/30 ring-1 ring-inset ring-sky-300 dark:ring-sky-500/50"></div>
            <span>Gelernt</span>
          </div>
        </div>
      </>
    );
  };

  const renderMonths = () => {
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    return (
      <div className="grid grid-cols-3 gap-2">
        {months.map((m, i) => (
          <button 
            key={m} 
            onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), i, 1)); setView('days'); }}
            className={`py-3 rounded-xl text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary ${currentDate.getMonth() === i ? 'bg-primary text-white hover:bg-primary hover:text-white' : 'text-foreground'}`}
          >
            {m}
          </button>
        ))}
      </div>
    );
  };

  const renderYears = () => {
    const startYear = Math.floor(currentDate.getFullYear() / 10) * 10;
    const years = Array.from({ length: 12 }, (_, i) => startYear - 1 + i);
    return (
      <div className="grid grid-cols-3 gap-2">
        {years.map(y => (
          <button 
            key={y} 
            onClick={() => { setCurrentDate(new Date(y, currentDate.getMonth(), 1)); setView('months'); }}
            className={`py-3 rounded-xl text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary ${y === currentDate.getFullYear() ? 'bg-primary text-white hover:bg-primary hover:text-white' : 'text-foreground'} ${y < startYear || y > startYear + 9 ? 'opacity-40' : ''}`}
          >
            {y}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="calendar-widget bg-white/95 dark:bg-[#1a1c23]/95 backdrop-blur-2xl shadow-xl border border-black/5 dark:border-white/10 w-[300px] p-4 flex flex-col rounded-[24px]">
      {renderHeader()}
      <div className="flex-1">
        {view === 'days' && renderDays()}
        {view === 'months' && renderMonths()}
        {view === 'years' && renderYears()}
      </div>
    </div>
  );
});

CalendarWidget.displayName = 'CalendarWidget';
export default CalendarWidget;
