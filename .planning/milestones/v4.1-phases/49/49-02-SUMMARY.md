---
phase: 49-error-handling-security
plan: 02
subsystem: dx
tags: [provider-ordering, sentry, error-reporting, dev-tools, react-hooks]

# Dependency graph
requires:
  - phase: 48-testing-infrastructure
    provides: renderWithProviders test utility, PROVIDER_ORDER array
provides:
  - ProviderOrderGuard dev-mode provider ordering validation component
  - Structured captureError() calls in 5 session/auth files
affects: [provider-tree-changes, sentry-dashboard, error-observability]

# Tech tracking
tech-stack:
  added: []
  patterns: [dev-mode-guard-component, conditional-rendering-for-zero-prod-cost, captureError-context-pattern]

key-files:
  created:
    - src/lib/providerOrderGuard.ts
    - src/lib/providerOrderGuard.test.tsx
  modified:
    - src/components/ClientProviders.tsx
    - src/views/TestPage.tsx
    - src/views/AuthPage.tsx
    - src/components/social/SocialOptInFlow.tsx
    - src/components/srs/AddToDeckButton.tsx
    - src/components/GoogleOneTapSignIn.tsx

key-decisions:
  - "ToastProvider detection skipped: useToast() returns fallback (never throws), ToastContext not exported"
  - "TTSProvider detected via null check on useContext(TTSContext) instead of try/catch"
  - "Conditional rendering pattern ({NODE_ENV === 'development' && <Guard />}) over early return for Rules of Hooks compliance"

patterns-established:
  - "Dev-mode guard: conditionally render debug component to avoid Rules of Hooks violation"
  - "captureError context: always include { operation, component } for Sentry filtering"

requirements-completed: [ERRS-06, DX-03]

# Metrics
duration: 15min
completed: 2026-03-20
---

# Phase 49 Plan 02: Provider Order Guard + Console Error Migration Summary

**Dev-mode ProviderOrderGuard validates 9 provider hooks via try/catch + null check, and 6 console.error calls migrated to captureError() with operation/component context**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-20T05:44:24Z
- **Completed:** 2026-03-20T05:59:51Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- ProviderOrderGuard component validates 9 of 10 providers (ToastProvider undetectable) in dev mode via console.warn
- Zero production overhead through conditional rendering: component never mounts when NODE_ENV !== 'development'
- 6 console.error calls in 5 critical files replaced with captureError() providing structured Sentry observability

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ProviderOrderGuard with tests and wire into ClientProviders** - `28d267a` (feat)
2. **Task 2: Migrate high-impact console.error calls to captureError()** - `28d30ac` (fix)

## Files Created/Modified
- `src/lib/providerOrderGuard.ts` - Dev-mode provider ordering validation component
- `src/lib/providerOrderGuard.test.tsx` - 3 unit tests for guard behavior
- `src/components/ClientProviders.tsx` - Added ProviderOrderGuard as last child in NavigationProvider
- `src/views/TestPage.tsx` - saveTestSession catch -> captureError
- `src/views/AuthPage.tsx` - authRedirect catch -> captureError
- `src/components/social/SocialOptInFlow.tsx` - socialOptIn catch -> captureError
- `src/components/srs/AddToDeckButton.tsx` - deckToggle catch -> captureError
- `src/components/GoogleOneTapSignIn.tsx` - googleOneTap + googleOAuthFallback -> captureError

## Decisions Made
- ToastProvider detection skipped: `useToast()` returns a no-op fallback (never throws), and `ToastContext` is not exported from BilingualToast.tsx. Detection is architecturally impossible without exporting the raw context.
- TTSContext detected via null check (`useContext(TTSContext) === null`) since TTSContext has no exported hook and returns null when provider is missing.
- Used conditional rendering (`{process.env.NODE_ENV === 'development' && <ProviderOrderGuard />}`) instead of early return to comply with Rules of Hooks.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test file extension .ts -> .tsx**
- **Found during:** Task 1 (RED phase)
- **Issue:** Plan specified `.test.ts` but test file contains JSX (`<ErrorBoundary>`, `<ProviderOrderGuard />`)
- **Fix:** Renamed to `.test.tsx`
- **Files modified:** src/lib/providerOrderGuard.test.tsx
- **Verification:** Tests compile and pass

**2. [Rule 1 - Bug] Test rendering approach for hook-throwing components**
- **Found during:** Task 1 (GREEN phase)
- **Issue:** renderHook with hooks that throw caused infinite re-render loop / timeout. Direct render without ErrorBoundary also hung.
- **Fix:** Wrapped ProviderOrderGuard in ErrorBoundary for test rendering; adjusted test assertions
- **Files modified:** src/lib/providerOrderGuard.test.tsx
- **Verification:** All 3 tests pass within timeout

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for test correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed test issues above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Provider ordering guard active in dev mode, ready for any future provider tree changes
- Sentry dashboard will now receive structured error reports from session save, auth, social, and SRS flows
- Plan 03 can proceed (error.tsx sanitization / bilingual error pages)

---
## Self-Check: PASSED

- All 9 created/modified files exist on disk
- Commit 28d267a found in git log
- Commit 28d30ac found in git log
- pnpm lint: pass
- pnpm lint:css: pass
- pnpm format:check: pass
- pnpm typecheck: pass
- pnpm test:run: 37 test files, 646 tests pass
- pnpm build: success

---
*Phase: 49-error-handling-security*
*Completed: 2026-03-20*
