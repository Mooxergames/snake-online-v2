import type { Variants, Transition } from 'framer-motion';

// Apple HIG-aligned easing curves. These match the iOS-style "snappy but smooth" feel.
export const easing = {
  smooth: [0.22, 1, 0.36, 1] as const,   // standard "ease-out-quint"
  snappy: [0.16, 1, 0.3, 1] as const,    // tighter ease-out
  spring: [0.34, 1.56, 0.64, 1] as const, // overshoot
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
};

export const springs = {
  soft:   { type: 'spring', stiffness: 180, damping: 26, mass: 1 } as Transition,
  medium: { type: 'spring', stiffness: 280, damping: 28, mass: 0.9 } as Transition,
  stiff:  { type: 'spring', stiffness: 420, damping: 30, mass: 0.7 } as Transition,
  pop:    { type: 'spring', stiffness: 520, damping: 22, mass: 0.6 } as Transition,
};

// Reusable variants
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easing.smooth } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: easing.smooth } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: easing.smooth } },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: easing.smooth } },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: easing.smooth } },
};

// Container that staggers children
export const staggerParent = (stagger = 0.08, delayChildren = 0.05): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

// Standard viewport prop for whileInView animations
export const inView = { once: true, amount: 0.2, margin: '0px 0px -80px 0px' as const };

// Tilt parameters for TiltCard
export const TILT_MAX = 10;            // degrees
export const TILT_PERSPECTIVE = 1200;  // px

// Reduced-motion helper — returns a transition that's effectively instant
export const reducedMotionTransition: Transition = { duration: 0.01 };
