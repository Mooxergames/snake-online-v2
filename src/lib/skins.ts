import snakes from '@/data/snakes.json';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'exclusive';

export interface Skin {
  id: string;
  slug: string;
  name: string;
  rarity: Rarity;
  country?: string;
  isCountry: boolean;
  description: string;
  obtainHint: string;
  /** Deterministic 0..4 — used to rotate metadata templates so titles/descriptions
   *  on programmatic skin pages don't all look identical to Google's duplicate-content classifier. */
  metaTemplate: number;
}

const COUNTRY_NAMES: Record<string, string> = {
  AE: 'United Arab Emirates', AR: 'Argentina', AT: 'Austria', AU: 'Australia', AZ: 'Azerbaijan',
  BE: 'Belgium', BG: 'Bulgaria', BR: 'Brazil', CA: 'Canada', CH: 'Switzerland', CL: 'Chile',
  CN: 'China', CO: 'Colombia', CZ: 'Czech Republic', DE: 'Germany', DK: 'Denmark', EG: 'Egypt',
  ES: 'Spain', FI: 'Finland', FR: 'France', GB: 'United Kingdom', GR: 'Greece', HR: 'Croatia',
  HU: 'Hungary', ID: 'Indonesia', IE: 'Ireland', IL: 'Israel', IN: 'India', IR: 'Iran',
  IT: 'Italy', JP: 'Japan', KR: 'South Korea', MX: 'Mexico', MY: 'Malaysia', NG: 'Nigeria',
  NL: 'Netherlands', NO: 'Norway', NZ: 'New Zealand', PE: 'Peru', PH: 'Philippines',
  PK: 'Pakistan', PL: 'Poland', PT: 'Portugal', QA: 'Qatar', RO: 'Romania', RS: 'Serbia',
  RU: 'Russia', SA: 'Saudi Arabia', SE: 'Sweden', SG: 'Singapore', SK: 'Slovakia', TH: 'Thailand',
  TR: 'Türkiye', TW: 'Taiwan', UA: 'Ukraine', US: 'United States', USA: 'United States',
  VE: 'Venezuela', VN: 'Vietnam', ZA: 'South Africa',
};

const FANTASY_NAMES = [
  'Ember', 'Frostbite', 'Voidling', 'Solaris', 'Mythril', 'Obsidian', 'Aurora', 'Tempest',
  'Eclipse', 'Nebula', 'Sable', 'Crimson', 'Verdant', 'Cyrus', 'Onyx', 'Zenith', 'Cipher',
  'Mirage', 'Vortex', 'Phoenix', 'Talon', 'Wyrm', 'Saga', 'Halo', 'Drift', 'Glacier', 'Pulse',
  'Echo', 'Ronin', 'Spectre', 'Lustre', 'Cinder', 'Ash', 'Bramble', 'Quartz', 'Marrow',
  'Volt', 'Coil', 'Fang', 'Lure', 'Slip', 'Vex', 'Whisper', 'Mist', 'Nova', 'Quasar',
  'Pyre', 'Riven', 'Slate', 'Tide', 'Umbra', 'Veil', 'Wisp', 'Yon', 'Zephyr', 'Bolt',
  'Coral', 'Dune', 'Ferro', 'Glint', 'Helix', 'Ion', 'Jade', 'Kraken', 'Lumen', 'Moth',
  'Neon', 'Orbit', 'Pixel', 'Quill', 'Rune', 'Shard', 'Trace', 'Ulna', 'Vector',
  'Wraith', 'Xeno', 'Yarrow', 'Zeal', 'Apex', 'Blaze', 'Crest', 'Dusk', 'Edge', 'Forge',
  'Glyph', 'Howl', 'Iron', 'Jolt', 'Kindle', 'Loom', 'Mossa', 'Notch', 'Ore', 'Plume',
  'Quench', 'Rift', 'Sear', 'Tare', 'Undertow', 'Vow', 'Warden', 'Xis', 'Yore', 'Zinc',
  'Amber', 'Beacon', 'Cleft', 'Doom', 'Eon', 'Flux', 'Grit', 'Hush', 'Ire', 'Jinx',
  'Knell', 'Lyre', 'Mire', 'Nyx', 'Orca', 'Prism', 'Quill', 'Reign', 'Sage', 'Throne',
];

const FAMOUS_FANTASY_RARITY: Record<string, Rarity> = {
  // Hand-curated: the standout names get top tiers
  Ember: 'legendary', Voidling: 'mythic', Frostbite: 'epic', Solaris: 'legendary',
  Eclipse: 'mythic', Phoenix: 'legendary', Aurora: 'epic', Nebula: 'mythic',
  Tempest: 'legendary', Mythril: 'mythic',
};

function fantasyRarity(name: string, suffix: string): Rarity {
  if (FAMOUS_FANTASY_RARITY[name]) return FAMOUS_FANTASY_RARITY[name];
  const n = Number(suffix);
  if (Number.isNaN(n)) return 'rare';
  if (n <= 20)  return 'common';
  if (n <= 50)  return 'rare';
  if (n <= 80)  return 'epic';
  if (n <= 110) return 'legendary';
  return 'mythic';
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Deterministic 0..4 from an id, so the same skin always picks the same template
// (stable URLs, stable SERP snippets).
function templateBucket(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % 5;
}

function buildSkin(id: string): Skin {
  if (id.startsWith('CSNAKE_')) {
    const code = id.replace('CSNAKE_', '');
    const country = COUNTRY_NAMES[code] || code;
    const name = country;
    return {
      id,
      slug: `country-${slugify(country)}`,
      name,
      rarity: 'exclusive',
      country: code,
      isCountry: true,
      description: `The ${country} country snake skin — fly your flag in the arena. One of 180+ exclusive national skins in Snake Online.`,
      obtainHint: `Awarded automatically when you connect from ${country}, or unlocked permanently by winning any country tournament.`,
      metaTemplate: templateBucket(id),
    };
  }
  if (id.startsWith('FSNAKE_')) {
    const suffix = id.replace('FSNAKE_', '');
    const n = Number(suffix);
    const idx = Number.isFinite(n) ? (n - 1 + FANTASY_NAMES.length) % FANTASY_NAMES.length : 0;
    const name = FANTASY_NAMES[idx] || `Serpent ${suffix}`;
    const rarity = fantasyRarity(name, suffix);
    return {
      id,
      slug: `fantasy-${slugify(name)}-${suffix}`,
      name,
      rarity,
      isCountry: false,
      description: `${name} — a ${rarity} tier fantasy snake skin. ${rarity === 'mythic' ? 'Drops only during high-level tournament finals.' : rarity === 'legendary' ? 'Forged in the late-game arena. Hard-earned, harder to keep.' : rarity === 'epic' ? 'Earned through sustained leaderboard climb.' : 'A reliable companion for the climb.'}`,
      obtainHint: rarity === 'mythic'
        ? 'Won by placing top-3 in any monthly Mythic Arena tournament.'
        : rarity === 'legendary'
          ? 'Awarded for reaching Top 1% on the global leaderboard once.'
          : rarity === 'epic'
            ? 'Unlocked at 50 trophy threshold and above.'
            : 'Available from the starting roster.',
      metaTemplate: templateBucket(id),
    };
  }
  return {
    id,
    slug: slugify(id),
    name: id,
    rarity: 'common',
    isCountry: false,
    description: id,
    obtainHint: 'Available in the default roster.',
    metaTemplate: templateBucket(id),
  };
}

let _allSkins: Skin[] | null = null;
export function getAllSkins(): Skin[] {
  if (_allSkins) return _allSkins;
  _allSkins = (snakes as string[]).map(buildSkin);
  return _allSkins;
}

let _bySlug: Map<string, Skin> | null = null;
export function getSkinBySlug(slug: string): Skin | undefined {
  if (!_bySlug) _bySlug = new Map(getAllSkins().map(s => [s.slug, s]));
  return _bySlug.get(slug);
}

export function getRelatedSkins(s: Skin, count = 6): Skin[] {
  const all = getAllSkins();
  const sameRarity = all.filter(x => x.id !== s.id && x.rarity === s.rarity).slice(0, count);
  if (sameRarity.length >= count) return sameRarity;
  const fill = all.filter(x => x.id !== s.id && !sameRarity.includes(x)).slice(0, count - sameRarity.length);
  return [...sameRarity, ...fill];
}
