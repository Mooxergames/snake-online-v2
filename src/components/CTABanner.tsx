'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import AppBadges from './AppBadges';
import { snakeImg } from '@/lib/assets';

const SHOWCASE_IDS = ['FSNAKE_01', 'FSNAKE_22', 'CSNAKE_USA', 'FSNAKE_07', 'CSNAKE_TR', 'FSNAKE_12'];

export default function CTABanner({ locale }: { locale: string }) {
  const t = useTranslations('cta');

  return (
    <section className="container-wide py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.7 }}
        className="relative overflow-hidden rounded-3xl liquid-glass-strong shadow-card-lifted p-10 sm:p-16 text-center"
      >
        <div
          className="absolute inset-0 opacity-90 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(255,149,0,0.20), transparent 65%), radial-gradient(ellipse 40% 60% at 20% 30%, rgba(255,59,138,0.15), transparent 65%), radial-gradient(ellipse 40% 60% at 80% 70%, rgba(164,85,255,0.15), transparent 65%)',
          }}
        />
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" aria-hidden="true" />

        {/* decorative snake row */}
        <div className="absolute inset-x-0 -top-6 flex justify-center gap-4 pointer-events-none opacity-30 hidden sm:flex" aria-hidden="true">
          {SHOWCASE_IDS.map(id => (
            <img key={id} src={snakeImg(id)} alt="" loading="lazy" className="size-16 object-contain" />
          ))}
        </div>

        <div className="relative">
          <h2 className="font-display text-display-xl gradient-text text-balance max-w-3xl mx-auto whitespace-pre-line">
            {t('bannerTitle')}
          </h2>
          <p className="mt-5 text-lg text-text-secondary max-w-xl mx-auto">{t('bannerSubtitle')}</p>
          <div className="mt-10 inline-flex flex-wrap items-center justify-center gap-3">
            <Link href={`/${locale}/play`} className="btn-primary !text-base">
              <Play size={18} fill="currentColor" /> {t('playFree')}
            </Link>
          </div>
          <div className="mt-6 inline-flex justify-center">
            <AppBadges />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
