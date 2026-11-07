import React from 'react';
import { Target, SlidersHorizontal, X, ArrowDownWideNarrow, ShieldCheck } from 'lucide-react';
import { PredictionMarketFilter } from '../types/football';
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
    <div className="bg-slate-100/80 dark:bg-[#121c2e] border-b border-slate-200 dark:border-sky-900/40 select-none shadow-sm transition-colors duration-150">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
        {/* Top line: Label + Selection Box + Reset button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:bg-sky-500/20 dark:border-sky-500/40 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wide uppercase">
                  Prediction Market
                </span>
                {selectedMarket !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-300 dark:bg-sky-600/30 dark:text-sky-300 dark:border-sky-500/40 flex items-center gap-1">
                    <ArrowDownWideNarrow className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                    Highest to Lowest
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
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
                className="w-full appearance-none bg-white text-slate-900 border-slate-300 hover:border-slate-400 dark:bg-[#19263e] dark:hover:bg-[#1f2f4c] dark:text-white text-xs font-bold pl-3 pr-8 py-2 rounded-xl border dark:border-sky-600/50 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors cursor-pointer shadow-sm"
              >
                <option value="ALL">
                  🌟 All Matches (Default Fixtures)
                </option>
                <optgroup label="── 1X2 Match Outcomes ──">
                  <option value="HOME">
                    🏠 Home Win (1) — Highest Probability
                  </option>
                  <option value="DRAW">
                    🤝 Draw (X) — Highest Probability
                  </option>
                  <option value="AWAY">
                    ✈️ Away Win (2) — Highest Probability
                  </option>
                </optgroup>
                <optgroup label="── Over Total Goals ──">
                  <option value="OVER_15">
                    ⚽ Over 1.5 Goals (O1.5) — Highest Probability
                  </option>
                  <option value="OVER_25">
                    🔥 Over 2.5 Goals (O2.5) — Highest Probability
                  </option>
                  <option value="OVER_35">
                    💥 Over 3.5 Goals (O3.5) — Highest Probability
                  </option>
                </optgroup>
                <optgroup label="── Under Total Goals ──">
                  <option value="UNDER_15">
                    🛡️ Under 1.5 Goals (U1.5) — Highest Probability
                  </option>
                  <option value="UNDER_25">
                    🧱 Under 2.5 Goals (U2.5) — Highest Probability
                  </option>
                  <option value="UNDER_35">
                    🔒 Under 3.5 Goals (U3.5) — Highest Probability
                  </option>
                </optgroup>
                <optgroup label="── Both Teams To Score ──">
                  <option value="BTTS">
                    🎯 Both Teams To Score (BTTS Yes)
                  </option>
                  <option value="BTTS_NO">
                    🚫 Both Teams Score No (BTTS No)
                  </option>
                </optgroup>
              </select>
              {/* Custom caret icon */}
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-sky-600 dark:text-sky-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
            </div>

            {selectedMarket !== 'ALL' && (
              <button
                onClick={() => onSelectMarket('ALL')}
                className="px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white text-xs font-semibold flex items-center gap-1 dark:border-slate-700 transition-colors shadow-sm"
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
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-transparent'
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
                    ? 'bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950 font-extrabold shadow-sm scale-[1.03]'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-transparent'
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
          <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Probability Threshold Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mr-1">
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
                      : 'bg-white text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {thresh.label}
                </button>
              ))}

              <button
                onClick={onToggleOnlyHighProbability}
                className={`ml-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                  onlyHighProbability
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title="Only show games above recommended algorithmic edge threshold"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>High Edge Only (≥{currentMarketMeta?.defaultHighProbabilityThreshold || 50}%)</span>
              </button>
            </div>

            {/* Results count & Top pick highlight */}
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
              <span className="text-slate-600 dark:text-slate-400">
                Found <strong className="text-sky-600 dark:text-sky-300 font-mono">{totalMatchesCount}</strong> games
              </span>
              {highestProbability !== undefined && highestProbability > 0 && (
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-600/40 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
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
