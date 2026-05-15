import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import PageHero from '@/components/PageHero';
import { getAllBlogPosts } from '@/lib/blog';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const revalidate = 1800;

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata({ locale, page: 'news', path: '/news' });
}

export default async function NewsPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'news' });
  const posts = await getAllBlogPosts(locale);

  return (
    <>
      <PageHero title={t('title')} subtitle={t('subtitle')} />
      <section className="container-wide py-16">
        {posts.length === 0 ? (
          <p className="text-text-tertiary text-center py-12">{t('noneYet')}</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map(p => (
              <Link key={p.slug} href={`/${locale}/news/${p.slug}`} className="card card-hover group">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-brand-500/30 to-neon-pink/30 mb-5" />
                <div className="text-xs text-text-tertiary uppercase tracking-wider">{new Date(p.date).toLocaleDateString(locale)}</div>
                <h3 className="font-display text-xl font-semibold mt-2 group-hover:text-brand-300 transition-colors">{p.title}</h3>
                <p className="text-text-secondary mt-2 line-clamp-2">{p.description}</p>
                <span className="inline-block mt-4 text-sm text-brand-400">{t('readMore')} →</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
