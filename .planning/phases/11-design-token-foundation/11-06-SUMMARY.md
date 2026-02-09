---
phase: 11-design-token-foundation
plan: 06
subsystem: ui
tags: [css-custom-properties, design-tokens, gradients, dark-mode, theming]

# Dependency graph
requires:
  - phase: 11-01
    provides: "Two-tier token system (primitives + semantics) in tokens.css"
provides:
  - "Fully tokenized globals.css with zero hardcoded color values"
  - "Semantic active tokens for chunky shadow utilities (success-active, destructive-active, accent-purple-active)"
  - "Token-based decorative gradients that adapt to theme"
affects: [11-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Gradient tokenization: hsl(var(--color-token) / alpha) format for decorative gradients"
    - "Overlay shadow token: hsl(var(--color-overlay) / alpha) for neutral shadows"
    - "Active state tokens: --color-*-active for chunky shadow pressed states"

key-files:
  created: []
  modified:
    - "src/styles/globals.css"
    - "src/styles/tokens.css"

key-decisions:
  - "Decorative gradients use 'close enough' semantic tokens rather than pixel-perfect rgba matching -- visual character preserved, exact colors adapted to token system"
  - "New --green-700 primitive added (142 76% 30%) for success-active shadow"
  - "Dark mode active tokens use one-step-lighter primitives (green-600, red-600, purple-600) for readability on dark backgrounds"
  - "glass-panel and stat-card dark: overrides replaced with semantic token classes (dark:bg-background/80 instead of dark:bg-slate-950/80)"

patterns-established:
  - "All globals.css color values use hsl(var(--color-*)) or hsl(var(--color-*) / alpha) format"
  - "Chunky shadow utilities reference semantic active tokens, not primitive palette vars"

# Metrics
duration: 10min
completed: 2026-02-09
---

# Phase 11 Plan 06: Globals.css Tokenization Summary

**Eliminated all hardcoded rgba/hsl color values from globals.css by converting decorative gradients, shadows, and @layer utilities to use the semantic token system with hsl(var(--color-*) / alpha) format**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-09T11:35:59Z
- **Completed:** 2026-02-09T11:46:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Converted 12 hardcoded rgba() gradient color values in page-shell::before and body::before pseudo-elements to token references
- Replaced hardcoded hsl(142 76% 30%) in chunky-shadow-success and primitive refs (--red-700, --purple-700) in other chunky shadows with semantic active tokens
- Replaced rgba(0,0,0,0.25) neutral shadow in card-edge-safe with hsl(var(--color-overlay) / 0.25)
- Replaced non-semantic dark: overrides (dark:bg-slate-950/80, dark:border-white/10) in glass-panel and stat-card with token-based classes
- Added 3 new semantic tokens (--color-success-active, --color-destructive-active, --color-accent-purple-active) with dark mode overrides
- Added --green-700 primitive token (142 76% 30%) to tokens.css

## Task Commits

Each task was committed atomically:

1. **Task 1: Tokenize globals.css gradients and @layer utilities** - `0ff3d1c` (feat)

## Files Created/Modified
- `src/styles/globals.css` - All color values now reference tokens; zero rgba(), zero hardcoded hsl(), zero hex values remain
- `src/styles/tokens.css` - Added --green-700 primitive, --color-success-active, --color-destructive-active, --color-accent-purple-active semantic tokens with dark mode overrides

## Decisions Made
- Decorative gradients use semantic tokens that approximate the original rgba colors (e.g., patriotic-red/0.15 instead of rgba(255,182,193,0.4)) -- the hue and feel matter more than pixel-perfect matching for blurred background decorations
- card-edge-safe shadow uses --color-overlay (0 0% 0%) which is the neutral overlay token, semantically correct for a black shadow
- glass-panel and stat-card dark: overrides simplified from hardcoded slate-950 to semantic background token

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added --green-700 primitive token**
- **Found during:** Task 1 (tokenizing chunky-shadow-success)
- **Issue:** The hardcoded `hsl(142 76% 30%)` in chunky-shadow-success needed a --green-700 primitive, but only --green-600 (142 76% 36%) existed in the palette
- **Fix:** Added `--green-700: 142 76% 30%` to the green primitive palette in tokens.css
- **Files modified:** src/styles/tokens.css
- **Verification:** Build passes, value matches the original hardcoded value exactly
- **Committed in:** 0ff3d1c (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential for token system completeness. No scope creep.

## Issues Encountered
None - plan executed as designed.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- globals.css is fully tokenized -- the last hardcoded color values in the style layer are eliminated
- Token system is now the single source of truth for all colors in CSS
- Ready for plan 07 (lint enforcement) to prevent hardcoded colors from being reintroduced

## Self-Check: PASSED

- [x] src/styles/globals.css exists (328 lines)
- [x] src/styles/tokens.css exists (370 lines)
- [x] Commit 0ff3d1c exists (Task 1)
- [x] Build passes (npx next build)
- [x] Zero rgba() values in globals.css
- [x] Zero hardcoded hsl() values in globals.css
- [x] Zero hex color values in globals.css

---
*Phase: 11-design-token-foundation*
*Completed: 2026-02-09*
