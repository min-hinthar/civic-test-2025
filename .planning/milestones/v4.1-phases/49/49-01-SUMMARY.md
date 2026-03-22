---
phase: 49-error-handling-security
plan: 01
subsystem: ui
tags: [error-handling, bilingual, sanitization, sentry, error-boundary]

# Dependency graph
requires:
  - phase: 48-testing-ci
    provides: ErrorBoundary test infrastructure and renderWithProviders presets
provides:
  - SharedErrorFallback reusable bilingual error component
  - Sanitized error.tsx with sanitizeError() and useLanguage() fallback
  - Bilingual global-error.tsx with inline styles (no Tailwind dependency)
  - Bilingual not-found.tsx with useLanguage() and 404 display
affects: [49-02, 49-03, error-boundaries, session-wrappers]

# Tech tracking
tech-stack:
  added: []
  patterns: [SharedErrorFallback extraction pattern, localStorage language fallback for error pages]

key-files:
  created:
    - src/components/ui/SharedErrorFallback.tsx
  modified:
    - src/components/ErrorBoundary.tsx
    - app/error.tsx
    - app/global-error.tsx
    - app/not-found.tsx
    - src/__tests__/errorBoundary.test.tsx

key-decisions:
  - "SharedErrorFallback extracted as shared presentational component with BilingualMessage props"
  - "error.tsx uses useLanguage() with try-catch + localStorage fallback (hook always called, catch handles runtime failure)"
  - "global-error.tsx uses inline styles only and Sentry.captureException directly (not captureError wrapper)"
  - "Button text standardized to 'Return home' (was 'Return to home' in ErrorBoundary)"

patterns-established:
  - "SharedErrorFallback: reusable bilingual error UI with configurable retry/home buttons"
  - "localStorage language fallback: civic-test-language-mode key for error pages outside provider tree"

requirements-completed: [ERRS-01, ERRS-02]

# Metrics
duration: 7min
completed: 2026-03-20
---

# Phase 49 Plan 01: Error Pages Summary

**SharedErrorFallback component with sanitized bilingual error/404/global-error pages -- no raw error.message exposure**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-20T05:44:42Z
- **Completed:** 2026-03-20T05:52:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- SharedErrorFallback component with BilingualMessage props, 44px touch targets, amber warning icon, font-myanmar
- ErrorBoundary refactored to import SharedErrorFallback (removed 65-line inline ErrorFallback)
- error.tsx sanitized: sanitizeError() + captureError() + useLanguage() with localStorage fallback
- global-error.tsx: minimal inline-styles-only bilingual catastrophic fallback (no Tailwind dependency)
- not-found.tsx: bilingual 404 page with useLanguage(), font-myanmar, 404 display number

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SharedErrorFallback and refactor ErrorBoundary** - `eb17ba5` (feat)
2. **Task 2: Sanitize error.tsx, global-error.tsx, and not-found.tsx** - `6421a2b` (feat)

## Files Created/Modified
- `src/components/ui/SharedErrorFallback.tsx` - Shared bilingual error fallback with BilingualMessage props, onRetry/onGoHome optional buttons
- `src/components/ErrorBoundary.tsx` - Refactored to use SharedErrorFallback instead of inline ErrorFallback
- `app/error.tsx` - Route error page with sanitizeError(), captureError(), useLanguage() + localStorage fallback
- `app/global-error.tsx` - Catastrophic fallback with inline styles, hardcoded bilingual text, 44px button
- `app/not-found.tsx` - Bilingual 404 page with useLanguage(), font-myanmar, Go home CTA
- `src/__tests__/errorBoundary.test.tsx` - Updated button text assertion ("Return to home" -> "Return home")

## Decisions Made
- SharedErrorFallback uses `bg-muted/30` and `rounded-2xl` (per UI-SPEC) vs old ErrorFallback's `bg-surface shadow-lg rounded-lg`
- Button text standardized to "Return home" (shorter, matches UI-SPEC copywriting contract)
- error.tsx useLanguage() in try-catch satisfies Rules of Hooks (always called, catch handles runtime error not conditional invocation)
- global-error.tsx keeps direct Sentry.captureException (not captureError wrapper) since sentry.ts module itself may be broken in catastrophic failure

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated ErrorBoundary test for renamed button**
- **Found during:** Task 1
- **Issue:** Test expected "Return to home" but SharedErrorFallback uses "Return home" per UI-SPEC
- **Fix:** Updated test assertion from `/return to home/i` to `/return home/i`
- **Files modified:** src/__tests__/errorBoundary.test.tsx
- **Verification:** All 643 tests pass
- **Committed in:** eb17ba5

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Test text expectation update required by the rename. No scope creep.

## Issues Encountered
- Pre-existing typecheck errors in src/lib/providerOrderGuard.test.tsx (unrelated, not from our changes) -- ignored per scope boundary rules

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- SharedErrorFallback ready for reuse in Plan 02 (session error boundaries)
- ErrorBoundary refactored and tested, ready for wrapping session components
- All error pages bilingual and sanitized

## Self-Check: PASSED

All 6 files verified present. Both task commits (eb17ba5, 6421a2b) confirmed in git log.

---
*Phase: 49-error-handling-security*
*Completed: 2026-03-20*
