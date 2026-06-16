import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from "@heroui/react";
import { parseDate, today, getLocalTimeZone, CalendarDate } from "@internationalized/date";
import { apiService } from '../services/apiService';

const CalendarWidget = ({ onSelectDate }) => {
  const [historyMap, setHistoryMap] = useState({});

  useEffect(() => {
    apiService.getHistoryMap().then(setHistoryMap);
  }, []);

  const timeZone = getLocalTimeZone();
  const currentDateObj = today(timeZone);
  
  // Calculate minValue (oldest date in history)
  const minValue = useMemo(() => {
    const dates = Object.keys(historyMap);
    if (dates.length === 0) return undefined;
    
    // Sort dates to find the oldest
    const sortedDates = dates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
    const oldest = sortedDates[0];
    
    return new CalendarDate(
      oldest.getFullYear(),
      oldest.getMonth() + 1,
      oldest.getDate()
    );
  }, [historyMap]);

  // isDateUnavailable logic (disable dates without history, unless it's today)
  const isDateUnavailable = (date) => {
    const d = date.toDate(timeZone);
    const dateStr = d.toDateString();
    const hasHistory = !!historyMap[dateStr];
    const isTodayDate = d.toDateString() === new Date().toDateString();
    
    // Unavailable if it has no history AND it's not today
    return !hasHistory && !isTodayDate;
  };

  const handleDateChange = (date) => {
    const d = date.toDate(timeZone);
    const dateStr = d.toDateString();
    const hasHistory = !!historyMap[dateStr];
    
    if (hasHistory) {
      onSelectDate(dateStr);
    }
  };

  return (
    <div className="calendar-widget glass" style={{ width: '100%', minHeight: 340, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Calendar 
        aria-label="History Calendar"
        isDateUnavailable={isDateUnavailable}
        minValue={minValue}
        maxValue={currentDateObj}
        onChange={handleDateChange}
        classNames={{
          base: "bg-transparent shadow-none w-full",
          headerWrapper: "pt-2 pb-4",
          title: "text-lg font-bold text-foreground",
          grid: "w-full border-none",
          cell: "py-1",
          cellButton: [
            "w-10 h-10 text-sm",
            // Disabled state (no history)
            "data-[disabled=true]:opacity-20",
            // Available state (has history)
            "data-[disabled=false]:font-bold data-[disabled=false]:text-primary data-[disabled=false]:bg-primary/10",
            // Hover state
            "data-[disabled=false]:hover:bg-primary/20",
            // Selected state
            "data-[selected=true]:bg-primary data-[selected=true]:text-white",
          ]
        }}
      />
      
      <div className="calendar-footer flex gap-6 mt-4 text-sm font-medium text-default-500">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
          <span>Gelernt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-primary"></div>
          <span>Heute</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
