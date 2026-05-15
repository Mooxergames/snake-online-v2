'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Zap, Sparkles, Trophy, Calendar, Smartphone, Users, Globe, Shield } from 'lucide-react';
import { snakeImg } from '@/lib/assets';
import snakes from '@/data/snakes.json';
import CountUp from './motion/CountUp';
import { fadeUp, inView, staggerParent } from '@/lib/motion';
import TiltCard from './motion/TiltCard';

const PREVIEW_SKINS = ['CSNAKE_TR', 'CSNAKE_USA', 'CSNAKE_DE', 'CSNAKE_JP', 'CSNAKE_BR', 'FSNAKE_07']
  .filter(id => (snakes as string[]).includes(id));

export default function BentoFeatures() {
  const t = useTranslations('bento');

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none" aria-hidden="true" />

      <div className="container-wide relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <div className="chip-brand">{t('eyebrow')}</div>
          <h2 className="mt-4 font-display text-display-xl text-balance whitespace-pre-line">
            <span className="gradient-text">{t('title')}</span>
          </h2>
          <p className="mt-4 text-lg text-text-secondary text-pretty">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          variants={staggerParent(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          className="mt-14 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]"
        >
          {/* Tile 1 — Real-time multiplayer (2x2 hero tile, scaled-up typography
              so it visually dominates its 1x1 siblings per HIG bento ratios). */}
          <motion.div variants={fadeUp} className="md:col-span-2 md:row-span-2">
            <TiltCard className="liquid-glass rounded-3xl p-7 sm:p-8 h-full relative overflow-hidden group">
              <div
                className="absolute -right-10 -top-10 size-64 rounded-full blur-3xl opacity-50 transition-opacity group-hover:opacity-80"
                style={{ background: 'radial-gradient(circle, rgba(255,149,0,0.4), transparent 65%)' }}
                aria-hidden="true"
              />
              <div className="relative">
                <div className="size-14 rounded-2xl bg-brand-500/15 ring-1 ring-brand-500/30 flex items-center justify-center mb-6">
                  <Zap size={26} className="text-brand-300" aria-hidden="true" />
                </div>
                <h3 className="font-display text-display-md font-semibold text-balance">{t('items.realtime.title')}</h3>
                <p className="mt-4 text-base sm:text-lg text-text-secondary text-pretty max-w-md">{t('items.realtime.body')}</p>

                <div className="mt-7 inline-flex items-baseline gap-3 rounded-2xl liquid-glass-strong px-5 py-3.5">
                  <span className="font-display text-4xl sm:text-5xl font-bold gradient-text tabular-nums">
                    &lt;<CountUp end={100} duration={1.8} />
                  </span>
                  <span className="text-sm text-text-secondary">{t('items.realtime.metric')}</span>
                </div>
                <div className="mt-3 text-xs text-text-tertiary">{t('items.realtime.regions')}</div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Tile 2 — 200+ skins */}
          <motion.div variants={fadeUp}>
            <TiltCard className="liquid-glass rounded-3xl p-6 h-full relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(164,85,255,0.35), transparent 60%)' }}
                aria-hidden="true"
              />
              <div className="relative">
                <div className="size-11 rounded-xl bg-purple-500/15 ring-1 ring-purple-500/30 flex items-center justify-center mb-4">
                  <Sparkles size={20} className="text-purple-400" />
                </div>
                <h3 className="font-display text-lg font-semibold">{t('items.skins.title')}</h3>
                <div className="mt-1 font-mono text-3xl font-bold text-purple-300 tabular-nums">
                  <CountUp end={200} suffix="+" duration={2} />
                </div>
                <p className="mt-2 text-sm text-text-secondary">{t('items.skins.body')}</p>
              </div>
            </TiltCard>
          </motion.div>

          {/* Tile 3 — Global leaderboards */}
          <motion.div variants={fadeUp}>
            <TiltCard className="liquid-glass rounded-3xl p-6 h-full relative overflow-hidden">
              <div className="relative">
                <div className="size-11 rounded-xl bg-amber-500/15 ring-1 ring-amber-500/30 flex items-center justify-center mb-4">
                  <Trophy size={20} className="text-amber-400" />
                </div>
                <h3 className="font-display text-lg font-semibold">{t('items.leaderboards.title')}</h3>
                <div className="mt-1 font-mono text-3xl font-bold text-amber-300 tabular-nums">
                  <CountUp end={180} suffix="+" duration={2} />
                </div>
                <p className="mt-2 text-sm text-text-secondary">{t('items.leaderboards.body')}</p>
              </div>
            </TiltCard>
          </motion.div>

          {/* Tile 4 — Country skins showcase (wide) */}
          <motion.div variants={fadeUp} className="md:col-span-2">
            <TiltCard className="liquid-glass rounded-3xl p-6 h-full relative overflow-hidden">
              <div className="relative flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-11 rounded-xl bg-magenta-500/15 ring-1 ring-magenta-500/30 flex items-center justify-center">
                    <Globe size={20} className="text-magenta-400" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{t('items.country.title')}</h3>
                </div>
                <p className="text-sm text-text-secondary">{t('items.country.body')}</p>
                <div className="mt-auto pt-4 flex flex-wrap gap-2">
                  {PREVIEW_SKINS.slice(0, 6).map(id => (
                    <div
                      key={id}
                      className="size-12 rounded-xl bg-bg-elevated flex items-center justify-center transition-transform hover:scale-110"
                    >
                      <img src={snakeImg(id)} alt="" loading="lazy" className="w-4/5 h-4/5 object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Tile 5 — Daily tournaments */}
          <motion.div variants={fadeUp}>
            <TiltCard className="liquid-glass rounded-3xl p-6 h-full">
              <div className="size-11 rounded-xl bg-venom-500/15 ring-1 ring-venom-500/30 flex items-center justify-center mb-4">
                <Calendar size={20} className="text-venom-400" />
              </div>
              <h3 className="font-display text-lg font-semibold">{t('items.tournaments.title')}</h3>
              <p className="mt-2 text-sm text-text-secondary">{t('items.tournaments.body')}</p>
            </TiltCard>
          </motion.div>

          {/* Tile 6 — Cross-platform */}
          <motion.div variants={fadeUp}>
            <TiltCard className="liquid-glass rounded-3xl p-6 h-full">
              <div className="size-11 rounded-xl bg-sky-500/15 ring-1 ring-sky-500/30 flex items-center justify-center mb-4">
                <Smartphone size={20} className="text-sky-400" />
              </div>
              <h3 className="font-display text-lg font-semibold">{t('items.crossplay.title')}</h3>
              <p className="mt-2 text-sm text-text-secondary">{t('items.crossplay.body')}</p>
            </TiltCard>
          </motion.div>

          {/* Tile 7 — Fair play */}
          <motion.div variants={fadeUp}>
            <TiltCard className="liquid-glass rounded-3xl p-6 h-full">
              <div className="size-11 rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30 flex items-center justify-center mb-4">
                <Shield size={20} className="text-emerald-400" />
              </div>
              <h3 className="font-display text-lg font-semibold">{t('items.fairplay.title')}</h3>
              <p className="mt-2 text-sm text-text-secondary">{t('items.fairplay.body')}</p>
            </TiltCard>
          </motion.div>

          {/* Tile 8 — Community */}
          <motion.div variants={fadeUp}>
            <TiltCard className="liquid-glass rounded-3xl p-6 h-full">
              <div className="size-11 rounded-xl bg-rose-500/15 ring-1 ring-rose-500/30 flex items-center justify-center mb-4">
                <Users size={20} className="text-rose-400" />
              </div>
              <h3 className="font-display text-lg font-semibold">{t('items.community.title')}</h3>
              <p className="mt-2 text-sm text-text-secondary">{t('items.community.body')}</p>
            </TiltCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
