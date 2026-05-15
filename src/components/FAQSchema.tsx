import { getTranslations } from 'next-intl/server';

const QUESTION_KEYS = [
  'whatIsIt',
  'isItFree',
  'doINeedToDownload',
  'howManySkins',
  'isItMultiplayer',
  'whichDevices',
  'howToWin',
  'vsWormzone',
  'vsSlither',
  'progressSync',
];

/**
 * Server component that emits FAQPage JSON-LD using the same i18n keys
 * the visible FAQ accordion reads. Render alongside <FAQ /> on the home page.
 */
export default async function FAQSchema({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'faq' });

  const json = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: QUESTION_KEYS.map(key => ({
      '@type': 'Question',
      name: t(`items.${key}.q`),
      acceptedAnswer: { '@type': 'Answer', text: t(`items.${key}.a`) },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
