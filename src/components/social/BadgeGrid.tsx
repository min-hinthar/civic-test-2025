'use client';

/**
 * BadgeGrid - Collection grid showing all badges with earned/locked states.
 *
 * Displays all 7 badges organized by category (Streak, Accuracy, Coverage).
 * Earned badges show gold icon containers with descriptions.
 * Locked badges show gray containers with requirement text.
 *
 * Uses StaggeredGrid for entrance animation.
 * All text is bilingual (EN + MY) via useLanguage().
 */

import { useMemo } from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { Flame, Target, Star, BookCheck, Award, type LucideIcon } from 'lucide-react';
import { StaggeredList, StaggeredItem } from '@/components/animations/StaggeredList';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { BadgeDefinition } from '@/lib/social/badgeDefinitions';
import { getBadgeColors } from '@/lib/social/badgeColors';

// ---------------------------------------------------------------------------
// Icon map (shared with BadgeCelebration)
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, LucideIcon> = {
  Flame,
  Target,
  Star,
  BookCheck,
  Award,
};

// ---------------------------------------------------------------------------
// Category labels (bilingual)
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<'streak' | 'accuracy' | 'coverage', { en: string; my: string }> = {
  streak: { en: 'Streak', my: 'ဆက်တိုက်မှု' },
  accuracy: { en: 'Accuracy', my: 'မှန်ကန်မှု' },
  coverage: { en: 'Coverage', my: 'ကျွမ်းကျင်မှု' },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BadgeGridProps {
  /** Badges the user has earned */
  earnedBadges: BadgeDefinition[];
  /** Badges not yet earned */
  lockedBadges: BadgeDefinition[];
  /** Optional CSS class */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BadgeGrid({ earnedBadges, lockedBadges, className }: BadgeGridProps) {
  const { showBurmese } = useLanguage();

  // Build sets for fast lookup
  const earnedIds: Set<string> = useMemo(
    () => new Set(earnedBadges.map(b => b.id)),
    [earnedBadges]
  );

  // Group all badges by category, maintaining definition order
  const groupedBadges = useMemo(() => {
    const all = [...earnedBadges, ...lockedBadges];
    const groups: Record<string, BadgeDefinition[]> = {
      streak: [],
      accuracy: [],
      coverage: [],
    };

    for (const badge of all) {
      if (groups[badge.category]) {
        // Deduplicate (in case a badge appears in both arrays somehow)
        if (!groups[badge.category].some(b => b.id === badge.id)) {
          groups[badge.category].push(badge);
        }
      }
    }

    return groups;
  }, [earnedBadges, lockedBadges]);

  return (
    <div className={clsx('space-y-6', className)}>
      {(['streak', 'accuracy', 'coverage'] as const).map(category => {
        const badges = groupedBadges[category];
        if (!badges || badges.length === 0) return null;

        const label = CATEGORY_LABELS[category];

        return (
          <div key={category}>
            {/* Category header */}
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-foreground">{label.en}</h3>
              {showBurmese && (
                <p className="text-sm font-myanmar text-muted-foreground">{label.my}</p>
              )}
            </div>

            {/* Badge cards grid */}
            <StaggeredList
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
              stagger={60}
              delay={80}
            >
              {badges.map(badge => {
                const isEarned = earnedIds.has(badge.id);
                return (
                  <StaggeredItem key={badge.id}>
                    <BadgeCard badge={badge} isEarned={isEarned} showBurmese={showBurmese} />
                  </StaggeredItem>
                );
              })}
            </StaggeredList>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Badge card
// ---------------------------------------------------------------------------

function BadgeCard({
  badge,
  isEarned,
  showBurmese,
}: {
  badge: BadgeDefinition;
  isEarned: boolean;
  showBurmese: boolean;
}) {
  const IconComponent = ICON_MAP[badge.icon] ?? Award;
  const colors = getBadgeColors(badge.id);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={clsx(
        'flex flex-col items-center text-center p-4 rounded-xl cursor-pointer',
        'border border-border/60 bg-card',
        isEarned ? '' : 'opacity-60'
      )}
      whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -4 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Icon container with hover wiggle */}
      <motion.div
        className={clsx(
          'relative flex items-center justify-center h-12 w-12 rounded-full mb-3',
          isEarned ? `${colors.bgLight} ${colors.bgDark}` : 'bg-muted grayscale'
        )}
        whileHover={
          shouldReduceMotion ? {} : isEarned ? { rotate: [0, -10, 10, -5, 5, 0] } : { scale: 1.1 }
        }
        transition={{ duration: 0.5 }}
      >
        <IconComponent
          className={clsx(
            'h-6 w-6',
            isEarned ? `${colors.icon} ${colors.glow} filter saturate-150` : 'text-muted-foreground'
          )}
        />
        {isEarned && <div className="badge-gold-shimmer absolute inset-0 rounded-full" />}
      </motion.div>

      {/* Badge name */}
      <p className="text-sm font-semibold text-foreground leading-tight">{badge.name.en}</p>
      {showBurmese && (
        <p className="text-sm font-myanmar text-muted-foreground mt-0.5 leading-tight">
          {badge.name.my}
        </p>
      )}

      {/* Description (earned) or Requirement (locked) */}
      {isEarned ? (
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          {badge.description.en}
          {showBurmese && <span className="block font-myanmar mt-0.5">{badge.description.my}</span>}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed italic">
          {badge.requirement.en}
          {showBurmese && <span className="block font-myanmar mt-0.5">{badge.requirement.my}</span>}
        </p>
      )}
    </motion.div>
  );
}
