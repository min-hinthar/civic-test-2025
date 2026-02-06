# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-05)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** Phase 2 (PWA & Offline) in progress

## Current Position

Phase: 2 of 7 (PWA & Offline)
Plan: 6 of 8 in current phase
Status: In progress
Last activity: 2026-02-06 - Completed 02-06-PLAN.md (Push Notification Infrastructure)

Progress: [███░░░░░░░] 28% (11 plans / ~40 total estimated)

## Performance Metrics

**Velocity:**
- Total plans completed: 11
- Average duration: 17 min
- Total execution time: 190 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 5 | 49 min | 10 min |
| 02-pwa-offline | 6 | 141 min | 24 min |

**Recent Trend:**
- Last 5 plans: 02-03 (37 min), 02-02 (43 min), 02-04 (7 min), 02-05 (6 min), 02-06 (16 min)
- Trend: Infrastructure plans take 16-43 min; UI-only plans execute in under 10 min

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: Derive phases from requirements - 7 phases covering 10 requirement categories
- Roadmap: Phase 2 and 3 can run in parallel after Phase 1 completes
- 01-01: Used ESLint flat config for ESLint 9 compatibility
- 01-01: Set 70% coverage thresholds for test coverage
- 01-01: Typecheck excluded from pre-commit (runs in CI only)
- 01-05: Question IDs changed from number to string (GOV-P##, HIST-C##, etc.)
- 01-05: Questions split into 7 category modules for maintainability
- 01-02: Chi-squared threshold set to 50 for shuffle uniformity test
- 01-02: Save guard uses state machine (idle/saving/saved/error)
- 01-02: Navigation lock uses replaceState in popstate handler
- 01-03: Made user_id and mock_test_id optional for query result flexibility
- 01-03: Added global type declarations to ESLint for Google Identity Services
- 01-04: Use djb2 hash for user ID anonymization in error reporting
- 01-04: Error messages use bilingual format { en: string, my: string }
- 01-04: beforeSend handler strips PII at Sentry event level
- 02-01: Used static public/manifest.json instead of app/manifest.ts (Pages Router)
- 02-01: Added serviceworker globals to ESLint for service worker context
- 02-01: Serwist disabled in development mode to avoid caching issues
- 02-01: PWA files located in src/lib/pwa/ directory
- 02-03: Exponential backoff: 5 retries with 1s base delay for sync queue
- 02-03: Sync queue stores in IndexedDB syncQueueStore, syncs to Supabase
- 02-03: SyncStatusIndicator hidden when no pending items
- 02-03: Bilingual toast for sync completion (English + Burmese)
- 02-02: OfflineContext merges question caching with sync queue functionality
- 02-02: useOnlineStatus uses useSyncExternalStore for SSR-safe browser API access
- 02-02: OnlineStatusIndicator is icon-only (green=online, orange=offline)
- 02-02: OfflineProvider placed outside ThemeProvider in provider hierarchy
- 02-04: Lazy state initializers for browser API checks (avoid setState in effects)
- 02-04: 7-day cooldown after user dismisses install prompt
- 02-04: Notification pre-prompt explains value before native browser dialog
- 02-04: PWAOnboardingFlow as local AppShell component (not in OfflineContext)
- 02-05: Lazy useState initializer for iOS tip visibility (avoids setState in effect)
- 02-05: 2-second delay for iOS tip after welcome modal closes
- 02-06: Pages Router API routes for push (pages/api/push/*.ts, not App Router)
- 02-06: ESLint no-undef disabled for TS files (TypeScript compiler handles DOM types)
- 02-06: VAPID keys conditionally initialized (prevents crash when env vars missing)
- 02-06: Settings page as protected route at /settings
- 02-06: .env.example exception added to .gitignore

### Pending Todos

None.

### Blockers/Concerns

- ~~Biased shuffle algorithm affects test fairness~~ (FIXED: 01-02)
- ~~Race condition in test save causes duplicate records~~ (FIXED: 01-02, integrated)
- ~~history.pushState memory leak during tests~~ (FIXED: 01-02)
- React Router + Next.js causes 404 on refresh (PWA-02 will address)
- iOS Safari 7-day data eviction (PWA-11 will mitigate)

## Session Continuity

Last session: 2026-02-06
Stopped at: Completed 02-06-PLAN.md (Push Notification Infrastructure)
Resume file: None

---

*State initialized: 2026-02-05*
*Last updated: 2026-02-06*
