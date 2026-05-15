import { siteBase, SITEMAP_HEADERS, urlBlock, wrapUrlset } from '@/lib/sitemap';

const VERSUS = ['wormzone-io', 'slither-io'];

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const base = siteBase();
  const lastmod = new Date().toISOString();
  const body = VERSUS.map(c => urlBlock(base, `/vs/${c}`, lastmod, 'monthly', 0.7)).join('\n');
  return new Response(wrapUrlset(body), { headers: SITEMAP_HEADERS });
}
