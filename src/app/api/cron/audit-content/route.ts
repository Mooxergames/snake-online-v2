import { NextResponse } from 'next/server';
import { promises as fs, existsSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { runSeoGate } from '@/lib/content-pipeline/seo-gate';
import { commitFile, readGitHubEnv } from '@/lib/content-pipeline/github';

/**
 * POST /api/cron/audit-content
 *
 * Nightly post-publish quality scan. Walks the 14 locale folders under
 * src/content/blog/, runs the same gate logic that the publisher uses, plus
 * a few cross-post checks (hreflang coverage, duplicate titles, missing
 * translations). Writes a JSON report into content/audits/{date}.json — easy
 * to diff in PR review and to graph over time.
 *
 * Does NOT auto-fix anything. The output is a diagnostic. Re-generating a
 * failing post is a manual call (curl with ?force=1) so we never silently
 * rewrite human-edited content.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOCALES = ['en', 'tr', 'de', 'es', 'pt', 'fr', 'it', 'ru', 'ar', 'zh', 'ja', 'ko', 'hi', 'id'] as const;

interface PostAudit {
  slug: string;
  locale: string;
  title: string;
  seoScore: number;
  issues: Array<{ severity: string; code: string; message: string }>;
}

interface CrossCheck {
  slug: string;
  presentIn: string[];
  missingFrom: string[];
}

async function readPost(locale: string, slug: string): Promise<{ fm: Record<string, unknown>; body: string } | null> {
  const p = path.join(process.cwd(), 'src', 'content', 'blog', locale, `${slug}.md`);
  if (!existsSync(p)) return null;
  try {
    const raw = await fs.readFile(p, 'utf8');
    const parsed = matter(raw);
    return { fm: parsed.data, body: parsed.content };
  } catch {
    return null;
  }
}

async function listSlugs(locale: string): Promise<string[]> {
  const dir = path.join(process.cwd(), 'src', 'content', 'blog', locale);
  if (!existsSync(dir)) return [];
  try {
    return (await fs.readdir(dir))
      .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
      .map(f => f.replace(/\.mdx?$/, ''));
  } catch {
    return [];
  }
}

function s(v: unknown): string { return typeof v === 'string' ? v : ''; }

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'cron_disabled' }, { status: 503 });
  if ((req.headers.get('x-cron-secret') || '').trim() !== secret) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const limit = Math.min(500, Math.max(5, Number(url.searchParams.get('limit')) || 60));

  const posts: PostAudit[] = [];

  // En is the source of truth — audit it fully.
  const enSlugs = (await listSlugs('en')).slice(0, limit);

  // Hreflang coverage check: build {slug: presentIn[]}
  const presenceMap = new Map<string, string[]>();
  for (const slug of enSlugs) presenceMap.set(slug, ['en']);

  for (const locale of LOCALES) {
    if (locale === 'en') continue;
    const slugs = await listSlugs(locale);
    for (const slug of slugs) {
      if (presenceMap.has(slug)) presenceMap.get(slug)!.push(locale);
    }
  }

  // Per-post audit (EN only for the SEO gate — translated posts have their
  // own length characteristics that the EN-tuned gate would false-flag).
  for (const slug of enSlugs) {
    const post = await readPost('en', slug);
    if (!post) continue;
    const draft = {
      title: s(post.fm.title),
      description: s(post.fm.description),
      body: post.body,
      tags: Array.isArray(post.fm.tags) ? post.fm.tags.filter((t): t is string => typeof t === 'string') : [],
      internalLinkSlugs: Array.isArray(post.fm.suggestedLinks) ? post.fm.suggestedLinks.filter((t): t is string => typeof t === 'string') : [],
    };
    const primaryKeyword = s(post.fm.primaryKeyword) || s(post.fm.title);
    const gate = runSeoGate(draft, { primaryKeyword });
    posts.push({
      slug,
      locale: 'en',
      title: draft.title,
      seoScore: gate.score,
      issues: gate.issues,
    });
  }

  // Cross-post: missing translations.
  const crossChecks: CrossCheck[] = [];
  for (const [slug, presentIn] of presenceMap.entries()) {
    const missingFrom = LOCALES.filter(l => !presentIn.includes(l));
    if (missingFrom.length > 0) {
      crossChecks.push({ slug, presentIn: [...presentIn], missingFrom });
    }
  }

  // Duplicate-title detection within a locale (cannibalization signal).
  const dupTitles: Array<{ locale: string; title: string; slugs: string[] }> = [];
  for (const locale of LOCALES) {
    const slugs = await listSlugs(locale);
    const titleMap = new Map<string, string[]>();
    for (const slug of slugs) {
      const post = await readPost(locale, slug);
      if (!post) continue;
      const t = s(post.fm.title).trim().toLowerCase();
      if (!t) continue;
      titleMap.set(t, [...(titleMap.get(t) ?? []), slug]);
    }
    for (const [title, ss] of titleMap.entries()) {
      if (ss.length > 1) dupTitles.push({ locale, title, slugs: ss });
    }
  }

  const summary = {
    cronVersion: 'audit-content-v1-2026-05-22',
    runAt: new Date().toISOString(),
    enPostsAudited: posts.length,
    avgScore: posts.length > 0 ? Math.round(posts.reduce((s, p) => s + p.seoScore, 0) / posts.length) : 0,
    failingPosts: posts.filter(p => p.issues.some(i => i.severity === 'error')).length,
    missingTranslations: crossChecks.length,
    duplicateTitles: dupTitles.length,
  };

  const report = { summary, posts, crossChecks, dupTitles };
  const reportText = JSON.stringify(report, null, 2);
  const today = new Date().toISOString().slice(0, 10);
  const relPath = `content/audits/${today}.json`;

  // Write local + commit.
  try {
    const abs = path.join(process.cwd(), relPath);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, reportText, 'utf8');
  } catch { /* non-fatal */ }
  const env = readGitHubEnv();
  let committed = false;
  if (env) {
    committed = await commitFile(env, relPath, reportText, `audit: content scan ${today} (${summary.avgScore} avg, ${summary.failingPosts} failing)`);
  }

  return NextResponse.json({ ...summary, committed });
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
