---
phase: 17-ui-system-polish
plan: 02
subsystem: ui
tags: [motion, spring-animation, glass-morphism, prismatic-border, css-custom-properties]

requires:
  - phase: 17-01
    provides: "Prismatic border CSS system and glass tier design tokens in tokens.css"
  - phase: 15-01
    provides: "Original glass-card CSS class and GlassCard component in hub/"
provides:
  - "Shared spring animation config module (SPRING_BOUNCY, SPRING_SNAPPY, SPRING_GENTLE)"
  - "Stagger timing presets (STAGGER_FAST, STAGGER_DEFAULT, STAGGER_SLOW)"
  - "Tiered GlassCard component in ui/ with light/medium/heavy blur + prismatic border"
  - "Three-tier glass-morphism CSS system (glass-light, glass-medium, glass-heavy)"
  - "Backward-compat re-export from hub/GlassCard"
affects: [17-03, 17-04, 17-05, 17-06, 17-07, 17-08, 17-09, 17-10]

tech-stack:
  added: []
  patterns:
    - "Spring animation presets in src/lib/motion-config.ts for consistent micro-interactions"
    - "Tiered glass-morphism with CSS custom properties from tokens.css"
    - "Animated prismatic border via @property CSS and conic-gradient"
    - "Component re-export pattern for backward compatibility during migration"

key-files:
  created:
    - "src/lib/motion-config.ts"
    - "src/components/ui/GlassCard.tsx"
  modified:
    - "src/components/hub/GlassCard.tsx"
    - "src/styles/globals.css"

key-decisions:
  - "Glass tier CSS uses custom property tokens (--glass-light-blur, --glass-light-opacity) from tokens.css rather than hardcoded values"
  - "Prismatic border styles live in dedicated prismatic-border.css (imported by globals.css) using animated conic-gradient via @property"
  - "glass-card class retained as backward-compat alias for glass-light equivalent"
  - "glass-nav updated to use token-based heavy-tier blur for consistency"

patterns-established:
  - "Spring config import: import { SPRING_BOUNCY } from '@/lib/motion-config'"
  - "GlassCard tier usage: <GlassCard tier='medium' interactive>...</GlassCard>"
  - "Component migration: create in ui/, re-export from old path"

duration: 8min
completed: 2026-02-11
---

# Phase 17 Plan 02: Motion Config + GlassCard Tier System Summary

**Shared spring animation presets and three-tier GlassCard component with animated prismatic rainbow border**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-11T18:19:50Z
- **Completed:** 2026-02-11T18:28:48Z
- **Tasks:** 2
- **Files modified:** 4 (1 created, 1 created, 2 modified)

## Accomplishments
- Spring animation config module with BOUNCY/SNAPPY/GENTLE presets and stagger timing constants
- GlassCard component in ui/ with tier prop (light/medium/heavy) applying token-based glass blur + animated prismatic border
- All 10 existing hub/GlassCard imports continue working via backward-compat re-export
- Three-tier glass CSS system upgraded to use design token custom properties

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared spring configuration module** - `79dd41c` (feat)
2. **Task 2: Upgrade GlassCard with tier system and prismatic border** - `1974976` (feat)

## Files Created/Modified
- `src/lib/motion-config.ts` - Shared spring animation presets (SPRING_BOUNCY, SPRING_SNAPPY, SPRING_GENTLE) and stagger timing constants
- `src/components/ui/GlassCard.tsx` - Tiered glass-morphism card component with prismatic border and interactive hover mode
- `src/components/hub/GlassCard.tsx` - Backward compatibility re-export from ui/GlassCard
- `src/styles/globals.css` - Three-tier glass CSS system, prismatic-border.css import, token-based glass-nav, backdrop-filter fallbacks

## Decisions Made
- Glass tier CSS uses custom property tokens from tokens.css (--glass-light-blur, --glass-light-opacity etc.) rather than hardcoded pixel/opacity values -- enables theme-level tuning
- Prismatic border moved to dedicated prismatic-border.css with animated conic-gradient (superior to inline static linear-gradient) -- imported by globals.css
- Retained .glass-card as backward-compat alias mapped to glass-light tier -- existing components using glass-card class unaffected
- glass-nav updated from hardcoded blur values to token-based heavy-tier blur/opacity for visual consistency across the glass system

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Deduplicated prismatic-border styles**
- **Found during:** Task 2
- **Issue:** globals.css had inline prismatic-border CSS (static linear-gradient) that conflicted with the dedicated prismatic-border.css (animated conic-gradient) created in plan 17-01
- **Fix:** Removed inline prismatic-border styles from globals.css, added `@import './prismatic-border.css'` to import the animated version
- **Files modified:** src/styles/globals.css
- **Verification:** Build passes, prismatic-border class resolves correctly
- **Committed in:** 1974976 (Task 2 commit)

**2. [Rule 2 - Enhancement] Glass tier CSS upgraded to use design tokens**
- **Found during:** Task 2
- **Issue:** Plan specified hardcoded blur/opacity values; tokens.css already had --glass-*-blur and --glass-*-opacity custom properties from plan 17-01
- **Fix:** Glass tier classes use var(--glass-light-blur) etc. instead of hardcoded 16px/24px/32px; dark mode variants use token opacity; glass-card and glass-nav also tokenized
- **Files modified:** src/styles/globals.css
- **Verification:** Build passes, visual rendering unchanged
- **Committed in:** 1974976 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking dedup, 1 enhancement)
**Impact on plan:** Both auto-fixes improve maintainability. Dedup prevents CSS conflicts; tokenization enables theme-level tuning. No scope creep.

## Issues Encountered
- Task 1 was already committed from a previous partial execution (79dd41c) -- verified it matched plan spec exactly, no rework needed
- Prettier reformatted background gradients in globals.css from compact single-line to multi-line format -- accepted as style-only change

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Spring animation presets ready for import by all micro-interaction plans (17-03 through 17-10)
- GlassCard tier system ready for component upgrades across the app
- Prismatic border animation active on all GlassCard instances
- No blockers

---
*Phase: 17-ui-system-polish*
*Completed: 2026-02-11*
