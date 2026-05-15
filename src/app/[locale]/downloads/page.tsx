import { unstable_setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { Apple, Download, Globe, Monitor, Smartphone, Cpu, HardDrive, Wifi, Shield, Zap, ArrowRight } from 'lucide-react';
import { snakeImg } from '@/lib/assets';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildPageMetadata({ locale, page: 'downloads', path: '/downloads' });
}

const APPLE_URL = 'https://apps.apple.com/us/app/online-snake-io-worm-clash/id6749900178';
const PLAY_URL = 'https://play.google.com/store/apps/details?id=io.multiplayer.snake.online.game';
const WIN_URL = 'https://cdn.snakeonline.io/downloads/SnakeOnline-Setup-x64.exe';
const MAC_URL = 'https://cdn.snakeonline.io/downloads/SnakeOnline-Installer.dmg';

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

export default function DownloadsPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);

  const platforms = [
    {
      key: 'ios',
      Icon: Apple,
      brand: 'iOS',
      title: 'iPhone & iPad',
      version: 'v 2.4.1',
      size: '142 MB',
      sub: 'Requires iOS 13.0 or later',
      cta: 'Download on the App Store',
      caption: 'Download on the',
      url: APPLE_URL,
      accent: 'from-slate-200 via-slate-100 to-white',
      cardAccent: 'from-slate-500/15 to-slate-500/5',
      btnClass: 'bg-white text-bg hover:bg-slate-100',
    },
    {
      key: 'android',
      Icon: PlayStoreIcon,
      brand: 'Android',
      title: 'Android phones & tablets',
      version: 'v 2.4.1',
      size: '128 MB',
      sub: 'Requires Android 8.0 or later',
      cta: 'Get it on Google Play',
      caption: 'Get it on',
      url: PLAY_URL,
      accent: 'from-emerald-400 via-green-400 to-lime-400',
      cardAccent: 'from-emerald-500/15 to-emerald-500/5',
      btnClass: 'bg-emerald-500 text-white hover:bg-emerald-400',
    },
    {
      key: 'windows',
      Icon: WindowsIcon,
      brand: 'Windows',
      title: 'Windows 10 / 11',
      version: 'v 2.4.0',
      size: '186 MB',
      sub: 'x64, signed installer (.exe)',
      cta: 'Download for Windows',
      caption: 'Installer · 64-bit',
      url: WIN_URL,
      accent: 'from-sky-400 via-blue-400 to-cyan-400',
      cardAccent: 'from-sky-500/15 to-sky-500/5',
      btnClass: 'bg-sky-500 text-white hover:bg-sky-400',
    },
    {
      key: 'mac',
      Icon: Monitor,
      brand: 'macOS',
      title: 'Mac (Intel & Apple Silicon)',
      version: 'v 2.4.0',
      size: '174 MB',
      sub: 'Universal binary, requires macOS 11+',
      cta: 'Download for macOS',
      caption: 'Universal · .dmg',
      url: MAC_URL,
      accent: 'from-zinc-300 via-zinc-200 to-white',
      cardAccent: 'from-zinc-500/15 to-zinc-500/5',
      btnClass: 'bg-zinc-200 text-bg hover:bg-zinc-100',
    },
  ];

  const features = [
    { Icon: Zap,    title: '60 FPS locked',          body: 'Buttery smooth movement on every device. Adaptive resolution under load.' },
    { Icon: Shield, title: 'No ads in match',        body: 'We never interrupt a fight. Optional rewarded ads only between matches.' },
    { Icon: Globe,  title: 'Cross-progress',         body: 'Trophies, skins, and rank sync across iOS, Android, Web, Windows and Mac.' },
    { Icon: Cpu,    title: 'Tiny footprint',         body: '<200 MB on disk. Designed to run on phones up to 5 years old.' },
  ];

  const reqs = [
    { Icon: Cpu, label: 'CPU',     val: 'Quad-core 1.6 GHz · Apple A11 / Snapdragon 660 / Intel i3 4th gen' },
    { Icon: HardDrive, label: 'Storage', val: 'Up to 200 MB free space depending on platform' },
    { Icon: Wifi, label: 'Network', val: '5 Mbps stable connection — Wi-Fi, 4G or 5G' },
    { Icon: Shield, label: 'Security', val: 'All installers code-signed. iOS notarized. Windows EV cert.' },
  ];

  return (
    <>
      <PageHero
        title="Get Snake Online."
        subtitle="One game. Five platforms. Free forever. Pick yours and start slithering."
      />

      <section className="container-wide py-16 space-y-24">
        {/* Quick row: Web + Featured */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 card card-hover relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 size-40 rounded-full bg-brand-500/15 blur-3xl group-hover:bg-brand-500/25 transition-colors" />
            <div className="relative">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-brand-400 to-magenta-500 flex items-center justify-center text-white mb-5">
                <Globe size={22} />
              </div>
              <div className="chip mb-3">RECOMMENDED · INSTANT</div>
              <h3 className="font-display text-xl font-semibold mb-2">Play in your browser</h3>
              <p className="text-text-secondary mb-5 text-sm leading-relaxed">No download. Opens in fullscreen. Works on Chrome, Safari, Firefox, Edge.</p>
              <Link href={`/${locale}/play`} className="btn-primary w-full justify-center">
                <Globe size={16} /> Launch web build
              </Link>
            </div>
          </div>

          {/* Featured: iOS + Android side by side */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
            {platforms.slice(0, 2).map(p => (
              <a key={p.key} href={p.url} target="_blank" rel="noopener" className="card card-hover relative overflow-hidden group block">
                <div className={`absolute -top-12 -right-12 size-40 rounded-full bg-gradient-to-br ${p.cardAccent} blur-3xl`} />
                <div className="relative">
                  <div className={`size-12 rounded-2xl bg-gradient-to-br ${p.accent} flex items-center justify-center text-bg mb-5`}>
                    <p.Icon size={22} />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-1">{p.brand}</h3>
                  <p className="text-sm text-text-tertiary mb-5">{p.sub}</p>
                  <div className={`inline-flex items-center gap-2 rounded-xl ${p.btnClass} px-4 py-2.5 font-semibold text-sm transition-colors w-full justify-center`}>
                    <p.Icon size={16} />
                    <span className="leading-none text-left">
                      <span className="block text-[9px] opacity-70 -mb-0.5">{p.caption}</span>
                      {p.brand === 'iOS' ? 'App Store' : 'Google Play'}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[11px] text-text-tertiary font-mono uppercase tracking-wider">
                    <span>{p.version}</span><span>{p.size}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* All platforms full grid */}
        <div>
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">Choose your platform</h2>
            <p className="mt-3 text-text-secondary">Same arena. Same skins. Same trophies. One account everywhere.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {platforms.map(p => (
              <div key={p.key} className="card card-hover relative overflow-hidden flex flex-col">
                <div className={`absolute -top-12 -right-12 size-32 rounded-full bg-gradient-to-br ${p.cardAccent} blur-3xl`} />
                <div className="relative flex-1 flex flex-col">
                  <div className={`size-11 rounded-xl bg-gradient-to-br ${p.accent} flex items-center justify-center text-bg mb-4`}>
                    <p.Icon size={20} />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-1">{p.brand}</h3>
                  <p className="text-xs text-text-tertiary mb-4 flex-1">{p.title}</p>
                  <div className="text-[11px] text-text-tertiary font-mono mb-3 flex items-center justify-between">
                    <span>{p.version}</span><span>·</span><span>{p.size}</span>
                  </div>
                  <a
                    href={p.url}
                    target={p.url.startsWith('http') ? '_blank' : undefined}
                    rel="noopener"
                    download={p.key === 'windows' || p.key === 'mac'}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl ${p.btnClass} px-3 py-2.5 text-xs font-semibold transition-colors w-full`}
                  >
                    <Download size={14} /> Download
                  </a>
                  <div className="mt-2 text-[10px] text-text-tertiary text-center">{p.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why download */}
        <div>
          <div className="mb-10">
            <div className="chip mb-4">WHY THE NATIVE APP?</div>
            <h2 className="font-display text-3xl font-semibold">Smoother, faster, yours.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(f => (
              <div key={f.title} className="card card-hover">
                <div className="size-11 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4">
                  <f.Icon size={20} />
                </div>
                <h3 className="font-display text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile QR install */}
        <div className="rounded-3xl border border-border bg-bg-elevated p-8 sm:p-12 grid lg:grid-cols-[auto,1fr] gap-8 items-center">
          <div className="size-44 sm:size-56 rounded-2xl bg-white p-3 shrink-0 mx-auto lg:mx-0">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https%3A%2F%2Fsnakeonline.io%2Fdownloads&color=06070A&bgcolor=FFFFFF&margin=0"
              alt="Scan to open downloads on your phone"
              className="w-full h-full"
              loading="lazy"
            />
          </div>
          <div className="text-center lg:text-left">
            <div className="chip mb-4">FASTEST WAY ON MOBILE</div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-3">Scan, install, slither.</h2>
            <p className="text-text-secondary text-lg max-w-xl">
              Point your phone camera at the QR. We'll send you to the right store automatically.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={APPLE_URL} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-xl bg-white text-bg font-semibold px-4 py-2.5 text-sm hover:scale-[1.02] transition-transform">
                <Apple size={18} />
                <span className="leading-none text-left">
                  <span className="block text-[9px] opacity-70 -mb-0.5">Download on the</span>
                  App Store
                </span>
              </a>
              <a href={PLAY_URL} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-xl bg-bg border border-border-strong text-text-primary font-semibold px-4 py-2.5 text-sm hover:scale-[1.02] hover:border-brand-500/50 transition-all">
                <PlayStoreIcon size={18} />
                <span className="leading-none text-left">
                  <span className="block text-[9px] opacity-70 -mb-0.5">Get it on</span>
                  Google Play
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* System reqs */}
        <div>
          <div className="mb-8">
            <h2 className="font-display text-3xl font-semibold">System requirements</h2>
            <p className="mt-2 text-text-secondary">Lightweight by design — runs on a 5-year-old phone.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {reqs.map(r => (
              <div key={r.label} className="card flex items-start gap-4">
                <div className="size-11 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
                  <r.Icon size={20} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-text-tertiary mb-1">{r.label}</div>
                  <div className="text-text-primary leading-relaxed text-sm">{r.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative skin row + final CTA */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6 opacity-60">
            {['CSNAKE_USA','CSNAKE_TR','FSNAKE_01','FSNAKE_22','CSNAKE_DE','FSNAKE_07','CSNAKE_JP'].map(id => (
              <img key={id} src={snakeImg(id)} alt="" loading="lazy" className="size-12 sm:size-14 object-contain" />
            ))}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-3 gradient-text">200+ skins waiting.</h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">The arena gets fiercer with every match. Your throne is one game away.</p>
          <Link href={`/${locale}/play`} className="btn-primary inline-flex">
            Jump into the arena <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
