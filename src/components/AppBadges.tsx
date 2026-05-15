'use client';
import { Apple } from 'lucide-react';
import { useTranslations } from 'next-intl';

const APPLE_URL = 'https://apps.apple.com/us/app/online-snake-io-worm-clash/id6749900178';
const PLAY_URL = 'https://play.google.com/store/apps/details?id=io.multiplayer.snake.online.game';

function PlayIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.6 1.2c-.3.3-.5.7-.5 1.2v19.2c0 .5.2.9.5 1.2L14 12 3.6 1.2zM15.4 13.4l2.7 2.7-12 6.9 9.3-9.6zM18.7 8.5l-2.6 2.6-9.4-9.6 12 7zM21.6 11.1c.5.3.8.8.8 1.4 0 .6-.3 1.1-.8 1.4l-3 1.7-2.8-2.7 2.8-2.8 3 1z" />
    </svg>
  );
}

export default function AppBadges({ variant = 'default', className = '' }: { variant?: 'default' | 'mini'; className?: string }) {
  const t = useTranslations('appBadges');
  const mini = variant === 'mini';
  const sz = mini ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-sm';
  return (
    <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <a
        href={APPLE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Download Snake Online on the App Store (opens in a new tab)"
        className={`inline-flex items-center gap-2 rounded-xl bg-white text-bg font-semibold transition hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 ${sz}`}
      >
        <Apple size={mini ? 14 : 18} aria-hidden="true" />
        <span className="leading-none">
          <span className="block text-[9px] opacity-70 -mb-0.5">{t('appStore')}</span>
          App Store
        </span>
      </a>
      <a
        href={PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get Snake Online on Google Play (opens in a new tab)"
        className={`inline-flex items-center gap-2 rounded-xl bg-bg-elevated border border-border-strong text-text-primary font-semibold transition hover:scale-[1.02] hover:border-brand-500/50 ${sz}`}
      >
        <PlayIcon size={mini ? 14 : 18} />
        <span className="leading-none">
          <span className="block text-[9px] opacity-70 -mb-0.5">{t('playStore')}</span>
          Google Play
        </span>
      </a>
    </div>
  );
}
