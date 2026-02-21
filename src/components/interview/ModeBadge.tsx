'use client';

import { motion } from 'motion/react';
import { Shield, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { InterviewMode } from '@/types';

interface ModeBadgeProps {
  mode: InterviewMode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Small pill badge indicating current interview mode (REAL or PRACTICE).
 * Rendered inline within the header bar (not fixed-positioned).
 */
export function ModeBadge({ mode, className }: ModeBadgeProps) {
  const shouldReduceMotion = useReducedMotion();
  const isReal = mode === 'realistic';

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      aria-label={`Interview mode: ${isReal ? 'Real' : 'Practice'}`}
      className={clsx(
        'flex items-center gap-1.5 rounded-full px-2.5 py-1',
        'text-xs font-bold uppercase tracking-wider',
        isReal ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent-foreground',
        className
      )}
    >
      {isReal ? (
        <Shield className="h-3 w-3" aria-hidden="true" />
      ) : (
        <BookOpen className="h-3 w-3" aria-hidden="true" />
      )}
      <span>{isReal ? 'Real' : 'Practice'}</span>
    </motion.div>
  );
}
