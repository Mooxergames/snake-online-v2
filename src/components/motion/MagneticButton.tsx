'use client';
import { useRef, type ReactNode, type ElementType } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type Props<E extends ElementType = 'button'> = {
  as?: E;
  children: ReactNode;
  className?: string;
  strength?: number; // 0..1 — how strongly the button is pulled toward cursor
} & Omit<React.ComponentPropsWithoutRef<E>, 'as' | 'children' | 'className'>;

export default function MagneticButton<E extends ElementType = 'button'>({
  as,
  children,
  className,
  strength = 0.35,
  ...rest
}: Props<E>) {
  const Comp = (as ?? 'button') as ElementType;
  const ref = useRef<HTMLElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 240, damping: 22 });
  const y = useSpring(useMotionValue(0), { stiffness: 240, damping: 22 });

  function handleMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    x.set(relX * strength);
    y.set(relY * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.span
      ref={ref as any}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x, y, display: 'inline-block' }}
    >
      <Comp className={className} {...(rest as any)}>
        {children}
      </Comp>
    </motion.span>
  );
}
