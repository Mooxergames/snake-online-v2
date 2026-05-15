'use client';
import { motion, type Variants } from 'framer-motion';
import { fadeUp, inView } from '@/lib/motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  as?: 'div' | 'section' | 'article' | 'header' | 'aside';
}

export default function ScrollReveal({ children, className, variants = fadeUp, delay = 0, as = 'div' }: Props) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </Tag>
  );
}
