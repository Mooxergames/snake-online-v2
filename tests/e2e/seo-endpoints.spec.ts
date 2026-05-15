import { test, expect } from '@playwright/test';

/**
 * Smoke tests for the crawl-infrastructure surface — sitemaps, robots.txt,
 * llms.txt, and the IndexNow ping route. These break easily during refactors,
 * so we assert the contract Google / Bing / Anthropic actually depend on.
 */

test('robots.txt declares sitemap + allows all major AI bots', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain('Sitemap: https://');
  // Each named AI/search bot we explicitly listed in robots.ts should appear.
  for (const ua of ['Googlebot', 'Bingbot', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot']) {
    expect(body).toContain(`User-Agent: ${ua}`);
  }
});

test('sitemap.xml is a valid sitemap index referencing 4 children', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  expect((res.headers()['content-type'] || '').toLowerCase()).toContain('xml');
  const xml = await res.text();
  expect(xml).toContain('<sitemapindex');
  for (const child of ['sitemap-pages.xml', 'sitemap-versus.xml', 'sitemap-skins.xml', 'sitemap-news.xml']) {
    expect(xml).toContain(child);
  }
});

test('sitemap-skins.xml lists every skin slug × every locale', async ({ request }) => {
  const res = await request.get('/sitemap-skins.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  // 166 skins × 14 locales = 2,324 URL entries
  const urlCount = (xml.match(/<url>/g) || []).length;
  expect(urlCount).toBeGreaterThanOrEqual(2000);
  // Each URL must declare all 14 hreflang alternates plus x-default
  const firstUrl = xml.match(/<url>[\s\S]*?<\/url>/)?.[0] || '';
  const hreflangCount = (firstUrl.match(/hreflang=/g) || []).length;
  expect(hreflangCount).toBe(15); // 14 locales + x-default
});

test('sitemap-pages.xml includes home + how-to-play + game-ranking', async ({ request }) => {
  const xml = await (await request.get('/sitemap-pages.xml')).text();
  expect(xml).toContain('/en</loc>');
  expect(xml).toContain('/en/how-to-play');
  expect(xml).toContain('/en/game-ranking');
  expect(xml).toContain('/en/snakes');
});

test('llms.txt is well-formed for LLM crawlers', async ({ request }) => {
  const res = await request.get('/llms.txt');
  expect(res.status()).toBe(200);
  expect((res.headers()['content-type'] || '').toLowerCase()).toContain('text/plain');
  const body = await res.text();
  expect(body).toMatch(/^# Snake Online/m);
  expect(body).toMatch(/^> /m); // summary blockquote
  expect(body).toContain('## Start here');
  expect(body).toContain('## Skins catalog');
  expect(body).toContain('## Comparisons');
});

test('llms-full.txt is < 50KB and contains FAQ + How-to + comparisons', async ({ request }) => {
  const body = await (await request.get('/llms-full.txt')).text();
  expect(body.length).toBeLessThan(50_000);
  expect(body).toMatch(/Frequently asked questions/i);
  expect(body).toMatch(/How to play/i);
  expect(body).toMatch(/vs Worms Zone/i);
});

test('IndexNow route rejects unauthenticated calls', async ({ request }) => {
  const res = await request.post('/api/indexnow', { data: { urls: ['https://snakeonline.io/en'] } });
  expect(res.status()).toBe(403);
});

test('IndexNow IndexNow-key file is reachable at /{key}.txt', async ({ request }) => {
  // Per IndexNow spec — the key value must be served as a flat file matching its name.
  const res = await request.get('/snakeonlineio2026indexnowkey.txt');
  expect(res.status()).toBe(200);
  expect((await res.text()).trim()).toBe('snakeonlineio2026indexnowkey');
});
