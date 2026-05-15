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
