'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface Props {
  end: number;
  duration?: number;       // seconds
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  format?: (n: number) => string;
}

export default function CountUp({ end, duration = 2, decimals = 0, prefix = '', suffix = '', className, format }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -50px 0px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(end);
      return;
    }
    let start: number | null = null;
    let rafId = 0;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    function tick(ts: number) {
      if (start === null) start = ts;
      const elapsed = (ts - start) / 1000;
      const t = Math.min(1, elapsed / duration);
      setValue(end * ease(t));
      if (t < 1) rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView, end, duration]);

  const display = format
    ? format(value)
    : value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
