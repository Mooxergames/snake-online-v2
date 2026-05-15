'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Play, Maximize2, Minimize2, X, AlertCircle, Smartphone, Download } from 'lucide-react';
import { snakeImg } from '@/lib/assets';

const FLOATERS = ['CSNAKE_USA', 'FSNAKE_01', 'CSNAKE_TR', 'FSNAKE_22', 'FSNAKE_07', 'CSNAKE_DE'];

export default function GamePlayer({ locale, gameUrl }: { locale: string; gameUrl: string }) {
  const t = useTranslations('gamePlayer');
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  useEffect(() => {
    if (!started) return;
    // 8s timeout — if iframe never finishes loading, show fallback
    const t = setTimeout(() => { if (loading) setIframeError(true); }, 12000);
    return () => clearTimeout(t);
  }, [started, loading]);

  const start = async () => {
    setStarted(true);
    setLoading(true);
    // Try to enter fullscreen on the wrapper for the best experience
    setTimeout(async () => {
      try { await wrapRef.current?.requestFullscreen(); } catch {}
    }, 200);
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await wrapRef.current?.requestFullscreen();
    } catch {}
  };

  const exit = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); } catch {}
    setStarted(false);
    setLoading(true);
    setIframeError(false);
  };

  // ── PRE-START LANDING ────────────────────────────────────────────
  if (!started) {
    return (
      <section className="relative min-h-[calc(100vh-9rem)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-80 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 50% 40%, rgba(255,149,0,0.30), transparent 60%), radial-gradient(ellipse 40% 50% at 25% 70%, rgba(255,59,138,0.25), transparent 60%), radial-gradient(ellipse 40% 50% at 75% 30%, rgba(164,85,255,0.22), transparent 60%)',
          }}
        />

        {/* floating skins */}
        <div className="absolute inset-0 pointer-events-none hidden md:block" aria-hidden="true">
          {FLOATERS.map((id, i) => {
            const positions = [
              { top: '8%',  left: '6%',  size: 90,  rot: -10 },
              { top: '14%', right: '8%', size: 100, rot: 12 },
              { top: '60%', left: '4%',  size: 80,  rot: -18 },
              { top: '70%', right: '6%', size: 110, rot: 8 },
              { top: '40%', left: '3%',  size: 70,  rot: 20 },
              { top: '35%', right: '4%', size: 75,  rot: -14 },
            ][i];
            return (
              <img
                key={id}
                src={snakeImg(id)}
                alt=""
                loading="lazy"
                className="absolute drop-shadow-[0_8px_30px_rgba(255,149,0,0.4)] animate-float-slow"
                style={{
                  ...positions,
                  width: positions.size, height: positions.size,
                  transform: `rotate(${positions.rot}deg)`,
                  animationDelay: `${i * 0.5}s`,
                  opacity: 0.85,
                }}
              />
            );
          })}
        </div>

        <div className="relative container-wide text-center py-24">
          <div className="chip mb-6 mx-auto inline-flex">
            <span className="size-1.5 rounded-full bg-venom-500 animate-pulse" />
            {t('preStart.activePlayers', { count: '5,247' })}
          </div>
          <h1 className="font-display text-display-2xl gradient-text mb-6 max-w-3xl mx-auto">
            {t('preStart.title')}
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary max-w-xl mx-auto mb-12">
            {t('preStart.subtitle')}
          </p>

          <button
            type="button"
            onClick={start}
            className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-br from-brand-400 via-brand-500 to-magenta-500 px-10 py-5 text-lg font-bold text-white shadow-[0_20px_60px_-15px_rgba(255,149,0,0.6)] hover:scale-[1.03] active:scale-[0.98] transition-transform"
          >
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-400 to-magenta-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity -z-10" />
            <Play size={24} fill="currentColor" />
            {t('preStart.cta')}
          </button>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm text-text-tertiary">
            <span>{t('preStart.mobilePrompt')}</span>
            <Link href={`/${locale}/downloads`} className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-medium">
              <Smartphone size={14} /> {t('preStart.platforms')}
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 max-w-md mx-auto gap-px rounded-2xl glass overflow-hidden">
            <div className="bg-bg-elevated/60 px-4 py-4">
              <div className="font-mono text-lg font-bold text-text-primary">5.2M</div>
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider">{t('preStart.stats.players')}</div>
            </div>
            <div className="bg-bg-elevated/60 px-4 py-4">
              <div className="font-mono text-lg font-bold text-text-primary">60 FPS</div>
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider">{t('preStart.stats.fps')}</div>
            </div>
            <div className="bg-bg-elevated/60 px-4 py-4">
              <div className="font-mono text-lg font-bold text-text-primary">~30ms</div>
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider">{t('preStart.stats.latency')}</div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); }
            50% { transform: translateY(-18px) rotate(var(--r, 0deg)); }
          }
          .animate-float-slow {
            animation: floatSlow 7s ease-in-out infinite;
          }
        `}</style>
      </section>
    );
  }

  // ── PLAYING ──────────────────────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      className={`relative bg-black ${isFullscreen ? 'fixed inset-0 z-[100]' : 'w-full h-[calc(100vh-9rem)] min-h-[600px]'}`}
    >
      {/* Loading screen */}
      {loading && !iframeError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg">
          <div className="text-center">
            <div className="relative mb-8 mx-auto">
              <div className="absolute inset-0 rounded-full bg-brand-500/30 blur-2xl animate-pulse" />
              <img src={snakeImg('CSNAKE_USA')} alt="" className="relative size-24 mx-auto animate-spin-slow" />
            </div>
            <div className="font-display text-2xl font-semibold gradient-text mb-2">{t('loading.title')}</div>
            <div className="text-sm text-text-tertiary">{t('loading.subtitle')}</div>
            <div className="mt-6 w-48 h-1 mx-auto rounded-full bg-bg-elevated overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-400 to-magenta-500 animate-progress" />
            </div>
            <style jsx>{`
              @keyframes spinSlow { to { transform: rotate(360deg); } }
              .animate-spin-slow { animation: spinSlow 4s linear infinite; }
              @keyframes progress {
                0% { width: 0%; }
                50% { width: 75%; }
                100% { width: 95%; }
              }
              .animate-progress { animation: progress 8s ease-out forwards; }
            `}</style>
          </div>
        </div>
      )}

      {/* Iframe blocked / errored fallback */}
      {iframeError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg p-6">
          <div className="max-w-md text-center">
            <div className="inline-flex size-14 rounded-2xl bg-amber-500/15 text-amber-400 items-center justify-center mb-5">
              <AlertCircle size={26} />
            </div>
            <h2 className="font-display text-2xl font-semibold mb-3">{t('error.title')}</h2>
            <p className="text-text-secondary mb-8">{t('error.subtitle')}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href={gameUrl} target="_blank" rel="noopener" className="btn-primary">
                <Play size={16} fill="currentColor" /> {t('error.ctaTab')}
              </a>
              <Link href={`/${locale}/downloads`} className="btn-secondary">
                <Download size={16} /> {t('error.ctaDownload')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Game iframe */}
      <iframe
        ref={iframeRef}
        src={gameUrl}
        title={t('iframeTitle')}
        className="absolute inset-0 w-full h-full border-0"
        allow="autoplay; fullscreen; gamepad; xr-spatial-tracking; clipboard-write"
        allowFullScreen
        onLoad={() => setLoading(false)}
        onError={() => setIframeError(true)}
      />

      {/* Floating controls */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? t('controls.fullscreenExit') : t('controls.fullscreenEnter')}
          className="size-10 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 flex items-center justify-center transition-colors border border-white/10"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
        <button
          type="button"
          onClick={exit}
          aria-label={t('controls.close')}
          className="size-10 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-red-500/80 flex items-center justify-center transition-colors border border-white/10"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
