'use client';

import { motion } from 'motion/react';
import { Shield, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { InterviewMode } from '@/types';

interface ModeBadgeProps {
  mode: InterviewMode;
}

/**
 * Small pill badge indicating current interview mode (REAL or PRACTICE).
 * Positioned in top-right corner with a subtle entry animation.
 */
export function ModeBadge({ mode }: ModeBadgeProps) {
  const shouldReduceMotion = useReducedMotion();
  const isReal = mode === 'realistic';

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={clsx(
        'fixed top-4 right-4 z-40',
        'flex items-center gap-1.5 rounded-full px-3 py-1.5',
        'text-xs font-bold uppercase tracking-wider',
        'shadow-sm backdrop-blur-sm',
        isReal ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent-foreground'
      )}
    >
      {isReal ? <Shield className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
      <span>{isReal ? 'Real' : 'Practice'}</span>
    </motion.div>
  );
}
