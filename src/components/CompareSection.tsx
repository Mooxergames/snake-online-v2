'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Check, X, Trophy } from 'lucide-react';
import { fadeUp, inView, staggerParent } from '@/lib/motion';

interface Row {
  key: string;
  us: boolean | string;
  them: boolean | string;
}

const ROWS: Row[] = [
  { key: 'realtime',    us: true,  them: false },
  { key: 'skins',       us: '200+', them: '~80' },
  { key: 'languages',   us: '14',  them: '1' },
  { key: 'leaderboard', us: true,  them: false },
  { key: 'schema',      us: true,  them: false },
  { key: 'crossplay',   us: true,  them: false },
  { key: 'tournaments', us: true,  them: false },
  { key: 'offline',     us: false, them: true },
];

function Cell({ value, yesLabel, noLabel }: { value: boolean | string; yesLabel: string; noLabel: string }) {
  if (typeof value === 'boolean') {
    const label = value ? yesLabel : noLabel;
    return value ? (
      <span
        role="img"
        aria-label={label}
        className="inline-flex size-7 items-center justify-center rounded-full bg-venom-500/15 ring-1 ring-venom-500/40 text-venom-400"
      >
        <Check size={16} strokeWidth={2.5} aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </span>
    ) : (
      <span
        role="img"
        aria-label={label}
        className="inline-flex size-7 items-center justify-center rounded-full bg-rose-500/10 ring-1 ring-rose-500/30 text-rose-400"
      >
        <X size={16} strokeWidth={2.5} aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </span>
    );
  }
  return <span className="font-mono text-sm font-semibold text-text-primary">{value}</span>;
}

export default function CompareSection() {
  const t = useTranslations('compare');

  return (
    <section className="relative py-24 sm:py-32 bg-bg-elevated/40 border-y border-border">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 chip-brand">
            <Trophy size={12} />
            {t('eyebrow')}
          </div>
          <h2 className="mt-5 font-display text-display-xl text-balance">
            <span className="gradient-text">{t('title')}</span>
          </h2>
          <p className="mt-4 text-lg text-text-secondary text-pretty">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          variants={staggerParent(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          className="mt-14 mx-auto max-w-4xl"
        >
          {/* ARIA grid pattern: gives SR users row/column relationships without forcing
              a real <table> (which would fight CSS grid layout). */}
          <div
            role="table"
            aria-label={t('title')}
            className="rounded-3xl liquid-glass-strong overflow-hidden"
          >
            <div
              role="row"
              className="grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_160px_160px] gap-2 px-5 sm:px-8 py-5 border-b border-border"
            >
              <div role="columnheader" className="text-xs uppercase tracking-wider text-text-tertiary self-end">{t('feature')}</div>
              <div role="columnheader" className="text-center">
                <div className="inline-flex items-center gap-2 text-brand-300 font-display text-sm font-semibold">
                  <span className="size-2 rounded-full bg-venom-500 animate-pulse" aria-hidden="true" />
                  {t('us')}
                </div>
              </div>
              <div role="columnheader" className="text-center text-text-tertiary font-display text-sm">{t('them')}</div>
            </div>

            {ROWS.map((row, i) => (
              <motion.div
                key={row.key}
                role="row"
                variants={fadeUp}
                className={`grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_160px_160px] gap-2 px-5 sm:px-8 py-4 items-center transition-colors hover:bg-brand-500/5 ${
                  i % 2 === 0 ? 'bg-white/[0.035]' : ''
                }`}
              >
                <div role="rowheader">
                  <div className="font-medium text-sm text-text-primary">{t(`rows.${row.key}.title`)}</div>
                  <div className="mt-0.5 text-xs text-text-tertiary hidden sm:block">{t(`rows.${row.key}.note`)}</div>
                </div>
                <div role="cell" className="text-center"><Cell value={row.us} yesLabel={t('cellYes')} noLabel={t('cellNo')} /></div>
                <div role="cell" className="text-center"><Cell value={row.them} yesLabel={t('cellYes')} noLabel={t('cellNo')} /></div>
              </motion.div>
            ))}
          </div>

          <p className="mt-5 text-xs text-text-tertiary text-center max-w-2xl mx-auto">{t('disclaimer')}</p>
        </motion.div>
      </div>
    </section>
  );
}
