import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DateCarouselProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  onOpenCalendarModal: () => void;
}

export const DateCarousel: React.FC<DateCarouselProps> = ({
  selectedDate,
  onSelectDate,
  onOpenCalendarModal,
}) => {
  // Generate date items around selected date
  const baseDate = new Date('2026-11-07T00:00:00');

  const daysRange = [-3, -2, -1, 0, 1, 2, 3];
  const dateOptions = daysRange.map(offset => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + offset);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const iso = `${yyyy}-${mm}-${dd}`;

    let label = '';
    if (offset === 0) label = 'Today';
    else if (offset === -1) label = 'Yesterday';
    else if (offset === 1) label = 'Tomorrow';
    else {
      label = d.toLocaleDateString('en-US', { weekday: 'short' });
    }

    const dayNumber = dd;
    const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
    const isPast = offset < 0;

    return {
      iso,
      label,
      dayNumber,
      monthShort,
      isPast,
      isToday: offset === 0,
    };
  });

  return (
    <div className="bg-slate-50 dark:bg-[#0f1724] border-b border-slate-200 dark:border-slate-800/80 py-2 px-3 transition-colors duration-150">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
        {dateOptions.map(item => {
          const isSelected = selectedDate === item.iso;
          return (
            <button
              key={item.iso}
              onClick={() => onSelectDate(item.iso)}
              className={`flex flex-col items-center justify-center min-w-[62px] py-1.5 px-2 rounded-xl transition-all font-sans text-center shrink-0 ${
                isSelected
                  ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/25 scale-[1.03]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
              }`}
            >
              <span className={`text-[10px] tracking-tight uppercase ${isSelected ? 'text-sky-100 font-bold' : item.isToday ? 'text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                {item.label}
              </span>
              <span className="text-sm font-extrabold font-mono tabular-nums leading-tight mt-0.5">
                {item.dayNumber}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
                {item.monthShort}
              </span>
              {item.isPast && !isSelected && (
                <span className="text-[8px] text-emerald-600 dark:text-emerald-400/80 font-medium">FT Results</span>
              )}
            </button>
          );
        })}

        {/* Custom Date Picker button */}
        <button
          onClick={onOpenCalendarModal}
          className="flex flex-col items-center justify-center min-w-[54px] py-1.5 px-2 rounded-xl text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-200 dark:text-slate-300 dark:hover:text-white dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700/50 shrink-0 transition-colors shadow-sm"
          title="Pick custom date"
        >
          <CalendarIcon className="w-4 h-4 text-sky-600 dark:text-sky-400 mb-0.5" />
          <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">More</span>
        </button>
      </div>
    </div>
  );
};
