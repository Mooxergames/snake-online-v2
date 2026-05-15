export const snakeImg = (id?: string) => id ? `/cdn/snakes/${id}.png` : '';
export const avatarImg = (id?: string) => id ? `/cdn/avatars/${id}.png` : '';
export const backgroundImg = (id?: string) => id ? `/cdn/backgrounds/${id}.png` : '';
export const flagImg = (id?: string) => id ? `/cdn/flags/${id}.png` : '';
export const baitImg = (id?: string) => id ? `/cdn/baits/${id}.png` : '';
export const powerUpImg = (id?: string) => id ? `/cdn/powerUps/${id}.png` : '';

export function isoToFlagId(iso?: string) {
  if (!iso) return '';
  if (iso.endsWith('_FLAG')) return iso;
  return `${iso}_FLAG`;
}
