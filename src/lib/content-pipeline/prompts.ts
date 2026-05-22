/**
 * One prompt template per blog category. Each builder returns a single-string
 * prompt fed verbatim to OpenAI (system + user). The model is asked to return
 * JSON matching `PromptOutput`. All locale-aware text generation lives in
 * generate-post.ts; THIS module always returns English. Translation happens
 * downstream in translate-post.ts.
 *
 * Why per-category prompts? Skin spotlights need lore + unlock + strategy.
 * Tech deep dives need code patterns. History posts need timeline narrative.
 * One mega-prompt produces blander, less-rankable output.
 */

import type { Skin } from '@/lib/skins';
import type { Topic, KeywordTopic, SkinTopic } from './topics';
import { isSkinTopic } from './topics';
import type { BlogCategorySlug } from '@/lib/blog-data';

export interface PromptOutput {
  /** 50–65 chars. Includes primary keyword + hook. No clickbait. */
  title: string;
  /** 140–160 chars. Includes "Snake Online" once. */
  description: string;
  /** Markdown, 700–950 words. */
  body: string;
  /** 4–6 tags in English. */
  tags: string[];
  /** Suggested internal links: list of post slugs OR skin slugs the model
   *  thinks are relevant. The internal-links engine deduplicates and trims. */
  internalLinkSlugs: string[];
  /** Optional FAQ pairs — appended as a separate section when present, and
   *  also pushed into the page's FAQPage JSON-LD. 2–4 Q&A pairs. */
  faq?: Array<{ q: string; a: string }>;
}

const SHARED_RULES = `
SHARED RULES (override only when explicitly told otherwise below):
- Write in English. Translation happens in a separate downstream step.
- Tone: gaming-blog editorial, confident, second-person ("you"), no marketing fluff.
- No emojis. No "as an AI". No "delve into". No "tapestry of". No "in the realm of".
- No clickbait. No exclamation marks in title or description.
- Paragraphs 2-4 sentences each. Vary sentence length.
- Mention "Snake Online" by name at most TWICE in the body, never in headings.
- Output ONE JSON object matching the requested shape — no markdown fences, no commentary.
- For \`internalLinkSlugs\`: only suggest slugs you'd genuinely cite if you were the writer. Empty array is fine.
- The body must NOT include a top-level H1 (the page template renders the title separately).
- Every H2 must be substantive (no "Conclusion" or "Final thoughts" filler headings).
`.trim();

const JSON_SHAPE = `
Return ONE JSON object with this exact shape:

{
  "title": "string (50-65 chars)",
  "description": "string (140-160 chars)",
  "body": "markdown string",
  "tags": ["4 to 6 short tags"],
  "internalLinkSlugs": ["0-6 slugs"],
  "faq": [{"q": "...", "a": "..."}]   // 0-4 pairs
}
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// Skin spotlight
// ─────────────────────────────────────────────────────────────────────────────

function skinSpotlightPrompt(topic: SkinTopic): string {
  const s = topic.skin;
  const priceLine = s.isFree
    ? 'Starter skin — available from day one.'
    : s.price != null && s.currency
      ? `Costs ${s.price} ${s.currency}${s.premiumPrice ? ` (or ${s.premiumPrice} ${s.premiumCurrency})` : ''}.`
      : 'Unlock cost: not disclosed by the catalog API.';
  const tagsLine = (s.tags || []).slice(0, 6).join(', ');
  const limited = s.isLimited ? ' Limited availability — check the in-game store.' : '';
  return [
    'TASK: Write a Skin Spotlight blog post for Snake Online.',
    '',
    'SUBJECT:',
    `- Skin name: ${s.name}`,
    `- Rarity: ${s.rarity}`,
    `- Category: ${s.isCountry ? `Country skin (${s.country})` : 'Fantasy skin'}`,
    `- Description hint from backend: ${s.description}`,
    `- Unlock method: ${s.obtainHint}`,
    `- ${priceLine}${limited}`,
    tagsLine ? `- Backend tags: ${tagsLine}` : '',
    `- Image URL (reference, do NOT embed): /snakes/${s.id}.png`,
    '',
    'PRIMARY KEYWORD: ' + topic.primary,
    'SECONDARY KEYWORDS: ' + topic.secondary.join(' | '),
    '',
    'STRUCTURE (700-950 words, Markdown, NO h1):',
    '- One opening paragraph that hooks the reader without restating the title.',
    '- Exactly FOUR H2 sections in this order:',
    '  1. "Origin & lore" — 2-3 paragraphs of backstory grounded in the description hint.',
    '  2. "Why this skin stands out" — 3-5 bullets of design / mechanical highlights.',
    '  3. "How to unlock" — concrete steps based on the unlock method + pricing.',
    '  4. "Where it shines (strategy)" — reference at least 2 in-game mechanics: coil traps, boost economy, perimeter survival, Battle Royale, Time Tunnel, Treasure Hunt, or Deathmatch.',
    '- End with a single short call-to-play sentence.',
    '- 2-3 FAQ pairs at the end of the JSON (NOT in the body).',
    '',
    'INTERNAL LINK SUGGESTIONS: Suggest 2-4 slugs of related skins or hub pages',
    'you would link to if writing this yourself. The pipeline will dedupe and verify.',
    '',
    SHARED_RULES,
    '',
    JSON_SHAPE,
  ].filter(Boolean).join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Country & culture
// ─────────────────────────────────────────────────────────────────────────────

function countryCulturePrompt(topic: KeywordTopic): string {
  return [
    'TASK: Write a Country & Culture feature for Snake Online.',
    '',
    `Primary keyword: ${topic.primary}`,
    `Secondary keywords: ${topic.secondary.join(' | ')}`,
    topic.notes ? `Editorial notes: ${topic.notes}` : '',
    '',
    'ANGLE: connect the specific country to Snake Online — the country skin in the catalog,',
    'the local leaderboard culture, notable player handles where you can plausibly mention',
    'a generic archetype (do not invent named individuals), and how the local community',
    'plays differently. Lean on regional flavour without stereotypes.',
    '',
    'STRUCTURE (700-900 words, Markdown, NO h1):',
    '- Opening paragraph painting a scene from a typical match in that region.',
    '- Four H2 sections:',
    '  1. The country skin — design, rarity, what it represents.',
    '  2. Local leaderboard culture — what to expect at the top.',
    '  3. Play style differences — observable patterns (early aggression, late-game coil play, etc).',
    '  4. How to climb the country leaderboard — actionable steps.',
    '- Close with a single line pointing the reader to /{locale}/ranking?country={CODE}.',
    '- 2-3 FAQ pairs in JSON.',
    '',
    SHARED_RULES,
    '',
    JSON_SHAPE,
  ].filter(Boolean).join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Gaming history
// ─────────────────────────────────────────────────────────────────────────────

function gamingHistoryPrompt(topic: KeywordTopic): string {
  return [
    'TASK: Write a Gaming History feature.',
    '',
    `Primary keyword: ${topic.primary}`,
    `Secondary keywords: ${topic.secondary.join(' | ')}`,
    topic.notes ? `Editorial notes: ${topic.notes}` : '',
    '',
    'ANGLE: factual, dated, sourced-in-tone (do NOT fabricate citations). Show the timeline',
    'from earliest mention to where Snake Online sits today. End with a single paragraph',
    'connecting the history to the modern multiplayer iteration without selling.',
    '',
    'STRUCTURE (800-950 words, Markdown, NO h1):',
    '- Opening paragraph that names a specific year + event.',
    '- 4-5 H2 sections in chronological order. Use real, verifiable milestones',
    '  (Taneli Armanto / Nokia 6110 1997, Snake II on 3310 2000, iPod Snake 2001,',
    '   Slither.io launch March 2016, .io genre golden age 2016-2020, etc.).',
    '- One H2 named "Where Snake Online fits" at the end (2 short paragraphs).',
    '- 2-3 FAQ pairs in JSON.',
    '',
    SHARED_RULES,
    '',
    JSON_SHAPE,
  ].filter(Boolean).join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Tech deep dive
// ─────────────────────────────────────────────────────────────────────────────

function techDeepDivePrompt(topic: KeywordTopic): string {
  return [
    'TASK: Write a Tech Deep Dive — a serious engineering article that a developer',
    'building an .io game would actually want to read.',
    '',
    `Primary keyword: ${topic.primary}`,
    `Secondary keywords: ${topic.secondary.join(' | ')}`,
    topic.notes ? `Editorial notes: ${topic.notes}` : '',
    '',
    'STYLE: technical-blog, no fluff. Show concrete architecture decisions, tradeoffs,',
    'numbers when reasonable (latency budgets, tick rates, payload sizes). Use code',
    'fences when illustrating a concept — pseudocode is fine, never invent library APIs.',
    '',
    'STRUCTURE (800-950 words, Markdown, NO h1):',
    '- Opening paragraph: name the problem and why it matters at .io-game scale.',
    '- 4 H2 sections:',
    '  1. The problem (concrete failure mode the technique solves).',
    '  2. The approach (architecture sketch, 1-2 pseudocode snippets if helpful).',
    '  3. Tradeoffs (latency vs bandwidth vs CPU; client-trust vs server-authority).',
    '  4. How Snake Online does it (1 short paragraph — confident but not boastful).',
    '- 2-3 FAQ pairs in JSON (developer-oriented).',
    '',
    'Mention Snake Online ONCE in the body, in the final section only.',
    '',
    SHARED_RULES,
    '',
    JSON_SHAPE,
  ].filter(Boolean).join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Strategy
// ─────────────────────────────────────────────────────────────────────────────

function strategyPrompt(topic: KeywordTopic): string {
  return [
    'TASK: Write a Strategy guide for Snake Online players.',
    '',
    `Primary keyword: ${topic.primary}`,
    `Secondary keywords: ${topic.secondary.join(' | ')}`,
    '',
    'STRUCTURE (700-900 words, Markdown, NO h1):',
    '- Opening paragraph that names a common mistake players make.',
    '- 4 H2 sections, each a numbered or unnumbered tip with 1-2 paragraphs of explanation.',
    '- Include at least one bullet list (3-5 items).',
    '- End with a one-line "go try this now" sentence.',
    '- 2-3 FAQ pairs in JSON (skill-level oriented).',
    '',
    SHARED_RULES,
    '',
    JSON_SHAPE,
  ].filter(Boolean).join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Comparisons
// ─────────────────────────────────────────────────────────────────────────────

function comparisonsPrompt(topic: KeywordTopic): string {
  return [
    'TASK: Write a fair head-to-head comparison feature.',
    '',
    `Primary keyword: ${topic.primary}`,
    `Secondary keywords: ${topic.secondary.join(' | ')}`,
    '',
    'GROUND RULES:',
    '- Be fair to the competitor. Acknowledge what they do better.',
    '- No false claims. If you do not know a fact, do not invent one.',
    '- Avoid disparaging language. The audience can smell bias.',
    '',
    'STRUCTURE (800-950 words, Markdown, NO h1):',
    '- Opening paragraph framing what each game actually is.',
    '- One H2 per axis of comparison (4 axes):',
    '  1. Gameplay loop / core mechanic',
    '  2. Skins and progression',
    '  3. Multiplayer scale and netcode feel',
    '  4. Platforms and accessibility',
    '- One short verdict H2 at the end — "Which should you play?" — that honestly',
    '  recommends one game per player profile, not blanket "ours is better".',
    '- 2-3 FAQ pairs in JSON.',
    '',
    SHARED_RULES,
    '',
    JSON_SHAPE,
  ].filter(Boolean).join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Dispatcher
// ─────────────────────────────────────────────────────────────────────────────

export function buildPrompt(topic: Topic): { system: string; user: string } {
  const system = 'You are a senior gaming editor with 20 years of experience. You write SEO-optimized blog posts that read like seasoned human writing. Output ONLY valid JSON matching the requested shape — no markdown fences, no commentary.';

  const category: BlogCategorySlug = topic.categoryId;
  let user: string;

  if (category === 'skin-spotlight' && isSkinTopic(topic)) {
    user = skinSpotlightPrompt(topic);
  } else if (category === 'country-culture') {
    user = countryCulturePrompt(topic);
  } else if (category === 'gaming-history') {
    user = gamingHistoryPrompt(topic);
  } else if (category === 'tech-deep-dive') {
    user = techDeepDivePrompt(topic);
  } else if (category === 'strategy') {
    user = strategyPrompt(topic);
  } else if (category === 'comparisons') {
    user = comparisonsPrompt(topic);
  } else {
    // Fallback for legacy categories (lore, community, updates) — use strategy shape
    user = strategyPrompt(topic as KeywordTopic);
  }

  return { system, user };
}
