import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  ShieldAlert,
  Users,
  Award,
  Sparkles,
  BarChart3,
  Calendar,
  AlertTriangle,
  Zap,
  Info,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { Match } from '../types/football';
import { TeamCrest } from './TeamCrest';

interface MatchAnalysisModalProps {
  match: Match | null;
  onClose: () => void;
  onToggleFavorite: (matchId: string) => void;
  isFavorite: boolean;
}

export const MatchAnalysisModal: React.FC<MatchAnalysisModalProps> = ({
  match,
  onClose,
  onToggleFavorite,
  isFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<'PREDICTIONS' | 'TACTICAL' | 'INJURIES' | 'H2H_REF' | 'AI_REPORT'>('PREDICTIONS');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!match) return null;

  const { homeTeam, awayTeam, referee, h2h, predictions } = match;
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';

  const handleFetchAiReport = async () => {
    setIsGeneratingAI(true);
    setAiError(null);
    try {
      const res = await fetch('/api/gemini/analyze-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match }),
      });
      if (!res.ok) throw new Error('Failed to generate scouting analysis');
      const data = await res.json();
      setAiReport(data);
    } catch (err: any) {
      setAiError(err.message || 'Scouting engine busy. Please retry.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121c2e] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-[#18253d] border-b border-slate-700/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-white">{match.competition.name}</span>
            <span className="text-slate-500">·</span>
            <span>{match.date}</span>
            <span className="text-slate-500">·</span>
            <span className="font-mono">{match.kickoffTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(match.id)}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:text-amber-400 transition-colors"
            >
              {isFavorite ? '★ Favorited' : '☆ Favorite'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Close match details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Scoreboard */}
        <div className="p-4 sm:p-6 bg-gradient-to-b from-[#18253d] to-[#121c2e] border-b border-slate-800/80 shrink-0">
          <div className="flex items-center justify-between gap-3">
            {/* Home Team */}
            <div className="flex-1 flex flex-col items-center text-center">
              <TeamCrest crest={homeTeam.crest} name={homeTeam.name} size="lg" />
              <h2 className="text-sm sm:text-base font-bold text-white mt-2 leading-tight">
                {homeTeam.name}
              </h2>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Pos: #{homeTeam.leaguePosition} · {homeTeam.points} pts
              </span>
              <div className="flex gap-1 mt-1">
                {homeTeam.form.map((f, i) => (
                  <span
                    key={i}
                    className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[8px] font-bold font-mono ${
                      f === 'W' ? 'bg-emerald-600 text-white' : f === 'D' ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Center Status / Score / xG */}
            <div className="flex flex-col items-center justify-center px-2">
              {isLive ? (
                <div className="flex flex-col items-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-600/90 text-white animate-pulse">
                    LIVE {match.minute}'
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1">
                    {match.scores?.home ?? 0} - {match.scores?.away ?? 0}
                  </div>
                </div>
              ) : isFinished ? (
                <div className="flex flex-col items-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-700 text-slate-300">
                    Full Time
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-100 mt-1">
                    {match.scores?.home ?? 0} - {match.scores?.away ?? 0}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                    Kickoff
                  </span>
                  <div className="text-2xl font-bold font-mono text-white mt-0.5">
                    {match.kickoffTime}
                  </div>
                </div>
              )}

              {/* Expected Goals (xG) Baseline */}
              <div className="mt-2 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Model Expected Goals (xG)
                </span>
                <div className="text-xs font-mono font-bold text-sky-300 mt-0.5">
                  {predictions.expectedGoals.home.toFixed(2)} vs {predictions.expectedGoals.away.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex-1 flex flex-col items-center text-center">
              <TeamCrest crest={awayTeam.crest} name={awayTeam.name} size="lg" />
              <h2 className="text-sm sm:text-base font-bold text-white mt-2 leading-tight">
                {awayTeam.name}
              </h2>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Pos: #{awayTeam.leaguePosition} · {awayTeam.points} pts
              </span>
              <div className="flex gap-1 mt-1">
                {awayTeam.form.map((f, i) => (
                  <span
                    key={i}
                    className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[8px] font-bold font-mono ${
                      f === 'W' ? 'bg-emerald-600 text-white' : f === 'D' ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Venue & Referee strip */}
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-around gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {match.venue}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              Ref: <strong className="text-slate-200">{referee.name}</strong> ({referee.strictness})
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 bg-[#0f1726] px-2 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'PREDICTIONS', label: 'Predictions & Markets' },
            { id: 'TACTICAL', label: 'Tactics & Strengths' },
            { id: 'INJURIES', label: `Squad News (${homeTeam.keyInjuries.length + awayTeam.keyInjuries.length})` },
            { id: 'H2H_REF', label: 'H2H & Referee' },
            { id: 'AI_REPORT', label: '✨ AI Scout Report' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-colors relative ${
                activeTab === tab.id
                  ? 'text-sky-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: PREDICTIONS & MARKETS */}
          {activeTab === 'PREDICTIONS' && (
            <div className="space-y-4">
              {/* Primary Algorithmic Verdict Banner */}
              <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-800/50 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sky-900/60 text-sky-400 mt-0.5 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
                      Algorithmic Core Pick ({predictions.primaryVerdict.market})
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-800/80 text-white">
                      {predictions.primaryVerdict.confidence} CONFIDENCE
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    {predictions.primaryVerdict.pick}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {predictions.primaryVerdict.rationale}
                  </p>
                </div>
              </div>

              {/* 1X2 Match Outcome Probabilities */}
              <div className="p-4 rounded-2xl bg-[#162238] border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Match Outcome Probabilities (1X2)</span>
                  <span className="text-[10px] font-normal text-slate-400">Pure Mathematical Model</span>
                </h4>

                {/* Progress bar */}
                <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-800 text-[9px] font-bold text-white select-none">
                  <div
                    style={{ width: `${predictions.outcomeProbabilities.homeWin}%` }}
                    className="bg-sky-500 flex items-center justify-center transition-all"
                  />
                  <div
                    style={{ width: `${predictions.outcomeProbabilities.draw}%` }}
                    className="bg-slate-500 flex items-center justify-center transition-all"
                  />
                  <div
                    style={{ width: `${predictions.outcomeProbabilities.awayWin}%` }}
                    className="bg-indigo-500 flex items-center justify-center transition-all"
                  />
                </div>

                {/* 3 Outcome Cards */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[11px] text-slate-400 font-semibold block">{homeTeam.shortName} (1)</span>
                    <span className="text-lg font-bold font-mono text-sky-400">
                      {predictions.outcomeProbabilities.homeWin}%
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[11px] text-slate-400 font-semibold block">Draw (X)</span>
                    <span className="text-lg font-bold font-mono text-slate-300">
                      {predictions.outcomeProbabilities.draw}%
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[11px] text-slate-400 font-semibold block">{awayTeam.shortName} (2)</span>
                    <span className="text-lg font-bold font-mono text-indigo-400">
                      {predictions.outcomeProbabilities.awayWin}%
                    </span>
                  </div>
                </div>
              </div>

              {/* CONSECUTIVE UNANSWERED GOALS MARKET (Specifically requested by user) */}
              <div className="p-4 rounded-2xl bg-[#192742] border border-amber-600/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Consecutive Unanswered Goals Analysis
                    </h4>
                  </div>
                  <span className="text-[10px] text-amber-300 font-medium px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40">
                    Markov Streak Simulation
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  Calculates the probability of a team scoring 2 or more consecutive goals without the opponent scoring in between.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Home Streak Card */}
                  <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                      <span>{homeTeam.shortName} 2+ Unanswered</span>
                      <span className="text-amber-400 font-mono font-bold text-sm">
                        {predictions.consecutiveGoals.homeScore2PlusUnanswered}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full mt-1.5 overflow-hidden">
                      <div
                        style={{ width: `${predictions.consecutiveGoals.homeScore2PlusUnanswered}%` }}
                        className="bg-amber-400 h-full rounded-full"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>3+ Unanswered Streak:</span>
                      <span className="font-mono text-slate-300">{predictions.consecutiveGoals.homeScore3PlusUnanswered}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>Season Best Unanswered Run:</span>
                      <span className="font-mono text-slate-300">{predictions.consecutiveGoals.homeLongestStreakThisSeason} goals</span>
                    </div>
                  </div>

                  {/* Away Streak Card */}
                  <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                      <span>{awayTeam.shortName} 2+ Unanswered</span>
                      <span className="text-amber-400 font-mono font-bold text-sm">
                        {predictions.consecutiveGoals.awayScore2PlusUnanswered}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full mt-1.5 overflow-hidden">
                      <div
                        style={{ width: `${predictions.consecutiveGoals.awayScore2PlusUnanswered}%` }}
                        className="bg-amber-400 h-full rounded-full"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>3+ Unanswered Streak:</span>
                      <span className="font-mono text-slate-300">{predictions.consecutiveGoals.awayScore3PlusUnanswered}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>Season Best Unanswered Run:</span>
                      <span className="font-mono text-slate-300">{predictions.consecutiveGoals.awayLongestStreakThisSeason} goals</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 p-2 rounded-lg bg-amber-950/30 border border-amber-800/30 text-xs text-amber-200/90 leading-relaxed">
                  💡 <strong>Momentum Verdict:</strong> {predictions.consecutiveGoals.streakMomentumVerdict}
                </div>
              </div>

              {/* Goal Totals & BTTS Markets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-xl bg-[#162238] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Over 1.5 Goals</span>
                  <span className="text-lg font-mono font-bold text-white mt-1 block">
                    {predictions.goalMarkets.over15}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#162238] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Over 2.5 Goals</span>
                  <span className="text-lg font-mono font-bold text-sky-400 mt-1 block">
                    {predictions.goalMarkets.over25}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#162238] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Under 2.5 Goals</span>
                  <span className="text-lg font-mono font-bold text-slate-300 mt-1 block">
                    {predictions.goalMarkets.under25}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#162238] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">BTTS (Both Score)</span>
                  <span className="text-lg font-mono font-bold text-emerald-400 mt-1 block">
                    {predictions.bothTeamsToScore.yes}%
                  </span>
                </div>
              </div>

              {/* Top Most Likely Exact Scorelines (Poisson) */}
              <div className="p-4 rounded-2xl bg-[#162238] border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Top 5 Most Likely Exact Scorelines (Poisson Distribution)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {predictions.topLikelyScores.map((score, i) => (
                    <div
                      key={i}
                      className="flex-1 min-w-[90px] p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center"
                    >
                      <span className="text-sm font-bold font-mono text-white block">
                        {score.score}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-sky-400 mt-0.5 block">
                        {score.probability}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Double Chance & Clean Sheet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#162238] border border-slate-800">
                  <h5 className="text-[11px] font-bold text-slate-300 uppercase mb-2">Double Chance</h5>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">1X ({homeTeam.shortName} or Draw):</span>
                      <strong className="text-white font-mono">{predictions.doubleChance.homeOrDraw}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">12 (Any Team Wins):</span>
                      <strong className="text-white font-mono">{predictions.doubleChance.homeOrAway}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">X2 (Draw or {awayTeam.shortName}):</span>
                      <strong className="text-white font-mono">{predictions.doubleChance.drawOrAway}%</strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#162238] border border-slate-800">
                  <h5 className="text-[11px] font-bold text-slate-300 uppercase mb-2">Clean Sheets</h5>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{homeTeam.shortName} Clean Sheet:</span>
                      <strong className="text-emerald-400 font-mono">{predictions.cleanSheets.homeCleanSheet}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{awayTeam.shortName} Clean Sheet:</span>
                      <strong className="text-emerald-400 font-mono">{predictions.cleanSheets.awayCleanSheet}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">First Goal:</span>
                      <strong className="text-slate-200 font-mono">{homeTeam.shortName} {predictions.firstTeamToScore.home}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TACTICAL & STRENGTHS */}
          {activeTab === 'TACTICAL' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#162238] border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Tactical Profiles & Style of Play
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[10px] uppercase font-bold text-sky-400">{homeTeam.name}</span>
                    <p className="font-semibold text-white mt-1">{homeTeam.tacticalStyle}</p>
                    <p className="text-slate-400 text-[11px] mt-1">Average Possession: {homeTeam.possessionAvg}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[10px] uppercase font-bold text-indigo-400">{awayTeam.name}</span>
                    <p className="font-semibold text-white mt-1">{awayTeam.tacticalStyle}</p>
                    <p className="text-slate-400 text-[11px] mt-1">Average Possession: {awayTeam.possessionAvg}%</p>
                  </div>
                </div>
              </div>

              {/* Attack vs Defense Radar/Bars */}
              <div className="p-4 rounded-2xl bg-[#162238] border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Comparative Strength Ratings (0 - 100)
                </h4>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-sky-400 font-semibold">{homeTeam.shortName} Attack ({homeTeam.attackRating})</span>
                    <span className="text-indigo-400 font-semibold">{awayTeam.shortName} Attack ({awayTeam.attackRating})</span>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full flex overflow-hidden">
                    <div style={{ width: `${(homeTeam.attackRating / (homeTeam.attackRating + awayTeam.attackRating)) * 100}%` }} className="bg-sky-500" />
                    <div style={{ width: `${(awayTeam.attackRating / (homeTeam.attackRating + awayTeam.attackRating)) * 100}%` }} className="bg-indigo-500" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-sky-400 font-semibold">{homeTeam.shortName} Defense ({homeTeam.defenseRating})</span>
                    <span className="text-indigo-400 font-semibold">{awayTeam.shortName} Defense ({awayTeam.defenseRating})</span>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full flex overflow-hidden">
                    <div style={{ width: `${(homeTeam.defenseRating / (homeTeam.defenseRating + awayTeam.defenseRating)) * 100}%` }} className="bg-sky-500" />
                    <div style={{ width: `${(awayTeam.defenseRating / (homeTeam.defenseRating + awayTeam.defenseRating)) * 100}%` }} className="bg-indigo-500" />
                  </div>
                </div>

                {/* Home Advantage Factor */}
                <div className="mt-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/40 text-xs">
                  <span className="font-bold text-white block">🏟️ Home Ground Multiplier</span>
                  <p className="text-slate-300 mt-1">
                    {predictions.keyAnalyticalFactors.homeAdvantage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INJURIES & SQUAD NEWS */}
          {activeTab === 'INJURIES' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-center gap-2 text-xs text-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Our prediction algorithm recalculates team xG and defensive stability dynamically based on key player absences.
                </span>
              </div>

              {/* Home Team Injuries */}
              <div className="p-4 rounded-2xl bg-[#162238] border border-slate-800">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2.5">
                  {homeTeam.name} Player Availability
                </h4>
                {homeTeam.keyInjuries.length === 0 ? (
                  <p className="text-xs text-slate-400">Full squad available with zero major absences.</p>
                ) : (
                  <div className="space-y-2">
                    {homeTeam.keyInjuries.map((inj, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">{inj.player}</span>
                          <span className="text-slate-400 ml-1.5 font-mono">[{inj.position}]</span>
                          <p className="text-[11px] text-slate-400">{inj.reason}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inj.status === 'OUT' ? 'bg-rose-900/60 text-rose-300 border border-rose-800' : 'bg-amber-900/60 text-amber-300'
                          }`}>
                            {inj.status}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">Impact: {inj.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Away Team Injuries */}
              <div className="p-4 rounded-2xl bg-[#162238] border border-slate-800">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2.5">
                  {awayTeam.name} Player Availability
                </h4>
                {awayTeam.keyInjuries.length === 0 ? (
                  <p className="text-xs text-slate-400">Full squad available with zero major absences.</p>
                ) : (
                  <div className="space-y-2">
                    {awayTeam.keyInjuries.map((inj, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">{inj.player}</span>
                          <span className="text-slate-400 ml-1.5 font-mono">[{inj.position}]</span>
                          <p className="text-[11px] text-slate-400">{inj.reason}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inj.status === 'OUT' ? 'bg-rose-900/60 text-rose-300 border border-rose-800' : 'bg-amber-900/60 text-amber-300'
                          }`}>
                            {inj.status}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">Impact: {inj.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: H2H & REFEREE */}
          {activeTab === 'H2H_REF' && (
            <div className="space-y-4">
              {/* Referee Profile */}
              <div className="p-4 rounded-2xl bg-[#162238] border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Match Official Profile</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    referee.strictness === 'STRICT' ? 'bg-rose-900/60 text-rose-300' : 'bg-sky-900/60 text-sky-300'
                  }`}>
                    {referee.strictness} STRICTNESS
                  </span>
                </h4>
                <div className="text-sm font-bold text-white">{referee.name} ({referee.country})</div>
                <p className="text-xs text-slate-400 mt-1">{referee.notes}</p>

                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="p-2 rounded-xl bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Fouls / Game</span>
                    <span className="text-sm font-mono font-bold text-white">{referee.foulsPerGame}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Yellow Cards</span>
                    <span className="text-sm font-mono font-bold text-amber-400">{referee.yellowCardsPerGame}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Penalties / Game</span>
                    <span className="text-sm font-mono font-bold text-rose-400">{referee.penaltiesPerGame}</span>
                  </div>
                </div>
              </div>

              {/* Head-to-Head (H2H) Historical Records */}
              <div className="p-4 rounded-2xl bg-[#162238] border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Head-to-Head (H2H) Past Record
                </h4>
                <div className="flex justify-around text-center p-3 rounded-xl bg-slate-800/50 mb-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">{homeTeam.shortName} Wins</span>
                    <strong className="text-sky-400 text-base font-mono">{h2h.homeWins}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Draws</span>
                    <strong className="text-slate-300 text-base font-mono">{h2h.draws}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{awayTeam.shortName} Wins</span>
                    <strong className="text-indigo-400 text-base font-mono">{h2h.awayWins}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Avg Goals</span>
                    <strong className="text-amber-400 text-base font-mono">{h2h.avgGoalsPerMatch}</strong>
                  </div>
                </div>

                {/* List of past encounters */}
                <div className="space-y-1.5">
                  {h2h.recentMatches.map((m, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">{m.date}</span>
                      <span className="text-white font-medium">
                        {m.homeTeam} <strong className="font-mono text-sky-300">{m.homeScore} - {m.awayScore}</strong> {m.awayTeam}
                      </span>
                      <span className="text-[10px] text-slate-400">{m.competition}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GEMINI AI DEEP TACTICAL SYNTHESIS */}
          {activeTab === 'AI_REPORT' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-800/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-sky-400 animate-spin" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Gemini Tactical Scouting Engine</h4>
                      <p className="text-xs text-slate-300">
                        Synthesizes H2H, player absences, referee tendencies, and consecutive goal risks.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleFetchAiReport}
                    disabled={isGeneratingAI}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-1.5"
                  >
                    {isGeneratingAI ? 'Scouting...' : 'Generate AI Report'}
                  </button>
                </div>
              </div>

              {aiError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
                  {aiError}
                </div>
              )}

              {aiReport ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-[#162238] border border-slate-800 space-y-3">
                    <div>
                      <h5 className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Tactical Breakdown</h5>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed">{aiReport.tacticalSummary}</p>
                    </div>

                    <div className="border-t border-slate-800 pt-3">
                      <h5 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Pace, Flow & Referee Impact</h5>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed">{aiReport.matchPaceAndFlow}</p>
                    </div>

                    <div className="border-t border-slate-800 pt-3">
                      <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Key Pitch Duels</h5>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed">{aiReport.keyDuels}</p>
                    </div>

                    <div className="border-t border-slate-800 pt-3">
                      <h5 className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Consecutive Goal Threat & Momentum</h5>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed">{aiReport.unansweredGoalThreat}</p>
                    </div>
                  </div>

                  {aiReport.smartValuePicks && (
                    <div className="p-4 rounded-2xl bg-[#162238] border border-slate-800">
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Recommended Smart Value Selections</h5>
                      <div className="space-y-2">
                        {aiReport.smartValuePicks.map((pick: any, i: number) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-sky-300">{pick.market}: {pick.selection}</span>
                              <span className="font-mono text-xs font-semibold text-emerald-400">{pick.probability}</span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{pick.reasoning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-[#162238] border border-dashed border-slate-700/60">
                  <Sparkles className="w-8 h-8 text-sky-400 mx-auto mb-2 opacity-70" />
                  <h5 className="text-sm font-bold text-white">Deep AI Match Scouting Available</h5>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Click "Generate AI Report" above to trigger an in-depth quantitative analysis generated via Gemini 3.8.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
