import React from 'react';
import { Sparkles } from 'lucide-react';

export type RegionFilter = 'ALL' | 'Popular' | 'European' | 'Americas' | 'Asia' | 'Africa';

interface SubHeaderProps {
  activeTab: 'ALL' | 'MY_SCORES';
  onChangeTab: (tab: 'ALL' | 'MY_SCORES') => void;
  showTeamForm: boolean;
  onToggleTeamForm: () => void;
  myScoresCount: number;
  activeRegion: RegionFilter;
  onChangeRegion: (region: RegionFilter) => void;
  totalMatchesCount: number;
  totalLeaguesCount: number;
}

export const SubHeader: React.FC<SubHeaderProps> = ({
  activeTab,
  onChangeTab,
  showTeamForm,
  onToggleTeamForm,
  myScoresCount,
  activeRegion,
  onChangeRegion,
  totalMatchesCount,
  totalLeaguesCount,
}) => {
  const regions: { id: RegionFilter; label: string; icon: string }[] = [
    { id: 'ALL', label: 'All World', icon: '🌍' },
    { id: 'Popular', label: 'Top 5 Leagues', icon: '⭐' },
    { id: 'European', label: 'Europe', icon: '🇪🇺' },
    { id: 'Americas', label: 'Americas', icon: '🌎' },
    { id: 'Asia', label: 'Asia & Middle East', icon: '🌏' },
    { id: 'Africa', label: 'Africa', icon: '🌍' },
  ];

  return (
    <div className="bg-slate-100 dark:bg-[#121a29] border-b border-slate-200 dark:border-slate-800/60 select-none transition-colors duration-150">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        {/* Main Secondary Tab Strip: ALL SCORES vs MY SCORES */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/40">
          <div className="flex items-center gap-6 sm:gap-8">
            <button
              onClick={() => onChangeTab('ALL')}
              className={`py-3 text-xs font-bold tracking-wider uppercase transition-colors relative ${
                activeTab === 'ALL'
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              ALL SCORES
              <span className="ml-1.5 text-[10px] font-mono font-normal text-slate-500 dark:text-slate-500">
                ({totalMatchesCount})
              </span>
              {activeTab === 'ALL' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-t-sm" />
              )}
            </button>

            <button
              onClick={() => onChangeTab('MY_SCORES')}
              className={`py-3 text-xs font-bold tracking-wider uppercase transition-colors relative flex items-center gap-1.5 ${
                activeTab === 'MY_SCORES'
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              MY SCORES
              {myScoresCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono bg-sky-100 text-sky-700 dark:bg-sky-600/30 dark:text-sky-300 rounded border border-sky-300 dark:border-sky-500/30">
                  {myScoresCount}
                </span>
              )}
              {activeTab === 'MY_SCORES' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-t-sm" />
              )}
            </button>
          </div>

          {/* Right: Timezone EAT Badge + Team Form Toggle */}
          <div className="flex items-center gap-3 py-2">
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300 border border-amber-500/30">
              🕒 EAT (UTC+3)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 hidden xs:inline">Team Form</span>
              <button
                onClick={onToggleTeamForm}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                  showTeamForm ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={showTeamForm}
                aria-label="Toggle team form display"
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    showTeamForm ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 w-7">
                {showTeamForm ? 'Show' : 'Hide'}
              </span>
            </div>
          </div>
        </div>

        {/* Global Regional Filters Strip */}
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {regions.map(r => (
            <button
              key={r.id}
              onClick={() => onChangeRegion(r.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                activeRegion === r.id
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30 scale-[1.02]'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200/80 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-white dark:border-transparent'
              }`}
            >
              <span className="text-[11px]">{r.icon}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        {/* Competitions Header strip */}
        <div className="pb-2 pt-1 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-200 tracking-tight">
              {activeRegion === 'ALL'
                ? 'All Worldwide Competitions'
                : `${regions.find(r => r.id === activeRegion)?.label || ''} Competitions`}
            </h2>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              · {totalLeaguesCount} Leagues Active
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium text-[11px]">Empirical H2H · Form · Streaks</span>
          </div>
        </div>
      </div>
    </div>
  );
};
