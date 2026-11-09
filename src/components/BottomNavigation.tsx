import React from 'react';
import { ListFilter, Heart, Star, Compass, Zap } from 'lucide-react';

export type NavTab = 'SCORES' | 'AZ_MENU' | 'PREDICTOR_HUB' | 'FAVORITES' | 'DISCOVER';

interface BottomNavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  favoritesCount: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
  favoritesCount,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e1420] border-t border-[#1e2a3f] shadow-[0_-4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md transition-colors duration-150">
      <div className="max-w-md mx-auto relative flex items-center justify-between px-2 h-15">
        {/* Tab 1: Home */}
        <button
          onClick={() => onSelectTab('SCORES')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer relative ${
            currentTab === 'SCORES' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Home matches view"
        >
          <div className="w-5 h-5 flex items-center justify-center font-black text-sm text-[#e41b23]">
            S
          </div>
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Home</span>
          {currentTab === 'SCORES' && (
            <span className="absolute bottom-0 w-6 h-0.5 bg-[#e41b23] rounded-full" />
          )}
        </button>

        {/* Tab 2: AZ Menu (from screenshot) */}
        <button
          onClick={() => onSelectTab('AZ_MENU')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer relative ${
            currentTab === 'AZ_MENU' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="SportyBet AZ Menu"
        >
          <div className="flex flex-col gap-1 items-center justify-center w-5 h-5">
            <span className="w-4 h-0.5 bg-current rounded-full" />
            <span className="w-4 h-0.5 bg-current rounded-full" />
            <span className="w-4 h-0.5 bg-current rounded-full" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight">AZ Menu</span>
          {currentTab === 'AZ_MENU' && (
            <span className="absolute bottom-0 w-6 h-0.5 bg-[#e41b23] rounded-full" />
          )}
        </button>

        {/* Center: Prominent Eagle / Hawk Predictor Badge */}
        <div className="relative flex flex-col items-center -top-4 px-2">
          <button
            onClick={() => onSelectTab('PREDICTOR_HUB')}
            className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-white dark:border-[#121927] shadow-xl transition-all transform active:scale-95 ${
              currentTab === 'PREDICTOR_HUB'
                ? 'bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-600 ring-2 ring-sky-400 scale-105'
                : 'bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 hover:scale-105 text-sky-600 dark:text-sky-400'
            }`}
            title="Eagle Predictor & AI Edge Hub"
            aria-label="Eagle Predictor Hub"
          >
            {/* Eagle / Falcon Graphic SVG matching screenshot */}
            <svg
              viewBox="0 0 100 100"
              className="w-8 h-8 drop-shadow-md text-slate-800 dark:text-white"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="3" opacity="0.4" />
              {/* Eagle Head Silhouette */}
              <path
                d="M 28 64 C 30 50 42 42 50 34 C 58 26 68 28 72 32 C 76 36 78 44 68 46 C 58 48 54 52 50 62 C 46 72 34 74 28 64 Z"
                fill="currentColor"
              />
              {/* Curved Beak */}
              <path
                d="M 72 32 Q 86 38 78 46 Q 74 44 70 42 Z"
                fill="#38bdf8"
              />
              {/* Eye */}
              <circle cx="62" cy="36" r="2.5" fill="#ffffff" />
              {/* Soccer ball mini at base */}
              <circle cx="50" cy="74" r="7" stroke="currentColor" strokeWidth="2" fill="#0284c7" />
            </svg>
          </button>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 mt-0.5">
            AI Edge
          </span>
        </div>

        {/* Tab 4: Favorites */}
        <button
          onClick={() => onSelectTab('FAVORITES')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative ${
            currentTab === 'FAVORITES' ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          aria-label="Favorited matches"
        >
          <Star className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Favorites</span>
          {favoritesCount > 0 && (
            <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold font-mono text-[9px] flex items-center justify-center">
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Tab 5: Discover */}
        <button
          onClick={() => onSelectTab('DISCOVER')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            currentTab === 'DISCOVER' ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          aria-label="Discover markets and trends"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1 tracking-tight">Discover</span>
        </button>
      </div>
    </div>
  );
};
