'use client';
import { motion, useReducedMotion } from 'framer-motion';

interface Props {
  intensity?: 'subtle' | 'normal' | 'strong';
  className?: string;
}

/**
 * Animated multi-radial mesh background. Three blurred ellipses drift
 * slowly across the section, creating a living "aurora" feel.
 * Respects `prefers-reduced-motion` — falls back to a static composition.
 */
export default function GradientMesh({ intensity = 'normal', className = '' }: Props) {
  const alpha = intensity === 'subtle' ? 0.25 : intensity === 'strong' ? 0.55 : 0.4;
  const reduced = useReducedMotion();

  // When reduce-motion is on we still want the visual depth — just freeze each ellipse
  // in its starting position. `false` short-circuits framer-motion's animation engine.
  const anim1 = reduced ? false : { x: [0, 60, -30, 0], y: [0, 30, 50, 0] };
  const anim2 = reduced ? false : { x: [0, -50, 30, 0], y: [0, 40, -20, 0] };
  const anim3 = reduced ? false : { x: [0, 40, -40, 0], y: [0, -30, 20, 0] };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <motion.div
        className="absolute"
        style={{
          width: '60%',
          height: '60%',
          left: '5%',
          top: '0%',
          filter: 'blur(80px)',
          background: `radial-gradient(circle, rgba(255,149,0,${alpha}), transparent 65%)`,
        }}
        animate={anim1}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute"
        style={{
          width: '55%',
          height: '55%',
          right: '0%',
          top: '15%',
          filter: 'blur(80px)',
          background: `radial-gradient(circle, rgba(255,59,138,${alpha * 0.9}), transparent 65%)`,
        }}
        animate={anim2}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute"
        style={{
          width: '55%',
          height: '55%',
          left: '30%',
          bottom: '-10%',
          filter: 'blur(80px)',
          background: `radial-gradient(circle, rgba(164,85,255,${alpha * 0.75}), transparent 65%)`,
        }}
        animate={anim3}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
