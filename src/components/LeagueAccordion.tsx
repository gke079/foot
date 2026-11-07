import React from 'react';
import { ChevronDown, ChevronUp, Bell, BellOff } from 'lucide-react';
import { Competition, Match, PredictionMarketFilter } from '../types/football';
import { MatchCard } from './MatchCard';
import { RankedMatchCard } from './RankedMatchCard';

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
  activeMarket?: PredictionMarketFilter;
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
  activeMarket = 'ALL',
}) => {
  return (
    <div className="mb-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#162135] shadow-sm dark:shadow-lg transition-colors duration-150">
      {/* League Header matching screenshot */}
      <div className="px-4 py-3 bg-slate-100 dark:bg-[#1a263d] flex items-center justify-between border-b border-slate-200 dark:border-slate-800/70 select-none transition-colors duration-150">
        <div
          onClick={onToggleExpand}
          className="flex items-center gap-2.5 flex-1 cursor-pointer"
        >
          {/* League Crest Shield outline icon matching screenshot */}
          <div className="w-5 h-6 rounded-sm border-2 border-rose-500/80 dark:border-rose-400/80 flex items-center justify-center text-[10px] text-rose-600 dark:text-rose-300">
            {competition.flag || '⚽'}
          </div>

          <div className="flex items-baseline gap-1.5 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {competition.name}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
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
                ? 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800/50'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
            title={
              isSubscribedToLeague
                ? 'League notifications active'
                : 'Turn on notifications for this league'
            }
          >
            {isSubscribedToLeague ? (
              <Bell className="w-3.5 h-3.5 fill-sky-600 dark:fill-sky-400" />
            ) : (
              <BellOff className="w-3.5 h-3.5" />
            )}
          </button>

          <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800/80">
            {matches.length}
          </span>

          <button
            onClick={onToggleExpand}
            className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label={isExpanded ? 'Collapse league' : 'Expand league'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Matches List */}
      {isExpanded && (
        <div
          className={
            activeMarket && activeMarket !== 'ALL'
              ? 'p-2.5 sm:p-3 space-y-2.5 bg-slate-50/60 dark:bg-[#121c2e]/60'
              : 'divide-y divide-slate-200 dark:divide-slate-800/70'
          }
        >
          {matches.map((match, index) =>
            activeMarket && activeMarket !== 'ALL' ? (
              <RankedMatchCard
                key={match.id}
                match={match}
                rank={index + 1}
                market={activeMarket}
                showTeamForm={showTeamForm}
                isFavorite={favoriteMatchIds.has(match.id)}
                onToggleFavorite={e => {
                  e.stopPropagation();
                  onToggleFavorite(match.id);
                }}
                onSelectMatch={onSelectMatch}
              />
            ) : (
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
            )
          )}
        </div>
      )}
    </div>
  );
};
