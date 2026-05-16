import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { CATEGORIES, getBlogPostsByCategory, getCategory, type BlogCategorySlug } from '@/lib/blog';
import BlogCard from '@/components/blog/BlogCard';
import BlogListSchema from '@/components/blog/BlogListSchema';
import CategoryPills from '@/components/blog/CategoryPills';
import { locales } from '@/lib/locales';
import { SITE_URL } from '@/lib/seo';
import type { Metadata } from 'next';

export const revalidate = 1800;

export function generateStaticParams() {
  return locales.flatMap(locale => CATEGORIES.map(c => ({ locale, slug: c.slug })));
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const cat = getCategory(params.slug as BlogCategorySlug);
  if (!cat) return {};
  const t = await getTranslations({ locale: params.locale, namespace: 'blog.categories' });
  const tBlog = await getTranslations({ locale: params.locale, namespace: 'blog' });
  const title = `${t(`${cat.slug}.title`)} — ${tBlog('siteName')}`;
  const description = t(`${cat.slug}.description`);
  const path = `/news/category/${cat.slug}`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${SITE_URL}/${l}${path}`;
  languages['x-default'] = `${SITE_URL}/en${path}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}/${params.locale}${path}`, languages },
    openGraph: { type: 'website', title, description },
  };
}

export default async function CategoryPage({ params }: { params: { locale: string; slug: string } }) {
  unstable_setRequestLocale(params.locale);
  const cat = getCategory(params.slug as BlogCategorySlug);
  if (!cat) notFound();
  const tCat = await getTranslations({ locale: params.locale, namespace: 'blog.categories' });
  const tBlog = await getTranslations({ locale: params.locale, namespace: 'blog' });
  const posts = await getBlogPostsByCategory(cat.slug, params.locale);

  return (
    <>
      <BlogListSchema
        locale={params.locale}
        title={tCat(`${cat.slug}.title`)}
        description={tCat(`${cat.slug}.description`)}
        posts={posts}
      />

      <section className="relative pt-20 pb-12 sm:pt-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,149,0,0.16), transparent 60%)',
          }}
        />
        <div className="container-wide relative">
          <Link href={`/${params.locale}/news`} className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-primary mb-6 transition-colors">
            <ArrowLeft size={14} aria-hidden="true" />
            {tBlog('backToNews')}
          </Link>

          <div className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 rounded-md border tier-${cat.tier} mb-4`}>
            {tCat(`${cat.slug}.title`)}
          </div>
          <h1 className="font-display text-display-xl text-balance max-w-4xl">
            <span className="gradient-text">{tCat(`${cat.slug}.title`)}</span>
          </h1>
          <p className="mt-5 text-lg text-text-secondary max-w-3xl">{tCat(`${cat.slug}.description`)}</p>

          <div className="mt-8">
            <CategoryPills locale={params.locale} activeSlug={cat.slug} />
          </div>
        </div>
      </section>

      <section className="container-wide py-12">
        {posts.length === 0 ? (
          <p className="text-text-tertiary text-center py-12">{tBlog('emptyCategory')}</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <BlogCard key={p.slug} post={p} locale={params.locale} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
