import React, { useState } from 'react';
import { Zap, Flame, ShieldCheck, TrendingUp, Sparkles, Filter, ChevronRight, X } from 'lucide-react';
import { Match, PredictionMarketFilter } from '../types/football';
import { TeamCrest } from './TeamCrest';
import { PREDICTION_MARKET_OPTIONS } from '../utils/predictionEngine';

interface EaglePredictorHubProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
  onClose: () => void;
  onApplyMarketFilter?: (market: PredictionMarketFilter) => void;
}

export const EaglePredictorHub: React.FC<EaglePredictorHubProps> = ({
  matches,
  onSelectMatch,
  onClose,
  onApplyMarketFilter,
}) => {
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'CONSECUTIVE_GOALS' | 'HIGH_CONFIDENCE' | 'OVER_GOALS' | 'CLEAN_SHEET'>('ALL');

  // Find consecutive goals bankers (2+ unanswered goals probability >= 40%)
  const consecutiveGoalsPicks = matches
    .map(m => {
      const c = m.predictions.consecutiveGoals;
      const isHomeHigher = c.homeScore2PlusUnanswered >= c.awayScore2PlusUnanswered;
      const team = isHomeHigher ? m.homeTeam : m.awayTeam;
      const prob = isHomeHigher ? c.homeScore2PlusUnanswered : c.awayScore2PlusUnanswered;
      const streak3 = isHomeHigher ? c.homeScore3PlusUnanswered : c.awayScore3PlusUnanswered;
      return { match: m, team, prob, streak3, isHome: isHomeHigher };
    })
    .filter(item => item.prob >= 35)
    .sort((a, b) => b.prob - a.prob);

  // High confidence 1X2 or Double Chance picks (>65%)
  const highConfidencePicks = matches
    .map(m => {
      const p = m.predictions;
      const maxOutcome = Math.max(p.outcomeProbabilities.homeWin, p.outcomeProbabilities.awayWin);
      return { match: m, maxOutcome, verdict: p.primaryVerdict };
    })
    .filter(item => item.maxOutcome >= 55)
    .sort((a, b) => b.maxOutcome - a.maxOutcome);

  // Over 2.5 Goals Bankers
  const overGoalsPicks = matches
    .filter(m => m.predictions.goalMarkets.over25 >= 58)
    .sort((a, b) => b.predictions.goalMarkets.over25 - a.predictions.goalMarkets.over25);

  // Clean Sheet Bankers
  const cleanSheetPicks = matches
    .map(m => {
      const p = m.predictions.cleanSheets;
      const best = p.homeCleanSheet >= p.awayCleanSheet
        ? { team: m.homeTeam, prob: p.homeCleanSheet }
        : { team: m.awayTeam, prob: p.awayCleanSheet };
      return { match: m, best };
    })
    .filter(item => item.best.prob >= 40)
    .sort((a, b) => b.best.prob - a.best.prob);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#111a2c] border border-sky-800/60 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#14233e] via-[#162744] to-[#121c2e] border-b border-sky-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-600/30">
              <Zap className="w-5 h-5 fill-white text-sky-200" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Eagle Predictor AI Hub
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Data-Driven Edge
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Filtered algorithmic probabilities excluding bookmaker bias
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close Predictor Hub"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 bg-[#0d1422] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'ALL', label: '🔥 All Highlights' },
            { id: 'CONSECUTIVE_GOALS', label: '⚡ Consecutive 2+ Runs' },
            { id: 'HIGH_CONFIDENCE', label: '💎 High Confidence' },
            { id: 'OVER_GOALS', label: '⚽ Over 2.5 Goals' },
            { id: 'CLEAN_SHEET', label: '🛡️ Clean Sheet' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setMarketFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                marketFilter === f.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Quick Jump to Ranked Market Feed */}
          {onApplyMarketFilter && (
            <div className="p-3.5 rounded-2xl bg-[#0f1726] border border-sky-600/40 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Rank All Games by Specific Prediction
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Highest % First
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2.5">
                Select any prediction market to view all matches on today's slate arranged from highest to lowest probability:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PREDICTION_MARKET_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => onApplyMarketFilter(opt.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#17253d] hover:bg-sky-600 hover:text-white text-slate-200 border border-slate-700/80 hover:border-sky-500 transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 1: CONSECUTIVE GOALS RADAR */}
          {(marketFilter === 'ALL' || marketFilter === 'CONSECUTIVE_GOALS') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Consecutive Unanswered Goals Radar
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">
                  Team scores 2+ without opponent reply
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {consecutiveGoalsPicks.slice(0, 4).map((pick, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      onClose();
                      onSelectMatch(pick.match);
                    }}
                    className="p-3.5 rounded-2xl bg-[#162238] hover:bg-[#1a2944] border border-amber-600/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">
                        {pick.match.competition.name}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                        {pick.prob}% Chance
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mt-2">
                      <TeamCrest crest={pick.team.crest} name={pick.team.name} size="sm" />
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                          {pick.team.name} to score 2+ Unanswered
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          vs {pick.isHome ? pick.match.awayTeam.name : pick.match.homeTeam.name}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>3+ Unanswered Streak: <strong className="text-slate-200 font-mono">{pick.streak3}%</strong></span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: HIGH CONFIDENCE 1X2 PICKS */}
          {(marketFilter === 'ALL' || marketFilter === 'HIGH_CONFIDENCE') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    High Confidence Match Outcomes
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">Top Poisson & Form Edges</span>
              </div>

              <div className="space-y-2">
                {highConfidencePicks.map((pick, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      onClose();
                      onSelectMatch(pick.match);
                    }}
                    className="p-3.5 rounded-2xl bg-[#162238] hover:bg-[#1a2944] border border-slate-800 flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-mono font-bold text-sky-400 w-10 text-center">
                        {pick.maxOutcome}%
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-sky-300">
                          {pick.verdict.pick}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {pick.match.homeTeam.shortName} vs {pick.match.awayTeam.shortName} · {pick.match.competition.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/40">
                        {pick.verdict.confidence}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: OVER GOALS */}
          {(marketFilter === 'ALL' || marketFilter === 'OVER_GOALS') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    High Scoring Expectancy (Over 2.5 Goals)
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {overGoalsPicks.map((match, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      onClose();
                      onSelectMatch(match);
                    }}
                    className="p-3 rounded-xl bg-[#162238] hover:bg-[#1a2944] border border-slate-800 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{match.competition.name}</span>
                      <span className="font-mono font-bold text-emerald-400">{match.predictions.goalMarkets.over25}% Over 2.5</span>
                    </div>
                    <div className="text-sm font-bold text-white mt-1">
                      {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Expected Total Goals: <strong className="text-slate-200 font-mono">{match.predictions.expectedGoals.total.toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
