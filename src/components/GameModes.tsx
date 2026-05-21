'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Swords, Crown, Skull, Clock, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeUp, inView } from '@/lib/motion';

const MODES = [
  {
    key: 'classic',
    icon: Swords,
    image: '/modes/classic.webp',
    accent: 'from-emerald-500 to-cyan-400',
    glow: 'rgba(16,185,129,0.3)',
  },
  {
    key: 'battleRoyale',
    icon: Crown,
    image: '/modes/battle-royale.webp',
    accent: 'from-amber-500 to-orange-400',
    glow: 'rgba(255,149,0,0.3)',
  },
  {
    key: 'deathMatch',
    icon: Skull,
    image: '/modes/death-match.webp',
    accent: 'from-rose-500 to-red-400',
    glow: 'rgba(239,68,68,0.3)',
  },
  {
    key: 'timeTunnel',
    icon: Clock,
    image: '/modes/time-tunnel.webp',
    accent: 'from-violet-500 to-purple-400',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    key: 'treasureHunt',
    icon: Gem,
    image: '/modes/treasure-hunt.webp',
    accent: 'from-sky-500 to-blue-400',
    glow: 'rgba(14,165,233,0.3)',
  },
] as const;

export default function GameModes() {
  const t = useTranslations('gameModes');
  const [active, setActive] = useState(0);
  const mode = MODES[active];

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" aria-hidden="true" />

      <div className="container-wide relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="chip-brand mx-auto w-fit">{t('eyebrow')}</div>
          <h2 className="mt-4 font-display text-display-lg">
            <span className="gradient-text">{t('title')}</span>
          </h2>
          <p className="mt-4 text-lg text-text-secondary">{t('subtitle')}</p>
        </motion.div>

        <div className="mt-14 grid lg:grid-cols-[1fr_1.4fr] gap-8 items-start">
          {/* Mode selector */}
          <div className="flex flex-col gap-2">
            {MODES.map((m, i) => {
              const Icon = m.icon;
              const isActive = i === active;
              return (
                <button
                  key={m.key}
                  onClick={() => setActive(i)}
                  className={cn(
                    'flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300',
                    isActive
                      ? 'liquid-glass-strong scale-[1.02]'
                      : 'hover:bg-white/[0.03]'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex items-center justify-center size-11 rounded-xl transition-all',
                      isActive
                        ? `bg-gradient-to-br ${m.accent} text-bg shadow-lg`
                        : 'bg-bg-subtle text-text-tertiary'
                    )}
                  >
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0">
                    <div className={cn('font-semibold transition-colors', isActive ? 'text-text-primary' : 'text-text-secondary')}>
                      {t(`modes.${m.key}.name`)}
                    </div>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-sm text-text-tertiary mt-1 line-clamp-2"
                      >
                        {t(`modes.${m.key}.short`)}
                      </motion.p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mode preview */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode.key}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4 }}
                className="liquid-glass rounded-3xl overflow-hidden"
              >
                <div
                  className="relative aspect-[4/3] flex items-center justify-center p-6 sm:p-10"
                  style={{ background: `radial-gradient(circle at 50% 35%, ${mode.glow}, transparent 70%), #0E0F14` }}
                >
                  <Image
                    src={mode.image}
                    alt={t(`modes.${mode.key}.name`)}
                    width={500}
                    height={482}
                    className="max-h-full w-auto object-contain drop-shadow-[0_18px_36px_rgba(0,0,0,0.6)]"
                    sizes="(max-width: 768px) 90vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-text-primary">
                      {t(`modes.${mode.key}.name`)}
                    </h3>
                    <p className="mt-2 text-text-secondary text-sm sm:text-base max-w-lg">
                      {t(`modes.${mode.key}.description`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            {/* Glow */}
            <div
              className="absolute -inset-4 rounded-3xl blur-3xl opacity-30 -z-10 transition-colors duration-500"
              style={{ background: `radial-gradient(circle, ${mode.glow}, transparent 70%)` }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
