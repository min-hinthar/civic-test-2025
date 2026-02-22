---
phase: 38-security-analysis-fixes-and-codebase-refactoring-based-on-learnings-and-error-history
plan: 04
subsystem: error-handling
tags: [sentry, retry, fingerprinting, error-handling, contexts, sync]

# Dependency graph
requires:
  - phase: 38-02
    provides: withRetry, safeAsync, isRetryableError async utilities
provides:
  - Sentry error fingerprinting for network, IndexedDB, and TTS error categories
  - withRetry integration in all 4 sync modules (srsSync, socialProfileSync, streakSync, interviewSync)
  - captureError replacing console.error across 4 context providers and 4 sync modules
  - JSDoc throw-vs-fallback convention documentation on all context hooks
affects: [error-monitoring, sentry-quotas, debugging]

# Tech tracking
tech-stack:
  added: []
  patterns: [sentry-fingerprinting, throw-vs-fallback-convention, retry-on-transient-failure]

key-files:
  created: []
  modified:
    - src/lib/sentry.ts
    - src/lib/srs/srsSync.ts
    - src/lib/social/socialProfileSync.ts
    - src/lib/social/streakSync.ts
    - src/lib/interview/interviewSync.ts
    - src/contexts/SRSContext.tsx
    - src/contexts/OfflineContext.tsx
    - src/contexts/SocialContext.tsx
    - src/contexts/SupabaseAuthContext.tsx

key-decisions:
  - "All 4 context hooks use THROWS convention (caller needs success) -- no fallback hooks in this codebase"
  - "IndexedDB operations in SRSContext and OfflineContext use withRetry with 500ms base delay (faster than 1s for local ops)"
  - "Supabase sync operations use withRetry with 1000ms base delay and 3 max attempts"
  - "SupabaseAuthContext Pattern D (network-error-then-queue) left intact -- only replaced console.error with captureError"

patterns-established:
  - "Sentry fingerprinting: network-error, indexeddb-error, tts-error grouping rules in beforeSendHandler"
  - "Throw-vs-fallback convention: all context hooks document their convention in JSDoc"
  - "Background sync pattern: withRetry for transient failures, captureError on exhaustion, never throw to user"

requirements-completed: [CONTEXT-throw-vs-fallback, CONTEXT-try-catch-boundaries, CONTEXT-error-fingerprinting]

# Metrics
duration: 13min
completed: 2026-02-22
---

# Phase 38 Plan 04: Error Handling Integration Summary

**Sentry error fingerprinting for 3 high-volume categories, withRetry in all sync modules, and throw-vs-fallback convention formalized across all context hooks**

## Performance

- **Duration:** 13 min
- **Started:** 2026-02-22T08:21:01Z
- **Completed:** 2026-02-22T08:34:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Added Sentry error fingerprinting in beforeSendHandler grouping network, IndexedDB, and TTS errors under single issues (reduces Sentry quota waste)
- Wrapped all Supabase calls in 4 sync modules with withRetry for transient failure resilience (3 attempts, exponential backoff)
- Replaced all 19 console.error calls across 4 sync modules and 4 context providers with captureError for proper Sentry reporting
- Documented throw-vs-fallback convention via JSDoc on useSRS, useOffline, useSocial, and useAuth hooks

## Task Commits

Each task was committed atomically:

1. **Task 1: Sentry fingerprinting + sync module retry** - `2b8bb63` (feat: add fingerprinting rules, wire withRetry into 4 sync modules)
2. **Task 2: Context provider error handling + JSDoc** - `3890365` (feat: replace console.error with captureError, add throw-vs-fallback JSDoc)

## Files Created/Modified
- `src/lib/sentry.ts` - Added error fingerprinting rules (network-error, indexeddb-error, tts-error) in beforeSendHandler
- `src/lib/srs/srsSync.ts` - withRetry on syncPending, pushSRSCards, pullSRSCards; captureError replacing console.error
- `src/lib/social/socialProfileSync.ts` - withRetry on getSocialProfile, upsertSocialProfile, updateCompositeScore, toggleSocialOptIn; captureError replacing console.error
- `src/lib/social/streakSync.ts` - withRetry on syncStreakToSupabase, loadStreakFromSupabase; captureError replacing console.error
- `src/lib/interview/interviewSync.ts` - withRetry on syncInterviewSession, loadInterviewHistoryFromSupabase; captureError replacing console.error
- `src/contexts/SRSContext.tsx` - withRetry on IndexedDB deck load; captureError in 3 catch blocks; JSDoc on useSRS
- `src/contexts/OfflineContext.tsx` - withRetry on IndexedDB question cache; captureError in 4 catch blocks; JSDoc on useOffline
- `src/contexts/SocialContext.tsx` - captureError in 2 catch blocks; JSDoc on useSocial
- `src/contexts/SupabaseAuthContext.tsx` - captureError in 1 catch block; JSDoc on useAuth

## Decisions Made
- All 4 context hooks use THROWS convention -- no fire-and-forget hooks needed since all callers depend on provider state
- IndexedDB withRetry uses 500ms base delay (local operations recover faster than network)
- Supabase withRetry uses 1000ms base delay with 3 max attempts
- SupabaseAuthContext's Pattern D (network-error-then-queue offline sync) preserved as-is -- only the console.error was swapped
- captureError used (not captureException directly) to maintain PII sanitization pipeline from 38-01

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All sync modules and context providers now have standardized error handling
- Sentry fingerprinting will immediately reduce duplicate issues for network/IndexedDB/TTS errors
- console.error count in modified files: 0 (all replaced with captureError)
- All 511 tests pass, build succeeds, typecheck and lint clean

## Self-Check: PASSED

All 9 modified files verified on disk. Both commit hashes (2b8bb63, 3890365) verified in git log.

---
*Phase: 38-security-analysis-fixes-and-codebase-refactoring-based-on-learnings-and-error-history*
*Completed: 2026-02-22*
