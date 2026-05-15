import { siteBase, SITEMAP_HEADERS, urlBlock, wrapUrlset } from '@/lib/sitemap';

/**
 * Static + legal + how-to-play pages.
 * High priority since these are the conversion funnel.
 */

const ROUTES: { path: string; priority: number; changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' }[] = [
  { path: '',                          priority: 1.0,  changefreq: 'daily' },
  { path: '/play',                     priority: 0.9,  changefreq: 'weekly' },
  { path: '/downloads',                priority: 0.85, changefreq: 'weekly' },
  { path: '/snakes',                   priority: 0.9,  changefreq: 'weekly' },
  { path: '/game-ranking',             priority: 0.85, changefreq: 'hourly' },
  { path: '/how-to-play',              priority: 0.8,  changefreq: 'monthly' },
  { path: '/community',                priority: 0.7,  changefreq: 'weekly' },
  { path: '/news',                     priority: 0.7,  changefreq: 'daily' },
  { path: '/about',                    priority: 0.6,  changefreq: 'monthly' },
  { path: '/contact',                  priority: 0.5,  changefreq: 'yearly' },
  { path: '/support',                  priority: 0.6,  changefreq: 'monthly' },
  { path: '/legal/privacy',            priority: 0.3,  changefreq: 'yearly' },
  { path: '/legal/terms',              priority: 0.3,  changefreq: 'yearly' },
  { path: '/legal/parents',            priority: 0.3,  changefreq: 'yearly' },
  { path: '/legal/data-protection',    priority: 0.3,  changefreq: 'yearly' },
];

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const base = siteBase();
  const lastmod = new Date().toISOString();
  const body = ROUTES.map(r => urlBlock(base, r.path, lastmod, r.changefreq, r.priority)).join('\n');
  return new Response(wrapUrlset(body), { headers: SITEMAP_HEADERS });
}
