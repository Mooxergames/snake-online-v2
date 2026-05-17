import { unstable_setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import GamePlayer from '@/components/GamePlayer';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata({ locale, page: 'play', path: '/play' });
}

// WebGL build URL — opens inside the GamePlayer fullscreen iframe.
// Update this env var (NEXT_PUBLIC_WEBGL_URL) when the game build moves.
const WEBGL_URL = process.env.NEXT_PUBLIC_WEBGL_URL || 'https://mxrtoken.com/game/v12/index.html';

export default function PlayPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return <GamePlayer locale={locale} gameUrl={WEBGL_URL} />;
}
