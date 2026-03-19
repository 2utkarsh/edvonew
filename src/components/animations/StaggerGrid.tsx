'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ReactNode, Children } from 'react';

interface StaggerGridProps {
  children: ReactNode;
  staggerDelay?: number;
  duration?: number;
  className?: string;
}

export default function StaggerGrid({
  children,
  staggerDelay = 0.1,
  duration = 0.5,
  className,
}: StaggerGridProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={className}
    >
      {Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
