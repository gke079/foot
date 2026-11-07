import React from 'react';
import { Target, SlidersHorizontal, Flame, Sparkles, X, ArrowDownWideNarrow, ShieldCheck, Check } from 'lucide-react';
import { PredictionMarketFilter, PredictionMarketMeta } from '../types/football';
import { PREDICTION_MARKET_OPTIONS } from '../utils/predictionEngine';

interface PredictionMarketSelectorProps {
  selectedMarket: PredictionMarketFilter;
  onSelectMarket: (market: PredictionMarketFilter) => void;
  onlyHighProbability: boolean;
  onToggleOnlyHighProbability: () => void;
  minProbabilityThreshold: number;
  onChangeMinProbabilityThreshold: (thresh: number) => void;
  totalMatchesCount: number;
  highestProbability?: number;
  topTeamName?: string;
}

export const PredictionMarketSelector: React.FC<PredictionMarketSelectorProps> = ({
  selectedMarket,
  onSelectMarket,
  onlyHighProbability,
  onToggleOnlyHighProbability,
  minProbabilityThreshold,
  onChangeMinProbabilityThreshold,
  totalMatchesCount,
  highestProbability,
  topTeamName,
}) => {
  const currentMarketMeta = PREDICTION_MARKET_OPTIONS.find(m => m.id === selectedMarket);

  return (
    <div className="bg-[#121c2e] border-b border-sky-900/40 select-none shadow-sm">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
        {/* Top line: Label + Selection Box + Reset button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  Prediction Market
                </span>
                {selectedMarket !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-600/30 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                    <ArrowDownWideNarrow className="w-3 h-3 text-sky-400" />
                    Highest to Lowest
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {selectedMarket === 'ALL'
                  ? 'Select a prediction below to rank games by winning probability'
                  : `Arranged by ${currentMarketMeta?.label || selectedMarket} probability`}
              </p>
            </div>
          </div>

          {/* Right: The Selection Box (Dropdown) + Clear button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <select
                id="prediction-market-select"
                aria-label="Select prediction market"
                value={selectedMarket}
                onChange={e => onSelectMarket(e.target.value as PredictionMarketFilter)}
                className="w-full appearance-none bg-[#19263e] hover:bg-[#1f2f4c] text-white text-xs font-bold pl-3 pr-8 py-2 rounded-xl border border-sky-600/50 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 transition-colors cursor-pointer shadow-inner"
              >
                <option value="ALL" className="bg-[#101826] text-slate-300">
                  🌟 All Matches (Default Fixtures)
                </option>
                <optgroup label="── 1X2 Match Outcomes ──" className="bg-[#101826] text-sky-400 font-bold">
                  <option value="HOME" className="bg-[#101826] text-white">
                    🏠 Home Win (1) — Highest Probability
                  </option>
                  <option value="DRAW" className="bg-[#101826] text-white">
                    🤝 Draw (X) — Highest Probability
                  </option>
                  <option value="AWAY" className="bg-[#101826] text-white">
                    ✈️ Away Win (2) — Highest Probability
                  </option>
                </optgroup>
                <optgroup label="── Over Total Goals ──" className="bg-[#101826] text-amber-400 font-bold">
                  <option value="OVER_15" className="bg-[#101826] text-white">
                    ⚽ Over 1.5 Goals (O1.5) — Highest Probability
                  </option>
                  <option value="OVER_25" className="bg-[#101826] text-white">
                    🔥 Over 2.5 Goals (O2.5) — Highest Probability
                  </option>
                  <option value="OVER_35" className="bg-[#101826] text-white">
                    💥 Over 3.5 Goals (O3.5) — Highest Probability
                  </option>
                </optgroup>
                <optgroup label="── Under Total Goals ──" className="bg-[#101826] text-emerald-400 font-bold">
                  <option value="UNDER_15" className="bg-[#101826] text-white">
                    🛡️ Under 1.5 Goals (U1.5) — Highest Probability
                  </option>
                  <option value="UNDER_25" className="bg-[#101826] text-white">
                    🧱 Under 2.5 Goals (U2.5) — Highest Probability
                  </option>
                  <option value="UNDER_35" className="bg-[#101826] text-white">
                    🔒 Under 3.5 Goals (U3.5) — Highest Probability
                  </option>
                </optgroup>
                <optgroup label="── Both Teams To Score ──" className="bg-[#101826] text-cyan-400 font-bold">
                  <option value="BTTS" className="bg-[#101826] text-white">
                    🎯 Both Teams To Score (BTTS Yes)
                  </option>
                  <option value="BTTS_NO" className="bg-[#101826] text-white">
                    🚫 Both Teams Score No (BTTS No)
                  </option>
                </optgroup>
              </select>
              {/* Custom caret icon */}
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-sky-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
            </div>

            {selectedMarket !== 'ALL' && (
              <button
                onClick={() => onSelectMarket('ALL')}
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                title="Reset to default league view"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick-Access Prediction Buttons Strip */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => onSelectMarket('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              selectedMarket === 'ALL'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            All
          </button>

          {PREDICTION_MARKET_OPTIONS.map(opt => {
            const isSelected = selectedMarket === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onSelectMarket(opt.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 font-extrabold shadow-md shadow-sky-500/20 scale-[1.03]'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-bar when a market is chosen: Confidence Filter & Stats Banner */}
        {selectedMarket !== 'ALL' && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Probability Threshold Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-medium text-slate-400 mr-1">
                Min Probability:
              </span>
              {[
                { label: 'All Ranked', value: 0 },
                { label: '50%+', value: 50 },
                { label: '60%+', value: 60 },
                { label: '70%+', value: 70 },
              ].map(thresh => (
                <button
                  key={thresh.value}
                  onClick={() => onChangeMinProbabilityThreshold(thresh.value)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold transition-colors ${
                    minProbabilityThreshold === thresh.value
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {thresh.label}
                </button>
              ))}

              <button
                onClick={onToggleOnlyHighProbability}
                className={`ml-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                  onlyHighProbability
                    ? 'bg-emerald-600/90 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Only show games above recommended algorithmic edge threshold"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>High Edge Only (≥{currentMarketMeta?.defaultHighProbabilityThreshold || 50}%)</span>
              </button>
            </div>

            {/* Results count & Top pick highlight */}
            <div className="flex items-center gap-2 text-slate-300 font-medium text-[11px]">
              <span className="text-slate-400">
                Found <strong className="text-sky-300 font-mono">{totalMatchesCount}</strong> games
              </span>
              {highestProbability !== undefined && highestProbability > 0 && (
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 font-mono font-bold">
                  Top #{1}: {highestProbability}% {topTeamName ? `(${topTeamName})` : ''}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
