import { siteBase, SITEMAP_HEADERS, urlBlock, wrapUrlset } from '@/lib/sitemap';
import { getBlogSlugs } from '@/lib/blog';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const base = siteBase();
  const lastmod = new Date().toISOString();
  const slugs = getBlogSlugs('en');
  const body = slugs
    .map(slug => urlBlock(base, `/news/${slug}`, lastmod, 'weekly', 0.65))
    .join('\n');
  return new Response(wrapUrlset(body || '  '), { headers: SITEMAP_HEADERS });
}
