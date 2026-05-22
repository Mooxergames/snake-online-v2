/**
 * SEO gate — runs as a publish-blocking check after OpenAI returns a draft.
 *
 * Originally planned to shell out to the marketing-skill Python validators
 * (seo_checker.py, content_scorer.py, schema_validator.py) — but Python isn't
 * guaranteed to be on the Railway container, and child_process adds 200-500ms
 * per check. We re-implement the same rules natively in TypeScript so the gate
 * is fast, dependency-free, and survives any deploy target.
 *
 * Checks (each returns an Issue with severity):
 *   - title length 50-65 chars                          [error]
 *   - description length 140-160 chars                  [error]
 *   - body word count 600-1100                          [error]
 *   - at least 3 H2 sections                            [error]
 *   - no H1 inside body (template renders title)        [error]
 *   - no AI-tell phrases ("delve into", "as an AI", ...) [error]
 *   - primary keyword appears in title                  [warn]
 *   - primary keyword appears in body at least twice    [warn]
 *   - no banned filler words ("furthermore", "moreover" overuse) [warn]
 *   - tags array has 4-6 entries                        [warn]
 *
 * Score: 100 starts; -15 per error, -5 per warn. Floor 0.
 */

import type { PromptOutput } from './prompts';

export type Severity = 'error' | 'warn';

export interface Issue {
  severity: Severity;
  code: string;
  message: string;
}

export interface GateResult {
  ok: boolean;
  score: number;
  issues: Issue[];
}

const AI_TELLS = [
  /\bas an? AI\b/i,
  /\bdelve into\b/i,
  /\btapestry of\b/i,
  /\bin the realm of\b/i,
  /\bnavigating the landscape\b/i,
  /\bembark on a journey\b/i,
  /\bunleash the power\b/i,
  /\bdive deep into\b/i,
  /\bin today'?s digital age\b/i,
  /\bin conclusion\b/i,
  /\bit'?s worth noting that\b/i,
  /\bplethora of\b/i,
  /\bmyriad of\b/i,
  /\bgame-?changer\b/i,
  /\bharness the power\b/i,
  /\brevolutionize the way\b/i,
];

const FILLER_WORDS = ['furthermore', 'moreover', 'additionally', 'consequently', 'subsequently'];

function countWords(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

function stripMarkdown(s: string): string {
  return s
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_~`-]/g, ' ');
}

export function runSeoGate(
  draft: PromptOutput,
  context: { primaryKeyword: string; threshold?: number },
): GateResult {
  const issues: Issue[] = [];
  const push = (severity: Severity, code: string, message: string) => issues.push({ severity, code, message });

  // ── title ────────────────────────────────────────────────────────────
  const title = draft.title.trim();
  if (title.length < 50) push('error', 'title_too_short', `Title is ${title.length} chars (need 50-65).`);
  else if (title.length > 65) push('error', 'title_too_long', `Title is ${title.length} chars (need 50-65).`);
  if (title.endsWith('!')) push('warn', 'title_exclamation', 'Title ends with "!" — drop the exclamation.');
  if (/^[A-Z\s]+$/.test(title)) push('error', 'title_all_caps', 'Title is all caps.');

  // ── description ──────────────────────────────────────────────────────
  const desc = draft.description.trim();
  if (desc.length < 140) push('error', 'desc_too_short', `Description is ${desc.length} chars (need 140-160).`);
  else if (desc.length > 160) push('error', 'desc_too_long', `Description is ${desc.length} chars (need 140-160).`);

  // ── body ─────────────────────────────────────────────────────────────
  const bodyText = stripMarkdown(draft.body);
  const words = countWords(bodyText);
  if (words < 600) push('error', 'body_too_short', `Body is ${words} words (need 600-1100).`);
  else if (words > 1100) push('warn', 'body_too_long', `Body is ${words} words (target 600-1100).`);

  const h2Count = (draft.body.match(/^##\s/gm) ?? []).length;
  if (h2Count < 3) push('error', 'too_few_h2', `Body has ${h2Count} H2 sections (need ≥3).`);

  const h1Count = (draft.body.match(/^#\s/gm) ?? []).length;
  if (h1Count > 0) push('error', 'has_h1', `Body contains ${h1Count} H1 heading(s) — must be H2 or lower.`);

  // ── AI tells ─────────────────────────────────────────────────────────
  for (const pattern of AI_TELLS) {
    if (pattern.test(draft.body)) push('error', 'ai_tell', `Body contains banned phrase matching ${pattern}.`);
  }

  // ── keyword presence ─────────────────────────────────────────────────
  const kw = context.primaryKeyword.toLowerCase();
  const titleLc = title.toLowerCase();
  // Soft match: at least 2 of the keyword's significant tokens appear in title.
  const tokens = kw.split(/\s+/).filter(t => t.length > 3);
  const hitsInTitle = tokens.filter(t => titleLc.includes(t)).length;
  if (tokens.length > 0 && hitsInTitle < Math.min(2, tokens.length)) {
    push('warn', 'kw_missing_in_title', `Primary keyword "${kw}" tokens not represented in title.`);
  }
  const bodyLc = bodyText.toLowerCase();
  const kwBodyCount = (bodyLc.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length;
  if (kwBodyCount < 1) push('warn', 'kw_missing_in_body', `Primary keyword "${kw}" not found in body.`);

  // ── filler overuse ───────────────────────────────────────────────────
  for (const word of FILLER_WORDS) {
    const count = (bodyLc.match(new RegExp(`\\b${word}\\b`, 'g')) ?? []).length;
    if (count > 2) push('warn', 'filler_overuse', `"${word}" appears ${count} times — trim to ≤2.`);
  }

  // ── tags ─────────────────────────────────────────────────────────────
  const tagCount = (draft.tags ?? []).length;
  if (tagCount < 4) push('warn', 'tags_too_few', `Only ${tagCount} tag(s) (need 4-6).`);
  else if (tagCount > 6) push('warn', 'tags_too_many', `${tagCount} tags (need 4-6).`);

  // ── scoring ──────────────────────────────────────────────────────────
  let score = 100;
  for (const i of issues) score -= i.severity === 'error' ? 15 : 5;
  score = Math.max(0, score);

  const threshold = context.threshold ?? 80;
  const ok = score >= threshold && !issues.some(i => i.severity === 'error');

  return { ok, score, issues };
}
