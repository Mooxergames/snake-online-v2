import { siteBase, SITEMAP_HEADERS, urlBlock, wrapUrlset } from '@/lib/sitemap';
import { getAllSkins } from '@/lib/skins';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const base = siteBase();
  const lastmod = new Date().toISOString();
  const body = getAllSkins()
    .map(s => urlBlock(base, `/skins/${s.slug}`, lastmod, 'monthly', 0.55))
    .join('\n');
  return new Response(wrapUrlset(body), { headers: SITEMAP_HEADERS });
}
