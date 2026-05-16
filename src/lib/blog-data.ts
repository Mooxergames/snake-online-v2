/**
 * Constants + types shared by the blog system. Lives in its own module
 * (no Node `fs`/`path` imports) so client components can import these
 * without dragging server-only code into the browser bundle.
 */

export type BlogCategorySlug =
  | 'skin-spotlight'
  | 'strategy'
  | 'comparisons'
  | 'updates'
  | 'community'
  | 'lore';

export interface BlogCategory {
  slug: BlogCategorySlug;
  title: string;
  description: string;
  icon: string;
  tier: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'exclusive';
}

export const CATEGORIES: BlogCategory[] = [
  { slug: 'skin-spotlight', title: 'Skin Spotlight', description: 'Deep dives on individual snake skins — lore, unlock guides, related cosmetics.', icon: 'Sparkles',  tier: 'mythic' },
  { slug: 'strategy',       title: 'Strategy',       description: 'How to win at Snake Online. Tactics, boost economy, coil-trap mechanics, leaderboard climbs.', icon: 'Target',     tier: 'legendary' },
  { slug: 'comparisons',    title: 'Comparisons',    description: 'Head-to-head reviews vs Worms Zone, Slither.io and the wider .io snake genre.',                icon: 'Trophy',     tier: 'epic' },
  { slug: 'updates',        title: 'Updates',        description: 'Patch notes, new skin drops, balance changes, behind-the-scenes from the studio.',             icon: 'Bell',       tier: 'rare' },
  { slug: 'community',      title: 'Community',      description: 'Tournament recaps, player stories, content creators, Discord highlights.',                     icon: 'Users',      tier: 'common' },
  { slug: 'lore',           title: 'Lore',           description: 'The world behind the arena. Snake mythology, skin origin stories, narrative deep-cuts.',       icon: 'BookOpen',   tier: 'exclusive' },
];

export function getCategory(slug: BlogCategorySlug | string | undefined): BlogCategory | undefined {
  if (!slug) return undefined;
  return CATEGORIES.find(c => c.slug === slug);
}

export interface BlogPostFrontmatter {
  title: string;
  description: string;
  date: string;
  author?: string;
  category?: BlogCategorySlug;
  tags?: string[];
  cover?: string;
  coverSkinId?: string;
  featured?: boolean;
  relatedSkinSlug?: string;
  isAiGenerated?: boolean;
}

export interface BlogPost extends BlogPostFrontmatter {
  slug: string;
  locale: string;
  content: string;
  html: string;
  readingTimeMin: number;
}
