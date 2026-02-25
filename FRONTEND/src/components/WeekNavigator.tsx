import React from 'react';

interface WeekNavigatorProps {
  weekOffset: number;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

const getMonday = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatWeekRange = (weekOffset: number) => {
  const monday = getMonday(new Date());
  const start = addDays(monday, weekOffset * 7);
  const end = addDays(start, 6);

  const startDay = start.getDate();
  const startMonth = start.getMonth() + 1;
  const endDay = end.getDate();
  const endMonth = end.getMonth() + 1;

  return `${startDay}.${startMonth}.-${endDay}.${endMonth}.`;
};

const WeekNavigator: React.FC<WeekNavigatorProps> = ({ weekOffset, onPrevWeek, onNextWeek }) => {
  return (
    <div className="flex items-center gap-3 text-xl font-medium text-black/85">
      <button
        type="button"
        onClick={onPrevWeek}
        className="h-9 w-9 rounded-full border border-black/10 bg-white/60 text-lg transition hover:bg-white"
        aria-label="Previous week"
      >
        {'<'}
      </button>
      <span className="min-w-[170px] text-center tabular-nums">{formatWeekRange(weekOffset)}</span>
      <button
        type="button"
        onClick={onNextWeek}
        className="h-9 w-9 rounded-full border border-black/10 bg-white/60 text-lg transition hover:bg-white"
        aria-label="Next week"
      >
        {'>'}
      </button>
    </div>
  );
};

export default WeekNavigator;
