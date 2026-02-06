---
phase: 02-pwa-offline
plan: 06
subsystem: pwa
tags: [pwa, push-notifications, web-push, vapid, bilingual, api-routes, settings]

# Dependency graph
requires:
  - phase: 02-01
    provides: Service worker (sw.ts), manifest.json, Serwist integration
  - phase: 02-04
    provides: NotificationPrePrompt for onboarding permission request

provides:
  - Push notification infrastructure (subscribe, unsubscribe, send)
  - Service worker push/notificationclick event handlers
  - Pages Router API routes for push subscription management
  - NotificationSettings UI component with frequency selection
  - Settings page at /settings route
  - Bilingual study reminder messages (3 variants)

affects:
  - 02-07: App update prompt (settings page provides home for more preferences)
  - 02-08: Final PWA testing (push notifications are part of E2E verification)
  - Future cron: CRON_SECRET-authenticated /api/push/send endpoint ready for Vercel Cron

# Tech tracking
tech-stack:
  added:
    - web-push (3.6.7) - VAPID push notification sending
    - "@types/web-push" (3.6.4) - TypeScript definitions for web-push
  patterns:
    - Pages Router API routes with method switching (POST/DELETE)
    - VAPID key pair for Web Push Protocol authentication
    - Bearer token auth for cron/admin API endpoints
    - Subscription cleanup on HTTP 410 Gone (expired endpoints)
    - useSyncExternalStore for SSR-safe client detection in components

# File tracking
key-files:
  created:
    - src/lib/pwa/pushNotifications.ts
    - src/hooks/usePushNotifications.ts
    - pages/api/push/subscribe.ts
    - pages/api/push/send.ts
    - src/components/pwa/NotificationSettings.tsx
    - src/pages/SettingsPage.tsx
    - public/icons/badge-72.png
    - .env.example
  modified:
    - src/lib/pwa/sw.ts
    - src/AppShell.tsx
    - package.json
    - pnpm-lock.yaml
    - .gitignore
    - eslint.config.mjs

# Decisions
decisions:
  - id: pages-router-api
    decision: "Use Pages Router API routes (pages/api/push/*.ts) instead of App Router route handlers"
    reason: "Project uses Next.js Pages Router throughout; App Router paths from plan adapted to match existing patterns"
  - id: no-undef-off-for-ts
    decision: "Disable ESLint no-undef rule for TypeScript files"
    reason: "TypeScript compiler handles undefined variable detection better than ESLint for DOM types like NotificationPermission, WindowClient"
  - id: env-example-gitignore
    decision: "Add !.env.example exception to .gitignore"
    reason: "Existing .env.* pattern was catching .env.example; exception allows tracking the template while keeping actual env files ignored"
  - id: vapid-conditional-init
    decision: "Conditionally initialize webPush.setVapidDetails only when all env vars present"
    reason: "Prevents crash during build/dev when VAPID keys are not configured"
  - id: settings-protected-route
    decision: "Settings page is a protected route requiring authentication"
    reason: "Notification preferences are user-specific; push subscription requires user_id"

# Metrics
metrics:
  duration: 16 min
  completed: 2026-02-06
---

# Phase 02 Plan 06: Push Notification Infrastructure Summary

Web-push VAPID notification system with bilingual study reminders, Pages Router API routes for subscription management, frequency-configurable NotificationSettings UI on new /settings page

## What Was Done

### Task 1: Set up web-push and update service worker (28ec248)
- Installed `web-push` (3.6.7) and `@types/web-push` (3.6.4)
- Updated `src/lib/pwa/sw.ts` with:
  - **push event handler**: Parses JSON payload, shows bilingual notification with icon/badge/vibrate
  - **notificationclick handler**: Closes notification, focuses existing app window or opens new one
  - Uses `self.clients` for proper ServiceWorkerGlobalScope access
- Created `public/icons/badge-72.png` (blue circle badge for notification tray)
- Created `.env.example` with all required env vars (Supabase, Google, Sentry, VAPID, CRON_SECRET)
- Added `!.env.example` exception to `.gitignore`

### Task 2: Create push subscription logic and API routes (1ee0222)
- Created `src/lib/pwa/pushNotifications.ts`:
  - `subscribeToPush(userId, frequency)` - subscribes via Push API, sends to server
  - `unsubscribeFromPush(userId)` - unsubscribes and notifies server
  - `getSubscriptionStatus()` - checks permission and subscription state
  - `urlBase64ToUint8Array()` - converts VAPID key for applicationServerKey
- Created `src/hooks/usePushNotifications.ts`:
  - Manages subscription state, permission, frequency, loading
  - `subscribe()`, `unsubscribe()`, `updateFrequency()` callbacks
  - Persists frequency in localStorage (`push-reminder-frequency`)
- Created `pages/api/push/subscribe.ts` (Pages Router):
  - POST: Upserts push subscription to Supabase `push_subscriptions` table
  - DELETE: Removes subscription by user_id
  - 405 for unsupported methods
- Created `pages/api/push/send.ts` (Pages Router):
  - POST with Bearer CRON_SECRET authorization
  - Queries subscriptions by frequency, sends random bilingual message
  - 3 bilingual reminder message variants (English + Burmese)
  - Cleans up expired subscriptions on HTTP 410 Gone
- Disabled ESLint `no-undef` for TS files (TypeScript handles DOM type checking)

### Task 3: Create NotificationSettings UI and settings page (9fee61b)
- Created `src/components/pwa/NotificationSettings.tsx`:
  - Bilingual frequency dropdown (Daily, Every 2 days, Weekly, Off)
  - Three states: unsupported browser, permission denied, active
  - SSR-safe via useSyncExternalStore client detection
  - Green confirmation text when notifications enabled
- Created `src/pages/SettingsPage.tsx`:
  - Back navigation with ArrowLeft icon
  - Settings header with bilingual title
  - Notifications section with NotificationSettings component
- Added `/settings` as protected route in `src/AppShell.tsx`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed NotificationOptions ESLint error in service worker**
- **Found during:** Task 1
- **Issue:** `NotificationOptions` type reference caused ESLint `no-undef` error in sw.ts
- **Fix:** Removed explicit type annotation, let TypeScript infer the type
- **Files modified:** src/lib/pwa/sw.ts
- **Commit:** 28ec248

**2. [Rule 3 - Blocking] Fixed clients reference in service worker**
- **Found during:** Task 1
- **Issue:** Bare `clients` reference caused TypeScript error "Cannot find name 'clients'"
- **Fix:** Changed to `self.clients` with explicit `WindowClient` cast for focus()
- **Files modified:** src/lib/pwa/sw.ts
- **Commit:** 28ec248

**3. [Rule 3 - Blocking] Disabled ESLint no-undef for TypeScript files**
- **Found during:** Task 2
- **Issue:** ESLint `no-undef` flagged `NotificationPermission` DOM type in TypeScript files
- **Fix:** Added `'no-undef': 'off'` to ESLint config for TS files (standard practice, TypeScript compiler handles this)
- **Files modified:** eslint.config.mjs
- **Commit:** 1ee0222

**4. [Rule 3 - Blocking] Added .env.example gitignore exception**
- **Found during:** Task 1
- **Issue:** `.env.*` gitignore pattern caught `.env.example`, preventing it from being tracked
- **Fix:** Added `!.env.example` negation rule to `.gitignore`
- **Files modified:** .gitignore
- **Commit:** 28ec248

**5. [Rule 2 - Missing Critical] Added @types/web-push**
- **Found during:** Task 1
- **Issue:** web-push library has no bundled types, TypeScript would fail without type definitions
- **Fix:** Installed `@types/web-push` as dev dependency
- **Files modified:** package.json, pnpm-lock.yaml
- **Commit:** 28ec248

**6. [Rule 1 - Bug] Adapted App Router API routes to Pages Router**
- **Found during:** Task 2
- **Issue:** Plan specified App Router paths (src/app/api/push/*/route.ts) but project uses Pages Router
- **Fix:** Created Pages Router API routes (pages/api/push/*.ts) with NextApiRequest/NextApiResponse pattern
- **Files modified:** pages/api/push/subscribe.ts, pages/api/push/send.ts
- **Commit:** 1ee0222

## Verification

- [x] `pnpm run build` succeeds with all new files
- [x] `pnpm run typecheck` passes
- [x] Service worker handles push and notificationclick events
- [x] Push subscription API routes visible in build output (/api/push/send, /api/push/subscribe)
- [x] NotificationSettings shows frequency dropdown (daily, every 2 days, weekly, off)
- [x] Send API validates CRON_SECRET bearer token
- [x] Invalid subscriptions cleaned up on 410 status
- [x] All UI text is bilingual (English + Burmese)
- [x] Settings page accessible at /settings (protected route)
- [x] .env.example contains all required environment variables

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Set up web-push and update service worker | 28ec248 | src/lib/pwa/sw.ts, package.json, .env.example, public/icons/badge-72.png |
| 2 | Create push subscription logic and API routes | 1ee0222 | src/lib/pwa/pushNotifications.ts, src/hooks/usePushNotifications.ts, pages/api/push/subscribe.ts, pages/api/push/send.ts |
| 3 | Create NotificationSettings UI and settings page | 9fee61b | src/components/pwa/NotificationSettings.tsx, src/pages/SettingsPage.tsx, src/AppShell.tsx |

## Next Phase Readiness

No blockers. Push notification infrastructure is complete and ready for:
- **Vercel Cron integration**: `/api/push/send` endpoint accepts frequency parameter and CRON_SECRET auth
- **Settings expansion**: SettingsPage can host additional preference sections in future plans
- **E2E testing**: All pieces in place for push notification verification in 02-08

## Self-Check: PASSED
