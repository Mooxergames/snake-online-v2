'use client';
import { useTranslations } from 'next-intl';
import snakes from '@/data/snakes.json';
import { snakeImg } from '@/lib/assets';
import Marquee from './motion/Marquee';

// Pick a diverse-looking sample of skin IDs from the data file (every Nth, capped at 28)
function pickSample(): string[] {
  const all = snakes as string[];
  if (!all.length) return [];
  const step = Math.max(1, Math.floor(all.length / 28));
  const out: string[] = [];
  for (let i = 0; i < all.length && out.length < 28; i += step) out.push(all[i]);
  return out;
}

export default function SkinMarqueeStrip() {
  const t = useTranslations('marquee');
  const sample = pickSample();
  if (sample.length === 0) return null;

  return (
    <section className="relative py-12 sm:py-16 border-y border-border bg-bg-elevated/40 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bg to-transparent z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bg to-transparent z-10"
      />

      <div className="container-wide relative">
        <div className="flex items-center gap-2 mb-6 justify-center text-text-tertiary text-xs uppercase tracking-[0.2em]">
          <span className="h-px w-12 bg-border" />
          {t('label')}
          <span className="h-px w-12 bg-border" />
        </div>
      </div>

      <Marquee speed="slow" pauseOnHover>
        {sample.map((id, i) => (
          <div
            key={`${id}-${i}`}
            className="shrink-0 size-20 sm:size-24 rounded-2xl liquid-glass flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:-translate-y-1"
          >
            <img
              src={snakeImg(id)}
              alt=""
              loading="lazy"
              className="w-4/5 h-4/5 object-contain"
              style={{ filter: 'drop-shadow(0 8px 18px rgba(255,149,0,0.25))' }}
            />
          </div>
        ))}
      </Marquee>
    </section>
  );
}
