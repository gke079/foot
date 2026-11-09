import React, { useState, useEffect, useMemo } from 'react';
import { Match, LeagueNotificationSubscription, AppNotification, PredictionMarketFilter } from './types/football';
import { ALL_MATCHES, POPULAR_COMPETITIONS, getMatchesForDate } from './data/mockMatches';
import { Header } from './components/Header';
import { SubHeader, RegionFilter } from './components/SubHeader';
import { DateCarousel } from './components/DateCarousel';
import { LeagueAccordion } from './components/LeagueAccordion';
import { MatchCard } from './components/MatchCard';
import { MatchAnalysisModal } from './components/MatchAnalysisModal';
import { BottomNavigation, NavTab } from './components/BottomNavigation';
import { EaglePredictorHub } from './components/EaglePredictorHub';
import { NotificationDrawer } from './components/NotificationDrawer';
import { CalendarModal } from './components/CalendarModal';
import { SearchModal } from './components/SearchModal';
import { SettingsModal } from './components/SettingsModal';
import { LeaguesMenuModal } from './components/LeaguesMenuModal';
import { PredictionMarketSelector } from './components/PredictionMarketSelector';
import { LeagueAndTimeFilterBar, TimeFilter, LeagueOption, TimeCounts } from './components/LeagueAndTimeFilterBar';
import { RankedMatchCard } from './components/RankedMatchCard';
import { SportyBetAZMenu } from './components/SportyBetAZMenu';
import { PREDICTION_MARKET_OPTIONS, getMarketProbability } from './utils/predictionEngine';
import { getEspnLeagueSortRank } from './services/espnSoccer';
import { getSportyBetLeagueInfo, getSportyBetSortRank } from './utils/sportybetLeagues';
import { getLocalTodayDateString } from './utils/dateUtils';
import {
  Zap,
  Sparkles,
  Star,
  Bell,
  Calendar as CalendarIcon,
  Filter,
  Globe,
  RefreshCw,
  AlertCircle,
  ArrowDownWideNarrow,
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  Award,
  ChevronsUpDown,
  ChevronsDownUp,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  // Current active date (dynamically defaults to today's real-world date)
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalTodayDateString());
  
  // Header controls
  const [isLiveOnly, setIsLiveOnly] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'MY_SCORES'>('ALL');
  const [showTeamForm, setShowTeamForm] = useState<boolean>(true);
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string | null>(null);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<RegionFilter>('ALL');

  // Filter Selection Box states (League & Time)
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>('ALL');
  const [timeSortOrder, setTimeSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  // Match feed layout mode: Defaults to FLAT_LIST (unified list without forced league accordions)
  const [matchViewMode, setMatchViewMode] = useState<'FLAT_LIST' | 'LEAGUE_GROUPS'>('FLAT_LIST');

  // Prediction Market Ranking Filter (Selection Box)
  const [selectedPredictionMarket, setSelectedPredictionMarket] = useState<PredictionMarketFilter>('ALL');
  const [onlyHighProbability, setOnlyHighProbability] = useState<boolean>(false);
  const [minProbabilityThreshold, setMinProbabilityThreshold] = useState<number>(0);

  // Bottom Navigation state
  const [bottomNavTab, setBottomNavTab] = useState<NavTab>('SCORES');

  // Theme (Dark or Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('apex_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  // Keep <html> and <body> dark class and colorScheme synced with theme state
  useEffect(() => {
    try {
      localStorage.setItem('apex_theme', theme);
    } catch {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [theme]);

  const toggleTheme = (targetTheme?: unknown) => {
    setTheme(prev => {
      if (targetTheme === 'dark' || targetTheme === 'light') {
        return targetTheme;
      }
      return prev === 'dark' ? 'light' : 'dark';
    });
  };

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
    seriea: true,
    bundesliga: true,
    ligue1: true,
    ucl: true,
    uel: true,
    mls: true,
    facup: true,
    champ: true,
    saudi: true,
    primeira: true,
    eredivisie: true,
    superlig: true,
    scotland: true,
    belgium: true,
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
      [leagueId]: !(prev[leagueId] ?? true),
    }));
  };

  const handleBottomNavClick = (tab: NavTab) => {
    setBottomNavTab(tab);
    if (tab === 'PREDICTOR_HUB') {
      setIsEaglePredictorOpen(true);
    } else if (tab === 'FAVORITES') {
      setActiveSubTab('MY_SCORES');
    } else if (tab === 'AZ_MENU') {
      // Switches to SportyBet AZ Menu
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

  // Apply filters: Live only, My Scores, League filter, Time filter, Region, AND Prediction Market!
  const displayedMatches = useMemo(() => {
    let result = rawMatchesForDate;

    // Filter by live-only
    if (isLiveOnly) {
      result = result.filter(m => m.status === 'LIVE' || m.status === 'HT');
    }

    // Filter by favorites / my scores
    if (activeSubTab === 'MY_SCORES') {
      result = result.filter(m => favoriteMatchIds.has(m.id));
    }

    // Filter by country selection from SportyBet AZ Menu
    if (selectedCountryFilter) {
      if (selectedCountryFilter === 'Top Leagues') {
        const topCountries = ['England', 'Spain', 'Germany', 'Italy', 'France', 'International Clubs'];
        result = result.filter(m => topCountries.includes(m.competition.country) || m.competition.category === 'Popular');
      } else {
        result = result.filter(m => m.competition.country === selectedCountryFilter);
      }
    }

    // Filter by league selection box
    if (selectedLeagueFilter) {
      result = result.filter(m => m.competition.id === selectedLeagueFilter);
    }

    // Filter by time selection box
    if (selectedTimeFilter !== 'ALL') {
      if (selectedTimeFilter === 'LIVE') {
        result = result.filter(m => m.status === 'LIVE' || m.status === 'HT');
      } else if (selectedTimeFilter === 'MORNING') {
        result = result.filter(m => (m.kickoffTime || '00:00') < '13:00');
      } else if (selectedTimeFilter === 'AFTERNOON') {
        result = result.filter(m => {
          const t = m.kickoffTime || '00:00';
          return t >= '13:00' && t < '17:00';
        });
      } else if (selectedTimeFilter === 'EVENING') {
        result = result.filter(m => (m.kickoffTime || '00:00') >= '17:00');
      } else if (selectedTimeFilter === 'SCHEDULED') {
        result = result.filter(m => m.status === 'SCHEDULED');
      } else if (selectedTimeFilter === 'FINISHED') {
        result = result.filter(m => m.status === 'FINISHED');
      }
    }

    // Regional filter
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

    // Prediction Market Filtering and Sorting from Highest Probability to Lowest Probability
    if (selectedPredictionMarket !== 'ALL') {
      const meta = PREDICTION_MARKET_OPTIONS.find(m => m.id === selectedPredictionMarket);
      const effectiveThreshold = onlyHighProbability
        ? Math.max(minProbabilityThreshold, meta?.defaultHighProbabilityThreshold || 50)
        : minProbabilityThreshold;

      if (effectiveThreshold > 0) {
        result = result.filter(m => getMarketProbability(m, selectedPredictionMarket) >= effectiveThreshold);
      }

      // Explicitly sort starting from highest probability down to lowest probability
      result = [...result].sort((a, b) => {
        const probA = getMarketProbability(a, selectedPredictionMarket);
        const probB = getMarketProbability(b, selectedPredictionMarket);
        return probB - probA;
      });
    } else {
      // Standard Sort: Live matches first, then Kickoff Time according to timeSortOrder
      result = [...result].sort((a, b) => {
        const statusPriority = (s: Match['status']) => (s === 'LIVE' || s === 'HT' ? 0 : s === 'SCHEDULED' ? 1 : 2);
        const prioA = statusPriority(a.status);
        const prioB = statusPriority(b.status);
        if (prioA !== prioB) return prioA - prioB;

        const timeComp = (a.kickoffTime || '').localeCompare(b.kickoffTime || '');
        return timeSortOrder === 'ASC' ? timeComp : -timeComp;
      });
    }

    return result;
  }, [
    rawMatchesForDate,
    isLiveOnly,
    activeSubTab,
    favoriteMatchIds,
    selectedLeagueFilter,
    selectedTimeFilter,
    timeSortOrder,
    activeRegion,
    selectedPredictionMarket,
    onlyHighProbability,
    minProbabilityThreshold,
  ]);

  // Available leagues options formatted SportyBet style
  const availableLeaguesOptions: LeagueOption[] = useMemo(() => {
    const map = new Map<string, LeagueOption>();
    for (const m of rawMatchesForDate) {
      const compId = m.competition.id;
      if (!map.has(compId)) {
        const sporty = getSportyBetLeagueInfo(m.competition);
        map.set(compId, {
          id: compId,
          name: sporty.leagueName,
          country: sporty.country,
          flag: sporty.flag,
          count: 0,
        });
      }
      map.get(compId)!.count += 1;
    }
    const list = Array.from(map.values());
    list.sort((a, b) => {
      const rankA = getSportyBetSortRank(a.id, a.name);
      const rankB = getSportyBetSortRank(b.id, b.name);
      if (rankA !== rankB) return rankA - rankB;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [rawMatchesForDate]);

  // Kickoff time breakdown counts
  const timeCounts: TimeCounts = useMemo(() => {
    const base = selectedLeagueFilter
      ? rawMatchesForDate.filter(m => m.competition.id === selectedLeagueFilter)
      : rawMatchesForDate;

    let live = 0;
    let morning = 0;
    let afternoon = 0;
    let evening = 0;
    let scheduled = 0;
    let finished = 0;

    for (const m of base) {
      if (m.status === 'LIVE' || m.status === 'HT') live++;
      else if (m.status === 'FINISHED') finished++;
      else scheduled++;

      const t = m.kickoffTime || '00:00';
      if (t < '13:00') morning++;
      else if (t < '17:00') afternoon++;
      else evening++;
    }

    return {
      all: base.length,
      live,
      morning,
      afternoon,
      evening,
      scheduled,
      finished,
    };
  }, [rawMatchesForDate, selectedLeagueFilter]);

  const handleResetAllFilters = () => {
    setSelectedCountryFilter(null);
    setSelectedLeagueFilter(null);
    setSelectedTimeFilter('ALL');
    setIsLiveOnly(false);
    setSelectedPredictionMarket('ALL');
    setActiveRegion('ALL');
  };

  const topMarketProb = useMemo(() => {
    if (selectedPredictionMarket === 'ALL' || displayedMatches.length === 0) return undefined;
    return getMarketProbability(displayedMatches[0], selectedPredictionMarket);
  }, [displayedMatches, selectedPredictionMarket]);

  const topTeamName = useMemo(() => {
    if (selectedPredictionMarket === 'ALL' || displayedMatches.length === 0) return undefined;
    const first = displayedMatches[0];
    if (selectedPredictionMarket === 'HOME') return first.homeTeam.name;
    if (selectedPredictionMarket === 'AWAY') return first.awayTeam.name;
    return `${first.homeTeam.shortName} vs ${first.awayTeam.shortName}`;
  }, [displayedMatches, selectedPredictionMarket]);

  const allAvailableCompetitions = useMemo(() => {
    const map = new Map<string, Match['competition']>();
    for (const m of rawMatchesForDate) {
      if (!map.has(m.competition.id)) {
        map.set(m.competition.id, m.competition);
      }
    }
    const comps = Array.from(map.values());
    comps.sort((a, b) => {
      const rankA = getEspnLeagueSortRank(a.id, a.name);
      const rankB = getEspnLeagueSortRank(b.id, b.name);
      if (rankA !== rankB) return rankA - rankB;
      return a.name.localeCompare(b.name);
    });
    return comps;
  }, [rawMatchesForDate]);

  // Group matches by Competition, arranged in ESPN official league priority order
  const groupedMatches = useMemo(() => {
    const map = new Map<string, { competition: Match['competition']; matches: Match[] }>();

    for (const match of displayedMatches) {
      const compId = match.competition.id;
      if (!map.has(compId)) {
        map.set(compId, { competition: match.competition, matches: [] });
      }
      map.get(compId)!.matches.push(match);
    }

    const groups = Array.from(map.values());

    // 1. Sort matches WITHIN each league:
    // If a prediction market is selected: sort by that market probability descending
    // Otherwise (standard ESPN): LIVE/HT first, then kickoff time ascending, then FINISHED
    for (const group of groups) {
      group.matches.sort((a, b) => {
        if (selectedPredictionMarket !== 'ALL') {
          const probA = getMarketProbability(a, selectedPredictionMarket);
          const probB = getMarketProbability(b, selectedPredictionMarket);
          if (probA !== probB) return probB - probA;
        }

        // Live matches first
        const statusPriority = (s: Match['status']) => (s === 'LIVE' || s === 'HT' ? 0 : s === 'SCHEDULED' ? 1 : 2);
        const prioA = statusPriority(a.status);
        const prioB = statusPriority(b.status);
        if (prioA !== prioB) return prioA - prioB;

        // Kickoff time ascending (e.g. 12:30 before 15:00)
        return (a.kickoffTime || '').localeCompare(b.kickoffTime || '');
      });
    }

    // 2. Sort the LEAGUE ACCORDIONS according to ESPN official scoreboard priority hierarchy
    groups.sort((a, b) => {
      const rankA = getEspnLeagueSortRank(a.competition.id, a.competition.name);
      const rankB = getEspnLeagueSortRank(b.competition.id, b.competition.name);
      if (rankA !== rankB) return rankA - rankB;
      return a.competition.name.localeCompare(b.competition.name);
    });

    return groups;
  }, [displayedMatches, selectedPredictionMarket]);

  const areAllExpanded = useMemo(() => {
    if (groupedMatches.length === 0) return true;
    return groupedMatches.every(g => expandedLeagues[g.competition.id] ?? true);
  }, [groupedMatches, expandedLeagues]);

  const handleToggleExpandAll = () => {
    const nextState = !areAllExpanded;
    const nextMap: Record<string, boolean> = {};
    for (const g of groupedMatches) {
      nextMap[g.competition.id] = nextState;
    }
    setExpandedLeagues(nextMap);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const isPastDate = selectedDate < getLocalTodayDateString();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-[#0d1422] text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans pb-24 selection:bg-rose-500 selection:text-white transition-colors duration-150`}>
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
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenAZMenu={() => setBottomNavTab(prev => (prev === 'AZ_MENU' ? 'SCORES' : 'AZ_MENU'))}
        isAZMenuOpen={bottomNavTab === 'AZ_MENU'}
      />

      {bottomNavTab === 'AZ_MENU' ? (
        <SportyBetAZMenu
          matches={rawMatchesForDate}
          onSelectCountry={country => {
            setSelectedCountryFilter(country);
            setSelectedLeagueFilter(null);
            setBottomNavTab('SCORES');
          }}
          onSelectLeague={leagueId => {
            setSelectedLeagueFilter(leagueId);
            setBottomNavTab('SCORES');
          }}
          onViewAllMatches={() => {
            setSelectedCountryFilter(null);
            setSelectedLeagueFilter(null);
            setBottomNavTab('SCORES');
          }}
          liveMatchesCount={rawMatchesForDate.filter(m => m.status === 'LIVE' || m.status === 'HT').length}
        />
      ) : (
        <>
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

      {/* Filter Selection Boxes: League & Kickoff Time */}
      <LeagueAndTimeFilterBar
        selectedLeague={selectedLeagueFilter}
        onSelectLeague={leagueId => setSelectedLeagueFilter(leagueId)}
        availableLeagues={availableLeaguesOptions}
        selectedTimeFilter={selectedTimeFilter}
        onSelectTimeFilter={timeFilter => setSelectedTimeFilter(timeFilter)}
        timeSortOrder={timeSortOrder}
        onToggleTimeSortOrder={() => setTimeSortOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'))}
        timeCounts={timeCounts}
        totalFilteredCount={displayedMatches.length}
        totalUnfilteredCount={rawMatchesForDate.length}
        onResetFilters={handleResetAllFilters}
        viewMode={matchViewMode}
        onChangeViewMode={setMatchViewMode}
      />

      {/* Prediction Market Selection Box & Quick Pill Switcher */}
      <PredictionMarketSelector
        selectedMarket={selectedPredictionMarket}
        onSelectMarket={market => setSelectedPredictionMarket(market)}
        onlyHighProbability={onlyHighProbability}
        onToggleOnlyHighProbability={() => setOnlyHighProbability(prev => !prev)}
        minProbabilityThreshold={minProbabilityThreshold}
        onChangeMinProbabilityThreshold={setMinProbabilityThreshold}
        totalMatchesCount={displayedMatches.length}
        highestProbability={topMarketProb}
        topTeamName={topTeamName}
      />

      {/* Real Match Feed Banner */}
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 pt-2.5 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          {isRealData ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real Games · {dataSource}
            </span>
          ) : apiSportsConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800/60 text-sky-800 dark:text-sky-300 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              API-Sports Connected ({dataSource})
            </span>
          ) : (
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors shadow-xs"
              title="Click to view API-Sports setup instructions"
            >
              <Globe className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
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
      {(selectedCountryFilter || selectedLeagueFilter || isLiveOnly || isPastDate || selectedPredictionMarket !== 'ALL') && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-2.5 flex flex-wrap items-center gap-2">
          {selectedCountryFilter && (
            <div className="text-[11px] font-semibold text-rose-200 bg-rose-950/80 border border-rose-700/60 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
              <span>🌍 SportyBet: <strong>{selectedCountryFilter}</strong> ({displayedMatches.length} games)</span>
              <button
                onClick={() => setSelectedCountryFilter(null)}
                className="text-rose-300 hover:text-white ml-1 font-bold bg-rose-900/60 px-1 rounded cursor-pointer"
                title="Clear country filter"
              >
                ✕
              </button>
            </div>
          )}
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

          {selectedPredictionMarket !== 'ALL' && (
            <div className="text-[11px] font-semibold text-sky-300 bg-sky-950/60 border border-sky-600/50 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
              <ArrowDownWideNarrow className="w-3.5 h-3.5 text-sky-400" />
              <span>
                Sorted by {PREDICTION_MARKET_OPTIONS.find(m => m.id === selectedPredictionMarket)?.shortLabel} (Highest to Lowest)
              </span>
              <button
                onClick={() => setSelectedPredictionMarket('ALL')}
                className="text-slate-400 hover:text-white ml-1"
                title="Clear prediction sort"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content: Match Accordions or Ranked Feed */}
      <main className="max-w-4xl mx-auto w-full px-2 sm:px-4 py-3 flex-1">
        {selectedPredictionMarket !== 'ALL' && displayedMatches.length > 0 && (
          <div className="mb-4 p-3 sm:p-4 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-[#14233c] dark:via-[#162744] dark:to-[#121c2e] border border-slate-200 dark:border-sky-800/60 shadow-sm dark:shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-500/20 border border-sky-200 dark:border-sky-500/40 flex items-center justify-center text-xl shrink-0 shadow-inner">
                {PREDICTION_MARKET_OPTIONS.find(m => m.id === selectedPredictionMarket)?.icon || '🎯'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    {PREDICTION_MARKET_OPTIONS.find(m => m.id === selectedPredictionMarket)?.label || selectedPredictionMarket}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40">
                    Highest → Lowest Probability
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Found <strong className="text-slate-900 dark:text-white font-mono">{displayedMatches.length}</strong> games on {selectedDate}
                  {topMarketProb !== undefined && (
                    <span> · Top pick: <strong className="text-emerald-600 dark:text-emerald-300">{topTeamName} ({topMarketProb}%)</strong></span>
                  )}
                </p>
              </div>
            </div>

            {/* Layout switch button: Flat List vs Group by League */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center bg-slate-100 dark:bg-[#0d1524] p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs">
                <button
                  onClick={() => setMatchViewMode('FLAT_LIST')}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    matchViewMode === 'FLAT_LIST'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title="Unified flat list"
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>Ranked List</span>
                </button>
                <button
                  onClick={() => setMatchViewMode('LEAGUE_GROUPS')}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    matchViewMode === 'LEAGUE_GROUPS'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title="Group by league"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>By League</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedPredictionMarket('ALL')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                title="Clear prediction sort"
              >
                ✕ Reset
              </button>
            </div>
          </div>
        )}

        {displayedMatches.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#141f32] border border-slate-200 dark:border-slate-800 my-6 shadow-sm">
            <Filter className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No matches found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {selectedLeagueFilter && selectedTimeFilter !== 'ALL'
                ? `No fixtures found matching the selected league and time criteria.`
                : selectedLeagueFilter
                ? `No games for this league on ${selectedDate}. Try selecting another league or resetting the filter.`
                : selectedTimeFilter !== 'ALL'
                ? `No matches found for the selected time window. Try selecting "All Kickoff Times".`
                : selectedPredictionMarket !== 'ALL'
                ? `No games on this date reached the active threshold for ${PREDICTION_MARKET_OPTIONS.find(m => m.id === selectedPredictionMarket)?.label}.`
                : isLiveOnly
                ? 'There are no live games in progress right now. Toggle the "Live" filter off to see scheduled games.'
                : activeSubTab === 'MY_SCORES'
                ? 'You have not favorited any matches yet. Click the star icon on any match to track it here.'
                : 'No fixtures found for the selected date.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={handleResetAllFilters}
                className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : matchViewMode === 'FLAT_LIST' ? (
          /* Unified Fixture List (Default, instead of arranging into league accordions) */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs px-1 pb-1 text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {selectedLeagueFilter
                  ? `${availableLeaguesOptions.find(l => l.id === selectedLeagueFilter)?.name || 'Filtered'} Matches`
                  : 'All Matches (Unified Feed)'}
              </span>
              <span className="font-mono text-[11px]">
                {displayedMatches.length} {displayedMatches.length === 1 ? 'game' : 'games'}
                {selectedTimeFilter !== 'ALL' && ` · ${selectedTimeFilter}`}
              </span>
            </div>

            {displayedMatches.map((match, index) => {
              const isFav = favoriteMatchIds.has(match.id);
              if (selectedPredictionMarket !== 'ALL') {
                return (
                  <RankedMatchCard
                    key={match.id}
                    match={match}
                    rank={index + 1}
                    market={selectedPredictionMarket}
                    showTeamForm={showTeamForm}
                    isFavorite={isFav}
                    onToggleFavorite={e => {
                      e.stopPropagation();
                      toggleFavorite(match.id);
                    }}
                    onSelectMatch={matchItem => setSelectedMatchForDetail(matchItem)}
                  />
                );
              }

              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  showTeamForm={showTeamForm}
                  isFavorite={isFav}
                  onToggleFavorite={e => {
                    e.stopPropagation();
                    toggleFavorite(match.id);
                  }}
                  onSelectMatch={matchItem => setSelectedMatchForDetail(matchItem)}
                  showLeagueBadge={true}
                />
              );
            })}
          </div>
        ) : (
          /* Grouped by League Feed (ESPN Hierarchy) */
          <div className="space-y-4">
            {/* ESPN League Navigation & Expand/Collapse toolbar */}
            <div className="flex flex-col gap-2.5 pb-1">
              <div className="flex items-center justify-between text-xs px-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                    <Layers className="w-4 h-4 text-sky-500" />
                    <span>Arranged by League (ESPN Order)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {groupedMatches.length} {groupedMatches.length === 1 ? 'League' : 'Leagues'}
                  </span>
                </div>

                <button
                  onClick={handleToggleExpandAll}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors shadow-sm cursor-pointer"
                  title={areAllExpanded ? 'Collapse all league sections' : 'Expand all league sections'}
                >
                  {areAllExpanded ? (
                    <>
                      <ChevronsDownUp className="w-3.5 h-3.5 text-slate-400" />
                      <span>Collapse All</span>
                    </>
                  ) : (
                    <>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                      <span>Expand All</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Jump League Chips */}
              {groupedMatches.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
                  <button
                    onClick={() => setSelectedLeagueFilter(null)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                      !selectedLeagueFilter
                        ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-500'
                        : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80'
                    }`}
                  >
                    All Leagues ({displayedMatches.length})
                  </button>

                  {groupedMatches.map(({ competition, matches }) => {
                    const isSelected = selectedLeagueFilter === competition.id;
                    return (
                      <button
                        key={competition.id}
                        onClick={() => setSelectedLeagueFilter(isSelected ? null : competition.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-500'
                            : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                        title={`Filter to ${competition.name}`}
                      >
                        {competition.logo ? (
                          <img
                            src={competition.logo}
                            alt=""
                            className="w-3.5 h-3.5 object-contain"
                            onError={e => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : competition.flag ? (
                          <span className="text-xs">{competition.flag}</span>
                        ) : (
                          <span className="text-xs">
                            {competition.country === 'England' ? '🏴󠁧󠁢󠁥󠁮󠁧󠁿' :
                             competition.country === 'Spain' ? '🇪🇸' :
                             competition.country === 'Italy' ? '🇮🇹' :
                             competition.country === 'Germany' ? '🇩🇪' :
                             competition.country === 'France' ? '🇫🇷' :
                             competition.country === 'USA' ? '🇺🇸' :
                             competition.country === 'Europe' ? '🏆' : '⚽'}
                          </span>
                        )}
                        <span>{competition.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isSelected
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {matches.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* League Accordions */}
            <div className="space-y-3">
              {groupedMatches.map(({ competition, matches }) => {
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
                    activeMarket={selectedPredictionMarket}
                  />
                );
              })}
            </div>
          </div>
        )}
      </main>
        </>
      )}

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
          onApplyMarketFilter={market => {
            setSelectedPredictionMarket(market);
            setIsEaglePredictorOpen(false);
          }}
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
        matches={rawMatchesForDate}
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
        theme={theme}
        onToggleTheme={toggleTheme}
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
