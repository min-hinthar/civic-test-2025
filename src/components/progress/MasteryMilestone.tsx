'use client';

import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Confetti } from '@/components/celebrations/Confetti';
import { MasteryBadge } from './MasteryBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import type { MilestoneEvent } from '@/hooks/useMasteryMilestones';
import type { MilestoneLevel } from './MasteryBadge';

/**
 * Bilingual encouraging messages for each milestone level.
 * Multiple messages per level for variety.
 */
const milestoneMessages: Record<
  Exclude<MilestoneLevel, 'none'>,
  Array<{ en: string; my: string }>
> = {
  bronze: [
    { en: "You're getting there!", my: 'ရောက်တော့မယ်!' },
    { en: 'Great start! Keep going!', my: 'အစကောင်းတယ်! ဆက်လုပ်ပါ!' },
    { en: 'Half way there!', my: 'တစ်ဝက်ရောက်ပြီ!' },
    { en: 'Nice progress!', my: 'တိုးတက်မှုကောင်းတယ်!' },
  ],
  silver: [
    { en: 'Excellent progress!', my: 'အလွန်ကောင်းမွန်သော တိုးတက်မှု!' },
    { en: 'Almost a master!', my: 'ကျွမ်းကျင်တော့မယ်!' },
    { en: 'Outstanding work!', my: 'ထူးချွန်တဲ့ အလုပ်!' },
    { en: "You're doing amazing!", my: 'အံ့ဩစရာ ကောင်းတယ်!' },
  ],
  gold: [
    { en: 'You mastered this category!', my: 'ဒီအမျိုးအစားကို ကျွမ်းကျင်ပြီ!' },
    { en: 'Perfect mastery achieved!', my: 'ပြည့်စုံသော ကျွမ်းကျင်မှု ရရှိပြီ!' },
    { en: '100% - Amazing achievement!', my: '၁၀၀% - အံ့ဩစရာ အောင်မြင်မှု!' },
  ],
};

/**
 * Pick a random message for a given level.
 * Uses a simple hash of the category name for deterministic but varied selection.
 */
function getMessageForLevel(
  level: Exclude<MilestoneLevel, 'none'>,
  category: string
): { en: string; my: string } {
  const messages = milestoneMessages[level];
  // Simple hash: sum char codes
  const hash = category.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return messages[hash % messages.length];
}

/** Auto-dismiss timeout per level (ms) */
const autoDismissMs: Record<Exclude<MilestoneLevel, 'none'>, number> = {
  bronze: 5000,
  silver: 8000,
  gold: 8000,
};

/** Confetti intensity per level */
const confettiIntensity: Record<
  Exclude<MilestoneLevel, 'none'>,
  'sparkle' | 'burst' | 'celebration'
> = {
  bronze: 'sparkle',
  silver: 'burst',
  gold: 'celebration',
};

/** Card styling per level */
const cardStyles: Record<Exclude<MilestoneLevel, 'none'>, string> = {
  bronze: '',
  silver: '',
  gold: 'ring-2 ring-yellow-400/50 shadow-yellow-200/20',
};

export interface MasteryMilestoneProps {
  /** The milestone event to celebrate, or null to hide */
  milestone: MilestoneEvent | null;
  /** Called when the celebration is dismissed */
  onDismiss: () => void;
}

/**
 * Celebration modal for mastery milestones.
 *
 * Features:
 * - Celebration intensity scales by level:
 *   - Bronze (50%): Subtle sparkle confetti, encouraging message
 *   - Silver (75%): Burst confetti, congratulatory message
 *   - Gold (100%): Full celebration confetti, golden glow border, "You mastered it!"
 * - All messages bilingual (EN + MY)
 * - Rotating message pool for variety
 * - Auto-dismiss: 5s for bronze, 8s for silver/gold
 * - Uses existing Confetti and Dialog components
 * - Accessible: Dialog handles focus trapping, keyboard nav
 *
 * Usage:
 * ```tsx
 * <MasteryMilestone milestone={currentMilestone} onDismiss={dismissMilestone} />
 * ```
 */
export function MasteryMilestone({ milestone, onDismiss }: MasteryMilestoneProps) {
  const { showBurmese } = useLanguage();
  const autoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOpen = milestone !== null;
  const level = milestone?.level ?? 'bronze';
  const safeLevel = level === 'none' ? 'bronze' : level;

  // Auto-dismiss timer
  useEffect(() => {
    if (!milestone || milestone.level === 'none') return;

    const timeout = autoDismissMs[safeLevel];
    autoDismissRef.current = setTimeout(() => {
      onDismiss();
    }, timeout);

    return () => {
      if (autoDismissRef.current) {
        clearTimeout(autoDismissRef.current);
      }
    };
  }, [milestone, safeLevel, onDismiss]);

  if (!milestone || milestone.level === 'none') {
    return null;
  }

  const message = getMessageForLevel(safeLevel, milestone.category);
  const intensity = confettiIntensity[safeLevel];
  const extraCardStyle = cardStyles[safeLevel];

  return (
    <>
      {/* Confetti effect */}
      <Confetti fire={isOpen} intensity={intensity} />

      {/* Celebration dialog */}
      <Dialog open={isOpen} onOpenChange={open => !open && onDismiss()}>
        <DialogContent className={clsx(extraCardStyle)} showCloseButton={false}>
          <div className="flex flex-col items-center text-center py-4">
            {/* Badge */}
            <MasteryBadge mastery={milestone.newPercentage} size="lg" />

            {/* Title */}
            <DialogTitle className="mt-4 text-xl">{message.en}</DialogTitle>

            {/* Burmese subtitle */}
            {showBurmese && (
              <DialogDescription className="font-myanmar text-base mt-1">
                {message.my}
              </DialogDescription>
            )}

            {/* Category name */}
            <p className="text-sm text-muted-foreground mt-3">{milestone.category}</p>

            {/* Progress indicator */}
            <p className="text-3xl font-bold text-foreground mt-2 tabular-nums">
              {milestone.newPercentage}%
            </p>

            {/* Dismiss button */}
            <button
              onClick={onDismiss}
              className={clsx(
                'mt-6 px-6 py-2.5 rounded-full',
                'text-sm font-semibold',
                'bg-primary text-white',
                'hover:bg-primary active:bg-primary-700',
                'transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
              )}
            >
              Continue
              {showBurmese && <span className="font-myanmar ml-1">ဆက်လက်ပါ</span>}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
