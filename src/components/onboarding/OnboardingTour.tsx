'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Step, CallBackProps } from 'react-joyride';
import { STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useUserState } from '@/contexts/StateContext';
import { totalQuestions } from '@/constants/questions';
import { WelcomeScreen } from './WelcomeScreen';
import { TourTooltip } from './TourTooltip';

/** Inline state picker rendered inside the onboarding tour step */
function StateSelectContent() {
  const { selectedState, setSelectedState, allStates } = useUserState();
  return (
    <div>
      <h3 className="font-bold text-lg mb-2">Select Your State</h3>
      <p className="text-muted-foreground text-sm mb-3">
        Choose your state to see your governor, senators, and capital in study questions.
      </p>
      <select
        value={selectedState || ''}
        onChange={e => setSelectedState(e.target.value || null)}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Select state...</option>
        {allStates.map(s => (
          <option key={s.code} value={s.code}>{s.name}</option>
        ))}
      </select>
      {selectedState && (
        <p className="text-xs text-success mt-2">
          ✓ {allStates.find(s => s.code === selectedState)?.name} selected
        </p>
      )}
      <p className="font-myanmar text-sm text-muted-foreground mt-2">
        လေ့လာမေးခွန်းများတွင် သင့်အုပ်ချုပ်ရေးမှူး၊ အထက်လွှတ်တော်အမတ်များနှင့် မြို့တော်ကို ကြည့်ရှုရန် သင့်ပြည်နယ်ကို ရွေးချယ်ပါ။
      </p>
    </div>
  );
}

/**
 * Dynamically import react-joyride with SSR disabled.
 * react-joyride uses browser APIs (document, window) internally
 * which causes issues during Next.js SSG/SSR pre-rendering.
 */
const Joyride = dynamic(() => import('react-joyride'), { ssr: false });

/**
 * 7-step tour -- all targets are on the Dashboard page.
 * Each step uses disableBeacon: true for immediate display.
 *
 * Note: The theme-toggle step targets AppNavigation which is
 * hidden on mobile (md:block). On mobile, this step will be
 * skipped by react-joyride when the target is not found.
 */
const tourSteps: Step[] = [
  {
    target: 'body',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">Your Dashboard</h3>
        <p className="text-muted-foreground text-sm">
          This is your home base. Track progress, see streaks, and find areas to improve.
        </p>
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          {'ဤသည်မှာ သင့်ပင်မစာမျက်နှာဖြစ်ပါသည်။ တိုးတက်မှုကို ခြေရာခံပါ။'}
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: 'body',
    content: <StateSelectContent />,
    placement: 'center' as const,
    disableBeacon: true,
  },
  {
    target: '[data-tour="study-action"]',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">Study with Flashcards</h3>
        <p className="text-muted-foreground text-sm">
          Flip through bilingual flashcards to learn all {totalQuestions} civics questions. Tap to
          reveal
          answers!
        </p>
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          {`မေးခွန်း ${totalQuestions} လုံးကို လေ့လာရန် ကတ်များလှည့်ပါ။`}
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
          Take timed practice tests just like the real interview. You need 12 correct out of 20 to
          pass!
        </p>
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          {'တကယ့်အင်တာဗျူးနှင့်အတူတူ စာမေးပွဲဖြေပါ။ ၂၀ ခုမှ ၁၂ ခုမှန်ရပါမည်။'}
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
            'အချိန်မှန်ကန်သုံးသပ်စနစ်ဖြင့် ကတ်များကို ပြန်လှည့်ပါ။ သင်လေ့ကျင့်ရမည့်အရာကို အာရုံစိုက်ပါသည်။'
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
            'တကယ်အင် USCIS အင်တာဗျူးကဲ့သို့ အသံထွက်လေ့ကျင့်ပါ။ သင့်အဖြေများကို အသံထွက်ပြီး ယုံကြည်မှုတည်ဆောက်ပါ။'
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
          {'အလင်းနှင့် အမှာင်မုဒ် ပြောင်းလဲနိုင်ပါသည်။'}
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
          {'သင်လေ့ကျင့်သမျှ မေးခွန်းတိုင်းက သင့်နိုင်ငံသားဖြစ်မှုနီးစေပါတယ်။ ကံကောင်းပါစေ!'}
        </p>
        <div className="mt-4 text-4xl" role="img" aria-label="celebration">
          <span role="img" aria-hidden="true">
            &#127881;&#128509;&#10024;
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
 * 2. After 2s auto-transition, waits 800ms for DOM targets to mount
 * 3. 7 steps highlighting Dashboard features (single-page, no navigation)
 * 4. Custom TourTooltip with progress dots and 3D chunky buttons
 * 5. Tour only runs on /dashboard route
 *
 * Fixes applied:
 * - Dynamic import for react-joyride (SSR-safe with Next.js)
 * - 800ms delay after welcome for staggered animations to complete
 * - disableScrollParentFix for better target positioning
 *
 * data-tour targets required on Dashboard:
 * - data-tour="dashboard" (page shell)
 * - data-tour="study-action" (study button)
 * - data-tour="test-action" (test button)
 * - data-tour="srs-deck" (SRS widget)
 * - data-tour="interview-sim" (interview widget)
 * - data-tour="theme-toggle" (in AppNavigation, desktop only)
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

  // Filter out theme-toggle step on mobile — its target is inside desktop-only nav (hidden md:block)
  const steps = useMemo(
    () =>
      typeof window !== 'undefined' && !window.matchMedia('(min-width: 768px)').matches
        ? tourSteps.filter(s => s.target !== '[data-tour="theme-toggle"]')
        : tourSteps,
    []
  );

  // Delay start after welcome completes to ensure DOM targets are mounted
  // Dashboard widgets use staggered motion animations (80ms * ~10 items)
  const handleWelcomeComplete = useCallback(() => {
    setShowWelcome(false);
  }, []);

  // Start tour after welcome screen closes with a delay for DOM readiness
  useEffect(() => {
    if (showWelcome || run) return;
    if (!shouldRun || !isOnDashboard) return;

    // Only start if welcome was just dismissed (shouldRun is true but we're not running yet)
    const timer = setTimeout(() => {
      setRun(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [showWelcome, run, shouldRun, isOnDashboard]);

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
        steps={steps}
        stepIndex={stepIndex}
        run={run}
        continuous
        showSkipButton
        showProgress
        callback={handleCallback}
        disableScrolling={false}
        disableScrollParentFix
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
          ...(shouldReduceMotion ? { hideArrow: true } : {}),
        }}
      />
    </>
  );
}

export default OnboardingTour;
