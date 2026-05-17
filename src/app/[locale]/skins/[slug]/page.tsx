import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, Sparkles, Trophy, Globe, Play } from 'lucide-react';
import { locales } from '@/lib/locales';
import { getAllSkins, type Skin } from '@/lib/skins';
import { getLocalizedSkin, getLocalizedRelatedSkins } from '@/lib/skin-localizer';
import { snakeImg } from '@/lib/assets';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 86400;

interface PageProps {
  params: { locale: string; slug: string };
}

export function generateStaticParams() {
  const skins = getAllSkins();
  return locales.flatMap(locale => skins.map(s => ({ locale, slug: s.slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const skin = await getLocalizedSkin(params.slug, params.locale);
  if (!skin) return {};

  const t = await getTranslations({ locale: params.locale, namespace: 'skinPage' });
  const rarityLabel = t(`rarity.${skin.rarity}`);

  // Five title + five description templates. We pick deterministically per skin
  // (skin.metaTemplate) so each of the 166 detail pages gets a meaningfully
  // different SERP snippet — avoids the "all titles look identical" duplicate
  // signal that demotes programmatic pages.
  const titleTemplates = [
    t('seoTitle',         { name: skin.name, rarity: rarityLabel }),
    t('seoTitleAlt1',     { name: skin.name, rarity: rarityLabel }),
    t('seoTitleAlt2',     { name: skin.name, rarity: rarityLabel }),
    t('seoTitleAlt3',     { name: skin.name, rarity: rarityLabel }),
    t('seoTitleAlt4',     { name: skin.name, rarity: rarityLabel }),
  ];
  const descTemplates = [
    t('seoDescription',     { name: skin.name, rarity: rarityLabel }),
    t('seoDescriptionAlt1', { name: skin.name, rarity: rarityLabel }),
    t('seoDescriptionAlt2', { name: skin.name, rarity: rarityLabel }),
    t('seoDescriptionAlt3', { name: skin.name, rarity: rarityLabel }),
    t('seoDescriptionAlt4', { name: skin.name, rarity: rarityLabel }),
  ];
  const title = titleTemplates[skin.metaTemplate] ?? titleTemplates[0];
  const description = descTemplates[skin.metaTemplate] ?? descTemplates[0];
  const path = `/skins/${skin.slug}`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${SITE_URL}/${l}${path}`;
  languages['x-default'] = `${SITE_URL}/en${path}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}/${params.locale}${path}`, languages },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `${SITE_URL}/${params.locale}${path}`,
      images: [{ url: snakeImg(skin.id), width: 800, height: 800, alt: skin.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [snakeImg(skin.id)],
    },
  };
}

function SkinSchema({ skin, locale }: { skin: Skin; locale: string }) {
  const url = `${SITE_URL}/${locale}/skins/${skin.slug}`;
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Snake Skins', item: `${SITE_URL}/${locale}/snakes` },
      { '@type': 'ListItem', position: 3, name: skin.name, item: url },
    ],
  };
  // CreativeWork tied back to the parent VideoGame entity.
  // We deliberately do NOT emit a Product/Offer here: Google flags Product schema
  // with $0 offers as low-quality and disqualifies them from rich results.
  // Instead we declare each skin as a CreativeWork that's `isPartOf` the game,
  // which keeps the entity graph clean and inherits ratings from the game.
  const creativeWork = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': url,
    name: `${skin.name} Snake Skin`,
    alternateName: skin.id,
    description: skin.description,
    image: snakeImg(skin.id),
    inLanguage: locale,
    creator: { '@id': `${SITE_URL}/#organization` },
    isPartOf: { '@id': `${SITE_URL}/#game` },
    genre: skin.isCountry ? 'Country Skin' : 'Fantasy Skin',
    keywords: [
      skin.name, skin.rarity, 'snake skin', 'Snake Online',
      ...(skin.isCountry && skin.country ? [skin.country] : []),
    ].join(', '),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWork) }} />
    </>
  );
}

export default async function SkinPage({ params }: PageProps) {
  unstable_setRequestLocale(params.locale);
  const skin = await getLocalizedSkin(params.slug, params.locale);
  if (!skin) notFound();

  const t = await getTranslations({ locale: params.locale, namespace: 'skinPage' });
  const related = await getLocalizedRelatedSkins(skin, params.locale);

  return (
    <>
      <SkinSchema skin={skin} locale={params.locale} />

      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" aria-hidden="true" />
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,149,0,0.18), transparent 60%), radial-gradient(ellipse 50% 40% at 80% 60%, rgba(255,59,138,0.14), transparent 60%)',
          }}
        />

        <div className="container-wide relative">
          <nav className="mb-8 flex items-center gap-2 text-sm text-text-tertiary" aria-label="Breadcrumb">
            <Link href={`/${params.locale}`} className="hover:text-text-primary transition-colors">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${params.locale}/snakes`} className="hover:text-text-primary transition-colors">{t('breadcrumbSnakes')}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-text-primary" aria-current="page">{skin.name}</span>
          </nav>

          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <div className="relative aspect-square max-w-md mx-auto lg:mx-0 rounded-3xl liquid-glass-strong flex items-center justify-center overflow-hidden">
                <div
                  className="absolute inset-0 pointer-events-none opacity-60"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 40%, rgba(255,149,0,0.5), transparent 65%)',
                  }}
                  aria-hidden="true"
                />
                <img
                  src={snakeImg(skin.id)}
                  alt={`${skin.name} snake skin in Snake Online`}
                  width={800}
                  height={800}
                  fetchPriority="high"
                  className="relative w-4/5 h-4/5 object-contain"
                  style={{ filter: 'drop-shadow(0 24px 48px rgba(255,149,0,0.45))' }}
                />
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold border tier-${skin.rarity}`}>
                {skin.isCountry ? <Globe size={12} /> : <Sparkles size={12} />}
                {t(`rarity.${skin.rarity}`)}
              </div>
              <h1 className="mt-4 font-display text-display-2xl text-balance">
                <span className="gradient-text">{skin.name}</span>
              </h1>
              <p className="mt-5 text-lg text-text-secondary max-w-2xl text-pretty">{skin.description}</p>

              <div className="mt-8 grid sm:grid-cols-2 gap-3">
                <div className="rounded-2xl liquid-glass p-5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-tertiary">
                    <Trophy size={14} className="text-amber-400" /> {t('howToUnlock')}
                  </div>
                  <p className="mt-2 text-sm text-text-primary leading-relaxed">{skin.obtainHint}</p>
                </div>
                <div className="rounded-2xl liquid-glass p-5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-tertiary">
                    <Sparkles size={14} className="text-magenta-400" /> {t('rarityLabel')}
                  </div>
                  <p className="mt-2 text-sm text-text-primary capitalize">{t(`rarity.${skin.rarity}`)}</p>
                  <p className="mt-1 text-xs text-text-tertiary">{t(`rarityNote.${skin.rarity}`)}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/${params.locale}/play`} className="btn-primary">
                  <Play size={18} fill="currentColor" /> {t('playToUnlock')}
                </Link>
                <Link href={`/${params.locale}/snakes`} className="btn-secondary">
                  <ArrowLeft size={16} /> {t('viewAll')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border bg-bg-elevated/40">
        <div className="container-wide">
          <h2 className="font-display text-display-md mb-8">{t('relatedTitle')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {related.map(r => (
              <Link
                key={r.id}
                href={`/${params.locale}/skins/${r.slug}`}
                className="group block rounded-2xl liquid-glass p-4 transition-transform hover:-translate-y-1"
              >
                <div className="aspect-square rounded-xl bg-bg-elevated flex items-center justify-center mb-3 overflow-hidden">
                  <img
                    src={snakeImg(r.id)}
                    alt={r.name}
                    loading="lazy"
                    className="w-4/5 h-4/5 object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                <div className="text-sm font-semibold text-text-primary truncate">{r.name}</div>
                <div className={`mt-1 inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded border tier-${r.rarity}`}>
                  {t(`rarity.${r.rarity}`)}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href={`/${params.locale}/snakes`} className="btn-secondary">
              {t('browseAll')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
