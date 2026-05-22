import { NextResponse } from 'next/server';
import { promises as fs, existsSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { commitFile, getFileContent, readGitHubEnv } from '@/lib/content-pipeline/github';

/**
 * POST /api/cron/translate-post?slug=<post-slug>&locale=<target>
 *
 * Reads the EN markdown for `slug`, asks OpenAI to translate the entire
 * frontmatter + body into the target locale, and commits the result to
 * src/content/blog/{locale}/{slug}.md.
 *
 * Why a dedicated route? generate-post used to translate inline by re-generating
 * the prompt per locale, which produced 14 independent drafts whose facts could
 * drift (price changed, lore wording shifted between languages). Translating one
 * verified EN source keeps all 14 versions aligned.
 *
 * Translation prompt protects brand whitelisted nouns (Snake Online, slither.io,
 * Photon, Unity, Discord, App Store, iOS, Android), preserves numbers, and
 * rewrites the TITLE + DESCRIPTION as a fresh locale-native pair rather than a
 * literal translation — Google's duplicate-content classifier is more forgiving
 * of varied title language than verbatim translations.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

const LANG_NAMES: Record<string, string> = {
  tr: 'Turkish', de: 'German', es: 'Spanish', pt: 'Portuguese (Brazilian)',
  fr: 'French', it: 'Italian', ru: 'Russian', ar: 'Arabic (MSA)',
  zh: 'Simplified Chinese', ja: 'Japanese', ko: 'Korean', hi: 'Hindi', id: 'Indonesian',
};

const BRAND_WHITELIST = [
  'Snake Online', 'slither.io', 'Slither.io', 'Worms Zone', 'Photon', 'Unity',
  'Discord', 'App Store', 'Google Play', 'iOS', 'Android', 'Nokia', 'WebSocket',
];

interface TranslatedShape {
  title: string;
  description: string;
  body: string;
  tags: string[];
  faq?: Array<{ q: string; a: string }>;
}

function buildPrompt(en: { title: string; description: string; body: string; tags: string[]; faq?: Array<{ q: string; a: string }>; primaryKeyword?: string }, langName: string): string {
  return [
    `You are a senior gaming editor and translator. Translate the following English blog post into natural, native ${langName}.`,
    '',
    `Keep these brand names in English regardless of target language: ${BRAND_WHITELIST.join(', ')}.`,
    '',
    'Translation rules:',
    '- Translate every visible string into ' + langName + ' (H2 headings, body paragraphs, bullets, tags, FAQ pairs).',
    '- Preserve every number, date, statistic, and proper noun.',
    '- Keep Markdown structure exactly: same number of H2 sections, same code fences, same lists.',
    '- The TITLE and DESCRIPTION must be REWRITTEN as a locale-native SEO pair (NOT a literal translation). Same meaning, native idioms, 50-65 chars (title) and 140-160 chars (description). Avoid clickbait, no exclamation marks.',
    '- Tone: gaming-blog editorial, second-person, no marketing fluff, no emojis.',
    '- If a gaming term lacks an established target-language convention, use the most common gaming-industry term in that language. Never invent.',
    '',
    'Output ONE JSON object with this exact shape and nothing else:',
    '{"title": "...", "description": "...", "body": "<markdown>", "tags": ["...", "..."], "faq": [{"q": "...", "a": "..."}]}',
    '',
    'SOURCE POST:',
    '',
    'Title: ' + en.title,
    'Description: ' + en.description,
    en.primaryKeyword ? 'Primary keyword (for context): ' + en.primaryKeyword : '',
    '',
    'Tags: ' + en.tags.join(', '),
    en.faq && en.faq.length > 0 ? 'FAQ: ' + JSON.stringify(en.faq) : '',
    '',
    'Body:',
    en.body,
  ].filter(Boolean).join('\n');
}

async function translate(en: { title: string; description: string; body: string; tags: string[]; faq?: Array<{ q: string; a: string }>; primaryKeyword?: string }, langName: string, apiKey: string): Promise<TranslatedShape | null> {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a senior translator and SEO copywriter. Output ONLY valid JSON.' },
        { role: 'user', content: buildPrompt(en, langName) },
      ],
      temperature: 0.4,
      max_tokens: 3000,
    }),
  });
  if (!res.ok) {
    console.error(`OpenAI translate ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return null;
  }
  const j = await res.json() as { choices?: { message?: { content?: string } }[] };
  const content = j.choices?.[0]?.message?.content;
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as TranslatedShape;
    if (!parsed.title || !parsed.description || !parsed.body) return null;
    parsed.tags = parsed.tags ?? [];
    return parsed;
  } catch {
    return null;
  }
}

async function readEnPost(slug: string): Promise<{ raw: string; fm: Record<string, unknown>; body: string } | null> {
  const env = readGitHubEnv();
  const relPath = `src/content/blog/en/${slug}.md`;

  // Prefer local FS read (works in dev). Fall back to GitHub Contents API.
  let raw: string | null = null;
  const abs = path.join(process.cwd(), relPath);
  if (existsSync(abs)) {
    raw = await fs.readFile(abs, 'utf8');
  } else if (env) {
    raw = await getFileContent(env, relPath);
  }
  if (!raw) return null;

  const parsed = matter(raw);
  return { raw, fm: parsed.data, body: parsed.content };
}

function rebuildFrontmatter(fm: Record<string, unknown>, translated: TranslatedShape): string {
  const cloned: Record<string, unknown> = { ...fm };
  cloned.title = translated.title;
  cloned.description = translated.description;
  cloned.tags = translated.tags;
  if (translated.faq) cloned.faq = translated.faq;

  const lines: string[] = ['---'];
  for (const [key, value] of Object.entries(cloned)) {
    if (value === undefined) continue;
    if (typeof value === 'string') {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  lines.push('---', '', translated.body, '');
  return lines.join('\n');
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
  const slug = url.searchParams.get('slug');
  const locale = url.searchParams.get('locale');
  const force = url.searchParams.get('force') === '1';

  if (!slug || !locale) return NextResponse.json({ error: 'missing_params', need: ['slug', 'locale'] }, { status: 400 });
  if (locale === 'en') return NextResponse.json({ error: 'cannot_translate_to_source' }, { status: 400 });
  const langName = LANG_NAMES[locale];
  if (!langName) return NextResponse.json({ error: 'unsupported_locale', locale }, { status: 400 });

  const en = await readEnPost(slug);
  if (!en) return NextResponse.json({ error: 'en_post_not_found', slug }, { status: 404 });

  // Skip if target already exists.
  const targetRel = `src/content/blog/${locale}/${slug}.md`;
  const targetAbs = path.join(process.cwd(), targetRel);
  if (!force && existsSync(targetAbs)) {
    return NextResponse.json({ ok: true, skipped: 'already_exists', slug, locale });
  }

  const primaryKeyword = typeof en.fm.primaryKeyword === 'string' ? en.fm.primaryKeyword : undefined;
  const enTitle = typeof en.fm.title === 'string' ? en.fm.title : slug;
  const enDesc = typeof en.fm.description === 'string' ? en.fm.description : '';
  const enTags = Array.isArray(en.fm.tags) ? en.fm.tags.filter((t): t is string => typeof t === 'string') : [];
  const enFaq = Array.isArray(en.fm.faq) ? en.fm.faq as Array<{ q: string; a: string }> : undefined;

  const translated = await translate({
    title: enTitle,
    description: enDesc,
    body: en.body,
    tags: enTags,
    faq: enFaq,
    primaryKeyword,
  }, langName, apiKey);
  if (!translated) return NextResponse.json({ ok: false, reason: 'translate_failed' }, { status: 502 });

  const file = rebuildFrontmatter(en.fm, translated);

  // Write local + commit.
  try {
    await fs.mkdir(path.dirname(targetAbs), { recursive: true });
    await fs.writeFile(targetAbs, file, 'utf8');
  } catch { /* non-fatal */ }

  const env = readGitHubEnv();
  let committed = false;
  if (env) {
    committed = await commitFile(env, targetRel, file, `blog: translate ${slug} → ${langName}`);
  }

  // Per-locale IndexNow ping.
  if (committed && process.env.INDEXNOW_KEY) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://snakeonline.io';
    try {
      await fetch(`${siteUrl}/api/indexnow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-indexnow-secret': process.env.INDEXNOW_KEY },
        body: JSON.stringify({ urls: [`${siteUrl}/${locale}/news/${slug}`] }),
      });
    } catch { /* non-fatal */ }
  }

  return NextResponse.json({
    cronVersion: 'translate-post-v1-2026-05-22',
    ok: true,
    slug,
    locale,
    committed,
    title: translated.title,
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
