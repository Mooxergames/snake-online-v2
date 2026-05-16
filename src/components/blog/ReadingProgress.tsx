'use client';
import { motion, useScroll } from 'framer-motion';

/**
 * Top-of-page progress bar driven by document scroll. Pure-CSS hardware
 * accelerated via `scaleX`; no layout reads in the scroll handler.
 */
export default function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-brand-500 via-magenta-500 to-purple-500 motion-reduce:hidden"
      style={{ scaleX: scrollYProgress }}
      aria-hidden="true"
    />
  );
}
