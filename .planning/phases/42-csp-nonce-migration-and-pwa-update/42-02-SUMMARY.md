---
phase: 42-csp-nonce-migration-and-pwa-update
plan: 02
subsystem: testing
tags: [vitest, csp, nonce, service-worker, serwist, pwa, proxy]
requirements-completed: [MIGR-10]

# Dependency graph
requires:
  - phase: 42-csp-nonce-migration-and-pwa-update
    plan: 01
    provides: "Nonce-based CSP with strict-dynamic in proxy.ts, security headers consolidated"
provides:
  - "Unit tests for proxy.ts covering nonce generation, CSP directives, security headers, nonce transport, and matcher config"
  - "Verified SW defaultCache includes App Router RSC cache buckets (prefetch, navigation, document)"
  - "Verified OfflineContext and PWAOnboardingFlow compatibility with App Router"
  - "Full build verification: 534 tests, clean tsc, Serwist sw.js generation"
affects: [pwa, security, csp]

# Tech tracking
tech-stack:
  added: []
  patterns: ["proxy.ts unit test pattern with NextResponse mock and crypto.randomUUID stub"]

key-files:
  created:
    - src/__tests__/proxy.test.ts
  modified: []

key-decisions:
  - "SW caching needs no code changes -- defaultCache from @serwist/next/worker v9.5.6 already covers App Router RSC patterns"
  - "Serwist auto-registration handles missing sw.js gracefully -- no additional error handling needed in sw.ts"
  - "Cast process.env to Record<string, string | undefined> for NODE_ENV assignment in tests (read-only in @types/node)"

patterns-established:
  - "Proxy test mock pattern: vi.mock next/server, vi.stubGlobal crypto, capture request/response headers via closures"
  - "NODE_ENV override in tests: cast process.env to mutable Record type"

requirements-completed: [MIGR-10]

# Metrics
duration: 6min
completed: 2026-02-25
---

# Phase 42 Plan 02: SW Verification and Proxy Unit Tests Summary

**23 proxy.ts unit tests covering CSP nonce, strict-dynamic, security headers; SW defaultCache verified for App Router RSC caching; full build green**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-25T09:41:43Z
- **Completed:** 2026-02-25T09:47:53Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Created comprehensive proxy.test.ts with 23 test cases covering nonce generation, CSP header construction (dev/prod), security headers, nonce transport, and matcher configuration
- Verified SW caching: defaultCache spread, audio cache bucket, offline fallback, skipWaiting, clientsClaim, navigationPreload all confirmed present
- Full build verification: 534 tests pass, pnpm build succeeds, tsc clean, sw.js generated and gitignored
- Verified OfflineContext.tsx (online/offline event listeners) and PWAOnboardingFlow.tsx (install prompt, display-mode check) both fully compatible with App Router

## Task Commits

Each task was committed atomically:

1. **Task 1: Verify SW caching and add proxy unit tests** - `25f586a` (test)
2. **Task 2: Full build verification and cleanup** - `c156c7f` (chore)

## Files Created/Modified
- `src/__tests__/proxy.test.ts` - 23 unit tests for proxy.ts: nonce generation, CSP directives, security headers, nonce transport, matcher config

## Decisions Made
- SW sw.ts needs no code changes -- `defaultCache` from `@serwist/next/worker` v9.5.6 already includes RSC prefetch, RSC navigation, HTML document, static JS, same-origin catch-all, and cross-origin cache buckets
- Serwist auto-registration (via `withSerwistInit` webpack plugin) handles missing sw.js gracefully in dev mode (`disable: dev`) -- no custom error handling needed
- Used `Record<string, string | undefined>` cast for `process.env` in tests to work around `@types/node` read-only `NODE_ENV` property

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript error in proxy.test.ts NODE_ENV assignment**
- **Found during:** Task 2 (TypeScript verification)
- **Issue:** `process.env.NODE_ENV` is read-only in `@types/node` strict mode, causing TS2540 errors
- **Fix:** Cast `process.env` to `Record<string, string | undefined>` before assignment
- **Files modified:** `src/__tests__/proxy.test.ts`
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** `c156c7f` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Trivial type cast fix for test code. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Build Output

All pages render as dynamic (expected with `await headers()` in layout):

```
Route (app)
  f /              f /auth           f /home
  f /about         f /auth/forgot    f /hub/[[...tab]]
  f /api/push/*    f /auth/update-password
  f /interview     f /practice       f /settings
  f /study         f /test           f /op-ed
  f /dev-sentry-test  f /_not-found

f Proxy (Middleware)
f (Dynamic) server-rendered on demand
```

## SW Verification Details

Verified in `src/lib/pwa/sw.ts` (no code changes needed):

| Feature | Status | Evidence |
|---------|--------|----------|
| `defaultCache` spread in runtimeCaching | Present | Line 20: `...defaultCache` |
| Audio cache bucket for `/audio/` paths | Present | Lines 22-35: CacheFirst, 1200 entries, 90 days |
| Offline fallback for document requests | Present | Lines 37-46: `/offline.html` matcher |
| `skipWaiting: true` | Present | Line 16 |
| `clientsClaim: true` | Present | Line 17 |
| `navigationPreload: true` | Present | Line 18 |

`defaultCache` from `@serwist/next/worker` v9.5.6 includes:
- `pages-rsc-prefetch` (NetworkFirst): RSC prefetch requests
- `pages-rsc` (NetworkFirst): RSC navigation requests
- `pages` (NetworkFirst): HTML document requests
- `next-static-js-assets` (CacheFirst): `/_next/static` JS bundles
- `others` (NetworkFirst): same-origin non-API catch-all
- `cross-origin` (NetworkFirst): third-party resources

## Next Phase Readiness
- Phase 42 is complete: CSP nonce migration (MIGR-09) and PWA update (MIGR-10) both satisfied
- All inline scripts use nonce attributes; strict-dynamic propagates trust
- SW correctly caches App Router assets via defaultCache
- 23 proxy tests provide regression coverage for CSP nonce implementation

## Self-Check: PASSED

All created files verified present. Both task commits (25f586a, c156c7f) verified in git log. SUMMARY.md exists at expected path.

---
*Phase: 42-csp-nonce-migration-and-pwa-update*
*Completed: 2026-02-25*
