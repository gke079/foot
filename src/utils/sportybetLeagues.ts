/**
 * SportyBet-style League Hierarchy, Grouping, and Formatting
 * Aligns league nomenclature and priorities with SportyBet football sportsbook.
 */

import { Competition } from '../types/football';

export interface SportyBetLeagueInfo {
  category: string;
  country: string;
  leagueName: string;
  displayName: string; // e.g. "England · Premier League"
  flag: string;
  isTopLeague: boolean;
}

export const SPORTYBET_TOP_LEAGUE_IDS = [
  'pl',
  'laliga',
  'seriea',
  'bundesliga',
  'ligue1',
  'ucl',
  'uel',
  'uecl',
  'facup',
  'champ',
  'carabao',
  'saudi',
  'primeira',
  'eredivisie',
  'superlig',
  'mls',
  'ligamx',
  'brazil_b',
  'argentina',
];

export const SPORTYBET_LEAGUE_MAP: Record<string, { country: string; name: string; flag: string; isTop?: boolean }> = {
  // England
  'pl': { country: 'England', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', isTop: true },
  'champ': { country: 'England', name: 'Championship', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', isTop: true },
  'facup': { country: 'England', name: 'FA Cup', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', isTop: true },
  'carabao': { country: 'England', name: 'EFL Cup', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', isTop: true },
  'natleague': { country: 'England', name: 'National League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  'wsl': { country: 'England', name: "Women's Super League", flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },

  // Spain
  'laliga': { country: 'Spain', name: 'LaLiga', flag: '🇪🇸', isTop: true },
  'segunda': { country: 'Spain', name: 'LaLiga 2', flag: '🇪🇸' },
  'copadelrey': { country: 'Spain', name: 'Copa del Rey', flag: '🇪🇸' },
  'ligaf': { country: 'Spain', name: 'Liga F', flag: '🇪🇸' },

  // Italy
  'seriea': { country: 'Italy', name: 'Serie A', flag: '🇮🇹', isTop: true },
  'serieb': { country: 'Italy', name: 'Serie B', flag: '🇮🇹' },
  'coppaitalia': { country: 'Italy', name: 'Coppa Italia', flag: '🇮🇹' },

  // Germany
  'bundesliga': { country: 'Germany', name: 'Bundesliga', flag: '🇩🇪', isTop: true },
  'bundesliga2': { country: 'Germany', name: '2. Bundesliga', flag: '🇩🇪' },
  'dfbpokal': { country: 'Germany', name: 'DFB-Pokal', flag: '🇩🇪' },

  // France
  'ligue1': { country: 'France', name: 'Ligue 1', flag: '🇫🇷', isTop: true },
  'ligue2': { country: 'France', name: 'Ligue 2', flag: '🇫🇷' },
  'coupefrance': { country: 'France', name: 'Coupe de France', flag: '🇫🇷' },
  'premiere_ligue_fr': { country: 'France', name: 'Première Ligue', flag: '🇫🇷' },

  // International Clubs (UEFA / Continental)
  'ucl': { country: 'International Clubs', name: 'UEFA Champions League', flag: '🏆', isTop: true },
  'uel': { country: 'International Clubs', name: 'UEFA Europa League', flag: '🏆', isTop: true },
  'uecl': { country: 'International Clubs', name: 'UEFA Conference League', flag: '🏆', isTop: true },
  'uwcl': { country: 'International Clubs', name: "UEFA Women's Champions League", flag: '🏆' },
  'leagues_cup': { country: 'International Clubs', name: 'Leagues Cup', flag: '🌎' },

  // Europe Domestic
  'eredivisie': { country: 'Netherlands', name: 'Eredivisie', flag: '🇳🇱', isTop: true },
  'eerste': { country: 'Netherlands', name: 'Keuken Kampioen Divisie', flag: '🇳🇱' },
  'primeira': { country: 'Portugal', name: 'Primeira Liga', flag: '🇵🇹', isTop: true },
  'superlig': { country: 'Turkey', name: 'Süper Lig', flag: '🇹🇷', isTop: true },
  'scotland': { country: 'Scotland', name: 'Premiership', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  'scot_champ': { country: 'Scotland', name: 'Championship', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  'belgium': { country: 'Belgium', name: 'Pro League', flag: '🇧🇪' },
  'austria': { country: 'Austria', name: 'Bundesliga', flag: '🇦🇹' },
  'allsvenskan': { country: 'Sweden', name: 'Allsvenskan', flag: '🇸🇪' },
  'eliteserien': { country: 'Norway', name: 'Eliteserien', flag: '🇳🇴' },
  'superliga_dk': { country: 'Denmark', name: 'Superliga', flag: '🇩🇰' },
  'greece': { country: 'Greece', name: 'Super League', flag: '🇬🇷' },

  // Americas
  'mls': { country: 'USA', name: 'Major League Soccer', flag: '🇺🇸', isTop: true },
  'nwsl': { country: 'USA', name: 'NWSL', flag: '🇺🇸' },
  'usl': { country: 'USA', name: 'USL Championship', flag: '🇺🇸' },
  'ligamx': { country: 'Mexico', name: 'Liga MX', flag: '🇲🇽', isTop: true },
  'argentina': { country: 'Argentina', name: 'Liga Profesional', flag: '🇦🇷', isTop: true },
  'brazil_b': { country: 'Brazil', name: 'Brasileirão Série A', flag: '🇧🇷', isTop: true },
  'brazil_cup': { country: 'Brazil', name: 'Copa do Brasil', flag: '🇧🇷' },
  'colombia': { country: 'Colombia', name: 'Primera A', flag: '🇨🇴' },
  'chile': { country: 'Chile', name: 'Primera División', flag: '🇨🇱' },

  // Middle East & Africa & Asia
  'saudi': { country: 'Saudi Arabia', name: 'Saudi Pro League', flag: '🇸🇦', isTop: true },
  'jleague': { country: 'Japan', name: 'J1 League', flag: '🇯🇵' },
  'aleague': { country: 'Australia', name: 'A-League', flag: '🇦🇺' },
  'kenya': { country: 'Kenya', name: 'FKF Premier League', flag: '🇰🇪', isTop: true },
  'nigeria': { country: 'Nigeria', name: 'NPFL', flag: '🇳🇬', isTop: true },
  'south_africa': { country: 'South Africa', name: 'PSL Premiership', flag: '🇿🇦', isTop: true },

  // International
  'worldcup': { country: 'International', name: 'FIFA World Cup', flag: '🌍' },
  'unl': { country: 'International', name: 'UEFA Nations League', flag: '🇪🇺' },
  'friendly_m': { country: 'International', name: 'International Friendly', flag: '🌍' },
};

/**
 * Returns clean SportyBet league title info
 */
export function getSportyBetLeagueInfo(comp: Competition): SportyBetLeagueInfo {
  const compId = comp.id.toLowerCase();
  const known = SPORTYBET_LEAGUE_MAP[compId];

  if (known) {
    return {
      category: known.country,
      country: known.country,
      leagueName: known.name,
      displayName: `${known.country} · ${known.name}`,
      flag: known.flag || comp.flag || '⚽',
      isTopLeague: Boolean(known.isTop),
    };
  }

  // Format generic competitions: e.g. "Spain - LaLiga"
  const country = comp.country || 'International';
  const name = comp.name;
  return {
    category: country,
    country,
    leagueName: name,
    displayName: `${country} · ${name}`,
    flag: comp.flag || '⚽',
    isTopLeague: comp.category === 'Popular',
  };
}

/**
 * Sort priority in SportyBet order
 */
export function getSportyBetSortRank(compId: string, compName: string): number {
  const id = compId.toLowerCase();
  const idx = SPORTYBET_TOP_LEAGUE_IDS.indexOf(id);
  if (idx !== -1) return idx;

  const lowerName = compName.toLowerCase();
  if (lowerName.includes('premier league') || lowerName.includes('epl')) return 0;
  if (lowerName.includes('laliga') || lowerName.includes('la liga')) return 1;
  if (lowerName.includes('serie a')) return 2;
  if (lowerName.includes('bundesliga')) return 3;
  if (lowerName.includes('ligue 1')) return 4;
  if (lowerName.includes('champions league')) return 5;
  if (lowerName.includes('europa league')) return 6;
  if (lowerName.includes('fa cup')) return 8;

  return 100;
}

/**
 * Converts win probability (0-100) to implied decimal odds format (e.g. 1.85)
 * common in SportyBet sportsbook
 */
export function probToOdds(prob: number): string {
  if (!prob || prob <= 0) return '—';
  // Include standard ~5% sportsbook margin adjustment
  const decimalOdds = 100 / Math.max(prob, 1);
  return decimalOdds.toFixed(2);
}
