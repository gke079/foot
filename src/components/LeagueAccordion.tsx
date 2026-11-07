import React from 'react';
import { ChevronDown, ChevronUp, Bell, BellOff } from 'lucide-react';
import { Competition, Match } from '../types/football';
import { MatchCard } from './MatchCard';

interface LeagueAccordionProps {
  competition: Competition;
  matches: Match[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  showTeamForm: boolean;
  favoriteMatchIds: Set<string>;
  onToggleFavorite: (matchId: string) => void;
  onSelectMatch: (match: Match) => void;
  isSubscribedToLeague: boolean;
  onToggleLeagueNotification: (competitionId: string) => void;
}

export const LeagueAccordion: React.FC<LeagueAccordionProps> = ({
  competition,
  matches,
  isExpanded,
  onToggleExpand,
  showTeamForm,
  favoriteMatchIds,
  onToggleFavorite,
  onSelectMatch,
  isSubscribedToLeague,
  onToggleLeagueNotification,
}) => {
  return (
    <div className="mb-3 rounded-2xl overflow-hidden border border-slate-800/80 bg-[#162135] shadow-lg">
      {/* League Header matching screenshot */}
      <div className="px-4 py-3 bg-[#1a263d] flex items-center justify-between border-b border-slate-800/70 select-none">
        <div
          onClick={onToggleExpand}
          className="flex items-center gap-2.5 flex-1 cursor-pointer"
        >
          {/* League Crest Shield outline icon matching screenshot */}
          <div className="w-5 h-6 rounded-sm border-2 border-rose-400/80 flex items-center justify-center text-[10px] text-rose-300">
            {competition.flag || '⚽'}
          </div>

          <div className="flex items-baseline gap-1.5 min-w-0">
            <h3 className="text-sm font-bold text-white truncate">
              {competition.name}
            </h3>
            <span className="text-xs text-slate-400 truncate">
              ({competition.country})
            </span>
          </div>
        </div>

        {/* Right: League Notification Bell toggle + Match count + Accordion chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onToggleLeagueNotification(competition.id)}
            className={`p-1 rounded-lg transition-colors text-xs flex items-center gap-1 ${
              isSubscribedToLeague
                ? 'text-sky-400 bg-sky-950/60 border border-sky-800/50'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title={
              isSubscribedToLeague
                ? 'League notifications active'
                : 'Turn on notifications for this league'
            }
          >
            {isSubscribedToLeague ? (
              <Bell className="w-3.5 h-3.5 fill-sky-400" />
            ) : (
              <BellOff className="w-3.5 h-3.5" />
            )}
          </button>

          <span className="text-xs font-mono font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800/80">
            {matches.length}
          </span>

          <button
            onClick={onToggleExpand}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            aria-label={isExpanded ? 'Collapse league' : 'Expand league'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-sky-400" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Matches List */}
      {isExpanded && (
        <div className="divide-y divide-slate-800/70">
          {matches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              showTeamForm={showTeamForm}
              isFavorite={favoriteMatchIds.has(match.id)}
              onToggleFavorite={e => {
                e.stopPropagation();
                onToggleFavorite(match.id);
              }}
              onSelectMatch={onSelectMatch}
            />
          ))}
        </div>
      )}
    </div>
  );
};
