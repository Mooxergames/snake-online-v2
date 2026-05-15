'use client';
import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  speed?: 'normal' | 'slow';
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}

/**
 * CSS-only infinite marquee — duplicates the children once and translates by -50%.
 * Cheaper than JS animation; obeys `prefers-reduced-motion` via Tailwind utility.
 */
export default function Marquee({
  children,
  speed = 'normal',
  reverse = false,
  pauseOnHover = true,
  className = '',
}: Props) {
  const speedClass = speed === 'slow' ? 'animate-marquee-slow' : 'animate-marquee';
  const directionStyle: React.CSSProperties = reverse ? { animationDirection: 'reverse' } : {};

  // group-hover + focus-within both pause — keyboard users get parity with mouse users.
  const pauseClass = pauseOnHover
    ? 'group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]'
    : '';

  return (
    <div className={`group relative overflow-hidden ${className}`}>
      <div
        className={`flex w-max gap-8 ${speedClass} ${pauseClass} motion-reduce:animate-none`}
        style={directionStyle}
      >
        <div className="flex shrink-0 items-center gap-8">{children}</div>
        <div className="flex shrink-0 items-center gap-8" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
