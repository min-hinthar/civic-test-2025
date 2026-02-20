---
phase: 30-mobile-native-feel
plan: 01
subsystem: ui
tags: [css, pwa, safe-area, tailwind, mobile, overscroll, user-select]

# Dependency graph
requires:
  - phase: none
    provides: n/a
provides:
  - CSS mobile guards (overscroll, user-select, touch-action, tap-highlight)
  - Tailwind safe area padding utilities (pt-safe-top, pb-safe-bottom, etc.)
  - Portrait orientation lock in manifest
  - Safe area inset handling on GlassHeader, BottomTabBar, SyncStatusIndicator
affects: [30-mobile-native-feel, 31-haptic-press-animations]

# Tech tracking
tech-stack:
  added: []
  patterns: [display-mode standalone media query for PWA-only CSS, env() safe area insets]

key-files:
  created: []
  modified:
    - src/styles/globals.css
    - tailwind.config.js
    - public/manifest.json
    - src/components/navigation/GlassHeader.tsx
    - src/components/pwa/SyncStatusIndicator.tsx

key-decisions:
  - "Overscroll guard scoped to @media (display-mode: standalone) only, not global"
  - "User-select uses targeted interactive-element approach, not global none + whitelist"
  - "Safe area insets applied via inline style env() for zero-cost on non-notch devices"
  - "BottomTabBar already had correct safe area handling, no changes needed"

patterns-established:
  - "display-mode: standalone media query for PWA-only CSS guards"
  - "env(safe-area-inset-*) inline styles for safe area padding on fixed/sticky elements"

requirements-completed: [MOBI-01, MOBI-02, MOBI-03]

# Metrics
duration: 8min
completed: 2026-02-20
---

# Phase 30 Plan 01: CSS Mobile Guards Summary

**CSS-level overscroll guard, user-select guards, touch-action manipulation, safe area insets on header/tab-bar/sync-indicator, and portrait orientation lock**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-20T07:13:01Z
- **Completed:** 2026-02-20T07:20:47Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Standalone-mode overscroll guard prevents rubber-band white flash in PWA mode
- Interactive elements have user-select: none while educational content (p, .font-myanmar) preserves text selection
- touch-action: manipulation disables double-tap zoom while keeping pinch-zoom and scroll
- Safe area insets applied to GlassHeader (top), BottomTabBar (bottom, already existed), and SyncStatusIndicator (bottom + tab bar clearance)
- Tailwind safe area padding utilities available for future use
- Portrait orientation lock in manifest.json

## Task Commits

Each task was committed atomically:

1. **Task 1: Add CSS mobile guards and Tailwind safe area utilities** - `330d35d` (feat)
2. **Task 2: Apply safe area insets to GlassHeader, BottomTabBar, SyncStatusIndicator** - `5de2832` (feat)

## Files Created/Modified
- `src/styles/globals.css` - Mobile native guards section (overscroll, user-select, touch-action, tap-highlight, text-size-adjust), removed deprecated -webkit-overflow-scrolling
- `tailwind.config.js` - Safe area padding utility classes (pt-safe-top, pb-safe-bottom, pl-safe-left, pr-safe-right)
- `public/manifest.json` - Portrait orientation lock
- `src/components/navigation/GlassHeader.tsx` - Safe area top padding via inline style
- `src/components/pwa/SyncStatusIndicator.tsx` - Bottom positioning accounts for safe area + tab bar height via calc()

## Decisions Made
- Overscroll guard scoped to `@media (display-mode: standalone)` only -- avoids affecting browser scroll behavior
- User-select uses targeted interactive-element approach (not global none + whitelist) per research recommendation
- Safe area insets applied via inline style `env()` which returns 0px on non-notch devices -- zero visual impact on regular browsers
- BottomTabBar already had correct safe area handling -- verified and left unchanged

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed duplicate html selector in globals.css**
- **Found during:** Task 1
- **Issue:** Adding new `html` block for mobile guards created a duplicate selector with the existing `html { scroll-behavior: smooth }` block, triggering stylelint no-duplicate-selectors
- **Fix:** Merged `scroll-behavior: smooth` into the new `html` block with touch-action and text-size-adjust
- **Files modified:** src/styles/globals.css
- **Verification:** stylelint passes (only pre-existing vendor-prefix warnings remain)
- **Committed in:** 330d35d (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary for stylelint compliance. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Safe area utilities and mobile guards are in place for Phase 31 (haptic/press animations)
- The tap-highlight removal (`-webkit-tap-highlight-color: transparent`) is a placeholder -- Phase 31 will add proper press feedback animations
- All CSS and component changes are backward compatible (env() returns 0px on non-notch devices)

---
*Phase: 30-mobile-native-feel*
*Completed: 2026-02-20*
