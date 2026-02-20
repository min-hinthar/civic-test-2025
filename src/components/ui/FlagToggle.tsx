'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { USFlag } from '@/components/icons/USFlag';
import { MyanmarFlag } from '@/components/icons/MyanmarFlag';
import { SPRING_BOUNCY } from '@/lib/motion-config';
import { hapticLight } from '@/lib/haptics';

interface FlagToggleProps {
  /** Compact mode for navbar (tighter spacing) */
  compact?: boolean;
  /** Stack flags vertically (for collapsed sidebar) */
  vertical?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Dual-flag language mode toggle.
 *
 * Features:
 * - Both flags always visible side by side
 * - Active flag highlighted with ring, inactive at 40% opacity
 * - Bounce animation on tap with spring physics
 * - 150ms spinner/flash feedback on switch
 * - Haptic feedback (progressive enhancement)
 * - 300ms debounce to prevent rapid toggling
 * - Full ARIA radiogroup accessibility
 * - Compact variant for navbar
 * - Screen reader announcement on mode change
 */
export function FlagToggle({ compact = false, vertical = false, className }: FlagToggleProps) {
  const { mode, setMode } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDebounced, setIsDebounced] = useState(false);
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isBilingual = mode === 'bilingual';

  const handleSelect = useCallback(
    (target: 'bilingual' | 'english-only') => {
      if (target === mode || isDebounced) return;

      // Haptic feedback (progressive enhancement, no-op on iOS)
      hapticLight();

      // Show transition feedback
      setIsTransitioning(true);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 150);

      // Debounce: disable for 300ms
      setIsDebounced(true);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        setIsDebounced(false);
      }, 300);

      setMode(target);
      setSrAnnouncement(
        target === 'bilingual'
          ? 'Switched to bilingual English and Burmese'
          : 'Switched to English only'
      );
    },
    [mode, isDebounced, setMode]
  );

  const flagSize = compact ? 'w-6 h-4' : 'w-6 h-4';
  const gap = compact ? 'gap-1' : 'gap-1.5';
  const padding = compact ? 'p-1' : 'p-1.5';

  return (
    <>
      {/* Screen reader announcement for mode changes */}
      <div aria-live="polite" className="sr-only">
        {srAnnouncement}
      </div>

      <div
        role="radiogroup"
        aria-label={
          isBilingual
            ? 'Language mode: Bilingual English and Burmese'
            : 'Language mode: English only'
        }
        className={clsx(
          'inline-flex rounded-lg bg-muted/50',
          vertical ? 'flex-col items-center' : 'items-center',
          gap,
          padding,
          className
        )}
      >
        {/* US Flag - English only */}
        <motion.button
          role="radio"
          aria-checked={!isBilingual}
          aria-label={
            !isBilingual
              ? 'Language: English only. Currently selected.'
              : 'Language: English only. Press to switch to English only.'
          }
          onClick={() => handleSelect('english-only')}
          disabled={isDebounced && !isBilingual}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.85 }}
          transition={shouldReduceMotion ? { duration: 0.15, ease: 'easeOut' } : SPRING_BOUNCY}
          className={clsx(
            'relative flex items-center justify-center rounded-md p-1',
            'min-h-[36px] min-w-[36px]',
            'transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            !isBilingual
              ? 'opacity-100 ring-2 ring-primary bg-primary/10'
              : 'opacity-40 hover:opacity-60 cursor-pointer',
            isDebounced && isBilingual && 'pointer-events-none'
          )}
        >
          <USFlag className={flagSize} />
          {isTransitioning && !isBilingual && (
            <span className="absolute inset-0 animate-pulse rounded-md bg-primary/20" />
          )}
        </motion.button>

        {/* Myanmar Flag - Bilingual */}
        <motion.button
          role="radio"
          aria-checked={isBilingual}
          aria-label={
            isBilingual
              ? 'Language: Bilingual English and Burmese. Currently selected.'
              : 'Language: Bilingual English and Burmese. Press to switch to bilingual English and Burmese.'
          }
          onClick={() => handleSelect('bilingual')}
          disabled={isDebounced && isBilingual}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.85 }}
          transition={shouldReduceMotion ? { duration: 0.15, ease: 'easeOut' } : SPRING_BOUNCY}
          className={clsx(
            'relative flex items-center justify-center rounded-md p-1',
            'min-h-[36px] min-w-[36px]',
            'transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isBilingual
              ? 'opacity-100 ring-2 ring-primary bg-primary/10'
              : 'opacity-40 hover:opacity-60 cursor-pointer',
            isDebounced && !isBilingual && 'pointer-events-none'
          )}
        >
          <MyanmarFlag className={flagSize} />
          {isTransitioning && isBilingual && (
            <span className="absolute inset-0 animate-pulse rounded-md bg-primary/20" />
          )}
        </motion.button>
      </div>
    </>
  );
}
