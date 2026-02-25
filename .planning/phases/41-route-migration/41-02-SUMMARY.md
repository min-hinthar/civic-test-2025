---
phase: 41-route-migration
plan: 02
subsystem: api
tags: [push-notifications, web-push, route-handlers, app-router, supabase]
requirements-completed: [MIGR-11]

# Dependency graph
requires:
  - phase: 40-app-router-foundation
    provides: App Router directory structure and layout
provides:
  - 4 App Router Route Handlers for push notification APIs (subscribe, send, srs-reminder, weak-area-nudge)
  - Named HTTP method exports (POST, DELETE) replacing default handler pattern
affects: [41-route-migration]

# Tech tracking
tech-stack:
  added: []
  patterns: [Route Handler named exports, NextRequest/NextResponse Web API pattern]

key-files:
  created:
    - app/api/push/subscribe/route.ts
    - app/api/push/send/route.ts
    - app/api/push/srs-reminder/route.ts
    - app/api/push/weak-area-nudge/route.ts
  modified: []

key-decisions:
  - "Remove old pages/api/push/*.ts files immediately to avoid Next.js conflicting route errors"
  - "IP address in Sentry uses x-forwarded-for only (no socket.remoteAddress in Route Handlers)"

patterns-established:
  - "Route Handler pattern: import NextRequest/NextResponse from next/server, export named async functions per HTTP method"
  - "Rate limit 429 response uses new NextResponse() constructor with headers object (not res.setHeader)"

requirements-completed: [MIGR-11]

# Metrics
duration: 10min
completed: 2026-02-24
---

# Phase 41 Plan 02: Push Notification Route Migration Summary

**4 push notification API routes migrated from Pages Router to App Router Route Handlers with rate limiting, JWT auth, and VAPID push delivery preserved**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-24T13:25:34Z
- **Completed:** 2026-02-24T13:54:59Z
- **Tasks:** 2
- **Files modified:** 9 (4 created, 5 deleted)

## Accomplishments
- Migrated subscribe endpoint with POST (subscribe) and DELETE (unsubscribe) named exports, preserving rate limiting and JWT verification
- Migrated send endpoint with CRON_SECRET auth and bilingual Burmese/English reminder messages
- Migrated srs-reminder endpoint with x-api-key auth and SRS card due-date querying
- Migrated weak-area-nudge endpoint with message templating and 410 subscription cleanup
- Removed all 4 old pages/api/push/*.ts files to eliminate routing conflicts

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate subscribe and send Route Handlers** - `aa59665` (feat)
2. **Task 2: Migrate srs-reminder and weak-area-nudge Route Handlers** - `5c84277` (feat)

## Files Created/Modified
- `app/api/push/subscribe/route.ts` - Subscribe/unsubscribe with rate limiting, JWT auth, Supabase upsert/delete
- `app/api/push/send/route.ts` - Send study reminders to frequency-matched subscriptions via web-push
- `app/api/push/srs-reminder/route.ts` - Send SRS review reminders to users with due cards
- `app/api/push/weak-area-nudge/route.ts` - Send weak area practice nudges with category templating
- `pages/api/push/subscribe.ts` - Deleted (replaced by App Router route)
- `pages/api/push/send.ts` - Deleted (replaced by App Router route)
- `pages/api/push/srs-reminder.ts` - Deleted (replaced by App Router route)
- `pages/api/push/weak-area-nudge.ts` - Deleted (replaced by App Router route)
- `pages/op-ed.tsx` - Deleted (conflicting with app/(public)/op-ed/page.tsx from 41-01)

## Decisions Made
- Removed old pages/api/push/*.ts files in this plan rather than deferring to 41-05, because Next.js build fails on conflicting app and page routes
- Used `request.headers.get('x-forwarded-for') ?? 'unknown'` for IP in Sentry (no socket.remoteAddress available in Route Handlers)
- Also removed pages/op-ed.tsx which conflicted with app/(public)/op-ed/page.tsx (auto-committed from 41-01 work)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed conflicting Pages Router files to unblock build**
- **Found during:** Task 2 (build verification)
- **Issue:** Next.js build fails with "Conflicting app and page files" when both pages/api/push/*.ts and app/api/push/*/route.ts exist
- **Fix:** Deleted all 4 old pages/api/push/*.ts files and pages/op-ed.tsx
- **Files modified:** pages/api/push/subscribe.ts, pages/api/push/send.ts, pages/api/push/srs-reminder.ts, pages/api/push/weak-area-nudge.ts, pages/op-ed.tsx (all deleted)
- **Verification:** Typecheck passes. Build conflict resolved.
- **Committed in:** 5c84277 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** File deletion was necessary to resolve Next.js routing conflicts. No scope creep -- these files are fully replaced by the new Route Handlers.

## Issues Encountered
- OneDrive locked .next cache causing ENOTEMPTY build errors -- resolved with `rm -rf .next`
- Build still fails due to app/(public)/auth/forgot/page.tsx (from 41-01) importing react-router-dom components -- out of scope for this plan, will be resolved when 41-03 migrates navigation

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 push notification Route Handlers ready and typed correctly
- Plan 41-03 (navigation migration) and 41-05 (final cleanup) can proceed
- Build will pass once 41-03 completes the react-router-dom migration for page components

## Self-Check: PASSED

- All 4 Route Handler files exist under app/api/push/
- All 5 old Pages Router files confirmed deleted
- Commit aa59665 verified
- Commit 5c84277 verified

---
*Phase: 41-route-migration*
*Completed: 2026-02-24*
