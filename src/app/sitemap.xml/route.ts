import { locales } from '@/lib/locales';
import { getBlogSlugs } from '@/lib/blog';
import { getAllSkins } from '@/lib/skins';

const ROUTES = ['', '/play', '/downloads', '/snakes', '/game-ranking', '/community', '/news', '/about', '/contact', '/support', '/how-to-play', '/legal/privacy', '/legal/terms', '/legal/parents', '/legal/data-protection'];
const VERSUS = ['wormzone-io', 'slither-io'];

export const dynamic = 'force-static';
export const revalidate = 3600;

function escape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function urlBlock(base: string, route: string, lastmod: string, changefreq: string, priority: number) {
  const links = locales.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${escape(`${base}/${l}${route}`)}"/>`).join('\n');
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${escape(`${base}/en${route}`)}"/>`;
  return locales.map(locale => {
    const url = `${base}/${locale}${route}`;
    return `  <url>
    <loc>${escape(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${links}
${xDefault}
  </url>`;
  }).join('\n');
}

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://snakeonline.io';
  const lastmod = new Date().toISOString();

  const pageBlocks = ROUTES.map(route =>
    urlBlock(base, route, lastmod, route === '' ? 'daily' : 'weekly', route === '' ? 1.0 : route === '/game-ranking' ? 0.9 : 0.7)
  );

  const blogSlugs = getBlogSlugs('en');
  const blogBlocks = blogSlugs.map(slug => urlBlock(base, `/news/${slug}`, lastmod, 'monthly', 0.6));

  const skinBlocks = getAllSkins().map(s => urlBlock(base, `/skins/${s.slug}`, lastmod, 'monthly', 0.55));

  const versusBlocks = VERSUS.map(c => urlBlock(base, `/vs/${c}`, lastmod, 'monthly', 0.65));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...pageBlocks, ...versusBlocks, ...skinBlocks, ...blogBlocks].join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
