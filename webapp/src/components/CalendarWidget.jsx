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

  const daysInPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
  const prevMonthStart = daysInPrevMonth - startOffset + 1;

  const days = [];
  for (let i = 0; i < startOffset; i++) {
    days.push({
      date: prevMonthStart + i,
      isCurrentMonth: false,
      fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthStart + i)
    });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: i,
      isCurrentMonth: true,
      fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
    });
  }
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: i,
      isCurrentMonth: false,
      fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i)
    });
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
        {days.map((item, i) => {
          const isToday = item.fullDate.toDateString() === new Date().toDateString();
          const hasHistory = !!historyMap[item.fullDate.toDateString()];
          const isFuture = item.fullDate > today;

          return (
            <button
              key={i}
              onClick={() => !isFuture && item.isCurrentMonth && onSelectDate && onSelectDate(item.fullDate.toDateString())}
              disabled={isFuture || !item.isCurrentMonth}
              className={`aspect-square flex items-center justify-center rounded-full text-sm transition-all
                ${!item.isCurrentMonth || isFuture ? 'opacity-30 cursor-not-allowed text-foreground/50' : 'hover:bg-foreground/10 cursor-pointer text-foreground'}
                ${isToday && !hasHistory ? 'border-2 border-primary text-primary font-bold' : ''}
                ${hasHistory ? 'bg-primary text-white font-bold shadow-md' : ''}
              `}
            >
              {item.date}
            </button>
          );
        })}
      </div>
    </div>
  );
});

CalendarWidget.displayName = 'CalendarWidget';
export default CalendarWidget;
