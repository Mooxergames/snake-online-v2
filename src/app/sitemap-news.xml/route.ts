import { siteBase, SITEMAP_HEADERS, urlBlock, wrapUrlset } from '@/lib/sitemap';
import { getBlogSlugs, CATEGORIES } from '@/lib/blog';

export const dynamic = 'force-static';
export const revalidate = 1800;

export async function GET() {
  const base = siteBase();
  const lastmod = new Date().toISOString();
  const blogIndex = urlBlock(base, '/news', lastmod, 'daily', 0.8);
  const categories = CATEGORIES.map(c => urlBlock(base, `/news/category/${c.slug}`, lastmod, 'weekly', 0.7));
  const postBlocks = getBlogSlugs('en').map(slug => urlBlock(base, `/news/${slug}`, lastmod, 'weekly', 0.65));
  const body = [blogIndex, ...categories, ...postBlocks].join('\n');
  return new Response(wrapUrlset(body || '  '), { headers: SITEMAP_HEADERS });
}
