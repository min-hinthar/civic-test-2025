'use client';

/**
 * ReviewDeckCard - Spacious, clickable card for the review deck list.
 *
 * Displays question preview, category badge, difficulty indicator,
 * and navigates to the flashcard view for that question's category on click.
 * Spring physics for tap feedback via SPRING_BOUNCY.
 */

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronRight, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { SPRING_BOUNCY } from '@/lib/motion-config';
import { Card } from '@/components/ui/Card';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getSubCategoryColors } from '@/lib/mastery';
import type { Category } from '@/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReviewDeckCardProps {
  questionId: string;
  questionText: string;
  questionTextMy?: string;
  category: string;
  isDue: boolean;
  /** FSRS difficulty as 0-1 number (higher = harder) */
  difficulty: number;
  showBurmese: boolean;
  onRemove: (questionId: string) => void;
}

// ---------------------------------------------------------------------------
// Difficulty dots
// ---------------------------------------------------------------------------

/** Render 5 dots filled proportional to difficulty (0-1), with green-yellow-red color scale */
function DifficultyDots({ difficulty }: { difficulty: number }) {
  const filled = Math.round(difficulty * 5);

  return (
    <div className="flex items-center gap-1" aria-label={`Difficulty: ${filled} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        const isFilled = i < filled;
        // Color scale: 1-2 = green, 3 = yellow, 4-5 = red
        const colorClass = isFilled
          ? i < 2
            ? 'bg-green-500'
            : i < 3
              ? 'bg-yellow-500'
              : 'bg-red-500'
          : 'bg-muted-foreground/20';

        return <div key={i} className={clsx('h-1.5 w-1.5 rounded-full', colorClass)} />;
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReviewDeckCard({
  questionId,
  questionText,
  questionTextMy,
  category,
  isDue: cardIsDue,
  difficulty,
  showBurmese,
  onRemove,
}: ReviewDeckCardProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const subColors = getSubCategoryColors(category as Category);

  const handleClick = () => {
    // Navigate to the flashcard view filtered to this question's category
    router.push(`/study#cards-${encodeURIComponent(category)}`);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(questionId);
  };

  return (
    <motion.div
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      transition={SPRING_BOUNCY}
    >
      <Card interactive animate={false} onClick={handleClick} className="p-0 overflow-hidden">
        {/* Category color accent bar */}
        <div className={clsx('h-1', subColors.stripBg)} />

        <div className="p-4">
          {/* Row 1: Category name + Due badge */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={clsx(
                'text-xs font-semibold uppercase tracking-wider',
                subColors.textColor
              )}
            >
              {category}
            </span>
            {cardIsDue && (
              <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                Due
                {showBurmese && <span className="font-myanmar ml-1">/ပြန်လည်ရန်</span>}
              </span>
            )}
          </div>

          {/* Row 2: Question text + chevron */}
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                {questionText}
              </p>

              {/* Row 3 (optional): Burmese text */}
              {showBurmese && questionTextMy && (
                <p className="text-sm text-muted-foreground font-myanmar mt-1 leading-relaxed line-clamp-1">
                  {questionTextMy}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              {/* Remove button */}
              <button
                onClick={handleRemoveClick}
                className="p-1.5 text-muted-foreground/50 hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                aria-label={`Remove ${questionText} from deck`}
                title="Remove from deck"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </div>

          {/* Row 4: Difficulty indicator */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Difficulty:</span>
            <DifficultyDots difficulty={difficulty} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
