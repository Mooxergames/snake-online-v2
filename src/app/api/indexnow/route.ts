import { NextResponse } from 'next/server';

/**
 * POST /api/indexnow
 * Body: { urls: string[] }  — array of fully-qualified URLs on this domain.
 *
 * Submits URLs to the IndexNow protocol (Bing, Yandex, Seznam, Naver, Yep).
 * Use it from CI / cron / a webhook on content publish.
 *
 * Auth: provide header `x-indexnow-secret: <INDEXNOW_KEY>` so random callers
 * can't burn through our submission quota.
 *
 * Reference: https://www.indexnow.org/documentation
 */

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow';
const KEY = process.env.INDEXNOW_KEY || 'snakeonlineio2026indexnowkey';
const HOST = (process.env.NEXT_PUBLIC_SITE_URL || 'https://snakeonline.io').replace(/^https?:\/\//, '');

export async function POST(req: Request) {
  if ((req.headers.get('x-indexnow-secret') || '').trim() !== KEY) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const urls = Array.isArray(body?.urls) ? body.urls.filter((u: unknown): u is string => typeof u === 'string') : [];
  if (urls.length === 0) return NextResponse.json({ error: 'no_urls' }, { status: 400 });
  if (urls.length > 10_000) return NextResponse.json({ error: 'too_many_urls', limit: 10000 }, { status: 400 });

  // All URLs must live under HOST per IndexNow spec — reject foreign hosts.
  const bad = urls.filter((u: string) => !u.startsWith(`https://${HOST}/`) && !u.startsWith(`http://${HOST}/`));
  if (bad.length) return NextResponse.json({ error: 'foreign_host', samples: bad.slice(0, 3) }, { status: 400 });

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  };

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  return NextResponse.json(
    {
      submitted: urls.length,
      indexnow_status: res.status,
      ok: res.ok,
    },
    { status: res.ok ? 200 : 502 },
  );
}

/**
 * GET /api/indexnow → trigger a full-site resubmission (sitemap-derived).
 * Useful from a cron / webhook after a marketing push. Requires the same secret.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get('secret') !== KEY) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://snakeonline.io';
  // Re-using POST handler with a minimal canonical set; for the full skin catalog,
  // call POST in batches of 10k.
  const urls = [
    `${siteUrl}/en`,
    `${siteUrl}/en/play`,
    `${siteUrl}/en/snakes`,
    `${siteUrl}/en/how-to-play`,
    `${siteUrl}/en/vs/wormzone-io`,
    `${siteUrl}/en/vs/slither-io`,
  ];
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls,
    }),
    cache: 'no-store',
  });
  return NextResponse.json({ submitted: urls.length, indexnow_status: res.status }, { status: res.ok ? 200 : 502 });
}
