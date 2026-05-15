'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, ArrowRight, Trophy, Crown, Users, Sparkles, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import snakes from '@/data/snakes.json';
import { snakeImg } from '@/lib/assets';
import AppBadges from './AppBadges';
import MagneticButton from './motion/MagneticButton';
import CountUp from './motion/CountUp';
import GradientMesh from './motion/GradientMesh';
import { easing } from '@/lib/motion';

const HERO_SNAKES = [
  'CSNAKE_USA', 'CSNAKE_TR', 'CSNAKE_DE', 'CSNAKE_JP', 'CSNAKE_BR',
  'FSNAKE_01', 'FSNAKE_05', 'FSNAKE_12', 'FSNAKE_16', 'FSNAKE_22',
].filter(id => (snakes as string[]).includes(id));

const FLOATERS = [
  { id: HERO_SNAKES[0], top: '6%',  left: '4%',  size: 96,  dur: 14, delay: 0,   rot: -8 },
  { id: HERO_SNAKES[2], top: '60%', left: '2%',  size: 104, dur: 16, delay: 0.6, rot: -16 },
  { id: HERO_SNAKES[5], top: '32%', left: '20%', size: 84,  dur: 17, delay: 0.9, rot: 14 },
];

const PREVIEW_RANK = [
  { name: 'gundul',  trophy: 6096, skin: 'CSNAKE_USA', flag: 'ID' },
  { name: 'Gökhan',  trophy: 4972, skin: 'FSNAKE_01',  flag: 'TR' },
  { name: 'shadow',  trophy: 4512, skin: 'FSNAKE_16',  flag: 'DE' },
];

export default function Hero({ locale }: { locale: string }) {
  const t = useTranslations('hero');
  const tLb = useTranslations('heroLeaderboard');
  const [showFloaters, setShowFloaters] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [onlineNow, setOnlineNow] = useState(48234);

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);
  const heroY       = useTransform(scrollYProgress, [0, 1],   ['0%', '20%']);
  const floaterY1   = useTransform(scrollYProgress, [0, 1],   ['0%', '-30%']);
  const floaterY2   = useTransform(scrollYProgress, [0, 1],   ['0%', '-50%']);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isWide = window.matchMedia('(min-width: 768px)').matches;
    const isLg = window.matchMedia('(min-width: 1024px)').matches;
    const saveData = (navigator as any).connection?.saveData === true;
    const conn = (navigator as any).connection?.effectiveType as string | undefined;
    const slowNet = conn === 'slow-2g' || conn === '2g' || conn === '3g';
    const cores = (navigator as any).hardwareConcurrency || 4;
    if (isLg && !reducedMotion && !saveData && cores >= 4) setShowFloaters(true);
    if (isWide && !reducedMotion && !saveData && !slowNet && cores >= 4) setShowVideo(true);
  }, []);

  useEffect(() => {
    // Simulated live drift on the "players online now" pill — keeps the page feeling alive.
    // A real WebSocket / SSE feed can replace this later.
    const id = setInterval(() => {
      setOnlineNow(v => Math.max(40000, v + Math.floor(Math.random() * 200) - 80));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const stats = [
    { value: 5_000_000, suffix: '+', label: t('stat1.label'), format: (n: number) => (n / 1_000_000).toFixed(1) + 'M' },
    { value: 200,       suffix: '+', label: t('stat2.label') },
    { value: 4.7,       suffix: '★', label: t('stat3.label'), decimals: 1 },
    { value: 180,       suffix: '+', label: t('stat4.label') },
  ];

  return (
    <section ref={sectionRef} className="relative overflow-hidden min-h-[92vh] flex items-center">
      {/* background video (lazy, respects reduced-motion / save-data) */}
      {showVideo && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <iframe
            src="https://player.vimeo.com/video/911471666?app_id=122963&byline=0&badge=0&portrait=0&title=0&background=1&muted=1&autoplay=1&loop=1&dnt=1"
            title=""
            allow="autoplay; fullscreen; picture-in-picture"
            loading="lazy"
            onLoad={() => setVideoLoaded(true)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
            style={{
              width: 'max(100vw, 177.78vh)',
              height: 'max(56.25vw, 100vh)',
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 800ms ease',
              filter: 'saturate(1.05) contrast(1.02)',
            }}
          />
          <div className="absolute inset-0 bg-bg/60" style={{ opacity: videoLoaded ? 1 : 0, transition: 'opacity 800ms ease' }} />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(8,10,16,0.55) 70%, rgba(8,10,16,0.85) 100%)',
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 800ms ease',
            }}
          />
        </div>
      )}

      <div className="absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
      <div className="absolute inset-0 bg-grid-fade" aria-hidden="true" />
      {!showVideo && <GradientMesh intensity="normal" />}

      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div
          className={`absolute inset-0 ${showVideo ? 'opacity-45 mix-blend-screen' : 'opacity-60'}`}
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 75% 35%, rgba(255,149,0,0.32), transparent 60%), radial-gradient(ellipse 55% 45% at 20% 70%, rgba(255,59,138,0.28), transparent 60%), radial-gradient(ellipse 40% 40% at 85% 85%, rgba(164,85,255,0.22), transparent 60%)',
          }}
        />
      </div>

      <div className="absolute inset-0 z-[1] pointer-events-none" aria-hidden="true">
        {showFloaters && FLOATERS.filter(f => f.id).map((f, i) => (
          <motion.img
            key={i}
            src={snakeImg(f.id)}
            alt=""
            width={f.size}
            height={f.size}
            loading="lazy"
            className="absolute drop-shadow-[0_8px_30px_rgba(255,149,0,0.35)] select-none"
            style={{
              top: f.top,
              left: f.left,
              width: f.size,
              height: f.size,
              filter: 'drop-shadow(0 0 24px rgba(255,149,0,0.25))',
              y: i % 2 === 0 ? floaterY1 : floaterY2,
            }}
            initial={{ opacity: 0, scale: 0.6, rotate: f.rot - 10 }}
            animate={{
              opacity: [0, 0.85, 0.85, 0.85],
              scale: [0.6, 1, 1.05, 1],
              rotate: [f.rot, f.rot + 6, f.rot - 4, f.rot],
            }}
            transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent z-[2] pointer-events-none" aria-hidden="true" />

      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        className="container-wide relative z-10 py-20 lg:py-24 grid lg:grid-cols-12 gap-10 items-center"
      >
        {/* LEFT — copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easing.smooth }}
          className="lg:col-span-7"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold liquid-glass">
            <span className="relative flex size-2">
              <span className="absolute inset-0 rounded-full bg-venom-500 animate-ping opacity-75" />
              <span className="relative size-2 rounded-full bg-venom-500" />
            </span>
            <span className="text-text-secondary uppercase tracking-wider">{t('eyebrow')}</span>
            <span className="text-text-tertiary">·</span>
            <span className="font-mono text-venom-400 tabular-nums">
              <CountUp end={onlineNow} format={n => Math.floor(n).toLocaleString()} duration={1.4} /> {tLb('liveOnline')}
            </span>
          </div>

          <h1 className="mt-6 font-display text-display-2xl text-balance whitespace-pre-line">
            <span className="gradient-text">{t('title')}</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl text-pretty">{t('subtitle')}</p>

          <div className="mt-10 flex flex-wrap gap-3 items-center">
            <MagneticButton as={Link} href={`/${locale}/play`} className="btn-primary-xl">
              <Play size={20} fill="currentColor" />
              {t('ctaPrimary')}
              <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-bg/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                <Zap size={10} fill="currentColor" /> {t('instantPlay')}
              </span>
            </MagneticButton>
            <MagneticButton as={Link} href={`/${locale}/snakes`} className="btn-secondary" strength={0.25}>
              {t('ctaSecondary')}
              <ArrowRight size={18} />
            </MagneticButton>
          </div>

          <div className="mt-8">
            <AppBadges />
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl liquid-glass overflow-hidden max-w-3xl">
            {stats.map(s => (
              <div key={s.label} className="bg-bg-elevated/60 px-5 py-6 text-center">
                <div className="font-display text-2xl sm:text-3xl font-bold gradient-text tabular-nums">
                  <CountUp
                    end={s.value}
                    suffix={s.suffix}
                    decimals={s.decimals}
                    format={s.format}
                    duration={2.2}
                  />
                </div>
                <div className="mt-1 text-xs text-text-tertiary uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT — live leaderboard preview card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: easing.smooth }}
          className="hidden lg:block lg:col-span-5"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-brand-500/30 via-magenta-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
            <div className="relative liquid-glass-strong rounded-3xl p-6 shadow-card-lifted">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="size-9 rounded-xl bg-amber-400/15 ring-1 ring-amber-400/30 flex items-center justify-center">
                    <Trophy size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{tLb('title')}</div>
                    <div className="text-[11px] text-text-tertiary flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-venom-500 animate-pulse" />
                      {tLb('updatedAt')}
                    </div>
                  </div>
                </div>
                <Link href={`/${locale}/game-ranking`} className="text-xs text-text-tertiary hover:text-text-primary transition-colors inline-flex items-center gap-1">
                  {tLb('viewAll')} <ArrowRight size={12} />
                </Link>
              </div>

              <div className="space-y-2">
                {PREVIEW_RANK.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.12, duration: 0.5, ease: easing.smooth }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated/60 hover:bg-bg-subtle/60 transition-colors"
                  >
                    <div
                      className="shrink-0 size-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: i === 0 ? 'rgba(251,191,36,0.15)' : i === 1 ? 'rgba(203,213,225,0.10)' : 'rgba(251,146,60,0.15)',
                        color: i === 0 ? '#FBBF24' : i === 1 ? '#E2E8F0' : '#FB923C',
                        boxShadow: `inset 0 0 0 1px ${i === 0 ? 'rgba(251,191,36,0.4)' : i === 1 ? 'rgba(203,213,225,0.3)' : 'rgba(251,146,60,0.4)'}`,
                      }}
                    >
                      {i === 0 ? <Crown size={14} /> : i + 1}
                    </div>
                    <div className="size-10 rounded-lg bg-bg-subtle flex items-center justify-center overflow-hidden shrink-0">
                      <img src={snakeImg(p.skin)} alt="" loading="lazy" className="w-4/5 h-4/5 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-text-primary truncate">{p.name}</div>
                      <div className="text-[11px] text-text-tertiary font-mono">{p.flag} · top {((i + 1) * 0.01 + 0.01).toFixed(2)}%</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-sm text-amber-400 font-semibold tabular-nums">
                        <CountUp end={p.trophy} duration={1.6 + i * 0.2} />
                      </div>
                      <div className="text-[10px] text-text-tertiary">{tLb('trophyLabel')}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-border grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="flex items-center justify-center text-brand-400 mb-1"><Users size={14} /></div>
                  <div className="font-mono text-sm font-semibold text-text-primary tabular-nums">
                    <CountUp end={5.2} decimals={1} suffix="M" duration={1.8} />
                  </div>
                  <div className="text-[10px] text-text-tertiary uppercase tracking-wider">{tLb('stats.players')}</div>
                </div>
                <div>
                  <div className="flex items-center justify-center text-magenta-500 mb-1"><Sparkles size={14} /></div>
                  <div className="font-mono text-sm font-semibold text-text-primary tabular-nums">
                    <CountUp end={200} suffix="+" duration={1.8} />
                  </div>
                  <div className="text-[10px] text-text-tertiary uppercase tracking-wider">{tLb('stats.skins')}</div>
                </div>
                <div>
                  <div className="flex items-center justify-center text-amber-400 mb-1"><Trophy size={14} /></div>
                  <div className="font-mono text-sm font-semibold text-text-primary tabular-nums">
                    <CountUp end={180} suffix="+" duration={1.8} />
                  </div>
                  <div className="text-[10px] text-text-tertiary uppercase tracking-wider">{tLb('stats.countries')}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
