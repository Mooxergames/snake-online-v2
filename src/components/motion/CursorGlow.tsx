'use client';
import { useEffect, useRef } from 'react';

/**
 * Tracks mouse position and sets `--cursor-x` / `--cursor-y` on the host element.
 * Combine with `.cursor-glow` from globals.css to get a radial spotlight that follows the cursor.
 */
export default function CursorGlow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId = 0;
    let pending = false;
    let nx = 0, ny = 0;
    function update() {
      el!.style.setProperty('--cursor-x', `${nx}px`);
      el!.style.setProperty('--cursor-y', `${ny}px`);
      pending = false;
    }
    function onMove(e: MouseEvent) {
      const r = el!.getBoundingClientRect();
      nx = e.clientX - r.left;
      ny = e.clientY - r.top;
      if (!pending) {
        pending = true;
        rafId = requestAnimationFrame(update);
      }
    }
    el.addEventListener('mousemove', onMove);
    return () => {
      el.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={ref} className={`cursor-glow relative ${className}`}>
      {children}
    </div>
  );
}
