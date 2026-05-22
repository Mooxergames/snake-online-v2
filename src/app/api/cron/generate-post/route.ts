import { NextResponse } from 'next/server';
import { promises as fs, existsSync } from 'fs';
import path from 'path';
import { findTopic, loadAllTopics, isSkinTopic, topicToPostSlug, type Topic, type SkinTopic } from '@/lib/content-pipeline/topics';
import { buildPrompt, type PromptOutput } from '@/lib/content-pipeline/prompts';
import { runSeoGate, type GateResult } from '@/lib/content-pipeline/seo-gate';
import { commitFile, readGitHubEnv } from '@/lib/content-pipeline/github';
import type { BlogCategorySlug } from '@/lib/blog-data';

/**
 * POST /api/cron/generate-post
 *
 * v5 — May 2026 rewrite.
 *
 * Generates ONE English blog post per call:
 *   1. Resolves the topic (via ?topicId, ?slug, or random pick).
 *   2. Builds a category-specific prompt from src/lib/content-pipeline/prompts.ts.
 *   3. Calls OpenAI gpt-4o-mini with structured-JSON output.
 *   4. Runs seo-gate validation. Retries once with sharper instructions if gate fails.
 *   5. Writes the EN markdown file + commits to GitHub.
 *   6. Fan-out: dispatches translate-post for each of 13 non-EN locales.
 *   7. Pings IndexNow with the new URLs.
 *
 * The locale-by-locale fan-out is HTTP, not in-process. That isolates failures
 * (one locale's OpenAI flake can't crash the others) and keeps the cron under
 * the 100s edge timeout.
 *
 * Auth: `x-cron-secret` header (POST) or `?secret=` query (GET).
 *
 * Params:
 *   topicId=<id>      — pick a specific topic from the keyword bank / catalog
 *   categoryId=<slug> — random pick within a category (used by schedule-posts)
 *   force=1           — overwrite an existing EN post
 *   dryRun=1          — return the draft + gate report without committing
 *   skipTranslate=1   — don't fan-out to translate-post
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';
const LOCALES = ['en', 'tr', 'de', 'es', 'pt', 'fr', 'it', 'ru', 'ar', 'zh', 'ja', 'ko', 'hi', 'id'] as const;
const SCORE_THRESHOLD = Number(process.env.SEO_SCORE_THRESHOLD) || 80;

async function callOpenAI(system: string, user: string, apiKey: string, retryNote?: string): Promise<PromptOutput | null> {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: retryNote ? `${user}\n\nRETRY NOTE: ${retryNote}` : user },
      ],
      temperature: 0.7,
      max_tokens: 2400,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`OpenAI ${res.status}: ${body.slice(0, 300)}`);
    return null;
  }
  const j = await res.json() as { choices?: { message?: { content?: string } }[] };
  const content = j.choices?.[0]?.message?.content;
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as PromptOutput;
    if (!parsed.title || !parsed.description || !parsed.body) return null;
    parsed.tags = parsed.tags ?? [];
    parsed.internalLinkSlugs = parsed.internalLinkSlugs ?? [];
    return parsed;
  } catch {
    return null;
  }
}

function frontmatter(topic: Topic, draft: PromptOutput, gate: GateResult): string {
  const tags = (draft.tags ?? []).map(t => `"${t.replace(/"/g, '\\"')}"`).join(', ');
  const faqJson = JSON.stringify(draft.faq ?? []);
  const fields: string[] = [
    '---',
    `title: "${draft.title.replace(/"/g, '\\"')}"`,
    `description: "${draft.description.replace(/"/g, '\\"')}"`,
    `date: "${new Date().toISOString()}"`,
    `author: "Snake Online Studio"`,
    `category: "${topic.categoryId}"`,
    `tags: [${tags}]`,
    `topicId: "${topic.id}"`,
    `primaryKeyword: "${topic.primary.replace(/"/g, '\\"')}"`,
    `isAiGenerated: true`,
    `featured: false`,
    `seoScore: ${gate.score}`,
  ];
  if (isSkinTopic(topic)) {
    fields.push(`coverSkinId: "${topic.skin.id}"`);
    fields.push(`cover: "/snakes/${topic.skin.id}.png"`);
    fields.push(`relatedSkinSlug: "${topic.skin.slug}"`);
  }
  if (draft.faq && draft.faq.length > 0) {
    fields.push(`faq: ${JSON.stringify(draft.faq)}`);
  }
  // Suggested slugs go into frontmatter so audit cron can verify them post-publish
  if (draft.internalLinkSlugs && draft.internalLinkSlugs.length > 0) {
    fields.push(`suggestedLinks: ${JSON.stringify(draft.internalLinkSlugs)}`);
  }
  fields.push('---', '', draft.body, '');
  return fields.join('\n');
}

interface GenerateBody {
  topic: Topic;
  draft: PromptOutput;
  gate: GateResult;
  slug: string;
  relPath: string;
  file: string;
}

async function generateOne(topic: Topic, apiKey: string): Promise<{ ok: true; data: GenerateBody } | { ok: false; reason: string; gate?: GateResult; draft?: PromptOutput }> {
  const { system, user } = buildPrompt(topic);
  let draft = await callOpenAI(system, user, apiKey);
  if (!draft) return { ok: false, reason: 'openai_empty' };

  let gate = runSeoGate(draft, { primaryKeyword: topic.primary, threshold: SCORE_THRESHOLD });
  if (!gate.ok) {
    const note = gate.issues.slice(0, 5).map(i => `- ${i.code}: ${i.message}`).join('\n');
    draft = await callOpenAI(system, user, apiKey, `Previous draft failed the SEO gate. Fix:\n${note}`);
    if (!draft) return { ok: false, reason: 'openai_retry_empty', gate };
    gate = runSeoGate(draft, { primaryKeyword: topic.primary, threshold: SCORE_THRESHOLD });
  }
  if (!gate.ok) return { ok: false, reason: 'seo_gate_failed', gate, draft };

  const slug = topicToPostSlug(topic);
  const relPath = `src/content/blog/en/${slug}.md`;
  const file = frontmatter(topic, draft, gate);
  return { ok: true, data: { topic, draft, gate, slug, relPath, file } };
}

async function maybeWriteLocal(relPath: string, file: string): Promise<void> {
  try {
    const abs = path.join(process.cwd(), relPath);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, file, 'utf8');
  } catch (e) {
    console.warn(`Local FS write skipped: ${(e as Error).message}`);
  }
}

async function dispatchTranslation(slug: string, locale: string, siteUrl: string, secret: string): Promise<void> {
  try {
    await fetch(`${siteUrl}/api/cron/translate-post?slug=${encodeURIComponent(slug)}&locale=${locale}`, {
      method: 'POST',
      headers: { 'x-cron-secret': secret },
    });
  } catch (e) {
    console.warn(`translate-post dispatch failed (${locale}): ${(e as Error).message}`);
  }
}

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'cron_disabled' }, { status: 503 });
  if ((req.headers.get('x-cron-secret') || '').trim() !== secret) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'openai_key_missing' }, { status: 503 });

  const url = new URL(req.url);
  const topicId = url.searchParams.get('topicId');
  const categoryId = url.searchParams.get('categoryId') as BlogCategorySlug | null;
  const legacySlug = url.searchParams.get('slug');
  const force = url.searchParams.get('force') === '1';
  const dryRun = url.searchParams.get('dryRun') === '1';
  const skipTranslate = url.searchParams.get('skipTranslate') === '1';

  // Resolve the topic.
  let topic: Topic | undefined;
  if (topicId) topic = await findTopic(topicId);
  if (!topic && legacySlug) {
    const all = await loadAllTopics();
    topic = all.find(t => isSkinTopic(t) && (t as SkinTopic).skin.slug === legacySlug);
  }
  if (!topic && categoryId) {
    const all = await loadAllTopics();
    const inCat = all.filter(t => t.categoryId === categoryId);
    if (inCat.length > 0) topic = inCat[Math.floor(Math.random() * inCat.length)];
  }
  if (!topic) {
    const all = await loadAllTopics();
    topic = all[Math.floor(Math.random() * all.length)];
  }
  if (!topic) return NextResponse.json({ error: 'no_topics' }, { status: 503 });

  // Skip if EN post already exists (unless force).
  const slug = topicToPostSlug(topic);
  const relPath = `src/content/blog/en/${slug}.md`;
  const abs = path.join(process.cwd(), relPath);
  if (!force && existsSync(abs)) {
    return NextResponse.json({ ok: true, skipped: 'already_exists', topicId: topic.id, slug });
  }

  // Generate.
  const result = await generateOne(topic, apiKey);
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason, gate: result.gate, topicId: topic.id }, { status: 422 });
  }
  const { data } = result;

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      topicId: topic.id,
      slug: data.slug,
      title: data.draft.title,
      description: data.draft.description,
      gate: data.gate,
      bodyPreview: data.draft.body.slice(0, 400),
    });
  }

  // Write + commit EN only. Translations happen in /translate-post.
  await maybeWriteLocal(data.relPath, data.file);
  const env = readGitHubEnv();
  let committed = false;
  if (env) {
    committed = await commitFile(env, data.relPath, data.file, `blog: ${topic.categoryId} — ${data.draft.title.slice(0, 60)}`);
  }

  // Fan-out translations.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://snakeonline.io';
  if (committed && !skipTranslate) {
    // Don't await — fire-and-forget so we return promptly.
    Promise.all(
      LOCALES.filter(l => l !== 'en').map(l => dispatchTranslation(data.slug, l, siteUrl, secret)),
    ).catch(() => { /* logged inside dispatchTranslation */ });
  }

  // IndexNow ping.
  if (committed && process.env.INDEXNOW_KEY) {
    try {
      await fetch(`${siteUrl}/api/indexnow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-indexnow-secret': process.env.INDEXNOW_KEY },
        body: JSON.stringify({ urls: [`${siteUrl}/en/news/${data.slug}`] }),
      });
    } catch { /* non-fatal */ }
  }

  return NextResponse.json({
    cronVersion: 'generate-post-v5-2026-05-22',
    ok: true,
    topicId: topic.id,
    categoryId: topic.categoryId,
    slug: data.slug,
    committed,
    seoScore: data.gate.score,
    issues: data.gate.issues,
    translationsDispatched: committed && !skipTranslate ? LOCALES.length - 1 : 0,
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get('secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  return POST(new Request(req.url, {
    method: 'POST',
    headers: { 'x-cron-secret': process.env.CRON_SECRET || '' },
  }));
}
