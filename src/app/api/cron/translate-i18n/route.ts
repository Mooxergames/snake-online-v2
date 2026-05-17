import { NextResponse } from 'next/server';
import { promises as fs, existsSync } from 'fs';
import path from 'path';

/**
 * POST /api/cron/translate-i18n
 *
 * Reads canonical English blocks from `messages/en.json` and translates each
 * block — preserving JSON structure, keys, and placeholder tokens — into every
 * non-EN/TR locale via gpt-4o-mini. Writes results to `messages/{locale}.json`
 * and commits each file to GitHub so future Railway redeploys pick them up.
 *
 * Why a single generic endpoint:
 *  Previously every i18n block (skinTemplates, downloadsPage, bento, …) was
 *  injected as English fallback for 12 locales (DE, ES, PT, FR, IT, RU, AR,
 *  ZH, JA, KO, HI, ID). User-visible result: skin pages, downloads page,
 *  bento copy etc. were English on non-EN/non-TR routes — a major SEO hole.
 *  This route translates ALL of them in one batched run.
 *
 * Auth: `x-cron-secret: <CRON_SECRET>` header (or `?secret=…` on GET).
 *
 * Query params:
 *   - locale=de     → only translate German (defaults: all 12 non-EN/TR locales)
 *   - block=bento   → only this top-level i18n block (defaults: every block where
 *                     the locale's current value is byte-identical to en.json)
 *   - force=1       → translate even if the locale already has a non-EN value
 *                     (use when an existing translation needs refresh)
 *
 * Cost: ~14 blocks × 12 locales × 1 OpenAI call ≈ $0.20 to fully populate.
 *       Most runs touch only a few missing blocks → pennies.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

const TARGET_LOCALES = ['de', 'es', 'pt', 'fr', 'it', 'ru', 'ar', 'zh', 'ja', 'ko', 'hi', 'id'] as const;

const LANG_NAMES: Record<typeof TARGET_LOCALES[number], string> = {
  de: 'German', es: 'Spanish', pt: 'Portuguese (Brazilian)', fr: 'French',
  it: 'Italian', ru: 'Russian', ar: 'Arabic (MSA)', zh: 'Simplified Chinese',
  ja: 'Japanese', ko: 'Korean', hi: 'Hindi', id: 'Indonesian',
};

// The top-level i18n blocks the marketing site reads. Order = priority for
// shape-based translation budget. New blocks should be appended here.
const BLOCKS_TO_TRANSLATE = [
  'skinTemplates',
  'bento',
  'compare',
  'faq',
  'skinPage',
  'versus',
  'howToPlay',
  'downloadsPage',
  'blog',
  'marquee',
  // meta.pages is a SUB-block — handled separately
] as const;

async function callOpenAI(block: unknown, blockName: string, langName: string, apiKey: string): Promise<unknown | null> {
  const prompt = `You are translating an i18n JSON block from English to ${langName}.

Context: the block is named "${blockName}" and belongs to a snake-themed multiplayer game's marketing site (Snake Online — a real-time multiplayer .io snake battle royale).

Rules:
1. Return ONE JSON object with the SAME shape and SAME keys as the input.
2. Translate every string VALUE into natural, native ${langName}. Do NOT translate keys.
3. Preserve placeholder tokens like {name}, {country}, {rarity}, {min}, {year}, {count} EXACTLY where they appear inside strings.
4. Keep the brand "Snake Online" in English even inside translated strings.
5. Keep proper-noun game terms (Worms Zone, Slither.io, App Store, Google Play, Discord, iOS, Android, Windows, macOS) in English.
6. Country names should be translated naturally for the target language (Germany → Deutschland in German, etc.) — relevant for the "countries" map inside skinTemplates.
7. Skip any key whose name starts with underscore (_note, _comment) — keep its value unchanged.
8. Match the tone: gaming-blog confident, second-person ("you"), no emojis.
9. Output ONLY the JSON object — no markdown fences, no commentary, no leading newlines.

Input JSON to translate:
${JSON.stringify(block, null, 2)}`;

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You translate i18n JSON blocks. Always preserve keys exactly, only translate string values. Output a single valid JSON object.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });
  if (!res.ok) {
    console.error(`OpenAI translate-i18n ${blockName}→${langName}: ${res.status} ${(await res.text()).slice(0, 200)}`);
    return null;
  }
  const json = await res.json() as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    console.error(`parse fail: ${blockName}→${langName}`);
    return null;
  }
}

async function commitToGitHub(filePath: string, content: string, message: string): Promise<boolean> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) return false;
  let sha: string | undefined;
  try {
    const head = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    });
    if (head.ok) sha = ((await head.json()) as { sha?: string }).sha;
  } catch { /* file new */ }
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
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

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
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
  const localeParam = url.searchParams.get('locale');
  const blockParam = url.searchParams.get('block');
  const force = url.searchParams.get('force') === '1';

  const locales = localeParam
    ? [localeParam as typeof TARGET_LOCALES[number]].filter(l => TARGET_LOCALES.includes(l))
    : Array.from(TARGET_LOCALES);

  const blocks = blockParam
    ? [blockParam].filter(b => (BLOCKS_TO_TRANSLATE as readonly string[]).includes(b))
    : Array.from(BLOCKS_TO_TRANSLATE);

  if (locales.length === 0 || blocks.length === 0) {
    return NextResponse.json({ error: 'no_targets' }, { status: 400 });
  }

  const msgsDir = path.join(process.cwd(), 'messages');
  const enJson = JSON.parse(await fs.readFile(path.join(msgsDir, 'en.json'), 'utf8'));
  const useGit = Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);

  // STEP 1 — Translate every locale in PARALLEL (OpenAI calls dominate the
  // wall-clock; each locale is independent in-memory).
  const drafts = await Promise.all(
    locales.map(async (loc) => {
      const langName = LANG_NAMES[loc] || loc;
      const file = path.join(msgsDir, `${loc}.json`);
      if (!existsSync(file)) return { loc, status: 'no_file' as const };

      const localeJson = JSON.parse(await fs.readFile(file, 'utf8'));
      const translatedBlocks: string[] = [];
      const skippedBlocks: string[] = [];
      const failedBlocks: string[] = [];

      for (const blockName of blocks) {
        const enValue = (enJson as Record<string, unknown>)[blockName];
        if (enValue === undefined) {
          skippedBlocks.push(`${blockName}(missing-in-en)`);
          continue;
        }
        const localeValue = (localeJson as Record<string, unknown>)[blockName];
        if (!force && localeValue !== undefined && !deepEqual(localeValue, enValue)) {
          skippedBlocks.push(blockName);
          continue;
        }
        const translated = await callOpenAI(enValue, blockName, langName, apiKey);
        if (!translated) {
          failedBlocks.push(blockName);
          continue;
        }
        (localeJson as Record<string, unknown>)[blockName] = translated;
        translatedBlocks.push(blockName);
      }
      return {
        loc, langName, localeJson, file, translatedBlocks, skippedBlocks, failedBlocks,
        status: translatedBlocks.length > 0 ? ('ready' as const) : ('nothing_to_do' as const),
      };
    }),
  );

  // STEP 2 — Write files in parallel (different paths, no contention) but
  // commit to GitHub SEQUENTIALLY across locales. GitHub's Contents API
  // serialises branch updates and silently drops most concurrent PUTs.
  const results: Array<Record<string, unknown>> = [];
  for (const draft of drafts) {
    if (draft.status === 'no_file') { results.push({ locale: draft.loc, status: 'no_file' }); continue; }
    const { loc, langName, localeJson, file, translatedBlocks, skippedBlocks, failedBlocks } = draft;
    if (draft.status === 'nothing_to_do') {
      results.push({ locale: loc, status: 'nothing_to_do', skippedBlocks, failedBlocks });
      continue;
    }
    const newContent = JSON.stringify(localeJson, null, 2) + '\n';
    await fs.writeFile(file, newContent, 'utf8');

    let committed = false;
    if (useGit) {
      committed = await commitToGitHub(
        `messages/${loc}.json`,
        newContent,
        `i18n: translate ${translatedBlocks.join(',')} → ${langName}`,
      );
    }
    results.push({
      locale: loc, status: 'ok', translatedBlocks, skippedBlocks, failedBlocks, committed,
    });
  }

  return NextResponse.json({
    cronVersion: 'translate-i18n-v1-2026-05-17',
    locales: locales.length,
    blocks: blocks.length,
    results,
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
