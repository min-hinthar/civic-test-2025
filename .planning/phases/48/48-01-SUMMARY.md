---
phase: 48-test-infrastructure-quick-wins
plan: 01
subsystem: infra
tags: [dotlottie, wasm, rls, supabase, tree-shaking, dead-code]

# Dependency graph
requires: []
provides:
  - "Cleaned dependency tree without @lottiefiles/dotlottie-react (~200KB WASM removed)"
  - "Documented safeAsync as reserved infrastructure with @reserved JSDoc"
  - "Tighter RLS policy set with 5 redundant INSERT policies removed"
affects: [celebrations, database, async-utilities]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "@reserved JSDoc tag for kept-but-unused infrastructure code"

key-files:
  created: []
  modified:
    - "src/components/celebrations/CelebrationOverlay.tsx"
    - "src/components/celebrations/index.ts"
    - "src/lib/async/safeAsync.ts"
    - "src/lib/async/index.ts"
    - "supabase/schema.sql"
    - "package.json"

key-decisions:
  - "DotLottie removal is safe: no .lottie assets in public/, component rendered nothing via Suspense fallback={null}"
  - "safeAsync kept (not deleted) as reserved infrastructure for future Result-tuple pattern adoption"

patterns-established:
  - "@reserved JSDoc: tag for code intentionally kept but not currently consumed"

requirements-completed: [DEPS-01, DEPS-02, DEPS-03]

# Metrics
duration: 12min
completed: 2026-03-20
---

# Phase 48 Plan 01: Dead Dependency Removal Summary

**Removed @lottiefiles/dotlottie-react WASM dependency (~200KB), documented safeAsync as reserved, cleaned 5 redundant RLS INSERT policies**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-20T01:58:34Z
- **Completed:** 2026-03-20T02:10:59Z
- **Tasks:** 2
- **Files modified:** 6 (+ pnpm-lock.yaml + 1 deleted)

## Accomplishments
- Removed @lottiefiles/dotlottie-react dependency and DotLottieAnimation component (~200KB WASM bundle savings)
- Documented safeAsync.ts with @reserved JSDoc tag marking it as intentionally kept infrastructure
- Removed 5 redundant RLS INSERT policies from schema.sql (streak_data, earned_badges, user_settings, user_bookmarks, mock_tests) -- each already covered by ALL policies

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove DotLottie package and component** - `8f764dc` (feat)
2. **Task 2: Document safeAsync + clean RLS policies** - `1c0a15d` (chore)

## Files Created/Modified
- `src/components/celebrations/DotLottieAnimation.tsx` - Deleted (150 LOC dead code)
- `src/components/celebrations/CelebrationOverlay.tsx` - Removed DotLottie import, interface fields, config fields, JSX block
- `src/components/celebrations/index.ts` - Removed DotLottieAnimation export (3 exports remain)
- `package.json` - Removed @lottiefiles/dotlottie-react from dependencies
- `src/lib/async/safeAsync.ts` - Added @reserved JSDoc with cost/usage documentation
- `src/lib/async/index.ts` - Added ACTIVE/RESERVED annotations to export descriptions
- `supabase/schema.sql` - Removed 5 redundant INSERT policies

## Decisions Made
- DotLottie removal confirmed safe: no .lottie asset files exist in public/, so the component was rendering nothing (Suspense fallback={null}). Celebrations continue via confetti + sound + haptics.
- safeAsync kept as reserved infrastructure rather than deleted -- zero runtime cost (tree-shaken) and useful for future Result-tuple pattern standardization.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing typecheck failure in `renderWithProviders.test.tsx` from plan 48-03 (TDD RED phase, test written before implementation). Not related to this plan's changes.
- Pre-existing Next.js 16 build trace error (`_not-found/page.js.nft.json`). Build compiles and generates all pages successfully; only trace collection fails. Not related to this plan's changes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Dependency tree cleaned, ready for remaining Phase 48 plans
- CELB-06 blocker (DotLottie removal) resolved

---
*Phase: 48-test-infrastructure-quick-wins*
*Completed: 2026-03-20*
