/**
 * Snake Online backend client.
 *
 * The production backend (backend.snakeonline.net) exposes a single endpoint:
 *   GET /players  → returns the full player document array (~11K records, ~11MB)
 *
 * Query-string filtering / sorting / paginating is NOT supported server-side;
 * every variant returns the same full dump. So we fetch once, cache the result
 * for `REVALIDATE_S` seconds via Next.js's fetch-cache, then sort + slice +
 * filter in-memory.
 *
 * Public shape (`{success, data: …}`) is preserved so existing consumers
 * (game-ranking page, lib/seo, etc.) don't need to change.
 */

const RAW_BASE = process.env.BACKEND_API_BASE
  || process.env.NEXT_PUBLIC_API_BASE
  || 'https://backend.snakeonline.net';
const API_BASE = RAW_BASE.replace(/\/$/, '');

const REVALIDATE_S = 600; // 10 min — backend dump is heavy, refresh sparingly.

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

export interface CountryEntry {
  country: string;
  playerCount: number;
}

// Raw shape from /players (only the fields we read).
type RawPlayer = {
  playerId?: string;
  playerName?: string;
  trophy?: number;
  totalScore?: number;
  bestScore?: number;
  gamePlayed?: number;
  totalkills?: number;
  bestKills?: number;
  location?: string | null;
  selectedAvatar?: string;
  selectedSnake?: string;
  selectedFlag?: string;
  badgeName?: string;
  updatedAt?: string;
};

function toPlayerRanking(rank: number, p: RawPlayer): PlayerRanking {
  return {
    rank,
    playerName: p.playerName ?? 'Anonymous',
    playerId: p.playerId ?? '',
    trophy: p.trophy ?? 0,
    totalScore: p.totalScore ?? 0,
    bestScore: p.bestScore ?? 0,
    gamePlayed: p.gamePlayed ?? 0,
    totalkills: p.totalkills ?? 0,
    bestKills: p.bestKills ?? 0,
    location: p.location ?? '',
    selectedAvatar: p.selectedAvatar ?? 'AVATAR_01',
    selectedSnake: p.selectedSnake ?? 'FSNAKE_01',
    selectedFlag: p.selectedFlag ?? '',
    badgeName: p.badgeName ?? 'BADGE_1',
  };
}

/**
 * Single source of truth — fetched once per request scope and per
 * `REVALIDATE_S` window, then sorted by trophy DESC.
 */
async function fetchSortedPlayers(): Promise<RawPlayer[]> {
  try {
    const r = await fetch(`${API_BASE}/players`, {
      next: { revalidate: REVALIDATE_S },
      headers: { 'Accept': 'application/json' },
    });
    if (!r.ok) return [];
    const arr = (await r.json()) as RawPlayer[];
    if (!Array.isArray(arr)) return [];
    // Sort by trophy desc, then best-score desc as tie-breaker. Stable enough
    // for an hour of leaderboard display.
    arr.sort((a, b) => {
      const t = (b.trophy ?? 0) - (a.trophy ?? 0);
      if (t !== 0) return t;
      return (b.bestScore ?? 0) - (a.bestScore ?? 0);
    });
    return arr;
  } catch {
    return [];
  }
}

/** Most-recent `updatedAt` across the dataset — drives the "Updated at" label. */
function deriveUpdatedAt(arr: RawPlayer[]): string {
  let max = 0;
  for (const p of arr) {
    if (typeof p.updatedAt === 'string') {
      const t = Date.parse(p.updatedAt);
      if (Number.isFinite(t) && t > max) max = t;
    }
  }
  return max ? new Date(max).toISOString() : new Date().toISOString();
}

export async function getGlobalRankings(limit = 50) {
  const all = await fetchSortedPlayers();
  if (all.length === 0) return null;
  const top = all.slice(0, limit).map((p, i) => toPlayerRanking(i + 1, p));
  return {
    success: true,
    data: {
      rankings: top,
      total: all.length,
      updatedAt: deriveUpdatedAt(all),
    },
  } satisfies RankingsResponse<{ rankings: PlayerRanking[]; total: number; updatedAt: string }>;
}

export async function getCountryList() {
  const all = await fetchSortedPlayers();
  if (all.length === 0) return null;
  const counts = new Map<string, number>();
  for (const p of all) {
    const c = (p.location ?? '').toUpperCase().trim();
    if (!c) continue;
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  const availableCountries: CountryEntry[] = Array.from(counts.entries())
    .map(([country, playerCount]) => ({ country, playerCount }))
    .sort((a, b) => b.playerCount - a.playerCount);
  return {
    success: true,
    data: {
      availableCountries,
      updatedAt: deriveUpdatedAt(all),
    },
  } satisfies RankingsResponse<{ availableCountries: CountryEntry[]; updatedAt: string }>;
}

export async function getLocalRankings(country: string, limit = 50) {
  const all = await fetchSortedPlayers();
  if (all.length === 0) return null;
  const code = country.toUpperCase().trim();
  const filtered = all.filter(p => (p.location ?? '').toUpperCase() === code);
  // Re-rank within the country slice (rank #1 = country's best, not global).
  const top = filtered.slice(0, limit).map((p, i) => toPlayerRanking(i + 1, p));
  return {
    success: true,
    data: {
      rankings: top,
      country: code,
      total: filtered.length,
      updatedAt: deriveUpdatedAt(all),
    },
  } satisfies RankingsResponse<{ rankings: PlayerRanking[]; country: string; total: number; updatedAt: string }>;
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
