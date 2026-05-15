import { getTranslations } from 'next-intl/server';
import { getAllSkins } from '@/lib/skins';
import { SITE_URL } from '@/lib/seo';

/**
 * Server component that emits CollectionPage + ItemList JSON-LD for /snakes.
 * Inputs (skin names, slugs, SITE_URL) are entirely server-controlled — no user input
 * is interpolated into the script payload, so the dangerouslySetInnerHTML is safe.
 */
export default async function SnakesCollectionSchema({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'snakes' });
  const all = getAllSkins();
  const hubUrl = `${SITE_URL}/${locale}/snakes`;

  const json = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': hubUrl,
        url: hubUrl,
        name: t('title'),
        description: t('subtitle'),
        isPartOf: { '@id': `${SITE_URL}/#game` },
      },
      {
        '@type': 'ItemList',
        name: 'Snake Online — featured skin collection',
        numberOfItems: all.length,
        itemListElement: all.slice(0, 30).map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/${locale}/skins/${s.slug}`,
          name: `${s.name} Snake Skin`,
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
