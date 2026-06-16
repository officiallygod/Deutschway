import React from 'react';
import { Calendar } from '@heroui/react';
import { today, getLocalTimeZone } from '@internationalized/date';
import { STORAGE_KEYS } from '../services/apiService';

const CalendarWidget = React.memo(({ onSelectDate }) => {
  const historyMap = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_HISTORY) || '{}');
    } catch {
      return {};
    }
  }, []);

  const handleDateSelect = (date) => {
    // Convert HeroUI DateValue to native JS Date string
    const nativeDate = date.toDate(getLocalTimeZone());
    if (onSelectDate) {
      onSelectDate(nativeDate.toDateString());
    }
  };

  const isDateUnavailable = (date) => {
    try {
      const nativeDate = date.toDate(getLocalTimeZone());
      const dateStr = nativeDate.toDateString();
      const isToday = dateStr === new Date().toDateString();
      // Only available if it has history OR if it is today
      return !historyMap[dateStr] && !isToday;
    } catch {
      return true;
    }
  };

  return (
    <div className="calendar-widget glass w-[300px] p-4 flex flex-col items-center gap-4 rounded-[24px]">
      <Calendar 
        aria-label="Übersicht der gelernten Wörter" 
        onChange={handleDateSelect}
        isDateUnavailable={isDateUnavailable}
        maxValue={today(getLocalTimeZone())}
      />
    </div>
  );
});

CalendarWidget.displayName = 'CalendarWidget';
export default CalendarWidget;
