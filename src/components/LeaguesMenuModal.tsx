import React, { useState } from 'react';
import { X, Check, Globe, Search } from 'lucide-react';
import { POPULAR_COMPETITIONS } from '../data/mockMatches';
import { Competition } from '../types/football';

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
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  if (!isOpen) return null;

  const comps = availableCompetitions.length > 0 ? availableCompetitions : POPULAR_COMPETITIONS;

  const filtered = comps.filter(comp => {
    const matchesSearch =
      comp.name.toLowerCase().includes(search.toLowerCase()) ||
      comp.country.toLowerCase().includes(search.toLowerCase());

    const matchesRegion =
      selectedRegion === 'ALL' ||
      (selectedRegion === 'Popular' && comp.category === 'Popular') ||
      (selectedRegion === 'European' && (comp.category === 'European' || comp.category === 'Popular' || comp.category === 'Domestic')) ||
      comp.category === selectedRegion;

    return matchesSearch && matchesRegion;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#121c2e] border border-slate-700/80 rounded-3xl p-5 shadow-2xl space-y-3.5 max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">All World Competitions</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
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
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Region pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 py-1">
          {[
            { id: 'ALL', label: 'All World' },
            { id: 'Popular', label: 'Top 5' },
            { id: 'European', label: 'Europe' },
            { id: 'Americas', label: 'Americas' },
            { id: 'Asia', label: 'Asia & MidEast' },
            { id: 'Africa', label: 'Africa' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRegion(r.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                selectedRegion === r.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
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
            className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-colors text-xs font-bold ${
              selectedLeagueId === null
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-[#162238] text-slate-200 hover:bg-[#1a2944]'
            }`}
          >
            <span>All Worldwide Leagues ({comps.length})</span>
            {selectedLeagueId === null && <Check className="w-4 h-4" />}
          </button>

          {filtered.map(comp => {
            const isSelected = selectedLeagueId === comp.id;
            return (
              <button
                key={comp.id}
                onClick={() => {
                  onSelectLeague(comp.id);
                  onClose();
                }}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-colors text-xs font-bold ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-[#162238] text-slate-200 hover:bg-[#1a2944]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{comp.flag}</span>
                  <div className="text-left">
                    <span className="block text-white font-bold">{comp.name}</span>
                    <span className="text-[10px] text-slate-400 block font-normal">{comp.country}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No leagues found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
