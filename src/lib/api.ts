const API_BASE = process.env.BACKEND_API_BASE || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

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
  location: string;
  selectedAvatar: string;
  selectedSnake: string;
  selectedFlag: string;
  badgeName: string;
}

export interface RankingsResponse<T> {
  success: boolean;
  data: T;
}

export interface CountryEntry { country: string; playerCount: number; }

async function safeFetch<T>(url: string, revalidate = 300): Promise<T | null> {
  try {
    const r = await fetch(url, { next: { revalidate } });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export async function getGlobalRankings(limit = 50) {
  return safeFetch<RankingsResponse<{ rankings: PlayerRanking[]; total: number; updatedAt: string }>>(
    `${API_BASE}/public/rankings/global?limit=${limit}`
  );
}

export async function getCountryList() {
  return safeFetch<RankingsResponse<{ availableCountries: CountryEntry[]; updatedAt: string }>>(
    `${API_BASE}/public/rankings/local`
  );
}

export async function getLocalRankings(country: string, limit = 50) {
  return safeFetch<RankingsResponse<{ rankings: PlayerRanking[]; country: string; total: number; updatedAt: string }>>(
    `${API_BASE}/public/rankings/local/${encodeURIComponent(country)}?limit=${limit}`
  );
}

export async function getOverview() {
  return safeFetch<RankingsResponse<{
    global: { rankings: PlayerRanking[]; total: number };
    local: { availableCountries: CountryEntry[] };
    updatedAt: string;
  }>>(`${API_BASE}/public/rankings?limit=10`);
}
