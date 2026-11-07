import React, { useState } from 'react';
import { Settings, ShieldCheck, X, RefreshCw, Volume2, Info, Key, Globe, CheckCircle2, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showTeamForm: boolean;
  onToggleTeamForm: () => void;
  onResetData: () => void;
  apiSportsConfigured?: boolean;
  isRealData?: boolean;
  dataSource?: string;
  accountNotice?: string | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  showTeamForm,
  onToggleTeamForm,
  onResetData,
  apiSportsConfigured = false,
  isRealData = false,
  dataSource = 'Simulation',
  accountNotice = null,
}) => {
  const [isCheckingKey, setIsCheckingKey] = useState(false);
  const [keyCheckResult, setKeyCheckResult] = useState<{ active?: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleVerifyKey = async () => {
    setIsCheckingKey(true);
    setKeyCheckResult(null);
    try {
      const res = await fetch('/api/check-api-sports', { method: 'POST' });
      const data = await res.json();
      setKeyCheckResult(data);
    } catch (e: any) {
      setKeyCheckResult({ active: false, message: 'Failed to reach backend test route' });
    } finally {
      setIsCheckingKey(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#121c2e] border border-slate-700/80 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">App & Prediction Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real Matches / API Status Section */}
        <div className="p-3.5 rounded-2xl border text-xs space-y-2.5 bg-emerald-950/30 border-emerald-800/50 text-emerald-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Real Live Matches Data Feed</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-800/80 text-white font-mono">
              REAL MATCHES ACTIVE
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed text-[11px]">
            <strong className="text-emerald-300">Free Open Sports API Enabled:</strong> The app is actively streaming real-world games of the day from the open <strong>ESPN Live Scoreboard Feed</strong> with zero API key required.
          </p>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
            <span className="font-bold text-sky-300 block">Available Free Football APIs:</span>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">1. ESPN Open Feed (Active):</span>
              <span className="text-slate-400">100% Free, NO API key or login needed, real live scores, clock, and crests worldwide.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-sky-300 font-bold">2. API-Sports Free Tier:</span>
              <span className="text-slate-400">100 free requests/day with your custom key once email/plan is activated on dashboard.api-football.com.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-amber-300 font-bold">3. Football-Data.org:</span>
              <span className="text-slate-400">Generous free tier token covering major leagues.</span>
            </div>
          </div>

          {accountNotice && (
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/60 text-[11px] text-amber-200 space-y-1.5">
              <div className="font-bold text-amber-300 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                API-Football Provider Status:
              </div>
              <p className="leading-relaxed">{accountNotice}</p>
              <div className="text-[10px] text-amber-300/80 bg-amber-900/30 p-2 rounded-lg">
                💡 <strong>How to resolve:</strong> Log in at{' '}
                <a
                  href="https://dashboard.api-football.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-300 underline font-semibold"
                >
                  dashboard.api-football.com
                </a>
                , confirm your email address if pending, and make sure the Free plan is selected under <em>My Access / Subscriptions</em>.
              </div>
            </div>
          )}

          {/* Test / Verify API Key Button */}
          <div className="pt-1 flex flex-col gap-2">
            <button
              onClick={handleVerifyKey}
              disabled={isCheckingKey}
              className="w-full py-2 px-3 rounded-xl bg-sky-600/80 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-sky-500/40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingKey ? 'animate-spin' : ''}`} />
              <span>{isCheckingKey ? 'Verifying with API-Sports...' : 'Verify API-Sports Key Status'}</span>
            </button>

            {keyCheckResult && (
              <div
                className={`p-2.5 rounded-xl text-[11px] border leading-relaxed ${
                  keyCheckResult.active
                    ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-800/60 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {keyCheckResult.active ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span>{keyCheckResult.active ? 'Account Verified & Active!' : 'Status Check Notice'}</span>
                </div>
                <p>{keyCheckResult.message}</p>
              </div>
            )}
          </div>

          {!apiSportsConfigured && (
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1 font-mono">
              <div className="text-sky-300 font-bold font-sans">How to attach your key in AI Studio:</div>
              <div>1. Open the <strong>Settings</strong> panel in AI Studio</div>
              <div>2. Click on <strong>Secrets</strong></div>
              <div>3. Add Secret Name: <span className="text-amber-300 font-bold">API_SPORTS_KEY</span></div>
              <div>4. Paste your API-Sports key value</div>
            </div>
          )}

          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>Current Feed Source:</span>
            <span className="font-mono text-slate-200 font-semibold">{dataSource}</span>
          </div>
        </div>

        {/* Core Philosophy Notice */}
        <div className="p-3 rounded-2xl bg-[#162238] border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Independent Quantitative Engine</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Bookmaker odds are deliberately excluded because odds reflect public betting liabilities rather than pure football reality. This app computes pure probabilities using H2H history, referee tendencies, squad injuries, home turf ratings, and Poisson sequence simulations.
          </p>
        </div>

        {/* Settings options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#162238] border border-slate-800 text-xs">
            <div>
              <span className="font-bold text-white block">Display Team Form Pills</span>
              <span className="text-slate-400 text-[11px]">Show W/D/L badges in match rows</span>
            </div>
            <button
              onClick={onToggleTeamForm}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                showTeamForm ? 'bg-sky-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  showTeamForm ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#162238] border border-slate-800 text-xs">
            <div>
              <span className="font-bold text-white block">Consecutive Unanswered Goals Engine</span>
              <span className="text-slate-400 text-[11px]">2,000-iteration Markov Monte Carlo model</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
              ACTIVE
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#162238] border border-slate-800 text-xs">
            <div>
              <span className="font-bold text-white block">Reset Favorites & Cache</span>
              <span className="text-slate-400 text-[11px]">Clear stored settings</span>
            </div>
            <button
              onClick={onResetData}
              className="px-2.5 py-1 text-xs rounded-lg bg-rose-900/40 border border-rose-800 text-rose-300 hover:bg-rose-900/70 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-500 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
