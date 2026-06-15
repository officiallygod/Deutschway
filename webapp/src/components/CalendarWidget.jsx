import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '../services/apiService';

const CalendarWidget = ({ onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [historyMap, setHistoryMap] = useState({});

  useEffect(() => {
    apiService.getHistoryMap().then(setHistoryMap);
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  // Adjust for Monday start (0 = Mon, 6 = Sun)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dateStr = d.toDateString();
      const hasHistory = !!historyMap[dateStr];
      const isToday = d.toDateString() === new Date().toDateString();

      days.push(
        <button 
          key={i} 
          className={`calendar-day ${hasHistory ? 'has-history' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => hasHistory && onSelectDate(dateStr)}
          disabled={!hasHistory}
        >
          {i}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="calendar-widget glass">
      <div className="calendar-header">
        <button className="nav-btn" onClick={prevMonth}><ChevronLeft size={24} /></button>
        <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button className="nav-btn" onClick={nextMonth}><ChevronRight size={24} /></button>
      </div>

      <div className="calendar-grid">
        <div className="weekday">Mo</div>
        <div className="weekday">Di</div>
        <div className="weekday">Mi</div>
        <div className="weekday">Do</div>
        <div className="weekday">Fr</div>
        <div className="weekday">Sa</div>
        <div className="weekday">So</div>
        {renderDays()}
      </div>
      
      <div className="calendar-footer">
        <div className="legend-item">
          <div className="legend-dot highlight"></div>
          <span>Gelernt</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot today"></div>
          <span>Heute</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
