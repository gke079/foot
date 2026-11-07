import React, { useState } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import { Match } from '../types/football';
import { TeamCrest } from './TeamCrest';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Match[];
  onSelectMatch: (match: Match) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  matches,
  onSelectMatch,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = query.trim() === ''
    ? []
    : matches.filter(m =>
        m.homeTeam.name.toLowerCase().includes(query.toLowerCase()) ||
        m.awayTeam.name.toLowerCase().includes(query.toLowerCase()) ||
        m.competition.name.toLowerCase().includes(query.toLowerCase()) ||
        m.competition.country.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-14 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#121c2e] border border-slate-700/80 rounded-3xl p-4 shadow-2xl">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search teams (Leeds, Tottenham, Arsenal...)"
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-800 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-3 max-h-80 overflow-y-auto space-y-1.5 divide-y divide-slate-800/60">
          {query && filtered.length === 0 && (
            <p className="text-center py-6 text-xs text-slate-400">
              No matches found for "{query}"
            </p>
          )}

          {filtered.map(match => (
            <div
              key={match.id}
              onClick={() => {
                onClose();
                onSelectMatch(match);
              }}
              className="pt-2 flex items-center justify-between p-2 hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <TeamCrest crest={match.homeTeam.crest} name={match.homeTeam.name} size="sm" />
                <span className="text-xs font-bold text-white">
                  {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                </span>
                <span className="text-[10px] text-slate-400">({match.competition.name})</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          ))}

          {!query && (
            <div className="py-4 text-center text-xs text-slate-400">
              Search by club name, league, or country.
            </div>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
