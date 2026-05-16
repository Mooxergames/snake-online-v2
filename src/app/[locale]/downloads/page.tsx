import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Apple,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  Zap,
  ArrowRight,
  Check,
} from 'lucide-react';
import { snakeImg } from '@/lib/assets';
import { buildPageMetadata } from '@/lib/seo';
import DownloadCard from '@/components/downloads/DownloadCard';
import GradientMesh from '@/components/motion/GradientMesh';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata({ locale, page: 'downloads', path: '/downloads' });
}

// Store URLs — iOS and macOS both go to the App Store (Mac Catalyst build);
// Android Play Store path bumped to the new id.
const APP_STORE_URL = 'https://apps.apple.com/us/app/online-snake-io-worm-clash/id6749900178';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=io.multiplayer.snake.worm.online';
const WIN_URL = 'https://cdn.snakeonline.io/downloads/SnakeOnline-Setup-x64.exe';

function PlayStoreIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.6 1.2c-.3.3-.5.7-.5 1.2v19.2c0 .5.2.9.5 1.2L14 12 3.6 1.2zM15.4 13.4l2.7 2.7-12 6.9 9.3-9.6zM18.7 8.5l-2.6 2.6-9.4-9.6 12 7zM21.6 11.1c.5.3.8.8.8 1.4 0 .6-.3 1.1-.8 1.4l-3 1.7-2.8-2.7 2.8-2.8 3 1z" />
    </svg>
  );
}

function WindowsIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 5.6L11 4.4v7.2H3V5.6zM12 4.3L22 3v8.6H12V4.3zM3 12.4h8v7.2L3 18.4v-6zM12 12.4h10V21l-10-1.4v-7.2z" />
    </svg>
  );
}

export default async function DownloadsPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'downloadsPage' });

  // Four cards. iOS + macOS share APP_STORE_URL (Mac Catalyst single binary).
  const platforms = [
    {
      key: 'ios' as const,
      Icon: Apple,
      brand: 'iOS',
      title: t('platforms.ios.title'),
      sub: t('platforms.ios.sub'),
      version: 'v2.4.1',
      size: '142 MB',
      url: APP_STORE_URL,
      cta: t('platforms.ios.cta'),
      ctaCaption: t('platforms.ios.caption'),
      ctaLabel: 'App Store',
      buttonClass: 'bg-white text-bg hover:bg-slate-100',
      accent: 'linear-gradient(135deg, #f5f5f7 0%, #ffffff 60%, #d1d5db 100%)',
      glow: 'rgba(255,255,255,0.18)',
    },
    {
      key: 'android' as const,
      Icon: PlayStoreIcon,
      brand: 'Android',
      title: t('platforms.android.title'),
      sub: t('platforms.android.sub'),
      version: 'v2.4.1',
      size: '128 MB',
      url: PLAY_STORE_URL,
      cta: t('platforms.android.cta'),
      ctaCaption: t('platforms.android.caption'),
      ctaLabel: 'Google Play',
      buttonClass: 'bg-emerald-500 text-white hover:bg-emerald-400',
      accent: 'linear-gradient(135deg, #34d399 0%, #16a34a 60%, #84cc16 100%)',
      glow: 'rgba(52,211,153,0.32)',
    },
    {
      key: 'windows' as const,
      Icon: WindowsIcon,
      brand: 'Windows',
      title: t('platforms.windows.title'),
      sub: t('platforms.windows.sub'),
      version: 'v2.4.0',
      size: '186 MB',
      url: WIN_URL,
      cta: t('platforms.windows.cta'),
      ctaCaption: t('platforms.windows.caption'),
      ctaLabel: 'Installer',
      buttonClass: 'bg-sky-500 text-white hover:bg-sky-400',
      accent: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 60%, #06b6d4 100%)',
      glow: 'rgba(56,189,248,0.32)',
    },
    {
      key: 'mac' as const,
      Icon: Apple,
      brand: 'macOS',
      title: t('platforms.mac.title'),
      sub: t('platforms.mac.sub'),
      version: 'v2.4.1',
      size: '142 MB',
      url: APP_STORE_URL,
      cta: t('platforms.mac.cta'),
      ctaCaption: t('platforms.mac.caption'),
      ctaLabel: 'App Store',
      buttonClass: 'bg-white text-bg hover:bg-slate-100',
      accent: 'linear-gradient(135deg, #e5e7eb 0%, #ffffff 60%, #cbd5e1 100%)',
      glow: 'rgba(229,231,235,0.22)',
    },
  ];

  const features = [
    { Icon: Zap,    title: t('features.fps.title'),       body: t('features.fps.body') },
    { Icon: Shield, title: t('features.noads.title'),     body: t('features.noads.body') },
    { Icon: Globe,  title: t('features.crosssync.title'), body: t('features.crosssync.body') },
    { Icon: Cpu,    title: t('features.footprint.title'), body: t('features.footprint.body') },
  ];

  const reqs = [
    { Icon: Cpu,        label: t('reqs.cpu.label'),      val: t('reqs.cpu.val') },
    { Icon: HardDrive,  label: t('reqs.storage.label'),  val: t('reqs.storage.val') },
    { Icon: Wifi,       label: t('reqs.network.label'),  val: t('reqs.network.val') },
    { Icon: Shield,     label: t('reqs.security.label'), val: t('reqs.security.val') },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative pt-20 pb-12 sm:pt-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" aria-hidden="true" />
        <GradientMesh intensity="subtle" />
        <div className="container-wide relative">
          <div className="chip-brand">{t('eyebrow')}</div>
          <h1 className="mt-5 font-display text-display-xl text-balance max-w-4xl">
            <span className="text-text-primary">{t('titleLead')}</span>{' '}
            <span className="gradient-text">{t('titleAccent')}</span>
          </h1>
          <p className="mt-5 text-lg text-text-secondary max-w-3xl text-pretty">{t('subtitle')}</p>

          {/* Trust bullets */}
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
            {[t('trust.free'), t('trust.cosmetics'), t('trust.crossplay'), t('trust.lightweight')].map(b => (
              <span key={b} className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-venom-400" aria-hidden="true" />
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* WEB CTA — recommended path */}
      <section className="container-wide pb-12">
        <Link
          href={`/${locale}/play`}
          className="group relative block overflow-hidden rounded-3xl liquid-glass-strong p-7 sm:p-9 transition-all hover:-translate-y-1 hover:shadow-glow-brand"
        >
          <div
            className="absolute inset-0 opacity-60 pointer-events-none transition-opacity group-hover:opacity-80"
            style={{
              background:
                'radial-gradient(ellipse 50% 60% at 80% 30%, rgba(255,149,0,0.35), transparent 65%), radial-gradient(ellipse 40% 50% at 20% 80%, rgba(255,59,138,0.25), transparent 65%)',
            }}
            aria-hidden="true"
          />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-brand-400 to-magenta-500 flex items-center justify-center text-white shadow-glow-brand shrink-0">
              <Globe size={28} aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 chip-brand mb-2">
                <Zap size={11} aria-hidden="true" />
                {t('web.badge')}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold">{t('web.title')}</h2>
              <p className="mt-2 text-text-secondary max-w-xl">{t('web.body')}</p>
            </div>
            <span className="btn-primary shrink-0">
              <Globe size={16} aria-hidden="true" />
              {t('web.cta')}
              <ArrowRight size={16} aria-hidden="true" />
            </span>
          </div>
        </Link>
      </section>

      {/* PLATFORM CARDS — animated, brand-coloured */}
      <section className="container-wide pb-16">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-display text-display-md font-semibold">{t('platformsTitle')}</h2>
          <p className="mt-2 text-text-secondary">{t('platformsSubtitle')}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {platforms.map((p, i) => (
            <DownloadCard
              key={p.key}
              index={i}
              brand={p.brand}
              title={p.title}
              sub={p.sub}
              version={p.version}
              size={p.size}
              url={p.url}
              cta={p.cta}
              ctaCaption={p.ctaCaption}
              ctaLabel={p.ctaLabel}
              buttonClass={p.buttonClass}
              accent={p.accent}
              glow={p.glow}
              icon={<p.Icon size={28} aria-hidden="true" />}
            />
          ))}
        </div>
      </section>

      {/* WHY DOWNLOAD */}
      <section className="container-wide py-16 border-t border-border">
        <div className="mb-10">
          <div className="chip-brand">{t('whyEyebrow')}</div>
          <h2 className="mt-4 font-display text-display-md font-semibold">{t('whyTitle')}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(f => (
            <div key={f.title} className="rounded-2xl liquid-glass p-6 transition-all hover:-translate-y-1 hover:shadow-glow-brand">
              <div className="size-11 rounded-xl bg-brand-500/15 ring-1 ring-brand-500/30 text-brand-300 flex items-center justify-center mb-4">
                <f.Icon size={20} aria-hidden="true" />
              </div>
              <h3 className="font-display text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QR INSTALL */}
      <section className="container-wide py-16">
        <div className="rounded-3xl liquid-glass-strong p-8 sm:p-12 grid lg:grid-cols-[auto,1fr] gap-8 items-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 50% 60% at 80% 30%, rgba(255,149,0,0.3), transparent 65%)',
            }}
            aria-hidden="true"
          />
          <div className="relative size-44 sm:size-56 rounded-2xl bg-white p-3 shrink-0 mx-auto lg:mx-0 shadow-card-lifted">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https%3A%2F%2Fsnakeonline.io%2Fdownloads&color=06070A&bgcolor=FFFFFF&margin=0"
              alt={t('qr.alt')}
              className="w-full h-full"
              loading="lazy"
              width={400}
              height={400}
            />
          </div>
          <div className="relative text-center lg:text-left">
            <div className="inline-flex items-center gap-2 chip-brand mb-4">{t('qr.badge')}</div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-3">{t('qr.title')}</h2>
            <p className="text-text-secondary text-lg max-w-xl">{t('qr.body')}</p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t('platforms.ios.cta')} (opens in new tab)`}
                className="inline-flex items-center gap-2 rounded-xl bg-white text-bg font-semibold px-4 py-2.5 text-sm hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 transition-all"
              >
                <Apple size={18} aria-hidden="true" />
                <span className="leading-none text-left">
                  <span className="block text-[9px] opacity-70 -mb-0.5">{t('platforms.ios.caption')}</span>
                  App Store
                </span>
              </a>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t('platforms.android.cta')} (opens in new tab)`}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-white font-semibold px-4 py-2.5 text-sm hover:bg-emerald-400 hover:scale-[1.02] transition-all"
              >
                <PlayStoreIcon size={18} />
                <span className="leading-none text-left">
                  <span className="block text-[9px] opacity-70 -mb-0.5">{t('platforms.android.caption')}</span>
                  Google Play
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SYSTEM REQUIREMENTS */}
      <section className="container-wide py-16 border-t border-border">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-display text-display-md font-semibold">{t('reqsTitle')}</h2>
          <p className="mt-2 text-text-secondary">{t('reqsSubtitle')}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {reqs.map(r => (
            <div key={r.label} className="rounded-2xl liquid-glass p-6 flex items-start gap-4">
              <div className="size-11 rounded-xl bg-brand-500/15 ring-1 ring-brand-500/30 text-brand-300 flex items-center justify-center shrink-0">
                <r.Icon size={20} aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-text-tertiary mb-1">{r.label}</div>
                <div className="text-text-primary leading-relaxed text-sm">{r.val}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container-wide py-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-6 opacity-60">
          {['CSNAKE_USA', 'CSNAKE_TR', 'FSNAKE_01', 'FSNAKE_22', 'CSNAKE_DE', 'FSNAKE_07', 'CSNAKE_JP'].map(id => (
            <img
              key={id}
              src={snakeImg(id)}
              alt=""
              loading="lazy"
              width={64}
              height={64}
              className="size-12 sm:size-14 object-contain"
              aria-hidden="true"
            />
          ))}
        </div>
        <h2 className="font-display text-display-md font-semibold gradient-text mb-3">{t('finalTitle')}</h2>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">{t('finalBody')}</p>
        <Link href={`/${locale}/play`} className="btn-primary-xl inline-flex">
          {t('finalCta')} <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
