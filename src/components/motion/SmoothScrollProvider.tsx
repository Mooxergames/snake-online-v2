'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Smooth scroll provider. Active only on devices with a fine pointer (mouse / trackpad)
 * AND when the user has not requested reduced motion. Reacts to media-query changes —
 * if the user toggles "Reduce Motion" mid-session, smooth scrolling is torn down.
 */
export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(pointer: fine)');

    let lenis: Lenis | null = null;
    let rafId = 0;

    function start() {
      if (lenis) return;
      lenis = new Lenis({
        // 0.8s feels iOS-native on trackpads vs the previous 1.1s "drag" feeling.
        duration: 0.8,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.1,
        touchMultiplier: 1.4,
      });
      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    }

    function stop() {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenis = null;
    }

    function sync() {
      if (reducedMotion.matches || !finePointer.matches) stop();
      else start();
    }

    sync();
    reducedMotion.addEventListener('change', sync);
    finePointer.addEventListener('change', sync);

    return () => {
      stop();
      reducedMotion.removeEventListener('change', sync);
      finePointer.removeEventListener('change', sync);
    };
  }, []);

  return <>{children}</>;
}
