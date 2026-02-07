---
phase: 05-spaced-repetition
plan: 09
subsystem: srs, pwa
tags: [push-notifications, navigation, srs, bilingual, settings]
depends_on:
  requires: [05-03, 05-08]
  provides: [srs-nav-badge, srs-push-reminder, srs-reminder-settings]
  affects: []
tech-stack:
  added: []
  patterns: [api-key-auth, localStorage-time-preference, bilingual-push]
key-files:
  created:
    - pages/api/push/srs-reminder.ts
  modified:
    - src/components/AppNavigation.tsx
    - src/pages/SettingsPage.tsx
    - src/lib/pwa/pushNotifications.ts
decisions:
  - x-api-key header auth for SRS cron endpoint (distinct from Bearer token pattern used by other push endpoints)
  - Reminder time stored in localStorage (client-side preference, not synced to server)
  - Warning banner when push not enabled guides users to enable notifications first
metrics:
  duration: 5min
  completed: 2026-02-07
---

# Phase 5 Plan 9: Navigation Badge, Push Notifications & Settings Summary

Due card badge on Study Guide nav link + SRS push reminder cron endpoint + reminder time settings.

## What Was Done

### Task 1: Due Card Badge on Study Guide Navigation Link
- Imported `useSRS` hook into `AppNavigation.tsx` to access `dueCount`
- Added orange badge (bg-warning-500) to the `/study` nav link in both desktop and mobile menus
- Badge displays due count, capped at `99+` for layout safety
- Added `flex items-center` to nav link classes to properly align badge with text
- Badge only appears when `dueCount > 0`

### Task 2: SRS Push Notification Endpoint and Reminder Settings
- **API Endpoint** (`pages/api/push/srs-reminder.ts`):
  - POST endpoint protected by `x-api-key` header matching `SRS_CRON_API_KEY` env var
  - Queries `srs_cards` table for cards where `due <= now()`
  - Groups due counts by user, looks up push subscriptions
  - Sends bilingual notification with card count and link to `/study#review`
  - Cleans up expired subscriptions (HTTP 410 Gone)
  - Returns `{ notified, errors }` JSON response

- **Settings Page** (`src/pages/SettingsPage.tsx`):
  - Added "Review Reminders" section with clock icon and bilingual heading
  - Time picker input defaults to 09:00, persists to `civic-prep-srs-reminder-time` localStorage key
  - Warning banner shown when push notifications are not enabled, with bilingual text

- **Push Notifications Helper** (`src/lib/pwa/pushNotifications.ts`):
  - Added `formatSRSReminderNotification()` helper for consistent bilingual notification formatting
  - Returns title, body, tag, and URL for SRS reminder notifications

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Due card badge on Study Guide nav | 0f12278 | src/components/AppNavigation.tsx |
| 2 | SRS push notification endpoint + settings | 1674a12 | pages/api/push/srs-reminder.ts, src/pages/SettingsPage.tsx, src/lib/pwa/pushNotifications.ts |

## Decisions Made

1. **x-api-key auth for SRS cron** - Used `x-api-key` header with `SRS_CRON_API_KEY` env var instead of Bearer token pattern used by other push endpoints. This differentiates cron-triggered SRS reminders from the general study reminder cron.

2. **localStorage for reminder time** - Reminder time is a client-side preference stored in localStorage, not synced to Supabase. This keeps the implementation simple and avoids schema changes.

3. **Warning banner for push not enabled** - When push notifications are not subscribed, a bilingual warning banner guides users to enable them in the Notifications section above.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- `pnpm exec tsc --noEmit`: PASS
- `pnpm exec eslint` on all modified files: PASS
- No React Compiler ESLint violations

## Phase 5 Completion Status

This is plan 9 of 9 for Phase 5 (Spaced Repetition). All plans are now complete:
- 05-01: FSRS Engine & IndexedDB Store
- 05-02: Supabase Schema & Sync
- 05-03: SRS Context Provider
- 05-04: Add-to-Deck Button
- 05-05: Deck Manager View
- 05-06: Review Session UI
- 05-07: Review Session Flow
- 05-08: Dashboard Widget & Heatmap
- 05-09: Navigation Badge, Push Notifications & Settings

**Phase 5 is complete.**

## Self-Check: PASSED
