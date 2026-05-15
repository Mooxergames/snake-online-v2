'use client';
import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { TILT_MAX, TILT_PERSPECTIVE } from '@/lib/motion';

interface Props {
  children: ReactNode;
  className?: string;
  glareOpacity?: number; // 0..1
  scale?: number;
}

export default function TiltCard({ children, className, glareOpacity = 0.18, scale = 1.02 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 220, damping: 20 });
  const smy = useSpring(my, { stiffness: 220, damping: 20 });
  const rotateX = useTransform(smy, [0, 1], [TILT_MAX, -TILT_MAX]);
  const rotateY = useTransform(smx, [0, 1], [-TILT_MAX, TILT_MAX]);
  const glareX = useTransform(smx, v => `${v * 100}%`);
  const glareY = useTransform(smy, v => `${v * 100}%`);

  function handleMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }
  function reset() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ perspective: TILT_PERSPECTIVE, transformStyle: 'preserve-3d' }}
      whileHover={{ scale }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', position: 'relative', width: '100%', height: '100%' }}
      >
        {children}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            background: `radial-gradient(220px circle at var(--gx) var(--gy), rgba(255,255,255,${glareOpacity}), transparent 60%)`,
            // @ts-expect-error -- custom CSS variables passed inline
            '--gx': glareX,
            '--gy': glareY,
            mixBlendMode: 'overlay',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
