'use client';

import { useCallback } from 'react';
import { Undo2 } from 'lucide-react';
import { clsx } from 'clsx';
import { hapticLight, hapticMedium } from '@/lib/haptics';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KnowDontKnowButtonsProps {
  onKnow: () => void;
  onDontKnow: () => void;
  onUndo: () => void;
  canUndo: boolean;
  disabled: boolean;
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// Bilingual labels
// ---------------------------------------------------------------------------

const labels = {
  know: { en: 'Know', my: 'သိပါတယ်' },
  dontKnow: { en: "Don't Know", my: 'မသိပါ' },
  undo: { en: 'Undo', my: 'နောက်ပြန်ပြင်' },
};

// ---------------------------------------------------------------------------
// KnowDontKnowButtons
// ---------------------------------------------------------------------------

/**
 * Know / Don't Know tap buttons + Undo button for sort mode.
 *
 * Layout: Don't Know (left) | Undo (center, smaller) | Know (right)
 *
 * - 3D chunky button style matching existing quiz buttons
 * - All buttons disabled during animation phase
 * - Min touch target: 48px for Know/Don't Know, 44px for Undo
 * - Focus ring on all buttons for accessibility
 */
export function KnowDontKnowButtons({
  onKnow,
  onDontKnow,
  onUndo,
  canUndo,
  disabled,
  showBurmese,
}: KnowDontKnowButtonsProps) {
  const handleKnow = useCallback(() => {
    if (disabled) return;
    hapticMedium();
    onKnow();
  }, [disabled, onKnow]);

  const handleDontKnow = useCallback(() => {
    if (disabled) return;
    hapticLight();
    onDontKnow();
  }, [disabled, onDontKnow]);

  const handleUndo = useCallback(() => {
    if (disabled || !canUndo) return;
    hapticLight();
    onUndo();
  }, [disabled, canUndo, onUndo]);

  return (
    <div className="flex items-center justify-center gap-3 px-4">
      {/* Don't Know button (left) */}
      <button
        type="button"
        onClick={handleDontKnow}
        disabled={disabled}
        className={clsx(
          // Base layout
          'inline-flex flex-1 items-center justify-center gap-2',
          // Size: min 48px height for touch target
          'px-4 py-3 min-h-[48px]',
          // Rounded
          'rounded-xl',
          // Warning/amber themed
          'border-2 border-amber-500/40 bg-warning/10',
          'text-warning',
          // 3D chunky shadow
          'shadow-[0_4px_0_hsl(var(--warning)/0.5)]',
          'active:shadow-[0_1px_0_hsl(var(--warning)/0.5)] active:translate-y-[3px]',
          'transition-[box-shadow,transform] duration-100',
          // Focus
          'focus:outline-none focus:ring-2 focus:ring-warning focus:ring-offset-2',
          // Disabled
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
        )}
        aria-label={showBurmese ? labels.dontKnow.my : labels.dontKnow.en}
      >
        {/* X icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          className="shrink-0"
          aria-hidden="true"
        >
          <path
            d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-sm font-bold">{labels.dontKnow.en}</span>
          {showBurmese && (
            <span className="text-xs font-myanmar opacity-80">{labels.dontKnow.my}</span>
          )}
        </span>
      </button>

      {/* Undo button (center, smaller) */}
      <button
        type="button"
        onClick={handleUndo}
        disabled={disabled || !canUndo}
        className={clsx(
          // Base layout
          'inline-flex items-center justify-center',
          // Size: min 44px for touch target
          'h-11 w-11 min-h-[44px] min-w-[44px]',
          // Round
          'rounded-full',
          // Neutral/muted
          'border-2 border-border bg-transparent',
          'text-muted-foreground',
          // 3D chunky shadow (lighter)
          'shadow-[0_3px_0_hsl(var(--border))]',
          'active:shadow-[0_1px_0_hsl(var(--border))] active:translate-y-[2px]',
          'transition-[box-shadow,transform] duration-100',
          // Hover
          'hover:bg-muted/30 hover:text-foreground',
          // Focus
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          // Disabled
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none'
        )}
        aria-label={showBurmese ? labels.undo.my : labels.undo.en}
        title={showBurmese ? labels.undo.my : labels.undo.en}
      >
        <Undo2 className="h-5 w-5" />
      </button>

      {/* Know button (right) */}
      <button
        type="button"
        onClick={handleKnow}
        disabled={disabled}
        className={clsx(
          // Base layout
          'inline-flex flex-1 items-center justify-center gap-2',
          // Size: min 48px height for touch target
          'px-4 py-3 min-h-[48px]',
          // Rounded
          'rounded-xl',
          // Success/green themed
          'border-2 border-green-500/40 bg-success/10',
          'text-success',
          // 3D chunky shadow
          'shadow-[0_4px_0_hsl(var(--success)/0.5)]',
          'active:shadow-[0_1px_0_hsl(var(--success)/0.5)] active:translate-y-[3px]',
          'transition-[box-shadow,transform] duration-100',
          // Focus
          'focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2',
          // Disabled
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
        )}
        aria-label={showBurmese ? labels.know.my : labels.know.en}
      >
        <span className="flex flex-col items-end leading-tight">
          <span className="text-sm font-bold">{labels.know.en}</span>
          {showBurmese && <span className="text-xs font-myanmar opacity-80">{labels.know.my}</span>}
        </span>
        {/* Check icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          className="shrink-0"
          aria-hidden="true"
        >
          <path
            d="M3.5 9L7 12.5L14.5 5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
