// Server-only file: reads from disk + parses markdown. Client components must
// import constants/types from `./blog-data` instead so webpack doesn't drag
// `fs`/`path` into the browser bundle.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { getAllSkins, type Skin } from './skins';
import {
  CATEGORIES,
  getCategory,
  type BlogCategory,
  type BlogCategorySlug,
  type BlogPost,
  type BlogPostFrontmatter,
} from './blog-data';

// Re-export the value + type shape so server callers can keep importing from this module.
export { CATEGORIES, getCategory };
export type { BlogCategory, BlogCategorySlug, BlogPost, BlogPostFrontmatter };

const ROOT = path.join(process.cwd(), 'src', 'content', 'blog');

export function getBlogSlugs(locale = 'en'): string[] {
  const dir = path.join(ROOT, locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
    .map(f => f.replace(/\.mdx?$/, ''));
}

function buildSnakeLinkInjector(skins: Skin[], locale: string, currentSlug: string) {
  const eligible = skins.filter(s => `skin-spotlight-${s.slug}` !== currentSlug);
  const sorted = [...eligible].sort((a, b) => b.name.length - a.name.length);
  return (rawHtml: string) => {
    let out = rawHtml;
    const linkedSlugs = new Set<string>();
    for (const s of sorted) {
      if (linkedSlugs.has(s.slug)) continue;
      const escaped = s.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(?<![\\w/>])(${escaped})(?![\\w<])`, 'i');
      const m = out.match(pattern);
      if (!m) continue;
      const href = `/${locale}/skins/${s.slug}`;
      const replacement = `<a href="${href}" class="text-brand-400 hover:text-brand-300 underline-offset-4 hover:underline" data-internal-skin="${s.id}">${m[1]}</a>`;
      out = out.replace(pattern, replacement);
      linkedSlugs.add(s.slug);
    }
    return out;
  };
}

function estimateReadingTime(markdown: string): number {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export async function getBlogPost(slug: string, locale = 'en'): Promise<BlogPost | null> {
  const tryPaths = [
    path.join(ROOT, locale, `${slug}.md`),
    path.join(ROOT, locale, `${slug}.mdx`),
    path.join(ROOT, 'en', `${slug}.md`),
    path.join(ROOT, 'en', `${slug}.mdx`),
  ];
  const fp = tryPaths.find(p => fs.existsSync(p));
  if (!fp) return null;
  const raw = fs.readFileSync(fp, 'utf8');
  const { data, content } = matter(raw);
  const fm = data as BlogPostFrontmatter;
  const processed = await remark().use(html).process(content);

  const skins = getAllSkins();
  const inject = buildSnakeLinkInjector(skins, locale, slug);
  const renderedHtml = inject(processed.toString());

  let cover = fm.cover;
  if (!cover && fm.coverSkinId) cover = `/snakes/${fm.coverSkinId}.png`;

  return {
    slug,
    locale,
    title: fm.title || slug,
    description: fm.description || '',
    date: fm.date || new Date().toISOString(),
    author: fm.author || 'Snake Online Studio',
    cover,
    coverSkinId: fm.coverSkinId,
    category: fm.category,
    tags: fm.tags || [],
    featured: fm.featured || false,
    relatedSkinSlug: fm.relatedSkinSlug,
    isAiGenerated: fm.isAiGenerated || false,
    content,
    html: renderedHtml,
    readingTimeMin: estimateReadingTime(content),
  };
}

export async function getAllBlogPosts(locale = 'en'): Promise<BlogPost[]> {
  const slugs = getBlogSlugs(locale).length ? getBlogSlugs(locale) : getBlogSlugs('en');
  const posts = await Promise.all(slugs.map(s => getBlogPost(s, locale)));
  return posts
    .filter((p): p is BlogPost => !!p)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getBlogPostsByCategory(category: BlogCategorySlug, locale = 'en'): Promise<BlogPost[]> {
  const all = await getAllBlogPosts(locale);
  return all.filter(p => p.category === category);
}

export async function getFeaturedBlogPosts(locale = 'en', limit = 3): Promise<BlogPost[]> {
  const all = await getAllBlogPosts(locale);
  const featured = all.filter(p => p.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  return [...featured, ...all.filter(p => !p.featured)].slice(0, limit);
}

export async function getRelatedPosts(post: BlogPost, locale = 'en', limit = 3): Promise<BlogPost[]> {
  const all = await getAllBlogPosts(locale);
  const tagSet = new Set(post.tags || []);
  return all
    .filter(p => p.slug !== post.slug)
    .map(p => {
      let score = 0;
      if (p.category && p.category === post.category) score += 2;
      for (const t of p.tags || []) if (tagSet.has(t)) score += 1;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score || new Date(b.p.date).getTime() - new Date(a.p.date).getTime())
    .slice(0, limit)
    .map(x => x.p);
}
