'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { fadeUp, inView, easing } from '@/lib/motion';

export interface FAQItem {
  q: string;
  a: string;
}

interface Props {
  items: FAQItem[];
  /** Stable id prefix so multiple accordions on one page don't collide. */
  idPrefix?: string;
  /** Which item is open by default (-1 = none). Defaults to 0. */
  defaultOpenIndex?: number;
  className?: string;
}

/**
 * Generic FAQ accordion. Used by /support and as the UI engine behind the
 * homepage <FAQ /> (which loads items from i18n + emits FAQPage JSON-LD).
 * Accessibility:
 *   - aria-expanded / aria-controls on the trigger button
 *   - role="region" + aria-labelledby on the disclosed panel
 *   - height + opacity animated separately to avoid the jank at height→auto
 */
export default function FAQAccordion({
  items,
  idPrefix = 'faq',
  defaultOpenIndex = 0,
  className = '',
}: Props) {
  const [open, setOpen] = useState<number | null>(defaultOpenIndex >= 0 ? defaultOpenIndex : null);

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={inView}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
      className={`space-y-3 ${className}`}
    >
      {items.map((item, i) => {
        const isOpen = open === i;
        const triggerId = `${idPrefix}-trigger-${i}`;
        const panelId = `${idPrefix}-panel-${i}`;
        return (
          <motion.div
            key={`${idPrefix}-${i}`}
            variants={fadeUp}
            className="rounded-2xl liquid-glass overflow-hidden"
          >
            <button
              type="button"
              id={triggerId}
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-start gap-4 text-left p-5 sm:p-6 hover:bg-white/[0.02] transition-colors"
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <span className="flex-1 font-display text-lg font-semibold text-text-primary">{item.q}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: easing.smooth }}
                className="shrink-0 mt-1 size-9 rounded-full liquid-glass-strong flex items-center justify-center text-brand-300"
                aria-hidden="true"
              >
                <Plus size={18} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: { duration: 0.35, ease: easing.smooth },
                    opacity: { duration: 0.18, ease: 'easeOut' },
                  }}
                  className="overflow-hidden"
                >
                  <div className="px-5 sm:px-6 pb-6 text-text-secondary text-pretty whitespace-pre-line">{item.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
