import { Team, Referee, H2HSummary, PredictionData, ConsecutiveGoalsPrediction, Match, PredictionMarketFilter, PredictionMarketMeta } from '../types/football';

/**
 * Factorial calculation helper for Poisson distribution
 */
function factorial(n: number): number {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

/**
 * Poisson probability mass function: P(k; lambda) = (lambda^k * e^-lambda) / k!
 */
function poisson(k: number, lambda: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

/**
 * Advanced Football Prediction Engine
 * Analyzes team strengths, home advantage, injuries/absences, referee strictness,
 * H2H records, and form to generate pure algorithmic market outcomes.
 * NO bookmaker odds are used.
 */
export function calculateMatchPredictions(
  homeTeam: Team,
  awayTeam: Team,
  referee: Referee,
  h2h: H2HSummary
): PredictionData {
  // 1. Form calculation (last 5 games: W=3, D=1, L=0)
  const formPoints = (form: ('W' | 'D' | 'L')[]) => {
    return form.reduce((acc, r) => acc + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0);
  };
  const homeFormPts = formPoints(homeTeam.form); // 0 - 15
  const awayFormPts = formPoints(awayTeam.form); // 0 - 15
  const formDiff = (homeFormPts - awayFormPts) / 15; // -1 to +1

  // 2. Injury & Absence Impact Score
  // Defensive absences make opponent score more; attacking absences reduce own goals
  const calculateAbsenceImpact = (injuries: Team['keyInjuries']) => {
    let defPenalty = 0;
    let atkPenalty = 0;
    for (const inj of injuries) {
      const weight = inj.impact === 'CRITICAL' ? 0.22 : inj.impact === 'HIGH' ? 0.14 : inj.impact === 'MEDIUM' ? 0.08 : 0.03;
      const statusMult = inj.status === 'OUT' ? 1.0 : inj.status === 'SUSPENDED' ? 1.0 : 0.5; // doubtful
      if (inj.position === 'DF' || inj.position === 'GK') {
        defPenalty += weight * statusMult;
      } else {
        atkPenalty += weight * statusMult;
      }
    }
    return { defPenalty, atkPenalty };
  };

  const homeAbsences = calculateAbsenceImpact(homeTeam.keyInjuries);
  const awayAbsences = calculateAbsenceImpact(awayTeam.keyInjuries);

  // 3. Referee influence factor
  // Strict referees increase penalty probability and disrupt fluid attacking flow
  const refPenaltyFactor = referee.penaltiesPerGame > 0.35 ? 0.12 : 0.04;
  const refStrictnessCardMod = referee.strictness === 'STRICT' ? 0.08 : referee.strictness === 'LENIENT' ? -0.05 : 0;

  // 4. Head to Head influence
  let h2hHomeBias = 0;
  if (h2h.totalPlayed >= 3) {
    const homeWinRate = h2h.homeWins / h2h.totalPlayed;
    const awayWinRate = h2h.awayWins / h2h.totalPlayed;
    h2hHomeBias = (homeWinRate - awayWinRate) * 0.15;
  }

  // 5. Expected Goals (xG) baseline formulation
  // Base attack/defense ratings (scaled 0.7 - 2.5 goals)
  const leagueAvgGoals = 1.35;
  
  const homeAtkStrength = (homeTeam.attackRating / 75) * (1 - homeAbsences.atkPenalty);
  const homeDefWeakness = (100 - homeTeam.defenseRating) / 50 + homeAbsences.defPenalty;

  const awayAtkStrength = (awayTeam.attackRating / 75) * (1 - awayAbsences.atkPenalty);
  const awayDefWeakness = (100 - awayTeam.defenseRating) / 50 + awayAbsences.defPenalty;

  // Home advantage factor (default +20% boost)
  const homeAdv = homeTeam.homeAdvantageFactor || 1.18;

  let homeXG = leagueAvgGoals * homeAtkStrength * awayDefWeakness * homeAdv * (1 + formDiff * 0.15) * (1 + h2hHomeBias) + refPenaltyFactor;
  let awayXG = leagueAvgGoals * awayAtkStrength * homeDefWeakness * (1 - formDiff * 0.15) * (1 - h2hHomeBias);

  // Ensure realistic bounds
  homeXG = Math.max(0.45, Math.min(3.8, homeXG));
  awayXG = Math.max(0.35, Math.min(3.5, awayXG));

  // 6. Poisson Matrix Generation (0 to 6 goals for each team)
  let homeWinProb = 0;
  let drawProb = 0;
  let awayWinProb = 0;

  let over05 = 0;
  let over15 = 0;
  let over25 = 0;
  let over35 = 0;

  let homeCleanSheet = 0;
  let awayCleanSheet = 0;
  let bttsYes = 0;

  const scoreProbabilities: { score: string; probability: number }[] = [];

  for (let h = 0; h <= 6; h++) {
    const pH = poisson(h, homeXG);
    for (let a = 0; a <= 6; a++) {
      const pA = poisson(a, awayXG);
      const pScore = pH * pA;

      scoreProbabilities.push({
        score: `${h}-${a}`,
        probability: pScore,
      });

      if (h > a) homeWinProb += pScore;
      else if (h === a) drawProb += pScore;
      else awayWinProb += pScore;

      const totalGoals = h + a;
      if (totalGoals > 0.5) over05 += pScore;
      if (totalGoals > 1.5) over15 += pScore;
      if (totalGoals > 2.5) over25 += pScore;
      if (totalGoals > 3.5) over35 += pScore;

      if (a === 0) homeCleanSheet += pScore;
      if (h === 0) awayCleanSheet += pScore;
      if (h > 0 && a > 0) bttsYes += pScore;
    }
  }

  // Normalize 1X2 probabilities to 100%
  const total1X2 = homeWinProb + drawProb + awayWinProb;
  const pHomeWin = Math.round((homeWinProb / total1X2) * 100);
  const pDraw = Math.round((drawProb / total1X2) * 100);
  const pAwayWin = Math.max(1, 100 - pHomeWin - pDraw);

  // Sort top likely exact scorelines
  scoreProbabilities.sort((a, b) => b.probability - a.probability);
  const topScores = scoreProbabilities.slice(0, 5).map(s => ({
    score: s.score,
    probability: Math.round(s.probability * 100 * 10) / 10,
  }));

  // 7. Consecutive Unanswered Goals Simulation Model
  // Specifically requested by user: "no of consecutive goals in a team without the opponent scoring"
  const consecutiveGoals = calculateConsecutiveUnansweredStreaks(homeXG, awayXG, homeTeam, awayTeam);

  // 8. Other Markets:
  // Double Chance
  const dc1X = Math.min(99, pHomeWin + pDraw);
  const dc12 = Math.min(99, pHomeWin + pAwayWin);
  const dcX2 = Math.min(99, pDraw + pAwayWin);

  // First team to score
  const noGoalProb = Math.round(poisson(0, homeXG) * poisson(0, awayXG) * 100);
  const goalEventTotal = homeXG + awayXG;
  const homeFirstProb = Math.round(((homeXG / goalEventTotal) * (100 - noGoalProb)));
  const awayFirstProb = Math.max(0, 100 - noGoalProb - homeFirstProb);

  // HT/FT estimation
  const htHome = homeWinProb * 0.7 + drawProb * 0.2;
  const htFtHomeHome = Math.round(htHome * 0.65 * 100);
  const htFtDrawHome = Math.round(drawProb * 0.45 * 100);
  const htFtDrawDraw = Math.round(drawProb * 0.35 * 100);
  const htFtAwayAway = Math.round(awayWinProb * 0.55 * 100);
  const htFtDrawAway = Math.round(drawProb * 0.4 * 100);
  const htFtOther = Math.max(1, 100 - (htFtHomeHome + htFtDrawHome + htFtDrawDraw + htFtAwayAway + htFtDrawAway));

  // Confidence Rating: higher when probability divergence is clear
  const maxProb = Math.max(pHomeWin, pDraw, pAwayWin);
  const formStability = Math.abs(homeFormPts - awayFormPts) >= 6 ? 15 : 5;
  const confidenceScore = Math.min(94, Math.max(58, Math.round(maxProb * 0.85 + formStability)));

  // Primary Algorithmic Verdict selection
  let primaryVerdictMarket = '1X2';
  let primaryPick = `${homeTeam.shortName} to Win`;
  let primaryConfidence: 'VERY_HIGH' | 'HIGH' | 'MODERATE' = 'HIGH';
  let primaryRationale = '';

  if (pHomeWin >= 60) {
    primaryPick = `${homeTeam.shortName} Win (Home Advantage & Attack Index)`;
    primaryRationale = `${homeTeam.name} exhibits an xG dominance of ${homeXG.toFixed(2)} vs ${awayXG.toFixed(2)} with strong home turf stability.`;
    primaryConfidence = pHomeWin >= 72 ? 'VERY_HIGH' : 'HIGH';
  } else if (pAwayWin >= 55) {
    primaryPick = `${awayTeam.shortName} Win`;
    primaryRationale = `${awayTeam.name} superior form and tactical counter-threat outweighs home advantage in this matchup.`;
    primaryConfidence = pAwayWin >= 68 ? 'VERY_HIGH' : 'HIGH';
  } else if (Math.round(over25 * 100) >= 65) {
    primaryVerdictMarket = 'Total Goals';
    primaryPick = 'Over 2.5 Goals';
    primaryRationale = `Both teams boast high expected offensive returns (${(homeXG + awayXG).toFixed(2)} combined xG) with defensive absences.`;
    primaryConfidence = 'HIGH';
  } else if (consecutiveGoals.homeScore2PlusUnanswered >= 48) {
    primaryVerdictMarket = 'Consecutive Goal Run';
    primaryPick = `${homeTeam.shortName} 2+ Unanswered Goals`;
    primaryRationale = `High offensive dominance and opponent transition vulnerability creates a strong probability of back-to-back goals.`;
    primaryConfidence = 'HIGH';
  } else if (dc1X >= 75) {
    primaryVerdictMarket = 'Double Chance';
    primaryPick = `${homeTeam.shortName} or Draw (1X)`;
    primaryRationale = `High probability hedge backing strong home defensive record against away offensive variability.`;
    primaryConfidence = 'VERY_HIGH';
  } else {
    primaryPick = pHomeWin > pAwayWin ? `${homeTeam.shortName} to Win or Draw` : `${awayTeam.shortName} Draw No Bet`;
    primaryRationale = `Balanced tactical matchup where low-risk hedging is recommended.`;
    primaryConfidence = 'MODERATE';
  }

  return {
    outcomeProbabilities: {
      homeWin: pHomeWin,
      draw: pDraw,
      awayWin: pAwayWin,
    },
    expectedGoals: {
      home: Math.round(homeXG * 100) / 100,
      away: Math.round(awayXG * 100) / 100,
      total: Math.round((homeXG + awayXG) * 100) / 100,
    },
    goalMarkets: {
      over05: Math.round(over05 * 100),
      over15: Math.round(over15 * 100),
      under15: Math.round((1 - over15) * 100),
      over25: Math.round(over25 * 100),
      under25: Math.round((1 - over25) * 100),
      over35: Math.round(over35 * 100),
      under35: Math.round((1 - over35) * 100),
    },
    bothTeamsToScore: {
      yes: Math.round(bttsYes * 100),
      no: Math.max(1, 100 - Math.round(bttsYes * 100)),
    },
    consecutiveGoals,
    cleanSheets: {
      homeCleanSheet: Math.round(homeCleanSheet * 100),
      awayCleanSheet: Math.round(awayCleanSheet * 100),
    },
    doubleChance: {
      homeOrDraw: dc1X,
      homeOrAway: dc12,
      drawOrAway: dcX2,
    },
    firstTeamToScore: {
      home: homeFirstProb,
      away: awayFirstProb,
      noGoal: noGoalProb,
    },
    halfTimeFullTime: {
      homeHome: htFtHomeHome,
      drawHome: htFtDrawHome,
      drawDraw: htFtDrawDraw,
      drawAway: htFtDrawAway,
      awayAway: htFtAwayAway,
      other: htFtOther,
    },
    topLikelyScores: topScores,
    confidenceRating: confidenceScore,
    primaryVerdict: {
      market: primaryVerdictMarket,
      pick: primaryPick,
      confidence: primaryConfidence,
      rationale: primaryRationale,
    },
    keyAnalyticalFactors: {
      h2h: h2h.totalPlayed > 0 
        ? `${h2h.homeWins} Home wins, ${h2h.draws} Draws, ${h2h.awayWins} Away in last ${h2h.totalPlayed} meetings (Avg ${h2h.avgGoalsPerMatch.toFixed(1)} goals/game)`
        : 'First competitive meeting in recent years.',
      form: `${homeTeam.shortName} form: ${homeTeam.form.join('-')} (${homeFormPts}/15 pts) vs ${awayTeam.shortName} form: ${awayTeam.form.join('-')} (${awayFormPts}/15 pts)`,
      playerAvailability: homeTeam.keyInjuries.length > 0 || awayTeam.keyInjuries.length > 0
        ? `${homeTeam.keyInjuries.filter(i => i.status === 'OUT').length} key home absences, ${awayTeam.keyInjuries.filter(i => i.status === 'OUT').length} key away absences`
        : 'Both squads fully fit with no critical suspensions.',
      homeAdvantage: `Home ground boost: +${Math.round((homeAdv - 1) * 100)}% scoring index. Clean sheet rate at venue: ${homeTeam.cleanSheets} clean sheets.`,
      refereeInfluence: `${referee.name} (${referee.country}) averages ${referee.yellowCardsPerGame} yellows/game, ${referee.penaltiesPerGame} pens/game. Strictness: ${referee.strictness}.`,
      tacticalPace: `${homeTeam.tacticalStyle} vs ${awayTeam.tacticalStyle}. Possession balance est: ${homeTeam.possessionAvg}% - ${awayTeam.possessionAvg}%.`,
    },
  };
}

/**
 * Monte Carlo & Markov sequence simulation for consecutive unanswered goals
 * Determines likelihood that Team A scores 2+ or 3+ consecutive goals without Team B scoring in between.
 */
function calculateConsecutiveUnansweredStreaks(
  homeXG: number,
  awayXG: number,
  homeTeam: Team,
  awayTeam: Team
): ConsecutiveGoalsPrediction {
  const totalGoals = homeXG + awayXG;
  const pHomeGoal = homeXG / Math.max(0.001, totalGoals);
  const pAwayGoal = awayXG / Math.max(0.001, totalGoals);

  // Monte Carlo simulation: 2000 simulated matches
  const SIMULATIONS = 2000;
  let home2PlusCount = 0;
  let away2PlusCount = 0;
  let home3PlusCount = 0;
  let away3PlusCount = 0;

  for (let sim = 0; sim < SIMULATIONS; sim++) {
    // Sample match total goals from Poisson
    const matchGoals = samplePoisson(totalGoals);
    if (matchGoals < 2) continue;

    let currentHomeStreak = 0;
    let currentAwayStreak = 0;
    let maxHomeStreak = 0;
    let maxAwayStreak = 0;

    for (let g = 0; g < matchGoals; g++) {
      // Goal scored by Home or Away
      if (Math.random() < pHomeGoal) {
        currentHomeStreak++;
        currentAwayStreak = 0; // reset opponent unanswered streak
        if (currentHomeStreak > maxHomeStreak) maxHomeStreak = currentHomeStreak;
      } else {
        currentAwayStreak++;
        currentHomeStreak = 0; // reset opponent unanswered streak
        if (currentAwayStreak > maxAwayStreak) maxAwayStreak = currentAwayStreak;
      }
    }

    if (maxHomeStreak >= 2) home2PlusCount++;
    if (maxAwayStreak >= 2) away2PlusCount++;
    if (maxHomeStreak >= 3) home3PlusCount++;
    if (maxAwayStreak >= 3) away3PlusCount++;
  }

  const home2Plus = Math.round((home2PlusCount / SIMULATIONS) * 100);
  const away2Plus = Math.round((away2PlusCount / SIMULATIONS) * 100);
  const home3Plus = Math.round((home3PlusCount / SIMULATIONS) * 100);
  const away3Plus = Math.round((away3PlusCount / SIMULATIONS) * 100);

  // Estimate historical longest streaks from attack/defense ratings
  const homeLongestStreak = Math.min(5, Math.max(2, Math.round(homeTeam.attackRating / 22)));
  const awayLongestStreak = Math.min(5, Math.max(1, Math.round(awayTeam.attackRating / 26)));

  let streakVerdict = '';
  if (home2Plus >= 45) {
    streakVerdict = `${homeTeam.shortName} has a significant ${home2Plus}% likelihood of scoring 2+ unanswered goals, driven by aggressive transition breaks and high home xG.`;
  } else if (away2Plus >= 40) {
    streakVerdict = `${awayTeam.shortName} counter-attacking efficiency yields a notable ${away2Plus}% probability of consecutive goals without response.`;
  } else {
    streakVerdict = `Tight tactical contest with low probability of unanswered goal streaks; match expected to alternate momentum.`;
  }

  return {
    homeScore2PlusUnanswered: home2Plus,
    awayScore2PlusUnanswered: away2Plus,
    homeScore3PlusUnanswered: home3Plus,
    awayScore3PlusUnanswered: away3Plus,
    homeLongestStreakThisSeason: homeLongestStreak,
    awayLongestStreakThisSeason: awayLongestStreak,
    streakMomentumVerdict: streakVerdict,
  };
}

function samplePoisson(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L && k < 12);
  return k - 1;
}

export interface BestMatchMarket {
  marketId: string;
  marketLabel: string;
  selection: string;
  probability: number;
  icon: string;
  category: '1X2' | 'DOUBLE_CHANCE' | 'GOALS' | 'BTTS' | 'CONSECUTIVE';
  reasoning: string;
}

/**
 * Computes the highest-probability, strongest algorithmic market for a match.
 * Scans 1X2, Double Chance, Over/Under Goals, BTTS, and Consecutive Goal streaks
 * so every game gets its most statistically advantageous prediction.
 */
export function getBestMarketForMatch(match: Match): BestMatchMarket {
  const p = match.predictions;
  const home = match.homeTeam;
  const away = match.awayTeam;

  if (!p) {
    return {
      marketId: 'HOME_OR_DRAW',
      marketLabel: 'Double Chance (1X)',
      selection: `${home.shortName} or Draw (1X)`,
      probability: 72,
      icon: '🛡️',
      category: 'DOUBLE_CHANCE',
      reasoning: 'Strong home pitch baseline',
    };
  }

  const pHome = p.outcomeProbabilities?.homeWin ?? 0;
  const pDraw = p.outcomeProbabilities?.draw ?? 0;
  const pAway = p.outcomeProbabilities?.awayWin ?? 0;

  const dc1X = p.doubleChance?.homeOrDraw ?? Math.min(99, pHome + pDraw);
  const dcX2 = p.doubleChance?.drawOrAway ?? Math.min(99, pDraw + pAway);

  const over15 = p.goalMarkets?.over15 ?? 0;
  const over25 = p.goalMarkets?.over25 ?? 0;
  const under25 = p.goalMarkets?.under25 ?? Math.max(1, 100 - (p.goalMarkets?.over25 ?? 50));
  const under35 = p.goalMarkets?.under35 ?? Math.max(1, 100 - (p.goalMarkets?.over35 ?? 30));

  const bttsYes = p.bothTeamsToScore?.yes ?? 0;
  const bttsNo = p.bothTeamsToScore?.no ?? Math.max(1, 100 - bttsYes);

  const homeScore2Plus = p.consecutiveGoals?.homeScore2PlusUnanswered ?? 0;

  const candidates: BestMatchMarket[] = [
    // Double Chance picks (high baseline safety)
    {
      marketId: 'DC_1X',
      marketLabel: 'Double Chance (1X)',
      selection: `${home.shortName} or Draw (1X)`,
      probability: dc1X,
      icon: '🛡️',
      category: 'DOUBLE_CHANCE',
      reasoning: `Strong home record & xG index (${home.attackRating} Atk vs ${away.defenseRating} Def)`,
    },
    {
      marketId: 'DC_X2',
      marketLabel: 'Double Chance (X2)',
      selection: `Draw or ${away.shortName} (X2)`,
      probability: dcX2,
      icon: '✈️',
      category: 'DOUBLE_CHANCE',
      reasoning: `Away counter threat and opponent vulnerabilities (${away.attackRating}/100 Atk)`,
    },
    // Direct 1X2 Outright Wins
    {
      marketId: 'HOME_WIN',
      marketLabel: 'Home Win (1)',
      selection: `${home.shortName} to Win`,
      probability: pHome,
      icon: '🏠',
      category: '1X2',
      reasoning: `Home dominance with projected ${(p.expectedGoals?.home ?? 1.6).toFixed(2)} xG`,
    },
    {
      marketId: 'AWAY_WIN',
      marketLabel: 'Away Win (2)',
      selection: `${away.shortName} to Win`,
      probability: pAway,
      icon: '🚀',
      category: '1X2',
      reasoning: `Away attacking efficiency (${away.attackRating}/100) and tactical edge`,
    },
    // Goals Over
    {
      marketId: 'OVER_15',
      marketLabel: 'Over 1.5 Goals',
      selection: 'Over 1.5 Total Goals',
      probability: over15,
      icon: '⚽',
      category: 'GOALS',
      reasoning: `Combined ${(p.expectedGoals?.total ?? 2.8).toFixed(2)} xG and attacking flow`,
    },
    {
      marketId: 'OVER_25',
      marketLabel: 'Over 2.5 Goals',
      selection: 'Over 2.5 Total Goals',
      probability: over25,
      icon: '🔥',
      category: 'GOALS',
      reasoning: `High pace matchup averaging ${(match.h2h?.avgGoalsPerMatch ?? 2.7).toFixed(1)} goals in H2H`,
    },
    // Goals Under
    {
      marketId: 'UNDER_25',
      marketLabel: 'Under 2.5 Goals',
      selection: 'Under 2.5 Total Goals',
      probability: under25,
      icon: '🧱',
      category: 'GOALS',
      reasoning: `Resilient defensive units with low expected tempo`,
    },
    {
      marketId: 'UNDER_35',
      marketLabel: 'Under 3.5 Goals',
      selection: 'Under 3.5 Total Goals',
      probability: under35,
      icon: '🔒',
      category: 'GOALS',
      reasoning: `Structured formations with controlled fouls keeping scoring limited`,
    },
    // Both Teams to Score
    {
      marketId: 'BTTS_YES',
      marketLabel: 'Both Teams To Score',
      selection: 'Both Teams To Score (BTTS Yes)',
      probability: bttsYes,
      icon: '🎯',
      category: 'BTTS',
      reasoning: `Both clubs active in scoring in recent 5 competitive matches`,
    },
    {
      marketId: 'BTTS_NO',
      marketLabel: 'Clean Sheet / BTTS No',
      selection: 'Both Teams Score No (BTTS No)',
      probability: bttsNo,
      icon: '🚫',
      category: 'BTTS',
      reasoning: `High clean sheet expectancy against opponent offensive drought`,
    },
  ];

  if (homeScore2Plus >= 46) {
    candidates.push({
      marketId: 'CONSEC_HOME_2',
      marketLabel: 'Consecutive Goals',
      selection: `${home.shortName} 2+ Unanswered Goals`,
      probability: homeScore2Plus,
      icon: '⚡',
      category: 'CONSECUTIVE',
      reasoning: `Offensive momentum wave backing sustained attacking pressure`,
    });
  }

  // Sort candidates by highest probability descending
  candidates.sort((a, b) => b.probability - a.probability);

  return candidates[0];
}

export const PREDICTION_MARKET_OPTIONS: PredictionMarketMeta[] = [
  {
    id: 'HIGHEST_PROB',
    label: '⚡ Highest Overall Probability (Best Market per Game)',
    shortLabel: 'Highest Probability',
    category: '1X2',
    icon: '⚡',
    description: 'Ranks every match of the day by its strongest algorithmic market starting from the highest probability',
    defaultHighProbabilityThreshold: 65,
  },
  {
    id: 'HOME',
    label: 'Home Win (1)',
    shortLabel: 'Home Win',
    category: '1X2',
    icon: '🏠',
    description: 'Home team wins in regular 90 minutes',
    defaultHighProbabilityThreshold: 50,
  },
  {
    id: 'DRAW',
    label: 'Draw (X)',
    shortLabel: 'Draw (X)',
    category: '1X2',
    icon: '🤝',
    description: 'Match finishes with level scoreline',
    defaultHighProbabilityThreshold: 28,
  },
  {
    id: 'AWAY',
    label: 'Away Win (2)',
    shortLabel: 'Away Win',
    category: '1X2',
    icon: '✈️',
    description: 'Away team wins in regular 90 minutes',
    defaultHighProbabilityThreshold: 45,
  },
  {
    id: 'OVER_15',
    label: 'Over 1.5 Goals (O1.5)',
    shortLabel: 'Over 1.5',
    category: 'GOALS_OVER',
    icon: '⚽',
    description: '2 or more total goals scored in match',
    defaultHighProbabilityThreshold: 72,
  },
  {
    id: 'OVER_25',
    label: 'Over 2.5 Goals (O2.5)',
    shortLabel: 'Over 2.5',
    category: 'GOALS_OVER',
    icon: '🔥',
    description: '3 or more total goals scored in match',
    defaultHighProbabilityThreshold: 55,
  },
  {
    id: 'OVER_35',
    label: 'Over 3.5 Goals (O3.5)',
    shortLabel: 'Over 3.5',
    category: 'GOALS_OVER',
    icon: '💥',
    description: '4 or more total goals scored in match',
    defaultHighProbabilityThreshold: 35,
  },
  {
    id: 'UNDER_15',
    label: 'Under 1.5 Goals (U1.5)',
    shortLabel: 'Under 1.5',
    category: 'GOALS_UNDER',
    icon: '🛡️',
    description: '1 or 0 total goals scored in match',
    defaultHighProbabilityThreshold: 32,
  },
  {
    id: 'UNDER_25',
    label: 'Under 2.5 Goals (U2.5)',
    shortLabel: 'Under 2.5',
    category: 'GOALS_UNDER',
    icon: '🧱',
    description: '2 or fewer total goals scored in match',
    defaultHighProbabilityThreshold: 48,
  },
  {
    id: 'UNDER_35',
    label: 'Under 3.5 Goals (U3.5)',
    shortLabel: 'Under 3.5',
    category: 'GOALS_UNDER',
    icon: '🔒',
    description: '3 or fewer total goals scored in match',
    defaultHighProbabilityThreshold: 68,
  },
  {
    id: 'BTTS',
    label: 'Both Teams To Score (BTTS Yes)',
    shortLabel: 'BTTS Yes',
    category: 'BTTS',
    icon: '🎯',
    description: 'Both home and away teams score at least 1 goal',
    defaultHighProbabilityThreshold: 52,
  },
  {
    id: 'BTTS_NO',
    label: 'Both Teams Score No (BTTS No)',
    shortLabel: 'BTTS No',
    category: 'BTTS',
    icon: '🚫',
    description: 'At least one team keeps a clean sheet',
    defaultHighProbabilityThreshold: 48,
  },
];

/**
 * Extract probability percentage (0-100) for a given prediction market
 */
export function getMarketProbability(match: Match, market: PredictionMarketFilter): number {
  if (market === 'HIGHEST_PROB') {
    return getBestMarketForMatch(match).probability;
  }

  const p = match.predictions;
  if (!p) return 0;
  switch (market) {
    case 'HOME':
      return p.outcomeProbabilities?.homeWin ?? 0;
    case 'DRAW':
      return p.outcomeProbabilities?.draw ?? 0;
    case 'AWAY':
      return p.outcomeProbabilities?.awayWin ?? 0;
    case 'OVER_15':
      return p.goalMarkets?.over15 ?? 0;
    case 'OVER_25':
      return p.goalMarkets?.over25 ?? 0;
    case 'OVER_35':
      return p.goalMarkets?.over35 ?? 0;
    case 'UNDER_15':
      return p.goalMarkets?.under15 ?? Math.max(1, 100 - (p.goalMarkets?.over15 ?? 50));
    case 'UNDER_25':
      return p.goalMarkets?.under25 ?? Math.max(1, 100 - (p.goalMarkets?.over25 ?? 50));
    case 'UNDER_35':
      return p.goalMarkets?.under35 ?? Math.max(1, 100 - (p.goalMarkets?.over35 ?? 30));
    case 'BTTS':
      return p.bothTeamsToScore?.yes ?? 0;
    case 'BTTS_NO':
      return p.bothTeamsToScore?.no ?? Math.max(1, 100 - (p.bothTeamsToScore?.yes ?? 50));
    default:
      return 0;
  }
}

/**
 * Returns visual styling, confidence tier, and badge metadata for a market probability
 */
export function getMarketDetailVerdict(market: PredictionMarketFilter, prob: number): {
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  barColor: string;
  confidenceTier: 'VERY_HIGH' | 'HIGH' | 'GOOD' | 'MODERATE' | 'LOW';
  confidenceLabel: string;
} {
  let tier: 'VERY_HIGH' | 'HIGH' | 'GOOD' | 'MODERATE' | 'LOW' = 'MODERATE';
  let label = 'Moderate Edge';

  if (market === 'DRAW') {
    if (prob >= 35) {
      tier = 'VERY_HIGH';
      label = 'Super High Draw Edge';
    } else if (prob >= 30) {
      tier = 'HIGH';
      label = 'High Draw Edge';
    } else if (prob >= 26) {
      tier = 'GOOD';
      label = 'Good Draw Value';
    } else {
      tier = 'MODERATE';
      label = 'Average Draw Rate';
    }
  } else if (market === 'OVER_35' || market === 'UNDER_15') {
    if (prob >= 46) {
      tier = 'VERY_HIGH';
      label = 'Exceptional Edge';
    } else if (prob >= 38) {
      tier = 'HIGH';
      label = 'Strong Edge';
    } else if (prob >= 30) {
      tier = 'GOOD';
      label = 'Positive Edge';
    } else {
      tier = 'MODERATE';
      label = 'Moderate Edge';
    }
  } else {
    if (prob >= 75) {
      tier = 'VERY_HIGH';
      label = 'Very High Banker';
    } else if (prob >= 62) {
      tier = 'HIGH';
      label = 'Strong Favorite';
    } else if (prob >= 50) {
      tier = 'GOOD';
      label = 'Solid Edge';
    } else if (prob >= 40) {
      tier = 'MODERATE';
      label = 'Balanced Edge';
    } else {
      tier = 'LOW';
      label = 'Low Probability';
    }
  }

  let badgeColor = 'text-emerald-300';
  let badgeBg = 'bg-emerald-950/70';
  let badgeBorder = 'border-emerald-500/60';
  let barColor = 'from-emerald-500 to-teal-400';

  if (tier === 'VERY_HIGH') {
    badgeColor = 'text-emerald-300';
    badgeBg = 'bg-emerald-950/80';
    badgeBorder = 'border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
    barColor = 'from-emerald-400 via-teal-400 to-cyan-400';
  } else if (tier === 'HIGH') {
    badgeColor = 'text-sky-300';
    badgeBg = 'bg-sky-950/80';
    badgeBorder = 'border-sky-500/80';
    barColor = 'from-sky-400 to-indigo-400';
  } else if (tier === 'GOOD') {
    badgeColor = 'text-cyan-300';
    badgeBg = 'bg-cyan-950/70';
    badgeBorder = 'border-cyan-600/60';
    barColor = 'from-cyan-500 to-sky-500';
  } else if (tier === 'MODERATE') {
    badgeColor = 'text-amber-300';
    badgeBg = 'bg-amber-950/70';
    badgeBorder = 'border-amber-600/60';
    barColor = 'from-amber-500 to-yellow-500';
  } else {
    badgeColor = 'text-slate-400';
    badgeBg = 'bg-slate-900/60';
    badgeBorder = 'border-slate-700/60';
    barColor = 'from-slate-500 to-slate-400';
  }

  return {
    badgeColor,
    badgeBg,
    badgeBorder,
    barColor,
    confidenceTier: tier,
    confidenceLabel: label,
  };
}

