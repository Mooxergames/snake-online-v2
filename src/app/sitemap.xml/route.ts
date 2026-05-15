import { siteBase, SITEMAP_HEADERS } from '@/lib/sitemap';

/**
 * Sitemap INDEX — references per-section child sitemaps.
 *
 * Why index-then-children instead of one giant sitemap:
 *   - Crawl-budget: Google deprioritises sitemaps with >1000 URLs in a single
 *     file. Splitting lets us promote the high-value static pages over the
 *     2,300-URL skin catalog.
 *   - lastmod precision: each child can advertise its own update time so the
 *     news + skin sitemaps re-crawl independently of the static pages.
 *   - Future-proof: blog/news will grow; isolating it keeps the others stable.
 *
 * Children (each owns its own route handler):
 *   /sitemap-pages.xml    static + legal + how-to-play  (~14 routes × 14 = 196)
 *   /sitemap-versus.xml   /vs/{competitor}               (2 × 14 = 28)
 *   /sitemap-skins.xml    /skins/{slug}                  (166 × 14 = 2,324)
 *   /sitemap-news.xml     /news/{slug}                   (grows over time)
 */

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const base = siteBase();
  const lastmod = new Date().toISOString();
  const children = [
    'sitemap-pages.xml',
    'sitemap-versus.xml',
    'sitemap-skins.xml',
    'sitemap-news.xml',
  ];
  const body = children
    .map(name => `  <sitemap>
    <loc>${base}/${name}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>`;
  return new Response(xml, { headers: SITEMAP_HEADERS });
}
