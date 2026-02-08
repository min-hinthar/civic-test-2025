'use client';

import { useState, useCallback } from 'react';
import Joyride, { type Step, type CallBackProps, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { WelcomeScreen } from './WelcomeScreen';
import { TourTooltip } from './TourTooltip';

/**
 * 7-step tour — all targets are on the Dashboard page.
 * Each step uses disableBeacon: true for immediate display.
 */
const tourSteps: Step[] = [
  {
    target: '[data-tour="dashboard"]',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">Your Dashboard</h3>
        <p className="text-muted-foreground text-sm">
          This is your home base. Track progress, see streaks, and find areas to improve.
        </p>
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          {
            '\u1024\u101E\u100A\u103A\u1019\u103E\u102C \u101E\u1004\u103A\u1037\u1015\u1004\u103A\u1019\u1005\u102C\u1019\u103B\u1000\u103A\u1014\u103E\u102C\u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B \u1010\u102D\u102F\u1038\u1010\u1000\u103A\u1019\u103E\u102F\u1000\u102D\u102F \u1001\u103C\u1031\u101B\u102C\u1001\u1036\u1015\u102B\u104B'
          }
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="study-action"]',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">Study with Flashcards</h3>
        <p className="text-muted-foreground text-sm">
          Flip through bilingual flashcards to learn all 100 civics questions. Tap to reveal
          answers!
        </p>
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          {
            '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038 \u1041\u1040\u1040 \u101C\u102F\u1036\u1038\u1000\u102D\u102F \u101C\u1031\u1037\u101C\u102C\u101B\u1014\u103A \u1000\u1010\u103A\u1019\u103B\u102C\u1038\u101C\u103E\u100A\u1037\u103A\u1015\u102B\u104B'
          }
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="test-action"]',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">Practice with Mock Tests</h3>
        <p className="text-muted-foreground text-sm">
          Take timed practice tests just like the real interview. You need 6 correct out of 10 to
          pass!
        </p>
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          {
            '\u1010\u1000\u101A\u103A\u1037\u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038\u1014\u103E\u1004\u1037\u103A\u1021\u1010\u1030\u1010\u1030 \u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1016\u103C\u1031\u1015\u102B\u104B \u1041\u1040 \u1001\u102F\u1019\u103E \u1046 \u1001\u102F\u1019\u103E\u1014\u103A\u101B\u1015\u102B\u1019\u100A\u103A\u104B'
          }
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="srs-deck"]',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">Spaced Repetition Review</h3>
        <p className="text-muted-foreground text-sm">
          Review cards at the perfect time using spaced repetition. The system remembers what you
          know and focuses on what you need to practice.
        </p>
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          {
            '\u1021\u1001\u103B\u102D\u1014\u103A\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u101E\u102F\u1036\u1038\u101E\u1015\u103A\u1005\u1014\u1005\u103A\u1016\u103C\u1004\u1037\u103A \u1000\u1010\u103A\u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1015\u103C\u1014\u103A\u101C\u103E\u100A\u1037\u103A\u1015\u102B\u104B \u101E\u1004\u103A\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u101B\u1019\u100A\u1037\u103A\u1021\u101B\u102C\u1000\u102D\u102F \u1021\u102C\u101B\u102F\u1036\u1005\u102D\u102F\u1000\u103A\u1015\u102B\u101E\u100A\u103A\u104B'
          }
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="interview-sim"]',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">Interview Simulation</h3>
        <p className="text-muted-foreground text-sm">
          Practice answering questions out loud, just like a real USCIS interview. Build confidence
          by speaking your answers!
        </p>
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          {
            '\u1010\u1000\u101A\u103A\u1021\u1004\u103A USCIS \u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038\u1000\u1032\u1037\u101E\u102D\u102F\u1037 \u1021\u101E\u1036\u1011\u103D\u1000\u103A\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1015\u102B\u104B \u101E\u1004\u103A\u1037\u1021\u1016\u103C\u1031\u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1021\u101E\u1036\u1011\u103D\u1000\u103A\u1015\u103C\u102E\u1038 \u101A\u102F\u1036\u1000\u103C\u100A\u103A\u1019\u103E\u102F\u1010\u100A\u103A\u1006\u1031\u102C\u1000\u103A\u1015\u102B\u104B'
          }
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="theme-toggle"]',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">Customize Your Experience</h3>
        <p className="text-muted-foreground text-sm">
          Toggle between light and dark mode. Study comfortably day or night!
        </p>
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          {
            '\u1021\u101C\u1004\u103A\u1038\u1014\u103E\u1004\u1037\u103A \u1021\u1019\u103E\u102C\u1004\u103A\u1019\u102F\u1012\u103A \u1015\u103C\u1031\u102C\u1004\u103A\u1038\u101C\u1032\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u101E\u100A\u103A\u104B'
          }
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: 'body',
    content: (
      <div className="text-center">
        <h3 className="font-bold text-xl mb-2">You&apos;re All Set!</h3>
        <p className="text-muted-foreground text-sm">
          Every question you practice brings you closer to your citizenship. You can do this!
        </p>
        <p className="font-myanmar text-muted-foreground mt-2">
          {
            '\u101E\u1004\u103A\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u101E\u1019\u103B\u103E \u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1010\u102D\u102F\u1004\u103A\u1038\u1000 \u101E\u1004\u1037\u103A\u1014\u102D\u102F\u1004\u103A\u1004\u1036\u101E\u102C\u1038\u1016\u103C\u1005\u103A\u1019\u103E\u102F\u1014\u102E\u1038\u1005\u1031\u1015\u102B\u1010\u101A\u103A\u104B \u1000\u1036\u1000\u1031\u102C\u1004\u103A\u1038\u1015\u102B\u1005\u1031!'
          }
        </p>
        <div className="mt-4 text-4xl" role="img" aria-label="celebration">
          <span role="img" aria-hidden="true">
            &#127881;&#127482;&#127480;&#10024;
          </span>
        </div>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
];

interface OnboardingTourProps {
  /** Force run even if completed before (e.g. from Settings replay) */
  forceRun?: boolean;
}

/**
 * Guided onboarding tour for first-time users.
 *
 * Flow:
 * 1. WelcomeScreen renders first (CSS-only flag motif, bilingual)
 * 2. After 2s auto-transition, Joyride tour starts
 * 3. 7 steps highlighting Dashboard features (single-page, no navigation)
 * 4. Custom TourTooltip with progress dots and 3D chunky buttons
 * 5. Tour only runs on /dashboard route
 *
 * data-tour targets required on Dashboard:
 * - data-tour="dashboard" (page shell)
 * - data-tour="study-action" (study button)
 * - data-tour="test-action" (test button)
 * - data-tour="srs-deck" (SRS widget)
 * - data-tour="interview-sim" (interview widget)
 * - data-tour="theme-toggle" (in AppNavigation)
 */
export function OnboardingTour({ forceRun = false }: OnboardingTourProps) {
  const { shouldShow, complete, skip } = useOnboarding();
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();

  const isOnDashboard = location.pathname === '/dashboard';
  const shouldRun = forceRun || shouldShow;

  // Initial state: show welcome screen when tour should run on dashboard
  // Settings replay clears localStorage and navigates to /dashboard,
  // so shouldShow becomes true on fresh mount (no need for useEffect).
  const [showWelcome, setShowWelcome] = useState(shouldRun && isOnDashboard);
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const handleWelcomeComplete = useCallback(() => {
    setShowWelcome(false);
    setRun(true);
  }, []);

  const handleCallback = useCallback(
    (data: CallBackProps) => {
      const { status, action, index, type } = data;

      // Handle step changes
      if (type === EVENTS.STEP_AFTER) {
        setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
      }

      // Handle completion
      if (status === STATUS.FINISHED) {
        complete();
        setRun(false);
      }

      // Handle skip
      if (status === STATUS.SKIPPED) {
        skip();
        setRun(false);
      }
    },
    [complete, skip]
  );

  // Only render on dashboard
  if (!isOnDashboard) return null;

  // Not eligible to show
  if (!shouldRun && !run) return null;

  return (
    <>
      {showWelcome && <WelcomeScreen onComplete={handleWelcomeComplete} />}
      <Joyride
        steps={tourSteps}
        stepIndex={stepIndex}
        run={run}
        continuous
        showSkipButton
        showProgress
        callback={handleCallback}
        disableScrolling={false}
        spotlightClicks
        tooltipComponent={TourTooltip}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip tour',
        }}
        styles={{
          options: {
            primaryColor: 'hsl(217 91% 60%)',
            zIndex: 1000,
          },
          spotlight: {
            borderRadius: 16,
          },
        }}
        floaterProps={{
          disableAnimation: shouldReduceMotion,
        }}
      />
    </>
  );
}

export default OnboardingTour;
