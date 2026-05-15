'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Zap, Sparkles, Trophy, Calendar, Smartphone, Users } from 'lucide-react';

const ICONS = [Zap, Sparkles, Trophy, Calendar, Smartphone, Users];

export default function FeatureGrid() {
  const t = useTranslations('features');
  const items = t.raw('items') as Array<{ title: string; description: string }>;

  return (
    <section className="py-24 sm:py-32">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <h2 className="font-display text-display-xl text-balance whitespace-pre-line">{t('title')}</h2>
          <p className="mt-4 text-lg text-text-secondary text-pretty">{t('subtitle')}</p>
        </motion.div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = ICONS[i] || Zap;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }}
                className="card card-hover group"
              >
                <div className="size-11 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 mb-5 group-hover:bg-brand-500/20 transition-colors">
                  <Icon size={20} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
