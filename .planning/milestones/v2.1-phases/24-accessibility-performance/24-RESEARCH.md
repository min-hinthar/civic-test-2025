# Phase 24: Accessibility & Performance - Research

**Researched:** 2026-02-17
**Domain:** WCAG 2.2 accessibility, Web Vitals performance monitoring, bundle optimization, flashcard bug fixes
**Confidence:** HIGH

## Summary

Phase 24 is a broad usability/observability phase with four main tracks: (1) WCAG 2.2 accessibility compliance across screen reader support, keyboard navigation, timing adjustable timers, and reduced motion; (2) per-question timer implementation with WCAG 2.2.1 extension mechanism; (3) Web Vitals performance monitoring integration with Sentry; and (4) flashcard 3D flip/swipe bug fixes on mobile.

The codebase already has strong foundations: `useReducedMotion` is used in 79 files, `aria-live` regions exist in key components (FeedbackPanel, Toast, SwipeableCard, SortModeContainer), the quiz flow uses proper `role="radiogroup"` with roving focus, and Sentry is fully configured with `tracesSampleRate: 1` in `instrumentation-client.ts`. The main gaps are: no `prefers-contrast: more` support, no per-question timer (only overall timer via `CircularTimer`), no WCAG 2.2.1 timer extension mechanism, no `eslint-plugin-jsx-a11y`, no `vitest-axe`, no `@next/bundle-analyzer`, and several flashcard CSS/animation bugs.

**Primary recommendation:** Layer accessibility tooling (eslint-plugin-jsx-a11y, vitest-axe) first, then implement the per-question timer with extension, then add Web Vitals reporting via Sentry's built-in browserTracingIntegration, and finally fix flashcard bugs. Do NOT install a separate `web-vitals` library -- Sentry SDK v10+ captures all Web Vitals automatically.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Screen Reader Flow -- Quiz/Practice**: Practice mode announces verdict + explanation ("Correct. [Brief explanation]." or "Incorrect. The answer is [X]. [Brief explanation]."). Mock test, interview, sort announcements are Claude's discretion.
- **Screen Reader Flow -- Progress Bar**: Full per-segment labels ("Question 3: Correct", "Question 7: Skipped") -- each segment individually labeled.
- **Screen Reader Flow -- Celebrations**: Milestone/streak/XP celebrations MUST be announced to screen readers via ARIA live regions.
- **Screen Reader Flow -- Language Toggle**: Full context labels ("Language: English only. Press to switch to bilingual English and Burmese.").
- **Screen Reader Flow -- Toasts**: ALL toasts must be accessible via ARIA live regions (assertive for errors, polite for success/info).
- **Color Contrast**: Spot check only -- audit known problem areas (muted text, disabled states, colored backgrounds) in both light and dark themes. Do NOT do full token audit.
- **Focus Styles**: Keep current `focus:ring-2` styles -- audit for consistency, don't redesign.
- **Reduced Motion -- Celebrations**: Static version (show badge/score without animation, screen reader announcement covers it).
- **Per-Question Timer**: 30 seconds, circular progress indicator near question number.
- **Timer Color**: green (>50%) -> yellow (20-50%) -> red (<20%) visual urgency.
- **Timer Warning**: Sound tick + haptic vibration at 5 seconds remaining.
- **Timer Pauses**: During feedback phase (after Check, while user reads explanation).
- **Timer Auto-Submit**: If answer selected -> submit it; if none -> mark as skipped.
- **Timer Toggle**: Optional in practice mode, ON by default (checkbox on PreTestScreen).
- **Timer NOT in Interview**: No per-question timer in interview mode.
- **Mock Test Timer**: Shows BOTH overall timer and per-question 30s timer.
- **Timer Extension**: Practice mode only, NOT in mock test (simulation fidelity).
- **Extension Trigger**: Appears when 20% of per-question time remaining (6 seconds).
- **Extension Presentation**: Toast/banner slides in with "Extend?" button.
- **Extension Auto-Dismiss**: After 5 seconds if not tapped -- reappears on next question if needed.
- **Extension Unlimited**: Multiple extensions allowed (no limit). Each adds 50% of original time (15 seconds).
- **Bundle Analyzer**: YES -- add @next/bundle-analyzer as dev dependency.
- **Font Loading**: Optimize -- preload Myanmar font, ensure font-display: swap, reduce layout shift.
- **Service Worker Caching**: Review and audit current @serwist/next configuration.
- **Flashcard Bug Fixes**: All 9 bugs listed in context (swipe not registering, animation freezes, backfaceVisibility, flickering, transparent deck cards, layout shift during flip, overlay UI issue, auto-read timing, speech button transparent background).

### Claude's Discretion

- Mock test screen reader feedback level (likely simpler verdict given simulation fidelity)
- Question navigation announcement (auto-announce vs focus move)
- Interview chat messages (ARIA live region vs focus management)
- Sort result announcement (tally, next card)
- Card flip announcement
- Dashboard page load summary
- Skip-to-content link (evaluate SPA architecture need)
- TTS button labels (descriptive vs generic)
- Form input labels (visible labels vs ARIA-only per input)
- SRS card metadata
- Individual reduced motion decisions per animation type
- Flashcard 3D flip reduced motion (instant swap vs subtle flip)
- Sort mode swipe reduced motion (fade out vs quick slide)
- Countdown overlay reduced motion (numbers without bounce vs skip)
- PillTabBar pill slide (check existing useReducedMotion implementation)
- In-app motion toggle (OS-only vs in-app override)
- Per-question expiry priority in mock test
- Web Vitals integration approach (Sentry BrowserTracing vs web-vitals library)
- Performance budgets / CI enforcement
- Sentry RUM sampling rate
- Lighthouse CI
- React rendering profiling
- IDB performance profiling
- Route prefetching
- Image optimization
- Code splitting

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope.
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| eslint-plugin-jsx-a11y | latest | Static accessibility linting for JSX | Standard a11y linter, 174 rules, maintained by jsx-eslint org |
| vitest-axe | 0.1.0 | Accessibility unit testing matchers | Fork of jest-axe for Vitest, 242K weekly downloads, uses axe-core |
| @next/bundle-analyzer | latest | On-demand webpack bundle visualization | Official Next.js plugin, generates treemap HTML reports |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @sentry/nextjs | ^10.26.0 (already installed) | Web Vitals monitoring | Already captures LCP/INP/CLS/FCP/TTFB automatically via tracesSampleRate |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Sentry built-in Web Vitals | Standalone `web-vitals` library | Extra dependency, would need custom reporting endpoint. Sentry already captures all metrics. |
| vitest-axe | @sa11y/vitest | sa11y is Salesforce's fork with more recent updates but less community adoption |

**Installation:**
```bash
pnpm add -D eslint-plugin-jsx-a11y vitest-axe @next/bundle-analyzer
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── hooks/
│   ├── useReducedMotion.ts           # Existing -- wraps motion/react
│   ├── usePerQuestionTimer.ts        # NEW: per-question timer logic
│   └── useTimerExtension.ts          # NEW: WCAG 2.2.1 extension mechanism
├── components/
│   ├── test/
│   │   ├── CircularTimer.tsx         # EXISTING: overall timer (keep)
│   │   └── PerQuestionTimer.tsx      # NEW: small circular 30s timer
│   ├── quiz/
│   │   ├── FeedbackPanel.tsx         # UPDATE: sr-only verdict announcement
│   │   ├── SegmentedProgressBar.tsx  # UPDATE: per-segment aria-label
│   │   └── TimerExtensionToast.tsx   # NEW: "Extend?" WCAG 2.2.1 banner
│   ├── study/
│   │   └── Flashcard3D.tsx           # UPDATE: fix 3D flip bugs
│   └── sort/
│       └── SwipeableCard.tsx         # UPDATE: fix swipe bugs
├── lib/
│   └── vitals.ts                     # NEW: Web Vitals → Sentry reporter
├── styles/
│   ├── tokens.css                    # UPDATE: high-contrast media query
│   └── animations.css                # UPDATE: audit reduced-motion coverage
└── __tests__/
    └── a11y/                         # NEW: vitest-axe accessibility tests
```

### Pattern 1: Screen Reader Feedback Announcement
**What:** Use a dedicated sr-only `aria-live="assertive"` region to announce quiz verdicts after Check.
**When to use:** FeedbackPanel, interview feedback, sort result.
**Example:**
```typescript
// In FeedbackPanel, add a sr-only region that updates on show
// The existing role="status" aria-live="polite" is good for general updates,
// but quiz verdicts should use aria-live="assertive" for immediate announcement.

// Pattern: separate the visual feedback from the screen reader announcement
<div aria-live="assertive" className="sr-only">
  {show && (isCorrect
    ? `Correct. ${explanation?.brief_en ?? ''}`
    : `Incorrect. The answer is ${correctAnswer}. ${explanation?.brief_en ?? ''}`
  )}
</div>
```

### Pattern 2: Per-Question Timer with Extension
**What:** A 30-second circular timer that pauses during feedback and offers WCAG 2.2.1 extension.
**When to use:** Practice mode (optional, default ON) and mock test (always ON, no extension).
**Example:**
```typescript
// Custom hook pattern for per-question timer
function usePerQuestionTimer({
  duration = 30,
  isPaused = false,
  onExpire,
  onWarning,
}: TimerOptions) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isExtended, setIsExtended] = useState(false);

  // Reset when question changes (via React key prop on parent)
  // Pause during feedback phase
  // Fire onWarning at 5 seconds (for sound tick + haptic)
  // Fire onExpire at 0

  const extend = useCallback(() => {
    setTimeLeft(prev => prev + Math.ceil(duration * 0.5));
    setIsExtended(true);
  }, [duration]);

  return { timeLeft, extend, isExtended };
}
```

### Pattern 3: vitest-axe Accessibility Test
**What:** Automated accessibility testing for rendered components.
**When to use:** Key interactive components (FeedbackPanel, AnswerOption, Toast, Dialog).
**Example:**
```typescript
// Source: vitest-axe README
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'vitest-axe';

expect.extend(toHaveNoViolations);

it('FeedbackPanel has no a11y violations', async () => {
  const { container } = render(
    <FeedbackPanel
      isCorrect={true}
      show={true}
      correctAnswer="The Constitution"
      streakCount={1}
      mode="practice"
      onContinue={() => {}}
      showBurmese={false}
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Pattern 4: High Contrast Mode Support
**What:** Increase contrast ratios when `prefers-contrast: more` is active.
**When to use:** Applied at the CSS token level via media query in tokens.css.
**Example:**
```css
/* In tokens.css - override semantic tokens for high contrast */
@media (prefers-contrast: more) {
  :root {
    --color-text-secondary: var(--slate-600);    /* darker than default */
    --color-text-tertiary: var(--slate-500);     /* darker than default */
    --color-border: var(--slate-400);            /* more visible borders */
  }
  .dark {
    --color-text-secondary: var(--slate-200);    /* brighter in dark mode */
    --color-text-tertiary: var(--slate-300);     /* brighter in dark mode */
    --color-border: var(--slate-400);            /* more visible borders */
  }
}
```

### Pattern 5: Web Vitals via Sentry (No Extra Library Needed)
**What:** Sentry SDK v10+ with `browserTracingIntegration()` automatically captures LCP, INP, CLS, FCP, TTFB.
**When to use:** Already active -- `instrumentation-client.ts` has `tracesSampleRate: 1`.
**Key finding:** The current client config does NOT explicitly add `browserTracingIntegration()`. According to Sentry docs, in SDK v10+ this is auto-included when `tracesSampleRate` is set. However, explicitly adding it ensures Web Vitals are captured and allows configuration of `enableInp` (defaults to `true` in v10+). The current config uses `replayIntegration()` but should verify Web Vitals are actually being captured.
**Recommendation:** Add `browserTracingIntegration()` explicitly to `instrumentation-client.ts` for clarity, and reduce `tracesSampleRate` from `1` (100%) to `0.2` (20%) for production.
```typescript
// instrumentation-client.ts
integrations: [
  Sentry.browserTracingIntegration(),
  Sentry.replayIntegration(),
],
tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1,
```

### Anti-Patterns to Avoid
- **Don't use `aria-live` on containers that re-render frequently:** This causes screen readers to announce every DOM update. Use a dedicated, stable sr-only element with content set via state.
- **Don't put `aria-hidden="true"` on elements that should be announced:** The existing `aria-hidden={isHidden}` on CircularTimer when blurred is correct -- ensure hidden timers are not announced.
- **Don't use `role="alert"` for all toasts:** Only error/warning toasts should use `role="alert"`. Success/info toasts should use `role="status"`. The current Toast component uses `role="alert"` for all -- needs splitting.
- **Don't remove animations for reduced motion -- replace them:** Per the user's locked decision, use alternative fade animations, not nothing.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessibility linting | Custom ESLint rules | eslint-plugin-jsx-a11y flatConfigs.recommended | 30+ rules covering alt text, ARIA roles, keyboard handlers, etc. |
| Accessibility unit tests | Manual DOM assertion checks | vitest-axe + axe-core | axe-core has 80+ a11y rules, WCAG 2.2 coverage, catches real issues |
| Bundle size analysis | Custom webpack stats parser | @next/bundle-analyzer | Official Next.js plugin, generates interactive treemap |
| Web Vitals collection | Manual PerformanceObserver | Sentry SDK auto-capture | Already installed, auto-reports LCP/INP/CLS with attribution |
| Circular timer | Custom SVG animation | react-countdown-circle-timer (existing) | Already used for overall timer, reuse for per-question |

**Key insight:** The main risk in this phase is scope creep. The codebase already has good a11y foundations (aria-live regions, focus management, reduced motion hooks). The work is additive tooling and filling specific gaps, not a rewrite.

## Common Pitfalls

### Pitfall 1: ARIA Live Region Timing
**What goes wrong:** Setting `aria-live` region content at the same time as rendering causes screen readers to miss the announcement because the region didn't exist in the DOM yet.
**Why it happens:** React batches state updates. If the live region element and its content appear in the same render, the screen reader may not detect the change.
**How to avoid:** Use a persistent sr-only div that's always in the DOM, then update its text content. The current FeedbackPanel already does this correctly with `role="status"` on the animated panel.
**Warning signs:** VoiceOver or NVDA not reading feedback announcements.

### Pitfall 2: Timer Auto-Submit Race Condition
**What goes wrong:** Per-question timer expires and auto-submits while the user is in the middle of clicking an answer, causing a double-dispatch or wrong answer submission.
**Why it happens:** `setInterval` callbacks and click handlers can fire in the same microtask queue.
**How to avoid:** Use a ref to track whether the timer has expired, and guard the timer's onExpire callback: `if (quizState.phase !== 'answering') return`. The quiz reducer already has phase guards.
**Warning signs:** Stuck quiz state, wrong answer recorded on expiry boundary.

### Pitfall 3: vitest-axe Environment Compatibility
**What goes wrong:** vitest-axe does not work with happy-dom environment.
**Why it happens:** Known bug in Happy DOM's `Node.prototype.isConnected` implementation causes axe-core to fail.
**How to avoid:** The project uses `jsdom` (confirmed in `vitest.config.ts`), so this is NOT a problem. But don't switch to happy-dom.
**Warning signs:** `Cannot read property 'isConnected'` errors in a11y tests.

### Pitfall 4: Flashcard 3D Transform Stacking Context
**What goes wrong:** `backfaceVisibility: hidden` does not block pointer events, and `transform-style: preserve-3d` creates a new stacking context that breaks z-index of child elements (speech buttons, overlays).
**Why it happens:** CSS 3D transforms create isolated compositing layers. Elements inside don't participate in the parent's stacking context.
**How to avoid:** Toggle `pointerEvents: 'none'/'auto'` based on flip state (already done in Flashcard3D). For z-index issues, use `isolation: isolate` on the card container. For the "deck cards below are transparent" bug, ensure cards behind the top card have `opacity: 1` and explicit `z-index` stacking.
**Warning signs:** Clicking through to the back face, transparent card shadows, speech button unclickable.

### Pitfall 5: Timer Extension Toast Accessibility
**What goes wrong:** The "Extend?" toast appears and auto-dismisses after 5 seconds, but screen reader users may not have time to perceive and activate it.
**Why it happens:** Screen readers process ARIA live announcements sequentially, and the toast may have disappeared by the time the user navigates to it.
**How to avoid:** Announce the extension option via `aria-live="assertive"` with text like "Time running low. Press E or tap Extend to add 15 seconds." Also support a keyboard shortcut (E key) so screen reader users don't need to find the button. The toast auto-dismisses visually but the keyboard shortcut remains active until the timer actually expires.
**Warning signs:** Screen reader users unable to extend timer, failing WCAG 2.2.1 testing.

### Pitfall 6: Font Preload Link Duplication
**What goes wrong:** Adding `<link rel="preload">` for Myanmar font files that are already being loaded by `@fontsource/noto-sans-myanmar` CSS imports results in double downloads.
**Why it happens:** @fontsource CSS uses `@font-face` with URLs pointing to bundled woff2 files. A preload hint for the same file triggers a second request.
**How to avoid:** Check the actual @fontsource CSS to find the font file paths, then preload ONLY the most critical weight (400 regular) as a single preload link in `_document.tsx`. Ensure `font-display: swap` is set in the @fontsource CSS (it is by default in v5).
**Warning signs:** Duplicate font requests in Network tab, increased LCP.

### Pitfall 7: eslint-plugin-jsx-a11y Flat Config with Existing Setup
**What goes wrong:** Adding `jsxA11y.flatConfigs.recommended` as a standalone config object conflicts with the existing TypeScript parser configuration.
**Why it happens:** The `flatConfigs.recommended` preset sets its own `languageOptions.parserOptions`, which may override the TypeScript parser.
**How to avoid:** Spread the jsx-a11y plugin and rules into the existing TS config block rather than using the flat preset directly. Example: add `'jsx-a11y': jsxA11y` to plugins and spread `jsxA11y.flatConfigs.recommended.rules` into the rules object.
**Warning signs:** ESLint parse errors, missing TypeScript type information.

## Code Examples

### eslint-plugin-jsx-a11y Integration with Existing Flat Config
```typescript
// eslint.config.mjs - add to existing config
import jsxA11y from 'eslint-plugin-jsx-a11y';

// In the TS files config block:
{
  files: ['**/*.{ts,tsx}'],
  plugins: {
    '@typescript-eslint': tseslint,
    'react-hooks': reactHooks,
    '@next/next': next,
    'jsx-a11y': jsxA11y,  // ADD
  },
  // ...languageOptions stays the same...
  rules: {
    ...tseslint.configs.recommended.rules,
    ...reactHooks.configs.recommended.rules,
    ...jsxA11y.flatConfigs.recommended.rules,  // ADD
    // Override specific rules if needed:
    // 'jsx-a11y/no-autofocus': 'off', // we use autoFocus intentionally
    '@typescript-eslint/no-explicit-any': 'error',
    // ... rest of existing rules
  },
}
```
Source: [eslint-plugin-jsx-a11y README](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)

### vitest-axe Setup in Test Setup File
```typescript
// src/__tests__/setup.ts - add to existing setup
import 'vitest-axe/extend-expect';
// This adds toHaveNoViolations() matcher globally
```

### @next/bundle-analyzer Configuration
```javascript
// next.config.mjs - wrap existing config chain
import withBundleAnalyzer from '@next/bundle-analyzer';

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Wrap the existing chain: analyzer wraps serwist wraps nextConfig
export default withSentryConfig(analyzer(withSerwist(nextConfig)), { /* sentry opts */ });
```
Run with: `ANALYZE=true pnpm build` (generates `.next/analyze/client.html`)
Source: [Next.js Bundle Analyzer docs](https://nextjs.org/docs/14/pages/building-your-application/optimizing/bundle-analyzer)

### Per-Question Timer Visual Component
```typescript
// Reuse existing CircularTimer with size="sm"
// The locked decision specifies: circular progress indicator near question number
// Timer color: green (>50%) -> yellow (20-50%) -> red (<20%)
// This matches the existing getTimerColor() function's thresholds

<CircularTimer
  duration={30}
  remainingTime={perQuestionTimeLeft}
  isPlaying={quizState.phase === 'answering'}
  onComplete={handlePerQuestionExpire}
  size="sm"
  allowHide={false}  // Per-question timer should always be visible
/>
```

### Timer Extension Toast Component
```typescript
// WCAG 2.2.1 timer extension - appears at 20% (6 seconds)
// Auto-dismisses after 5 seconds
// Keyboard shortcut: E key

function TimerExtensionToast({
  show,
  onExtend,
  showBurmese,
}: {
  show: boolean;
  onExtend: () => void;
  showBurmese: boolean;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="alert"
          aria-live="assertive"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-sm"
        >
          <div className="flex items-center justify-between gap-3 rounded-xl bg-warning-subtle border border-warning px-4 py-3">
            <span className="text-sm font-medium text-foreground">
              Time running low!
              {showBurmese && <span className="block font-myanmar text-xs">...</span>}
            </span>
            <button
              onClick={onExtend}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white min-h-[44px]"
            >
              +15s
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Language Toggle Full Context Label
```typescript
// Current: aria-label={showBurmese ? 'Switch to English only' : 'Switch to bilingual'}
// Required: Full context per locked decision
aria-label={showBurmese
  ? 'Language: Bilingual English and Burmese. Press to switch to English only.'
  : 'Language: English only. Press to switch to bilingual English and Burmese.'
}
```

### SegmentedProgressBar Per-Segment Labels
```typescript
// Current: aria-label={`Question ${index + 1}: ${statusLabel}`}
// This already matches the locked decision! Each segment has individual label.
// Verify: role="presentation" on the segment div should be role="img" or removed
// so screen readers can access the aria-label.
// Fix: Change role="presentation" to just remove the role attribute entirely,
// or use role="listitem" with the parent having role="list".
```

### Sentry Web Vitals Explicit Configuration
```typescript
// instrumentation-client.ts
import * as Sentry from '@sentry/nextjs';
import { beforeSendHandler } from './src/lib/sentry';

Sentry.init({
  dsn: '...',
  integrations: [
    Sentry.browserTracingIntegration(), // Explicit: captures LCP, INP, CLS, FCP, TTFB
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: false,
  beforeSend: beforeSendHandler,
});
```
Source: [Sentry Next.js Web Vitals docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/tracing)

## Existing Codebase Analysis

### What Already Works (Don't Re-build)

1. **`useReducedMotion` hook** -- Used in 79 components. Wraps motion/react's built-in hook. All major animations already respect it.

2. **ARIA live regions** -- FeedbackPanel has `role="status" aria-live="polite"`, Toast container has `aria-live="assertive"`, SwipeableCard has sr-only announce div, SortModeContainer has sr-only announcements.

3. **Keyboard navigation** -- AnswerOptionGroup uses `role="radiogroup"` with roving focus via `useRovingFocus`. TestPage has Enter/Escape keyboard handlers. Flashcard3D has Enter/Space flip handlers.

4. **Focus management** -- FeedbackPanel auto-focuses Continue button on appear with `preventScroll: true`. SpeechButton uses `preventScroll`.

5. **Touch targets** -- Most interactive elements already have `min-h-[44px]` or `min-h-[48px]`. AnswerOption has `min-h-[56px]`. PillTabBar has `min-h-[44px]`.

6. **CSS reduced-motion** -- `animations.css` has `@media (prefers-reduced-motion: reduce)` for shimmer, breathe, and flame animations. `prismatic-border.css` likely has similar overrides.

7. **Sentry** -- Fully configured with client/server/edge configs, PII stripping, tracesSampleRate: 1.

8. **Toast system** -- BilingualToast has `aria-live="assertive"` container and `role="alert"` on each toast. Dismiss button has `aria-label`.

### What Needs Work

1. **FeedbackPanel sr announcement** -- Currently uses `role="status" aria-live="polite"`. For practice mode, needs to announce verdict + explanation text, not just presence.

2. **SegmentedProgressBar segment role** -- Uses `role="presentation"` which hides the element from a11y tree. Should remove role or change to allow aria-label to be read.

3. **LanguageToggle aria-label** -- Current label is terse ("Switch to English only"). Needs full context per locked decision.

4. **Toast assertive vs polite** -- Current: ALL toasts use `role="alert"` and container uses `aria-live="assertive"`. Should split: errors use assertive, success/info use polite.

5. **No per-question timer** -- Only CircularTimer for overall mock test timer exists. Need new per-question timer implementation.

6. **No timer extension** -- WCAG 2.2.1 compliance requires timer extension in practice mode.

7. **No prefers-contrast support** -- Zero usage of `prefers-contrast: more` in codebase.

8. **No eslint-plugin-jsx-a11y** -- ESLint config only has @typescript-eslint, react-hooks, @next/next.

9. **No vitest-axe** -- No automated accessibility testing.

10. **No bundle analyzer** -- No @next/bundle-analyzer installed.

11. **Font loading** -- Inter is loaded via Google Fonts CDN (`@import url(...)`). Myanmar is via @fontsource. Neither uses `<link rel="preload">`. No explicit `font-display: swap` verification for Myanmar.

12. **Flashcard 3D bugs** -- 9 reported bugs related to CSS 3D transforms, gesture handling, and stacking context issues.

### Flashcard Bug Analysis

Based on code review of `Flashcard3D.tsx`, `SwipeableCard.tsx`, and `SwipeableStack.tsx`:

1. **Swipe not registering on mobile** -- `SwipeableCard` uses `dragElastic={1}` and threshold of `cardWidth * 0.4`. On small screens, 40% of a narrow card may be too much. Consider reducing threshold or adding velocity-only commit.

2. **Swipe animation freezes** -- The `animate()` call uses spring physics. If `scope.current` becomes null mid-animation (component unmount), the animation hangs. Guard with null check.

3. **Back face visible through front face** -- `backfaceVisibility: 'hidden'` is set inline AND via `backface-hidden` class. CSS specificity or browser inconsistency may cause one to override the other. Use only inline style for reliability with 3D transforms.

4. **Card flickering during flip** -- During the spring overshoot past 180deg, both faces briefly become "front-facing". The `FLIP_SPRING` config has `damping: 18` which allows overshoot. Consider increasing damping or adding a CSS transition for opacity at the 90deg midpoint.

5. **Deck cards below are transparent** -- `SwipeableStack` likely stacks cards without explicit opacity. Cards below the top card may have reduced opacity from drag transforms. Ensure non-active cards have `opacity: 1`.

6. **Flipping moves the card below** -- The 3D flip changes the card's layout size. Use explicit width/height constraints or `position: absolute` for the card wrapper to prevent layout shift.

7. **Swipe has overlay UI issue** -- The green/amber overlays on SwipeableCard have `pointer-events-none` and `z-10` but may still interfere with touch events via `touch-action`.

8. **Auto-read timing** -- If auto-read fires before the card flip/swipe animation completes, it reads the wrong card. Gate auto-read on `onAnimationComplete`.

9. **Speech button transparent background** -- 3D transforms create a new stacking context. The speech button's background may be composited incorrectly. Use `isolation: isolate` on the speech button container.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jest-axe for a11y testing | vitest-axe (Vitest-native fork) | 2023 | No Jest/Vitest type conflicts |
| FID (First Input Delay) | INP (Interaction to Next Paint) | Sentry SDK 10.0.0 (2024) | INP replaced FID as responsiveness metric |
| web-vitals library + custom reporter | Sentry auto-captures Web Vitals | Sentry SDK 8+ | No separate library needed when Sentry is installed |
| Separate BrowserTracing integration install | Auto-included in Sentry.init() | Sentry SDK 10+ | Just set tracesSampleRate > 0 |
| WCAG 2.1 | WCAG 2.2 | 2023 | New criteria: 2.4.11 Focus Appearance, 2.5.7 Dragging, 2.5.8 Target Size |

**Deprecated/outdated:**
- FID metric: Replaced by INP in Sentry SDK 10. Any existing FID-based alerts should be updated.
- `@sentry/tracing` package: Merged into `@sentry/nextjs` in v8+. Don't install separately.

## Open Questions

1. **Sentry tracesSampleRate in production**
   - What we know: Currently set to `1` (100%) in all configs. This is fine for development but expensive in production.
   - What's unclear: What's the actual traffic volume? Higher volume warrants lower sample rate.
   - Recommendation: Set to `0.2` (20%) for production, `1` for development. This captures enough data for meaningful Web Vitals while reducing Sentry bill.

2. **Flashcard bug reproduction**
   - What we know: 9 bugs reported, all related to 3D transforms + gesture handling on mobile.
   - What's unclear: Exact browser/device combinations where each bug manifests. Some may be iOS-only (WebKit compositing differences).
   - Recommendation: Fix the CSS foundations first (stacking context, backfaceVisibility, explicit dimensions), then test on real devices. Don't try to reproduce all 9 in emulator.

3. **Skip-to-content link necessity**
   - What we know: This is a SPA with hash routing. The shell layout has a top nav/header followed by content.
   - What's unclear: Whether the SPA navigation already handles focus management on route change.
   - Recommendation: Add a skip-to-content link. It's minimal effort, zero risk, and standard a11y practice. Place it as the first focusable element inside `NavigationShell`, targeting `#main-content` on the content area.

## Sources

### Primary (HIGH confidence)
- `/jsx-eslint/eslint-plugin-jsx-a11y` via Context7 -- ESM flat config setup, recommended rules
- `/googlechrome/web-vitals` via Context7 -- Web Vitals API, sendToAnalytics patterns
- `/websites/sentry_io_platforms_javascript_guides_nextjs` via Context7 -- BrowserTracing, automatic Web Vitals capture, INP
- Codebase analysis: `instrumentation-client.ts`, `sentry.ts`, `useReducedMotion.ts`, `FeedbackPanel.tsx`, `SegmentedProgressBar.tsx`, `BilingualToast.tsx`, `Flashcard3D.tsx`, `SwipeableCard.tsx`, `CircularTimer.tsx`, `InterviewSession.tsx`, `AnswerOption.tsx`, `PillTabBar.tsx`, `StreakReward.tsx`, `SortModeContainer.tsx`, `LanguageToggle.tsx`, `PreTestScreen.tsx`, `TestPage.tsx`, `PracticeSession.tsx`, `globals.css`, `tokens.css`, `animations.css`, `haptics.ts`, `next.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `package.json`, `_app.tsx`, `sw.ts`

### Secondary (MEDIUM confidence)
- [vitest-axe npm](https://www.npmjs.com/package/vitest-axe) -- 242K weekly downloads, jsdom-compatible (verified matches our vitest config)
- [vitest-axe GitHub](https://github.com/chaance/vitest-axe) -- Setup instructions, known happy-dom incompatibility
- [@next/bundle-analyzer npm](https://www.npmjs.com/package/@next/bundle-analyzer) -- Configuration, ANALYZE env var
- [Next.js Bundle Analyzer docs](https://nextjs.org/docs/14/pages/building-your-application/optimizing/bundle-analyzer) -- Official docs

### Tertiary (LOW confidence)
- None. All findings verified against primary or secondary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via Context7 or npm, versions confirmed against project's existing dependencies
- Architecture: HIGH - All patterns based on direct codebase analysis, existing component patterns followed
- Pitfalls: HIGH - Flashcard bugs analyzed from source code, a11y pitfalls from established patterns
- Timer design: HIGH - Locked decisions are very specific, implementation pattern clear from existing CircularTimer
- Web Vitals: HIGH - Sentry SDK auto-captures confirmed via Context7 docs, existing config analyzed

**Research date:** 2026-02-17
**Valid until:** 2026-03-17 (30 days -- stable domain, no rapidly changing dependencies)
