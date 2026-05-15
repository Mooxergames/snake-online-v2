'use client';
import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, Check } from 'lucide-react';
import { locales, localeMeta, type Locale } from '@/lib/locales';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const switchTo = (newLocale: Locale) => {
    const segments = pathname.split('/').filter(Boolean);
    if (locales.includes(segments[0] as Locale)) segments.shift();
    const newPath = `/${newLocale}/${segments.join('/')}`.replace(/\/+$/, '') || `/${newLocale}`;
    router.push(newPath);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
        aria-label="Select language"
        aria-expanded={open}
      >
        <Globe size={16} />
        <span className="hidden sm:inline uppercase font-medium">{locale}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 max-h-[28rem] overflow-y-auto scrollbar-thin glass rounded-2xl p-2 shadow-2xl z-50 animate-fade-up">
          {locales.map(l => {
            const meta = localeMeta[l];
            const active = l === locale;
            return (
              <button
                key={l}
                type="button"
                onClick={() => switchTo(l)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                  active ? 'bg-brand-500/15 text-brand-300' : 'hover:bg-white/5 text-text-primary'
                )}
              >
                <span className="flex items-center gap-3">
                  <span className="text-base leading-none">{meta.flag}</span>
                  <span className="font-medium">{meta.native}</span>
                  <span className="text-text-tertiary text-xs uppercase">{l}</span>
                </span>
                {active && <Check size={14} className="text-brand-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
