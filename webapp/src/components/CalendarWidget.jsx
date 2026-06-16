import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { STORAGE_KEYS } from '../services/apiService';

const CalendarWidget = React.memo(({ onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const historyMap = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_HISTORY) || '{}');
    } catch {
      return {};
    }
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  // Adjust so Monday is the first day
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const days = [];
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="calendar-widget glass w-[300px] p-4 flex flex-col gap-4 rounded-[24px]">
      <div className="flex justify-between items-center px-2">
        <button onClick={prevMonth} className="p-1 hover:bg-white/20 rounded-full"><ChevronLeft size={20} /></button>
        <span className="font-semibold text-foreground">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={nextMonth} className="p-1 hover:bg-white/20 rounded-full" disabled={currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()}>
          <ChevronRight size={20} className={currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear() ? 'opacity-50' : 'text-foreground'} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-foreground/50 mb-2">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          if (!date) return <div key={i} className="aspect-square"></div>;
          
          const isToday = date.toDateString() === new Date().toDateString();
          const hasHistory = !!historyMap[date.toDateString()];
          const isFuture = date > today;

          return (
            <button
              key={i}
              onClick={() => !isFuture && onSelectDate && onSelectDate(date.toDateString())}
              disabled={isFuture}
              className={`aspect-square flex items-center justify-center rounded-full text-sm transition-all
                ${isFuture ? 'opacity-20 cursor-not-allowed text-foreground/30' : 'hover:bg-white/20 cursor-pointer text-foreground'}
                ${isToday ? 'border border-primary text-primary' : ''}
                ${hasHistory ? 'bg-primary text-white font-bold shadow-md' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
});

CalendarWidget.displayName = 'CalendarWidget';
export default CalendarWidget;
