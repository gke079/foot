import React from 'react';
import { Star, TrendingUp, Zap, ChevronRight, Award, ShieldCheck, Flame } from 'lucide-react';
import { Match, FormResult, PredictionMarketFilter } from '../types/football';
import { TeamCrest } from './TeamCrest';
import { getMarketProbability, getMarketDetailVerdict, PREDICTION_MARKET_OPTIONS, getBestMarketForMatch } from '../utils/predictionEngine';

interface RankedMatchCardProps {
  match: Match;
  rank: number;
  market: PredictionMarketFilter;
  showTeamForm: boolean;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onSelectMatch: (match: Match) => void;
}

export const RankedMatchCard: React.FC<RankedMatchCardProps> = ({
  match,
  rank,
  market,
  showTeamForm,
  isFavorite,
  onToggleFavorite,
  onSelectMatch,
}) => {
  const isHighestProbMode = market === 'HIGHEST_PROB';
  const bestMarket = getBestMarketForMatch(match);
  const prob = isHighestProbMode ? bestMarket.probability : getMarketProbability(match, market);
  const verdict = getMarketDetailVerdict(isHighestProbMode ? 'OVER_15' : market, prob);
  const marketMeta = PREDICTION_MARKET_OPTIONS.find(m => m.id === market);

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

  // Rank badge styling: Gold, Silver, Bronze for top 3
  const getRankBadgeStyle = (r: number) => {
    if (r === 1) {
      return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/30';
    }
    if (r === 2) {
      return 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 font-black shadow-md shadow-slate-400/20';
    }
    if (r === 3) {
      return 'bg-gradient-to-r from-amber-700 to-amber-600 text-white font-black shadow-md shadow-amber-700/20';
    }
    return 'bg-slate-800 text-slate-300 border border-slate-700 font-bold';
  };

  const consecutiveStreak = match.predictions?.consecutiveGoals;

  return (
    <div
      onClick={() => onSelectMatch(match)}
      className="group relative bg-white dark:bg-[#152033] hover:bg-slate-50 dark:hover:bg-[#1a2840] border border-slate-200 dark:border-slate-800/80 hover:border-sky-500/50 dark:hover:border-sky-600/50 rounded-2xl p-3 sm:p-4 transition-all cursor-pointer select-none shadow-sm dark:shadow-md overflow-hidden"
    >
      {/* Top Probability Edge Bar */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800/60 text-xs">
        {/* Left: Rank & Competition */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono shrink-0 ${getRankBadgeStyle(
              rank
            )}`}
          >
            #{rank}
          </span>

          <div className="flex items-center gap-1.5 truncate">
            <span className="text-sm">{match.competition.flag}</span>
            <span className="font-bold text-slate-800 dark:text-slate-300 truncate text-[11px] sm:text-xs">
              {match.competition.name}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] hidden xs:inline font-mono">
              · {match.venue}
            </span>
          </div>
        </div>

        {/* Right: Big Probability Badge for the chosen market */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 border font-mono font-black text-xs ${verdict.badgeBg} ${verdict.badgeColor} ${verdict.badgeBorder}`}
          >
            <span>{isHighestProbMode ? bestMarket.icon : marketMeta?.icon}</span>
            <span className="tracking-tight text-sm">{prob}%</span>
            <span className="text-[10px] font-sans font-bold uppercase hidden sm:inline opacity-90 max-w-[130px] truncate">
              {isHighestProbMode ? bestMarket.marketLabel : marketMeta?.shortLabel}
            </span>
          </div>

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
        </div>
      </div>

      {/* Main Teams Match Area */}
      <div className="py-3 flex items-center justify-between gap-2">
        {/* Home Team */}
        <div className="flex-1 flex items-center justify-end gap-2 text-right min-w-0">
          <div className="min-w-0">
            <div className="flex items-center justify-end gap-1.5">
              <span
                className={`text-xs sm:text-sm font-bold truncate block group-hover:text-slate-950 dark:group-hover:text-white ${
                  market === 'HOME' ? 'text-sky-600 dark:text-sky-300 font-extrabold' : 'text-slate-800 dark:text-slate-100'
                }`}
              >
                {match.homeTeam.name}
              </span>
              {market === 'HOME' && (
                <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-600/40 shrink-0">
                  HOME
                </span>
              )}
            </div>
            {showTeamForm && (
              <div className="flex items-center justify-end gap-0.5 mt-0.5">
                {match.homeTeam.form.slice(-4).map((f, i) => formatFormBadge(f, i))}
              </div>
            )}
          </div>
          <TeamCrest crest={match.homeTeam.crest} name={match.homeTeam.name} size="md" />
        </div>

        {/* Center Score / Kickoff */}
        <div className="w-20 sm:w-24 flex flex-col items-center justify-center shrink-0 px-1 text-center">
          {isLive ? (
            <>
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 tracking-wider">
                {match.livePeriod || '1H'} {match.minute ? `${match.minute}'` : ''}
              </span>
              <div className="flex items-center gap-1.5 text-base sm:text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white">
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
              <div className="flex items-center gap-1.5 text-base sm:text-lg font-black font-mono tabular-nums text-slate-800 dark:text-slate-200">
                <span>{match.scores?.home ?? 0}</span>
                <span className="text-slate-400 dark:text-slate-500">-</span>
                <span>{match.scores?.away ?? 0}</span>
              </div>
            </>
          ) : (
            <span className="text-sm font-extrabold font-mono tabular-nums text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60">
              {match.kickoffTime}
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex items-center justify-start gap-2 text-left min-w-0">
          <TeamCrest crest={match.awayTeam.crest} name={match.awayTeam.name} size="md" />
          <div className="min-w-0">
            <div className="flex items-center justify-start gap-1.5">
              <span
                className={`text-xs sm:text-sm font-bold truncate block group-hover:text-slate-950 dark:group-hover:text-white ${
                  market === 'AWAY' ? 'text-indigo-600 dark:text-indigo-300 font-extrabold' : 'text-slate-800 dark:text-slate-100'
                }`}
              >
                {match.awayTeam.name}
              </span>
              {market === 'AWAY' && (
                <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-600/40 shrink-0">
                  AWAY
                </span>
              )}
            </div>
            {showTeamForm && (
              <div className="flex items-center justify-start gap-0.5 mt-0.5">
                {match.awayTeam.form.slice(-4).map((f, i) => formatFormBadge(f, i))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Market Recommendation Pill for HIGHEST_PROB Mode */}
      {isHighestProbMode && (
        <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-sm shrink-0">{bestMarket.icon}</span>
            <span className="font-extrabold text-sky-900 dark:text-sky-300 truncate">
              {bestMarket.selection}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-200/80 dark:bg-sky-900/80 text-sky-950 dark:text-sky-200 font-bold shrink-0">
              {prob}% Edge
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate hidden xs:inline shrink-0">
            {bestMarket.reasoning}
          </span>
        </div>
      )}

      {/* Probability Progress Visual Meter for this market */}
      <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${verdict.barColor} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(5, prob))}%` }}
        />
      </div>

      {/* Bottom Insights Row */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Win 1X2 probabilities */}
          <span className="font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
            1: <strong className="text-sky-600 dark:text-sky-400">{match.predictions.outcomeProbabilities.homeWin}%</strong>
            <span className="text-slate-400 dark:text-slate-600 mx-1">|</span>
            X: <strong className="text-slate-700 dark:text-slate-300">{match.predictions.outcomeProbabilities.draw}%</strong>
            <span className="text-slate-400 dark:text-slate-600 mx-1">|</span>
            2: <strong className="text-indigo-600 dark:text-indigo-400">{match.predictions.outcomeProbabilities.awayWin}%</strong>
          </span>

          {/* xG */}
          <span className="hidden sm:inline font-mono text-slate-500 dark:text-slate-400">
            xG: <span className="text-slate-800 dark:text-slate-200">{match.predictions.expectedGoals.home}</span> vs{' '}
            <span className="text-slate-800 dark:text-slate-200">{match.predictions.expectedGoals.away}</span>
          </span>

          {/* Confidence Tier Tag */}
          <span className="inline-flex items-center gap-1 font-semibold text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800/40 text-sky-800 dark:text-sky-300">
            <ShieldCheck className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            {verdict.confidenceLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400 group-hover:text-sky-500 dark:group-hover:text-sky-300 font-semibold text-[11px] ml-auto">
          <span>Analyze</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
