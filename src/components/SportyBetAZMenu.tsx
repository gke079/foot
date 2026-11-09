import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, ChevronDown, Trophy, QrCode, Gamepad2, Award, Activity, Flame, Globe } from 'lucide-react';
import { Match, Competition } from '../types/football';

interface SportyBetAZMenuProps {
  matches: Match[];
  onSelectCountry: (country: string | null) => void;
  onSelectLeague: (leagueId: string | null) => void;
  onViewAllMatches: () => void;
  liveMatchesCount?: number;
}

export const SportyBetAZMenu: React.FC<SportyBetAZMenuProps> = ({
  matches,
  onSelectCountry,
  onSelectLeague,
  onViewAllMatches,
  liveMatchesCount = 94,
}) => {
  const [activeCategoryTab, setActiveCategoryTab] = useState<'SPORTS' | 'LIVE' | 'PROMOTIONS' | 'FEATURES'>('SPORTS');
  const [activeSport, setActiveSport] = useState<string>('Football');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  // Left sidebar sports list matching SportyBet screenshot
  const sportsList = [
    { id: 'Popular', name: 'Popular' },
    { id: 'Football', name: 'Football', isPrimary: true },
    { id: 'vFootball', name: 'vFootball' },
    { id: 'Basketball', name: 'Basketball' },
    { id: 'Tennis', name: 'Tennis' },
    { id: 'eFootball', name: 'eFootball' },
    { id: 'Table Tennis', name: 'Table Tennis' },
    { id: 'eBasketball', name: 'eBasketball' },
    { id: 'eTennis', name: 'eTennis' },
    { id: 'Ice Hockey', name: 'Ice Hockey' },
  ];

  // Calculate dynamic match counts by country from real match list
  const { topLeaguesCount, featuredTop, countryCounts, countryLeaguesMap, allCountriesList } = useMemo(() => {
    let topCount = 0;
    const cCounts: Record<string, number> = {};
    const cLeagues: Record<string, { id: string; name: string; flag: string; count: number }[]> = {};

    const TOP_COUNTRIES = ['England', 'Spain', 'Germany', 'Italy', 'France', 'International Clubs'];

    for (const m of matches) {
      const country = m.competition.country || 'International';
      cCounts[country] = (cCounts[country] || 0) + 1;

      if (TOP_COUNTRIES.includes(country) || m.competition.category === 'Popular') {
        topCount++;
      }

      if (!cLeagues[country]) {
        cLeagues[country] = [];
      }
      const existing = cLeagues[country].find(l => l.id === m.competition.id);
      if (existing) {
        existing.count++;
      } else {
        cLeagues[country].push({
          id: m.competition.id,
          name: m.competition.name,
          flag: m.competition.flag || '⚽',
          count: 1,
        });
      }
    }

    // SportyBet featured top order
    const featuredTop = [
      { name: 'Top Leagues', count: topCount > 0 ? topCount : 241, isSpecialTop: true },
      { name: 'England', count: cCounts['England'] || 94 },
      { name: 'Spain', count: cCounts['Spain'] || 43 },
      { name: 'Germany', count: cCounts['Germany'] || 30 },
      { name: 'Italy', count: cCounts['Italy'] || 27 },
      { name: 'France', count: cCounts['France'] || 22 },
      { name: 'International Clubs', count: cCounts['International Clubs'] || 62 },
    ];

    // Alphabetical A-Z Countries
    const azCountries = [
      { name: 'Argentina', count: cCounts['Argentina'] || 8 },
      { name: 'Armenia', count: cCounts['Armenia'] || 2 },
      { name: 'Australia', count: cCounts['Australia'] || 15 },
      { name: 'Austria', count: cCounts['Austria'] || 14 },
      { name: 'Bolivia', count: cCounts['Bolivia'] || 1 },
      { name: 'Brazil', count: cCounts['Brazil'] || 18 },
      { name: 'Chile', count: cCounts['Chile'] || 6 },
      { name: 'Colombia', count: cCounts['Colombia'] || 6 },
      { name: 'Denmark', count: cCounts['Denmark'] || 8 },
      { name: 'Egypt', count: cCounts['Egypt'] || 4 },
      { name: 'Greece', count: cCounts['Greece'] || 6 },
      { name: 'Kenya', count: cCounts['Kenya'] || 6 },
      { name: 'Mexico', count: cCounts['Mexico'] || 8 },
      { name: 'Netherlands', count: cCounts['Netherlands'] || 10 },
      { name: 'Nigeria', count: cCounts['Nigeria'] || 8 },
      { name: 'Norway', count: cCounts['Norway'] || 6 },
      { name: 'Portugal', count: cCounts['Portugal'] || 10 },
      { name: 'Saudi Arabia', count: cCounts['Saudi Arabia'] || 9 },
      { name: 'Scotland', count: cCounts['Scotland'] || 8 },
      { name: 'South Africa', count: cCounts['South Africa'] || 6 },
      { name: 'Sweden', count: cCounts['Sweden'] || 8 },
      { name: 'Turkey', count: cCounts['Turkey'] || 10 },
      { name: 'USA', count: cCounts['USA'] || 14 },
    ];

    return {
      topLeaguesCount: topCount > 0 ? topCount : 241,
      featuredTop,
      azCountries,
      countryCounts: cCounts,
      countryLeaguesMap: cLeagues,
      allCountriesList: azCountries,
    };
  }, [matches]);

  const handleCountryClick = (countryName: string) => {
    if (countryName === 'Top Leagues') {
      onSelectCountry(null);
      onSelectLeague(null);
      onViewAllMatches();
      return;
    }

    if (expandedCountry === countryName) {
      setExpandedCountry(null);
    } else {
      setExpandedCountry(countryName);
    }
  };

  const filteredFeatured = featuredTop.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAZ = allCountriesList.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col bg-[#111723] text-white select-none animate-fade-in pb-24">
      {/* 1. SportyBet Signature Crimson Red Header */}
      <div className="bg-[#c8102e] px-3 pt-2.5 pb-2.5 space-y-2.5 shadow-md sticky top-0 z-30">
        {/* Search Input matching screenshot */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Teams/Players, Leagues, Game ID"
            className="w-full bg-[#9f0820] text-white placeholder-rose-200/70 text-xs px-3.5 py-2 rounded-md pr-9 focus:outline-none focus:ring-1 focus:ring-white border border-rose-800"
          />
          <Search className="absolute right-3 w-4 h-4 text-rose-200" />
        </div>

        {/* 5 Quick SportyBet Red Action Icons */}
        <div className="grid grid-cols-5 gap-1 pt-0.5 text-center">
          <button className="flex flex-col items-center justify-center gap-1 text-white hover:opacity-90">
            <QrCode className="w-4 h-4 text-white" />
            <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">Load Code</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-white hover:opacity-90">
            <span className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[10px] font-bold">V</span>
            <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">Virtuals</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-white hover:opacity-90">
            <Activity className="w-4 h-4 text-white" />
            <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">SportyPicks</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-white hover:opacity-90">
            <Trophy className="w-4 h-4 text-white" />
            <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">Jackpot</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-white hover:opacity-90">
            <Award className="w-4 h-4 text-white" />
            <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">Livescore</span>
          </button>
        </div>
      </div>

      {/* 2. Top Secondary Dark Tab Strip */}
      <div className="bg-[#172133] border-b border-[#223048] flex items-center px-2 text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveCategoryTab('SPORTS')}
          className={`px-3.5 py-2.5 whitespace-nowrap transition-colors relative cursor-pointer ${
            activeCategoryTab === 'SPORTS' ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sports
          {activeCategoryTab === 'SPORTS' && (
            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#00d053] rounded-full" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveCategoryTab('LIVE');
            onViewAllMatches();
          }}
          className={`px-3.5 py-2.5 whitespace-nowrap transition-colors relative cursor-pointer ${
            activeCategoryTab === 'LIVE' ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Live ({liveMatchesCount})
          {activeCategoryTab === 'LIVE' && (
            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#00d053] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveCategoryTab('PROMOTIONS')}
          className={`px-3.5 py-2.5 whitespace-nowrap transition-colors relative cursor-pointer ${
            activeCategoryTab === 'PROMOTIONS' ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Promotions (2)
        </button>

        <button
          onClick={() => setActiveCategoryTab('FEATURES')}
          className={`px-3.5 py-2.5 whitespace-nowrap transition-colors relative cursor-pointer ${
            activeCategoryTab === 'FEATURES' ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Features (10)
        </button>
      </div>

      {/* 3. Main Split 2-Column Section */}
      <div className="flex flex-1 min-h-[70vh]">
        {/* Left Column (Sports Categories) */}
        <div className="w-[30%] bg-[#0e1522] border-r border-[#1e2a3f] flex flex-col py-1">
          {sportsList.map(sport => {
            const isSelected = activeSport === sport.id;
            return (
              <button
                key={sport.id}
                onClick={() => setActiveSport(sport.id)}
                className={`w-full px-3 py-3 text-left text-xs transition-colors cursor-pointer ${
                  sport.id === 'Football'
                    ? 'text-[#00d053] font-bold bg-[#141f33]'
                    : isSelected
                    ? 'text-white font-bold bg-[#141f33]'
                    : 'text-slate-300 hover:text-white hover:bg-[#121b2c]'
                }`}
              >
                {sport.name}
              </button>
            );
          })}
        </div>

        {/* Right Column (Football Leagues & Countries) */}
        <div className="w-[70%] bg-[#121a28] flex flex-col overflow-y-auto">
          {/* Header Row: Football & All > */}
          <div className="px-3.5 py-3 border-b border-[#1f2b42] flex items-center justify-between">
            <span className="text-sm font-bold text-white tracking-wide">Football</span>
            <button
              onClick={() => {
                onSelectCountry(null);
                onSelectLeague(null);
                onViewAllMatches();
              }}
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-0.5 cursor-pointer"
            >
              All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Top Leagues Section */}
          <div className="divide-y divide-[#182338]">
            <button
              onClick={() => handleCountryClick('Top Leagues')}
              className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-[#162133] transition-colors cursor-pointer"
            >
              <span className="text-xs font-semibold text-slate-200">Top Leagues</span>
              <span className="text-xs font-semibold text-slate-400">{topLeaguesCount}</span>
            </button>

            {[
              { name: 'England', count: countryCounts['England'] || 94 },
              { name: 'Spain', count: countryCounts['Spain'] || 43 },
              { name: 'Germany', count: countryCounts['Germany'] || 30 },
              { name: 'Italy', count: countryCounts['Italy'] || 27 },
              { name: 'France', count: countryCounts['France'] || 22 },
              { name: 'International Clubs', count: countryCounts['International Clubs'] || 62 },
            ].map(item => {
              const isExpanded = expandedCountry === item.name;
              const leagues = countryLeaguesMap[item.name] || [];
              return (
                <div key={item.name} className="flex flex-col">
                  <div
                    onClick={() => handleCountryClick(item.name)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-[#162133] transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-slate-200">{item.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-400">{item.count}</span>
                      {leagues.length > 0 && (
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      )}
                    </div>
                  </div>

                  {/* Sub-leagues Accordion if clicked */}
                  {isExpanded && leagues.length > 0 && (
                    <div className="bg-[#0b111c] px-3 py-1 space-y-1 border-t border-b border-[#182338]">
                      <button
                        onClick={() => {
                          onSelectCountry(item.name);
                          onSelectLeague(null);
                          onViewAllMatches();
                        }}
                        className="w-full py-1.5 text-left text-[11px] font-bold text-[#00d053] hover:underline cursor-pointer flex justify-between"
                      >
                        <span>View All {item.name} Matches</span>
                        <span>{item.count} &gt;</span>
                      </button>
                      {leagues.map(l => (
                        <button
                          key={l.id}
                          onClick={() => {
                            onSelectCountry(item.name);
                            onSelectLeague(l.id);
                            onViewAllMatches();
                          }}
                          className="w-full py-1.5 text-left text-[11px] text-slate-300 hover:text-white flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{l.flag}</span>
                            <span>{l.name}</span>
                          </span>
                          <span className="text-slate-500 text-[10px]">{l.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* A-Z Section Header */}
          <div className="bg-[#0b1019] px-3.5 py-2 border-t border-b border-[#1c273d] text-[11px] font-bold text-slate-400 tracking-wider">
            A-Z
          </div>

          {/* A-Z Countries List */}
          <div className="divide-y divide-[#182338]">
            {filteredAZ.map(item => {
              const isExpanded = expandedCountry === item.name;
              const leagues = countryLeaguesMap[item.name] || [];
              return (
                <div key={item.name} className="flex flex-col">
                  <div
                    onClick={() => handleCountryClick(item.name)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-[#162133] transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-slate-200">{item.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-400">{item.count}</span>
                      {leagues.length > 0 && (
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      )}
                    </div>
                  </div>

                  {/* Sub-leagues Accordion if clicked */}
                  {isExpanded && leagues.length > 0 && (
                    <div className="bg-[#0b111c] px-3 py-1 space-y-1 border-t border-b border-[#182338]">
                      <button
                        onClick={() => {
                          onSelectCountry(item.name);
                          onSelectLeague(null);
                          onViewAllMatches();
                        }}
                        className="w-full py-1.5 text-left text-[11px] font-bold text-[#00d053] hover:underline cursor-pointer flex justify-between"
                      >
                        <span>View All {item.name} Matches</span>
                        <span>{item.count} &gt;</span>
                      </button>
                      {leagues.map(l => (
                        <button
                          key={l.id}
                          onClick={() => {
                            onSelectCountry(item.name);
                            onSelectLeague(l.id);
                            onViewAllMatches();
                          }}
                          className="w-full py-1.5 text-left text-[11px] text-slate-300 hover:text-white flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{l.flag}</span>
                            <span>{l.name}</span>
                          </span>
                          <span className="text-slate-500 text-[10px]">{l.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Bet Slip Badge [0] on bottom left above nav */}
      <div className="fixed bottom-18 left-3 z-40">
        <button
          onClick={onViewAllMatches}
          className="w-11 h-11 rounded-full bg-[#00d053] text-black shadow-lg flex flex-col items-center justify-center font-bold border-2 border-white/20 active:scale-95 transition-transform"
          title="Open Bet Slip & Match Feed"
        >
          <span className="text-[10px] leading-tight font-mono font-black">0</span>
          <span className="text-[8px] leading-none uppercase">Slip</span>
        </button>
      </div>
    </div>
  );
};
