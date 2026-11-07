export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'HT' | 'FINISHED' | 'POSTPONED';

export type FormResult = 'W' | 'D' | 'L';

export interface Injury {
  player: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  status: 'OUT' | 'DOUBTFUL' | 'SUSPENDED';
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  crest: string; // SVG or image representation
  leaguePosition: number;
  points: number;
  played: number;
  form: FormResult[]; // last 5 matches
  attackRating: number; // 0-100
  defenseRating: number; // 0-100
  possessionAvg: number; // e.g. 54%
  homeAdvantageFactor: number; // multiplier e.g. 1.18
  avgGoalsScored: number;
  avgGoalsConceded: number;
  cleanSheets: number;
  tacticalStyle: string; // e.g. "High Pressing 4-3-3", "Low Block Counter 5-3-2"
  keyInjuries: Injury[];
}

export interface Referee {
  name: string;
  country: string;
  matchesOfficiated: number;
  foulsPerGame: number;
  yellowCardsPerGame: number;
  redCardsTotal: number;
  penaltiesPerGame: number;
  strictness: 'STRICT' | 'BALANCED' | 'LENIENT';
  notes: string;
}

export interface H2HMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition: string;
}

export interface H2HSummary {
  totalPlayed: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  avgGoalsPerMatch: number;
  bothTeamsScoredCount: number;
  recentMatches: H2HMatch[];
}

export interface ConsecutiveGoalsPrediction {
  // Chance team scores 2 or more goals without opponent answering
  homeScore2PlusUnanswered: number; // percentage (0-100)
  awayScore2PlusUnanswered: number; // percentage (0-100)
  homeScore3PlusUnanswered: number; // percentage (0-100)
  awayScore3PlusUnanswered: number; // percentage (0-100)
  homeLongestStreakThisSeason: number; // e.g. 4 consecutive unanswered goals
  awayLongestStreakThisSeason: number; // e.g. 3 consecutive unanswered goals
  streakMomentumVerdict: string;
}

export interface PredictionData {
  outcomeProbabilities: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  expectedGoals: {
    home: number;
    away: number;
    total: number;
  };
  goalMarkets: {
    over05: number;
    over15: number;
    over25: number;
    under25: number;
    over35: number;
  };
  bothTeamsToScore: {
    yes: number;
    no: number;
  };
  consecutiveGoals: ConsecutiveGoalsPrediction;
  cleanSheets: {
    homeCleanSheet: number;
    awayCleanSheet: number;
  };
  doubleChance: {
    homeOrDraw: number;
    homeOrAway: number;
    drawOrAway: number;
  };
  firstTeamToScore: {
    home: number;
    away: number;
    noGoal: number;
  };
  halfTimeFullTime: {
    homeHome: number;
    drawHome: number;
    drawDraw: number;
    drawAway: number;
    awayAway: number;
    other: number;
  };
  topLikelyScores: {
    score: string;
    probability: number;
  }[];
  confidenceRating: number; // 0-100%
  primaryVerdict: {
    market: string;
    pick: string;
    confidence: 'VERY_HIGH' | 'HIGH' | 'MODERATE';
    rationale: string;
  };
  keyAnalyticalFactors: {
    h2h: string;
    form: string;
    playerAvailability: string;
    homeAdvantage: string;
    refereeInfluence: string;
    tacticalPace: string;
  };
  geminiReport?: {
    tacticalSummary: string;
    matchPaceAndFlow: string;
    keyDuels: string;
    unansweredGoalThreat: string;
    smartValuePicks: {
      market: string;
      selection: string;
      probability: string;
      reasoning: string;
    }[];
  };
}

export interface Competition {
  id: string;
  name: string;
  country: string;
  flag: string;
  category: 'Popular' | 'European' | 'Domestic' | 'Americas' | 'Asia' | 'Africa' | 'International';
  matchCount?: number;
}

export interface Match {
  id: string;
  competition: Competition;
  date: string; // YYYY-MM-DD
  kickoffTime: string; // HH:MM in 24hr format
  status: MatchStatus;
  minute?: number; // e.g. 24 if Live
  livePeriod?: string; // '1H' | '2H' | 'HT' | 'FT'
  homeTeam: Team;
  awayTeam: Team;
  scores?: {
    home: number;
    away: number;
    halfTimeHome?: number;
    halfTimeAway?: number;
  };
  venue: string;
  weatherCondition?: string;
  referee: Referee;
  h2h: H2HSummary;
  predictions: PredictionData;
  isFavorite?: boolean;
}

export interface LeagueNotificationSubscription {
  leagueId: string;
  leagueName: string;
  country: string;
  enabled: boolean;
  notifyKickoff: boolean;
  notifyGoals: boolean;
  notifyHighEdgePredictions: boolean;
}

export interface AppNotification {
  id: string;
  timestamp: string;
  leagueId: string;
  matchId?: string;
  type: 'KICKOFF' | 'GOAL' | 'PREDICTION_EDGE' | 'LINEUP';
  title: string;
  message: string;
  read: boolean;
}
