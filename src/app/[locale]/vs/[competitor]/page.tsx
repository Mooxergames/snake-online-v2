import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { ArrowRight, Check, X, Trophy, Sparkles, Play } from 'lucide-react';
import { locales } from '@/lib/locales';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 86400;

type Competitor = 'wormzone-io' | 'slither-io';
const COMPETITORS: Competitor[] = ['wormzone-io', 'slither-io'];

const KEY_FOR: Record<Competitor, 'wormzone' | 'slither'> = {
  'wormzone-io': 'wormzone',
  'slither-io': 'slither',
};

const COMP_LABEL: Record<Competitor, string> = {
  'wormzone-io': 'Worms Zone .io',
  'slither-io': 'Slither.io',
};

interface Row {
  feature: string;
  us: boolean | string;
  them: boolean | string;
}

const ROWS_FOR: Record<Competitor, Row[]> = {
  'wormzone-io': [
    { feature: 'realtime',     us: true,   them: false },
    { feature: 'skins',        us: '200+', them: '~80' },
    { feature: 'languages',    us: '14',   them: '1' },
    { feature: 'leaderboard',  us: true,   them: false },
    { feature: 'schema',       us: true,   them: false },
    { feature: 'crossplay',    us: true,   them: false },
    { feature: 'tournaments',  us: true,   them: false },
    { feature: 'offline',      us: false,  them: true  },
  ],
  'slither-io': [
    { feature: 'realtime',     us: true,   them: true  },
    { feature: 'skins',        us: '200+', them: '~50' },
    { feature: 'languages',    us: '14',   them: '1' },
    { feature: 'leaderboard',  us: true,   them: false },
    { feature: 'schema',       us: true,   them: false },
    { feature: 'crossplay',    us: true,   them: false },
    { feature: 'tournaments',  us: true,   them: false },
    { feature: 'offline',      us: false,  them: false },
  ],
};

interface PageProps {
  params: { locale: string; competitor: string };
}

export function generateStaticParams() {
  return locales.flatMap(locale => COMPETITORS.map(c => ({ locale, competitor: c })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!(COMPETITORS as string[]).includes(params.competitor)) return {};
  const key = KEY_FOR[params.competitor as Competitor];
  const t = await getTranslations({ locale: params.locale, namespace: 'versus' });
  const title = t(`${key}.seoTitle`);
  const description = t(`${key}.seoDescription`);
  const path = `/vs/${params.competitor}`;
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
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

function VersusSchema({
  locale, slug, title, description, lead,
}: { locale: string; slug: string; title: string; description: string; lead: string }) {
  const url = `${SITE_URL}/${locale}/vs/${slug}`;
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Comparisons', item: `${SITE_URL}/${locale}/vs` },
      { '@type': 'ListItem', position: 3, name: title, item: url },
    ],
  };
  // Article schema — qualifies the page for Google's article-with-image rich
  // result + adds freshness signals via datePublished / dateModified.
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: title,
    description,
    articleBody: lead,
    inLanguage: locale,
    datePublished: '2024-02-01',
    dateModified: new Date().toISOString().slice(0, 10),
    author: { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: `${SITE_URL}/og-image.png`,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
    </>
  );
}

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-venom-500/15 ring-1 ring-venom-500/40 text-venom-400">
        <Check size={16} strokeWidth={2.5} />
      </span>
    ) : (
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-rose-500/10 ring-1 ring-rose-500/30 text-rose-400">
        <X size={16} strokeWidth={2.5} />
      </span>
    );
  }
  return <span className="font-mono text-sm font-semibold text-text-primary">{value}</span>;
}

export default async function VersusPage({ params }: PageProps) {
  if (!(COMPETITORS as string[]).includes(params.competitor)) notFound();
  unstable_setRequestLocale(params.locale);
  const competitor = params.competitor as Competitor;
  const key = KEY_FOR[competitor];
  const t = await getTranslations({ locale: params.locale, namespace: 'versus' });
  const tCmp = await getTranslations({ locale: params.locale, namespace: 'compare' });
  const themLabel = COMP_LABEL[competitor];
  const title = t(`${key}.title`);
  const description = t(`${key}.seoDescription`);
  const lead = t(`${key}.lead`);
  const rows = ROWS_FOR[competitor];

  return (
    <>
      <VersusSchema
        locale={params.locale}
        slug={competitor}
        title={title}
        description={description}
        lead={lead}
      />

      <section className="relative pt-20 pb-12 sm:pt-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 30% 30%, rgba(255,149,0,0.18), transparent 60%), radial-gradient(ellipse 50% 40% at 75% 70%, rgba(164,85,255,0.15), transparent 60%)',
          }}
        />
        <div className="container-tight relative">
          <div className="chip-brand inline-flex items-center gap-2">
            <Trophy size={12} /> {t('eyebrow')}
          </div>
          <h1 className="mt-5 font-display text-display-xl text-balance">
            <span className="gradient-text">{title}</span>
          </h1>
          <p className="mt-5 text-lg text-text-secondary max-w-3xl text-pretty">{t(`${key}.lead`)}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${params.locale}/play`} className="btn-primary">
              <Play size={18} fill="currentColor" /> {t('playFreeNow')}
            </Link>
            <Link href={`/${params.locale}/snakes`} className="btn-secondary">
              <Sparkles size={16} /> {t('viewAllSkins')}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container-tight">
          <div className="rounded-3xl liquid-glass-strong overflow-hidden">
            <div className="grid grid-cols-[1fr_120px_140px] sm:grid-cols-[1fr_180px_180px] gap-2 px-5 sm:px-8 py-5 border-b border-border">
              <div className="text-xs uppercase tracking-wider text-text-tertiary self-end">{tCmp('feature')}</div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-brand-300 font-display text-sm font-semibold">
                  <span className="size-2 rounded-full bg-venom-500 animate-pulse" />
                  Snake Online
                </div>
              </div>
              <div className="text-center text-text-tertiary font-display text-sm">{themLabel}</div>
            </div>
            {rows.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1fr_120px_140px] sm:grid-cols-[1fr_180px_180px] gap-2 px-5 sm:px-8 py-4 items-center ${
                  i % 2 === 0 ? 'bg-white/[0.015]' : ''
                }`}
              >
                <div>
                  <div className="font-medium text-sm text-text-primary">{tCmp(`rows.${row.feature}.title`)}</div>
                  <div className="mt-0.5 text-xs text-text-tertiary hidden sm:block">{tCmp(`rows.${row.feature}.note`)}</div>
                </div>
                <div className="text-center"><Cell value={row.us} /></div>
                <div className="text-center"><Cell value={row.them} /></div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-text-secondary max-w-3xl">{t(`${key}.verdict`)}</p>
          <p className="mt-3 text-xs text-text-tertiary max-w-3xl">{tCmp('disclaimer')}</p>
        </div>
      </section>

      <section className="py-16 border-t border-border bg-bg-elevated/40">
        <div className="container-tight text-center">
          <h2 className="font-display text-display-md">{t('playFreeNow')}</h2>
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3">
            <Link href={`/${params.locale}/play`} className="btn-primary-xl">
              <Play size={20} fill="currentColor" /> {t('playFreeNow')}
            </Link>
            <Link href={`/${params.locale}/snakes`} className="btn-secondary">
              {t('viewAllSkins')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
