import React, { useState } from 'react';
import { Bell, Check, Trash2, Sliders, Sparkles, X, Volume2, ShieldCheck, Zap } from 'lucide-react';
import { AppNotification, Competition, LeagueNotificationSubscription } from '../types/football';
import { POPULAR_COMPETITIONS } from '../data/mockMatches';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  subscriptions: LeagueNotificationSubscription[];
  onToggleSubscription: (leagueId: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  onTriggerTestAlert: (leagueName: string, type: 'KICKOFF' | 'GOAL' | 'PREDICTION_EDGE') => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  subscriptions,
  onToggleSubscription,
  onMarkAllAsRead,
  onClearNotifications,
  onTriggerTestAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'LEAGUES_CONFIG'>('ALERTS');
  const [browserPermission, setBrowserPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  if (!isOpen) return null;

  const requestBrowserPermission = async () => {
    if (typeof Notification !== 'undefined') {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPermission(perm);
        if (perm === 'granted') {
          new Notification('Apex Football Alerts Active', {
            body: 'You will receive personalized kickoff and prediction alerts for your selected leagues.',
          });
        }
      } catch (e) {
        console.error('Notification permission error', e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#121c2e] border-l border-slate-700/80 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 bg-[#18263e] border-b border-slate-700/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-900/60 text-sky-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">League Notifications</h3>
              <p className="text-[11px] text-slate-400">Personalized match & prediction alerts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle: Alerts vs League Settings */}
        <div className="flex border-b border-slate-800 bg-[#0f1726] p-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('ALERTS')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'ALERTS'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Alerts Feed</span>
            {notifications.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-slate-900 text-[10px] font-mono flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('LEAGUES_CONFIG')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'LEAGUES_CONFIG'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Select Leagues</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'ALERTS' && (
            <div className="space-y-3">
              {/* Browser notification permission banner */}
              {browserPermission !== 'granted' && browserPermission !== 'unsupported' && (
                <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-800/50 flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-300">
                    <strong className="text-white block">Enable Device Push Alerts</strong>
                    Receive kickoff and prediction updates even when backgrounded.
                  </div>
                  <button
                    onClick={requestBrowserPermission}
                    className="px-2.5 py-1 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors shrink-0"
                  >
                    Allow
                  </button>
                </div>
              )}

              {/* Action bar for alerts */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Recent Match Dispatches</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onMarkAllAsRead}
                    className="hover:text-sky-400 transition-colors"
                  >
                    Mark read
                  </button>
                  <span>·</span>
                  <button
                    onClick={onClearNotifications}
                    className="hover:text-rose-400 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              {/* Test Alert Simulator */}
              <div className="p-3 rounded-2xl bg-[#162238] border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Simulate Live League Alert
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onTriggerTestAlert('Premier League', 'KICKOFF')}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 text-sky-400" />
                    Kickoff 15m
                  </button>
                  <button
                    onClick={() => onTriggerTestAlert('La Liga', 'GOAL')}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    ⚽ Live Goal
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-300">No active alerts</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select your leagues in settings to receive upcoming match notifications.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        notif.read
                          ? 'bg-[#141f32] border-slate-800/60 opacity-80'
                          : 'bg-[#17253d] border-sky-800/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-sky-400 uppercase tracking-wide">
                          {notif.type}
                        </span>
                        <span className="text-slate-500 font-mono">{notif.timestamp}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">{notif.title}</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'LEAGUES_CONFIG' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-800/40 text-xs text-slate-300">
                Turn on notification subscriptions for competitions you care about.
                You will be alerted about kickoff times, lineup releases, and high-probability algorithmic opportunities.
              </div>

              <div className="space-y-2">
                {POPULAR_COMPETITIONS.map(comp => {
                  const sub = subscriptions.find(s => s.leagueId === comp.id);
                  const isEnabled = sub ? sub.enabled : false;

                  return (
                    <div
                      key={comp.id}
                      onClick={() => onToggleSubscription(comp.id)}
                      className="p-3 rounded-2xl bg-[#162238] border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-[#1a2944] transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{comp.flag}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white">{comp.name}</h4>
                          <span className="text-[11px] text-slate-400">{comp.country}</span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          isEnabled
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-800 text-slate-600 border border-slate-700'
                        }`}
                      >
                        {isEnabled && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
