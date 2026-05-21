'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import Logo from './Logo';
import SocialIcons from './SocialIcons';
import { cn } from '@/lib/utils';

export default function Header({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Move focus into the panel when opened, and back to the toggle on close.
  // Listen for Escape anywhere in the document.
  useEffect(() => {
    if (!open) return;
    firstMobileLinkRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Body scroll lock while mobile menu open — small mobile UX win.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const links = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/snakes`, label: t('snakes') },
    { href: `/${locale}/game-ranking`, label: t('ranking') },
    { href: `/${locale}/downloads`, label: 'Downloads' },
    { href: `/${locale}/community`, label: t('community') },
    { href: `/${locale}/news`, label: t('news') },
    { href: `/${locale}/about`, label: t('about') },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        // Chrome layer matches the deepest liquid-glass density (36px) so the header
        // is the strongest glass layer, not the weakest.
        scrolled
          ? 'bg-bg/70 backdrop-blur-[36px] saturate-[1.8] border-b border-border shadow-[0_8px_32px_rgba(0,0,0,0.45)]'
          : 'bg-bg/40 backdrop-blur-sm'
      )}
    >
      <div className="hidden md:block border-b border-border/60 bg-bg-elevated/40">
        <div className="container-wide flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-venom-500 animate-pulse" aria-hidden="true" />
              5M+ players online globally
            </span>
            <span className="hidden lg:inline opacity-60" aria-hidden="true">·</span>
            <a href="mailto:info@visiongo.at" className="hidden lg:inline text-text-secondary hover:text-text-primary transition-colors">info@visiongo.at</a>
          </div>
          <div className="flex items-center gap-2">
            <SocialIcons size={13} />
          </div>
        </div>
      </div>

      <div className="container-wide flex h-16 items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex items-center group" aria-label="Snake Online home">
          <Logo className="h-10 w-auto transition-transform group-hover:scale-105" />
        </Link>

        <nav aria-label="Primary" className="hidden lg:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3.5 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-full hover:bg-white/5 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <Link href={`/${locale}/play`} className="btn-primary !px-5 !py-2.5 !text-sm hidden sm:inline-flex">
            {t('playNow')}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="lg:hidden p-2 rounded-full hover:bg-white/5"
            onClick={() => setOpen(v => !v)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="lg:hidden border-t border-border bg-bg/95 backdrop-blur-xl">
          <nav aria-label="Mobile primary" className="container-wide py-4 flex flex-col gap-1">
            {links.map((l, i) => (
              <Link
                key={l.href}
                ref={i === 0 ? firstMobileLinkRef : undefined}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-text-primary hover:bg-white/5 font-medium"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={`/${locale}/play`}
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 w-full"
            >
              {t('playNow')}
            </Link>
            <div className="pt-3 mt-2 border-t border-border flex justify-center">
              <SocialIcons size={18} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
