import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { getBlogPost, getBlogSlugs } from '@/lib/blog';
import { locales } from '@/lib/locales';
import type { Metadata } from 'next';

export const revalidate = 1800;

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    const slugs = getBlogSlugs(locale).length ? getBlogSlugs(locale) : getBlogSlugs('en');
    for (const slug of slugs) params.push({ locale, slug });
  }
  return params;
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const post = await getBlogPost(params.slug, params.locale);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/${params.locale}/news/${params.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: [post.author],
      images: post.cover ? [post.cover] : undefined,
    },
  };
}

export default async function NewsArticlePage({ params }: { params: { locale: string; slug: string } }) {
  unstable_setRequestLocale(params.locale);
  const post = await getBlogPost(params.slug, params.locale);
  if (!post) notFound();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: 'Snake Online' },
    mainEntityOfPage: `/${params.locale}/news/${params.slug}`,
  };

  return (
    <article className="container-tight py-16 sm:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Link href={`/${params.locale}/news`} className="text-sm text-text-tertiary hover:text-text-primary">← News</Link>
      <header className="mt-6">
        <div className="text-xs text-text-tertiary uppercase tracking-wider">
          {new Date(post.date).toLocaleDateString(params.locale)}
        </div>
        <h1 className="font-display text-display-lg mt-3 text-balance">{post.title}</h1>
        <p className="text-lg text-text-secondary mt-4">{post.description}</p>
      </header>
      <div
        className="prose prose-invert prose-headings:font-display prose-a:text-brand-400 mt-10 max-w-none"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  );
}
