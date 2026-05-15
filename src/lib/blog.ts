import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  cover?: string;
  tags?: string[];
  locale: string;
  content: string;
  html: string;
}

const ROOT = path.join(process.cwd(), 'src', 'content', 'blog');

export function getBlogSlugs(locale = 'en'): string[] {
  const dir = path.join(ROOT, locale);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.md') || f.endsWith('.mdx')).map(f => f.replace(/\.mdx?$/, ''));
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
  const processed = await remark().use(html).process(content);
  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    date: data.date || new Date().toISOString(),
    author: data.author || 'Snake Online Team',
    cover: data.cover,
    tags: data.tags || [],
    locale,
    content,
    html: processed.toString(),
  };
}

export async function getAllBlogPosts(locale = 'en'): Promise<BlogPost[]> {
  const slugs = getBlogSlugs(locale).length ? getBlogSlugs(locale) : getBlogSlugs('en');
  const posts = await Promise.all(slugs.map(s => getBlogPost(s, locale)));
  return posts
    .filter((p): p is BlogPost => !!p)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
