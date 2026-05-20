/**
 * Asset URL helpers.
 *
 * The marketing site hosts skin / arena / bait PNGs in `public/{folder}/`
 * — same origin, no backend dependency, no SSL handshake risk.
 *
 * If you ever need to fall back to a remote CDN (e.g. backend.snakeonlines.com
 * once it's healthy), set NEXT_PUBLIC_ASSETS_BASE to that origin and re-deploy.
 * When unset (default), URLs resolve to same-origin paths under /snakes, /baits,
 * /backgrounds, /avatars, /flags, /powerUps.
 */
const ASSETS_BASE = process.env.NEXT_PUBLIC_ASSETS_BASE?.replace(/\/$/, '') ?? '';

const url = (folder: string, id?: string) => (id ? `${ASSETS_BASE}/${folder}/${id}.png` : '');

export const snakeImg = (id?: string) => url('snakes', id);
export const avatarImg = (id?: string) => url('avatars', id);
export const backgroundImg = (id?: string) => url('backgrounds', id);
export const flagImg = (id?: string) => url('flags', id);
export const baitImg = (id?: string) => url('baits', id);
export const powerUpImg = (id?: string) => url('powerUps', id);

export function isoToFlagId(iso?: string) {
  if (!iso) return '';
  if (iso.endsWith('_FLAG')) return iso;
  return `${iso}_FLAG`;
}

/**
 * Convert ISO country code (or XX_FLAG format) to emoji flag.
 * Works everywhere without needing flag image files.
 */
export function countryEmoji(code?: string): string {
  if (!code) return '🌍';
  const iso = code.replace('_FLAG', '').toUpperCase().slice(0, 2);
  if (iso.length !== 2) return '🌍';
  return String.fromCodePoint(...[...iso].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

/**
 * Extract avatar number for color-based fallback.
 * AVATAR_05 → 5
 */
export function avatarIndex(id?: string): number {
  if (!id) return 0;
  const m = id.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

const AVATAR_COLORS = [
  '#FF9500', '#FF3B8A', '#A455FF', '#00E5FF', '#22C55E',
  '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#10B981',
  '#F97316', '#EC4899', '#7C3AED', '#14B8A6', '#84CC16',
  '#E11D48', '#9333EA', '#0EA5E9', '#65A30D', '#D946EF',
  '#0891B2', '#CA8A04',
];

/** Get a consistent color for an avatar ID. */
export function avatarColor(id?: string): string {
  const idx = avatarIndex(id);
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}
