/**
 * Topic registry — single source of truth for "what we can write about".
 *
 * Joins three inputs:
 *   1. keyword-bank.json     — manually curated keyword clusters (gaming-history,
 *                              tech-deep-dive, country-culture, strategy, comparisons,
 *                              skin-spotlight hubs)
 *   2. /public/catalog/snakes — every active backend snake produces a topic in
 *                              category 'skin-spotlight'
 *   3. lastUsedAt frontmatter — read from committed posts so the scheduler can
 *                              skip topics published in the last N days
 *
 * Consumers (scheduler, generate-post route) call `loadAllTopics()` and pick
 * by id. Topics are stable across runs — a given `topicId` always maps to the
 * same content shape.
 */

import keywordBank from '@/data/keyword-bank.json';
import { getAllSkinsFromCatalog, type Skin } from '@/lib/skins';
import type { BlogCategorySlug } from '@/lib/blog-data';

export type TopicIntent = 'informational' | 'transactional' | 'navigational' | 'comparative';

export interface KeywordTopic {
  /** Stable ID — used by content-calendar.json and as the post slug suffix. */
  id: string;
  categoryId: BlogCategorySlug;
  primary: string;
  secondary: string[];
  intent: TopicIntent;
  difficulty: number;
  volumeEstimate: number;
  /** ISO date of last publish, or null. Updated by audit cron after each commit. */
  lastUsedAt: string | null;
  notes?: string;
}

export interface SkinTopic extends KeywordTopic {
  /** Backend-resolved skin object. */
  skin: Skin;
}

export type Topic = KeywordTopic | SkinTopic;

export function isSkinTopic(t: Topic): t is SkinTopic {
  return (t as SkinTopic).skin !== undefined;
}

interface RawKeywordEntry {
  id: string;
  categoryId: string;
  primary: string;
  secondary: string[];
  intent: string;
  difficulty: number;
  volumeEstimate: number;
  lastUsedAt: string | null;
  notes?: string;
}

function readKeywordEntries(): KeywordTopic[] {
  const entries = (keywordBank as { topics?: RawKeywordEntry[] }).topics ?? [];
  return entries.map(e => ({
    id: e.id,
    categoryId: e.categoryId as BlogCategorySlug,
    primary: e.primary,
    secondary: e.secondary ?? [],
    intent: (e.intent as TopicIntent) ?? 'informational',
    difficulty: e.difficulty ?? 5,
    volumeEstimate: e.volumeEstimate ?? 0,
    lastUsedAt: e.lastUsedAt ?? null,
    notes: e.notes,
  }));
}

/**
 * Builds one skin-spotlight topic per backend snake. Topic IDs are derived
 * from the catalog `id` (e.g. FSNAKE_42 -> `skin-fsnake-42`) so they stay
 * stable even when the snake gets renamed in-game.
 */
async function readSkinTopics(): Promise<SkinTopic[]> {
  const skins = await getAllSkinsFromCatalog();
  return skins.map(s => {
    const topicId = `skin-${s.id.toLowerCase()}`;
    // Primary keyword: "{Snake Name} snake skin". For country skins we also
    // include the country name to capture both English and the country term.
    const primary = s.isCountry
      ? `${s.name} country snake skin`
      : `${s.name} snake skin`;
    const secondary = [
      `${s.name} skin guide`,
      `how to unlock ${s.name}`,
      ...(s.isCountry ? [`${s.country} flag snake`] : []),
      `snake online ${s.rarity}`,
    ].filter(Boolean) as string[];
    return {
      id: topicId,
      categoryId: 'skin-spotlight' as const,
      primary,
      secondary,
      intent: 'informational' as const,
      difficulty: s.rarity === 'mythic' ? 3 : 4,
      volumeEstimate: s.isCountry ? 800 : 600,
      lastUsedAt: null,
      notes: undefined,
      skin: s,
    };
  });
}

let _cache: { at: number; topics: Topic[] } | null = null;
const CACHE_TTL = 5 * 60_000; // 5 min — generate-post runs are minutes apart

export async function loadAllTopics(): Promise<Topic[]> {
  if (_cache && Date.now() - _cache.at < CACHE_TTL) return _cache.topics;
  const [kw, skinTopics] = await Promise.all([
    Promise.resolve(readKeywordEntries()),
    readSkinTopics(),
  ]);
  const all = [...kw, ...skinTopics];
  _cache = { at: Date.now(), topics: all };
  return all;
}

export async function findTopic(id: string): Promise<Topic | undefined> {
  const all = await loadAllTopics();
  return all.find(t => t.id === id);
}

/**
 * Returns topics eligible for re-use (lastUsedAt older than `daysAgo`, or null).
 * Used by the scheduler to avoid cannibalizing the same keyword cluster.
 */
export async function eligibleTopics(daysAgo = 60, categoryId?: BlogCategorySlug): Promise<Topic[]> {
  const all = await loadAllTopics();
  const cutoff = Date.now() - daysAgo * 86400_000;
  return all.filter(t => {
    if (categoryId && t.categoryId !== categoryId) return false;
    if (!t.lastUsedAt) return true;
    return new Date(t.lastUsedAt).getTime() < cutoff;
  });
}

/** Slug used in URLs + filenames. Two namespaces: skin-spotlight-... vs topic-... */
export function topicToPostSlug(topic: Topic): string {
  if (isSkinTopic(topic)) return `skin-spotlight-${topic.skin.slug}`;
  return `topic-${topic.id}`;
}
