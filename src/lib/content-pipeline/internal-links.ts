/**
 * Internal-link rules engine.
 *
 * Replaces the ad-hoc injector that lived in src/lib/blog.ts. The old one
 * silently linked every occurrence of every snake name (long-tail-first sort)
 * and could produce 30+ links on a long post — keyword stuffing risk.
 *
 * New rules:
 *   1. Each target URL appears AT MOST ONCE per post.
 *   2. Maximum 4 internal links total per post (4 is the post-Penguin sweet spot
 *      for short-to-medium posts; longer posts can override via maxLinks).
 *   3. Match the FIRST plausible occurrence only.
 *   4. Skip if the post body is < 400 words (thin post — extra links look spammy).
 *   5. Skip targets whose name matches the current post's primary subject (e.g.
 *      don't link "Jungle Juggernaut" inside the Jungle Juggernaut post).
 *   6. AI-suggested slugs (from prompt's `internalLinkSlugs`) are preferred over
 *      regex auto-detect — they reflect editorial intent. We verify each suggestion
 *      against the catalog/topic registry; unknown slugs are dropped silently.
 */

import type { Skin } from '@/lib/skins';

export interface LinkTarget {
  /** Display name to match in the body (case-insensitive). */
  name: string;
  /** Absolute href, e.g. "/en/skins/country-germany". */
  href: string;
  /** Stable ID used for data-attribute + deduplication. */
  id: string;
  /** Rarity / weight — used when we have to pick between multiple matches. */
  rarity?: string;
}

export interface InjectOptions {
  locale: string;
  /** The current post slug — used to prevent self-links. */
  currentSlug: string;
  /** Suggested slugs from the AI, in editor's preferred order. */
  suggestedSlugs?: string[];
  /** Override the default 4-link cap (e.g. for long-form posts). */
  maxLinks?: number;
  /** Skip injection if body word count is below this. */
  minWords?: number;
  /** Optional set of generic hub pages to consider (e.g. /play, /how-to-play, /vs/slither-io). */
  hubs?: LinkTarget[];
}

export interface InjectResult {
  html: string;
  /** IDs of targets we actually linked, in the order we linked them. */
  linkedIds: string[];
  /** Any suggested slugs we dropped (unknown / duplicate / capped out). */
  droppedSuggestions: string[];
}

function countWords(html: string): number {
  return html
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build LinkTarget[] from the live skin catalog. Caller passes results in.
 * Keeping this pure makes the engine unit-testable without hitting the network.
 */
export function skinsToLinkTargets(skins: Skin[], locale: string): LinkTarget[] {
  return skins
    .map(s => ({
      name: s.name,
      href: `/${locale}/skins/${s.slug}`,
      id: `skin:${s.id}`,
      rarity: s.rarity,
    }))
    .filter(t => t.name.length >= 4); // names like "AR" / "UK" are too noisy to auto-link
}

/**
 * Inject internal links into rendered HTML following the rules above.
 *
 * @param html      Rendered post HTML (after markdown-to-HTML).
 * @param targets   All candidate targets (skins + hubs).
 * @param opts      Per-post options.
 */
export function injectInternalLinks(
  html: string,
  targets: LinkTarget[],
  opts: InjectOptions,
): InjectResult {
  const minWords = opts.minWords ?? 400;
  const maxLinks = opts.maxLinks ?? 4;
  const result: InjectResult = { html, linkedIds: [], droppedSuggestions: [] };

  if (countWords(html) < minWords) return result;

  const byId = new Map(targets.map(t => [t.id, t]));
  const byName = new Map<string, LinkTarget>();
  for (const t of targets) byName.set(t.name.toLowerCase(), t);

  // Order: AI suggestions first (in given order), then everything else sorted by
  // name length descending (so multi-word matches like "Country Germany" win
  // over single-word "Germany").
  const ordered: LinkTarget[] = [];
  const seen = new Set<string>();

  for (const slug of opts.suggestedSlugs ?? []) {
    const t = targets.find(x => x.href.endsWith(`/${slug}`) || x.id.endsWith(slug));
    if (t && !seen.has(t.id)) {
      ordered.push(t);
      seen.add(t.id);
    } else {
      result.droppedSuggestions.push(slug);
    }
  }
  const remaining = targets
    .filter(t => !seen.has(t.id))
    .sort((a, b) => b.name.length - a.name.length);
  ordered.push(...remaining);

  let out = result.html;
  const linkedTargetIds = new Set<string>();

  for (const target of ordered) {
    if (result.linkedIds.length >= maxLinks) break;
    if (linkedTargetIds.has(target.id)) continue;
    // Don't link a target whose URL ends with the current slug (self-link).
    if (target.href.endsWith(`/${opts.currentSlug}`)) continue;

    const pattern = new RegExp(`(?<![\\w/>])(${escapeRegex(target.name)})(?![\\w<])`, 'i');
    const m = out.match(pattern);
    if (!m) continue;
    const dataAttr = target.id.startsWith('skin:')
      ? ` data-internal-skin="${target.id.slice(5)}"`
      : '';
    const anchor = `<a href="${target.href}" class="text-brand-400 hover:text-brand-300 underline-offset-4 hover:underline"${dataAttr}>${m[1]}</a>`;
    out = out.replace(pattern, anchor);
    linkedTargetIds.add(target.id);
    result.linkedIds.push(target.id);
  }

  result.html = out;
  return result;
}

/**
 * Convenience: standard hub set used across categories.
 */
export function standardHubs(locale: string): LinkTarget[] {
  return [
    { name: 'Battle Royale',   href: `/${locale}/play`,        id: 'hub:battle-royale' },
    { name: 'Treasure Hunt',   href: `/${locale}/play`,        id: 'hub:treasure-hunt' },
    { name: 'Time Tunnel',     href: `/${locale}/play`,        id: 'hub:time-tunnel' },
    { name: 'Deathmatch',      href: `/${locale}/play`,        id: 'hub:deathmatch' },
    { name: 'leaderboard',     href: `/${locale}/ranking`,     id: 'hub:ranking' },
    { name: 'how to play',     href: `/${locale}/how-to-play`, id: 'hub:how-to-play' },
    { name: 'slither.io',      href: `/${locale}/vs/slither-io`, id: 'hub:vs-slither' },
    { name: 'Worms Zone',      href: `/${locale}/vs/worms-zone`, id: 'hub:vs-wormszone' },
  ];
}
