import { NextResponse } from 'next/server';
import { pickTodaysTopics } from '@/lib/content-pipeline/scheduler';

/**
 * POST /api/cron/schedule-posts
 *
 * Daily entrypoint. Calls the scheduler to pick today's quota (1–4 topics by
 * default — bounded by CONTENT_DAILY_MIN / CONTENT_DAILY_MAX env vars), then
 * dispatches each pick to /api/cron/generate-post in series. Returns when all
 * have been dispatched (not when they all finish — generation can run for 30s+
 * per post and we'd hit the 100s edge timeout if we waited).
 *
 * Designed for Railway's cron service: a single curl per day at e.g. 09:00 UTC
 * is enough. The randomness inside the scheduler spreads the actual publish
 * counts across the week.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function dispatch(siteUrl: string, secret: string, topicId: string, categoryId: string): Promise<{ topicId: string; ok: boolean; status: number }> {
  try {
    const r = await fetch(
      `${siteUrl}/api/cron/generate-post?topicId=${encodeURIComponent(topicId)}&categoryId=${encodeURIComponent(categoryId)}`,
      { method: 'POST', headers: { 'x-cron-secret': secret } },
    );
    return { topicId, ok: r.ok, status: r.status };
  } catch (e) {
    console.error(`dispatch ${topicId} threw: ${(e as Error).message}`);
    return { topicId, ok: false, status: 0 };
  }
}

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'cron_disabled' }, { status: 503 });
  if ((req.headers.get('x-cron-secret') || '').trim() !== secret) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const min = url.searchParams.get('min') ? Number(url.searchParams.get('min')) : undefined;
  const max = url.searchParams.get('max') ? Number(url.searchParams.get('max')) : undefined;
  const dryRun = url.searchParams.get('dryRun') === '1';

  const picks = await pickTodaysTopics({ min, max });

  if (dryRun) {
    return NextResponse.json({ cronVersion: 'schedule-posts-v1-2026-05-22', dryRun: true, picks });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://snakeonline.io';
  const results: Array<{ topicId: string; ok: boolean; status: number }> = [];
  // Sequential dispatch so we don't slam OpenAI in a 10-call burst — and so
  // generate-post's IndexNow pings space out (avoid hitting the 10k/day limit
  // we'd never realistically reach but courtesy is courtesy).
  for (const p of picks) {
    const r = await dispatch(siteUrl, secret, p.topicId, p.categoryId);
    results.push(r);
  }

  return NextResponse.json({
    cronVersion: 'schedule-posts-v1-2026-05-22',
    quotaPicked: picks.length,
    dispatched: results.filter(r => r.ok).length,
    failed: results.filter(r => !r.ok).length,
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
