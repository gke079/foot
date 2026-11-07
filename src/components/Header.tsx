import React from 'react';
import { Search, Settings, Calendar, Bell, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  isLiveOnly: boolean;
  onToggleLive: () => void;
  selectedDate: string; // YYYY-MM-DD
  onOpenCalendar: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onOpenLeaguesModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLiveOnly,
  onToggleLive,
  selectedDate,
  onOpenCalendar,
  onOpenSearch,
  onOpenSettings,
  onOpenNotifications,
  unreadNotificationsCount,
  onOpenLeaguesModal,
}) => {
  // Extract day number for the calendar icon pill (e.g. "07")
  const dayNumber = selectedDate ? selectedDate.split('-')[2] : '07';

  return (
    <header className="sticky top-0 z-40 bg-[#162032] border-b border-slate-800/80 px-3 py-2.5 shadow-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: 9-dot Grid Icon (Leagues & Competitions Menu) */}
        <button
          onClick={onOpenLeaguesModal}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          aria-label="View Competitions and Leagues"
          title="Select Competition"
        >
          <div className="grid grid-cols-3 gap-1 w-4 h-4">
            {[...Array(9)].map((_, i) => (
              <span key={i} className="w-1 h-1 bg-current rounded-full" />
            ))}
          </div>
        </button>

        {/* Center: Live Toggle Switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLive}
            className={`relative flex items-center h-8 px-3 rounded-full text-xs font-semibold tracking-wide transition-all ${
              isLiveOnly
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            aria-label="Toggle live matches only"
          >
            <span className="mr-2">Live</span>
            <div
              className={`w-4 h-4 rounded-full transition-transform bg-white shadow-sm flex items-center justify-center ${
                isLiveOnly ? 'translate-x-1' : '-translate-x-1 opacity-70'
              }`}
            >
              {isLiveOnly && <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />}
            </div>
          </button>
        </div>

        {/* Right Action Icons: Calendar Date, Search, Notifications, Settings */}
        <div className="flex items-center gap-1">
          {/* Calendar Day Picker Button matching screenshot */}
          <button
            onClick={onOpenCalendar}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-colors text-xs font-bold font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            title="Change Date / View Previous Days"
            aria-label="Change Match Date"
          >
            <Calendar className="w-4 h-4 text-sky-400" />
            <span className="tabular-nums tracking-tight">{dayNumber}</span>
          </button>

          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Search teams or leagues"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notification Alert Bell with badge */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Personalized match and league notifications"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-[#162032]" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Prediction and App Settings"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
