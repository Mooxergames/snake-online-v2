import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, localeMeta, type Locale } from '@/lib/locales';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SchemaOrg from '@/components/SchemaOrg';
import SmoothScrollProvider from '@/components/motion/SmoothScrollProvider';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const sora = Sora({ subsets: ['latin'], variable: '--font-display', display: 'swap', weight: ['500', '600', '700', '800'] });

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://snakeonline.io';

  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${siteUrl}/${l}`;
  languages['x-default'] = `${siteUrl}/en`;

  return {
    metadataBase: new URL(siteUrl),
    title: { default: t('defaultTitle'), template: `%s — ${t('siteName')}` },
    description: t('defaultDescription'),
    keywords: ['snake io', 'snake online', 'multiplayer snake', 'slither game', 'worm game', 'battle royale snake', 'free snake game'],
    authors: [{ name: 'Snake Online Studio' }],
    creator: 'Snake Online Studio',
    publisher: 'Snake Online',
    applicationName: 'Snake Online',
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages,
    },
    openGraph: {
      type: 'website',
      siteName: t('siteName'),
      title: t('defaultTitle'),
      description: t('defaultDescription'),
      url: `${siteUrl}/${locale}`,
      locale: locale.replace('-', '_'),
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: t('siteName') }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@snakeonlineio',
      creator: '@snakeonlineio',
      title: t('defaultTitle'),
      description: t('defaultDescription'),
      images: ['/og-image.png'],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    icons: {
      icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    },
    manifest: '/manifest.webmanifest',
  };
}

export const viewport: Viewport = {
  themeColor: '#06070A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const messages = await getMessages();
  const dir = localeMeta[locale as Locale].dir;

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen bg-bg text-text-primary antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <SchemaOrg locale={locale} />
          <SmoothScrollProvider>
            <Header locale={locale} />
            <main className="min-h-screen">{children}</main>
            <Footer locale={locale} />
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
