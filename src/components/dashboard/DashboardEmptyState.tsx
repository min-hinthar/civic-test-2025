'use client';

import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { EmptyState } from '@/components/ui/EmptyState';

/**
 * Dashboard empty state for new users with zero data.
 *
 * Shows a welcoming 3-step quick start guide:
 * 1. Pick a category that interests you
 * 2. Start studying with flashcards or practice tests
 * 3. Track your progress and watch yourself improve
 *
 * Uses the reusable EmptyState component with bilingual text and a CTA
 * that navigates to the Study Guide.
 */
export function DashboardEmptyState() {
  const router = useRouter();

  return (
    <EmptyState
      icon={Sparkles}
      iconColor="text-primary"
      title={{
        en: "Welcome! Here's how to get started",
        my: '\u1000\u103C\u102D\u102F\u1006\u102D\u102F\u1015\u102B\u101E\u100A\u103A! \u1005\u1010\u1004\u103A\u101C\u102D\u102F\u1000\u103A\u1019\u100A\u103A\u1037\u1014\u100A\u103A\u1038\u101C\u1019\u103A\u1038',
      }}
      description={{
        en: '1. Pick a category that interests you\n2. Start studying with flashcards or practice tests\n3. Track your progress and watch yourself improve',
        my: '\u1041. \u101E\u1004\u103A\u1005\u102D\u1010\u103A\u101D\u1004\u103A\u1005\u102C\u1038\u101E\u100A\u103A\u1037 \u1021\u1019\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038\u1000\u102D\u102F \u101B\u103D\u1031\u1038\u1015\u102B\n\u1042. \u1016\u101C\u1000\u103A\u101E\u103A\u1000\u1010\u103A\u1019\u103B\u102C\u1038 \u101E\u102D\u102F\u1037\u1019\u101F\u102F\u1010\u103A \u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1019\u103B\u102C\u1038\u1016\u103C\u1004\u103A\u1037 \u1005\u1010\u1004\u103A\u101C\u1031\u1037\u101C\u102C\u1015\u102B\n\u1043. \u101E\u1004\u103A\u1037\u1010\u102D\u102F\u1038\u1010\u1000\u103A\u1019\u103E\u102F\u1000\u102D\u102F \u1001\u103C\u1031\u101B\u102C\u1001\u103E\u1014\u103A\u1015\u103C\u102E\u1038 \u1010\u102D\u102F\u1038\u1010\u1000\u103A\u101C\u102C\u1019\u103E\u102F\u1000\u102D\u102F \u1000\u103C\u100A\u103A\u1037\u101B\u103E\u102F\u1015\u102B',
      }}
      action={{
        label: {
          en: 'Start Studying',
          my: '\u1005\u1010\u1004\u103A\u101C\u1031\u1037\u101C\u102C\u1015\u102B',
        },
        onClick: () => router.push('/study'),
      }}
    />
  );
}
