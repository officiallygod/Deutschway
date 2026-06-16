import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '../services/apiService';

const CalendarWidget = ({ onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [historyMap, setHistoryMap] = useState({});
  const [viewState, setViewState] = useState('days'); // 'days', 'months', 'years'
  const [yearGridStart, setYearGridStart] = useState(new Date().getFullYear() - 4);

  useEffect(() => {
    apiService.getHistoryMap().then(setHistoryMap);
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];

  const prevAction = () => {
    if (viewState === 'days') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    else if (viewState === 'months') setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
    else setYearGridStart(yearGridStart - 12);
  };

  const nextAction = () => {
    if (viewState === 'days') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    else if (viewState === 'months') setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
    else setYearGridStart(yearGridStart + 12);
  };

  const setMonth = (monthIdx) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIdx, 1));
    setViewState('days');
  };

  const setYear = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setViewState('months');
  };

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
          disabled={!hasHistory && !isToday} // ensure only history or today are valid, wait today is disabled if no history? No, today should be visible but disabled if not history
        >
          {i}
        </button>
      );
    }
    return (
      <div className="calendar-grid">
        <div className="weekday">Mo</div><div className="weekday">Di</div><div className="weekday">Mi</div>
        <div className="weekday">Do</div><div className="weekday">Fr</div><div className="weekday">Sa</div><div className="weekday">So</div>
        {days}
      </div>
    );
  };

  const renderMonths = () => {
    return (
      <div className="calendar-grid months-grid">
        {monthNames.map((m, i) => (
          <button key={m} className={`calendar-day month-yr-btn ${currentDate.getMonth() === i ? 'today' : ''}`} onClick={() => setMonth(i)}>
            {m.substring(0, 3)}
          </button>
        ))}
      </div>
    );
  };

  const renderYears = () => {
    const years = [];
    for (let i = 0; i < 12; i++) {
      const y = yearGridStart + i;
      years.push(
        <button key={y} className={`calendar-day month-yr-btn ${currentDate.getFullYear() === y ? 'today' : ''}`} onClick={() => setYear(y)}>
          {y}
        </button>
      );
    }
    return <div className="calendar-grid years-grid">{years}</div>;
  };

  const getHeaderLabel = () => {
    if (viewState === 'days') return (
      <div className="header-labels">
        <span onClick={() => setViewState('months')} className="clickable-label">{monthNames[currentDate.getMonth()]}</span>
        <span onClick={() => setViewState('years')} className="clickable-label">{currentDate.getFullYear()}</span>
      </div>
    );
    if (viewState === 'months') return <span onClick={() => setViewState('years')} className="clickable-label">{currentDate.getFullYear()}</span>;
    return <span>{yearGridStart} - {yearGridStart + 11}</span>;
  };

  return (
    <div className="calendar-widget glass">
      <div className="calendar-header">
        <button className="nav-btn" onClick={prevAction}><ChevronLeft size={24} /></button>
        <h2>{getHeaderLabel()}</h2>
        <button className="nav-btn" onClick={nextAction}><ChevronRight size={24} /></button>
      </div>

      <div className="calendar-body">
        {viewState === 'days' && renderDays()}
        {viewState === 'months' && renderMonths()}
        {viewState === 'years' && renderYears()}
      </div>
      
      {viewState === 'days' && (
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
      )}
    </div>
  );
};

export default CalendarWidget;
