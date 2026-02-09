---
phase: 11-design-token-foundation
plan: 02
subsystem: ui
tags: [dark-mode, fouc-prevention, theme-toggle, motion-react, pwa, theme-color, system-preference]

# Dependency graph
requires:
  - phase: 11-01
    provides: "Design token system with semantic CSS variables and Tailwind integration"
provides:
  - "FOUC prevention via blocking inline script in _document.tsx"
  - "PWA theme-color meta tag dynamic update on theme change"
  - "System preference change listener (respects manual override)"
  - "Animated sun/moon toggle component using motion/react"
  - "Smooth theme transition CSS via temporary class"
affects: [11-03, 11-04, 11-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Blocking inline script in _document.tsx for FOUC prevention"
    - "Temporary CSS class (theme-transitioning) for smooth theme switch without affecting interactive elements"
    - "System preference listener that defers to manual override via localStorage check"
    - "motion/react animated SVG for icon morphing (sun rays scale + crescent appear)"

key-files:
  created: []
  modified:
    - "pages/_document.tsx"
    - "src/contexts/ThemeContext.tsx"
    - "src/components/ThemeToggle.tsx"
    - "src/styles/globals.css"

key-decisions:
  - "Theme transition uses temporary CSS class (theme-transitioning) applied only to html, body, and page-shell, removed after 500ms -- avoids global * transition that would cause jank on interactive elements"
  - "System preference listener ignores OS changes once user has manually toggled (localStorage key exists = manual override)"
  - "Removed unnecessary eslint-disable for react-hooks/set-state-in-effect in system preference handler since setTheme is called inside an event callback, not directly in the effect body"

patterns-established:
  - "FOUC prevention: THEME_SCRIPT const with IIFE in _document.tsx, reads civic-theme from localStorage"
  - "PWA theme-color: dark=#1a1f36, light=#002868 -- synchronized in both blocking script and ThemeContext effect"
  - "Theme toggle animation: motion.svg with rotation, motion.g for sun rays, motion.circle for crescent"

# Metrics
duration: 16min
completed: 2026-02-09
---

# Phase 11 Plan 02: Dark Mode Infrastructure Summary

**FOUC-free dark mode with blocking script, animated sun/moon motion/react toggle, PWA theme-color sync, and system preference listener**

## Performance

- **Duration:** 16 min
- **Started:** 2026-02-09T11:14:46Z
- **Completed:** 2026-02-09T11:30:28Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Added blocking inline script in _document.tsx that applies theme class before React hydrates, eliminating visible flash of unstyled content (FOUC)
- Enhanced ThemeContext with PWA theme-color meta tag updates, system preference change listener (defers to manual override), and smooth theme transition via temporary CSS class
- Replaced Lucide Sun/Moon icons with animated SVG toggle using motion/react -- sun rays scale down, moon crescent appears, entire icon rotates 360 degrees on toggle
- Added theme-transitioning CSS class scoped to html/body/page-shell for smooth background-color and color transitions without affecting interactive element responsiveness

## Task Commits

Each task was committed atomically:

1. **Task 1: Add FOUC prevention and enhance ThemeContext** - `f197bc5` (feat)
2. **Task 2: Create animated sun/moon toggle with motion/react** - `2d4e25f` (feat)

## Files Created/Modified
- `pages/_document.tsx` - Added THEME_SCRIPT blocking inline script for FOUC prevention (reads localStorage, applies theme class, updates theme-color meta)
- `src/contexts/ThemeContext.tsx` - Added PWA theme-color update, system preference change listener, smooth transition class management
- `src/components/ThemeToggle.tsx` - Complete rewrite: Lucide icons replaced with motion/react animated SVG (sun rays, central circle, moon crescent)
- `src/styles/globals.css` - Added theme-transitioning CSS class for smooth background/color transitions during theme toggle

## Decisions Made
- Used temporary CSS class (`theme-transitioning`) instead of global `*` transition to avoid jank on buttons and interactive elements. Class is applied for 500ms then removed.
- System preference listener only responds when no manual override exists in localStorage. This respects the locked "two-state toggle" decision: once user manually toggles, OS preference changes are ignored.
- Removed unnecessary eslint-disable directive for `react-hooks/set-state-in-effect` in the system preference handler -- the rule only fires for `setState` called directly in effect bodies, not inside event handler callbacks.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unnecessary eslint-disable directive**
- **Found during:** Task 1 (ThemeContext enhancements)
- **Issue:** Added eslint-disable for `react-hooks/set-state-in-effect` in the system preference handler, but the rule doesn't fire because `setTheme` is called inside an event handler callback, not directly in the effect body
- **Fix:** Removed the unnecessary eslint-disable comment to avoid ESLint warning about unused directive
- **Files modified:** src/contexts/ThemeContext.tsx
- **Verification:** Build passes with no ESLint warnings
- **Committed in:** f197bc5 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor cleanup, no scope change.

## Issues Encountered
- Initial build failed with EPERM on sw.js due to locked file from running dev server. Resolved by killing ports 3000-3003 and clearing corrupted .next directory.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Dark mode infrastructure is complete: no FOUC, smooth transitions, PWA meta updates, animated toggle
- Components can now be migrated from `dark:` prefix overrides to semantic token classes (plans 03-05)
- The toggle uses new semantic Tailwind classes (bg-surface, bg-surface-muted) from Plan 01's token system

## Self-Check: PASSED

- [x] pages/_document.tsx contains THEME_SCRIPT blocking script
- [x] src/contexts/ThemeContext.tsx updates meta[name="theme-color"]
- [x] src/contexts/ThemeContext.tsx has matchMedia system preference listener
- [x] src/contexts/ThemeContext.tsx has theme-transitioning class logic
- [x] src/components/ThemeToggle.tsx imports from motion/react (not lucide-react)
- [x] src/components/ThemeToggle.tsx contains motion.svg, motion.g, motion.circle
- [x] src/styles/globals.css has theme-transitioning CSS class
- [x] Commit f197bc5 exists (Task 1)
- [x] Commit 2d4e25f exists (Task 2)
- [x] Build passes (npx next build)

---
*Phase: 11-design-token-foundation*
*Completed: 2026-02-09*
