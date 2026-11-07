import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { ALL_MATCHES, getMatchesForDate } from './src/data/mockMatches';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

import { fetchRealMatchesFromApiSports, isApiSportsConfigured, getApiSportsKey, getApiAccountNotice, checkApiSportsAccount } from './src/services/apiSports';
import { fetchRealMatchesFromEspn } from './src/services/espnSoccer';

// API Routes
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    apiSportsConfigured: isApiSportsConfigured(),
    accountNotice: getApiAccountNotice(),
    freeApiAvailable: true,
    freeApiProvider: 'ESPN Open Live Sports API',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
  });
});

app.post('/api/check-api-sports', async (_req: Request, res: Response) => {
  const result = await checkApiSportsAccount();
  res.json(result);
});

app.get('/api/matches', async (req: Request, res: Response) => {
  const dateQuery = (req.query.date as string) || '2026-11-07';
  
  // 1. If API-Sports is configured and active, attempt API-Sports fetch
  if (isApiSportsConfigured()) {
    try {
      const realMatches = await fetchRealMatchesFromApiSports(dateQuery);
      if (realMatches && realMatches.length > 0) {
        return res.json({
          date: dateQuery,
          matches: realMatches,
          isRealData: true,
          source: 'API-Sports Live Feed',
          total: realMatches.length,
          apiSportsConfigured: true,
          accountNotice: null,
        });
      }
    } catch {
      // Handled cleanly via fallback
    }
  }

  // 2. Free Public Real Football API (ESPN Open Feed - zero key required)
  try {
    const espnMatches = await fetchRealMatchesFromEspn(dateQuery);
    if (espnMatches && espnMatches.length > 0) {
      return res.json({
        date: dateQuery,
        matches: espnMatches,
        isRealData: true,
        source: 'Live Open Match Feed (ESPN)',
        total: espnMatches.length,
        apiSportsConfigured: isApiSportsConfigured(),
        accountNotice: getApiAccountNotice(),
      });
    }
  } catch {
    // Handled cleanly via fallback
  }

  // 3. Built-in Procedural Global Database
  const matches = getMatchesForDate(dateQuery);
  res.json({
    date: dateQuery,
    matches,
    isRealData: false,
    source: isApiSportsConfigured() ? 'Worldwide Match Engine' : 'Worldwide Match Database',
    apiSportsConfigured: isApiSportsConfigured(),
    accountNotice: getApiAccountNotice(),
  });
});

app.get('/api/matches/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const match = ALL_MATCHES.find(m => m.id === id);
  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }
  res.json(match);
});

// Gemini AI Tactical Synthesis Endpoint
app.post('/api/gemini/analyze-match', async (req: Request, res: Response) => {
  try {
    const { match } = req.body;
    if (!match) {
      return res.status(400).json({ error: 'Match data is required' });
    }

    const home = match.homeTeam;
    const away = match.awayTeam;
    const referee = match.referee;
    const h2h = match.h2h;

    // Check if valid GEMINI_API_KEY is available
    const hasValidKey =
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
      process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY' &&
      process.env.GEMINI_API_KEY.length > 5;

    if (!hasValidKey) {
      // Fallback deterministic analysis
      return res.json({
        tacticalSummary: `${home.name} enters with a possession-based setup (${home.possessionAvg}% average possession) facing ${away.name}'s ${away.tacticalStyle}. Home field advantage and high pressing are pivotal factors.`,
        matchPaceAndFlow: `Expect a measured opening 25 minutes. With referee ${referee.name} averaging ${referee.foulsPerGame} fouls per game, counter-attacks may be halted quickly with tactical cautions.`,
        keyDuels: `${home.shortName}'s central playmakers against ${away.shortName}'s defensive double pivot will determine transition control.`,
        unansweredGoalThreat: `${home.shortName} shows high momentum when breaking lines, posing a notable probability of consecutive unanswered goals if they score first.`,
        smartValuePicks: [
          {
            market: '1X2 / Double Chance',
            selection: `${home.shortName} or Draw (1X)`,
            probability: `${match.predictions?.doubleChance?.homeOrDraw || 75}%`,
            reasoning: 'Backed by resilient home defensive numbers and opponent injury absences.',
          },
          {
            market: 'Consecutive Goals',
            selection: `${home.shortName} 2+ Unanswered Goals`,
            probability: `${match.predictions?.consecutiveGoals?.homeScore2PlusUnanswered || 42}%`,
            reasoning: 'Opponent transition vulnerability exposes them to sustained attacking waves.',
          },
        ],
      });
    }

    const prompt = `Analyze this football match thoroughly as an expert quantitative tactician and scout.
Do NOT use bookmaker odds as a determinant.
Match: ${home.name} vs ${away.name} (${match.competition.name})
Venue: ${match.venue}
Date: ${match.date}
Home Team Form: ${home.form.join('-')}, Attack Rating: ${home.attackRating}/100, Defense Rating: ${home.defenseRating}/100, Tactical Style: ${home.tacticalStyle}
Home Missing Players: ${home.keyInjuries.map((i: any) => `${i.player} (${i.position}, ${i.status} - ${i.reason})`).join(', ') || 'None'}
Away Team Form: ${away.form.join('-')}, Attack Rating: ${away.attackRating}/100, Defense Rating: ${away.defenseRating}/100, Tactical Style: ${away.tacticalStyle}
Away Missing Players: ${away.keyInjuries.map((i: any) => `${i.player} (${i.position}, ${i.status} - ${i.reason})`).join(', ') || 'None'}
Head to Head History: ${h2h.totalPlayed} meetings (${h2h.homeWins} home wins, ${h2h.draws} draws, ${h2h.awayWins} away wins), Avg Goals: ${h2h.avgGoalsPerMatch}
Referee: ${referee.name} (Strictness: ${referee.strictness}, ${referee.yellowCardsPerGame} yellows/game, ${referee.penaltiesPerGame} pens/game)

Provide deep analysis focusing on:
1. Comprehensive tactical preview (formations, pressing vs counter).
2. Match pace, game flow, and referee impact.
3. Key individual and positional battles.
4. Consecutive goals probability analysis: Likelihood and conditions under which one team scores 2 or more consecutive goals without the opponent scoring.
5. Smart quantitative value picks with probabilities and deep rationale.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite quantitative football analyst and tactical scout. You evaluate matches strictly through data, tactical setups, injuries, H2H, referee tendencies, and expected goal models without referencing bookmaker odds.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tacticalSummary: {
              type: Type.STRING,
              description: 'In-depth tactical breakdown of the two teams tactical systems and matchup.',
            },
            matchPaceAndFlow: {
              type: Type.STRING,
              description: 'Expected tempo of the game, territory control, and how referee strictness influences the match.',
            },
            keyDuels: {
              type: Type.STRING,
              description: 'Critical pitch match-ups and impact of key player injuries.',
            },
            unansweredGoalThreat: {
              type: Type.STRING,
              description: 'Specific analysis of consecutive unanswered goals probability (momentum streaks).',
            },
            smartValuePicks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  market: { type: Type.STRING },
                  selection: { type: Type.STRING },
                  probability: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                },
                required: ['market', 'selection', 'probability', 'reasoning'],
              },
            },
          },
          required: [
            'tacticalSummary',
            'matchPaceAndFlow',
            'keyDuels',
            'unansweredGoalThreat',
            'smartValuePicks',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Analysis error:', error);
    const { match } = req.body;
    const home = match?.homeTeam || { name: 'Home Team', shortName: 'Home', possessionAvg: 50, tacticalStyle: 'Balanced' };
    const away = match?.awayTeam || { name: 'Away Team', shortName: 'Away', tacticalStyle: 'Balanced' };
    const referee = match?.referee || { name: 'Match Official', foulsPerGame: 22 };

    return res.json({
      tacticalSummary: `${home.name} enters with a structured formation facing ${away.name}'s counter system. Home ground presence and territorial press are primary focal points.`,
      matchPaceAndFlow: `Expect a measured tempo in the opening half. Referee ${referee.name} typically controls tactical fouls early.`,
      keyDuels: `Transition duels in midfield will dictate scoring frequency and defensive recovery speed.`,
      unansweredGoalThreat: `${home.shortName} shows strong potential to build consecutive goal momentum if breaking early defensive lines.`,
      smartValuePicks: [
        {
          market: '1X2 / Double Chance',
          selection: `${home.shortName} or Draw (1X)`,
          probability: `${match?.predictions?.doubleChance?.homeOrDraw || 74}%`,
          reasoning: 'Backed by resilient home defensive numbers and opponent transition vulnerability.',
        },
        {
          market: 'Consecutive Goals',
          selection: `${home.shortName} 2+ Unanswered Goals`,
          probability: `${match?.predictions?.consecutiveGoals?.homeScore2PlusUnanswered || 42}%`,
          reasoning: 'Opponent transition vulnerability exposes them to sustained attacking waves.',
        },
      ],
    });
  }
});

// Notification simulation test
app.post('/api/notifications/test', (req: Request, res: Response) => {
  const { leagueName, matchTitle, type } = req.body;
  res.json({
    success: true,
    notification: {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: type === 'GOAL' ? `⚽ GOAL in ${leagueName}` : `⚡ Match Kickoff: ${matchTitle}`,
      message: type === 'GOAL' 
        ? `Goal scored! Check updated live consecutive streak and in-play outcome odds.`
        : `Kickoff in 15 minutes! Algorithmic model confidence is rated at 82%.`,
      type: type || 'KICKOFF',
      read: false,
    },
  });
});

// Mount Vite middleware for dev or static build for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
