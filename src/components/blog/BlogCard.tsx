'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Target, Trophy, Bell, Users, BookOpen, Calendar, Code2, History, Globe } from 'lucide-react';
import type { BlogPost, BlogCategorySlug } from '@/lib/blog-data';
import { fadeUp, inView } from '@/lib/motion';
import { useTranslations } from 'next-intl';

const ICONS: Record<BlogCategorySlug, typeof Sparkles> = {
  'skin-spotlight': Sparkles,
  'strategy': Target,
  'comparisons': Trophy,
  'updates': Bell,
  'community': Users,
  'lore': BookOpen,
  'tech-deep-dive': Code2,
  'gaming-history': History,
  'country-culture': Globe,
};

interface Props {
  post: BlogPost;
  locale: string;
  size?: 'sm' | 'md' | 'lg';
  index?: number;
}

export default function BlogCard({ post, locale, size = 'md', index = 0 }: Props) {
  const tCat = useTranslations('blog.categories');
  const tMeta = useTranslations('blog');
  const Icon = post.category ? (ICONS[post.category] ?? Sparkles) : Sparkles;
  const tierClass = post.category ? `tier-${getCategoryTier(post.category)}` : 'tier-common';

  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={inView}
      variants={fadeUp}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/${locale}/news/${post.slug}`}
        className={`group block relative overflow-hidden rounded-3xl liquid-glass transition-all hover:-translate-y-1 hover:shadow-glow-brand ${isLg ? 'p-7' : isSm ? 'p-4' : 'p-6'}`}
      >
        {post.cover && (
          <div className={`relative ${isLg ? 'aspect-[16/9]' : 'aspect-[4/3]'} -m-7 ${isLg ? 'mb-6' : 'mb-5'} overflow-hidden ${isLg ? '!m-0 !mb-6 rounded-2xl' : ''} ${isSm ? '!m-0 !mb-4 rounded-xl' : ''}`}>
            <div
              className="absolute inset-0 opacity-60 group-hover:opacity-90 transition-opacity duration-500"
              style={{
                background: 'radial-gradient(circle at 50% 30%, rgba(255,149,0,0.35), transparent 65%), radial-gradient(circle at 70% 80%, rgba(255,59,138,0.25), transparent 65%)',
              }}
              aria-hidden="true"
            />
            <img
              src={post.cover}
              alt={`${post.title} — Snake Online`}
              loading="lazy"
              width={800}
              height={isLg ? 450 : 600}
              className="relative w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
              style={{ filter: 'drop-shadow(0 12px 28px rgba(255,149,0,0.45))' }}
            />
          </div>
        )}

        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            {post.category && (
              <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-bold px-2.5 py-1 rounded-md border ${tierClass}`}>
                <Icon size={11} aria-hidden="true" />
                {tCat(`${post.category}.title`)}
              </span>
            )}
            <span className="text-[11px] text-text-tertiary inline-flex items-center gap-1">
              <Calendar size={11} aria-hidden="true" />
              {new Date(post.date).toLocaleDateString(locale)}
            </span>
          </div>

          <h3 className={`font-display font-semibold text-balance group-hover:text-brand-300 transition-colors ${isLg ? 'text-2xl sm:text-3xl' : isSm ? 'text-base' : 'text-xl'}`}>
            {post.title}
          </h3>

          {!isSm && (
            <p className={`mt-3 text-text-secondary text-pretty ${isLg ? 'text-base sm:text-lg max-w-2xl' : 'text-sm line-clamp-3'}`}>
              {post.description}
            </p>
          )}

          <div className="mt-5 flex items-center gap-3 text-xs text-text-tertiary">
            <span className="inline-flex items-center gap-1">
              <Clock size={11} aria-hidden="true" />
              {tMeta('readingTime', { min: post.readingTimeMin })}
            </span>
            {post.isAiGenerated && (
              <span className="inline-flex items-center gap-1 opacity-75">
                <Sparkles size={10} aria-hidden="true" />
                {tMeta('aiAssisted')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function getCategoryTier(slug: BlogCategorySlug) {
  switch (slug) {
    case 'skin-spotlight':  return 'mythic';
    case 'strategy':        return 'legendary';
    case 'comparisons':     return 'epic';
    case 'updates':         return 'rare';
    case 'community':       return 'common';
    case 'lore':            return 'exclusive';
    case 'tech-deep-dive':  return 'epic';
    case 'gaming-history':  return 'legendary';
    case 'country-culture': return 'rare';
  }
}
