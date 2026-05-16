'use client';
import { motion } from 'framer-motion';
import { Download, ExternalLink } from 'lucide-react';
import { fadeUp, inView } from '@/lib/motion';
import type { ReactNode } from 'react';

interface Props {
  brand: string;
  title: string;
  sub: string;
  version: string;
  size: string;
  url: string;
  cta: string;
  ctaCaption: string;
  ctaLabel: string;
  buttonClass: string;
  /** CSS gradient string used for the icon-disc background. */
  accent: string;
  /** rgba colour used for the floating glow behind the card. */
  glow: string;
  icon: ReactNode;
  index?: number;
}

/**
 * Platform download card with motion-reveal, brand-coloured glow,
 * and an "opens in store" badge for the storefront paths.
 */
export default function DownloadCard({
  brand, title, sub, version, size, url, cta, ctaCaption, ctaLabel,
  buttonClass, accent, glow, icon, index = 0,
}: Props) {
  const isExternal = url.startsWith('http');
  const isDirectDownload = url.endsWith('.exe') || url.endsWith('.dmg') || url.endsWith('.apk');
  return (
    <motion.a
      href={url}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      aria-label={`${cta} (${isExternal ? 'opens in new tab' : 'download'})`}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      variants={fadeUp}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className="group relative block rounded-3xl liquid-glass overflow-hidden p-6 transition-shadow hover:shadow-glow-brand"
    >
      <div
        className="absolute -top-10 -right-10 size-48 rounded-full blur-3xl opacity-50 transition-opacity duration-500 group-hover:opacity-80 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${glow}, transparent 65%)` }}
        aria-hidden="true"
      />
      <div className="relative flex flex-col h-full">
        <div
          className="size-14 rounded-2xl flex items-center justify-center text-bg shadow-lg mb-5 transition-transform duration-300 group-hover:scale-110"
          style={{ background: accent }}
          aria-hidden="true"
        >
          {icon}
        </div>

        <h3 className="font-display text-xl font-semibold">{brand}</h3>
        <p className="mt-1 text-sm text-text-tertiary line-clamp-2">{title}</p>
        <p className="mt-3 text-xs text-text-tertiary/80 flex-1">{sub}</p>

        <div className="mt-4 flex items-center justify-between text-[11px] text-text-tertiary font-mono uppercase tracking-wider">
          <span>{version}</span>
          <span aria-hidden="true">·</span>
          <span>{size}</span>
        </div>

        <div
          className={`mt-4 inline-flex items-center gap-2 rounded-xl ${buttonClass} px-4 py-3 font-semibold text-sm justify-center transition-colors`}
        >
          {isDirectDownload ? <Download size={16} aria-hidden="true" /> : <ExternalLink size={16} aria-hidden="true" />}
          <span className="leading-none text-left">
            <span className="block text-[9px] opacity-70 -mb-0.5">{ctaCaption}</span>
            {ctaLabel}
          </span>
        </div>
      </div>
    </motion.a>
  );
}
