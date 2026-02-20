'use client';

/**
 * BadgeCelebration - Modal celebration for newly earned badges.
 *
 * Follows the MasteryMilestone pattern:
 * - Radix Dialog for accessibility
 * - Confetti effect from celebrations
 * - Bilingual display (EN + MY)
 * - Auto-dismiss after 8 seconds
 * - Spring animation for badge icon
 *
 * Usage:
 * ```tsx
 * <BadgeCelebration badge={newlyEarnedBadge} onDismiss={() => dismissCelebration(badge.id)} />
 * ```
 */

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { Flame, Target, Star, BookCheck, Award, type LucideIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Confetti } from '@/components/celebrations/Confetti';
import { useLanguage } from '@/contexts/LanguageContext';
import type { BadgeDefinition } from '@/lib/social/badgeDefinitions';
import { getBadgeColors } from '@/lib/social/badgeColors';
import { hapticHeavy } from '@/lib/haptics';

// ---------------------------------------------------------------------------
// Icon map - maps badge icon string to lucide-react component
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, LucideIcon> = {
  Flame,
  Target,
  Star,
  BookCheck,
  Award,
};

/** Auto-dismiss timeout (ms) */
const AUTO_DISMISS_MS = 8000;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BadgeCelebrationProps {
  /** The badge to celebrate, or null to hide */
  badge: BadgeDefinition | null;
  /** Called when the celebration is dismissed */
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BadgeCelebration({ badge, onDismiss }: BadgeCelebrationProps) {
  const { showBurmese } = useLanguage();
  const autoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOpen = badge !== null;

  // Auto-dismiss timer + celebration haptic
  useEffect(() => {
    if (!badge) return;

    // Heavy haptic on badge celebration mount. Acceptable in useEffect because
    // showing the celebration is always user-action-initiated (earning a badge
    // requires completing a quiz or reaching a milestone).
    hapticHeavy();

    autoDismissRef.current = setTimeout(() => {
      onDismiss();
    }, AUTO_DISMISS_MS);

    return () => {
      if (autoDismissRef.current) {
        clearTimeout(autoDismissRef.current);
      }
    };
  }, [badge, onDismiss]);

  if (!badge) {
    return null;
  }

  const IconComponent = ICON_MAP[badge.icon] ?? Award;
  const colors = getBadgeColors(badge.id);

  return (
    <>
      {/* Confetti effect */}
      <Confetti fire={isOpen} intensity="celebration" />

      {/* Celebration dialog */}
      <Dialog open={isOpen} onOpenChange={open => !open && onDismiss()}>
        <DialogContent className={clsx('ring-2 shadow-lg', colors.ring)} showCloseButton={false}>
          <div className="flex flex-col items-center text-center py-4">
            {/* Prismatic ripple expanding outward behind the badge */}
            <div className="relative flex items-center justify-center">
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 80,
                  height: 80,
                  background:
                    'conic-gradient(from 0deg, hsl(0 80% 60% / 0.3), hsl(120 80% 60% / 0.3), hsl(240 80% 60% / 0.3), hsl(0 80% 60% / 0.3))',
                }}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />

              {/* Badge icon with spring scale-in animation */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 17,
                }}
                className={clsx(
                  'relative flex items-center justify-center',
                  'h-20 w-20 rounded-full',
                  colors.bgLight,
                  colors.bgDark,
                  'ring-4',
                  colors.ring
                )}
              >
                <IconComponent
                  className={clsx('h-10 w-10 filter saturate-150', colors.icon, colors.glow)}
                />
                <div className="badge-gold-shimmer absolute inset-0 rounded-full" />
              </motion.div>
            </div>

            {/* Congrats heading */}
            <DialogTitle className="mt-5 text-xl">Badge Earned!</DialogTitle>

            {showBurmese && (
              <p className="font-myanmar text-xl text-muted-foreground mt-0.5">တံဆိပ်ရရှိပါပြီ!</p>
            )}

            {/* Badge name */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-foreground mt-3"
            >
              {badge.name.en}
            </motion.p>

            {showBurmese && (
              <p className="font-myanmar text-2xl text-muted-foreground mt-0.5">{badge.name.my}</p>
            )}

            {/* Badge description */}
            <DialogDescription className="mt-3 text-base">{badge.description.en}</DialogDescription>

            {showBurmese && (
              <p className="font-myanmar text-base text-muted-foreground mt-0.5">
                {badge.description.my}
              </p>
            )}

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
              {showBurmese && <span className="font-myanmar ml-2 text-white/80">ဆက်လက်ပါ</span>}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
