'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, HelpCircle } from 'lucide-react';
import { fadeUp, inView, easing } from '@/lib/motion';

export const FAQ_QUESTION_KEYS = [
  'whatIsIt',
  'isItFree',
  'doINeedToDownload',
  'howManySkins',
  'isItMultiplayer',
  'whichDevices',
  'howToWin',
  'vsWormzone',
  'vsSlither',
  'progressSync',
] as const;

export default function FAQ() {
  const t = useTranslations('faq');
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-24 sm:py-32" id="faq">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 chip-brand">
            <HelpCircle size={12} />
            {t('eyebrow')}
          </div>
          <h2 className="mt-5 font-display text-display-xl text-balance">
            <span className="gradient-text">{t('title')}</span>
          </h2>
          <p className="mt-4 text-lg text-text-secondary text-pretty">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={inView}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          className="mt-14 space-y-3"
        >
          {FAQ_QUESTION_KEYS.map((key, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={key}
                variants={fadeUp}
                className="rounded-2xl liquid-glass overflow-hidden"
              >
                <button
                  type="button"
                  id={`faq-trigger-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-start gap-4 text-left p-5 sm:p-6 hover:bg-white/[0.02] transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                >
                  <span className="flex-1 font-display text-lg font-semibold text-text-primary">
                    {t(`items.${key}.q`)}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: easing.smooth }}
                    className="shrink-0 mt-1 size-9 rounded-full liquid-glass-strong flex items-center justify-center text-brand-300 group-hover/q:bg-brand-500/15"
                    aria-hidden="true"
                  >
                    <Plus size={18} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { duration: 0.35, ease: easing.smooth },
                        opacity: { duration: 0.18, ease: 'easeOut' },
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 text-text-secondary text-pretty whitespace-pre-line">
                        {t(`items.${key}.a`)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
