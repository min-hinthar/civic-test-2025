# Phase 3: UI/UX & Bilingual Polish - Research

**Researched:** 2026-02-06
**Domain:** React UI animations, accessibility, bilingual typography, micro-interactions
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Visual Tone & Color Language:**
- Bold & confident aesthetic inspired by Duolingo energy
- Patriotic blue as primary accent - multi-shade blue system (light blue surfaces, medium blue accents, dark blue primary buttons)
- Red accent for patriotic decoration only (stars, stripes, banners) - never for errors or alarming states
- Green for progress bars, completion indicators, and correct answer feedback
- Spacious layout with generous padding and margins
- Wrong answers: soft orange briefly, then immediately shift attention to the explanation/correct answer
- Correct answers: mini celebration with escalating streaks - small sparkle for 1 correct, bigger burst at 3-in-a-row, full confetti + badge + bilingual praise at 5+ and test completion
- Peak celebration (perfect score/milestones): full-screen confetti burst + gold stars + badge unlock animation + bilingual congratulations
- Pill buttons (fully rounded ends), subtle elevation on cards, very rounded border-radius (16px+), bold headings, filled/solid icons
- White answer cards with blue border on hover, elevated shadow
- Bold colored header (blue/primary background)
- Dark mode polished properly
- Illustrated + encouraging empty states with bilingual text

**Motion & Transitions:**
- Animation library: Framer Motion / Motion
- Overall speed: Snappy (150-250ms) for interactions
- Reduced motion: Honor prefers-reduced-motion - keep feedback colors, cut all decorative animation
- Page transitions: Slide + fade combo between pages
- Bottom-sheet slide-up for modals
- Button press: scale down + spring back
- Hover (desktop): scale up + shadow lift
- Test questions: horizontal swipe left/right between questions
- Shimmer animation on skeleton loaders
- Staggered entrance for list items
- Canvas-based particle effects for confetti
- Animated count-up from 0 to final score
- Rolling/odometer number animation for score changes
- 3D card flip for flashcards
- Animated circular arc timer with color thresholds (blue -> yellow -> orange -> red pulse)
- Sliding underline indicator for tabs
- Toasts: bottom center, slide up
- Instant answer feedback (no delay)
- Custom focus rings (thick blue outline)
- Animated flickering flame icon for streaks (Duolingo-style)

**Bilingual Text Presentation:**
- English on top, Burmese below (stacked)
- Burmese text subtly lighter color/weight than English
- Context-dependent sizing
- Key action buttons: always bilingual
- Smaller nav items: primary language only
- All questions and answers: both languages visible
- All error messages, toasts, system text: always bilingual
- Noto Sans Myanmar - self-hosted/bundled for offline PWA support
- Three weights: Regular + Medium + Bold
- Fallback: system Myanmar font (font-display: swap)
- Burmese numerals within Burmese text context
- Quick toggle in header + full language control in settings
- English-only practice mode toggle

**Anxiety-Reducing Patterns:**
- Microcopy tone: Warm coach ("You're doing great - let's keep going!")
- Citizenship-referencing + general encouragement mix
- Rotating variety of encouraging wrong-answer messages
- Timer visible by default with option to hide
- Calming pre-test screen with breathing animation (user-controlled)
- Progress bar + "Question 5 of 10" text count
- Growth-focused test completion (show improvement vs previous)
- Gentle quit confirmation ("Take a break? Your progress will be saved.")
- Icons + colors for color-blind accessibility
- Guided step-by-step tooltip walkthrough on first visit
- Personal dashboard greeting ("Welcome back, [Name]!")
- Acknowledge streak breaks positively
- Gentle, solution-focused error messages

### Claude's Discretion
- Exact blue shade palette values (multi-shade system direction is locked)
- Burmese line break/wrapping handling (CSS vs manual hints)
- Loading skeleton exact layout
- Exact animation easing curves and spring physics
- Badge/trophy designs for milestones
- Specific illustration choices for empty states and onboarding
- Walkthrough tooltip sequence and content
- Confetti particle count and physics

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope
</user_constraints>

## Summary

This phase transforms the existing functional app into a polished, anxiety-reducing, fully bilingual experience using Motion (the renamed Framer Motion library), Radix UI primitives for accessibility, self-hosted Noto Sans Myanmar font, and canvas-based celebration effects. The research confirms all user-specified technologies are well-supported with current versions and established patterns.

The standard approach is to install Motion for React animations (including page transitions via AnimatePresence, gesture support for swipe navigation, and spring physics for tactile feedback), Radix UI for accessible dialogs/toasts/progress bars, and @fontsource/noto-sans-myanmar for offline-compatible Myanmar typography. For celebrations, react-canvas-confetti provides ready-made presets. For onboarding tours, React Joyride offers the most flexible tooltip walkthrough system.

**Primary recommendation:** Install Motion, Radix UI primitives, @fontsource/noto-sans-myanmar, react-canvas-confetti, react-countup, and react-joyride. Build a shared design token system first (colors, spacing, typography), then layer animations and accessibility on top.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion | 11.x | All animations, gestures, page transitions | Renamed from framer-motion; 4.5M+ weekly downloads, React 18+ optimized, AnimatePresence for exit animations |
| @radix-ui/react-dialog | 1.x | Accessible modals (quit confirmation, pre-test) | WAI-ARIA compliant, focus trapping, keyboard nav built-in |
| @radix-ui/react-toast | 1.x | Accessible toast notifications | aria-live regions, swipe dismiss, screen reader priority |
| @radix-ui/react-progress | 1.x | Accessible progress bars | progressbar role, assistive tech context |
| @fontsource/noto-sans-myanmar | 27.x | Self-hosted Myanmar font (400/500/700 weights) | NPM package bundles fonts for offline PWA, OFL-1.1 license |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-canvas-confetti | 2.x | Canvas-based confetti celebrations | Test completion, milestones, streak celebrations |
| react-countup | 6.x | Animated count-up numbers | Score reveal, stat counters |
| react-countdown-circle-timer | 3.x | Circular timer with color transitions | Test timer with animated arc |
| react-joyride | 2.x | Guided tooltip walkthroughs | First-visit onboarding tour |
| react-swipeable | 7.x | Touch swipe gesture detection | Question navigation on mobile |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-countdown-circle-timer | Custom SVG + Motion | Timer library handles color transitions and arc math out-of-box |
| react-joyride | Intro.js / Reactour | Joyride has best React integration and customization |
| react-countup | Motion's AnimateNumber | AnimateNumber is Motion+ only (paid); react-countup is free |
| react-canvas-confetti | tsparticles | canvas-confetti is lighter, single-purpose |

**Installation:**
```bash
pnpm add motion @radix-ui/react-dialog @radix-ui/react-toast @radix-ui/react-progress @fontsource/noto-sans-myanmar react-canvas-confetti react-countup react-countdown-circle-timer react-joyride react-swipeable
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── ui/                    # Base UI components
│   │   ├── Button.tsx         # Animated pill button with variants
│   │   ├── Card.tsx           # Elevated card with hover effects
│   │   ├── Dialog.tsx         # Radix dialog wrapper with animations
│   │   ├── Toast.tsx          # Radix toast wrapper (replaces current)
│   │   ├── Progress.tsx       # Radix progress wrapper
│   │   ├── Skeleton.tsx       # Shimmer skeleton component
│   │   └── CircularTimer.tsx  # Timer with arc animation
│   ├── animations/            # Animation-specific components
│   │   ├── PageTransition.tsx # AnimatePresence wrapper
│   │   ├── Confetti.tsx       # Celebration effects wrapper
│   │   ├── CountUp.tsx        # Animated number wrapper
│   │   └── FlameStreak.tsx    # Animated streak flame
│   ├── bilingual/             # Bilingual text components
│   │   ├── BilingualText.tsx  # Stacked EN/MY text
│   │   ├── BilingualButton.tsx# Button with both languages
│   │   └── BilingualHeading.tsx
│   └── onboarding/            # Tour components
│       └── OnboardingTour.tsx # Joyride configuration
├── hooks/
│   ├── useReducedMotion.ts    # Motion's hook for accessibility
│   └── useOnboarding.ts       # Tour state management
├── styles/
│   ├── globals.css            # Design tokens (already exists)
│   ├── animations.css         # CSS keyframes (shimmer, etc.)
│   └── fonts.css              # Font-face declarations
└── lib/
    └── design-tokens.ts       # Color palette, spacing constants
```

### Pattern 1: Page Transitions with AnimatePresence
**What:** Wrap page content in AnimatePresence for enter/exit animations
**When to use:** _app.tsx or AppShell.tsx for global page transitions
**Example:**
```typescript
// Source: https://motion.dev/docs/react-animate-presence
import { AnimatePresence, motion } from 'motion/react';
import { useLocation } from 'react-router-dom';

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Pattern 2: Reduced Motion Support
**What:** Use Motion's useReducedMotion hook to respect user preferences
**When to use:** Any component with decorative animations
**Example:**
```typescript
// Source: https://motion.dev/docs/react-use-reduced-motion
import { useReducedMotion, motion } from 'motion/react';

function AnimatedButton({ children, onClick }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      onClick={onClick}
      whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}
```

### Pattern 3: Radix Toast with Motion Animation
**What:** Combine Radix accessibility with Motion animations
**When to use:** All toast notifications
**Example:**
```typescript
// Source: https://www.radix-ui.com/primitives/docs/components/toast
import * as Toast from '@radix-ui/react-toast';
import { motion, AnimatePresence } from 'motion/react';

function BilingualToast({ open, message }) {
  return (
    <Toast.Provider swipeDirection="down">
      <AnimatePresence>
        {open && (
          <Toast.Root asChild forceMount>
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="rounded-2xl bg-card p-4 shadow-lg"
            >
              <Toast.Title>{message.en}</Toast.Title>
              <Toast.Description className="font-myanmar text-muted-foreground">
                {message.my}
              </Toast.Description>
            </motion.div>
          </Toast.Root>
        )}
      </AnimatePresence>
      <Toast.Viewport className="fixed bottom-4 left-1/2 -translate-x-1/2" />
    </Toast.Provider>
  );
}
```

### Pattern 4: Swipe Gesture for Questions
**What:** Enable horizontal swipe to navigate between test questions
**When to use:** TestPage question navigation
**Example:**
```typescript
// Source: https://motion.dev/docs/react-gestures
import { motion, useMotionValue, useTransform } from 'motion/react';

function SwipeableQuestion({ question, onNext, onPrev }) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, opacity }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onPrev();
        if (info.offset.x < -100) onNext();
      }}
    >
      {/* Question content */}
    </motion.div>
  );
}
```

### Pattern 5: Self-Hosted Myanmar Font
**What:** Import Myanmar font via Fontsource for offline PWA support
**When to use:** globals.css or _app.tsx
**Example:**
```typescript
// In _app.tsx or layout file
import '@fontsource/noto-sans-myanmar/400.css';
import '@fontsource/noto-sans-myanmar/500.css';
import '@fontsource/noto-sans-myanmar/700.css';

// In globals.css or Tailwind config
.font-myanmar {
  font-family: 'Noto Sans Myanmar', system-ui, sans-serif;
}
```

### Anti-Patterns to Avoid
- **CSS-only page transitions:** Don't use CSS transitions for page changes; AnimatePresence is needed for exit animations
- **Inline animation values:** Extract animation variants to constants for consistency and reduced motion support
- **Non-semantic toast containers:** Use Radix Toast for proper aria-live regions, not custom divs
- **Google Fonts for Myanmar:** Self-host via Fontsource for offline PWA support
- **Blocking animations on answers:** Feedback must be instant; any "reveal" animation should not delay the user seeing the result

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Page transitions | Custom CSS + state | Motion AnimatePresence | Exit animations require library support |
| Toast accessibility | Custom aria-live | Radix Toast | Focus management, screen reader priority levels |
| Circular timer | SVG + setInterval | react-countdown-circle-timer | Color transitions, arc math, requestAnimationFrame |
| Confetti particles | Canvas drawing loop | react-canvas-confetti | Particle physics, performance optimization |
| Animated numbers | setInterval counter | react-countup | Easing, scroll spy, formatting |
| Tooltip walkthrough | Positioned divs | react-joyride | Scrolling, spotlight overlay, step management |
| Swipe detection | Touch event math | react-swipeable or Motion drag | Velocity, threshold, direction detection |
| Focus ring styling | :focus pseudo | :focus-visible + custom ring | Browser defaults clash with design |

**Key insight:** Animation libraries handle edge cases (iOS momentum scrolling, reduced motion, exit animations, GPU acceleration) that take weeks to debug in custom code.

## Common Pitfalls

### Pitfall 1: Animation Jank on Low-End Devices
**What goes wrong:** Animations stutter on older phones, especially during page transitions
**Why it happens:** Animating non-GPU properties (height, top, left) forces CPU layout recalculation
**How to avoid:** Only animate transform and opacity; use `will-change` sparingly
**Warning signs:** Smooth on desktop, stutters on mobile

### Pitfall 2: Exit Animations Not Working
**What goes wrong:** Elements disappear instantly without exit animation
**Why it happens:** AnimatePresence requires a unique key and the exiting child must remain in the tree
**How to avoid:** Use `mode="wait"` and ensure key changes on navigation
**Warning signs:** Entry animations work, exits don't

### Pitfall 3: Reduced Motion Ignored
**What goes wrong:** Users with vestibular disorders experience discomfort
**Why it happens:** Forgot to check useReducedMotion or used CSS-only animations without media query
**How to avoid:** Wrap all motion in useReducedMotion check; use MotionConfig reducedMotion="user"
**Warning signs:** No `prefers-reduced-motion` in CSS or JS

### Pitfall 4: Myanmar Font Not Loading Offline
**What goes wrong:** Myanmar text shows as boxes when offline
**Why it happens:** Google Fonts CDN not cached by service worker
**How to avoid:** Use @fontsource/noto-sans-myanmar and ensure fonts are in precache
**Warning signs:** Works online, breaks offline

### Pitfall 5: Toast Stacking Chaos
**What goes wrong:** Multiple toasts overlap or fight for space
**Why it happens:** No queue management or viewport positioning
**How to avoid:** Use Radix Toast's built-in queue and single Viewport
**Warning signs:** More than 3 toasts visible simultaneously

### Pitfall 6: Onboarding Tour Breaks on Navigation
**What goes wrong:** Tour tooltip points to wrong element after route change
**Why it happens:** DOM element no longer exists or has different position
**How to avoid:** Use React Joyride's controlled mode; reset tour on route change
**Warning signs:** Spotlight highlights nothing or wrong area

### Pitfall 7: Focus Trap Conflicts
**What goes wrong:** User can't escape modal or focus goes to wrong element
**Why it happens:** Multiple focus traps (dialog + toast + tour) competing
**How to avoid:** Use Radix primitives which coordinate focus; close other modals during tour
**Warning signs:** Tab key doesn't cycle correctly

### Pitfall 8: Color Contrast in Dark Mode
**What goes wrong:** Orange feedback color unreadable on dark background
**Why it happens:** Light mode colors copy-pasted without adjustment
**How to avoid:** Define separate dark mode HSL values for all feedback colors
**Warning signs:** WCAG contrast checker fails

## Code Examples

### Shimmer Skeleton Animation
```css
/* Source: Tailwind CSS documentation */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 0%,
    hsl(var(--muted-foreground) / 0.1) 50%,
    hsl(var(--muted)) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### Spring Physics for Buttons (Duolingo-style)
```typescript
// Source: Motion documentation
const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.05, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
  tap: { scale: 0.95 },
};

const springTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 17,
};
```

### Circular Timer with Color Thresholds
```typescript
// Source: react-countdown-circle-timer documentation
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

<CountdownCircleTimer
  isPlaying={!isPaused}
  duration={1200} // 20 minutes
  colors={['#3B82F6', '#EAB308', '#F97316', '#EF4444']}
  colorsTime={[1200, 600, 300, 0]} // blue -> yellow at 50% -> orange at 25% -> red
  strokeWidth={8}
  size={80}
  onComplete={() => handleTimeUp()}
>
  {({ remainingTime }) => (
    <span className="text-lg font-bold">
      {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
    </span>
  )}
</CountdownCircleTimer>
```

### Confetti Celebration
```typescript
// Source: react-canvas-confetti documentation
import Confetti from 'react-canvas-confetti/dist/presets/fireworks';

function CelebrationOverlay({ show, onComplete }) {
  if (!show) return null;

  return (
    <Confetti
      autorun={{ speed: 3, duration: 3000 }}
      onInit={({ conductor }) => {
        // Conductor allows manual control
        conductor.shoot();
      }}
    />
  );
}
```

### Bilingual Text Component
```typescript
// Based on existing BilingualToast pattern
interface BilingualTextProps {
  en: string;
  my: string;
  size?: 'sm' | 'md' | 'lg';
}

function BilingualText({ en, my, size = 'md' }: BilingualTextProps) {
  const sizes = {
    sm: { en: 'text-sm', my: 'text-xs' },
    md: { en: 'text-base', my: 'text-sm' },
    lg: { en: 'text-lg', my: 'text-base' },
  };

  return (
    <div>
      <p className={`font-semibold text-foreground ${sizes[size].en}`}>{en}</p>
      <p className={`font-myanmar text-muted-foreground ${sizes[size].my}`}>{my}</p>
    </div>
  );
}
```

### React Joyride Onboarding Setup
```typescript
// Source: react-joyride documentation
import Joyride, { STATUS } from 'react-joyride';

const tourSteps = [
  {
    target: '.dashboard-greeting',
    content: 'Welcome! This is your personal dashboard.',
    disableBeacon: true,
  },
  {
    target: '.start-test-button',
    content: 'Tap here to begin a practice test.',
  },
  {
    target: '.study-guide-link',
    content: 'Review flashcards to prepare.',
  },
];

function OnboardingTour({ run, onFinish }) {
  return (
    <Joyride
      steps={tourSteps}
      run={run}
      continuous
      showSkipButton
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          zIndex: 10000,
        },
      }}
      callback={({ status }) => {
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
          onFinish();
        }
      }}
    />
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| framer-motion package | motion package | 2024 | Same API, renamed package; import from 'motion/react' |
| exitBeforeEnter prop | mode="wait" | Framer Motion 7 | Breaking change in AnimatePresence |
| Google Fonts CDN | @fontsource self-hosted | 2023+ | Required for offline PWA |
| Custom toast divs | Radix Toast | Standard practice | Accessibility requirements |
| CSS page transitions | AnimatePresence | Standard practice | Exit animations impossible with CSS-only |

**Deprecated/outdated:**
- `framer-motion` package: Still works but renamed to `motion`
- `exitBeforeEnter` prop: Replaced with `mode="wait"`
- Google Fonts for PWA: Use Fontsource for offline support
- `animate-pulse` alone for skeletons: Add shimmer gradient for polish

## Open Questions

1. **Breathing Animation Implementation**
   - What we know: User wants a pre-test breathing animation (expand/contract)
   - What's unclear: Specific timing (4-7-8 technique? simple in-out?)
   - Recommendation: Implement simple expand/contract circle, 4s cycle, user dismisses with "I'm ready" button

2. **Flame Icon Animation**
   - What we know: Duolingo-style flickering flame that grows with streak
   - What's unclear: Exact growth stages and animation keyframes
   - Recommendation: Use Lottie or custom SVG with Motion; 3 stages (small flame, medium, large)

3. **Badge/Trophy Designs**
   - What we know: Need milestone badges for celebrations
   - What's unclear: Visual design (Claude's discretion)
   - Recommendation: Create simple SVG badges with Motion entrance; gold star, ribbon, trophy icons from Lucide

4. **Performance Budget**
   - What we know: Adding animations increases bundle
   - What's unclear: Acceptable bundle size increase
   - Recommendation: Motion is ~12kb gzipped; total animation libraries ~30kb; acceptable for UX gains

## Sources

### Primary (HIGH confidence)
- [Motion for React documentation](https://motion.dev/docs/react-quick-start) - Gestures, AnimatePresence, useReducedMotion
- [Radix UI Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction) - Dialog, Toast, Progress APIs
- [Fontsource Noto Sans Myanmar](https://fontsource.org/fonts/noto-sans-myanmar) - Installation and weights
- [react-countdown-circle-timer](https://github.com/vydimitrov/react-countdown-circle-timer) - Circular timer API
- [react-canvas-confetti](https://github.com/ulitcos/react-canvas-confetti) - Presets and Conductor API

### Secondary (MEDIUM confidence)
- [React Joyride](https://github.com/gilbarbara/react-joyride) - Onboarding tour patterns
- [react-countup](https://www.npmjs.com/package/react-countup) - Animated number component
- [Tailwind CSS skeleton patterns](https://tailwindcss.com/docs/animation) - Shimmer animation keyframes
- [Josh W. Comeau prefers-reduced-motion](https://www.joshwcomeau.com/react/prefers-reduced-motion/) - Accessibility patterns

### Tertiary (LOW confidence)
- Community blog posts on Next.js Pages Router + AnimatePresence integration (implementation details vary)
- Duolingo visual references (no official design system documentation)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official docs and npm
- Architecture: HIGH - Patterns from official documentation
- Pitfalls: MEDIUM - Based on known issues and best practices, not direct experience
- Onboarding: MEDIUM - React Joyride well-documented but specific tour content is TBD

**Research date:** 2026-02-06
**Valid until:** 2026-03-06 (30 days - stable libraries, infrequent breaking changes)
