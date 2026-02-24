'use client';

import { BookOpen, ClipboardCheck, GraduationCap } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { GlassCard } from '@/components/hub/GlassCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { StaggeredList, StaggeredItem } from '@/components/animations/StaggeredList';
import { SPRING_GENTLE } from '@/lib/motion-config';

// ---------------------------------------------------------------------------
// Step configuration
// ---------------------------------------------------------------------------

interface GuidedStep {
  icon: LucideIcon;
  label: { en: string; my: string };
  description: { en: string; my: string };
  path: string;
}

const GUIDED_STEPS: GuidedStep[] = [
  {
    icon: BookOpen,
    label: {
      en: 'Start studying',
      my: '\u1005\u1010\u1004\u103A\u101C\u1031\u1037\u101C\u102C\u1015\u102B',
    },
    description: {
      en: 'Learn with flashcards and study guides',
      my: '\u1016\u101C\u1000\u103A\u1000\u103A\u1010\u103A\u1019\u103B\u102C\u1038\u1016\u103C\u1004\u103A\u1037 \u101C\u1031\u1037\u101C\u102C\u1015\u102B',
    },
    path: '/study',
  },
  {
    icon: ClipboardCheck,
    label: {
      en: 'Take a practice quiz',
      my: '\u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032 \u1016\u103C\u1031\u1015\u102B',
    },
    description: {
      en: 'Test your knowledge with quick quizzes',
      my: '\u1021\u1019\u103C\u1014\u103A\u1005\u1019\u103A\u1038\u101E\u1015\u103A\u1015\u102B',
    },
    path: '/practice',
  },
  {
    icon: GraduationCap,
    label: {
      en: 'Try a mock test',
      my: '\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032 \u1005\u1019\u103A\u1038\u101E\u1015\u103A\u1000\u103C\u100A\u103A\u1037\u1015\u102B',
    },
    description: {
      en: 'Simulate the real USCIS interview',
      my: '\u1021\u1005\u1005\u103A USCIS \u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038\u1000\u102D\u102F \u1005\u1019\u103A\u1038\u101E\u1015\u103A\u1015\u102B',
    },
    path: '/test',
  },
];

// ---------------------------------------------------------------------------
// WelcomeState component
// ---------------------------------------------------------------------------

/**
 * Welcome state shown when user has 0% mastery (no practiced questions).
 * Replaces the stats area with an encouraging message and guided first steps.
 *
 * Features:
 * - Encouraging welcome message (bilingual)
 * - 3 guided step cards, each tappable with icon + bilingual label
 * - Uses GlassCard for each step
 * - Stagger animation for entrance
 */
export function WelcomeState() {
  const router = useRouter();
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-6">
      {/* Welcome message with glass-medium and gentle entrance */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : SPRING_GENTLE}
      >
        <GlassCard tier="medium" className="text-center">
          <h2 className="text-xl font-bold text-text-primary">Welcome to Your Progress Hub!</h2>
          {showBurmese && (
            <p className="font-myanmar mt-1 text-xl text-muted-foreground">
              {
                '\u101E\u1004\u103A\u1037\u1010\u102D\u102F\u1038\u1010\u1000\u103A\u1019\u103E\u102F \u1017\u1000\u103A\u101E\u102D\u102F\u1037 \u1000\u103C\u102D\u102F\u1006\u102D\u102F\u1015\u102B\u101E\u100A\u103A!'
              }
            </p>
          )}
          <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary">
            Start your journey to citizenship test readiness. Here are some great first steps:
          </p>
          {showBurmese && (
            <p className="font-myanmar mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              {
                '\u1014\u102D\u102F\u1004\u103A\u1004\u1036\u101E\u102C\u1038\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032 \u1021\u1006\u1004\u103A\u101E\u1004\u103A\u1037\u1016\u103C\u1005\u103A\u101B\u1014\u103A \u1005\u1010\u1004\u103A\u101C\u102D\u102F\u1000\u103A\u1015\u102B\u104B'
              }
            </p>
          )}
        </GlassCard>
      </motion.div>

      {/* Guided steps */}
      <StaggeredList className="space-y-3" delay={200} stagger={100}>
        {GUIDED_STEPS.map(step => (
          <StaggeredItem key={step.path}>
            <GlassCard interactive className="rounded-2xl p-0">
              <button
                type="button"
                className="flex w-full items-center gap-4 p-4 text-left min-h-[44px]"
                onClick={() => router.push(step.path)}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary">{step.label.en}</p>
                  {showBurmese && (
                    <p className="font-myanmar text-sm text-muted-foreground">{step.label.my}</p>
                  )}
                  <p className="mt-0.5 text-xs text-text-secondary">{step.description.en}</p>
                  {showBurmese && (
                    <p className="font-myanmar text-xs text-muted-foreground">
                      {step.description.my}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </button>
            </GlassCard>
          </StaggeredItem>
        ))}
      </StaggeredList>
    </div>
  );
}
