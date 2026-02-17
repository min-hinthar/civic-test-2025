'use client';

/**
 * MissedCardsList - Expandable list of missed (Don't Know) cards.
 *
 * Displays a collapsible list of questions the user sorted as "Don't Know"
 * during the current round. Each card shows question text (bilingual if enabled),
 * category badge, and an individual AddToDeckButton for SRS integration.
 *
 * Animations use motion/react for smooth expand/collapse.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { AddToDeckButton } from '@/components/srs/AddToDeckButton';
import { SUB_CATEGORY_NAMES, SUB_CATEGORY_COLORS } from '@/lib/mastery';
import type { Question } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MissedCardsListProps {
  unknownIds: string[];
  sourceCards: Question[];
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MissedCardsList({ unknownIds, sourceCards, showBurmese }: MissedCardsListProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Build missed cards from unknownIds
  const missedCards: Question[] = useMemo(() => {
    const sourceMap = new Map(sourceCards.map(q => [q.id, q]));
    return unknownIds.map(id => sourceMap.get(id)).filter((q): q is Question => q !== undefined);
  }, [unknownIds, sourceCards]);

  // Don't render if no missed cards
  if (missedCards.length === 0) return null;

  const count = missedCards.length;

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        className={clsx(
          'w-full flex items-center justify-between gap-3 px-4 py-3',
          'text-left min-h-[44px]',
          'hover:bg-muted/30 transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
        )}
        aria-expanded={expanded}
        aria-controls="missed-cards-list"
      >
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-foreground">View missed cards ({count})</span>
          {showBurmese && (
            <span className="font-myanmar text-xs text-muted-foreground ml-2">
              မမှန်ကတ်များကြည့်ပါ ({count})
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Expandable list */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id="missed-cards-list"
            initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 divide-y divide-border/30">
              {missedCards.map(card => {
                const catNames = SUB_CATEGORY_NAMES[card.category];
                const catColors = SUB_CATEGORY_COLORS[card.category];

                return (
                  <div key={card.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{card.question_en}</p>
                      {showBurmese && (
                        <p className="font-myanmar text-xs text-muted-foreground mt-0.5 leading-snug">
                          {card.question_my}
                        </p>
                      )}
                      {/* Category badge */}
                      <span
                        className={clsx(
                          'inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                          catColors?.textColor ?? 'text-muted-foreground',
                          'bg-muted/50'
                        )}
                      >
                        {catNames?.en ?? card.category}
                      </span>
                    </div>
                    <AddToDeckButton
                      questionId={card.id}
                      compact
                      stopPropagation
                      className="shrink-0 mt-0.5"
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
