'use client';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeUp, inView, staggerParent } from '@/lib/motion';

const POWERUPS = [
  { key: 'magnify',    image: '/powerups/magnify.png',        color: '#22C55E', bg: 'bg-emerald-500/10 ring-emerald-500/30' },
  { key: 'magnet',     image: '/powerups/magnet.png',         color: '#A855F7', bg: 'bg-violet-500/10 ring-violet-500/30' },
  { key: 'x2',         image: '/powerups/x2.png',             color: '#F59E0B', bg: 'bg-amber-500/10 ring-amber-500/30' },
  { key: 'x5',         image: '/powerups/x5.png',             color: '#EF4444', bg: 'bg-red-500/10 ring-red-500/30' },
  { key: 'scoreSaver', image: '/powerups/score-saver.png',    color: '#06B6D4', bg: 'bg-cyan-500/10 ring-cyan-500/30' },
  { key: 'quickTurn',  image: '/powerups/quick-turn.png',     color: '#FF9500', bg: 'bg-brand-500/10 ring-brand-500/30' },
] as const;

export default function PowerUps() {
  const t = useTranslations('powerUps');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none" aria-hidden="true" />

      <div className="container-wide relative">
        <div className="flex items-end justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inView}
            transition={{ duration: 0.7 }}
          >
            <div className="chip-brand">{t('eyebrow')}</div>
            <h2 className="mt-4 font-display text-display-lg">
              <span className="gradient-text">{t('title')}</span>
            </h2>
            <p className="mt-4 text-lg text-text-secondary max-w-xl">{t('subtitle')}</p>
          </motion.div>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button onClick={() => scroll('left')} className="btn-ghost !p-2.5 glass rounded-full" aria-label="Scroll left">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll('right')} className="btn-ghost !p-2.5 glass rounded-full" aria-label="Scroll right">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="mt-10 flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 -mx-5 px-5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          {POWERUPS.map((pu, i) => (
            <motion.div
              key={pu.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inView}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="snap-start shrink-0 w-[220px] sm:w-[240px]"
            >
              <div className="liquid-glass rounded-2xl p-5 h-full group hover:border-border-strong transition-all duration-300 hover:-translate-y-1">
                <div className={cn('mx-auto size-24 rounded-2xl ring-1 flex items-center justify-center mb-4', pu.bg)}>
                  <Image
                    src={pu.image}
                    alt={t(`items.${pu.key}.name`)}
                    width={64}
                    height={64}
                    className="object-contain drop-shadow-lg group-hover:scale-110 transition-transform"
                  />
                </div>
                <h3 className="font-semibold text-text-primary text-center">{t(`items.${pu.key}.name`)}</h3>
                <p className="mt-1.5 text-xs text-text-tertiary text-center line-clamp-2">{t(`items.${pu.key}.desc`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
