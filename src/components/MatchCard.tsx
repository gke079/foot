import React from 'react';
import { Star, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { Match, FormResult } from '../types/football';
import { TeamCrest } from './TeamCrest';

interface MatchCardProps {
  match: Match;
  showTeamForm: boolean;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onSelectMatch: (match: Match) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  showTeamForm,
  isFavorite,
  onToggleFavorite,
  onSelectMatch,
}) => {
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';

  const formatFormBadge = (result: FormResult, idx: number) => {
    const bg =
      result === 'W'
        ? 'bg-emerald-600/90 text-white'
        : result === 'D'
        ? 'bg-amber-600/90 text-white'
        : 'bg-rose-600/90 text-white';

    return (
      <span
        key={idx}
        className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[8px] font-bold font-mono ${bg}`}
      >
        {result}
      </span>
    );
  };

  const consecutiveStreak = match.predictions?.consecutiveGoals;

  return (
    <div
      onClick={() => onSelectMatch(match)}
      className="group relative bg-white dark:bg-[#172236] hover:bg-slate-50 dark:hover:bg-[#1c2a42] border-b border-slate-200 dark:border-slate-800/80 transition-all cursor-pointer select-none"
    >
      {/* Live Active Bar on Left (matching screenshot) */}
      {isLive && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-sky-500 rounded-r-sm shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
      )}

      <div className="px-3 py-3 flex items-center justify-between gap-2">
        {/* Favorite Star Button */}
        <button
          onClick={onToggleFavorite}
          className="p-1 rounded-lg text-slate-400 hover:text-amber-500 dark:text-slate-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus:outline-none"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star
            className={`w-4 h-4 ${
              isFavorite ? 'fill-amber-400 text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          />
        </button>

        {/* Home Team */}
        <div className="flex-1 flex items-center justify-end gap-2 text-right min-w-0">
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate block group-hover:text-slate-950 dark:group-hover:text-white">
              {match.homeTeam.shortName}
            </span>
            {showTeamForm && (
              <div className="flex items-center justify-end gap-0.5 mt-0.5">
                {match.homeTeam.form.slice(-4).map((f, i) => formatFormBadge(f, i))}
              </div>
            )}
          </div>
          <TeamCrest crest={match.homeTeam.crest} name={match.homeTeam.name} size="md" />
        </div>

        {/* Center Score / Kickoff Time */}
        <div className="w-20 flex flex-col items-center justify-center shrink-0 px-1 text-center">
          {isLive ? (
            <>
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 tracking-wider">
                {match.livePeriod || '1H'} {match.minute ? `${match.minute}'` : ''}
              </span>
              <div className="flex items-center gap-1.5 text-base font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                <span>{match.scores?.home ?? 0}</span>
                <span className="text-slate-400 dark:text-slate-500">-</span>
                <span>{match.scores?.away ?? 0}</span>
              </div>
            </>
          ) : isFinished ? (
            <>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                FT
              </span>
              <div className="flex items-center gap-1.5 text-base font-extrabold font-mono tabular-nums text-slate-800 dark:text-slate-200">
                <span>{match.scores?.home ?? 0}</span>
                <span className="text-slate-400 dark:text-slate-500">-</span>
                <span>{match.scores?.away ?? 0}</span>
              </div>
            </>
          ) : (
            <span className="text-sm font-extrabold font-mono tabular-nums text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/50">
              {match.kickoffTime}
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex items-center justify-start gap-2 text-left min-w-0">
          <TeamCrest crest={match.awayTeam.crest} name={match.awayTeam.name} size="md" />
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate block group-hover:text-slate-950 dark:group-hover:text-white">
              {match.awayTeam.shortName}
            </span>
            {showTeamForm && (
              <div className="flex items-center justify-start gap-0.5 mt-0.5">
                {match.awayTeam.form.slice(-4).map((f, i) => formatFormBadge(f, i))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Algorithmic Prediction Highlights Bar (Probabilities & Consecutive Streaks) */}
      <div className="px-3 pb-2 pt-0.5 flex flex-wrap items-center justify-between gap-1 text-[11px] border-t border-slate-100 dark:border-slate-800/40 text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          {/* Win Probability breakdown */}
          <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
            <span className="text-sky-600 dark:text-sky-400 font-semibold">{match.predictions.outcomeProbabilities.homeWin}%</span>
            <span className="text-slate-400 dark:text-slate-500 mx-1">·</span>
            <span className="text-slate-600 dark:text-slate-400">{match.predictions.outcomeProbabilities.draw}%</span>
            <span className="text-slate-400 dark:text-slate-500 mx-1">·</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{match.predictions.outcomeProbabilities.awayWin}%</span>
          </span>

          {/* Over 2.5 probability */}
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400">
            O2.5: <strong className="text-slate-800 dark:text-slate-200 font-mono">{match.predictions.goalMarkets.over25}%</strong>
          </span>
        </div>

        {/* Key Market Pick / Consecutive Goals Highlight */}
        <div className="flex items-center gap-1.5">
          {consecutiveStreak && (consecutiveStreak.homeScore2PlusUnanswered >= 40 || consecutiveStreak.awayScore2PlusUnanswered >= 40) && (
            <span className="hidden xs:inline-flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/40 font-medium">
              <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              {consecutiveStreak.homeScore2PlusUnanswered >= consecutiveStreak.awayScore2PlusUnanswered
                ? `${match.homeTeam.shortName} 2+ run: ${consecutiveStreak.homeScore2PlusUnanswered}%`
                : `${match.awayTeam.shortName} 2+ run: ${consecutiveStreak.awayScore2PlusUnanswered}%`}
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800/50">
            <TrendingUp className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            {match.predictions.primaryVerdict.pick}
          </span>
        </div>
      </div>
    </div>
  );
};
