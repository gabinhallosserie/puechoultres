import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

// ---- Types ----

type AnimationType = 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight';

interface Props {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
}

// ---- Variants ----

const variants: Record<AnimationType, { hidden: object; visible: object }> = {
  fadeIn: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden:  { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden:  { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden:  { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
};

// ---- Component ----

export default function Animate({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 0.6,
  className,
}: Props) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={variants[animation]}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
