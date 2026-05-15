import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { locales } from './locales';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://snakeonline.io';

/**
 * Build per-page Metadata object. Reads title/description from messages
 * (`meta.pages.<page>.title` / `.description`) for the active locale,
 * generates hreflang alternates for ALL locales, and sets canonical.
 *
 * Usage in a page's generateMetadata:
 *   return buildPageMetadata({ locale, page: 'play', path: '/play' });
 */
export async function buildPageMetadata({
  locale,
  page,
  path,
  imagePath = '/og-image.png',
}: {
  locale: string;
  page: string;
  path: string;
  imagePath?: string;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  const title = t(`pages.${page}.title`);
  const description = t(`pages.${page}.description`);
  const siteName = t('siteName');

  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${SITE_URL}/${l}${path}`;
  languages['x-default'] = `${SITE_URL}/en${path}`;

  const url = `${SITE_URL}/${locale}${path}`;
  const image = imagePath.startsWith('http') ? imagePath : `${SITE_URL}${imagePath}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      type: 'website',
      siteName,
      title,
      description,
      url,
      locale: locale.replace('-', '_'),
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@snakeonlineio',
      creator: '@snakeonlineio',
      title,
      description,
      images: [image],
    },
  };
}
