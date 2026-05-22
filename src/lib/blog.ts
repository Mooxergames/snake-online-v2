// Server-only file: reads from disk + parses markdown. Client components must
// import constants/types from `./blog-data` instead so webpack doesn't drag
// `fs`/`path` into the browser bundle.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { getAllSkins, getAllSkinsFromCatalog, type Skin } from './skins';
import { injectInternalLinks, skinsToLinkTargets, standardHubs } from './content-pipeline/internal-links';
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

/**
 * Wires the rules-based internal-link injector (src/lib/content-pipeline/internal-links.ts)
 * into the rendered HTML. Targets come from the backend catalog (real snake
 * names) plus a standard hub set. Editor-suggested slugs from the frontmatter
 * `suggestedLinks` field are prioritized.
 */
function injectLinks(skins: Skin[], locale: string, currentSlug: string, suggestedSlugs: string[] | undefined, html: string): string {
  const eligibleSkins = skins.filter(s => `skin-spotlight-${s.slug}` !== currentSlug);
  const targets = [
    ...skinsToLinkTargets(eligibleSkins, locale),
    ...standardHubs(locale),
  ];
  return injectInternalLinks(html, targets, {
    locale,
    currentSlug,
    suggestedSlugs,
  }).html;
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

  // Prefer the live backend catalog for real snake names; fall back to the
  // synchronous fallback so dev/preview environments without network access
  // still render something.
  let skins: Skin[];
  try {
    skins = await getAllSkinsFromCatalog();
  } catch {
    skins = getAllSkins();
  }
  const suggested = Array.isArray((fm as BlogPostFrontmatter & { suggestedLinks?: string[] }).suggestedLinks)
    ? (fm as BlogPostFrontmatter & { suggestedLinks?: string[] }).suggestedLinks
    : undefined;
  const renderedHtml = injectLinks(skins, locale, slug, suggested, processed.toString());

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
