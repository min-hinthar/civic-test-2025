'use client';

/**
 * AddToDeckButton
 *
 * Toggle button for adding/removing questions from the SRS review deck.
 * Used in StudyGuidePage (flip cards) and TestPage (review screen).
 *
 * Features:
 * - Optimistic UI: button state changes immediately, async persists in background
 * - Compact mode: icon-only for inline use (flip cards, test review)
 * - Full mode: icon + bilingual text label
 * - Spring animation on toggle (Phase 3 conventions: stiffness 400, damping 17)
 * - stopPropagation to prevent flip/swipe interference
 * - Bilingual toast on add (no toast on remove for less disruption)
 */

import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Plus, Check } from 'lucide-react';
import clsx from 'clsx';
import { useSRS } from '@/contexts/SRSContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/BilingualToast';

export interface AddToDeckButtonProps {
  /** Question ID to add/remove from deck */
  questionId: string;
  /** Compact mode: icon-only, smaller size (32px), tooltip with text */
  compact?: boolean;
  /** Additional class names */
  className?: string;
  /** Prevent click bubbling (for use inside flip cards) */
  stopPropagation?: boolean;
}

/**
 * Toggle button for adding/removing a question from the SRS review deck.
 */
export function AddToDeckButton({
  questionId,
  compact = false,
  className,
  stopPropagation = false,
}: AddToDeckButtonProps) {
  const { addCard, removeCard, isInDeck } = useSRS();
  const { showBurmese } = useLanguage();
  const { showSuccess } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const inDeck = isInDeck(questionId);

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (stopPropagation) {
        e.stopPropagation();
      }
      if (isProcessing) return;

      setIsProcessing(true);
      try {
        if (inDeck) {
          await removeCard(questionId);
        } else {
          await addCard(questionId);
          // Bilingual toast on add only
          showSuccess({
            en: 'Added to review deck',
            my: 'ပြန်လှည့်စာရင်းသို့ထည့်ပြီး',
          });
        }
      } catch (error) {
        console.error('[AddToDeckButton] Toggle failed:', error);
      } finally {
        setIsProcessing(false);
      }
    },
    [stopPropagation, isProcessing, inDeck, removeCard, questionId, addCard, showSuccess]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (stopPropagation) {
        e.stopPropagation();
      }
    },
    [stopPropagation]
  );

  const label = inDeck
    ? { en: 'In Review Deck', my: 'ပြန်လှည့်စာရင်းတွင်ရှိသည်' }
    : { en: 'Add to Review', my: 'ပြန်လှည့်ရန်ထည့်ပါ' };

  const Icon = inDeck ? Check : Plus;

  // Compact: icon-only button with tooltip
  if (compact) {
    return (
      <motion.button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={isProcessing}
        title={showBurmese ? `${label.en} / ${label.my}` : label.en}
        aria-label={label.en}
        aria-pressed={inDeck}
        whileTap={{ scale: 0.9 }}
        animate={{ scale: inDeck ? [1.15, 1] : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={clsx(
          'inline-flex items-center justify-center rounded-full',
          'h-8 w-8',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          inDeck
            ? 'border border-primary-500/30 bg-primary-500/10 text-primary-500'
            : 'border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30',
          className
        )}
      >
        <Icon className="h-4 w-4" />
      </motion.button>
    );
  }

  // Full: icon + text label
  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isProcessing}
      aria-label={label.en}
      aria-pressed={inDeck}
      whileTap={{ scale: 0.97 }}
      animate={{ scale: inDeck ? [1.03, 1] : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={clsx(
        'inline-flex items-center gap-2 rounded-xl px-4',
        'min-h-[44px]',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        inDeck
          ? 'border border-primary-500/30 bg-primary-500/10 text-primary-500'
          : 'border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30',
        className
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex flex-col text-left">
        <span className="text-sm font-semibold">{label.en}</span>
        {showBurmese && (
          <span className="font-myanmar text-xs opacity-80">{label.my}</span>
        )}
      </span>
    </motion.button>
  );
}
