import React, { useMemo } from 'react';
import { Layers, Clock, ArrowDownUp, RotateCcw, LayoutList, LayoutGrid, Flame, Globe } from 'lucide-react';
import { SPORTYBET_TOP_LEAGUE_IDS, getSportyBetSortRank } from '../utils/sportybetLeagues';

export type TimeFilter =
  | 'ALL'
  | 'LIVE'
  | 'MORNING'    // Kickoff before 13:00
  | 'AFTERNOON'  // Kickoff 13:00 - 16:59
  | 'EVENING'    // Kickoff 17:00 onwards
  | 'SCHEDULED'
  | 'FINISHED';

export interface LeagueOption {
  id: string;
  name: string;
  country: string;
  flag: string;
  count: number;
}

export interface TimeCounts {
  all: number;
  live: number;
  morning: number;
  afternoon: number;
  evening: number;
  scheduled: number;
  finished: number;
}

interface LeagueAndTimeFilterBarProps {
  selectedLeague: string | null;
  onSelectLeague: (leagueId: string | null) => void;
  availableLeagues: LeagueOption[];
  selectedTimeFilter: TimeFilter;
  onSelectTimeFilter: (filter: TimeFilter) => void;
  timeSortOrder: 'ASC' | 'DESC';
  onToggleTimeSortOrder: () => void;
  timeCounts: TimeCounts;
  totalFilteredCount: number;
  totalUnfilteredCount: number;
  onResetFilters: () => void;
  viewMode: 'FLAT_LIST' | 'LEAGUE_GROUPS';
  onChangeViewMode: (mode: 'FLAT_LIST' | 'LEAGUE_GROUPS') => void;
}

export const LeagueAndTimeFilterBar: React.FC<LeagueAndTimeFilterBarProps> = ({
  selectedLeague,
  onSelectLeague,
  availableLeagues,
  selectedTimeFilter,
  onSelectTimeFilter,
  timeSortOrder,
  onToggleTimeSortOrder,
  timeCounts,
  totalFilteredCount,
  totalUnfilteredCount,
  onResetFilters,
  viewMode,
  onChangeViewMode,
}) => {
  const isFiltered = Boolean(selectedLeague) || selectedTimeFilter !== 'ALL';
  const activeLeague = availableLeagues.find(l => l.id === selectedLeague);

  // Group leagues SportyBet-style into Top Popular Leagues & Country Groups
  const { topSportyLeagues, categorizedLeagues } = useMemo(() => {
    const top: LeagueOption[] = [];
    const rest: LeagueOption[] = [];

    for (const l of availableLeagues) {
      if (SPORTYBET_TOP_LEAGUE_IDS.includes(l.id.toLowerCase())) {
        top.push(l);
      } else {
        rest.push(l);
      }
    }

    // Sort Top Leagues in SportyBet order
    top.sort((a, b) => getSportyBetSortRank(a.id, a.name) - getSportyBetSortRank(b.id, b.name));

    // Group the rest by Country
    const countryMap = new Map<string, LeagueOption[]>();
    for (const l of rest) {
      const country = l.country || 'International';
      if (!countryMap.has(country)) {
        countryMap.set(country, []);
      }
      countryMap.get(country)!.push(l);
    }

    const groups: { country: string; leagues: LeagueOption[] }[] = [];
    for (const [country, leagues] of countryMap.entries()) {
      groups.push({ country, leagues });
    }
    groups.sort((a, b) => a.country.localeCompare(b.country));

    return { topSportyLeagues: top, categorizedLeagues: groups };
  }, [availableLeagues]);

  return (
    <div className="bg-white dark:bg-[#131d2e] border-y border-slate-200 dark:border-slate-800/80 px-3 py-3 shadow-xs transition-colors duration-150">
      <div className="max-w-4xl mx-auto flex flex-col gap-2.5">
        {/* Header line: SportyBet Style Header + View Switcher + Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center font-black text-xs">
              <Flame className="w-3.5 h-3.5 fill-current" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white">
                SportyBet Leagues & Time Filter
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({totalFilteredCount} of {totalUnfilteredCount} matches)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View layout toggle: Flat List vs League Accordions */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-[11px]">
              <button
                type="button"
                onClick={() => onChangeViewMode('FLAT_LIST')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'FLAT_LIST'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Unified fixture list with SportyBet odds and league headers"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Unified List</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeViewMode('LEAGUE_GROUPS')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'LEAGUE_GROUPS'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Group games under collapsible league accordions"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>By League</span>
              </button>
            </div>

            {/* Clear/Reset button */}
            {isFiltered && (
              <button
                type="button"
                onClick={onResetFilters}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 transition-colors cursor-pointer"
                title="Reset league and time filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Selection Boxes (SportyBet League & Time) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2">
          {/* 1. SportyBet League Selection Box */}
          <div className="lg:col-span-6 relative">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              <Layers className="w-3.5 h-3.5 text-rose-500" />
              <span>SportyBet League Selector</span>
              {selectedLeague && (
                <span className="ml-auto text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                  Active
                </span>
              )}
            </div>
            <div className="relative">
              <select
                id="league-filter-select"
                aria-label="Filter by league"
                value={selectedLeague || 'ALL'}
                onChange={e => onSelectLeague(e.target.value === 'ALL' ? null : e.target.value)}
                className={`w-full appearance-none rounded-xl text-xs font-semibold pl-3 pr-8 py-2 border transition-all cursor-pointer shadow-xs ${
                  selectedLeague
                    ? 'bg-rose-50/80 border-rose-400 text-rose-950 dark:bg-rose-950/40 dark:border-rose-500 dark:text-rose-200 ring-1 ring-rose-400/40'
                    : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 dark:bg-[#182438] dark:text-slate-200 dark:border-slate-700 dark:hover:border-slate-600'
                }`}
              >
                <option value="ALL">
                  ⭐ All Leagues & Competitions ({totalUnfilteredCount} matches)
                </option>

                {/* SportyBet Popular / Top Leagues */}
                {topSportyLeagues.length > 0 && (
                  <optgroup label="── 🔥 SPORTYBET TOP LEAGUES ──">
                    {topSportyLeagues.map(league => (
                      <option key={league.id} value={league.id}>
                        {league.flag || '⚽'} {league.country} · {league.name} ({league.count})
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* Other Categorized Countries */}
                {categorizedLeagues.map(group => (
                  <optgroup key={group.country} label={`── ${group.country.toUpperCase()} ──`}>
                    {group.leagues.map(league => (
                      <option key={league.id} value={league.id}>
                        {league.flag || '⚽'} {league.country} · {league.name} ({league.count})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500 text-[10px]">
                ▼
              </div>
            </div>
          </div>

          {/* 2. Time Selection Box */}
          <div className="lg:col-span-4 relative">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>Kickoff Time (EAT · UTC+3)</span>
              <span className="ml-auto text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                EAT ZONE
              </span>
            </div>
            <div className="relative">
              <select
                id="time-filter-select"
                aria-label="Filter by time"
                value={selectedTimeFilter}
                onChange={e => onSelectTimeFilter(e.target.value as TimeFilter)}
                className={`w-full appearance-none rounded-xl text-xs font-semibold pl-3 pr-8 py-2 border transition-all cursor-pointer shadow-xs ${
                  selectedTimeFilter !== 'ALL'
                    ? 'bg-sky-50/80 border-sky-400 text-sky-950 dark:bg-sky-950/40 dark:border-sky-500 dark:text-sky-200 ring-1 ring-sky-400/40'
                    : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 dark:bg-[#182438] dark:text-slate-200 dark:border-slate-700 dark:hover:border-slate-600'
                }`}
              >
                <option value="ALL">
                  🕒 All Kickoff Times ({timeCounts.all}) — EAT
                </option>
                <option value="LIVE">
                  🔴 Live / In-Play Matches ({timeCounts.live})
                </option>
                <option value="MORNING">
                  🌅 Morning (Before 13:00 EAT) ({timeCounts.morning})
                </option>
                <option value="AFTERNOON">
                  ☀️ Afternoon (13:00 – 17:00 EAT) ({timeCounts.afternoon})
                </option>
                <option value="EVENING">
                  🌙 Evening / Night (After 17:00 EAT) ({timeCounts.evening})
                </option>
                <option value="SCHEDULED">
                  ⏳ Scheduled / Upcoming Only ({timeCounts.scheduled})
                </option>
                <option value="FINISHED">
                  🏁 Full-Time / Finished ({timeCounts.finished})
                </option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500 text-[10px]">
                ▼
              </div>
            </div>
          </div>

          {/* 3. Time Sort Order Button */}
          <div className="lg:col-span-2 flex flex-col justify-end">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 hidden lg:block">
              Time Order
            </span>
            <button
              type="button"
              onClick={onToggleTimeSortOrder}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#182438] dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
              title={timeSortOrder === 'ASC' ? 'Sorted earliest kickoff first' : 'Sorted latest kickoff first'}
            >
              <ArrowDownUp className="w-3.5 h-3.5 text-sky-500" />
              <span>{timeSortOrder === 'ASC' ? 'Earliest 1st' : 'Latest 1st'}</span>
            </button>
          </div>
        </div>

        {/* SportyBet Popular Leagues Navigation Chips (Horizontal Fast Picker) */}
        {topSportyLeagues.length > 0 && (
          <div className="pt-0.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => onSelectLeague(null)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  !selectedLeague
                    ? 'bg-rose-600 text-white shadow-xs ring-1 ring-rose-500'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80'
                }`}
              >
                ⭐ All ({totalUnfilteredCount})
              </button>

              {topSportyLeagues.map(league => {
                const isSelected = selectedLeague === league.id;
                return (
                  <button
                    key={league.id}
                    type="button"
                    onClick={() => onSelectLeague(isSelected ? null : league.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-xs ring-1 ring-rose-500 font-bold'
                        : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <span>{league.flag || '⚽'}</span>
                    <span>{league.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-rose-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {league.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Filter Pills (Clickable to remove) */}
        {isFiltered && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
              Active:
            </span>

            {selectedLeague && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                <span>League: {activeLeague ? `${activeLeague.country} · ${activeLeague.name}` : selectedLeague}</span>
                <button
                  type="button"
                  onClick={() => onSelectLeague(null)}
                  className="hover:text-rose-950 dark:hover:text-white ml-0.5 cursor-pointer font-bold"
                  aria-label="Remove league filter"
                >
                  ✕
                </button>
              </span>
            )}

            {selectedTimeFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                <span>
                  Time:{' '}
                  {selectedTimeFilter === 'LIVE'
                    ? 'Live Matches'
                    : selectedTimeFilter === 'MORNING'
                    ? 'Morning (< 13:00)'
                    : selectedTimeFilter === 'AFTERNOON'
                    ? 'Afternoon (13:00 - 17:00)'
                    : selectedTimeFilter === 'EVENING'
                    ? 'Evening (> 17:00)'
                    : selectedTimeFilter === 'SCHEDULED'
                    ? 'Upcoming Scheduled'
                    : 'Finished FT'}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectTimeFilter('ALL')}
                  className="hover:text-amber-950 dark:hover:text-white ml-0.5 cursor-pointer font-bold"
                  aria-label="Remove time filter"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
