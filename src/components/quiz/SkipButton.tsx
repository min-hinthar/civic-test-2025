'use client';

import { useCallback } from 'react';
import { SkipForward } from 'lucide-react';
import { clsx } from 'clsx';
import { strings } from '@/lib/i18n/strings';
import { playSkip } from '@/lib/audio/soundEffects';
import { hapticMedium } from '@/lib/haptics';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SkipButtonProps {
  onSkip: () => void;
  disabled?: boolean;
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// SkipButton
// ---------------------------------------------------------------------------

/**
 * Secondary/outline-style Skip button for quiz flow.
 *
 * - Sits side-by-side with the Check button (secondary visual weight)
 * - 3D chunky outline style with border-2, matching Check but lighter
 * - Plays skip sound effect and haptic feedback on click
 * - Tab order: options -> Skip -> Check (standard)
 * - Min height 48px for touch target accessibility
 */
export function SkipButton({ onSkip, disabled = false, showBurmese }: SkipButtonProps) {
  const handleClick = useCallback(() => {
    if (disabled) return;
    playSkip();
    hapticMedium();
    onSkip();
  }, [disabled, onSkip]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={clsx(
        // Base layout
        'inline-flex items-center justify-center gap-2',
        // Size: min 48px height for touch target
        'px-5 py-3 min-h-[48px]',
        // Pill shape
        'rounded-full',
        // Secondary/outline style (lighter visual weight than Check)
        'border-2 border-border bg-transparent',
        'text-muted-foreground',
        // 3D chunky shadow (lighter than primary)
        'shadow-[0_3px_0_hsl(var(--border))]',
        'active:shadow-[0_1px_0_hsl(var(--border))] active:translate-y-[2px]',
        'transition-[box-shadow,transform,colors] duration-100',
        // Hover
        'hover:bg-muted/30 hover:text-foreground',
        // Focus
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        // Disabled
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
      )}
      aria-label={showBurmese ? strings.quiz.skip.my : strings.quiz.skip.en}
    >
      <SkipForward className="h-4 w-4" />
      <span className="flex flex-col items-start leading-tight">
        <span className="text-sm font-semibold">{strings.quiz.skip.en}</span>
        {showBurmese && (
          <span className="text-xs font-myanmar opacity-80">{strings.quiz.skip.my}</span>
        )}
      </span>
    </button>
  );
}
