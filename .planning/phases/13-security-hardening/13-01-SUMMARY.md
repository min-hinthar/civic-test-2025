---
phase: 13-security-hardening
plan: 01
subsystem: auth
tags: [jwt, supabase, rate-limiting, sentry, push-notifications, api-security]

# Dependency graph
requires:
  - phase: 02-pwa-core
    provides: Push notification subscription API and client code
  - phase: 05-srs-engine
    provides: Push notification reminder integration
provides:
  - JWT-verified push subscription API endpoint
  - Per-user rate limiting on push subscribe/unsubscribe
  - Auth-aware client push notification code with Bearer token
  - Sentry error logging for failed auth attempts
affects: [13-03-rls-audit, 13-04-csp-headers]

# Tech tracking
tech-stack:
  added: []
  patterns: [jwt-verification-per-request, in-memory-rate-limiting, auth-header-pattern]

key-files:
  created: []
  modified:
    - pages/api/push/subscribe.ts
    - src/lib/pwa/pushNotifications.ts
    - src/hooks/usePushNotifications.ts

key-decisions:
  - "Used per-request Supabase client with user Bearer token for JWT verification (not service role key)"
  - "In-memory Map for rate limiting (appropriate for single-instance deployment)"
  - "Extracted getAccessToken() helper outside hook for reuse across callbacks"

patterns-established:
  - "JWT verification pattern: extract Bearer token -> create per-request supabase client -> auth.getUser() -> use verified user.id"
  - "Rate limiting pattern: module-level Map with window-based entries and periodic cleanup"
  - "Auth-aware fetch: get session token before each API call, handle 401 gracefully"

# Metrics
duration: 14min
completed: 2026-02-10
---

# Phase 13 Plan 01: Push Subscribe Auth Summary

**JWT-verified push subscription API with per-user rate limiting (10 req/min) and Sentry auth failure logging**

## Performance

- **Duration:** 14 min
- **Started:** 2026-02-10T04:07:07Z
- **Completed:** 2026-02-10T04:21:34Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Push subscribe API now requires valid JWT Bearer token on all requests (POST and DELETE)
- User ID derived exclusively from verified JWT, never from client request body (closes critical security gap)
- Per-user rate limiting prevents abuse (10 requests per minute per user, with Retry-After header)
- Failed auth attempts logged to Sentry with context tags for monitoring
- Client-side push code fetches Supabase access token from session before each API call

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite push subscribe API with JWT verification and rate limiting** - `0594cff` (feat)
2. **Task 2: Update client-side push code to send Authorization header** - `cbd6a1b` (feat)

## Files Created/Modified
- `pages/api/push/subscribe.ts` - JWT-verified push subscription API with rate limiting and Sentry logging
- `src/lib/pwa/pushNotifications.ts` - Auth-aware push subscription client with Bearer token headers
- `src/hooks/usePushNotifications.ts` - Hook updated to get access token from Supabase session before API calls

## Decisions Made
- Used per-request Supabase client with user's Bearer token for JWT verification -- this verifies the token server-side without needing to manually decode JWTs
- Kept in-memory Map for rate limiting rather than Redis/database -- appropriate for single-instance Vercel deployment; rate limits reset on cold start which is acceptable
- Extracted `getAccessToken()` as a standalone async function outside the hook component to avoid React Compiler issues with async operations in hooks

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Build verification (`pnpm run build`) failed with stale `.next` cache and pages-manifest.json errors -- this is a pre-existing infrastructure issue (documented in MEMORY.md) unrelated to the security changes. TypeScript compilation passed cleanly for all modified files.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Push subscription API is now secure -- ready for Plan 02 (send endpoint hardening)
- Plan 03 (RLS audit) can proceed independently
- The push_subscriptions table may still lack RLS policies -- Plan 03 will address this

## Self-Check: PASSED

- [x] pages/api/push/subscribe.ts - FOUND
- [x] src/lib/pwa/pushNotifications.ts - FOUND
- [x] src/hooks/usePushNotifications.ts - FOUND
- [x] 13-01-SUMMARY.md - FOUND
- [x] Commit 0594cff - FOUND
- [x] Commit cbd6a1b - FOUND

---
*Phase: 13-security-hardening*
*Completed: 2026-02-10*
