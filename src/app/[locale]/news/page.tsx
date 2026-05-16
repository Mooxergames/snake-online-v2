import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { getAllBlogPosts, getFeaturedBlogPosts, CATEGORIES } from '@/lib/blog';
import BlogCard from '@/components/blog/BlogCard';
import CategoryPills from '@/components/blog/CategoryPills';
import BlogListSchema from '@/components/blog/BlogListSchema';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const revalidate = 1800;

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata({ locale, page: 'news', path: '/news' });
}

export default async function NewsPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'news' });
  const tBlog = await getTranslations({ locale, namespace: 'blog' });
  const tCat = await getTranslations({ locale, namespace: 'blog.categories' });
  const all = await getAllBlogPosts(locale);
  const featured = await getFeaturedBlogPosts(locale, 1);
  const hero = featured[0];
  const rest = all.filter(p => p.slug !== hero?.slug);

  return (
    <>
      <BlogListSchema locale={locale} title={t('title')} description={t('subtitle')} posts={all} />

      <section className="relative pt-20 pb-12 sm:pt-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 30% 0%, rgba(255,149,0,0.18), transparent 60%), radial-gradient(ellipse 50% 40% at 80% 60%, rgba(255,59,138,0.15), transparent 60%)',
          }}
        />
        <div className="container-wide relative">
          <div className="chip-brand">{tBlog('eyebrow')}</div>
          <h1 className="mt-5 font-display text-display-xl text-balance max-w-4xl">
            <span className="text-text-primary">{tBlog('titleLead')}</span>{' '}
            <span className="gradient-text">{tBlog('titleAccent')}</span>
          </h1>
          <p className="mt-5 text-lg text-text-secondary max-w-3xl">{t('subtitle')}</p>

          <div className="mt-8">
            <CategoryPills locale={locale} />
          </div>
        </div>
      </section>

      {hero && (
        <section className="container-wide py-8">
          <BlogCard post={hero} locale={locale} size="lg" />
        </section>
      )}

      <section className="container-wide pt-4 pb-16">
        {rest.length === 0 ? (
          <p className="text-text-tertiary text-center py-12">{t('noneYet')}</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <BlogCard key={p.slug} post={p} locale={locale} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="container-wide py-16 border-t border-border">
        <h2 className="font-display text-display-md mb-6">{tBlog('exploreCategories')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map(c => (
            <Link
              key={c.slug}
              href={`/${locale}/news/category/${c.slug}`}
              className="group block rounded-2xl liquid-glass p-6 transition-all hover:-translate-y-1 hover:shadow-glow-brand"
            >
              <h3 className="font-display text-lg font-semibold group-hover:text-brand-300 transition-colors">
                {tCat(`${c.slug}.title`)}
              </h3>
              <p className="mt-2 text-sm text-text-secondary text-pretty">{tCat(`${c.slug}.description`)}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-400">
                {tBlog('browse')} <ArrowRight size={12} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
