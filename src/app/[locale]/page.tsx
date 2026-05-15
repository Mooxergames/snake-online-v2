import Hero from '@/components/Hero';
import FeatureGrid from '@/components/FeatureGrid';
import SnakeShowcase from '@/components/SnakeShowcase';
import CTABanner from '@/components/CTABanner';
import { unstable_setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata({ locale, page: 'home', path: '' });
}

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <>
      <Hero locale={locale} />
      <FeatureGrid />
      <SnakeShowcase locale={locale} />
      <CTABanner locale={locale} />
    </>
  );
}
