# Phase 9: UI Polish & Onboarding - Research

**Researched:** 2026-02-08
**Domain:** UI/UX polish, onboarding flows, design systems, sound effects, sync status
**Confidence:** HIGH

## Summary

Phase 9 is a comprehensive UI overhaul combining four distinct workstreams: (1) wiring the orphaned OnboardingTour component with enhancements, (2) replacing residual red color tokens, (3) surfacing offline sync status, and (4) a full Duolingo-inspired visual overhaul of every page. The codebase already has strong foundations -- react-joyride v2.9.3, design tokens, motion/react springs, canvas-confetti, Web Audio API chime, and the full OfflineContext with sync queue. The main work is enhancing existing components, adding new visual layers (3D buttons, skill tree, mobile bottom nav), and achieving visual consistency across ~14 pages.

The existing design system (design-tokens.ts, globals.css, tailwind.config.js) provides primary blue, success green, warning orange, destructive warm-orange, and patriotic red tokens. The phase must add purple (achievements) and green (success) accent colors, update border-radius/shadow tokens for the "chunkier" Duolingo feel, and implement the 3D button pattern via box-shadow technique.

**Primary recommendation:** Break this phase into 8-12 plans organized by: (1) design system foundation updates, (2) red token audit, (3) onboarding tour, (4) sync status indicator, (5) sound effects system, (6) navigation overhaul, (7-12) page-specific redesigns grouped by complexity. The design system plan MUST come first since all other plans depend on updated tokens.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Enhance existing `react-joyride` OnboardingTour component (built in Phase 3), don't replace
- Add a welcome screen as Step 0 -- centered modal with CSS-only American flag motif (gradients/shapes, no external images)
- Welcome screen is full bilingual (English + Burmese)
- Welcome auto-transitions to tour after 2 seconds (no button CTA)
- Add 2 new tour steps: SRS deck review + Interview simulation (7 steps total)
- All tour steps stay on Dashboard (single-page tour, no auto-navigation)
- Spotlight overlay style with smooth transition between steps (motion/react animations)
- Skip button always visible -- users can bail out at any step
- Motivational bilingual close message on final step
- "Replay onboarding tour" button in Settings page via `forceRun` prop
- Floating sync indicator at bottom-center (toast-like), only appears when items are pending sync
- Shows count + types (e.g., "2 test results, 1 review session pending")
- Icon + number only (language-neutral, no bilingual text needed)
- Auto-sync only -- indicator is informational, no tap-to-sync action
- Animated tick-down as items sync, indicator slides away when empty
- Warning state (orange icon) when sync attempt fails
- No expandable detail on tap -- informational only even in error state
- Red allowed ONLY for: data loss scenarios (delete account, clear history) AND authentication failures (wrong password, session expired)
- Red uses warm red tone (rose/coral, hue ~5-15), not harsh standard red
- Patriotic decorative red (flag motifs, stars) stays standard patriotic red -- decorative, not semantic
- `destructive` token (delete buttons) uses warm red (critical data-loss actions)
- All other error/incorrect states use warning-500 orange
- Form validation errors use warning orange
- Audit scope: own components in `src/` only -- third-party libraries keep defaults
- Design reference: Duolingo -- full Duolingo feel with civic/patriotic identity
- Use `/frontend-design` skill for all UI design and implementation
- More rounded: border-radius 16-20px for cards, 12px for buttons
- Intense gradients + intense shadows on cards for vibrant, high-energy feel
- Page backgrounds: enhanced feTurbulence paper texture (more visible)
- Bolder typography: heading font weights 700-800, larger sizes for punch
- 3D chunky buttons: bottom border/shadow for raised, tactile Duolingo feel
- Add accent colors: green for success, purple for achievements (keep blue as primary)
- Dark mode: same intensity as light mode, equally vibrant gradients/shadows
- Enforce Tailwind spacing utilities -- replace all hardcoded px/rem values
- WCAG AA contrast standard (4.5:1 normal text, 3:1 large text)
- Enforce 44px minimum touch targets on all interactive elements
- Standardize animation values to established spring constants
- Patriotic emojis as mascots: eagle, liberty torch, US flag, etc. (no custom character)
- SVG illustrations for empty states, celebrations, and key screens
- Patriotic emoji states for errors (sad eagle) and offline (flag)
- Animated icon reactions for test feedback: happy star/checkmark for correct, gentle nudge for incorrect + color feedback
- Mobile: bottom tab bar with 5 tabs -- Dashboard, Study, Test, Interview, Progress
- Active tab: colored icon + label (Duolingo pattern)
- Desktop: refreshed sidebar matching Duolingo-inspired aesthetic (icons, rounded items, active highlight)
- Dashboard: Reorganize layout -- readiness score as hero element at top, rethink card arrangement and hierarchy
- Landing page: Full bilingual redesign from the start with patriotic motif, clear CTA, feature previews
- Auth/login page: Full Duolingo-inspired redesign with patriotic motif, welcoming bilingual text
- Test page: Full overhaul -- horizontal progress bar at top + circular timer for countdown, animated icon reactions
- Flashcards/Study Guide: Full overhaul -- category color header strip per USCIS category on each card
- Progress page: Duolingo-style vertical skill tree path with 7 sub-category nodes, sequential unlock (50%+ mastery), bronze/silver/gold rings
- History page: Keep tabs, apply visual refresh
- Settings page: Duolingo visual treatment -- rounded cards, icons, grouped sections
- Social hub: Collaborative feel -- community, encouragement, no competitive shame
- Burmese `font-myanmar` class on all Burmese text elements
- Loading states: standardize all pages to Phase 3 skeleton shimmer pattern
- Empty states: consistent design with bilingual text and encouraging tone
- Responsive: check all pages at mobile (375px), tablet (768px), desktop (1024px+)
- Animation consistency: all use established spring constants from Phase 3
- Micro-interactions everywhere -- all interactive elements get tactile feedback
- More exuberant celebrations: bigger confetti, bouncier animations
- Playful sound effects (bright, cheerful tones -- dings, swoops, celebrations)
- Sound mute toggle in Settings
- Sound effects for: correct answer, incorrect answer, level up, milestone celebration

### Claude's Discretion
- Tour trigger timing (first visit vs first login)
- Tour progress indicator style (dots vs counter)
- Tour back/next button presence
- Tour overlay click behavior
- Tour keyboard accessibility
- Whether to highlight language toggle in a dedicated tour step
- Exact spring constants for new animations
- Specific emoji placement and frequency
- Sound effect implementation (Web Audio API patterns)
- Skill tree path visual design details

### Deferred Ideas (OUT OF SCOPE)
- Daily goal system (like Duolingo's XP target) -- decided against for now, streak system is sufficient motivation
</user_constraints>

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| react-joyride | ^2.9.3 | Onboarding tour with spotlight overlay | Installed, component built but orphaned |
| motion/react | ^12.33.0 | Spring animations for all micro-interactions | Installed, springs defined |
| react-canvas-confetti | ^2.0.7 | Celebration effects (confetti bursts) | Installed, Confetti component exists |
| lucide-react | ^0.475.0 | Icons for navigation, UI elements | Installed, used throughout |
| tailwindcss | ^3.4.17 | Utility-first CSS with design tokens | Installed, configured |
| tailwindcss-animate | ^1.0.7 | CSS animation utilities | Installed |
| clsx | ^2.1.1 | Conditional className composition | Installed, used throughout |

### Supporting (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| idb-keyval | ^6.2.2 | IndexedDB for offline sync queue | Installed, syncQueue.ts uses it |
| react-countdown-circle-timer | ^3.2.1 | Circular timer component | Installed, used in tests |
| recharts | ^3.4.1 | Progress charts | Installed, used in ProgressPage |
| react-swipeable | ^7.0.2 | Swipe gestures for mobile | Installed |

### No New Dependencies Required
All libraries needed for this phase are already installed. Sound effects use the Web Audio API directly (matching the existing `audioChime.ts` pattern), no `use-sound` library needed.

## Architecture Patterns

### Existing Project Structure (Relevant)
```
src/
  AppShell.tsx              # Root router + provider tree
  lib/
    design-tokens.ts        # Color, spacing, timing, radius, springs
    interview/audioChime.ts # Web Audio API singleton pattern
    mastery/categoryMapping.ts # 7 sub-categories, 3 main categories
    pwa/
      offlineDb.ts          # IndexedDB queue for pending results
      syncQueue.ts          # Sync engine with progress callbacks
  styles/
    globals.css             # CSS variables, page-shell, component layers
    animations.css          # Keyframe animations (shimmer, breathe, flame)
  components/
    onboarding/
      OnboardingTour.tsx    # ORPHANED - built but never imported
    pwa/
      SyncStatusIndicator.tsx # Exists but needs redesign for floating style
    ui/
      Button.tsx            # motion/react animated button
      Card.tsx              # motion/react animated card
      Skeleton.tsx          # Shimmer skeleton loader
    celebrations/
      Confetti.tsx          # canvas-confetti wrapper
  hooks/
    useOnboarding.ts        # localStorage persistence for tour state
    useSyncQueue.ts         # Pending count, isSyncing, triggerSync
  contexts/
    OfflineContext.tsx       # pendingSyncCount, isSyncing exposed
  pages/
    Dashboard.tsx           # data-tour="dashboard" exists
    TestPage.tsx            # data-tour="mock-test" exists
    StudyGuidePage.tsx      # data-tour="study-guide" exists
    SettingsPage.tsx        # Needs "replay tour" button
    LandingPage.tsx         # Needs full redesign
    AuthPage.tsx            # Has text-red-600 remnants
    ProgressPage.tsx        # Needs skill tree overhaul
    HistoryPage.tsx         # Visual refresh
    SocialHubPage.tsx       # Collaborative feel
    InterviewPage.tsx       # data-tour target needed
    PracticePage.tsx        # Visual refresh
```

### Pattern 1: Existing OnboardingTour Integration
**What:** The OnboardingTour component exists at `src/components/onboarding/OnboardingTour.tsx` but is never imported into any page or the AppShell. It has 5 steps targeting `[data-tour="dashboard"]`, `[data-tour="study-guide"]`, `[data-tour="mock-test"]`, `[data-tour="theme-toggle"]`, and `body`.
**Current data-tour targets found:**
- `data-tour="dashboard"` in Dashboard.tsx
- `data-tour="study-guide"` in StudyGuidePage.tsx
- `data-tour="mock-test"` in TestPage.tsx
- `data-tour="theme-toggle"` in AppNavigation.tsx
- `data-tour="test-history"` in HistoryPage.tsx (not used by tour)

**Enhancement needed:** Add `data-tour` targets for SRS deck review and Interview simulation on Dashboard page, add welcome modal as Step 0, import into AppShell.

### Pattern 2: Custom Tooltip Component for react-joyride
**What:** react-joyride v2.9.3 supports `tooltipComponent` prop that accepts a React component receiving `TooltipRenderProps`.
**Props received by custom tooltip:**
- `continuous` (boolean) - if tour runs continuously
- `index` (number) - current step position
- `isLastStep` (boolean) - if on final step
- `size` (number) - total steps
- `step` (object) - current step data
- `backProps`, `closeProps`, `primaryProps`, `skipProps` - button handlers
- `tooltipProps` - MUST spread on root element (includes ref)

**Key:** Use custom tooltip to apply Tailwind classes, motion/react animations for transitions, and the Duolingo visual style. The existing `styles` prop approach is limited.

**Confidence:** HIGH - verified from official react-joyride documentation

### Pattern 3: 3D Chunky Button via box-shadow
**What:** Duolingo's signature raised button uses `box-shadow` for the bottom edge, with `translateY` + reduced shadow on active state.
**Implementation:**
```css
/* Normal state - raised appearance */
.chunky-button {
  box-shadow: 0 4px 0 hsl(var(--primary-700));
  transform: translateY(0);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

/* Active/pressed state - pushed down */
.chunky-button:active {
  box-shadow: 0 1px 0 hsl(var(--primary-700));
  transform: translateY(3px);
}
```
**Why box-shadow over border-bottom:** No layout shifts, feels more natural, exactly matches Duolingo's implementation.
**Integration with motion/react:** Can combine with existing spring `whileTap` scale animation. Use motion `whileTap={{ y: 3 }}` with CSS box-shadow transition for the shadow change.

**Confidence:** HIGH - well-documented CSS pattern verified across multiple sources

### Pattern 4: Web Audio API Sound System
**What:** Extend the existing `audioChime.ts` pattern to support multiple distinct sounds.
**Existing pattern (audioChime.ts):**
```typescript
let audioContext: AudioContext | null = null;
export function playChime(): void {
  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === 'suspended') void audioContext.resume();
  // ... oscillator + gain setup
}
```
**Expansion for multiple sounds:** Create a `soundEffects.ts` module with the same lazy AudioContext singleton. Define different frequencies, waveforms, and envelopes for each sound type:
- Correct answer: ascending two-note ding (C5-E5, ~523-659 Hz)
- Incorrect answer: soft descending tone (E4-C4, ~330-262 Hz), low volume
- Level up: ascending arpeggio (C5-E5-G5, quick succession)
- Milestone celebration: triumphant chord (C5+E5+G5 simultaneous)

**Sound mute toggle:** Store in localStorage, check before playing. Global `isSoundMuted()` check at the top of each play function.

**Confidence:** HIGH - extends proven pattern already in codebase

### Pattern 5: Floating Sync Status Indicator
**What:** Redesign the existing `SyncStatusIndicator` from a toolbar button to a floating bottom-center toast.
**Existing:** `SyncStatusIndicator.tsx` uses `useSyncQueue()` hook which provides `pendingCount`, `isSyncing`, `triggerSync`. The `OfflineContext` also exposes `pendingSyncCount` and `isSyncing`.
**Redesign:** Move from `RefreshCw` icon button to a floating `motion.div` at bottom-center with:
- `AnimatePresence` for enter/exit slide animation
- Count display with animated number tick-down
- Orange warning icon when `lastSyncResult?.failed > 0`
- Auto-dismiss via `AnimatePresence` when `pendingCount === 0`
- Remove `triggerSync` onClick (informational only per user decision)

**Key consideration:** Must not overlap with mobile bottom tab bar (add bottom offset when mobile nav is present).

**Confidence:** HIGH - straightforward with existing hooks and motion/react

### Pattern 6: Mobile Bottom Tab Bar
**What:** 5-tab bottom navigation bar for mobile viewports.
**Tabs:** Dashboard, Study, Test, Interview, Progress
**Current nav:** `AppNavigation.tsx` has a hamburger menu for mobile and horizontal links for desktop.
**Implementation:** Create `BottomTabBar.tsx` component shown only on mobile (hidden at `md:` breakpoint). Use `useLocation()` from react-router-dom to determine active tab. Each tab has an icon (from lucide-react) + label, with active state showing colored icon.
**Mounting:** Add to `AppShell.tsx` inside the `<Router>` but outside `<Routes>`, only on authenticated routes.
**Z-index:** Must be below sync indicator floating toast and below onboarding tour overlay.

**Confidence:** HIGH - standard mobile pattern

### Pattern 7: Red Token Audit Approach
**What:** Systematic replacement of `red` CSS classes with appropriate tokens.
**Current red usage found:**
| File | Usage | Replacement |
|------|-------|-------------|
| `fsrsEngine.ts:186` | `bg-red-500` for scheduled_days <= 1 | `bg-warning-500` (due card, not dangerous) |
| `BilingualToast.tsx:131` | `bg-destructive` (already correct - warm orange, not red) | Already correct |
| Auth pages | `text-destructive` for auth errors | Keep - auth failures are allowed to use warm red |
| Password pages | `variant: 'destructive'` for auth toasts | Keep - auth failures are allowed per user decision |

**Only 1 actual `bg-red-500` found** -- in `fsrsEngine.ts`. The destructive token is already defined as warm orange (hue 25) in `globals.css`, so most of the codebase is already correct. However, the user decision says destructive should change to warm RED (hue 5-15) for data-loss actions, which is a DIFFERENT decision than the current warm orange (hue 25).

**CRITICAL FINDING:** The current `--destructive: 25 30% 40%` (light) and `--destructive: 25 25% 45%` (dark) are warm ORANGE. The user now wants destructive to be warm RED (rose/coral, hue 5-15) for actual data-loss scenarios. This means the CSS variables need updating to shift hue from 25 to ~10.

**Confidence:** HIGH - verified by reading globals.css and the CONTEXT.md decision

### Anti-Patterns to Avoid
- **Hardcoded colors instead of tokens:** Never use `text-red-600` directly. Always use `text-destructive`, `text-warning-500`, etc.
- **Breaking the box-shadow 3D button on motion/react:** Don't animate box-shadow with spring physics (janky). Use CSS transition for shadow, motion/react only for transform.
- **Overlapping z-index layers:** Tour overlay (z-1000), floating sync indicator (z-50), bottom tab bar (z-40), page content (z-0). Define a z-index scale.
- **AudioContext per sound call:** Reuse the singleton. Creating new AudioContext per call leads to browser throttling.
- **Layout shift from border-radius changes:** When updating border-radius tokens globally, test all pages at all breakpoints to ensure no overflow clipping or layout breaks.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tour spotlight overlay | Custom overlay div | react-joyride built-in spotlight | Handles scroll, resize, z-index |
| Sound sprite loading | Custom audio file loading | Web Audio API oscillators | No audio files needed, zero network cost |
| Animated number tick-down | Manual counter with setInterval | motion/react `animate` with `useMotionValue` | Smooth spring-based counting |
| SVG illustrations | Complex hand-drawn SVGs | Emoji + simple geometric shapes | User decided patriotic emojis, not custom art |
| Color contrast checking | Manual contrast calculation | Browser DevTools / WCAG reference | Just verify, don't build a checker |
| Bottom tab bar routing | Custom route matching | `useLocation()` from react-router-dom | Already available, exact match needed |

## Common Pitfalls

### Pitfall 1: OnboardingTour Not Showing Because data-tour Targets Don't Exist Yet
**What goes wrong:** Tour steps reference `[data-tour="srs-deck"]` and `[data-tour="interview-sim"]` but Dashboard doesn't have those attributes yet. Joyride silently skips missing targets.
**Why it happens:** Adding tour steps without adding the corresponding data-tour attributes on Dashboard widgets.
**How to avoid:** The plan that adds new tour steps MUST also add the corresponding `data-tour` attributes on Dashboard components (SRSWidget, InterviewDashboardWidget).
**Warning signs:** Tour jumps from step 3 to step 5, skipping steps.

### Pitfall 2: Welcome Modal Blocking Tour Start
**What goes wrong:** If the welcome screen (Step 0) is a separate component and Joyride's `run` prop is set to true while the modal is still visible, the spotlight may try to highlight behind the modal.
**Why it happens:** Welcome screen is Step 0 but NOT a Joyride step -- it's a custom modal that renders before the tour starts.
**How to avoid:** Welcome modal is a separate React component with a 2-second timer. Only set Joyride `run={true}` AFTER the welcome modal completes and unmounts.
**Warning signs:** Spotlight appears behind modal overlay.

### Pitfall 3: React Compiler ESLint Rules Breaking Sound Effects
**What goes wrong:** Sound play functions stored in refs or called in effects trigger `react-hooks/set-state-in-effect` or `react-hooks/refs` rules.
**Why it happens:** The project uses React Compiler ESLint rules which are stricter than standard.
**How to avoid:** Sound functions should be module-level (not hooks), called from event handlers (onClick, onAnimationComplete), never from effects. Follow the existing `playChime()` pattern -- it's a plain function, not a hook.
**Warning signs:** ESLint errors on `ref.current` access during render.

### Pitfall 4: Bottom Tab Bar Overlapping Floating Sync Indicator
**What goes wrong:** Both the bottom tab bar and sync indicator want to live at the bottom of the screen.
**Why it happens:** No z-index/positioning coordination.
**How to avoid:** Sync indicator should use `bottom: calc(env(safe-area-inset-bottom) + 70px)` when bottom tab bar is present. Use a shared constant or CSS variable for tab bar height.
**Warning signs:** Sync indicator hidden behind tab bar on mobile.

### Pitfall 5: Destructive Token Hue Change Breaking Existing Usage
**What goes wrong:** Changing `--destructive` from hue 25 (warm orange) to hue 10 (warm red) makes ALL existing destructive usages suddenly more red, including toast error variants used for sync failures (which should stay orange/warning).
**Why it happens:** Some places use `variant: 'destructive'` for errors that are NOT data-loss (e.g., sync failure, guarded navigation).
**How to avoid:** Before changing the destructive CSS variable, audit ALL usages of `variant: 'destructive'` and `text-destructive`. Reclassify non-data-loss usages to use `variant: 'warning'` or appropriate token. Only authentication failures and data-loss actions should remain destructive.
**Current destructive usages that should change to warning:**
- `OfflineContext.tsx:163` - sync failure toast -> should be warning
- `AppNavigation.tsx:55` - locked navigation toast -> should be warning
- `useSyncQueue.ts:87` - sync failure toast -> should be warning
- `TestPage.tsx:240,283` - test-related errors -> should be warning
- `GoogleOneTapSignIn.tsx:33,93` - auth errors -> KEEP destructive (auth failure)
- `PasswordUpdatePage.tsx:21,33,41` - auth errors -> KEEP destructive (auth failure)

### Pitfall 6: Global Border-Radius Change Causing Overflow Issues
**What goes wrong:** Increasing card border-radius from 16px to 20px causes content clipping in cards with images or tight layouts.
**Why it happens:** Inner elements without matching border-radius or overflow handling clip against the larger outer radius.
**How to avoid:** Apply `overflow-hidden` on card containers when they have child elements that touch edges. Test at mobile widths (375px).
**Warning signs:** Rectangular corners visible inside rounded cards.

### Pitfall 7: feTurbulence Performance on Low-End Devices
**What goes wrong:** Making the feTurbulence SVG filter more visible (higher values) causes rendering lag on mobile devices.
**Why it happens:** SVG filters are CPU-intensive, especially on large backgrounds.
**How to avoid:** Keep `numOctaves` at 3-4 max, use `baseFrequency` around 0.5-0.7. Apply via CSS `filter` on a fixed-position element (not per-card). Consider `will-change: transform` for GPU acceleration.
**Warning signs:** Janky scroll performance on older phones.

### Pitfall 8: useSyncQueue Hook vs OfflineContext Duplication
**What goes wrong:** The new floating sync indicator uses `useSyncQueue()` but the app already has `OfflineContext` providing the same data. Using both creates duplicate sync attempts.
**Why it happens:** Two independent systems polling the same IndexedDB.
**How to avoid:** Use `useOffline()` from `OfflineContext` for the sync indicator, not `useSyncQueue()`. The context is already mounted in AppShell and provides `pendingSyncCount`, `isSyncing`. The standalone `useSyncQueue` hook appears to be an older implementation before the context was created.
**Warning signs:** Double sync toast notifications.

## Code Examples

### Welcome Screen (Step 0) -- CSS-Only American Flag
```tsx
// CSS-only flag motif using gradients -- no external images
function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[1001] flex items-center justify-center bg-background/95 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center max-w-md px-6">
        {/* CSS-only flag motif */}
        <div className="mx-auto mb-6 w-32 h-20 rounded-lg overflow-hidden shadow-lg"
          style={{
            background: `
              repeating-linear-gradient(
                180deg,
                hsl(0 72% 51%) 0px, hsl(0 72% 51%) 6px,
                white 6px, white 12px
              )
            `,
          }}
        >
          <div className="w-12 h-10 bg-[hsl(217,91%,40%)] flex items-center justify-center">
            <span className="text-white text-xs">&#9734;</span>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-foreground mb-2">
          Welcome to Civic Test Prep!
        </h1>
        <p className="font-myanmar text-lg text-muted-foreground">
          {/* Burmese welcome */}
        </p>
      </div>
    </motion.div>
  );
}
```

### 3D Chunky Button Style
```tsx
// Extend existing Button component with chunky variant
const chunkyVariant = clsx(
  'bg-primary text-primary-foreground',
  'shadow-[0_4px_0_hsl(var(--primary-700))]',
  'hover:shadow-[0_4px_0_hsl(var(--primary-800))]',
  'active:shadow-[0_1px_0_hsl(var(--primary-800))] active:translate-y-[3px]',
  'transition-[box-shadow,transform] duration-100'
);
```

### Sound Effects Module
```typescript
// src/lib/audio/soundEffects.ts
// Extends audioChime.ts pattern with multiple sound types

const SOUND_MUTE_KEY = 'civic-prep-sound-muted';

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    if (!audioContext) audioContext = new AudioContext();
    if (audioContext.state === 'suspended') void audioContext.resume();
    return audioContext;
  } catch {
    return null;
  }
}

function isMuted(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(SOUND_MUTE_KEY) === 'true';
}

export function playCorrect(): void {
  if (isMuted()) return;
  const ctx = getContext();
  if (!ctx) return;
  // Ascending two-note: C5 (523Hz) -> E5 (659Hz)
  playNote(ctx, 523, 0, 0.15);
  playNote(ctx, 659, 0.12, 0.15);
}

export function playIncorrect(): void {
  if (isMuted()) return;
  const ctx = getContext();
  if (!ctx) return;
  // Soft descending: E4 (330Hz) -> C4 (262Hz), lower volume
  playNote(ctx, 330, 0, 0.2, 0.15);
  playNote(ctx, 262, 0.15, 0.3, 0.15);
}

function playNote(
  ctx: AudioContext,
  freq: number,
  delay: number,
  duration: number,
  gain = 0.25
): void {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gainNode.gain.setValueAtTime(gain, ctx.currentTime + delay);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + delay + duration
  );
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}
```

### Floating Sync Indicator
```tsx
// Use OfflineContext, NOT useSyncQueue (avoid duplication)
import { useOffline } from '@/contexts/OfflineContext';
import { AnimatePresence, motion } from 'motion/react';

function FloatingSyncIndicator() {
  const { pendingSyncCount, isSyncing } = useOffline();
  const show = pendingSyncCount > 0 || isSyncing;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 ..."
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Icon + count */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Custom Joyride Tooltip
```tsx
// Custom tooltip matching Duolingo aesthetic
import type { TooltipRenderProps } from 'react-joyride';

function TourTooltip({
  continuous,
  index,
  isLastStep,
  size,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
}: TooltipRenderProps) {
  return (
    <div {...tooltipProps} className="bg-card rounded-2xl shadow-2xl p-5 max-w-sm border border-border/60">
      {/* Progress dots */}
      <div className="flex gap-1 mb-3">
        {Array.from({ length: size }).map((_, i) => (
          <div key={i} className={clsx(
            'h-1.5 rounded-full transition-all',
            i <= index ? 'bg-primary-500 w-6' : 'bg-muted w-3'
          )} />
        ))}
      </div>

      {/* Step content */}
      <div>{step.content}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <button {...skipProps} className="text-xs text-muted-foreground">
          Skip
        </button>
        <div className="flex gap-2">
          {index > 0 && (
            <button {...backProps} className="px-4 py-2 rounded-full text-sm">
              Back
            </button>
          )}
          <button {...primaryProps}
            className="px-4 py-2 rounded-full bg-primary-500 text-white text-sm font-semibold shadow-[0_3px_0_hsl(224,76%,48%)] active:translate-y-[2px] active:shadow-[0_1px_0_hsl(224,76%,48%)]"
          >
            {isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

## State of the Art

| Old Approach (Current) | New Approach (Phase 9) | Impact |
|------------------------|------------------------|--------|
| Flat buttons with hover scale | 3D chunky buttons with box-shadow depth | Tactile Duolingo feel |
| Hamburger menu on mobile | Bottom tab bar with 5 tabs | Better mobile UX, faster navigation |
| `--destructive: 25 30% 40%` (warm orange) | `--destructive: 10 50% 45%` (warm red/coral) | Proper semantic differentiation from warning |
| border-radius 16px cards | border-radius 20px cards, 12px buttons | Rounder, friendlier Duolingo aesthetic |
| Subtle card shadows | Intense gradients + intense shadows | Vibrant, high-energy feel |
| Single chime sound | 4+ distinct sound effects with mute toggle | Gamified feedback like Duolingo |
| OnboardingTour orphaned | Tour integrated in AppShell with welcome screen | First-time user guidance |
| SyncStatusIndicator as toolbar icon | Floating bottom-center toast with animations | Visible, informational sync status |
| Top nav with text links | Desktop sidebar + mobile bottom tabs | Modern navigation pattern |

## Key Codebase Facts

### Existing Design Token Structure
- **Colors:** `src/lib/design-tokens.ts` exports `colors`, `spacing`, `timing`, `radius`, `springs`
- **CSS Variables:** `src/styles/globals.css` defines `--primary-*`, `--success`, `--warning`, `--destructive`, `--patriotic-red`
- **Tailwind Config:** `tailwind.config.js` maps CSS variables to utility classes
- **All three must be updated in sync** when changing design tokens

### CSS Category Colors (for flashcard header strips)
- **American Government** (3 sub-cats): blue (`blue-500`)
- **American History** (3 sub-cats): amber (`amber-500`)
- **Integrated Civics** (1 sub-cat): emerald (`emerald-500`)
- Defined in `src/lib/mastery/categoryMapping.ts` as `CATEGORY_COLORS`

### 7 Sub-Category Nodes for Skill Tree
1. Principles of American Democracy (12 questions)
2. System of Government (35 questions)
3. Rights and Responsibilities (10 questions)
4. Colonial Period and Independence (13 questions)
5. 1800s (7 questions)
6. Recent American History (10 questions)
7. Symbols and Holidays (13 questions)

### Existing Spring Constants
```typescript
springs = {
  button: { type: 'spring', stiffness: 400, damping: 17 },
  gentle: { type: 'spring', stiffness: 300, damping: 20 },
  bouncy: { type: 'spring', stiffness: 500, damping: 15 },
};
```

### AppShell Provider Hierarchy
```
ErrorBoundary > OfflineProvider > LanguageProvider > ThemeProvider > ToastProvider > AuthProvider > SocialProvider > SRSProvider > Router
```
OnboardingTour should be mounted inside Router (needs route context) but could be at the Router level or inside specific pages.

### Confirmed Orphaned Component
`src/components/onboarding/OnboardingTour.tsx` -- exported via `src/components/onboarding/index.ts` but NEVER imported by any page or AppShell. The `useOnboarding` hook and localStorage key `civic-test-onboarding-complete` are ready but unused.

### font-myanmar Usage
233 occurrences across 57 files. Already widely applied but needs audit to ensure ALL Burmese text has the class.

## Recommended Plan Decomposition

Based on scope analysis, recommended plan breakdown:

1. **Design System Foundation** (~30 min) -- Update tokens: destructive hue shift, add purple/green accent tokens, 3D button shadow tokens, updated radius. Update globals.css, design-tokens.ts, tailwind.config.js in sync.

2. **Red Token Audit + Destructive Reclassification** (~20 min) -- Change `bg-red-500` in fsrsEngine.ts, reclassify non-data-loss destructive usages to warning, verify BilingualToast error variant.

3. **Sound Effects System** (~25 min) -- Create `soundEffects.ts` extending audioChime pattern, add mute toggle to Settings, wire into test/SRS/celebration callbacks.

4. **Onboarding Tour Enhancement** (~40 min) -- Welcome screen Step 0, 2 new tour steps, custom Joyride tooltip, mount in AppShell, Settings replay button, add data-tour targets.

5. **Sync Status Indicator Redesign** (~25 min) -- Floating bottom-center toast, AnimatePresence animations, warning state, consume OfflineContext.

6. **Navigation Overhaul** (~40 min) -- Mobile bottom tab bar, desktop sidebar refresh, AppNavigation restructure.

7. **Landing + Auth Page Redesign** (~45 min) -- Full bilingual landing page with patriotic motif, auth page Duolingo-inspired redesign.

8. **Dashboard + Settings Overhaul** (~40 min) -- Dashboard hero readiness score, card rearrangement, Settings Duolingo visual treatment, all with 3D buttons.

9. **Test + Practice Page Overhaul** (~40 min) -- Horizontal progress bar, animated icon reactions, 3D buttons, sound integration.

10. **Study Guide + Flashcard Overhaul** (~35 min) -- Category color header strips, enhanced card designs, 3D flip interaction.

11. **Progress Page Skill Tree** (~45 min) -- Vertical skill tree path, 7 nodes, sequential unlock, bronze/silver/gold rings, mastery-based progression.

12. **History + Social + Final Audit** (~35 min) -- History visual refresh, Social hub collaborative feel, comprehensive cross-page audit (dark mode, responsive, animations, touch targets, font-myanmar).

## Open Questions

1. **Tour trigger: first visit vs first login?**
   - What we know: `useOnboarding` checks localStorage key `civic-test-onboarding-complete`. The tour was designed for Dashboard (protected route requiring auth).
   - Recommendation: Trigger on first login (first visit to Dashboard after auth), not on landing page. The tour targets Dashboard elements which only exist after login.
   - Confidence: HIGH

2. **Desktop sidebar vs enhanced top nav?**
   - What we know: Context says "refreshed sidebar matching Duolingo-inspired aesthetic" for desktop. Current app uses a top navbar.
   - What's unclear: Whether this means converting the top navbar to a left sidebar entirely, or keeping the top bar with a sidebar-like component.
   - Recommendation: Keep AppNavigation as top bar for desktop (consistent with current app) but style it in Duolingo fashion (rounder items, icons, active highlight). A full sidebar would require significant layout restructuring that may not be worth the effort for this phase. If the user specifically wants a left sidebar, it should be a separate plan.
   - Confidence: MEDIUM -- user said "sidebar" but a full layout restructure is very large scope

3. **Warm red hue for destructive: exact value?**
   - What we know: User said "rose/coral, hue ~5-15". Current destructive is hue 25 (warm orange).
   - Recommendation: Use hue 10, saturation 50%, lightness 45% for light mode (warm coral-red). This gives a distinct but not alarming red. Dark mode: hue 10, saturation 45%, lightness 55%.
   - Confidence: MEDIUM -- needs visual validation

4. **How to handle existing `variant: 'destructive'` toast calls after hue change?**
   - What we know: Several places use `variant: 'destructive'` for non-data-loss errors (sync failures, navigation locks). These should NOT show red.
   - Recommendation: Add `variant: 'warning'` to the Radix toast system (it currently only supports 'default' | 'destructive'). Reclassify non-data-loss error toasts to 'warning'. This requires updating `use-toast.ts` type definitions and `Toast.tsx` styling.
   - Confidence: HIGH -- clear pattern, existing warning token available

## Sources

### Primary (HIGH confidence)
- Codebase files: `src/components/onboarding/OnboardingTour.tsx`, `src/lib/design-tokens.ts`, `src/styles/globals.css`, `src/lib/interview/audioChime.ts`, `src/components/pwa/SyncStatusIndicator.tsx`, `src/contexts/OfflineContext.tsx`, `src/AppShell.tsx`
- [React Joyride Props Documentation](https://docs.react-joyride.com/props)
- [React Joyride Custom Components Documentation](https://docs.react-joyride.com/custom-components)

### Secondary (MEDIUM confidence)
- [Josh W. Comeau - 3D Button with CSS](https://www.joshwcomeau.com/animation/3d-button/) -- box-shadow technique for Duolingo-style buttons
- [Duolingo Design System on Figma Community](https://www.figma.com/community/file/1460744749282136015/duolingo-design-system) -- design reference

### Tertiary (LOW confidence)
- [use-sound React Hook](https://github.com/joshwcomeau/use-sound) -- referenced but NOT recommended (Web Audio API oscillators preferred per existing codebase pattern)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and in use
- Architecture patterns: HIGH -- all patterns verified from existing codebase and official docs
- Red token audit: HIGH -- only 1 actual red class found, destructive already partially correct
- Onboarding integration: HIGH -- component exists, just needs mounting and enhancement
- Sound effects: HIGH -- extends proven audioChime.ts pattern
- Navigation overhaul: MEDIUM -- sidebar vs top bar needs clarification
- Page-specific redesigns: MEDIUM -- large scope, designs not yet validated
- Skill tree: MEDIUM -- novel component, design details at Claude's discretion

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (stable stack, no version changes expected)
