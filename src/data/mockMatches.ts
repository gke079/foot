import { Match, Competition, Team, Referee, H2HSummary } from '../types/football';
import { calculateMatchPredictions } from '../utils/predictionEngine';

// Competitions covering all major regions of the world
export const POPULAR_COMPETITIONS: Competition[] = [
  // Europe - Top 5 & Domestic
  { id: 'pl', name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', category: 'Popular' },
  { id: 'championship', name: 'Championship', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', category: 'Domestic' },
  { id: 'laliga', name: 'La Liga', country: 'Spain', flag: '🇪🇸', category: 'Popular' },
  { id: 'segunda', name: 'Segunda División', country: 'Spain', flag: '🇪🇸', category: 'Domestic' },
  { id: 'seriea', name: 'Serie A', country: 'Italy', flag: '🇮🇹', category: 'Popular' },
  { id: 'bundesliga', name: 'Bundesliga', country: 'Germany', flag: '🇩🇪', category: 'Popular' },
  { id: 'ligue1', name: 'Ligue 1', country: 'France', flag: '🇫🇷', category: 'Popular' },
  { id: 'ucl', name: 'Champions League', country: 'Europe', flag: '🇪🇺', category: 'European' },
  { id: 'eredivisie', name: 'Eredivisie', country: 'Netherlands', flag: '🇳🇱', category: 'European' },
  { id: 'primeira', name: 'Primeira Liga', country: 'Portugal', flag: '🇵🇹', category: 'European' },
  { id: 'superlig', name: 'Süper Lig', country: 'Turkey', flag: '🇹🇷', category: 'European' },
  { id: 'scottish', name: 'Scottish Premiership', country: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', category: 'European' },
  { id: 'belgian', name: 'Pro League', country: 'Belgium', flag: '🇧🇪', category: 'European' },
  
  // Americas
  { id: 'brasileirao', name: 'Brasileirão Série A', country: 'Brazil', flag: '🇧🇷', category: 'Americas' },
  { id: 'argentine', name: 'Primera División', country: 'Argentina', flag: '🇦🇷', category: 'Americas' },
  { id: 'mls', name: 'Major League Soccer', country: 'USA', flag: '🇺🇸', category: 'Americas' },
  { id: 'ligamx', name: 'Liga MX', country: 'Mexico', flag: '🇲🇽', category: 'Americas' },

  // Asia & Middle East
  { id: 'saudi', name: 'Saudi Pro League', country: 'Saudi Arabia', flag: '🇸🇦', category: 'Asia' },
  { id: 'jleague', name: 'J1 League', country: 'Japan', flag: '🇯🇵', category: 'Asia' },

  // Africa
  { id: 'caf', name: 'CAF Champions League', country: 'Africa', flag: '🌍', category: 'Africa' },
];

// Helper to create team
function createTeam(
  id: string,
  name: string,
  shortName: string,
  primaryColor: string,
  secondaryColor: string,
  position: number,
  points: number,
  form: ('W' | 'D' | 'L')[],
  attackRating: number,
  defenseRating: number,
  tacticalStyle: string,
  injuries: Team['keyInjuries'] = []
): Team {
  return {
    id,
    name,
    shortName,
    crest: `shield:${primaryColor}:${secondaryColor}:${shortName.slice(0, 3).toUpperCase()}`,
    leaguePosition: position,
    points,
    played: 11,
    form,
    attackRating,
    defenseRating,
    possessionAvg: Math.round(44 + (attackRating / 100) * 20),
    homeAdvantageFactor: 1.18,
    avgGoalsScored: Math.round((attackRating / 45) * 10) / 10,
    avgGoalsConceded: Math.round(((100 - defenseRating) / 48) * 10) / 10,
    cleanSheets: Math.round(defenseRating / 20),
    tacticalStyle,
    keyInjuries: injuries,
  };
}

// Key Referees
export const REFEREES: Record<string, Referee> = {
  oliver: {
    name: 'Michael Oliver',
    country: 'England',
    matchesOfficiated: 18,
    foulsPerGame: 21.4,
    yellowCardsPerGame: 3.8,
    redCardsTotal: 3,
    penaltiesPerGame: 0.38,
    strictness: 'BALANCED',
    notes: 'Allows physical duels to flow; awards clear penalty contact in transition.',
  },
  taylor: {
    name: 'Anthony Taylor',
    country: 'England',
    matchesOfficiated: 16,
    foulsPerGame: 23.2,
    yellowCardsPerGame: 4.4,
    redCardsTotal: 4,
    penaltiesPerGame: 0.44,
    strictness: 'STRICT',
    notes: 'High caution rate early in matches; strict on tactical stopping fouls.',
  },
  lahoz: {
    name: 'Antonio Mateu',
    country: 'Spain',
    matchesOfficiated: 15,
    foulsPerGame: 25.1,
    yellowCardsPerGame: 5.1,
    redCardsTotal: 5,
    penaltiesPerGame: 0.40,
    strictness: 'STRICT',
    notes: 'Zero tolerance for dissent; games often disrupted with frequent set pieces.',
  },
  marciniak: {
    name: 'Szymon Marciniak',
    country: 'Poland',
    matchesOfficiated: 14,
    foulsPerGame: 19.8,
    yellowCardsPerGame: 3.2,
    redCardsTotal: 1,
    penaltiesPerGame: 0.28,
    strictness: 'LENIENT',
    notes: 'Elite game management, allows high physical intensity, low stoppage intervention.',
  },
  sampaio: {
    name: 'Wilton Sampaio',
    country: 'Brazil',
    matchesOfficiated: 17,
    foulsPerGame: 27.2,
    yellowCardsPerGame: 5.4,
    redCardsTotal: 6,
    penaltiesPerGame: 0.48,
    strictness: 'STRICT',
    notes: 'Very strict on physical challenges; frequent yellow cards in South American derbies.',
  },
  aljassim: {
    name: 'Abdulrahman Al-Jassim',
    country: 'Qatar',
    matchesOfficiated: 12,
    foulsPerGame: 21.0,
    yellowCardsPerGame: 3.6,
    redCardsTotal: 2,
    penaltiesPerGame: 0.32,
    strictness: 'BALANCED',
    notes: 'Consistent control in high-tempo Asian and Middle Eastern fixtures.',
  },
  gassama: {
    name: 'Bakary Gassama',
    country: 'Gambia',
    matchesOfficiated: 15,
    foulsPerGame: 24.5,
    yellowCardsPerGame: 4.0,
    redCardsTotal: 3,
    penaltiesPerGame: 0.36,
    strictness: 'BALANCED',
    notes: 'Experienced African official with firm control in hostile derby atmospheres.',
  },
};

// Create Raw Match with automatic algorithmic predictions
function buildMatch(
  id: string,
  competition: Competition,
  date: string,
  kickoffTime: string,
  status: Match['status'],
  homeTeam: Team,
  awayTeam: Team,
  referee: Referee,
  venue: string,
  scores?: Match['scores'],
  livePeriod?: string,
  minute?: number,
  h2hData?: Partial<H2HSummary>
): Match {
  const h2h: H2HSummary = {
    totalPlayed: h2hData?.totalPlayed ?? 6,
    homeWins: h2hData?.homeWins ?? 3,
    draws: h2hData?.draws ?? 2,
    awayWins: h2hData?.awayWins ?? 1,
    avgGoalsPerMatch: h2hData?.avgGoalsPerMatch ?? 2.8,
    bothTeamsScoredCount: h2hData?.bothTeamsScoredCount ?? 4,
    recentMatches: h2hData?.recentMatches ?? [
      { date: '2026-03-14', homeTeam: homeTeam.name, awayTeam: awayTeam.name, homeScore: 2, awayScore: 1, competition: competition.name },
      { date: '2025-11-02', homeTeam: awayTeam.name, awayTeam: homeTeam.name, homeScore: 1, awayScore: 1, competition: competition.name },
      { date: '2025-05-18', homeTeam: homeTeam.name, awayTeam: awayTeam.name, homeScore: 3, awayScore: 2, competition: competition.name },
      { date: '2024-12-08', homeTeam: awayTeam.name, awayTeam: homeTeam.name, homeScore: 0, awayScore: 2, competition: competition.name },
    ],
  };

  const predictions = calculateMatchPredictions(homeTeam, awayTeam, referee, h2h);

  return {
    id,
    competition,
    date,
    kickoffTime,
    status,
    minute,
    livePeriod,
    homeTeam,
    awayTeam,
    scores,
    venue,
    referee,
    h2h,
    predictions,
    isFavorite: false,
  };
}

// -------------------------------------------------------------
// TODAY FIXTURES (2026-11-07) - Comprehensive Worldwide Roster
// -------------------------------------------------------------
const today = '2026-11-07';

const todayMatches: Match[] = [
  // 1. Premier League (England) - Screenshot matches
  buildMatch(
    'pl-leeds-tottenham-2026-11-07',
    POPULAR_COMPETITIONS[0],
    today,
    '15:00',
    'LIVE',
    createTeam('leeds', 'Leeds', 'Leeds', '#ffffff', '#1d428a', 14, 12, ['W', 'L', 'D', 'W', 'L'], 71, 64, 'High Pressing 4-2-3-1', [
      { player: 'Tyler Adams', position: 'MF', status: 'DOUBTFUL', impact: 'MEDIUM', reason: 'Hamstring soreness' }
    ]),
    createTeam('tottenham', 'Tottenham', 'Tottenham', '#132257', '#ffffff', 5, 21, ['W', 'W', 'L', 'W', 'D'], 84, 76, 'Possession Dominant 4-3-3', [
      { player: 'Heung-min Son', position: 'FW', status: 'OUT', impact: 'CRITICAL', reason: 'Calf strain' }
    ]),
    REFEREES.oliver,
    'Elland Road, Leeds',
    { home: 0, away: 0, halfTimeHome: 0, halfTimeAway: 0 },
    '1H',
    34,
    { totalPlayed: 8, homeWins: 2, draws: 2, awayWins: 4, avgGoalsPerMatch: 3.1, bothTeamsScoredCount: 6 }
  ),
  buildMatch(
    'pl-arsenal-hull-2026-11-07',
    POPULAR_COMPETITIONS[0],
    today,
    '18:00',
    'SCHEDULED',
    createTeam('arsenal', 'Arsenal', 'Arsenal', '#ef0107', '#063672', 2, 26, ['W', 'W', 'W', 'D', 'W'], 89, 88, 'Positional Dominance & Inverted Fullbacks', [
      { player: 'Bukayo Saka', position: 'FW', status: 'DOUBTFUL', impact: 'HIGH', reason: 'Knock assessment' }
    ]),
    createTeam('hull', 'Hull City', 'Hull City', '#f58220', '#000000', 18, 9, ['L', 'L', 'D', 'L', 'W'], 62, 59, 'Compact Low Block 5-4-1', [
      { player: 'Lewie Coyle', position: 'DF', status: 'OUT', impact: 'HIGH', reason: 'Suspended (yellow card accumulation)' }
    ]),
    REFEREES.taylor,
    'Emirates Stadium, London',
    undefined, undefined, undefined,
    { totalPlayed: 6, homeWins: 5, draws: 1, awayWins: 0, avgGoalsPerMatch: 3.4, bothTeamsScoredCount: 2 }
  ),
  buildMatch(
    'pl-fulham-newcastle-2026-11-07',
    POPULAR_COMPETITIONS[0],
    today,
    '18:00',
    'SCHEDULED',
    createTeam('fulham', 'Fulham', 'Fulham', '#ffffff', '#000000', 10, 16, ['D', 'W', 'L', 'W', 'D'], 73, 72, 'Direct Wing Overload 4-2-3-1'),
    createTeam('newcastle', 'Newcastle', 'Newcastle', '#000000', '#241f20', 6, 20, ['W', 'D', 'W', 'L', 'W'], 82, 79, 'Intense Transition Counter 4-3-3', [
      { player: 'Alexander Isak', position: 'FW', status: 'OUT', impact: 'CRITICAL', reason: 'Groin tightness' }
    ]),
    REFEREES.oliver,
    'Craven Cottage, London'
  ),
  buildMatch(
    'pl-nottingham-mancity-2026-11-07',
    POPULAR_COMPETITIONS[0],
    today,
    '20:30',
    'SCHEDULED',
    createTeam('nottingham', 'Nottingham Forest', 'Nottingham F...', '#dd0000', '#ffffff', 8, 17, ['W', 'W', 'L', 'D', 'W'], 75, 76, 'Low Block & Fast Direct Breaks'),
    createTeam('mancity', 'Manchester City', 'Manchester C...', '#6cabdd', '#1c2c5b', 1, 28, ['W', 'W', 'W', 'W', 'D'], 93, 89, 'Sustained Territorial Possession 3-2-4-1', [
      { player: 'Rodri', position: 'MF', status: 'OUT', impact: 'CRITICAL', reason: 'ACL Rehabilitation' }
    ]),
    REFEREES.taylor,
    'The City Ground, Nottingham'
  ),

  // 2. English Championship
  buildMatch(
    'champ-sunderland-coventry-2026-11-07',
    POPULAR_COMPETITIONS[1],
    today,
    '16:00',
    'SCHEDULED',
    createTeam('sunderland', 'Sunderland', 'Sunderland', '#eb172b', '#ffffff', 2, 28, ['W', 'W', 'D', 'W', 'W'], 76, 73, 'High Intensity 4-3-3'),
    createTeam('coventry', 'Coventry City', 'Coventry', '#83bde5', '#ffffff', 11, 16, ['W', 'L', 'D', 'W', 'L'], 71, 68, 'Counter 3-4-1-2'),
    REFEREES.oliver,
    'Stadium of Light, Sunderland'
  ),

  // 3. La Liga (Spain) - Screenshot matches
  buildMatch(
    'laliga-malaga-racing-2026-11-07',
    POPULAR_COMPETITIONS[2],
    today,
    '15:00',
    'LIVE',
    createTeam('malaga', 'Malaga', 'Malaga', '#0072ce', '#ffffff', 11, 15, ['D', 'W', 'D', 'L', 'W'], 68, 70, 'Compact 4-4-2 Solid Lines'),
    createTeam('racing', 'Racing', 'Racing', '#00853f', '#ffffff', 13, 14, ['L', 'D', 'W', 'D', 'L'], 66, 68, 'Counter 4-3-3 Wing Transition'),
    REFEREES.lahoz,
    'La Rosaleda, Malaga',
    { home: 0, away: 0, halfTimeHome: 0, halfTimeAway: 0 },
    '1H',
    21
  ),
  buildMatch(
    'laliga-espanyol-deportivo-2026-11-07',
    POPULAR_COMPETITIONS[2],
    today,
    '18:15',
    'SCHEDULED',
    createTeam('espanyol', 'Espanyol', 'Espanyol', '#0070b8', '#ffffff', 12, 14, ['L', 'W', 'L', 'D', 'W'], 71, 67, 'Direct 4-2-3-1'),
    createTeam('deportivo', 'Deportivo La Coruña', 'Deportivo La ...', '#00509d', '#ffffff', 15, 12, ['D', 'L', 'L', 'W', 'D'], 65, 64, 'Organized 5-3-2'),
    REFEREES.lahoz,
    'RCDE Stadium, Barcelona'
  ),
  buildMatch(
    'laliga-osasuna-athletic-2026-11-07',
    POPULAR_COMPETITIONS[2],
    today,
    '20:30',
    'SCHEDULED',
    createTeam('osasuna', 'Osasuna', 'Osasuna', '#d91a2a', '#102040', 9, 16, ['W', 'D', 'L', 'W', 'D'], 74, 76, 'Intense El Sadar Pressing 4-3-3'),
    createTeam('athletic', 'Athletic Club', 'Athletic Club', '#ee2524', '#ffffff', 4, 22, ['W', 'W', 'D', 'W', 'W'], 83, 84, 'Relentless High Tempo 4-2-3-1', [
      { player: 'Nico Williams', position: 'FW', status: 'OUT', impact: 'HIGH', reason: 'Adductor strain' }
    ]),
    REFEREES.marciniak,
    'El Sadar, Pamplona'
  ),
  buildMatch(
    'laliga-barca-sevilla-2026-11-07',
    POPULAR_COMPETITIONS[2],
    today,
    '21:00',
    'SCHEDULED',
    createTeam('barcelona', 'Barcelona', 'Barcelona', '#a50044', '#004d98', 1, 29, ['W', 'W', 'W', 'W', 'W'], 94, 86, 'Extreme High Line Offside Trap 4-2-1-3', [
      { player: 'Lamine Yamal', position: 'FW', status: 'OUT', impact: 'HIGH', reason: 'Ankle knock' }
    ]),
    createTeam('sevilla', 'Sevilla', 'Sevilla', '#d4001f', '#ffffff', 10, 15, ['L', 'D', 'W', 'L', 'D'], 73, 71, 'Mid-block Counter 4-3-3'),
    REFEREES.lahoz,
    'Estadi Olímpic Lluís Companys, Barcelona'
  ),

  // 4. Serie A (Italy)
  buildMatch(
    'seriea-inter-juventus-2026-11-07',
    POPULAR_COMPETITIONS[4],
    today,
    '20:45',
    'SCHEDULED',
    createTeam('inter', 'Inter Milan', 'Inter', '#0054a5', '#000000', 2, 25, ['W', 'W', 'D', 'W', 'W'], 88, 87, 'Fluid 3-5-2 Inverted Wingbacks'),
    createTeam('juventus', 'Juventus', 'Juventus', '#000000', '#ffffff', 3, 24, ['W', 'D', 'W', 'D', 'W'], 83, 91, 'Rock-Solid 4-2-3-1 Low xGA', [
      { player: 'Bremer', position: 'DF', status: 'OUT', impact: 'CRITICAL', reason: 'Knee surgery recovery' }
    ]),
    REFEREES.marciniak,
    'San Siro, Milan'
  ),
  buildMatch(
    'seriea-roma-lazio-2026-11-07',
    POPULAR_COMPETITIONS[4],
    today,
    '18:00',
    'SCHEDULED',
    createTeam('roma', 'AS Roma', 'Roma', '#8e1f2f', '#f0bc42', 6, 20, ['W', 'W', 'L', 'D', 'W'], 81, 79, 'High Intensity 3-4-2-1'),
    createTeam('lazio', 'Lazio', 'Lazio', '#87d8f7', '#ffffff', 5, 21, ['W', 'D', 'W', 'W', 'L'], 82, 78, 'Direct Vertical 4-2-3-1'),
    REFEREES.taylor,
    'Stadio Olimpico, Rome'
  ),

  // 5. Bundesliga (Germany)
  buildMatch(
    'bundes-dortmund-bayer-2026-11-07',
    POPULAR_COMPETITIONS[5],
    today,
    '18:30',
    'SCHEDULED',
    createTeam('dortmund', 'Borussia Dortmund', 'Dortmund', '#fde100', '#000000', 4, 21, ['W', 'L', 'W', 'W', 'L'], 85, 75, 'Vertical Overload 4-2-3-1'),
    createTeam('leverkusen', 'Bayer Leverkusen', 'Leverkusen', '#e32219', '#000000', 3, 23, ['D', 'W', 'W', 'D', 'W'], 87, 81, 'Positional Rotations 3-4-2-1'),
    REFEREES.oliver,
    'Signal Iduna Park, Dortmund'
  ),
  buildMatch(
    'bundes-bayern-leipzig-2026-11-07',
    POPULAR_COMPETITIONS[5],
    today,
    '15:30',
    'LIVE',
    createTeam('bayern', 'Bayern Munich', 'Bayern', '#dc052d', '#0066b2', 1, 28, ['W', 'W', 'W', 'W', 'D'], 93, 86, 'Relentless High Pressing 4-2-3-1'),
    createTeam('leipzig', 'RB Leipzig', 'RB Leipzig', '#ffffff', '#e30613', 2, 25, ['W', 'W', 'D', 'W', 'W'], 86, 84, 'Red Bull Transition 4-2-2-2'),
    REFEREES.marciniak,
    'Allianz Arena, Munich',
    { home: 1, away: 1, halfTimeHome: 1, halfTimeAway: 1 },
    '2H',
    68
  ),

  // 6. Ligue 1 (France)
  buildMatch(
    'ligue1-psg-marseille-2026-11-07',
    POPULAR_COMPETITIONS[6],
    today,
    '21:00',
    'SCHEDULED',
    createTeam('psg', 'Paris Saint-Germain', 'PSG', '#004170', '#da291c', 1, 29, ['W', 'W', 'W', 'W', 'W'], 92, 85, 'Luis Enrique Total Dominance 4-3-3'),
    createTeam('marseille', 'Marseille', 'Marseille', '#00a3e0', '#ffffff', 2, 22, ['W', 'W', 'L', 'W', 'W'], 83, 76, 'De Zerbi Fluid Build-up 3-2-4-1'),
    REFEREES.marciniak,
    'Parc des Princes, Paris'
  ),

  // 7. Eredivisie (Netherlands)
  buildMatch(
    'eredivisie-ajax-feyenoord-2026-11-07',
    POPULAR_COMPETITIONS[8],
    today,
    '16:45',
    'SCHEDULED',
    createTeam('ajax', 'Ajax', 'Ajax', '#ffffff', '#d2122e', 3, 23, ['W', 'W', 'D', 'W', 'W'], 84, 76, 'Classic Dutch Total Football 4-3-3'),
    createTeam('feyenoord', 'Feyenoord', 'Feyenoord', '#ed1c24', '#000000', 4, 22, ['W', 'D', 'W', 'L', 'W'], 83, 78, 'High Pressing 4-2-3-1'),
    REFEREES.oliver,
    'Johan Cruyff Arena, Amsterdam'
  ),

  // 8. Primeira Liga (Portugal)
  buildMatch(
    'primeira-sporting-benfica-2026-11-07',
    POPULAR_COMPETITIONS[9],
    today,
    '21:30',
    'SCHEDULED',
    createTeam('sporting', 'Sporting CP', 'Sporting', '#008057', '#ffffff', 1, 30, ['W', 'W', 'W', 'W', 'W'], 89, 87, 'Lethal 3-4-3 Attack System'),
    createTeam('benfica', 'Benfica', 'Benfica', '#e8112d', '#ffffff', 2, 25, ['W', 'W', 'D', 'W', 'W'], 85, 83, 'Fluid 4-2-3-1 Possession'),
    REFEREES.lahoz,
    'Estádio José Alvalade, Lisbon'
  ),

  // 9. Süper Lig (Turkey)
  buildMatch(
    'superlig-galatasaray-fenerbahce-2026-11-07',
    POPULAR_COMPETITIONS[10],
    today,
    '19:00',
    'SCHEDULED',
    createTeam('galatasaray', 'Galatasaray', 'Galatasaray', '#a90432', '#fdb912', 1, 28, ['W', 'W', 'W', 'D', 'W'], 86, 80, 'Aggressive 4-2-3-1 Attack'),
    createTeam('fenerbahce', 'Fenerbahçe', 'Fenerbahçe', '#002d72', '#ffe600', 2, 26, ['W', 'W', 'W', 'W', 'D'], 85, 82, 'Mourinho Structured Counter 4-3-3'),
    REFEREES.marciniak,
    'Rams Park, Istanbul'
  ),

  // 10. Saudi Pro League (Middle East)
  buildMatch(
    'saudi-alhilal-alnassr-2026-11-07',
    POPULAR_COMPETITIONS[17],
    today,
    '20:00',
    'SCHEDULED',
    createTeam('alhilal', 'Al-Hilal', 'Al-Hilal', '#002b7f', '#ffffff', 1, 27, ['W', 'W', 'W', 'W', 'W'], 88, 84, 'Jorge Jesus High Rhythm 4-2-3-1'),
    createTeam('alnassr', 'Al-Nassr', 'Al-Nassr', '#fff200', '#0047ba', 2, 24, ['W', 'W', 'D', 'W', 'W'], 87, 79, 'Pioli Dynamic Forward Line 4-3-3'),
    REFEREES.aljassim,
    'Kingdom Arena, Riyadh'
  ),

  // 11. Major League Soccer (USA / North America)
  buildMatch(
    'mls-miami-lagalaxy-2026-11-07',
    POPULAR_COMPETITIONS[15],
    today,
    '22:30',
    'SCHEDULED',
    createTeam('miami', 'Inter Miami', 'Inter Miami', '#f7b5cd', '#231f20', 1, 68, ['W', 'W', 'W', 'D', 'W'], 88, 74, 'Playmaking Maestro 4-3-3 System'),
    createTeam('lagalaxy', 'LA Galaxy', 'LA Galaxy', '#00245d', '#ffd100', 2, 64, ['W', 'D', 'W', 'W', 'L'], 84, 76, 'Pujol Dynamic Transition 4-2-3-1'),
    REFEREES.sampaio,
    'Chase Stadium, Fort Lauderdale'
  ),

  // 12. Brasileirão Série A (South America)
  buildMatch(
    'brazil-flamengo-palmeiras-2026-11-07',
    POPULAR_COMPETITIONS[13],
    today,
    '21:30',
    'SCHEDULED',
    createTeam('flamengo', 'Flamengo', 'Flamengo', '#c3281e', '#000000', 1, 62, ['W', 'W', 'D', 'W', 'W'], 87, 83, 'Filipe Luís High Pressing 4-2-3-1'),
    createTeam('palmeiras', 'Palmeiras', 'Palmeiras', '#006437', '#ffffff', 2, 60, ['W', 'W', 'W', 'L', 'W'], 86, 85, 'Abel Ferreira Tactical Masterclass 3-5-2'),
    REFEREES.sampaio,
    'Maracanã, Rio de Janeiro'
  ),

  // 13. Argentine Primera División (Superclásico)
  buildMatch(
    'arg-boca-river-2026-11-07',
    POPULAR_COMPETITIONS[14],
    today,
    '20:00',
    'SCHEDULED',
    createTeam('boca', 'Boca Juniors', 'Boca Juniors', '#003366', '#ffcc00', 4, 34, ['W', 'D', 'W', 'L', 'W'], 81, 84, 'La Bombonera Steel Intensity 4-4-2'),
    createTeam('river', 'River Plate', 'River Plate', '#ffffff', '#e30613', 2, 38, ['W', 'W', 'D', 'W', 'W'], 85, 82, 'Gallardo Aggressive Territorial 4-3-1-2'),
    REFEREES.sampaio,
    'La Bombonera, Buenos Aires'
  ),

  // 14. Liga MX (Mexico)
  buildMatch(
    'ligamx-america-chivas-2026-11-07',
    POPULAR_COMPETITIONS[16],
    today,
    '23:00',
    'SCHEDULED',
    createTeam('america', 'Club América', 'Club América', '#ffdf00', '#002b49', 1, 32, ['W', 'W', 'W', 'D', 'W'], 85, 82, 'Jardine Direct Attacking 4-2-3-1'),
    createTeam('chivas', 'Chivas Guadalajara', 'Chivas', '#da291c', '#002f6c', 5, 26, ['D', 'W', 'L', 'W', 'W'], 80, 80, 'Compact Vertical Counter 4-3-3'),
    REFEREES.sampaio,
    'Estadio Azteca, Mexico City'
  ),

  // 15. J1 League (Japan)
  buildMatch(
    'jleague-kobe-marinos-2026-11-07',
    POPULAR_COMPETITIONS[18],
    today,
    '13:00',
    'FINISHED',
    createTeam('kobe', 'Vissel Kobe', 'Vissel Kobe', '#9e0031', '#ffffff', 1, 64, ['W', 'W', 'D', 'W', 'W'], 82, 85, 'Direct Physical Press 4-3-3'),
    createTeam('marinos', 'Yokohama F. Marinos', 'Marinos', '#002b7f', '#e60012', 6, 52, ['L', 'W', 'W', 'L', 'D'], 83, 76, 'Attacking High Line 4-2-1-3'),
    REFEREES.aljassim,
    'Noevir Stadium Kobe',
    { home: 2, away: 1, halfTimeHome: 1, halfTimeAway: 0 },
    'FT',
    90
  ),

  // 16. CAF Champions League (Africa)
  buildMatch(
    'caf-alahly-zamalek-2026-11-07',
    POPULAR_COMPETITIONS[19],
    today,
    '19:00',
    'SCHEDULED',
    createTeam('alahly', 'Al Ahly', 'Al Ahly', '#d21034', '#ffffff', 1, 24, ['W', 'W', 'W', 'W', 'D'], 86, 88, 'Koller African Dominance 4-3-3'),
    createTeam('zamalek', 'Zamalek', 'Zamalek', '#ffffff', '#d21034', 2, 21, ['W', 'D', 'W', 'W', 'L'], 82, 81, 'Technical Direct Counter 4-2-3-1'),
    REFEREES.gassama,
    'Cairo International Stadium, Cairo'
  )
];

// -------------------------------------------------------------
// YESTERDAY FIXTURES (2026-11-06) - Fully Finished with FT scores
// -------------------------------------------------------------
const yesterday = '2026-11-06';

const yesterdayMatches: Match[] = [
  buildMatch(
    'ucl-realmadrid-milan-2026-11-06',
    POPULAR_COMPETITIONS[7],
    yesterday,
    '21:00',
    'FINISHED',
    createTeam('realmadrid', 'Real Madrid', 'Real Madrid', '#ffffff', '#00529f', 1, 12, ['W', 'W', 'L', 'W', 'W'], 93, 82, 'Lethal Transition Galacticos 4-3-1-2'),
    createTeam('milan', 'AC Milan', 'AC Milan', '#fb090b', '#000000', 3, 7, ['L', 'W', 'W', 'D', 'L'], 80, 75, 'Compact 4-2-3-1 Double Pivot'),
    REFEREES.marciniak,
    'Santiago Bernabéu, Madrid',
    { home: 3, away: 1, halfTimeHome: 1, halfTimeAway: 1 },
    'FT',
    90
  ),
  buildMatch(
    'ucl-bayern-benfica-2026-11-06',
    POPULAR_COMPETITIONS[7],
    yesterday,
    '21:00',
    'FINISHED',
    createTeam('bayern', 'Bayern Munich', 'Bayern', '#dc052d', '#0066b2', 2, 9, ['W', 'W', 'W', 'W', 'D'], 92, 85, 'Suffocating High Line 4-2-3-1'),
    createTeam('benfica', 'Benfica', 'Benfica', '#e8112d', '#ffffff', 4, 6, ['W', 'L', 'D', 'W', 'L'], 76, 73, 'Counter 4-3-3 Low Block'),
    REFEREES.oliver,
    'Allianz Arena, Munich',
    { home: 2, away: 0, halfTimeHome: 1, halfTimeAway: 0 },
    'FT',
    90
  ),
  buildMatch(
    'pl-chelsea-everton-2026-11-06',
    POPULAR_COMPETITIONS[0],
    yesterday,
    '20:00',
    'FINISHED',
    createTeam('chelsea', 'Chelsea', 'Chelsea', '#034694', '#ffffff', 5, 20, ['W', 'W', 'D', 'W', 'L'], 84, 78, 'Possession 4-2-3-1'),
    createTeam('everton', 'Everton', 'Everton', '#003399', '#ffffff', 16, 11, ['D', 'L', 'L', 'W', 'D'], 65, 71, 'Dyche Compact 4-4-1-1'),
    REFEREES.taylor,
    'Stamford Bridge, London',
    { home: 2, away: 1, halfTimeHome: 1, halfTimeAway: 0 },
    'FT',
    90
  ),
  buildMatch(
    'laliga-celta-getafe-2026-11-06',
    POPULAR_COMPETITIONS[2],
    yesterday,
    '21:00',
    'FINISHED',
    createTeam('celta', 'Celta Vigo', 'Celta Vigo', '#87ceeb', '#ffffff', 11, 14, ['W', 'L', 'D', 'W', 'D'], 73, 68, 'Attacking 3-4-3'),
    createTeam('getafe', 'Getafe', 'Getafe', '#005999', '#ffffff', 14, 12, ['D', 'D', 'L', 'D', 'W'], 63, 76, 'Ultra Aggressive Low Block 5-3-2'),
    REFEREES.lahoz,
    'Abanca-Balaídos, Vigo',
    { home: 1, away: 0, halfTimeHome: 0, halfTimeAway: 0 },
    'FT',
    90
  ),
  buildMatch(
    'brazil-gremio-internacional-2026-11-06',
    POPULAR_COMPETITIONS[13],
    yesterday,
    '21:00',
    'FINISHED',
    createTeam('gremio', 'Grêmio', 'Grêmio', '#0080c8', '#000000', 8, 45, ['W', 'D', 'L', 'W', 'D'], 78, 77, 'Grenal Intense 4-2-3-1'),
    createTeam('inter_br', 'Internacional', 'Inter-RS', '#e30613', '#ffffff', 6, 49, ['W', 'W', 'W', 'D', 'L'], 81, 79, 'Counter 4-3-3'),
    REFEREES.sampaio,
    'Arena do Grêmio, Porto Alegre',
    { home: 1, away: 1, halfTimeHome: 0, halfTimeAway: 1 },
    'FT',
    90
  )
];

// -------------------------------------------------------------
// TOMORROW FIXTURES (2026-11-08) - Upcoming Matches
// -------------------------------------------------------------
const tomorrow = '2026-11-08';

const tomorrowMatches: Match[] = [
  buildMatch(
    'pl-liverpool-astonvilla-2026-11-08',
    POPULAR_COMPETITIONS[0],
    tomorrow,
    '16:30',
    'SCHEDULED',
    createTeam('liverpool', 'Liverpool', 'Liverpool', '#c8102e', '#ffffff', 1, 28, ['W', 'W', 'W', 'D', 'W'], 91, 89, 'Slot Ball High Control 4-2-3-1'),
    createTeam('astonvilla', 'Aston Villa', 'Aston Villa', '#670e36', '#95bfe5', 4, 21, ['W', 'L', 'W', 'W', 'D'], 82, 77, 'Emery High Offside Trap 4-4-2'),
    REFEREES.oliver,
    'Anfield, Liverpool'
  ),
  buildMatch(
    'pl-manutd-leicester-2026-11-08',
    POPULAR_COMPETITIONS[0],
    tomorrow,
    '14:00',
    'SCHEDULED',
    createTeam('manutd', 'Manchester United', 'Man United', '#da291c', '#000000', 8, 17, ['W', 'D', 'L', 'W', 'W'], 79, 74, 'Amorim 3-4-2-1 Wingback Overload'),
    createTeam('leicester', 'Leicester City', 'Leicester', '#003090', '#ffffff', 15, 12, ['L', 'D', 'W', 'L', 'L'], 70, 63, 'Fast Counter 4-3-3'),
    REFEREES.taylor,
    'Old Trafford, Manchester'
  ),
  buildMatch(
    'laliga-atletico-mallorca-2026-11-08',
    POPULAR_COMPETITIONS[2],
    tomorrow,
    '16:15',
    'SCHEDULED',
    createTeam('atletico', 'Atlético Madrid', 'Atlético', '#cb3524', '#ffffff', 3, 23, ['W', 'W', 'W', 'D', 'L'], 84, 88, 'Simeone Steel Block 5-3-2'),
    createTeam('mallorca', 'Mallorca', 'Mallorca', '#e20613', '#000000', 9, 16, ['D', 'W', 'L', 'W', 'D'], 67, 78, 'Low Block Arrasate 4-4-2'),
    REFEREES.lahoz,
    'Riyadh Air Metropolitano, Madrid'
  ),
  buildMatch(
    'saudi-ittihad-ahli-2026-11-08',
    POPULAR_COMPETITIONS[17],
    tomorrow,
    '19:00',
    'SCHEDULED',
    createTeam('ittihad', 'Al-Ittihad', 'Al-Ittihad', '#fced00', '#000000', 2, 24, ['W', 'W', 'W', 'L', 'W'], 86, 80, 'Blanc Direct Overload 4-2-3-1'),
    createTeam('ahli_saudi', 'Al-Ahli', 'Al-Ahli', '#007a3d', '#ffffff', 4, 18, ['D', 'W', 'L', 'W', 'W'], 83, 78, 'Jaissle High Energy Press 4-3-3'),
    REFEREES.aljassim,
    'King Abdullah Sports City, Jeddah'
  )
];

// Combine all pre-populated matches
export const ALL_MATCHES: Match[] = [
  ...todayMatches,
  ...yesterdayMatches,
  ...tomorrowMatches,
];

// Dynamic generator for any arbitrary date selected by user from the calendar
export function getMatchesForDate(targetDate: string): Match[] {
  const directMatches = ALL_MATCHES.filter(m => m.date === targetDate);
  if (directMatches.length > 0) {
    return directMatches;
  }

  const isPast = targetDate < today;
  const sampleWorldwideFixtures = [
    {
      comp: POPULAR_COMPETITIONS[0], // Premier League
      home: createTeam('wolves', 'Wolverhampton', 'Wolves', '#fdb913', '#231f20', 16, 9, ['L', 'L', 'D', 'L', 'W'], 68, 64, 'Counter 3-4-2-1'),
      away: createTeam('bournemouth', 'Bournemouth', 'Bournemouth', '#da291c', '#000000', 10, 15, ['W', 'D', 'W', 'L', 'D'], 76, 72, 'Iraola Intense Press 4-2-3-1'),
      time: '15:00',
      venue: 'Molineux Stadium, Wolverhampton',
    },
    {
      comp: POPULAR_COMPETITIONS[2], // La Liga
      home: createTeam('valencia', 'Valencia', 'Valencia', '#ffffff', '#000000', 17, 10, ['L', 'D', 'L', 'W', 'L'], 67, 65, 'Compact 4-4-2'),
      away: createTeam('villarreal', 'Villarreal', 'Villarreal', '#ffe500', '#00509d', 4, 21, ['W', 'W', 'L', 'W', 'W'], 84, 76, 'Direct 4-4-2 Transitions'),
      time: '19:00',
      venue: 'Mestalla, Valencia',
    },
    {
      comp: POPULAR_COMPETITIONS[4], // Serie A
      home: createTeam('atalanta', 'Atalanta', 'Atalanta', '#005ba3', '#000000', 3, 22, ['W', 'W', 'W', 'W', 'D'], 87, 82, 'Gasperini Man-to-Man 3-4-1-2'),
      away: createTeam('fiorentina', 'Fiorentina', 'Fiorentina', '#482e92', '#ffffff', 5, 20, ['W', 'W', 'W', 'D', 'W'], 83, 79, 'Fluid Attacking 4-3-3'),
      time: '20:45',
      venue: 'Gewiss Stadium, Bergamo',
    },
    {
      comp: POPULAR_COMPETITIONS[13], // Brazil
      home: createTeam('saopaulo', 'São Paulo', 'São Paulo', '#e30613', '#000000', 5, 52, ['W', 'D', 'L', 'W', 'W'], 82, 80, 'Zubeldía High Energy 4-2-3-1'),
      away: createTeam('corinthians', 'Corinthians', 'Corinthians', '#ffffff', '#000000', 13, 38, ['W', 'W', 'D', 'L', 'D'], 79, 78, 'Counter Block 4-3-1-2'),
      time: '21:30',
      venue: 'MorumBIS, São Paulo',
    },
    {
      comp: POPULAR_COMPETITIONS[17], // Saudi
      home: createTeam('shabab', 'Al-Shabab', 'Al-Shabab', '#ffffff', '#000000', 4, 21, ['W', 'L', 'W', 'W', 'D'], 80, 78, 'Structured 4-3-3'),
      away: createTeam('taawoun', 'Al-Taawoun', 'Al-Taawoun', '#ffe600', '#002b7f', 6, 17, ['D', 'W', 'L', 'W', 'L'], 76, 75, 'Counter 5-3-2'),
      time: '18:00',
      venue: 'Al-Shabab Club Stadium, Riyadh',
    },
    {
      comp: POPULAR_COMPETITIONS[15], // MLS
      home: createTeam('lafc', 'LAFC', 'LAFC', '#000000', '#c59b27', 2, 63, ['W', 'W', 'L', 'W', 'D'], 86, 79, 'Cherundolo Fast Transition 4-3-3'),
      away: createTeam('sounders', 'Seattle Sounders', 'Seattle', '#005595', '#5d9732', 4, 57, ['D', 'W', 'W', 'D', 'W'], 81, 84, 'Schmetzer Balanced 4-2-3-1'),
      time: '22:00',
      venue: 'BMO Stadium, Los Angeles',
    }
  ];

  return sampleWorldwideFixtures.map((f, idx) => {
    const status: Match['status'] = isPast ? 'FINISHED' : 'SCHEDULED';
    const scores = isPast ? {
      home: idx % 2 === 0 ? 2 : 1,
      away: idx % 2 === 0 ? 1 : 1,
      halfTimeHome: idx % 2 === 0 ? 1 : 0,
      halfTimeAway: idx % 2 === 0 ? 0 : 1,
    } : undefined;

    return buildMatch(
      `gen-${f.comp.id}-${idx}-${targetDate}`,
      f.comp,
      targetDate,
      f.time,
      status,
      f.home,
      f.away,
      REFEREES.oliver,
      f.venue,
      scores,
      isPast ? 'FT' : undefined,
      isPast ? 90 : undefined
    );
  });
}
