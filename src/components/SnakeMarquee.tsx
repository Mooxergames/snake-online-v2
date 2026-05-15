'use client';
import { useEffect, useState } from 'react';
import { snakeImg } from '@/lib/assets';

const STRIP_FULL = [
  'CSNAKE_USA','CSNAKE_TR','CSNAKE_DE','CSNAKE_JP','CSNAKE_BR','CSNAKE_FR','CSNAKE_IT',
  'CSNAKE_ES','CSNAKE_KR','CSNAKE_RU','CSNAKE_UK','CSNAKE_CN','CSNAKE_IN','CSNAKE_AU',
  'FSNAKE_01','FSNAKE_05','FSNAKE_07','FSNAKE_12','FSNAKE_16','FSNAKE_22','FSNAKE_30',
  'FSNAKE_42','FSNAKE_55','FSNAKE_67','FSNAKE_80','FSNAKE_95','FSNAKE_108','FSNAKE_120',
];
const STRIP_LITE = STRIP_FULL.filter((_, i) => i % 2 === 0);

export default function SnakeMarquee({ height = 56, speed = 60 }: { height?: number; speed?: number }) {
  const [mode, setMode] = useState<'full' | 'lite' | 'static'>('static');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isWide = window.matchMedia('(min-width: 768px)').matches;
    const saveData = (navigator as any).connection?.saveData === true;
    if (reduced || saveData) setMode('static');
    else if (!isWide) setMode('lite');
    else setMode('full');
  }, []);

  const strip = mode === 'full' ? STRIP_FULL : STRIP_LITE;
  const items = mode === 'static' ? strip : [...strip, ...strip];
  const dur = `${speed}s`;

  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden border-y border-border bg-bg-elevated/60 select-none"
      style={{ height }}
    >
      <div
        className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, var(--bg, #06070A), transparent)' }}
      />
      <div
        className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, var(--bg, #06070A), transparent)' }}
      />
      <div
        className={mode === 'static' ? 'absolute inset-0 flex items-center gap-6 justify-center' : 'absolute inset-0 flex items-center gap-6 marquee-track'}
        style={mode === 'static' ? undefined : { animationDuration: dur }}
      >
        {items.map((id, i) => (
          <img
            key={`${id}-${i}`}
            src={snakeImg(id)}
            alt=""
            loading="lazy"
            className="shrink-0 object-contain opacity-80 hover:opacity-100 transition-opacity"
            style={{ height: height - 12, width: height - 12 }}
          />
        ))}
      </div>
      <style jsx>{`
        .marquee-track {
          width: max-content;
          animation: scroll linear infinite;
        }
        @keyframes scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
