import { NextResponse } from 'next/server';
import { getAllSkins, type Skin } from '@/lib/skins';
import { promises as fs, existsSync } from 'fs';
import path from 'path';

// This route writes files + calls OpenAI — must run on Node, not Edge.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/cron/generate-post
 *
 * Picks one (or up to `?n=10`) skins that doesn't yet have a skin-spotlight
 * blog post and asks OpenAI gpt-4o-mini to generate a localized post for
 * each of the 14 site locales.
 *
 * Auth: `x-cron-secret: <CRON_SECRET>` header. Set CRON_SECRET in Railway env.
 *
 * Writes posts to:
 *   src/content/blog/{locale}/skin-spotlight-{slug}.md
 *
 * Caveats:
 *   - On a stateless host (Vercel) the filesystem write is ephemeral and the
 *     deployment must be rebuilt for the post to appear publicly. On Railway
 *     with persistent volume mounting the repo, the file persists.
 *   - To make the writes survive a redeploy, set GITHUB_TOKEN + GITHUB_REPO
 *     and the route will commit each post to git via the GitHub Contents API.
 *
 * Cost: gpt-4o-mini at May-2026 prices: ~$0.0003 per 800-word post × 14 locales
 *   ≈ $0.004 per skin × 200 skins × 14 ≈ $11 to fully populate the blog once.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';
const LOCALES = ['en', 'tr', 'de', 'es', 'pt', 'fr', 'it', 'ru', 'ar', 'zh', 'ja', 'ko', 'hi', 'id'] as const;

const LANG_NAMES: Record<typeof LOCALES[number], string> = {
  en: 'English', tr: 'Turkish', de: 'German', es: 'Spanish', pt: 'Portuguese (Brazilian)',
  fr: 'French', it: 'Italian', ru: 'Russian', ar: 'Arabic (MSA)', zh: 'Simplified Chinese',
  ja: 'Japanese', ko: 'Korean', hi: 'Hindi', id: 'Indonesian',
};

interface PromptOutput {
  title: string;
  description: string;
  body: string;
  tags: string[];
}

function buildPrompt(skin: Skin, lang: string) {
  return `You are writing a "Skin Spotlight" blog post for Snake Online, a free multiplayer .io snake battle royale game with 200+ collectible skins and 5M+ players worldwide.

Write the post entirely in ${lang}.

Subject of this post — a snake skin:
- Name: ${skin.name}
- Rarity: ${skin.rarity}
- Category: ${skin.isCountry ? 'Country flag skin' : 'Fantasy skin'}
- Lore / description hint: ${skin.description}
- Unlock method: ${skin.obtainHint}
- Asset image URL (for reference, do NOT embed inline): /snakes/${skin.id}.png

Requirements:
1. Title — 50-65 chars, includes the skin name + a hook word. Avoid clickbait.
2. Description — 140-160 chars, SEO-friendly, includes "Snake Online" once and the skin name once.
3. Body (Markdown, 500-700 words):
   - Open with a one-paragraph hook (no h2 heading on the opening).
   - "Lore & origin" section (h2) — 2-3 short paragraphs.
   - "Why it stands out" section (h2) — bullet list of 3-5 design / mechanical highlights.
   - "How to unlock" section (h2) — concrete steps based on the unlock method above.
   - "Where to use it" section (h2) — strategy tip referencing 1-2 game mechanics (coil traps, boost economy, perimeter survival, leaderboard climbs).
   - End with a single-sentence call to play.
4. Tags — array of 4-6 short tags. Include "snake online", "skin spotlight", the rarity tier, and the skin name.
5. Do NOT include front-matter, just the four fields below in this exact JSON shape:

{"title": "...", "description": "...", "body": "<markdown>", "tags": ["...", "..."]}

Tone: gaming-blog, confident, second-person ("you"), no marketing fluff, no emojis.
Mention Snake Online by name at most twice in the body.
Keep paragraphs to 2-4 sentences.
${lang !== 'English' ? `Output everything (title, description, body, tags) in ${lang}, but keep "Snake Online" as a brand name in English.` : ''}
`.trim();
}

async function generateForLocale(skin: Skin, locale: string, apiKey: string): Promise<PromptOutput | null> {
  const langName = LANG_NAMES[locale as typeof LOCALES[number]] || 'English';
  const prompt = buildPrompt(skin, langName);

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You write SEO-optimized blog posts. Output ONLY valid JSON matching the requested shape.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`OpenAI ${locale} → ${res.status}: ${errBody.slice(0, 300)}`);
    return null;
  }
  const json = await res.json() as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as PromptOutput;
    if (!parsed.title || !parsed.description || !parsed.body) return null;
    return parsed;
  } catch {
    return null;
  }
}

function buildFrontmatter(skin: Skin, post: PromptOutput, locale: string): string {
  const date = new Date().toISOString();
  const tags = (post.tags || []).map(t => `"${t.replace(/"/g, '\\"')}"`).join(', ');
  return [
    '---',
    `title: "${post.title.replace(/"/g, '\\"')}"`,
    `description: "${post.description.replace(/"/g, '\\"')}"`,
    `date: "${date}"`,
    `author: "Snake Online Studio"`,
    `category: "skin-spotlight"`,
    `tags: [${tags}]`,
    `cover: "/snakes/${skin.id}.png"`,
    `coverSkinId: "${skin.id}"`,
    `relatedSkinSlug: "${skin.slug}"`,
    `isAiGenerated: true`,
    'featured: false',
    '---',
    '',
    post.body,
    '',
  ].join('\n');
}

async function commitToGitHub(filePath: string, content: string, message: string): Promise<boolean> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // e.g. "Mooxergames/snake-online-v2"
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) return false;

  // Get current SHA if file already exists.
  let sha: string | undefined;
  try {
    const headRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    });
    if (headRes.ok) {
      const j = await headRes.json() as { sha?: string };
      sha = j.sha;
    }
  } catch { /* file doesn't exist yet */ }

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch,
      ...(sha ? { sha } : {}),
      committer: { name: 'Snake Online Bot', email: 'bot@snakeonline.io' },
    }),
  });

  return res.ok;
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
  const n = Math.min(10, Math.max(1, Number(url.searchParams.get('n')) || 1));
  const useGit = process.env.GITHUB_TOKEN && process.env.GITHUB_REPO;

  // Pick N skins without an existing English skin-spotlight post.
  const skins = getAllSkins();
  const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
  const candidates = skins.filter(s => !existsSync(path.join(blogDir, 'en', `skin-spotlight-${s.slug}.md`)));
  // Shuffle so we don't always start with the same skin.
  candidates.sort(() => Math.random() - 0.5);
  const chosen = candidates.slice(0, n);

  const results: Array<{ skin: string; locales: string[]; committed: boolean }> = [];

  for (const skin of chosen) {
    // Fan out OpenAI requests for all 14 locales in parallel — was 70-140s
    // sequential, now ~5-15s (Cloudflare's 100s edge timeout stays safe).
    const posts = await Promise.all(
      LOCALES.map(locale => generateForLocale(skin, locale, apiKey).then(post => ({ locale, post }))),
    );

    // FS writes parallel — different file paths, no contention.
    const writtenLocales: string[] = [];
    const fsWrites = posts.map(async ({ locale, post }) => {
      if (!post) return null;
      const file = buildFrontmatter(skin, post, locale);
      const relPath = `src/content/blog/${locale}/skin-spotlight-${skin.slug}.md`;
      const absPath = path.join(process.cwd(), relPath);
      try {
        await fs.mkdir(path.dirname(absPath), { recursive: true });
        await fs.writeFile(absPath, file, 'utf8');
      } catch (e) {
        console.error(`fs write failed for ${relPath}:`, (e as Error).message);
      }
      return { locale, file, relPath };
    });
    const written = (await Promise.all(fsWrites)).filter((x): x is NonNullable<typeof x> => x !== null);
    for (const w of written) writtenLocales.push(w.locale);

    // GitHub commits SEQUENTIAL. The Contents API serialises updates to the
    // same branch and silently drops most concurrent PUTs (observed: 1/14
    // landing under parallel fan-out). Sequential is fast enough (~150ms per
    // call × 14 = ~2s) and 100% reliable.
    const committedLocales: string[] = [];
    if (useGit) {
      for (const w of written) {
        const ok = await commitToGitHub(
          w.relPath,
          w.file,
          `blog: skin spotlight — ${skin.name} (${w.locale})`,
        );
        if (ok) committedLocales.push(w.locale);
        else console.warn(`github commit failed for ${w.relPath}`);
      }
    }

    results.push({
      skin: skin.slug,
      locales: writtenLocales,
      committed: useGit ? committedLocales.length === writtenLocales.length : false,
    });
  }

  // Best-effort: ping IndexNow with the new URLs (English only, the index will
  // discover other locales via hreflang).
  if (process.env.INDEXNOW_KEY) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://snakeonline.io';
    const urls = chosen.map(s => `${siteUrl}/en/news/skin-spotlight-${s.slug}`);
    try {
      await fetch(`${siteUrl}/api/indexnow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-indexnow-secret': process.env.INDEXNOW_KEY },
        body: JSON.stringify({ urls }),
      });
    } catch { /* ignore */ }
  }

  return NextResponse.json({
    generated: chosen.length,
    skipped: skins.length - candidates.length,
    remaining: candidates.length - chosen.length,
    results,
  });
}

/** GET version for cron services that only support GET (cron-job.org, Railway). */
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
