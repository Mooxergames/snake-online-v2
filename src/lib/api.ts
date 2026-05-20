/**
 * Snake Online Rankings API client.
 *
 * Uses the new paginated rankings endpoints at api.snakeonline.io.
 * Responses are cached server-side (5min) and client-side via Next.js revalidate.
 */

const API_BASE = (
  process.env.RANKINGS_API_BASE
  || 'https://api.snakeonline.io/api/rankings'
).replace(/\/$/, '');

const REVALIDATE_S = 300; // match backend s-maxage

export type SortField = 'trophy' | 'totalScore' | 'bestScore' | 'totalkills' | 'bestKills' | 'gamePlayed';

export interface PlayerRanking {
  rank: number;
  playerName: string;
  playerId: string;
  trophy: number;
  totalScore: number;
  bestScore: number;
  gamePlayed: number;
  totalkills: number;
  bestKills: number;
  bestSurvivalTime: number;
  location: string;
  selectedAvatar: string;
  selectedSnake: string;
  selectedFlag: string;
  badgeName: string;
  avatarUrl: string | null;
  snakeUrl: string | null;
  flagUrl: string | null;
}

export interface CountryEntry {
  country: string;
  playerCount: number;
}

export interface RankingsResponse<T> {
  success: boolean;
  data: T;
}

interface RankingsData {
  rankings: PlayerRanking[];
  total: number;
  limit: number;
  offset: number;
  sort: string;
  country: string | null;
  updatedAt: string;
}

interface CountriesData {
  countries: CountryEntry[];
  total: number;
  updatedAt: string;
}

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, {
      next: { revalidate: REVALIDATE_S },
      headers: { Accept: 'application/json' },
    });
    if (!r.ok) return null;
    const json = await r.json() as { success: boolean; data: T };
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function getGlobalRankings(limit = 50, offset = 0, sort: SortField = 'trophy') {
  const data = await fetchJSON<RankingsData>(
    `${API_BASE}/global?sort=${sort}&limit=${limit}&offset=${offset}`
  );
  if (!data) return null;
  return {
    success: true as const,
    data: {
      rankings: data.rankings,
      total: data.total,
      updatedAt: data.updatedAt,
    },
  };
}

export async function getCountryList() {
  const data = await fetchJSON<CountriesData>(`${API_BASE}/countries`);
  if (!data) return null;
  return {
    success: true as const,
    data: {
      availableCountries: data.countries,
      updatedAt: data.updatedAt,
    },
  };
}

export async function getLocalRankings(country: string, limit = 50, offset = 0, sort: SortField = 'trophy') {
  const data = await fetchJSON<RankingsData>(
    `${API_BASE}/country/${encodeURIComponent(country.toUpperCase())}?sort=${sort}&limit=${limit}&offset=${offset}`
  );
  if (!data) return null;
  return {
    success: true as const,
    data: {
      rankings: data.rankings,
      country: data.country ?? country.toUpperCase(),
      total: data.total,
      updatedAt: data.updatedAt,
    },
  };
}

export async function getOverview() {
  const [global, countries] = await Promise.all([
    getGlobalRankings(10),
    getCountryList(),
  ]);
  if (!global || !countries) return null;
  return {
    success: true,
    data: {
      global: { rankings: global.data.rankings, total: global.data.total },
      local: { availableCountries: countries.data.availableCountries },
      updatedAt: global.data.updatedAt,
    },
  };
}
