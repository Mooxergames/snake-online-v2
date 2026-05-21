'use client';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { inView } from '@/lib/motion';

export default function ExperienceSection() {
  const t = useTranslations('experience');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="container-wide relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={inView}
            transition={{ duration: 0.7 }}
          >
            <div className="chip-brand">{t('eyebrow')}</div>
            <h2 className="mt-4 font-display text-display-lg">
              <span className="gradient-text">{t('title')}</span>
            </h2>
            <p className="mt-4 text-lg text-text-secondary text-pretty">{t('subtitle')}</p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {(['competitive', 'visuals', 'replayability', 'crossPlatform'] as const).map((key, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={inView}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                  className="liquid-glass rounded-xl p-4"
                >
                  <div className="text-2xl font-display font-bold gradient-text">{t(`highlights.${key}.stat`)}</div>
                  <div className="mt-1 text-sm text-text-secondary">{t(`highlights.${key}.label`)}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — video */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={inView}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="liquid-glass-strong rounded-3xl overflow-hidden relative group">
              <div className="aspect-video relative">
                <video
                  ref={videoRef}
                  src="/video/trailer.mp4"
                  poster="/screenshots/gameplay-1.webp"
                  muted
                  playsInline
                  loop
                  preload="none"
                  className="w-full h-full object-cover"
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                />

                {/* Play overlay */}
                {!playing && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-bg/30 backdrop-blur-sm transition-all hover:bg-bg/20"
                    aria-label="Play trailer"
                  >
                    <span className="inline-flex items-center justify-center size-20 rounded-full bg-brand-500 text-bg shadow-[0_10px_40px_rgba(255,149,0,0.5)] hover:scale-110 transition-transform">
                      <Play size={32} className="ml-1" />
                    </span>
                  </button>
                )}

                {/* Controls */}
                {playing && (
                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={togglePlay} className="glass rounded-full p-2" aria-label="Pause">
                      <Pause size={16} />
                    </button>
                    <button onClick={toggleMute} className="glass rounded-full p-2" aria-label={muted ? 'Unmute' : 'Mute'}>
                      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Glow behind video */}
            <div
              className="absolute -inset-6 rounded-3xl blur-3xl opacity-20 -z-10"
              style={{ background: 'radial-gradient(circle, rgba(255,149,0,0.4), transparent 70%)' }}
              aria-hidden="true"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
