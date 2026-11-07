import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}) => {
  if (!isOpen) return null;

  // Selected date parsed
  const [currentViewMonth, setCurrentViewMonth] = useState(() => {
    const parts = selectedDate.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
  });

  const year = currentViewMonth.getFullYear();
  const month = currentViewMonth.getMonth();

  const monthName = currentViewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Compute calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentViewMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewMonth(new Date(year, month + 1, 1));
  };

  const formatIso = (day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const todayIso = '2026-11-07';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-[#121c2e] border border-slate-700/80 rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Select Match Date</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick jump presets */}
        <div className="grid grid-cols-3 gap-1.5 py-3">
          <button
            onClick={() => {
              onSelectDate('2026-11-06');
              onClose();
            }}
            className={`py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              selectedDate === '2026-11-06'
                ? 'bg-sky-600 text-white border-sky-500'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Yesterday (Results)
          </button>
          <button
            onClick={() => {
              onSelectDate('2026-11-07');
              onClose();
            }}
            className={`py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              selectedDate === '2026-11-07'
                ? 'bg-sky-600 text-white border-sky-500'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Today (Live)
          </button>
          <button
            onClick={() => {
              onSelectDate('2026-11-08');
              onClose();
            }}
            className={`py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              selectedDate === '2026-11-08'
                ? 'bg-sky-600 text-white border-sky-500'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Tomorrow
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between py-2 px-1">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-200">{monthName}</span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 py-1">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mt-1">
          {/* Empty cells */}
          {[...Array(firstDayOfMonth)].map((_, i) => (
            <div key={`empty-${i}`} className="h-8" />
          ))}

          {/* Days */}
          {[...Array(daysInMonth)].map((_, i) => {
            const dayNum = i + 1;
            const iso = formatIso(dayNum);
            const isSelected = selectedDate === iso;
            const isToday = todayIso === iso;
            const isPast = iso < todayIso;

            return (
              <button
                key={dayNum}
                onClick={() => {
                  onSelectDate(iso);
                  onClose();
                }}
                className={`h-8 rounded-xl flex flex-col items-center justify-center font-mono text-xs transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/30'
                    : isToday
                    ? 'bg-slate-800 text-sky-400 border border-sky-500/40 font-bold'
                    : isPast
                    ? 'text-slate-300 hover:bg-slate-800/60'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{dayNum}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Selected: <strong className="text-white font-mono">{selectedDate}</strong></span>
          <button
            onClick={() => {
              onSelectDate(todayIso);
              onClose();
            }}
            className="text-sky-400 hover:underline font-semibold"
          >
            Reset to Today
          </button>
        </div>
      </div>
    </div>
  );
};
