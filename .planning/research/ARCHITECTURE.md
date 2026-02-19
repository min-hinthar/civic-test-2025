# Architecture Research: UX Elevation -- Celebration, Gesture, Transition & Consistency Systems

**Domain:** Bilingual Civics Test Prep PWA -- Duolingo-level UX polish integration
**Researched:** 2026-02-19
**Confidence:** HIGH (based on direct codebase analysis of existing animation system, component inventory, provider hierarchy, and motion/react v12.33.0 API surface)

---

## Executive Summary

The UX elevation milestone introduces five architectural capabilities: celebration animations, gesture systems, screen transition choreography, visual consistency enforcement, and an About page. The critical insight from codebase analysis is that **the existing architecture already has strong foundations for all five** -- the work is primarily about extracting shared abstractions and filling gaps, not building new infrastructure from scratch.

The codebase already has:
- **Confetti** (`react-canvas-confetti`) with 3 intensity levels and a `useConfetti` hook
- **Spring presets** (`SPRING_BOUNCY/SNAPPY/GENTLE`) in `motion-config.ts`
- **Page transitions** (`PageTransition.tsx`) with direction-aware slide + scale
- **Gesture handling** (`SwipeableCard.tsx`) with full drag + fling physics
- **Sound effects** (14 functions in `soundEffects.ts`) via Web Audio API
- **Reduced motion** (`useReducedMotion`) respected consistently across all animations

What's missing: a **unified celebration orchestrator** that coordinates confetti + sound + haptics + visual feedback as a single API, a **gesture abstraction layer** for reusable swipe/pull-to-refresh patterns beyond the sort mode, **richer transition choreography** with shared element animations and per-route transition variants, a **visual consistency audit** system, and the **About page** itself.

**Key architectural principle: Extend, don't replace.** Every new capability must compose with the existing provider hierarchy, design token system, and motion/react patterns already in use.

---

## Current Architecture Inventory

### Animation System (As-Built)

```
src/lib/motion-config.ts          -- Spring presets (BOUNCY, SNAPPY, GENTLE) + stagger timing
src/hooks/useReducedMotion.ts      -- Wraps motion/react's useReducedMotion
src/styles/animations.css          -- CSS keyframes (shimmer, pulse-glow, fade-in-up, breathe, flame)
src/components/animations/
  PageTransition.tsx               -- Direction-aware slide+scale with AnimatePresence
  StaggeredList.tsx                -- StaggeredList, StaggeredItem, StaggeredGrid, FadeIn
src/components/celebrations/
  Confetti.tsx                     -- 3 intensity levels (sparkle, burst, celebration) + useConfetti hook
  CountUpScore.tsx                 -- Animated score counter + OdometerNumber
```

### Gesture System (As-Built)

```
src/components/sort/SwipeableCard.tsx  -- Full Tinder-style drag with:
  - useMotionValue + useTransform for drag position
  - useAnimate for imperative fling/snap-back
  - Velocity-based commit thresholds
  - Green/amber overlay zones
  - Safety timeouts for animation hangs
  - Reduced motion: button-initiated linear slides
```

### Sound Effects System (As-Built)

```
src/lib/audio/soundEffects.ts  -- 14 sound functions:
  playCorrect, playIncorrect, playLevelUp, playMilestone,
  playSwoosh, playCountdownTick, playCountdownGo,
  playSkip, playStreak, playPanelReveal, playCompletionSparkle,
  playFling, playKnow, playDontKnow, playMasteryComplete,
  playTimerWarningTick
  + mute/unmute management via localStorage
```

### Existing Celebration Surfaces

| Surface | Components | Celebration Type |
|---------|-----------|-----------------|
| Test results | `TestResultsScreen` | CountUpScore + Confetti (celebration/burst) + playMilestone/playLevelUp |
| Mastery milestone | `MasteryMilestone` | Dialog + Confetti (sparkle/burst/celebration) + MasteryBadge |
| Streak reward | `StreakReward` | Floating badge + playStreak (>=10) |
| XP popup | `XPPopup` | Float-up "+X XP" text |
| Correct answer | `FeedbackPanel` | Green flash + playCorrect |

### Provider Hierarchy (AppShell.tsx)

```
ErrorBoundary
  LanguageProvider
    ThemeProvider
      TTSProvider
        ToastProvider
          OfflineProvider
            AuthProvider
              SocialProvider
                SRSProvider
                  StateProvider
                    BrowserRouter
                      NavigationProvider
                        NavigationShell
                          PageTransition  <-- animation boundary
                            Routes (14 routes)
                        PWAOnboardingFlow
                        OnboardingTour
                        GreetingFlow
                        SyncStatusIndicator
```

### Design Token Architecture

```
tokens.css (CSS custom properties)
  :root   -- primitives (blue, purple, green, amber, red, slate, etc.)
  :root   -- semantic tokens (surface, text, primary, success, warning, etc.)
  :root   -- non-color tokens (spacing, radius, shadows, motion, glass, typography)
  .dark   -- dark theme overrides (semantic tokens only)
  @media (prefers-contrast: more) -- high contrast adjustments

globals.css
  glass-light / glass-medium / glass-heavy  -- 3-tier glass-morphism
  glass-card / glass-panel / glass-nav      -- composable glass utilities
  chunky-shadow-*                           -- Duolingo-style 3D button shadows
  prismatic-border.css                      -- Animated rainbow border (conic-gradient)
```

---

## Recommended Architecture: New Capabilities

### 1. Celebration Orchestrator

**Problem:** Celebrations are currently assembled ad-hoc in each component (TestResultsScreen manually fires confetti + sound, MasteryMilestone manually fires confetti + dialog, etc.). There's no single API for "celebrate at intensity X with coordinated audio + visual + haptic feedback."

**Solution: `useCelebration` hook + `CelebrationOverlay` component**

```
src/lib/celebrations/
  celebrationOrchestrator.ts   -- Core orchestration logic
  haptics.ts                   -- Navigator.vibrate() wrapper with patterns
  types.ts                     -- CelebrationEvent, CelebrationLevel types

src/hooks/useCelebration.ts    -- Hook: celebrate(level, options?)
src/components/celebrations/
  CelebrationOverlay.tsx       -- Portal-mounted overlay (confetti canvas + effects)
  StarBurst.tsx                -- SVG/canvas star burst effect (lighter than confetti)
  SuccessCheckmark.tsx         -- Animated checkmark with draw-on effect
```

**Architecture:**

```typescript
// celebrationOrchestrator.ts
export type CelebrationLevel = 'micro' | 'small' | 'medium' | 'large' | 'epic';

export interface CelebrationConfig {
  level: CelebrationLevel;
  sound?: keyof typeof soundMap;     // Maps to soundEffects.ts functions
  confetti?: 'sparkle' | 'burst' | 'celebration' | false;
  haptic?: 'light' | 'medium' | 'heavy' | false;
  visual?: 'checkmark' | 'starburst' | 'glow' | false;
}

// Preset configurations -- one place to tune all celebrations
const PRESETS: Record<CelebrationLevel, CelebrationConfig> = {
  micro:  { level: 'micro',  sound: 'correct',      confetti: false,         haptic: 'light',  visual: 'checkmark' },
  small:  { level: 'small',  sound: 'levelUp',      confetti: 'sparkle',     haptic: 'light',  visual: 'starburst' },
  medium: { level: 'medium', sound: 'milestone',     confetti: 'burst',       haptic: 'medium', visual: 'starburst' },
  large:  { level: 'large',  sound: 'milestone',     confetti: 'celebration', haptic: 'medium', visual: 'glow' },
  epic:   { level: 'epic',   sound: 'masteryComplete', confetti: 'celebration', haptic: 'heavy', visual: 'glow' },
};
```

```typescript
// useCelebration.ts (hook)
export function useCelebration() {
  const shouldReduceMotion = useReducedMotion();

  const celebrate = useCallback((level: CelebrationLevel, overrides?: Partial<CelebrationConfig>) => {
    const config = { ...PRESETS[level], ...overrides };

    // Sound (always plays unless muted)
    if (config.sound) playSoundByKey(config.sound);

    // Haptics (only on supported devices)
    if (config.haptic && !shouldReduceMotion) triggerHaptic(config.haptic);

    // Visual effects dispatched via custom event to CelebrationOverlay
    if (!shouldReduceMotion) {
      window.dispatchEvent(new CustomEvent('celebration', { detail: config }));
    }
  }, [shouldReduceMotion]);

  return { celebrate };
}
```

**Integration point:** `CelebrationOverlay` mounts once in `AppShell.tsx`, after `NavigationProvider`, listening for `celebration` CustomEvents. No new React Context needed -- uses DOM events for zero-coupling.

**Why not a Context:** Celebrations are fire-and-forget. They don't need to share state across components. DOM CustomEvent avoids adding another provider to the already-deep hierarchy.

### 2. Gesture Abstraction Layer

**Problem:** `SwipeableCard` has excellent gesture code, but it's tightly coupled to the sort-mode use case. Horizontal swipe patterns could be reused for dismissing cards, navigating between flashcards, or pull-to-refresh.

**Solution: Extract reusable gesture primitives from motion/react's existing API**

```
src/hooks/gestures/
  useSwipeDismiss.ts    -- Horizontal swipe-to-dismiss with threshold + velocity
  useSwipeNavigation.ts -- Left/right swipe for prev/next navigation
  useLongPress.ts       -- Long press detection with haptic feedback
  usePullAction.ts      -- Vertical pull gesture (pull-to-refresh pattern)
  gestureConfig.ts      -- Shared thresholds and spring configs
```

**Key design decisions:**

1. **Use motion/react's built-in drag, not @use-gesture.** The project already depends on motion/react v12.33.0 which provides `drag`, `useMotionValue`, `useTransform`, and `useAnimate`. Adding `@use-gesture` would create a second gesture system. motion/react's drag API is sufficient for all planned gestures.

2. **Gesture hooks return motion props, not rendered elements.** This composability pattern lets any component become swipeable:

```typescript
// useSwipeDismiss.ts
export function useSwipeDismiss(onDismiss: () => void, options?: SwipeDismissOptions) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  const [scope, animate] = useAnimate();

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const threshold = options?.threshold ?? 100;
    const velocityThreshold = options?.velocityThreshold ?? 500;

    if (Math.abs(velocity.x) > velocityThreshold || Math.abs(offset.x) > threshold) {
      const exitX = offset.x > 0 ? window.innerWidth : -window.innerWidth;
      animate(scope.current, { x: exitX, opacity: 0 }, { type: 'spring', velocity: velocity.x })
        .then(onDismiss);
    } else {
      animate(scope.current, { x: 0, opacity: 1 }, { type: 'spring', stiffness: 500, damping: 30 });
    }
  }, [onDismiss, options, scope, animate]);

  return {
    ref: scope,
    style: { x, opacity },
    drag: 'x' as const,
    dragElastic: 0.6,
    onDragEnd: handleDragEnd,
  };
}

// Usage in any component:
function DismissableCard({ onDismiss, children }) {
  const gestureProps = useSwipeDismiss(onDismiss);
  return <motion.div {...gestureProps}>{children}</motion.div>;
}
```

3. **Gesture config centralized alongside motion-config.ts:**

```typescript
// gestureConfig.ts
export const SWIPE_THRESHOLDS = {
  distance: 100,       // px minimum drag distance to commit
  velocity: 500,       // px/s minimum velocity for flick commit
  combined: {          // Lower thresholds when both distance and velocity present
    distance: 0.15,    // fraction of card width
    velocity: 300,
  },
};

export const SNAP_BACK_SPRING = { type: 'spring' as const, stiffness: 500, damping: 30 };
export const FLING_SPRING = { type: 'spring' as const, stiffness: 200, damping: 30 };
```

**Refactoring opportunity:** `SwipeableCard` can be refactored to use `useSwipeDismiss` internally, validating the abstraction against the existing production-quality implementation.

### 3. Screen Transition Choreography

**Problem:** Current `PageTransition` provides direction-aware slide+scale based on tab order, which works well for tab navigation. But specific transitions (e.g., quiz -> results, study guide -> flashcard detail, dashboard -> practice) could benefit from route-specific transition variants and shared element animations.

**Solution: Enhanced transition system with route-specific variants + layoutId for shared elements**

```
src/components/animations/
  PageTransition.tsx            -- MODIFY: add route-specific variant lookup
  TransitionConfig.ts           -- Route-to-variant mapping
  SharedElementWrapper.tsx      -- layoutId wrapper for card-to-page morph transitions
```

**Architecture:**

```typescript
// TransitionConfig.ts
export type TransitionVariant = 'slide' | 'fade' | 'zoom' | 'slideUp' | 'none';

// Route pairs that get custom transitions instead of default slide
const ROUTE_TRANSITIONS: Record<string, TransitionVariant> = {
  // Quiz flow: slide up for immersive entry, fade for results reveal
  '/test': 'slideUp',
  '/interview': 'slideUp',
  '/practice': 'slideUp',

  // Auth and landing: fade (no directional context)
  '/': 'fade',
  '/auth': 'fade',

  // Default: 'slide' (existing behavior via getSlideDirection)
};

export function getTransitionVariant(pathname: string): TransitionVariant {
  // Exact match first, then prefix match
  return ROUTE_TRANSITIONS[pathname]
    ?? Object.entries(ROUTE_TRANSITIONS).find(([k]) => pathname.startsWith(k + '/'))?.[1]
    ?? 'slide';
}
```

**Shared Element Animations (layoutId):**

The project already uses `motion/react` which supports `layoutId`. For transitions like "category card on dashboard morphs into category detail header," wrap both elements with the same `layoutId`:

```typescript
// On Dashboard: category card
<motion.div layoutId={`category-${cat.id}`}>
  <CategoryCard category={cat} />
</motion.div>

// On StudyGuidePage: category header
<motion.div layoutId={`category-${cat.id}`}>
  <CategoryHeader category={cat} />
</motion.div>
```

**Constraint:** `layoutId` shared animations require both elements to be in the same `LayoutGroup`. Since `PageTransition` uses `AnimatePresence mode="wait"`, the old page unmounts before the new page mounts, which breaks cross-page `layoutId`. The solution is to use `mode="popLayout"` or render a persistent `layoutId` element outside the transition boundary.

**Recommended approach for this project:** Keep `mode="wait"` (it's working well and avoids overlapping pages) and use `layoutId` only for **within-page** transitions (e.g., list item expands into detail panel on the same page). Cross-page shared element animations add significant complexity for marginal UX benefit in this app's navigation model.

**Per-route transition variants are the higher-value change:** immersive modes (test, interview, practice) sliding up from bottom creates a clear "entering focused mode" feeling, while results pages fading in creates a "reveal" moment.

### 4. Visual Consistency Enforcement

**Problem:** With ~100 component files and growing, visual inconsistencies can creep in: inconsistent spacing, mixed use of tokens vs. hardcoded values, inconsistent border-radius, missing dark mode adaptation, accessibility gaps.

**Solution: Multi-layered consistency enforcement**

```
src/components/ui/                -- Shared primitive component library
  tokens.ts                        -- NEW: TypeScript token exports for use in JS
scripts/
  audit-visual-consistency.ts      -- NEW: Static analysis script
.storybook/                        -- OPTIONAL: Component catalog (defer if overhead too high)
```

**Layer 1: TypeScript Design Tokens**

Export tokens from CSS to TypeScript for type-safe usage in JS contexts (e.g., Recharts colors, motion animation targets, canvas rendering):

```typescript
// src/components/ui/tokens.ts
export const colors = {
  primary: 'hsl(var(--color-primary))',
  success: 'hsl(var(--color-success))',
  warning: 'hsl(var(--color-warning))',
  // ... etc
} as const;

export const springs = {
  bouncy: { type: 'spring', stiffness: 400, damping: 15, mass: 0.8 },
  snappy: { type: 'spring', stiffness: 500, damping: 25 },
  gentle: { type: 'spring', stiffness: 200, damping: 20 },
} as const;

export const spacing = { 1: '0.25rem', 2: '0.5rem', /* ... */ } as const;
```

**Layer 2: Composable UI Primitives**

The existing `Button`, `GlassCard`, `Dialog`, `Progress` components form a solid foundation. What's needed is filling gaps:

| Existing Primitive | Status | Gap |
|---|---|---|
| `Button` | Complete | -- |
| `GlassCard` | Complete | -- |
| `Dialog` | Complete | -- |
| `Progress` | Complete | -- |
| `Card` | Complete | -- |
| `Skeleton` | Complete | -- |
| `SpeechButton` | Complete | -- |
| **Toggle/Switch** | Inline in SettingsPage | Extract to shared component |
| **Badge** | Scattered implementations | Unify into shared `Badge` component |
| **Chip/Tag** | No shared component | Create `Chip` for category labels, filter pills |
| **Divider** | Inline `border-b` | Consider `Divider` for consistency |
| **Avatar** | `InterviewerAvatar` only | Create generic `Avatar` |
| **Tooltip** | CSS-only `[data-tooltip]` | Consider upgrading for accessibility |

**Layer 3: Static Analysis Script (Audit)**

A Node.js script that scans source files for visual consistency issues:

```typescript
// scripts/audit-visual-consistency.ts
// Checks for:
// 1. Hardcoded hex colors (stylelint already catches in CSS, but not in TSX className strings)
// 2. Inconsistent border-radius (raw 'rounded-lg' vs 'rounded-xl' vs 'rounded-2xl')
// 3. Missing dark: variants on bg-/text- classes that use non-token colors
// 4. Hardcoded pixel values that should use spacing tokens
// 5. Missing min-h-[44px] on interactive elements (touch target audit)
// 6. Missing aria-label on icon-only buttons
// 7. Missing font-myanmar on Burmese text containers
```

This is cheaper than Storybook + Chromatic for a team of this size. Run it as a CI check or pre-commit hook.

**Layer 4: Visual Regression (Defer)**

Storybook + Chromatic is the gold standard for visual regression testing, but the overhead is significant for a solo/small team project. Recommendation: **Defer Storybook** and rely on the static analysis script + manual visual review for this milestone. Add Storybook only if the component library grows beyond ~30 shared primitives.

### 5. About Page

**Problem:** No About page exists. Users need version info, credits, legal links, and the mission statement.

**Solution: Standalone route at `/about`, linked from Settings page**

```
src/pages/AboutPage.tsx            -- New page component
src/components/about/
  VersionInfo.tsx                   -- Build version, last updated
  TeamCredits.tsx                   -- Credits and attributions
  LegalLinks.tsx                    -- Privacy policy, terms, open source licenses
```

**Routing integration:**

```typescript
// In AppShell.tsx Routes:
<Route path="/about" element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />

// In navConfig.ts HIDDEN_ROUTES (About is linked from Settings, not in nav tabs):
export const HIDDEN_ROUTES = ['/', '/auth', '/auth/forgot', '/auth/update-password', '/op-ed', '/about'];
```

**Settings page integration:** Add an "About" row in the Help & Guidance section of SettingsPage that navigates to `/about`.

**Design:** Glass-morphism card layout matching Settings page aesthetic. Animated flag pair (reuse `AmericanFlag` + `MyanmarFlag` components from WelcomeScreen). Bilingual throughout.

---

## Component Boundaries

| Component / Module | Responsibility | Communicates With |
|---|---|---|
| `CelebrationOverlay` | Renders celebration effects (confetti, starburst) | Listens to DOM `celebration` events |
| `useCelebration` hook | Fire-and-forget celebration API | Dispatches DOM events, calls soundEffects |
| `celebrationOrchestrator` | Preset configs, coordinates audio + visual + haptic | soundEffects.ts, haptics.ts |
| `haptics.ts` | Navigator.vibrate() wrapper | Browser Vibration API |
| `useSwipeDismiss` hook | Reusable horizontal swipe gesture | motion/react's drag API |
| `useSwipeNavigation` hook | Left/right swipe for prev/next | motion/react's drag API |
| `useLongPress` hook | Long press with haptic | Browser touch events + haptics.ts |
| `TransitionConfig` | Route-to-transition-variant mapping | navConfig.ts |
| Enhanced `PageTransition` | Route-aware transition variants | TransitionConfig, motion/react |
| `SharedElementWrapper` | layoutId convenience wrapper | motion/react's layoutId |
| UI primitives (Toggle, Badge, Chip) | Shared visual atoms | Design tokens |
| `audit-visual-consistency.ts` | Static analysis for visual issues | Source file scanning |
| `AboutPage` | Version, credits, legal | SettingsPage (navigation) |

---

## Data Flow

### Celebration Flow

```
User action (correct answer, milestone reached, etc.)
  -> Component calls celebrate('medium')
  -> useCelebration dispatches:
       1. Sound: playMilestone() via soundEffects.ts
       2. Haptic: navigator.vibrate([50, 30, 100]) via haptics.ts
       3. DOM CustomEvent('celebration', { confetti: 'burst', visual: 'starburst' })
  -> CelebrationOverlay (mounted in AppShell) receives event
  -> Renders confetti canvas + starburst SVG animation
  -> Auto-cleans after animation duration
```

### Gesture Flow

```
User touches card and drags horizontally
  -> motion.div drag='x' tracks position via useMotionValue
  -> useTransform derives opacity/rotation from x position
  -> On drag end, useSwipeDismiss checks velocity + distance thresholds
  -> If committed: useAnimate flings element off-screen, calls onDismiss
  -> If not committed: useAnimate spring-snaps back to center
  -> Reduced motion: drag disabled, button actions trigger linear slide
```

### Transition Flow

```
User navigates to new route (e.g., /home -> /test)
  -> React Router updates location
  -> PageTransition reads new pathname
  -> getTransitionVariant('/test') returns 'slideUp'
  -> AnimatePresence unmounts old page with exit variant
  -> New page mounts with 'slideUp' initial -> animate variant
  -> If slide (default): getSlideDirection determines left/right based on tab order
```

---

## Patterns to Follow

### Pattern 1: Fire-and-Forget Event Bus (for Celebrations)

**What:** Use DOM CustomEvents to decouple celebration triggers from visual rendering. No React Context needed.

**When:** When effects are one-directional (fire -> display) with no return value needed.

**Why:** Avoids adding another provider to the 10-deep provider hierarchy. Any component can trigger celebrations without prop drilling. The overlay component handles all cleanup.

```typescript
// Trigger (any component)
window.dispatchEvent(new CustomEvent('celebration', {
  detail: { level: 'medium', confetti: 'burst', sound: 'milestone' }
}));

// Listen (CelebrationOverlay, mounted once)
useEffect(() => {
  const handler = (e: CustomEvent) => startCelebration(e.detail);
  window.addEventListener('celebration', handler);
  return () => window.removeEventListener('celebration', handler);
}, []);
```

### Pattern 2: Gesture Hook Returns Motion Props

**What:** Gesture hooks return an object spread directly onto `motion.div` elements.

**When:** Any reusable gesture pattern (swipe dismiss, swipe navigate, long press).

**Why:** Maximum composability -- the hook doesn't render anything, so the consuming component controls layout and styling completely.

```typescript
const gestureProps = useSwipeDismiss(onDismiss);
return <motion.div {...gestureProps} className="my-card">{children}</motion.div>;
```

### Pattern 3: Consistent Reduced Motion Handling

**What:** Every animation component/hook checks `useReducedMotion()` and provides a graceful fallback.

**When:** Always. Every animation in this codebase.

**Pattern already established:**
- Confetti: Returns `null` when reduced motion
- PageTransition: Uses instant variants
- StaggeredList: Uses no-animation variants
- SwipeableCard: Disables drag, uses linear slide
- CountUpScore: Shows final value immediately

**New components must follow this pattern.** The `useCelebration` hook should skip visual effects and haptics when reduced motion is active, but still play sounds (as audio is not covered by `prefers-reduced-motion`).

### Pattern 4: Spring Presets from motion-config.ts

**What:** All motion/react spring configurations use the shared presets from `motion-config.ts`.

**When:** Any new animation using spring physics.

**Extension needed:** Add celebration-specific presets:

```typescript
// motion-config.ts additions
export const SPRING_CELEBRATION = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 12,
  mass: 0.6,
}; // Very bouncy, exuberant

export const SPRING_DISMISS = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 30,
}; // Quick settle, no overshoot -- for swipe-away
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: New React Context for Celebrations

**What:** Creating a `CelebrationProvider` / `CelebrationContext`.

**Why bad:** The provider hierarchy is already 10 levels deep. Celebrations are stateless fire-and-forget events, not shared state. Adding a context creates unnecessary re-renders and deepens the provider tree.

**Instead:** Use DOM CustomEvents (Pattern 1). The `CelebrationOverlay` component is the only consumer.

### Anti-Pattern 2: @use-gesture Alongside motion/react

**What:** Adding `@use-gesture/react` as a dependency for gesture handling.

**Why bad:** motion/react v12 already provides `drag`, `useMotionValue`, `useTransform`, `PanInfo`, and `useAnimate` -- everything needed for swipe, fling, and pull gestures. Adding `@use-gesture` creates two competing gesture systems, increases bundle size (~8KB gzipped), and means developers need to know two APIs.

**Instead:** Build gesture hooks using motion/react's native drag API. The existing `SwipeableCard` proves this works well.

### Anti-Pattern 3: layoutId for Cross-Page Transitions

**What:** Using `layoutId` to animate shared elements between different routes (e.g., category card on dashboard morphs into category header on study page).

**Why bad:** `AnimatePresence mode="wait"` unmounts the old page before mounting the new one, breaking the `layoutId` connection. Workarounds (mode="popLayout", persistent elements outside transition boundary) add significant complexity and risk regressions in the existing transition system.

**Instead:** Use `layoutId` for within-page transitions only (expanding cards, tab underlines, list item -> detail on same page). For cross-page transitions, the route-specific variants (slideUp, fade, zoom) provide sufficient visual distinction.

### Anti-Pattern 4: Storybook for Visual Audit

**What:** Setting up Storybook + Chromatic for visual regression testing.

**Why bad for this project right now:** Significant setup overhead (config, story files for ~100 components, CI integration). Overkill for a solo/small team project at this stage. The ROI is best when multiple developers are making changes to shared components.

**Instead:** Use the static analysis script for automated checks, plus manual visual review. Revisit Storybook if the project grows a larger contributor team.

### Anti-Pattern 5: Lottie for Celebration Animations

**What:** Adding Lottie (lottie-web, lottie-react) for celebration effects.

**Why bad:** Lottie adds ~60KB gzipped to the bundle. The existing `react-canvas-confetti` + motion/react spring animations can achieve all needed celebration effects. Lottie is best when you need designer-authored After Effects animations, which isn't the case here.

**Instead:** Compose celebrations from canvas-confetti + SVG animations driven by motion/react + CSS keyframes.

---

## Scalability Considerations

| Concern | Current (~12 routes) | At 20+ routes | At 50+ components |
|---------|---------------------|---------------|-------------------|
| Provider depth | 10 levels -- functional | Same (no new providers) | Same |
| Animation bundle | motion/react + canvas-confetti (~45KB) | Same | Same |
| Transition configs | 14 route entries | O(n) lookup, negligible | N/A |
| Gesture hooks | 3-4 hooks, ~2KB total | Same | Same |
| Visual audit | Script scans ~250 files in <5s | Still fast | May need caching |
| Celebration presets | 5 levels | May add custom levels | Same |

---

## File Impact Map

### New Files

| File | Purpose | Dependencies |
|---|---|---|
| `src/lib/celebrations/celebrationOrchestrator.ts` | Preset configs, orchestration logic | soundEffects.ts |
| `src/lib/celebrations/haptics.ts` | Navigator.vibrate() wrapper | None (browser API) |
| `src/lib/celebrations/types.ts` | TypeScript types for celebration system | None |
| `src/hooks/useCelebration.ts` | Hook: `celebrate(level)` | celebrationOrchestrator, useReducedMotion |
| `src/components/celebrations/CelebrationOverlay.tsx` | Portal-mounted overlay | Confetti.tsx, motion/react |
| `src/components/celebrations/StarBurst.tsx` | SVG star burst animation | motion/react |
| `src/components/celebrations/SuccessCheckmark.tsx` | Animated checkmark | motion/react |
| `src/hooks/gestures/useSwipeDismiss.ts` | Horizontal swipe-to-dismiss | motion/react |
| `src/hooks/gestures/useSwipeNavigation.ts` | Left/right swipe navigation | motion/react |
| `src/hooks/gestures/useLongPress.ts` | Long press detection | haptics.ts |
| `src/hooks/gestures/gestureConfig.ts` | Shared thresholds | motion-config.ts |
| `src/components/animations/TransitionConfig.ts` | Route-to-variant mapping | navConfig.ts |
| `src/components/ui/Toggle.tsx` | Shared toggle switch | motion/react, tokens |
| `src/components/ui/Badge.tsx` | Unified badge component | tokens |
| `src/components/ui/Chip.tsx` | Filter pills, category labels | tokens |
| `src/components/ui/tokens.ts` | TypeScript token exports | tokens.css |
| `src/pages/AboutPage.tsx` | About page | AmericanFlag, MyanmarFlag |
| `scripts/audit-visual-consistency.ts` | Static analysis | Node.js fs |

### Modified Files

| File | Change | Risk |
|---|---|---|
| `src/AppShell.tsx` | Add `CelebrationOverlay` after `NavigationProvider`, add `/about` route | LOW -- additive |
| `src/components/animations/PageTransition.tsx` | Add route-specific variant lookup | MEDIUM -- core transition |
| `src/lib/motion-config.ts` | Add SPRING_CELEBRATION, SPRING_DISMISS presets | LOW -- additive |
| `src/components/navigation/navConfig.ts` | Add '/about' to HIDDEN_ROUTES | LOW -- additive |
| `src/pages/SettingsPage.tsx` | Add "About" link in Help section | LOW -- additive |
| `src/components/results/TestResultsScreen.tsx` | Migrate to `useCelebration` hook | MEDIUM -- replace manual wiring |
| `src/components/progress/MasteryMilestone.tsx` | Migrate to `useCelebration` hook | MEDIUM -- replace manual wiring |
| `src/components/sort/SwipeableCard.tsx` | Extract gesture logic to `useSwipeDismiss` | MEDIUM -- refactor |
| `src/styles/animations.css` | Add keyframes for starburst, checkmark draw-on | LOW -- additive |

---

## Suggested Build Order

Build order is driven by dependency chains:

```
Phase 1: Foundation (no dependencies)
  1a. motion-config.ts additions (SPRING_CELEBRATION, SPRING_DISMISS)
  1b. haptics.ts (browser API, no deps)
  1c. celebration types + orchestrator
  1d. gestureConfig.ts
  1e. UI primitive extraction (Toggle, Badge, Chip from existing code)
  1f. TypeScript token exports (tokens.ts)

Phase 2: Core Hooks (depends on Phase 1)
  2a. useCelebration hook
  2b. useSwipeDismiss hook
  2c. useSwipeNavigation hook
  2d. useLongPress hook

Phase 3: Visual Components (depends on Phase 1-2)
  3a. CelebrationOverlay (mount in AppShell)
  3b. StarBurst animation
  3c. SuccessCheckmark animation
  3d. Enhanced PageTransition with route variants

Phase 4: Integration (depends on Phase 1-3)
  4a. Migrate TestResultsScreen to useCelebration
  4b. Migrate MasteryMilestone to useCelebration
  4c. Refactor SwipeableCard to use useSwipeDismiss
  4d. Add celebration points throughout quiz/practice flows

Phase 5: New Content (depends on Phase 1)
  5a. AboutPage + routing
  5b. Settings page "About" link

Phase 6: Quality (depends on all above)
  6a. Visual consistency audit script
  6b. Run audit, fix findings
  6c. Cross-browser testing of new animations
```

**Phase ordering rationale:**
- Foundation first because everything depends on shared configs and types
- Hooks before visual components because overlays need the hook API
- Integration after components because we need working celebration/gesture systems
- About page is independent and can be built in parallel with Phases 2-4
- Quality audit last because it should scan the final state of all changes

---

## Sources

- Direct codebase analysis of all files listed in the Component Boundaries table
- [Motion/React Layout Animations](https://motion.dev/docs/react-layout-animations) -- layoutId, LayoutGroup, FLIP transforms
- [Motion/React Gestures](https://motion.dev/docs/react-gestures) -- drag, hover, tap, pan APIs
- [Motion/React LayoutGroup](https://motion.dev/docs/react-layout-group) -- namespace scoping for layoutId
- [canvas-confetti](https://github.com/catdad/canvas-confetti) -- underlying library for react-canvas-confetti
- [Duolingo micro-interactions analysis](https://medium.com/@Bundu/little-touches-big-impact-the-micro-interactions-on-duolingo-d8377876f682)
- [Duolingo iOS 60fps animations](https://60fps.design/apps/duolingo)
- [Chromatic visual regression testing](https://www.chromatic.com/storybook) -- evaluated and deferred
- [Navigator.vibrate() Web API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate) -- haptic feedback
