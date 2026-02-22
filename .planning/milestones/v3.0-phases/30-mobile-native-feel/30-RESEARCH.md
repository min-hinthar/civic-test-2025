# Phase 30: Mobile Native Feel - Research

**Researched:** 2026-02-20
**Domain:** PWA mobile UX polish (CSS overscroll, safe areas, haptics, swipe gestures, selection guards)
**Confidence:** HIGH

## Summary

Phase 30 makes the PWA feel like an installed native app by addressing five distinct areas: overscroll behavior, safe area insets, selection/tap guards, swipe-to-dismiss toasts, and haptic feedback. The implementation is predominantly CSS-only for the first three areas, with motion/react drag for toasts and the Vibration API for haptics.

The existing codebase already has strong foundations: `viewport-fit=cover` is set in `_document.tsx`, `env(safe-area-inset-bottom)` is applied to `BottomTabBar`, `apple-mobile-web-app-status-bar-style` is `black-translucent`, a `haptics.ts` utility with three functions (`hapticLight`, `hapticMedium`, `hapticDouble`) exists, and SwipeableCard provides a proven motion/react drag pattern. The work is primarily extending existing patterns rather than building from scratch.

**Primary recommendation:** Apply CSS-level guards (overscroll, user-select, touch-action, tap-highlight) globally first, then enhance safe area handling on GlassHeader/BottomTabBar, then rewrite the toast system with motion/react drag, and finally expand haptics.ts with a heavy/celebration pattern and integrate across all interactive components.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Haptic Feedback:**
- **Tier system: 3 tiers**
  - **Light** -- every button tap, toggle switch, navigation tap (bottom tab, sidebar, back), TTS speak button
  - **Medium** -- card flip, answer grading (same for correct/incorrect), mic record start/stop
  - **Heavy (multi-burst)** -- streak reward, badge unlock, milestone celebration. Pattern: rapid burst sequence (ta-da-da), not single pulse
- **Scope:** Haptics fire on EVERY interactive tap (not just meaningful state changes) -- full native feel
- Navigation taps (bottom tab bar, sidebar links, back button) all get light haptic
- Toggle switches fire haptic on tap (immediate), not on state change
- TTS speak button gets light tap on press
- Share button: light on tap + medium on success
- Swipe gestures: light at dismiss threshold + medium on dismiss
- Mic record button: medium on start, light on stop
- Migrate existing inline `navigator.vibrate(10)` calls to the new haptics.ts utility
- No in-app toggle. Respect OS-level vibration setting only. iOS graceful no-op.
- 3D chunky button press haptics deferred to Phase 31

**Swipe-to-Dismiss Toasts:**
- Direction: Either direction (left or right)
- Spring-back if swiped partially but not past threshold
- Velocity-aware: fast flick dismisses even if short distance
- Slight elastic resistance at start of drag
- Auto-dismiss timer pauses while user is touching/dragging
- Progressive opacity fade proportional to drag distance
- Subtle background dimming (5-10% opacity) during drag only
- On dismiss: toast flies off in swipe direction with momentum + faint ghost trail effect
- Clean spring-back animation if not dismissed
- Desktop: X button (hover-revealed) + swipe still works via mouse drag

**Safe Area Insets:**
- CSS `env()` variables approach
- GlassHeader: glass extends behind Dynamic Island / status bar. Content below safe area inset.
- BottomTabBar: glass extends into home indicator zone. Content scrolls behind it.
- Portrait only -- lock in PWA manifest. No landscape support.
- `display: standalone` in manifest (not fullscreen)
- Allow iOS-native scroll bounce inside content areas. Only kill overscroll at body level.
- Dynamic theme-color update when user toggles dark mode
- Extend Tailwind config with safe area utility classes (`pt-safe`, `pb-safe`, etc.)
- No debug overlay

**Selection & Overscroll Guards:**
- Long-press should enable text selection on educational content (questions, answers, explanations, Burmese text) for copying
- Disable context menu on UI elements (buttons, icons, flags, cards). Keep on text content.
- `touch-action: manipulation` globally -- disables double-tap zoom, keeps pinch-zoom and scroll
- Remove `-webkit-tap-highlight-color: transparent` globally. Phase 31 adds proper press animations.
- Prevent Chrome pull-to-refresh in PWA mode
- `-webkit-font-smoothing: antialiased` globally (already done)

### Claude's Discretion
- Toast positioning (current vs mobile bottom-center)
- Error toast dismissibility (swipeable vs require action)
- Toast stacking swipe behavior (individual vs top-only)
- Drag surface area for toasts
- overscroll-behavior scope (all modes vs standalone-only)
- user-select strategy (global + whitelist vs targeted)
- viewport-fit=cover implementation (already done)
- text-size-adjust behavior
- Bottom-fixed element safe area audit scope
- Safe area application scope (all modes vs standalone-only)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MOBI-01 | `overscroll-behavior: none` in PWA standalone mode prevents rubber-band white flash | CSS `@media (display-mode: standalone)` media query targeting `html, body` with `overscroll-behavior: none`. Current globals.css sets `overscroll-behavior: auto` -- change to `none` inside standalone media query. |
| MOBI-02 | Safe area inset handling for iPhone Dynamic Island on BottomTabBar and GlassHeader | BottomTabBar already uses `env(safe-area-inset-bottom)` inline style. GlassHeader needs `padding-top` with safe-area-inset-top. Glass backgrounds should extend into safe area zones. Tailwind config extended with `pt-safe`/`pb-safe` utilities. |
| MOBI-03 | `user-select: none` on interactive elements prevents accidental text selection during taps | Global CSS rule targeting `button, [role="button"], [role="radio"], [role="tab"], a, label`. Educational content (questions, explanations, Burmese text) explicitly set `user-select: text`. |
| MOBI-04 | Swipe-to-dismiss on toast notifications with motion/react drag | Rewrite `BilingualToast.tsx` Toast component to use `motion.div` with `drag="x"`, `useMotionValue`, `useTransform` for opacity, and `onDragEnd` with velocity+offset threshold for dismiss. Proven pattern exists in SwipeableCard.tsx. |
| MOBI-05 | Haptic feedback utility (`haptics.ts`) with named patterns: tap, success, error, milestone | Existing `haptics.ts` has `hapticLight`, `hapticMedium`, `hapticDouble`. Needs new `hapticHeavy()` for multi-burst celebration pattern. Rename existing functions to match tier system (light/medium/heavy). |
| MOBI-06 | Haptics integrated into FeedbackPanel, StreakReward, badge celebrations, and 3D button press | 6 files already import haptics. Need to add haptic calls to ~15+ additional components: BottomTabBar nav taps, Sidebar links, FlagToggle (migrate inline vibrate), FeedbackPanel, StreakReward, BadgeCelebration, ShareButton, SpeechButton, toggle switches, etc. 3D button press deferred to Phase 31. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion/react | ^12.33.0 | Drag gestures for swipe-to-dismiss toasts | Already in project (92+ files). Drag API proven in SwipeableCard. `useMotionValue`, `useTransform`, `onDragEnd` with PanInfo for velocity-based dismiss. |
| CSS env() | Native | Safe area inset handling | `env(safe-area-inset-top/bottom/left/right)` with fallback values. Already configured via `viewport-fit=cover` in `_document.tsx`. |
| CSS overscroll-behavior | Native | Prevent rubber-band/pull-to-refresh | Single CSS property. `@media (display-mode: standalone)` scoping. |
| Vibration API | Native | Haptic feedback on Android | `navigator.vibrate()` -- already used via `haptics.ts`. Zero bundle cost. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tailwindcss | 3.4.x | Safe area utility classes | Extend theme with `pt-safe`, `pb-safe`, `pl-safe`, `pr-safe` using `env()` in config |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| navigator.vibrate() | ios-haptics (npm) | Uses Safari 17.4+ `<input switch>` checkbox hack for iOS haptics. Only 80 GitHub stars, 31 commits, very new (June 2025). Clever but fragile -- relies on undocumented Safari behavior. **Not recommended** for production: the checkbox-switch haptic is a side effect Apple could remove. Use `navigator.vibrate()` + graceful no-op on iOS per user decision. |
| @use-gesture/react | motion/react drag | Explicitly out of scope per REQUIREMENTS.md. motion/react v12 drag API is proven in this codebase. |

**Installation:**
```bash
# No new packages needed. All capabilities from existing dependencies + native CSS/APIs.
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── haptics.ts              # Expanded: hapticLight/Medium/Heavy + celebration patterns
├── styles/
│   └── globals.css             # Add: overscroll, user-select, touch-action, tap-highlight guards
│   └── mobile-native.css       # NEW: standalone-only CSS (or inline in globals.css)
├── components/
│   └── BilingualToast.tsx       # Rewrite: swipe-to-dismiss with motion/react drag
│   └── navigation/
│       ├── GlassHeader.tsx      # Update: safe area top padding
│       └── BottomTabBar.tsx     # Update: enhanced safe area, haptic on nav taps
└── pages/
    └── _document.tsx            # Already correct (viewport-fit=cover, black-translucent)
tailwind.config.js               # Add: safe area spacing utilities
public/
└── manifest.json                # Add: orientation: "portrait"
```

### Pattern 1: Overscroll Guard (CSS-only)
**What:** Prevent rubber-band white flash and pull-to-refresh in PWA standalone mode
**When to use:** Body-level overscroll prevention, scoped to installed PWA
**Example:**
```css
/* In globals.css */
@media (display-mode: standalone) {
  html,
  body {
    overscroll-behavior: none;
  }
}

/* Also iOS standalone detection (backup) */
@media (display-mode: standalone),
       (-webkit-device-pixel-ratio: 0) { /* Not needed -- standalone covers it */
  html,
  body {
    overscroll-behavior: none;
  }
}
```

**Recommendation for Claude's Discretion (overscroll scope):** Apply `overscroll-behavior: none` in standalone mode ONLY. In browser mode, overscroll is expected web behavior (pull-to-refresh, bounce). This is the standard approach per Chrome DevRel and MDN guidance.

### Pattern 2: Safe Area Inset Extension
**What:** Glass surfaces extend behind status bar/home indicator; content stays within safe zone
**When to use:** GlassHeader (top) and BottomTabBar (bottom) in PWA standalone mode
**Example:**
```tsx
// GlassHeader.tsx -- glass background extends behind Dynamic Island
<header
  className="glass-medium prismatic-border glass-nav rounded-none sticky top-0 z-30 w-full"
  style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
>
  <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
    {/* Content starts below safe area */}
  </div>
</header>
```

```tsx
// BottomTabBar.tsx -- already has paddingBottom, but glass should extend into home indicator
<nav
  className={`fixed bottom-0 left-0 right-0 z-40 md:hidden glass-heavy prismatic-border glass-nav rounded-none ...`}
  style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
>
```

**Recommendation for Claude's Discretion (safe area scope):** Apply safe area padding in ALL modes, not just standalone. The `env()` values already return `0px` on non-notch devices and in browser mode where the browser chrome handles it. This ensures correct behavior everywhere without needing display-mode detection.

### Pattern 3: Swipe-to-Dismiss Toast with motion/react Drag
**What:** Horizontally draggable toast with velocity-based dismiss, spring-back, and opacity fade
**When to use:** All toast notifications
**Example:**
```tsx
// Key pattern from SwipeableCard.tsx adapted for toasts
import { motion, useMotionValue, useTransform, useAnimate, PanInfo } from 'motion/react';

function SwipeableToast({ toast, onDismiss }: Props) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);
  const [scope, animate] = useAnimate<HTMLDivElement>();

  // Pause auto-dismiss while touching
  const [isPaused, setIsPaused] = useState(false);

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const DISMISS_THRESHOLD = 100;
    const VELOCITY_THRESHOLD = 500;

    const isDismissed =
      Math.abs(offset.x) > DISMISS_THRESHOLD ||
      Math.abs(velocity.x) > VELOCITY_THRESHOLD;

    if (isDismissed) {
      const exitX = offset.x > 0 ? 300 : -300;
      animate(scope.current, { x: exitX, opacity: 0 }, {
        type: 'spring', velocity: velocity.x, stiffness: 200, damping: 30
      }).then(() => onDismiss(toast.id));
    } else {
      // Spring back
      animate(scope.current, { x: 0 }, {
        type: 'spring', stiffness: 500, damping: 30
      });
    }
  }, [animate, scope, onDismiss, toast.id]);

  return (
    <motion.div
      ref={scope}
      style={{ x, opacity }}
      drag="x"
      dragElastic={0.3}        // Slight elastic resistance
      dragMomentum={false}     // We handle momentum manually in onDragEnd
      onDragStart={() => setIsPaused(true)}
      onDragEnd={handleDragEnd}
    >
      {/* Toast content */}
    </motion.div>
  );
}
```

### Pattern 4: Haptic Feedback Tier System
**What:** Named haptic functions matching the 3-tier system
**When to use:** All interactive elements
**Example:**
```typescript
// haptics.ts -- expanded
const supportsVibration = typeof navigator !== 'undefined' && 'vibrate' in navigator;

/** Light: every button tap, toggle, nav tap, TTS speak (10ms) */
export function hapticLight(): void {
  if (!supportsVibration) return;
  try { navigator.vibrate(10); } catch { /* no-op */ }
}

/** Medium: card flip, answer grade, mic start/stop, share success (20ms) */
export function hapticMedium(): void {
  if (!supportsVibration) return;
  try { navigator.vibrate(20); } catch { /* no-op */ }
}

/** Heavy: streak reward, badge unlock, milestone -- multi-burst "ta-da-da" */
export function hapticHeavy(): void {
  if (!supportsVibration) return;
  try { navigator.vibrate([15, 30, 15, 30, 40]); } catch { /* no-op */ }
}
```

### Pattern 5: User-Select Guards
**What:** Prevent accidental text selection on interactive elements while keeping it on content
**When to use:** Global CSS with targeted exceptions
**Example:**
```css
/* Global guard on interactive elements */
button,
[role="button"],
[role="radio"],
[role="tab"],
[role="switch"],
a,
label,
nav,
.tap-highlight-none {
  -webkit-user-select: none;
  user-select: none;
}

/* Preserve selection on educational content */
.selectable-content,
p,
.font-myanmar,
article {
  -webkit-user-select: text;
  user-select: text;
}
```

**Recommendation for Claude's Discretion (user-select strategy):** Use the "guard interactive elements" approach (not "global none + whitelist"). This is safer because new content elements automatically get text selection, and only explicitly interactive elements are guarded. Less risk of accidentally blocking selection on educational content.

### Pattern 6: Tailwind Safe Area Utilities
**What:** Custom Tailwind utilities for safe area spacing
**When to use:** Any element needing safe area padding
**Example:**
```javascript
// tailwind.config.js extend
theme: {
  extend: {
    padding: {
      safe: 'env(safe-area-inset-bottom, 0px)',
      'safe-top': 'env(safe-area-inset-top, 0px)',
      'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
      'safe-left': 'env(safe-area-inset-left, 0px)',
      'safe-right': 'env(safe-area-inset-right, 0px)',
    },
  },
}
```

### Anti-Patterns to Avoid
- **Global `user-select: none` on `*` or `body`:** Blocks copying educational content. Never do this -- use targeted selectors.
- **`overscroll-behavior: none` on all scrollable containers:** Breaks natural scroll bounce inside content areas. Only apply to `html, body` and only in standalone mode.
- **`position: fixed` without safe area padding:** Content overlaps iPhone Dynamic Island or home indicator. Always add `env(safe-area-inset-*)`.
- **`touch-action: none` instead of `manipulation`:** Blocks ALL touch interactions including scroll. Use `manipulation` which only disables double-tap zoom.
- **Inline `navigator.vibrate()` calls:** Creates inconsistency. All haptic calls must go through `haptics.ts` utility.
- **Haptic feedback in render or effects:** Always call from event handlers only. React Compiler will flag effect-body calls.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Swipe-to-dismiss gesture | Touch event listeners + manual transform math | motion/react `drag="x"` + `onDragEnd` with PanInfo | Handles pointer normalization, velocity tracking, spring physics. SwipeableCard.tsx is the proven pattern. |
| Safe area detection | JS-based notch detection | CSS `env(safe-area-inset-*)` | Browser-native, zero JS, works in all modes. Already configured via `viewport-fit=cover`. |
| Overscroll prevention | JS scroll event prevention (`e.preventDefault()`) | CSS `overscroll-behavior: none` | Browser-native, no JS, no jank, no scroll event interference. |
| Pull-to-refresh disable | Custom JS scroll locking | `overscroll-behavior-y: contain` or `none` | CSS-only. Chrome DevRel recommendation. |
| Haptic patterns | Inline `navigator.vibrate()` per component | Centralized `haptics.ts` utility | Single source of truth. Easy to adjust timing. Graceful feature detection. |

**Key insight:** 80% of this phase is CSS-only (overscroll, safe areas, user-select, touch-action, tap-highlight). The complexity is in the toast swipe gesture, which is well-served by the existing motion/react drag pattern proven in SwipeableCard.tsx.

## Common Pitfalls

### Pitfall 1: env() Returns 0px Without viewport-fit=cover
**What goes wrong:** `env(safe-area-inset-top)` returns `0px` even on iPhone with Dynamic Island
**Why it happens:** The viewport meta tag must include `viewport-fit=cover` to opt into the full viewport
**How to avoid:** Already done -- `_document.tsx` line 31 has `viewport-fit=cover`
**Warning signs:** Safe area padding has no effect on notch devices

### Pitfall 2: overscroll-behavior Breaks Inner Scroll Containers
**What goes wrong:** Setting `overscroll-behavior: none` on scrollable child elements prevents scroll chaining (parent can't scroll after child reaches boundary)
**Why it happens:** `overscroll-behavior: none` prevents both the overscroll effect AND scroll chaining
**How to avoid:** Only set `overscroll-behavior: none` on `html, body`. Use `contain` on inner containers if needed (but prefer none only at root level).
**Warning signs:** Nested scrollable areas (modals, dropdowns) feel "stuck" at boundaries

### Pitfall 3: Toast Drag Conflicts with Scroll
**What goes wrong:** Horizontal toast swipe accidentally triggers vertical scroll or vice versa
**Why it happens:** Browser doesn't know whether the touch is a swipe gesture or scroll until enough distance is traveled
**How to avoid:** Use `drag="x"` (not `true`) so only horizontal movement is tracked. Set `touch-action: pan-y` on the toast element so vertical scroll passes through to the page.
**Warning signs:** Scrolling through toast area feels jittery or blocked

### Pitfall 4: Safe Area Double-Padding
**What goes wrong:** Content has double the expected padding (e.g., 34px + 34px on iPhone)
**Why it happens:** Both the container AND child element add `env(safe-area-inset-bottom)` padding
**How to avoid:** Only apply safe area padding at the navigation surface level (GlassHeader, BottomTabBar), not on page content. `page-shell` already uses `--safe-area-bottom` in its padding-bottom calculation.
**Warning signs:** Excessive whitespace on notch devices, normal spacing on non-notch

### Pitfall 5: user-select: none Blocks Accessibility
**What goes wrong:** Screen reader users can't interact with or copy content
**Why it happens:** `user-select: none` on too-broad selectors removes text from the accessibility tree in some browsers
**How to avoid:** Only apply to interactive elements (buttons, tabs, nav items), never to content elements (paragraphs, headings, educational text)
**Warning signs:** VoiceOver/TalkBack can't read or copy question/answer text

### Pitfall 6: Haptic Calls in React Effects
**What goes wrong:** ESLint `react-hooks/set-state-in-effect` or related compiler rules flag haptic calls
**Why it happens:** `navigator.vibrate()` is a side effect that shouldn't run during render
**How to avoid:** Only call haptic functions from event handlers (`onClick`, `onDragEnd`, callback functions). Never from `useEffect` or during render.
**Warning signs:** React Compiler ESLint warnings in effect bodies

### Pitfall 7: motion/react dragMomentum with Manual Dismiss
**What goes wrong:** Toast continues to animate after it should be dismissed, or double-fires dismiss
**Why it happens:** `dragMomentum` (default `true`) applies inertia animation AFTER `onDragEnd`, which can move the element past the dismiss threshold
**How to avoid:** Set `dragMomentum={false}` and handle dismiss animation manually in `onDragEnd` using `useAnimate`. This is exactly the pattern SwipeableCard.tsx uses.
**Warning signs:** Toast flickers or dismiss callback fires twice

### Pitfall 8: Theme-Color Meta Tag Stale After Toggle
**What goes wrong:** Browser chrome color doesn't update when user toggles dark mode
**Why it happens:** `<meta name="theme-color">` needs dynamic updating
**How to avoid:** Already handled -- `ThemeContext.tsx` updates `meta[name="theme-color"]` on theme change. Verify the dark value `#1a1f36` and light value `#002868` match the app background.
**Warning signs:** Status bar stays blue/dark after toggling theme

## Code Examples

Verified patterns from the project codebase:

### Existing SwipeableCard Drag Pattern (proven)
```typescript
// Source: src/components/sort/SwipeableCard.tsx
const x = useMotionValue(0);
const [scope, animate] = useAnimate<HTMLDivElement>();

const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
  const { offset, velocity } = info;
  const distanceThreshold = cardWidth * 0.25;
  const velocityThreshold = 500;

  const isCommitted =
    Math.abs(velocity.x) > velocityThreshold ||
    Math.abs(offset.x) > distanceThreshold;

  if (isCommitted) {
    const exitX = direction === 'know' ? window.innerWidth + 100 : -(window.innerWidth + 100);
    animate(scope.current, { x: exitX }, {
      type: 'spring', velocity: velocity.x, stiffness: 200, damping: 30
    }).then(() => { /* cleanup */ });
  } else {
    animate(scope.current, { x: 0 }, {
      type: 'spring', stiffness: 500, damping: 30
    });
  }
}, [...]);
```

### Existing Haptics Pattern (to expand)
```typescript
// Source: src/lib/haptics.ts
const supportsVibration = typeof navigator !== 'undefined' && 'vibrate' in navigator;

export function hapticLight(): void {
  if (!supportsVibration) return;
  try { navigator.vibrate(10); } catch { /* silently ignore */ }
}
```

### Existing Theme-Color Dynamic Update (already working)
```typescript
// Source: src/contexts/ThemeContext.tsx
const metaThemeColor = document.querySelector('meta[name="theme-color"]');
if (metaThemeColor) {
  metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1f36' : '#002868');
}
```

### Existing Inline Vibrate Calls (to migrate)
```typescript
// Source: src/components/ui/FlagToggle.tsx line 52 -- needs migration to hapticLight()
if ('vibrate' in navigator) {
  navigator.vibrate(10);
}

// Source: src/components/sessions/UnfinishedBanner.tsx line 88 -- needs migration
navigator.vibrate?.(10);

// Source: src/components/interview/LongPressButton.tsx line 70 -- needs migration
navigator.vibrate(50);
```

## Discretion Recommendations

### Toast Positioning
**Recommendation:** Move toasts to **bottom-center** on mobile (above BottomTabBar), keep top-right on desktop. Rationale: Bottom placement is more accessible for thumb reach on mobile. Top placement on mobile requires the user to look away from their current interaction area. Position with `bottom: calc(env(safe-area-inset-bottom) + 72px)` to clear the tab bar.

### Error Toast Dismissibility
**Recommendation:** Make all toasts swipeable, including error/warning. Rationale: Users should never feel trapped by a notification. Error toasts already have a 6-second duration (longer than other types). Forcing explicit dismissal adds friction without benefit -- the user already read the error.

### Toast Stacking Swipe Behavior
**Recommendation:** Each toast individually swipeable. Rationale: Users may want to dismiss a less important toast while keeping an error toast visible. Individual swipe control is more natural.

### Drag Surface Area for Toasts
**Recommendation:** Entire toast surface is draggable. The current toasts have no interactive elements inside them (only a dismiss X button and text). Dragging the entire surface is simpler and more discoverable. The X button still works for click-dismiss.

### text-size-adjust Behavior
**Recommendation:** Set `-webkit-text-size-adjust: 100%` on `html`. This prevents Safari from auto-scaling text when rotating or in split view. It does NOT disable the iOS accessibility text size slider -- that uses `-webkit-text-size-adjust: auto` and Dynamic Type which this CSS property doesn't affect. The `100%` value is the standard approach used by normalize.css and modern CSS resets.

### Bottom-Fixed Element Safe Area Audit
**Recommendation:** Audit and fix three bottom-fixed elements:
1. `BottomTabBar.tsx` -- already has `env(safe-area-inset-bottom)` (verify glass extends into zone)
2. `SyncStatusIndicator.tsx` -- `bottom-20` is hardcoded; should be `bottom: calc(env(safe-area-inset-bottom) + 80px)`
3. `TestPage.tsx` bottom bar (line 989) -- needs `env(safe-area-inset-bottom)` padding

### Safe Area Application Scope
**Recommendation:** Apply in ALL modes. The `env()` values return `0px` in browser mode on non-notch devices anyway. There is no harm in always applying them, and it ensures correct behavior when the PWA is installed.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JS scroll event prevention for overscroll | CSS `overscroll-behavior` | Chrome 63 (2017), Safari 16 (2022) | No JS needed, zero jank |
| JS-based notch detection | CSS `env(safe-area-inset-*)` | Safari 11 (2017), Chrome 69 (2018) | Browser-native, maintained by OS |
| Custom gesture libraries | motion/react v12 built-in drag | motion v12 (2024) | Unified with animation library |
| `navigator.vibrate()` only (no iOS) | `navigator.vibrate()` + graceful no-op | Unchanged | iOS still doesn't support Vibration API. The `ios-haptics` npm package exists (uses `<input switch>` checkbox hack since Safari 17.4) but is too immature (80 stars, June 2025) for production use. |
| `user-select: none` on everything | Targeted selectors on interactive elements | Best practice shift ~2020 | Accessibility preserved |

**Deprecated/outdated:**
- `-webkit-overflow-scrolling: touch` -- no longer needed; all modern browsers handle momentum scroll natively
- `position: fixed` workarounds for iOS scroll -- resolved in iOS 15+
- `@viewport` CSS at-rule -- never shipped; use `<meta viewport>` instead

## Open Questions

1. **Ghost trail effect on toast dismiss**
   - What we know: User wants "faint ghost trail effect" when toast flies off
   - What's unclear: CSS-only approach or motion/react? A true trail would require rendering a semi-transparent clone or using CSS `filter: blur()` + motion value
   - Recommendation: Implement as a brief opacity trail using `useTransform` to derive a secondary opacity that fades faster than the main element. If too complex, a simple motion blur filter on exit is sufficient.

2. **Haptic timing for celebrations**
   - What we know: Heavy haptic should feel like "ta-da-da" multi-burst
   - What's unclear: Exact vibration pattern durations that feel festive on Android hardware
   - Recommendation: Start with `[15, 30, 15, 30, 40]` (two short pulses + one longer) and test on physical device. Adjust based on feel.

3. **Background dimming during toast drag**
   - What we know: User wants 5-10% opacity background dim during drag only
   - What's unclear: Whether "background" means the area behind the toast container or a full-page overlay
   - Recommendation: Add a motion-value-driven overlay behind the toast stack that fades to 5-10% black when any toast is being dragged. Use `useTransform` on the drag x value to drive overlay opacity.

## Sources

### Primary (HIGH confidence)
- [MDN overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior) -- CSS property, browser support
- [MDN env()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env) -- safe area inset values
- [MDN Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate) -- navigator.vibrate(), browser compat
- [Chrome DevRel overscroll-behavior blog](https://developer.chrome.com/blog/overscroll-behavior) -- pull-to-refresh prevention
- Context7 `/websites/motion_dev_react` -- drag API (onDragEnd, PanInfo, dragMomentum, dragElastic, dragTransition)

### Secondary (MEDIUM confidence)
- [web.dev PWA design](https://web.dev/learn/pwa/app-design) -- PWA standalone design patterns
- [Making PWAs feel native (gfor.rest)](https://www.gfor.rest/blog/making-pwas-feel-native) -- overscroll, safe areas, user-select patterns
- [Can I Use: Vibration API](https://caniuse.com/vibration) -- iOS Safari confirmed no support
- Project codebase analysis: `SwipeableCard.tsx`, `haptics.ts`, `BilingualToast.tsx`, `GlassHeader.tsx`, `BottomTabBar.tsx`, `ThemeContext.tsx`, `_document.tsx`, `globals.css`, `tailwind.config.js`, `manifest.json`

### Tertiary (LOW confidence)
- [ios-haptics npm](https://github.com/tijnjh/ios-haptics) -- Safari checkbox-switch haptic hack. Evaluated but NOT recommended. Too immature and fragile for production.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all technologies are browser-native CSS/APIs + existing motion/react. No new dependencies.
- Architecture: HIGH -- patterns proven in existing codebase (SwipeableCard drag, haptics.ts, env() safe areas). Mostly CSS additions.
- Pitfalls: HIGH -- well-documented CSS properties with clear browser support data. Toast drag pattern validated via SwipeableCard.

**Research date:** 2026-02-20
**Valid until:** 2026-04-20 (90 days -- all technologies are stable native APIs)
