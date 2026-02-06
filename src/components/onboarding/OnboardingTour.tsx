'use client';

import { useState, useCallback } from 'react';
import Joyride, {
  Step,
  CallBackProps,
  STATUS,
  EVENTS,
  ACTIONS,
} from 'react-joyride';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Tour steps with bilingual content
const tourSteps: Step[] = [
  {
    target: '[data-tour="dashboard"]',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">Welcome to Your Dashboard!</h3>
        <p className="text-muted-foreground">
          This is your home base. Track your progress, see recent tests, and
          find areas to improve.
        </p>
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          ဤသည်မှာ သင့်ပင်မစာမျက်နှာဖြစ်ပါသည်။ သင့်တိုးတက်မှုကို ခြေရာခံပါ။
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="study-guide"]',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">Study with Flashcards</h3>
        <p className="text-muted-foreground">
          Flip through bilingual flashcards to learn all 100 civics questions.
          Tap to reveal answers!
        </p>
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          မေးခွန်း ၁၀၀ လုံးကို လေ့လာရန် ကတ်များလှည့်ပါ။
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="mock-test"]',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">Practice with Mock Tests</h3>
        <p className="text-muted-foreground">
          Take timed practice tests just like the real interview. You need 6
          correct out of 10 to pass!
        </p>
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          တကယ့်အင်တာဗျူးနဲ့အတူတူ စာမေးပွဲဖြေပါ။ ၁၀ ခုမှ ၆ ခုမှန်ရပါမည်။
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="theme-toggle"]',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">Customize Your Experience</h3>
        <p className="text-muted-foreground">
          Toggle between light and dark mode. Study comfortably day or night!
        </p>
        <p className="font-myanmar text-sm text-muted-foreground mt-2">
          အလင်းနှင့် အမှောင်မုဒ် ပြောင်းလဲနိုင်ပါသည်။
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: 'body',
    content: (
      <div className="text-center">
        <h3 className="font-bold text-xl mb-2">You're All Set!</h3>
        <p className="text-muted-foreground">
          Every question you practice brings you closer to your citizenship.
          Good luck!
        </p>
        <p className="font-myanmar text-muted-foreground mt-2">
          သင်လေ့ကျင့်သမျှ မေးခွန်းတိုင်းက သင့်နိုင်ငံသားဖြစ်မှုနီးစေပါတယ်။
          ကံကောင်းပါစေ!
        </p>
        <div className="mt-4 text-4xl" role="img" aria-label="celebration">
          <span role="img" aria-hidden="true">
            &#127881;&#127482;&#127480;&#10024;
          </span>
        </div>
      </div>
    ),
    placement: 'center',
  },
];

interface OnboardingTourProps {
  /** Force run even if completed before */
  forceRun?: boolean;
}

/**
 * Guided tooltip walkthrough for first-time users.
 *
 * Features:
 * - Step-by-step tooltips highlighting key features
 * - Bilingual content (English + Burmese)
 * - Skip button (less prominent) to encourage completion
 * - Persists completion to localStorage
 * - Respects prefers-reduced-motion
 *
 * To add tour targets to your components, use data-tour attributes:
 * ```tsx
 * <div data-tour="dashboard">Dashboard content</div>
 * <button data-tour="study-guide">Study Guide</button>
 * <button data-tour="mock-test">Mock Test</button>
 * <button data-tour="theme-toggle">Toggle Theme</button>
 * ```
 */
export function OnboardingTour({ forceRun = false }: OnboardingTourProps) {
  const { shouldShow, complete, skip } = useOnboarding();
  const shouldReduceMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [run, setRun] = useState(forceRun || shouldShow);

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

  if (!run && !forceRun) return null;

  return (
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
      locale={{
        back: 'Back / နောက်သို့',
        close: 'Close / ပိတ်ပါ',
        last: 'Finish / ပြီးပါပြီ',
        next: 'Next / ရှေ့သို့',
        skip: 'Skip tour',
      }}
      styles={{
        options: {
          primaryColor: 'hsl(217 91% 60%)', // Primary blue
          zIndex: 1000,
        },
        tooltip: {
          borderRadius: 16,
          padding: 20,
        },
        tooltipContent: {
          padding: 0,
        },
        buttonNext: {
          borderRadius: 9999,
          padding: '8px 20px',
          fontWeight: 600,
        },
        buttonBack: {
          borderRadius: 9999,
          padding: '8px 20px',
          marginRight: 8,
        },
        buttonSkip: {
          color: 'hsl(215 18% 35%)', // muted-foreground
          fontSize: 12,
        },
        spotlight: {
          borderRadius: 16,
        },
      }}
      floaterProps={{
        disableAnimation: shouldReduceMotion,
      }}
    />
  );
}

export default OnboardingTour;
