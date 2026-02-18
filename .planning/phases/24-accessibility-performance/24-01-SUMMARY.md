---
phase: 24-accessibility-performance
plan: 01
subsystem: testing
tags: [eslint, jsx-a11y, vitest-axe, axe-core, accessibility, a11y]

# Dependency graph
requires:
  - phase: none
    provides: N/A (first plan in phase)
provides:
  - eslint-plugin-jsx-a11y integrated into ESLint flat config
  - vitest-axe toHaveNoViolations matcher globally available
  - Initial a11y test suite pattern for FeedbackPanel and Toast
  - @next/bundle-analyzer installed (configured in Plan 07)
affects: [24-02, 24-03, 24-04, 24-05, 24-06, 24-07]

# Tech tracking
tech-stack:
  added: [eslint-plugin-jsx-a11y@6.10.2, vitest-axe@0.1.0, @next/bundle-analyzer@16.1.6]
  patterns: [vitest-axe global matcher registration via expect.extend, a11y test pattern with axe(container)]

key-files:
  created:
    - src/__tests__/a11y/feedbackPanel.a11y.test.tsx
    - src/__tests__/a11y/toast.a11y.test.tsx
    - src/types/vitest-axe.d.ts
  modified:
    - eslint.config.mjs
    - src/__tests__/setup.ts
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "jsx-a11y/no-autofocus disabled (project intentionally uses autoFocus for modals and UX flows)"
  - "click-events-have-key-events, no-static-element-interactions, no-noninteractive-element-interactions set to warn (components manage focus programmatically)"
  - "interactive-supports-focus and no-noninteractive-tabindex set to warn (roving focus and tappable listitem patterns)"
  - "no-noninteractive-element-to-interactive-role set to warn (PillTabBar tablist role on div is standard WAI-ARIA)"
  - "vitest-axe registered via expect.extend(matchers) not import extend-expect (extend-expect.js is empty in v0.1.0)"
  - "Type augmentation for vitest Assertion<T> uses eslint-disable for unused T generic (required by vitest interface signature)"

patterns-established:
  - "a11y test pattern: render component, run axe(container), assert toHaveNoViolations()"
  - "Mock hooks (useReducedMotion, useTTS, useTTSSettings) for isolated component a11y testing"

# Metrics
duration: 51min
completed: 2026-02-18
---

# Phase 24 Plan 01: A11y Linting and Testing Infrastructure Summary

**eslint-plugin-jsx-a11y with recommended rules integrated into ESLint flat config, vitest-axe configured globally, and 6 a11y tests passing for FeedbackPanel and Toast components**

## Performance

- **Duration:** 51 min
- **Started:** 2026-02-18T01:10:17Z
- **Completed:** 2026-02-18T02:01:14Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- eslint-plugin-jsx-a11y recommended rules active in ESLint flat config with targeted overrides for intentional patterns
- vitest-axe toHaveNoViolations() matcher globally available in all test files via setup.ts
- 6 a11y tests passing: 3 for FeedbackPanel (correct, incorrect, incorrect+explanation) and 3 for Toast (error, success, container ARIA)
- @next/bundle-analyzer installed for later use in Plan 07

## Task Commits

Each task was committed atomically:

1. **Task 1: Install a11y dev dependencies and configure ESLint jsx-a11y** - `39fa98a` (chore)
2. **Task 2: Configure vitest-axe and write initial a11y tests** - `83542f7` (test)

Note: eslint.config.mjs changes were captured in a prior parallel commit (`f55bb9f`) due to concurrent agent execution.

## Files Created/Modified
- `eslint.config.mjs` - Added jsx-a11y plugin and recommended rules with targeted overrides
- `src/__tests__/setup.ts` - Registered vitest-axe matchers globally
- `src/__tests__/a11y/feedbackPanel.a11y.test.tsx` - FeedbackPanel accessibility tests (3 tests)
- `src/__tests__/a11y/toast.a11y.test.tsx` - Toast accessibility tests (3 tests)
- `src/types/vitest-axe.d.ts` - TypeScript type declarations for vitest-axe matchers
- `package.json` - Added eslint-plugin-jsx-a11y, vitest-axe, @next/bundle-analyzer
- `pnpm-lock.yaml` - Updated lockfile

## Decisions Made
- **jsx-a11y/no-autofocus disabled**: Project intentionally uses autoFocus for modal dialogs and UX flows (ResumePromptModal, SocialOptInFlow, InterviewSession)
- **Interactive pattern rules set to warn**: click-events-have-key-events, no-static-element-interactions, no-noninteractive-element-interactions downgraded to warnings because components like Flashcard3D, PracticeSession, and SegmentedProgressBar manage focus programmatically
- **vitest-axe extend-expect is empty**: vitest-axe v0.1.0's extend-expect.js is a 0-byte file; used explicit `expect.extend(matchers)` pattern instead
- **Unused currentIndex in SegmentedProgressBar**: Pre-existing unused variable renamed to `_currentIndex` (captured in parallel agent commit)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unused currentIndex in SegmentedProgressBar**
- **Found during:** Task 1 (ESLint lint check)
- **Issue:** `currentIndex` prop was destructured but never used in SegmentedProgressBar, triggering @typescript-eslint/no-unused-vars
- **Fix:** Renamed to `_currentIndex` to match argsIgnorePattern
- **Files modified:** src/components/quiz/SegmentedProgressBar.tsx
- **Verification:** `pnpm run lint` passes
- **Committed in:** parallel agent commit (was picked up during concurrent execution)

**2. [Rule 3 - Blocking] Fixed vitest-axe extend-expect being empty**
- **Found during:** Task 2 (vitest-axe configuration)
- **Issue:** `import 'vitest-axe/extend-expect'` did nothing because the file is 0 bytes in v0.1.0
- **Fix:** Used `import * as matchers from 'vitest-axe/matchers'` + `expect.extend(matchers)` instead
- **Files modified:** src/__tests__/setup.ts
- **Verification:** All 6 a11y tests pass with toHaveNoViolations matcher working
- **Committed in:** 83542f7

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
- **Parallel agent interference**: eslint.config.mjs was repeatedly reverted by Prettier formatting triggered by concurrent agents. Resolved by staging immediately after writing.
- **Package.json not saved**: First `pnpm add -D` installed packages but they were lost from package.json during concurrent commits. Resolved by re-running `pnpm add -D`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- a11y linting infrastructure ready for all subsequent plans in Phase 24
- vitest-axe test pattern established for Plans 02-06 to add more component a11y tests
- 15 jsx-a11y warnings remain as actionable backlog for future cleanup

## Self-Check: PASSED

All files verified present:
- eslint.config.mjs
- src/__tests__/setup.ts
- src/__tests__/a11y/feedbackPanel.a11y.test.tsx
- src/__tests__/a11y/toast.a11y.test.tsx
- src/types/vitest-axe.d.ts
- package.json

All commits verified:
- 39fa98a (chore: install deps)
- 83542f7 (test: vitest-axe + a11y tests)

---
*Phase: 24-accessibility-performance*
*Completed: 2026-02-18*
