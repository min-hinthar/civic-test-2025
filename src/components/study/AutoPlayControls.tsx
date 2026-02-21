'use client';

import { motion } from 'motion/react';
import clsx from 'clsx';
import { Play, Pause } from 'lucide-react';
import { SPRING_SNAPPY } from '@/lib/motion-config';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';

interface AutoPlayControlsProps {
  /** Whether auto-play is currently active */
  isPlaying: boolean;
  /** Callback to toggle play/pause */
  onToggle: () => void;
  /** Whether the control is disabled */
  disabled?: boolean;
}

/**
 * Auto-play control bar with play/pause toggle.
 *
 * Features:
 * - Play/Pause icon toggle with spring press animation
 * - Bilingual label (English + Burmese)
 * - Bouncing dots animation when playing (respects reduced-motion)
 * - 44px minimum touch target
 */
export function AutoPlayControls({ isPlaying, onToggle, disabled = false }: AutoPlayControlsProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();

  return (
    <div className="flex items-center justify-center gap-3 mt-4">
      <motion.button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        whileTap={{ scale: 0.92 }}
        transition={SPRING_SNAPPY}
        className={clsx(
          'flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl',
          'border transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          isPlaying
            ? 'bg-primary/10 border-primary text-primary'
            : 'bg-card border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50'
        )}
        aria-label={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
        aria-pressed={isPlaying}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        <span className="text-sm font-semibold">
          {isPlaying ? 'Pause' : 'Auto-Play'}
          {showBurmese && (
            <span className="font-myanmar ml-1.5">{isPlaying ? '/ ရပ်တန့်' : '/ အလိုအလျောက်'}</span>
          )}
        </span>

        {/* Playing indicator: bouncing dots or static text */}
        {isPlaying && (
          <span className="flex items-center gap-0.5 ml-1" aria-hidden="true">
            {shouldReduceMotion ? (
              <span className="text-xs text-primary/70">Playing...</span>
            ) : (
              [0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))
            )}
          </span>
        )}
      </motion.button>
    </div>
  );
}

export default AutoPlayControls;
