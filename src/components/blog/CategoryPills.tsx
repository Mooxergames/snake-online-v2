'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Target, Trophy, Bell, Users, BookOpen, Newspaper } from 'lucide-react';
import { CATEGORIES, type BlogCategorySlug } from '@/lib/blog-data';
import { useTranslations } from 'next-intl';
import { fadeUp, inView } from '@/lib/motion';

const ICONS: Record<BlogCategorySlug, typeof Sparkles> = {
  'skin-spotlight': Sparkles,
  'strategy': Target,
  'comparisons': Trophy,
  'updates': Bell,
  'community': Users,
  'lore': BookOpen,
};

interface Props {
  locale: string;
  activeSlug?: BlogCategorySlug;
}

export default function CategoryPills({ locale, activeSlug }: Props) {
  const t = useTranslations('blog.categories');
  return (
    <motion.nav
      aria-label="Blog categories"
      initial="hidden"
      whileInView="show"
      viewport={inView}
      variants={fadeUp}
      className="flex flex-wrap items-center gap-2"
    >
      <Link
        href={`/${locale}/news`}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          !activeSlug
            ? 'bg-brand-500 text-bg shadow-glow-brand'
            : 'liquid-glass text-text-secondary hover:text-text-primary'
        }`}
      >
        <Newspaper size={12} aria-hidden="true" />
        {t('all')}
      </Link>
      {CATEGORIES.map(c => {
        const Icon = ICONS[c.slug];
        const active = c.slug === activeSlug;
        return (
          <Link
            key={c.slug}
            href={`/${locale}/news/category/${c.slug}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              active
                ? 'bg-brand-500 text-bg shadow-glow-brand'
                : 'liquid-glass text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon size={12} aria-hidden="true" />
            {t(`${c.slug}.title`)}
          </Link>
        );
      })}
    </motion.nav>
  );
}
