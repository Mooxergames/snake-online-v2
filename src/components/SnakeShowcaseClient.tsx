'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { snakeImg } from '@/lib/assets';
import type { Skin } from '@/lib/skins';

export interface ShowcaseItem extends Skin { glow: string }

export default function SnakeShowcaseClient({ locale, items }: { locale: string; items: ShowcaseItem[] }) {
  const t = useTranslations('snakes');

  return (
    <section className="py-24 sm:py-32 bg-bg-elevated/40 border-y border-border">
      <div className="container-wide">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <h2 className="font-display text-display-xl text-balance">{t('title')}</h2>
            <p className="mt-4 text-lg text-text-secondary">{t('subtitle')}</p>
          </motion.div>
          <Link href={`/${locale}/snakes`} className="btn-secondary">
            {t('viewAll')} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link
                href={`/${locale}/skins/${s.slug}`}
                className="card card-hover relative overflow-hidden group block focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                aria-label={`${s.name} — ${t(`tiers.${s.rarity}`)} snake skin`}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 30%, ${s.glow}, transparent 65%)` }}
                  aria-hidden="true"
                />
                <div className="relative">
                  <div
                    className="aspect-square rounded-xl bg-bg-subtle flex items-center justify-center overflow-hidden relative"
                    style={{ background: `radial-gradient(circle at 50% 60%, ${s.glow}22, transparent 70%), #0E0F14` }}
                  >
                    <img
                      src={snakeImg(s.id)}
                      alt={`${s.name} snake skin in Snake Online`}
                      loading="lazy"
                      width={400}
                      height={400}
                      className="w-4/5 h-4/5 object-contain transition-transform duration-500 group-hover:scale-110"
                      style={{ filter: `drop-shadow(0 12px 28px ${s.glow}66)` }}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold">{s.name}</h3>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border tier-${s.rarity}`}>
                      {t(`tiers.${s.rarity}`)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
