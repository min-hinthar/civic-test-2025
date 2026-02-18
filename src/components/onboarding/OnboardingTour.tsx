'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Step, CallBackProps } from 'react-joyride';
import { STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useUserState } from '@/contexts/StateContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { totalQuestions } from '@/constants/questions';
import { TourTooltip } from './TourTooltip';

/** Inline state picker rendered inside the onboarding tour step */
function StateSelectContent() {
  const { selectedState, setSelectedState, allStates } = useUserState();
  const { showBurmese } = useLanguage();
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
          <option key={s.code} value={s.code}>
            {s.name}
          </option>
        ))}
      </select>
      {selectedState && (
        <p className="text-xs text-success mt-2">
          ✓ {allStates.find(s => s.code === selectedState)?.name} selected
        </p>
      )}
      {showBurmese && (
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          သင့်ပြည်နယ်အုပ်ချုပ်ရေးမှူး (Governor)၊ အထက်လွှတ်တော်အမတ် (Senator) တွေနဲ့ မြို့တော်ကို
          မေးခွန်းတွေမှာ ပြဖို့ ပြည်နယ်ကို ရွေးပါ။
        </p>
      )}
    </div>
  );
}

/** Step 0: Welcome content with language guard */
function StepWelcome() {
  const { showBurmese } = useLanguage();
  return (
    <div>
      <h3 className="font-bold text-lg mb-2">Welcome to Your Home</h3>
      <p className="text-muted-foreground text-sm">
        This is your home base. Track progress, see streaks, and find areas to improve.
      </p>
      {showBurmese && (
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          ဒီက သင့်ပင်မစာမျက်နှာပါ။ တိုးတက်မှုကို ခြေရာခံပြီး တိုးတက်ရမယ့်နေရာတွေ ရှာပါ။
        </p>
      )}
    </div>
  );
}

/** Step 2: Study content with language guard */
function StepStudy() {
  const { showBurmese } = useLanguage();
  return (
    <div>
      <h3 className="font-bold text-lg mb-2">Study with Flashcards</h3>
      <p className="text-muted-foreground text-sm">
        Flip through bilingual flashcards to learn all {totalQuestions} civics questions. The spaced
        repetition system remembers what you know and focuses on what you need to practice.
      </p>
      {showBurmese && (
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          {`မေးခွန်း ${totalQuestions} ခုကို ကတ်တွေနဲ့ လေ့လာပါ။ သင်သိပြီးသားတွေကို မှတ်ထားပြီး လေ့ကျင့်ရမယ့်အရာတွေကို အာရုံစိုက်ပေးပါတယ်။`}
        </p>
      )}
    </div>
  );
}

/** Step 3: Test content with language guard */
function StepTest() {
  const { showBurmese } = useLanguage();
  return (
    <div>
      <h3 className="font-bold text-lg mb-2">Practice with Mock Tests</h3>
      <p className="text-muted-foreground text-sm">
        Take timed practice tests just like the real interview. You need 12 correct out of 20 to
        pass!
      </p>
      {showBurmese && (
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          တကယ့်အင်တာဗျူးလိုမျိုး စမ်းသပ်စာမေးပွဲ ဖြေပါ။ ၂၀ ခုမှ ၁၂ ခု မှန်ရပါမယ်။
        </p>
      )}
    </div>
  );
}

/** Step 4: Interview content with language guard */
function StepInterview() {
  const { showBurmese } = useLanguage();
  return (
    <div>
      <h3 className="font-bold text-lg mb-2">Interview Simulation</h3>
      <p className="text-muted-foreground text-sm">
        Practice answering questions out loud, just like a real USCIS interview. Build confidence by
        speaking your answers!
      </p>
      {showBurmese && (
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          တကယ့် USCIS အင်တာဗျူးလိုမျိုး အသံထွက်ပြီး လေ့ကျင့်ပါ။ အဖြေတွေကို ပြောကြည့်ပြီး ယုံကြည်မှု
          တည်ဆောက်ပါ။
        </p>
      )}
    </div>
  );
}

/** Step 5: Hub content with language guard */
function StepHub() {
  const { showBurmese } = useLanguage();
  return (
    <div>
      <h3 className="font-bold text-lg mb-2">Track Your Progress</h3>
      <p className="text-muted-foreground text-sm">
        View your study progress, test history, and connect with the community. Everything you need
        to track your journey is here.
      </p>
      {showBurmese && (
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          သင့်လေ့လာမှု တိုးတက်မှု၊ စာမေးပွဲမှတ်တမ်းနဲ့ အသိုင်းအဝိုင်းကို ဒီမှာ ကြည့်နိုင်ပါတယ်။
        </p>
      )}
    </div>
  );
}

/** Step 6: Finish celebration with language guard */
function StepFinish() {
  const { showBurmese } = useLanguage();
  return (
    <div className="text-center">
      <h3 className="font-bold text-xl mb-2">You&apos;re All Set!</h3>
      <p className="text-muted-foreground text-sm">
        Every question you practice brings you closer to your citizenship. You can do this!
      </p>
      {showBurmese && (
        <p className="font-myanmar text-muted-foreground mt-2">
          သင်လေ့ကျင့်တဲ့ မေးခွန်းတိုင်းက နိုင်ငံသားဖြစ်မှုနဲ့ နီးစေပါတယ်။ သင်လုပ်နိုင်ပါတယ်!
        </p>
      )}
      <div className="mt-4 text-4xl" role="img" aria-label="celebration">
        <span role="img" aria-hidden="true">
          &#127881;&#128509;&#10024;
        </span>
      </div>
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
 * Responsive placement helper for nav item steps.
 * Desktop sidebar is on the left, so placement is 'right'.
 * Mobile bottom bar is at the bottom, so placement is 'top'.
 */
function getNavPlacement(): 'right' | 'top' {
  if (typeof window === 'undefined') return 'top';
  return window.innerWidth >= 768 ? 'right' : 'top';
}

/**
 * 7-step tour (0-6) -- targets nav items instead of dashboard widgets.
 * Each step uses disableBeacon: true for immediate display.
 *
 * Steps 0-1: body-centered (welcome + state picker)
 * Steps 2-5: nav item highlights (study, test, interview, hub)
 * Step 6: body-centered celebration
 */
const tourSteps: Step[] = [
  {
    target: 'body',
    content: <StepWelcome />,
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
    target: '[data-tour="nav-study"]',
    content: <StepStudy />,
    placement: getNavPlacement(),
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-test"]',
    content: <StepTest />,
    placement: getNavPlacement(),
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-interview"]',
    content: <StepInterview />,
    placement: getNavPlacement(),
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-hub"]',
    content: <StepHub />,
    placement: getNavPlacement(),
    disableBeacon: true,
  },
  {
    target: 'body',
    content: <StepFinish />,
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
 * 3. 7 steps highlighting nav items (single-page, no navigation)
 * 4. Custom TourTooltip with progress dots and 3D chunky buttons
 * 5. Tour only runs on /home route
 *
 * Fixes applied:
 * - Dynamic import for react-joyride (SSR-safe with Next.js)
 * - 800ms delay after welcome for staggered animations to complete
 * - disableScrollParentFix for better target positioning
 *
 * data-tour targets required on nav items:
 * - data-tour="nav-study" (Study tab)
 * - data-tour="nav-test" (Mock Test tab)
 * - data-tour="nav-interview" (Interview tab)
 * - data-tour="nav-hub" (Progress Hub tab)
 */
export function OnboardingTour({ forceRun = false }: OnboardingTourProps) {
  const { complete, skip } = useOnboarding();
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();

  const isOnHome = location.pathname === '/home';
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = tourSteps;

  // Start the tour when on home and onboarding not yet complete.
  // Checks localStorage directly to handle replay from Settings (stale hook state).
  // Delay ensures DOM targets are mounted after page animations.
  useEffect(() => {
    if (run || !isOnHome) return;
    const isComplete = localStorage.getItem('civic-test-onboarding-complete') === 'true';
    if (isComplete && !forceRun) return;

    // Poll until welcome/what's-new screens are dismissed before starting
    const timer = setInterval(() => {
      if (document.querySelector('[aria-label="Welcome to Civic Test Prep"]')) return;
      clearInterval(timer);
      setRun(true);
      setStepIndex(0);
    }, 800);

    return () => clearInterval(timer);
  }, [run, isOnHome, forceRun]);

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

  // Only render on home page
  if (!isOnHome) return null;

  // Not running and not pending
  if (!run) return null;

  return (
    <>
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
