import { unstable_setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import GamePlayer from '@/components/GamePlayer';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata({ locale, page: 'play', path: '/play' });
}

export default function PlayPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return <GamePlayer locale={locale} gameUrl="https://play.snakeonline.io" />;
}
