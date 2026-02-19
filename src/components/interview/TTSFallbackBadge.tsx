'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TTSFallbackBadgeProps {
  /** Whether to show the badge */
  visible: boolean;
  /** Smaller icon-only variant for chat bubbles */
  compact?: boolean;
}

/**
 * Subtle amber badge indicating that browser TTS is being used as fallback
 * instead of pre-cached MP3 audio for a specific question.
 *
 * Appears next to the examiner's chat bubble when the audio file for that
 * question failed to pre-cache. Uses AnimatePresence for smooth show/hide.
 */
export function TTSFallbackBadge({ visible, compact = false }: TTSFallbackBadgeProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
          transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.2 }}
          title="Using voice synthesis (audio unavailable)"
          className={`inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-400 ${
            compact ? 'p-1' : 'px-2 py-0.5 text-xs'
          }`}
        >
          <Volume2 className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
          {!compact && <span>TTS</span>}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
