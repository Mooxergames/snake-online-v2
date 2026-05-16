import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { Calendar, Clock, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { getBlogPost, getBlogSlugs, getRelatedPosts, getCategory } from '@/lib/blog';
import { locales } from '@/lib/locales';
import { SITE_URL } from '@/lib/seo';
import BlogCard from '@/components/blog/BlogCard';
import ReadingProgress from '@/components/blog/ReadingProgress';
import BlogPostSchema from '@/components/blog/BlogPostSchema';
import BlogPostBody from '@/components/blog/BlogPostBody';
import { getSkinBySlug } from '@/lib/skins';
import { snakeImg } from '@/lib/assets';
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

  const url = `${SITE_URL}/${params.locale}/news/${params.slug}`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${SITE_URL}/${l}/news/${params.slug}`;
  languages['x-default'] = `${SITE_URL}/en/news/${params.slug}`;

  const coverAbs = post.cover
    ? (post.cover.startsWith('http') ? post.cover : `${SITE_URL}${post.cover}`)
    : `${SITE_URL}/og-image.png`;

  return {
    title: { absolute: `${post.title} — Snake Online` },
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: url, languages },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: [post.author || 'Snake Online Studio'],
      tags: post.tags,
      images: [{ url: coverAbs, width: 1200, height: 630, alt: post.title }],
      locale: params.locale.replace('-', '_'),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [coverAbs],
    },
  };
}

export default async function NewsArticlePage({ params }: { params: { locale: string; slug: string } }) {
  unstable_setRequestLocale(params.locale);
  const post = await getBlogPost(params.slug, params.locale);
  if (!post) notFound();

  const t = await getTranslations({ locale: params.locale, namespace: 'blog' });
  const tCat = await getTranslations({ locale: params.locale, namespace: 'blog.categories' });
  const related = await getRelatedPosts(post, params.locale, 3);
  const category = getCategory(post.category);
  const relatedSkin = post.relatedSkinSlug ? getSkinBySlug(post.relatedSkinSlug) : undefined;

  return (
    <>
      <BlogPostSchema post={post} locale={params.locale} />
      <ReadingProgress />

      <article className="relative">
        <header className="relative pt-12 pb-8 sm:pt-20 overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20" aria-hidden="true" />
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 30% 0%, rgba(255,149,0,0.18), transparent 60%), radial-gradient(ellipse 50% 40% at 80% 60%, rgba(255,59,138,0.14), transparent 60%)',
            }}
          />

          <div className="container-tight relative">
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-text-tertiary">
              <Link href={`/${params.locale}/news`} className="hover:text-text-primary transition-colors inline-flex items-center gap-1">
                <ArrowLeft size={14} aria-hidden="true" />
                {t('backToNews')}
              </Link>
              {category && (
                <>
                  <span aria-hidden="true">/</span>
                  <Link href={`/${params.locale}/news/category/${category.slug}`} className="hover:text-text-primary transition-colors">
                    {tCat(`${category.slug}.title`)}
                  </Link>
                </>
              )}
            </nav>

            <div className="flex flex-wrap items-center gap-3 mb-5">
              {category && (
                <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 rounded-md border tier-${category.tier}`}>
                  {tCat(`${category.slug}.title`)}
                </span>
              )}
              <span className="text-xs text-text-tertiary inline-flex items-center gap-1.5">
                <Calendar size={12} aria-hidden="true" />
                <time dateTime={post.date}>{new Date(post.date).toLocaleDateString(params.locale, { year: 'numeric', month: 'long', day: 'numeric' })}</time>
              </span>
              <span className="text-xs text-text-tertiary inline-flex items-center gap-1.5">
                <Clock size={12} aria-hidden="true" />
                {t('readingTime', { min: post.readingTimeMin })}
              </span>
              {post.isAiGenerated && (
                <span className="text-xs text-text-tertiary inline-flex items-center gap-1.5 opacity-75">
                  <Sparkles size={11} aria-hidden="true" />
                  {t('aiAssisted')}
                </span>
              )}
            </div>

            <h1 className="font-display text-display-xl text-balance">
              <span className="gradient-text">{post.title}</span>
            </h1>
            <p className="mt-5 text-lg text-text-secondary max-w-3xl text-pretty">{post.description}</p>

            {post.cover && (
              <div className="mt-10 relative rounded-3xl liquid-glass-strong overflow-hidden aspect-[16/9] flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-70"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 30%, rgba(255,149,0,0.35), transparent 65%), radial-gradient(circle at 80% 70%, rgba(255,59,138,0.22), transparent 65%)',
                  }}
                  aria-hidden="true"
                />
                <img
                  src={post.cover}
                  alt={`${post.title} — Snake Online`}
                  width={1200}
                  height={675}
                  fetchPriority="high"
                  className="relative max-h-full max-w-2xl object-contain"
                  style={{ filter: 'drop-shadow(0 24px 48px rgba(255,149,0,0.45))' }}
                />
              </div>
            )}
          </div>
        </header>

        <div className="container-tight py-10">
          <BlogPostBody html={post.html} />

          {relatedSkin && (
            <div className="mt-12 rounded-3xl liquid-glass p-7 flex flex-col sm:flex-row items-center gap-6">
              <div className="size-24 rounded-2xl bg-bg-elevated flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={snakeImg(relatedSkin.id)}
                  alt={`${relatedSkin.name} snake skin in Snake Online`}
                  className="w-4/5 h-4/5 object-contain"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="text-xs uppercase tracking-wider text-text-tertiary">{t('mentionedSkin')}</div>
                <h3 className="mt-1 font-display text-xl font-semibold">{relatedSkin.name}</h3>
                <p className="mt-1 text-sm text-text-secondary">{relatedSkin.description}</p>
              </div>
              <Link href={`/${params.locale}/skins/${relatedSkin.slug}`} className="btn-primary shrink-0">
                {t('viewSkin')} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

        {related.length > 0 && (
          <section className="container-wide py-16 border-t border-border bg-bg-elevated/40">
            <h2 className="font-display text-display-md mb-6">{t('relatedPosts')}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <BlogCard key={r.slug} post={r} locale={params.locale} index={i} />
              ))}
            </div>
          </section>
        )}

        <section className="container-tight py-16 text-center">
          <Link href={`/${params.locale}/news`} className="btn-secondary">
            <ArrowLeft size={16} aria-hidden="true" />
            {t('backToNews')}
          </Link>
        </section>
      </article>
    </>
  );
}
