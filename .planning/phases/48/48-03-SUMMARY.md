---
phase: 48-test-infrastructure-quick-wins
plan: 03
subsystem: testing
tags: [vitest, testing-library, react-context, provider-tree, test-utility]

# Dependency graph
requires:
  - phase: none
    provides: n/a
provides:
  - renderWithProviders test utility with 3 presets (minimal, core, full)
  - ProviderName and RenderWithProvidersOptions exported types
  - Provider override map for fine-grained test configuration
affects: [49-error-boundary-tests, 51-context-provider-tests]

# Tech tracking
tech-stack:
  added: []
  patterns: [renderWithProviders preset system, PROVIDER_ORDER canonical ordering, builder pattern for provider tree composition]

key-files:
  created:
    - src/__tests__/utils/renderWithProviders.tsx
    - src/__tests__/utils/renderWithProviders.test.tsx
  modified: []

key-decisions:
  - "Core preset includes ErrorBoundary + Auth + Language + Theme + Toast + State (covers ~78% of component test needs)"
  - "Provider ordering enforced via PROVIDER_ORDER array matching ClientProviders.tsx exactly"
  - "Enhanced speechSynthesis mock with addEventListener/removeEventListener for full preset compatibility"

patterns-established:
  - "renderWithProviders preset system: minimal for unit tests, core for most component tests, full for integration tests"
  - "Provider override map: add/remove individual providers on top of any preset"
  - "Module-level vi.mock declarations for all provider dependencies consolidated in test file"

requirements-completed: [TEST-01]

# Metrics
duration: 13min
completed: 2026-03-20
---

# Phase 48 Plan 03: renderWithProviders Test Utility Summary

**Shared renderWithProviders utility with 3-tier preset system (minimal/core/full) matching ClientProviders.tsx provider ordering**

## Performance

- **Duration:** 13 min
- **Started:** 2026-03-20T01:59:04Z
- **Completed:** 2026-03-20T02:11:49Z
- **Tasks:** 1 (TDD: RED + GREEN)
- **Files modified:** 2

## Accomplishments
- Created renderWithProviders utility with 3 presets covering different test complexity levels
- Provider override map allows adding/removing individual providers on top of any preset
- PROVIDER_ORDER array enforces exact ClientProviders.tsx nesting order
- 9 tests verifying preset system, context access, override map, and RTL return value
- All 627 tests pass with no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): Failing tests** - `e3db605` (test)
2. **Task 1 (GREEN): Implementation** - `09a40d8` (feat)

_TDD task: RED (failing tests) then GREEN (implementation passing all tests)_

## Files Created/Modified
- `src/__tests__/utils/renderWithProviders.tsx` - Shared test render utility with preset system, provider override map, and PROVIDER_ORDER matching ClientProviders.tsx
- `src/__tests__/utils/renderWithProviders.test.tsx` - 9 tests covering all presets, context access, overrides, and RTL utilities

## Decisions Made
- Core preset includes 6 providers (ErrorBoundary, Auth, Language, Theme, Toast, State) -- covers the vast majority of component test needs without the heavier providers (TTS, Offline, Social, SRS, Navigation)
- Enhanced speechSynthesis mock with addEventListener/removeEventListener in test file since global setup mock was incomplete for TTSProvider's voiceschanged listener
- Used builder pattern iterating PROVIDER_ORDER in reverse to compose the provider tree from outermost to innermost

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added speechSynthesis addEventListener to mock**
- **Found during:** Task 1 (GREEN phase, full preset test)
- **Issue:** TTSProvider calls `window.speechSynthesis.addEventListener('voiceschanged', ...)` but global setup.ts mock only provides speak/cancel/getVoices without addEventListener
- **Fix:** Added enhanced speechSynthesis mock in test file with addEventListener/removeEventListener
- **Files modified:** src/__tests__/utils/renderWithProviders.test.tsx
- **Verification:** Full preset test passes, all 627 tests pass
- **Committed in:** 09a40d8 (GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for full preset to work. No scope creep.

## Issues Encountered
None beyond the speechSynthesis mock gap documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- renderWithProviders utility ready for Phase 49 (error boundary tests) and Phase 51 (context provider tests)
- All presets verified working: minimal, core, full
- Provider override map tested with TTS addition to core preset

---
*Phase: 48-test-infrastructure-quick-wins*
*Completed: 2026-03-20*
