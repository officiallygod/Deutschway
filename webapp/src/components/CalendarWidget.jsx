import React from 'react';
import { Calendar } from '@heroui/react';
import { today, getLocalTimeZone } from '@internationalized/date';
import { STORAGE_KEYS } from '../services/apiService';

const CalendarWidget = React.memo(({ onSelectDate }) => {
  const localToday = today(getLocalTimeZone());

  return (
    <div className="calendar-widget glass w-[300px] p-4 flex flex-col gap-4 rounded-[24px]">
      <Calendar 
        aria-label="Daily revision calendar"
        minValue={localToday}
        showOutsideDays={false}
        onChange={(date) => {
          if (onSelectDate) {
            onSelectDate(new Date(date.year, date.month - 1, date.day).toDateString());
          }
        }}
        classNames={{
          base: "bg-transparent shadow-none",
          header: "pt-2 pb-4",
          gridBody: "gap-2",
        }}
      >
        <Calendar.Header>
          <Calendar.YearPickerTrigger>
            <Calendar.YearPickerTriggerHeading />
            <Calendar.YearPickerTriggerIndicator />
          </Calendar.YearPickerTrigger>
          <Calendar.NavButton slot="previous" />
          <Calendar.NavButton slot="next" />
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.GridHeader>
            {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
          </Calendar.GridHeader>
          <Calendar.GridBody>
            {(date) => <Calendar.Cell date={date} />}
          </Calendar.GridBody>
        </Calendar.Grid>
        <Calendar.YearPickerGrid>
          <Calendar.YearPickerGridBody>
            {({year}) => <Calendar.YearPickerCell year={year} />}
          </Calendar.YearPickerGridBody>
        </Calendar.YearPickerGrid>
      </Calendar>
    </div>
  );
});

CalendarWidget.displayName = 'CalendarWidget';
export default CalendarWidget;
