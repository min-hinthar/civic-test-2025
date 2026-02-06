---
phase: 01-foundation-code-quality
plan: 04
subsystem: error-handling
tags: [sentry, error-boundary, toast, bilingual, pii-stripping, react]

# Dependency graph
requires:
  - phase: 01-01
    provides: testing infrastructure (Vitest)
provides:
  - ErrorBoundary component with bilingual fallback UI
  - BilingualToast notification system
  - Error sanitizer for safe user-facing messages
  - Sentry PII stripping via beforeSend hook
  - captureError and setUserContext helpers
affects: [02-authentication, error-handling, user-experience]

# Tech tracking
tech-stack:
  added: []  # @sentry/nextjs was already installed
  patterns:
    - Error sanitization for user-facing messages
    - PII stripping before Sentry reporting
    - User ID hashing (djb2 algorithm)
    - useSyncExternalStore for hydration-safe client detection

key-files:
  created:
    - src/lib/errorSanitizer.ts
    - src/components/ErrorBoundary.tsx
    - src/components/BilingualToast.tsx
    - src/lib/sentry.ts
    - src/__tests__/errorSanitizer.test.ts
    - src/__tests__/errorBoundary.test.tsx
  modified:
    - src/AppShell.tsx
    - instrumentation-client.ts
    - sentry.server.config.ts
    - sentry.edge.config.ts

key-decisions:
  - "Use djb2 hash for user ID anonymization (consistent across sanitizer and sentry helpers)"
  - "Error messages map to bilingual format { en: string, my: string }"
  - "beforeSend handler strips PII at Sentry event level, not just error level"
  - "Fix: Replace useState+useEffect with useSyncExternalStore for isClient detection"

patterns-established:
  - "Bilingual message format: { en: string, my: string }"
  - "Error sanitization: sanitizeError() for UI, sanitizeForSentry() for reporting"
  - "PII patterns to strip: emails, UUIDs, table names, SQL, stack traces"
  - "User context: setUserContext(userId) with hashed ID only"

# Metrics
duration: 14min
completed: 2026-02-05
---

# Phase 01 Plan 04: Error Handling and User Safety Summary

**Bilingual error boundaries with user-safe messages, toast notifications, and Sentry PII stripping for privacy-safe error reporting**

## Performance

- **Duration:** 14 min
- **Started:** 2026-02-06T05:46:19Z
- **Completed:** 2026-02-06T06:00:27Z
- **Tasks:** 4
- **Files modified:** 10

## Accomplishments

- Error sanitizer strips sensitive data (table names, SQL, stack traces, UUIDs, emails) before display
- Bilingual error messages in English and Burmese for all error states
- ErrorBoundary wraps app routes with "Try again" and "Return to home" recovery options
- Sentry reports errors with hashed user IDs only (no raw PII)
- Toast notification system with auto-dismiss and accessibility support

## Task Commits

Each task was committed atomically:

1. **Task 1: Error message sanitizer with tests** - `61b726d` (feat)
2. **Task 2: Bilingual toast notification system** - `ec0dbc8` (feat)
3. **Task 3: React error boundary with bilingual fallback** - `28d983d` (feat)
4. **Task 4: Sentry integration** - `d9af6e7` (feat)

## Files Created/Modified

- `src/lib/errorSanitizer.ts` - Error sanitization with bilingual messages and PII stripping
- `src/components/ErrorBoundary.tsx` - React error boundary with bilingual fallback UI
- `src/components/BilingualToast.tsx` - Toast notifications with EN/MY support
- `src/lib/sentry.ts` - Sentry helpers with beforeSend PII handler
- `src/__tests__/errorSanitizer.test.ts` - 49 tests for sanitization logic
- `src/__tests__/errorBoundary.test.tsx` - 11 tests for error boundary
- `src/AppShell.tsx` - Wrapped routes with ErrorBoundary and ToastProvider
- `instrumentation-client.ts` - Added beforeSend handler, disabled sendDefaultPii
- `sentry.server.config.ts` - Added beforeSend handler, disabled sendDefaultPii
- `sentry.edge.config.ts` - Added beforeSend handler, disabled sendDefaultPii

## Decisions Made

- **djb2 hash for user IDs:** Simple, fast, consistent between sanitizer and sentry modules
- **Bilingual format `{ en, my }`:** Matches app's existing pattern, easy to extend
- **beforeSend for PII stripping:** Catches all PII at event level, not just explicit errors
- **useSyncExternalStore for isClient:** Fixed pre-existing ESLint error with hydration-safe pattern

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed pre-existing ESLint error in AppShell.tsx**
- **Found during:** Task 3 (Error boundary integration)
- **Issue:** `setIsClient(true)` in useEffect triggered `react-hooks/set-state-in-effect` error
- **Fix:** Replaced useState+useEffect pattern with useSyncExternalStore for hydration-safe client detection
- **Files modified:** src/AppShell.tsx
- **Verification:** ESLint passes, typecheck passes
- **Committed in:** 28d983d (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (blocking)
**Impact on plan:** Fix was necessary to pass pre-commit hooks. No scope creep.

## Issues Encountered

- **Regex lastIndex state bug:** SENSITIVE_PATTERNS with `/gi` flags caused intermittent test failures due to stateful lastIndex. Fixed by using `/i` only (no global flag) since we only need boolean match detection.
- **@sentry/types not installed:** Used inline type definitions to avoid adding dependency.
- **Plan specified Vite+React but project is Next.js:** Adapted Task 4 to use existing @sentry/nextjs and update existing config files rather than creating new ones.

## User Setup Required

None - no external service configuration required. Sentry DSN is already configured in environment.

## Next Phase Readiness

- Error handling infrastructure complete
- Users will see friendly bilingual error messages instead of white screens
- Error reports to Sentry contain no PII
- Requirements FNDN-06 (Error Handling), FNDN-07 (User Privacy) satisfied

---
*Phase: 01-foundation-code-quality*
*Completed: 2026-02-05*

## Self-Check: PASSED
