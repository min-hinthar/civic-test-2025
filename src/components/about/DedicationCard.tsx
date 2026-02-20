'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Heart } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import type { DedicationPerson } from '@/constants/about/aboutContent';

interface DedicationCardProps {
  person: DedicationPerson;
}

/**
 * Bilingual dedication card with tap-to-expand interaction.
 *
 * Collapsed: name, role, brief tribute (bilingual when showBurmese is on).
 * Expanded: full tribute text revealed below a separator.
 *
 * Follows the WhyButton AnimatePresence expand pattern for height animation.
 */
export function DedicationCard({ person }: DedicationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-lg">
      {/* Header: always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        className={clsx(
          'flex w-full items-start gap-3 px-5 py-4 text-left',
          'min-h-[44px]',
          'transition-colors duration-150',
          'hover:bg-muted/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
        )}
        aria-expanded={isExpanded}
        aria-label={
          isExpanded
            ? `Collapse tribute for ${person.name.en}`
            : `Expand tribute for ${person.name.en}`
        }
      >
        {/* Heart accent */}
        <Heart
          className="mt-0.5 h-5 w-5 shrink-0 text-primary/70"
          fill="currentColor"
          aria-hidden="true"
        />

        {/* Name, role, brief tribute */}
        <div className="flex-1 space-y-1.5">
          <div>
            <h3 className="text-lg font-bold text-foreground">{person.name.en}</h3>
            {showBurmese && (
              <p className="font-myanmar text-base text-foreground/80">{person.name.my}</p>
            )}
          </div>

          <p className="text-sm font-medium text-primary/80">{person.role.en}</p>
          {showBurmese && <p className="font-myanmar text-sm text-primary/60">{person.role.my}</p>}

          <p className="text-sm leading-relaxed text-muted-foreground">{person.briefTribute.en}</p>
          {showBurmese && (
            <p className="font-myanmar text-sm leading-relaxed text-muted-foreground/80">
              {person.briefTribute.my}
            </p>
          )}
        </div>

        {/* Chevron */}
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
          className="mt-1 shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.span>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={
              shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeInOut' }
            }
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 px-5 py-4 space-y-3">
              <p className="text-sm leading-relaxed text-foreground/90">{person.fullTribute.en}</p>
              {showBurmese && (
                <p className="font-myanmar text-sm leading-relaxed text-foreground/70">
                  {person.fullTribute.my}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
