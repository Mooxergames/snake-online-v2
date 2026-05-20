import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import PageHero from '@/components/PageHero';
import RankingsTable from '@/components/RankingsTable';
import { getOverview } from '@/lib/api';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

// Render on every request — rankings data changes frequently and must be fresh.
// fetch-level cache (300s) handles backend load; no page-level static cache needed.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata({ locale, page: 'gameRanking', path: '/game-ranking' });
}

export default async function GameRankingPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ranking' });
  const overview = await getOverview();
  const global = overview?.data.global.rankings || [];
  const countries = overview?.data.local.availableCountries || [];
  const updatedAt = overview?.data.updatedAt;

  return (
    <>
      <PageHero title={t('title')} subtitle={t('subtitle')} />
      <section className="container-wide py-16">
        <RankingsTable initialGlobal={global} initialCountries={countries} locale={locale} />
        {updatedAt && (
          <p className="mt-6 text-xs text-text-tertiary">
            {t('lastUpdated')}: {new Date(updatedAt).toLocaleString(locale)}
          </p>
        )}
      </section>
    </>
  );
}
