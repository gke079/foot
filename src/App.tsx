import React, { useState, useEffect, useMemo } from 'react';
import { Match, LeagueNotificationSubscription, AppNotification } from './types/football';
import { ALL_MATCHES, POPULAR_COMPETITIONS, getMatchesForDate } from './data/mockMatches';
import { Header } from './components/Header';
import { SubHeader, RegionFilter } from './components/SubHeader';
import { DateCarousel } from './components/DateCarousel';
import { LeagueAccordion } from './components/LeagueAccordion';
import { MatchAnalysisModal } from './components/MatchAnalysisModal';
import { BottomNavigation, NavTab } from './components/BottomNavigation';
import { EaglePredictorHub } from './components/EaglePredictorHub';
import { NotificationDrawer } from './components/NotificationDrawer';
import { CalendarModal } from './components/CalendarModal';
import { SearchModal } from './components/SearchModal';
import { SettingsModal } from './components/SettingsModal';
import { LeaguesMenuModal } from './components/LeaguesMenuModal';
import { Zap, Sparkles, Star, Bell, Calendar as CalendarIcon, Filter, Globe, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  // Current active date (default to today: 2026-11-07)
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-07');
  
  // Header controls
  const [isLiveOnly, setIsLiveOnly] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'MY_SCORES'>('ALL');
  const [showTeamForm, setShowTeamForm] = useState<boolean>(true);
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<RegionFilter>('ALL');

  // Bottom Navigation state
  const [bottomNavTab, setBottomNavTab] = useState<NavTab>('SCORES');

  // Favorites
  const [favoriteMatchIds, setFavoriteMatchIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('apex_favorite_matches');
      return saved ? new Set(JSON.parse(saved)) : new Set(['pl-leeds-tottenham-2026-11-07']);
    } catch {
      return new Set(['pl-leeds-tottenham-2026-11-07']);
    }
  });

  // League Notification Subscriptions
  const [subscriptions, setSubscriptions] = useState<LeagueNotificationSubscription[]>(() => {
    try {
      const saved = localStorage.getItem('apex_league_subs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return POPULAR_COMPETITIONS.map(c => ({
      leagueId: c.id,
      leagueName: c.name,
      country: c.country,
      enabled: c.id === 'pl' || c.id === 'laliga',
      notifyKickoff: true,
      notifyGoals: true,
      notifyHighEdgePredictions: true,
    }));
  });

  // In-app Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      timestamp: '15:10',
      leagueId: 'pl',
      matchId: 'pl-leeds-tottenham-2026-11-07',
      type: 'KICKOFF',
      title: '⚡ Premier League: Leeds vs Tottenham LIVE',
      message: '1st Half underway at Elland Road. Algorithmic model highlights Tottenham 46% win probability and 3.1 avg H2H goals.',
      read: false,
    },
    {
      id: 'notif-2',
      timestamp: '14:45',
      leagueId: 'pl',
      matchId: 'pl-arsenal-hull-2026-11-07',
      type: 'PREDICTION_EDGE',
      title: '🔥 Consecutive Goal Alert: Arsenal vs Hull City',
      message: 'Arsenal exhibits a 68% probability of scoring 2+ consecutive unanswered goals based on high home xG and opponent absences.',
      read: false,
    },
    {
      id: 'notif-3',
      timestamp: '12:30',
      leagueId: 'laliga',
      matchId: 'laliga-osasuna-athletic-2026-11-07',
      type: 'LINEUP',
      title: '🚨 Squad Update: Nico Williams OUT',
      message: 'Athletic Club winger Nico Williams confirmed out with adductor strain, shifting home advantage towards Osasuna.',
      read: true,
    },
  ]);

  // Modals & Sheets
  const [selectedMatchForDetail, setSelectedMatchForDetail] = useState<Match | null>(null);
  const [isEaglePredictorOpen, setIsEaglePredictorOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isLeaguesModalOpen, setIsLeaguesModalOpen] = useState<boolean>(false);

  // Accordion collapsed state: Map of competition id -> boolean (true = expanded)
  const [expandedLeagues, setExpandedLeagues] = useState<Record<string, boolean>>({
    pl: true,
    laliga: true,
    ucl: true,
    seriea: true,
    bundesliga: true,
    ligue1: true,
  });

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('apex_favorite_matches', JSON.stringify(Array.from(favoriteMatchIds)));
    } catch {}
  }, [favoriteMatchIds]);

  // Save subscriptions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('apex_league_subs', JSON.stringify(subscriptions));
    } catch {}
  }, [subscriptions]);

  const toggleFavorite = (matchId: string) => {
    setFavoriteMatchIds(prev => {
      const next = new Set(prev);
      if (next.has(matchId)) next.delete(matchId);
      else next.add(matchId);
      return next;
    });
  };

  const toggleSubscription = (leagueId: string) => {
    setSubscriptions(prev =>
      prev.map(s => (s.leagueId === leagueId ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleToggleLeagueExpand = (leagueId: string) => {
    setExpandedLeagues(prev => ({
      ...prev,
      [leagueId]: !prev[leagueId],
    }));
  };

  const handleBottomNavClick = (tab: NavTab) => {
    setBottomNavTab(tab);
    if (tab === 'PREDICTOR_HUB') {
      setIsEaglePredictorOpen(true);
    } else if (tab === 'FAVORITES') {
      setActiveSubTab('MY_SCORES');
    } else if (tab === 'FOLLOWING') {
      setIsNotificationDrawerOpen(true);
    } else if (tab === 'DISCOVER') {
      setIsEaglePredictorOpen(true);
    } else if (tab === 'SCORES') {
      setActiveSubTab('ALL');
    }
  };

  const handleTriggerTestAlert = async (leagueName: string, type: 'KICKOFF' | 'GOAL' | 'PREDICTION_EDGE') => {
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueName,
          matchTitle: 'Arsenal vs Hull City',
          type,
        }),
      });
      const data = await res.json();
      if (data.notification) {
        setNotifications(prev => [data.notification, ...prev]);
        // Also trigger browser notification if allowed
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(data.notification.title, {
            body: data.notification.message,
          });
        }
      }
    } catch {
      // Fallback in-app
      const fallback: AppNotification = {
        id: `notif-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: type === 'GOAL' ? `⚽ Goal in ${leagueName}!` : `⚡ Match Kickoff: ${leagueName}`,
        message: 'Algorithmic models show live shift in consecutive unanswered goal probability.',
        type,
        leagueId: 'pl',
        read: false,
      };
      setNotifications(prev => [fallback, ...prev]);
    }
  };

  // Real Matches State from Server / API-Sports
  const [rawMatchesForDate, setRawMatchesForDate] = useState<Match[]>(() => getMatchesForDate(selectedDate));
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(false);
  const [isRealData, setIsRealData] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<string>('Initializing');
  const [apiSportsConfigured, setApiSportsConfigured] = useState<boolean>(false);
  const [accountNotice, setAccountNotice] = useState<string | null>(null);

  // Fetch matches from server on date change
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingMatches(true);

    fetch(`/api/matches?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        if (!isCancelled && data.matches) {
          setRawMatchesForDate(data.matches);
          setIsRealData(Boolean(data.isRealData));
          setDataSource(data.source || (data.isRealData ? 'API-Sports Live' : 'Simulation'));
          setApiSportsConfigured(Boolean(data.apiSportsConfigured));
          setAccountNotice(data.accountNotice || null);
        }
      })
      .catch(err => {
        console.warn('Failed to fetch from /api/matches:', err);
        if (!isCancelled) {
          setRawMatchesForDate(getMatchesForDate(selectedDate));
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingMatches(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedDate]);

  // Apply filters: Live only, My Scores, League filter
  const displayedMatches = useMemo(() => {
    let result = rawMatchesForDate;

    if (isLiveOnly) {
      result = result.filter(m => m.status === 'LIVE');
    }

    if (activeSubTab === 'MY_SCORES') {
      result = result.filter(m => favoriteMatchIds.has(m.id));
    }

    if (selectedLeagueFilter) {
      result = result.filter(m => m.competition.id === selectedLeagueFilter);
    }

    if (activeRegion !== 'ALL') {
      if (activeRegion === 'Popular') {
        result = result.filter(m => m.competition.category === 'Popular');
      } else if (activeRegion === 'European') {
        result = result.filter(
          m =>
            m.competition.category === 'European' ||
            m.competition.category === 'Popular' ||
            m.competition.category === 'Domestic'
        );
      } else {
        result = result.filter(m => m.competition.category === activeRegion);
      }
    }

    return result;
  }, [rawMatchesForDate, isLiveOnly, activeSubTab, favoriteMatchIds, selectedLeagueFilter, activeRegion]);

  const allAvailableCompetitions = useMemo(() => {
    const map = new Map<string, Match['competition']>();
    for (const m of rawMatchesForDate) {
      if (!map.has(m.competition.id)) {
        map.set(m.competition.id, m.competition);
      }
    }
    return Array.from(map.values());
  }, [rawMatchesForDate]);

  // Group matches by Competition
  const groupedMatches = useMemo(() => {
    const map = new Map<string, { competition: Match['competition']; matches: Match[] }>();

    for (const match of displayedMatches) {
      const compId = match.competition.id;
      if (!map.has(compId)) {
        map.set(compId, { competition: match.competition, matches: [] });
      }
      map.get(compId)!.matches.push(match);
    }

    return Array.from(map.values());
  }, [displayedMatches]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isPastDate = selectedDate < '2026-11-07';

  return (
    <div className="min-h-screen bg-[#0d1422] text-slate-100 flex flex-col font-sans pb-24 selection:bg-sky-500 selection:text-white">
      {/* Top App Bar matching screenshot */}
      <Header
        isLiveOnly={isLiveOnly}
        onToggleLive={() => setIsLiveOnly(prev => !prev)}
        selectedDate={selectedDate}
        onOpenCalendar={() => setIsCalendarModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        unreadNotificationsCount={unreadCount}
        onOpenLeaguesModal={() => setIsLeaguesModalOpen(true)}
      />

      {/* SubHeader: All Scores vs My Scores + Team Form Switch + Competitions Pill */}
      <SubHeader
        activeTab={activeSubTab}
        onChangeTab={tab => setActiveSubTab(tab)}
        showTeamForm={showTeamForm}
        onToggleTeamForm={() => setShowTeamForm(prev => !prev)}
        myScoresCount={favoriteMatchIds.size}
        activeRegion={activeRegion}
        onChangeRegion={setActiveRegion}
        totalMatchesCount={displayedMatches.length}
        totalLeaguesCount={groupedMatches.length}
      />

      {/* Date Carousel (Yesterday Results, Today, Tomorrow, Custom Picker) */}
      <DateCarousel
        selectedDate={selectedDate}
        onSelectDate={date => setSelectedDate(date)}
        onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
      />

      {/* Real Match Feed Banner */}
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 pt-2.5 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          {isRealData ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Real Games · {dataSource}
            </span>
          ) : apiSportsConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-950/60 border border-sky-800/60 text-sky-300 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              API-Sports Connected ({dataSource})
            </span>
          ) : (
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-[11px] transition-colors"
              title="Click to view API-Sports setup instructions"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Real Games Engine (API-Sports Ready)</span>
            </button>
          )}
        </div>

        {isLoadingMatches && (
          <span className="text-[11px] font-mono text-sky-400 flex items-center gap-1 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Syncing fixtures...
          </span>
        )}
      </div>

      {/* Account Status Notice if suspended or rate-limited */}
      {accountNotice && (
        <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 pt-2">
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-600/50 flex items-start justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">API-Sports Notice: {accountNotice}</span>
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  The app has safely routed to our built-in global fixtures database so you can continue exploring match predictions, H2H, and consecutive goal runs.
                </p>
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="mt-1.5 inline-flex items-center gap-1 text-sky-300 hover:text-sky-200 font-semibold text-[11px] underline"
                >
                  View activation steps & re-verify key ↗
                </button>
              </div>
            </div>
            <button
              onClick={() => setAccountNotice(null)}
              className="text-slate-400 hover:text-white p-1"
              aria-label="Dismiss notice"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Pill Bar (if any filter is applied) */}
      {(selectedLeagueFilter || isLiveOnly || isPastDate) && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-2.5 flex flex-wrap items-center gap-2">
          {isPastDate && (
            <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
              <span>📅 Showing Previous Day Results ({selectedDate})</span>
            </div>
          )}

          {isLiveOnly && (
            <div className="text-[11px] font-semibold text-sky-400 bg-sky-950/40 border border-sky-800/40 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Live Matches Only</span>
              <button
                onClick={() => setIsLiveOnly(false)}
                className="text-slate-400 hover:text-white ml-1"
              >
                ✕
              </button>
            </div>
          )}

          {selectedLeagueFilter && (
            <div className="text-[11px] font-semibold text-slate-200 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
              <span>Filtered by Competition</span>
              <button
                onClick={() => setSelectedLeagueFilter(null)}
                className="text-slate-400 hover:text-white ml-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content: Match Accordions Feed */}
      <main className="max-w-4xl mx-auto w-full px-2 sm:px-4 py-3 flex-1">
        {groupedMatches.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#141f32] border border-slate-800 my-6">
            <Filter className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No matches found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {isLiveOnly
                ? 'There are no live games in progress right now. Toggle the "Live" filter off to see scheduled games.'
                : activeSubTab === 'MY_SCORES'
                ? 'You have not favorited any matches yet. Click the star icon on any match to track it here.'
                : 'No fixtures found for the selected date. Select a different date from the calendar.'}
            </p>
            {isLiveOnly && (
              <button
                onClick={() => setIsLiveOnly(false)}
                className="mt-4 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition-colors"
              >
                Show All Matches
              </button>
            )}
            {activeSubTab === 'MY_SCORES' && (
              <button
                onClick={() => setActiveSubTab('ALL')}
                className="mt-4 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition-colors"
              >
                Back to All Scores
              </button>
            )}
          </div>
        ) : (
          groupedMatches.map(({ competition, matches }) => {
            const isSubscribed = subscriptions.some(s => s.leagueId === competition.id && s.enabled);
            const isExpanded = expandedLeagues[competition.id] ?? true;

            return (
              <LeagueAccordion
                key={competition.id}
                competition={competition}
                matches={matches}
                isExpanded={isExpanded}
                onToggleExpand={() => handleToggleLeagueExpand(competition.id)}
                showTeamForm={showTeamForm}
                favoriteMatchIds={favoriteMatchIds}
                onToggleFavorite={toggleFavorite}
                onSelectMatch={match => setSelectedMatchForDetail(match)}
                isSubscribedToLeague={isSubscribed}
                onToggleLeagueNotification={toggleSubscription}
              />
            );
          })
        )}
      </main>

      {/* Floating Action Button (matching the blue 9-dot FAB in screenshot) */}
      <div className="fixed bottom-20 right-4 z-30">
        <button
          onClick={() => setIsEaglePredictorOpen(true)}
          className="w-12 h-12 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-xl shadow-sky-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          title="Open AI Predictor Hub"
          aria-label="Open AI Predictor Hub"
        >
          <div className="grid grid-cols-3 gap-1 w-5 h-5">
            {[...Array(9)].map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
            ))}
          </div>
        </button>
      </div>

      {/* Bottom Navigation matching screenshot */}
      <BottomNavigation
        currentTab={bottomNavTab}
        onSelectTab={handleBottomNavClick}
        favoritesCount={favoriteMatchIds.size}
      />

      {/* Modals & Drawers */}
      {selectedMatchForDetail && (
        <MatchAnalysisModal
          match={selectedMatchForDetail}
          onClose={() => setSelectedMatchForDetail(null)}
          onToggleFavorite={toggleFavorite}
          isFavorite={favoriteMatchIds.has(selectedMatchForDetail.id)}
        />
      )}

      {isEaglePredictorOpen && (
        <EaglePredictorHub
          matches={rawMatchesForDate}
          onSelectMatch={match => setSelectedMatchForDetail(match)}
          onClose={() => setIsEaglePredictorOpen(false)}
        />
      )}

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        subscriptions={subscriptions}
        onToggleSubscription={toggleSubscription}
        onMarkAllAsRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }}
        onClearNotifications={() => setNotifications([])}
        onTriggerTestAlert={handleTriggerTestAlert}
      />

      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={date => setSelectedDate(date)}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        matches={ALL_MATCHES}
        onSelectMatch={match => setSelectedMatchForDetail(match)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        showTeamForm={showTeamForm}
        onToggleTeamForm={() => setShowTeamForm(prev => !prev)}
        apiSportsConfigured={apiSportsConfigured}
        isRealData={isRealData}
        dataSource={dataSource}
        accountNotice={accountNotice}
        onResetData={() => {
          setFavoriteMatchIds(new Set());
          localStorage.removeItem('apex_favorite_matches');
          setIsSettingsModalOpen(false);
        }}
      />

      <LeaguesMenuModal
        isOpen={isLeaguesModalOpen}
        onClose={() => setIsLeaguesModalOpen(false)}
        selectedLeagueId={selectedLeagueFilter}
        onSelectLeague={leagueId => setSelectedLeagueFilter(leagueId)}
        availableCompetitions={allAvailableCompetitions}
      />
    </div>
  );
}
