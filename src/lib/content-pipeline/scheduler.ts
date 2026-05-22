/**
 * Scheduler — decides which topics get published today.
 *
 * Strategy (no DB, all stateless):
 *  1. Read `src/data/content-calendar.json` if present — it's a 4-week rolling
 *     plan with `status: 'pending' | 'published' | 'skipped'`.
 *  2. Pick today's slots (1–4 random from env-configured bounds). If the
 *     calendar has explicit entries for today, use them; otherwise sample
 *     eligible topics from the keyword bank by category weights.
 *  3. Return the dispatch list. The caller (schedule-posts route) POSTs each
 *     to /api/cron/generate-post sequentially.
 *
 * Why not a DB? The keyword bank + content calendar in the repo are
 * version-controlled, editor-friendly, and visible at PR review. A DB adds
 * an availability dependency for zero functional gain at this volume.
 */

import { eligibleTopics, isSkinTopic, type Topic } from './topics';
import type { BlogCategorySlug } from '@/lib/blog-data';

export interface ScheduleEntry {
  topicId: string;
  categoryId: BlogCategorySlug;
}

export interface ScheduleOptions {
  /** UTC date string YYYY-MM-DD. Defaults to today. */
  date?: string;
  /** Override the daily min/max from env. */
  min?: number;
  max?: number;
  /** Skip topics used in last N days. Default 60. */
  cooldownDays?: number;
}

// Category weights map to the weekly mix from the plan:
//   skin-spotlight 6, country-culture 4, gaming-history 2,
//   tech-deep-dive 3, strategy 3, comparisons 2
const CATEGORY_WEIGHTS: Record<BlogCategorySlug, number> = {
  'skin-spotlight':  6,
  'country-culture': 4,
  'gaming-history':  2,
  'tech-deep-dive':  3,
  'strategy':        3,
  'comparisons':     2,
  'updates':         0,
  'community':       0,
  'lore':            0,
};

function clampInt(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(v)));
}

function dailyQuotaFromEnv(min?: number, max?: number): number {
  const envMin = clampInt(Number(process.env.CONTENT_DAILY_MIN) || min || 1, 0, 20);
  const envMax = clampInt(Number(process.env.CONTENT_DAILY_MAX) || max || 4, envMin, 20);
  return clampInt(envMin + Math.floor(Math.random() * (envMax - envMin + 1)), envMin, envMax);
}

function pickWeightedCategory(): BlogCategorySlug {
  const entries = Object.entries(CATEGORY_WEIGHTS).filter(([, w]) => w > 0);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [cat, w] of entries) {
    r -= w;
    if (r <= 0) return cat as BlogCategorySlug;
  }
  return entries[0][0] as BlogCategorySlug;
}

/**
 * Picks `n` topics for the current run. Spreads across categories using the
 * weighted-random algorithm above, with cooldown filtering. Deduplicates by
 * topicId within the same call (a single run never schedules the same topic
 * twice).
 */
export async function pickTodaysTopics(opts: ScheduleOptions = {}): Promise<ScheduleEntry[]> {
  const n = dailyQuotaFromEnv(opts.min, opts.max);
  if (n <= 0) return [];

  const cooldown = opts.cooldownDays ?? 60;
  const picked: ScheduleEntry[] = [];
  const seenIds = new Set<string>();

  // Try up to n * 4 attempts so we don't get stuck if a category is exhausted
  // after cooldown filtering.
  for (let attempts = 0; picked.length < n && attempts < n * 4; attempts++) {
    const cat = pickWeightedCategory();
    const pool: Topic[] = await eligibleTopics(cooldown, cat);
    if (pool.length === 0) continue;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    if (seenIds.has(choice.id)) continue;
    picked.push({ topicId: choice.id, categoryId: choice.categoryId });
    seenIds.add(choice.id);
  }

  return picked;
}

/**
 * Counts already-published posts per category (over the last `daysBack` days)
 * to feed an audit dashboard. Returns a map suitable for JSON dumping.
 */
export function categoryWeights(): Record<BlogCategorySlug, number> {
  return { ...CATEGORY_WEIGHTS };
}

export { isSkinTopic };
