import React, { useState, useMemo } from 'react';
import { X, Check, Globe, Search, Flame } from 'lucide-react';
import { POPULAR_COMPETITIONS } from '../data/mockMatches';
import { Competition } from '../types/football';
import { getSportyBetLeagueInfo, getSportyBetSortRank, SPORTYBET_TOP_LEAGUE_IDS } from '../utils/sportybetLeagues';

interface LeaguesMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeagueId: string | null;
  onSelectLeague: (leagueId: string | null) => void;
  availableCompetitions?: Competition[];
}

export const LeaguesMenuModal: React.FC<LeaguesMenuModalProps> = ({
  isOpen,
  onClose,
  selectedLeagueId,
  onSelectLeague,
  availableCompetitions = POPULAR_COMPETITIONS,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('SPORTYBET_TOP');

  const comps = availableCompetitions.length > 0 ? availableCompetitions : POPULAR_COMPETITIONS;

  const sortedComps = useMemo(() => {
    return [...comps].sort((a, b) => {
      const rankA = getSportyBetSortRank(a.id, a.name);
      const rankB = getSportyBetSortRank(b.id, b.name);
      if (rankA !== rankB) return rankA - rankB;
      return a.name.localeCompare(b.name);
    });
  }, [comps]);

  if (!isOpen) return null;

  const filtered = sortedComps.filter(comp => {
    const sportyInfo = getSportyBetLeagueInfo(comp);
    const matchesSearch =
      comp.name.toLowerCase().includes(search.toLowerCase()) ||
      comp.country.toLowerCase().includes(search.toLowerCase()) ||
      sportyInfo.displayName.toLowerCase().includes(search.toLowerCase());

    const isSportyTop = SPORTYBET_TOP_LEAGUE_IDS.includes(comp.id.toLowerCase());

    const matchesRegion =
      selectedRegion === 'ALL' ||
      (selectedRegion === 'SPORTYBET_TOP' && isSportyTop) ||
      (selectedRegion === 'Popular' && comp.category === 'Popular') ||
      (selectedRegion === 'European' && (comp.category === 'European' || comp.category === 'Popular' || comp.category === 'Domestic')) ||
      comp.category === selectedRegion;

    return matchesSearch && matchesRegion;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#121c2e] border border-slate-200 dark:border-slate-700/80 rounded-3xl p-5 shadow-2xl space-y-3.5 max-h-[88vh] flex flex-col transition-colors duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">All World Competitions</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search league or country (e.g. England, Brazil, MLS...)"
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-200 dark:border-slate-700"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Region pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 py-1">
          {[
            { id: 'SPORTYBET_TOP', label: '🔥 SportyBet Top' },
            { id: 'ALL', label: '⭐ All World' },
            { id: 'European', label: '🇪🇺 Europe' },
            { id: 'Americas', label: '🌎 Americas' },
            { id: 'Asia', label: '🌏 Asia & Saudi' },
            { id: 'Africa', label: '🌍 Africa' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRegion(r.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedRegion === r.id
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* League List */}
        <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
          {/* Show All option */}
          <button
            onClick={() => {
              onSelectLeague(null);
              onClose();
            }}
            className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-colors text-xs font-bold cursor-pointer ${
              selectedLeagueId === null
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-[#162238] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1a2944] border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>All Worldwide Leagues ({comps.length})</span>
            {selectedLeagueId === null && <Check className="w-4 h-4" />}
          </button>

          {filtered.map(comp => {
            const isSelected = selectedLeagueId === comp.id;
            const sporty = getSportyBetLeagueInfo(comp);
            return (
              <button
                key={comp.id}
                onClick={() => {
                  onSelectLeague(comp.id);
                  onClose();
                }}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-colors text-xs font-bold cursor-pointer ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-[#162238] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1a2944] border border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{sporty.flag}</span>
                  <div className="text-left">
                    <span className="block text-slate-900 dark:text-white font-bold">
                      {sporty.country} · {sporty.leagueName}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">
                      {comp.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {sporty.isTopLeague && !isSelected && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                      TOP
                    </span>
                  )}
                  {isSelected && <Check className="w-4 h-4" />}
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No leagues found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
