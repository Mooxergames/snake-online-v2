import Hero from '@/components/Hero';
import SkinMarqueeStrip from '@/components/SkinMarqueeStrip';
import BentoFeatures from '@/components/BentoFeatures';
import ExperienceSection from '@/components/ExperienceSection';
import GameModes from '@/components/GameModes';
import PowerUps from '@/components/PowerUps';
import SnakeShowcase from '@/components/SnakeShowcase';
import CompareSection from '@/components/CompareSection';
import FAQ from '@/components/FAQ';
import FAQSchema from '@/components/FAQSchema';
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
      <FAQSchema locale={locale} />
      <Hero locale={locale} />
      <SkinMarqueeStrip />
      <BentoFeatures />
      <ExperienceSection />
      <GameModes />
      <PowerUps />
      <SnakeShowcase locale={locale} />
      <CompareSection />
      <FAQ />
      <CTABanner locale={locale} />
    </>
  );
}
