---
phase: 40-app-router-foundation
plan: 02
subsystem: ui
tags: [app-router, layout, metadata, viewport, provider-tree, server-component]

# Dependency graph
requires:
  - phase: 40-app-router-foundation
    plan: 01
    provides: "ClientProviders component and THEME_SCRIPT constant"
provides:
  - "Production-ready App Router root layout with metadata, viewport, fonts, CSS, theme script"
  - "Refactored AppShell using ClientProviders as single source of truth for provider nesting"
affects: [40-03, app-router-pages, route-migration]

# Tech tracking
tech-stack:
  added: []
  patterns: ["App Router metadata/viewport API for SEO and PWA meta tags", "dual theme-color with prefers-color-scheme media queries"]

key-files:
  created: []
  modified:
    - app/layout.tsx
    - src/AppShell.tsx

key-decisions:
  - "App Router layout uses metadata/viewport exports instead of manual meta tags (Next.js best practice)"
  - "Dual theme-color array for light/dark prefers-color-scheme (replaces single static theme-color)"
  - "ClientProviders wraps children WITHOUT routerWrapper in app/layout.tsx (App Router does not use react-router-dom)"

patterns-established:
  - "Server Component layout pattern: metadata + viewport exports, ClientProviders wrapping children"
  - "AppShell delegation pattern: routerWrapper={Router} passed to ClientProviders for Pages Router usage"

requirements-completed: [MIGR-04]

# Metrics
duration: 7min
completed: 2026-02-24
---

# Phase 40 Plan 02: Root Layout & AppShell Refactor Summary

**Production App Router root layout with metadata/viewport API and AppShell refactored to delegate provider nesting to ClientProviders**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-24T08:47:03Z
- **Completed:** 2026-02-24T08:54:13Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Built production-ready `app/layout.tsx` Server Component with metadata (title, description, manifest, appleWebApp), viewport (device-width, cover, dual theme-color), fonts, CSS, theme script, and ClientProviders
- Refactored `src/AppShell.tsx` to use `<ClientProviders routerWrapper={Router}>` instead of 10 inline provider imports and deep nesting
- Validated dual router coexistence: App Router serves `/_not-found` and `/dev-sentry-test`, Pages Router serves `[[...slug]]`

## Task Commits

Each task was committed atomically:

1. **Task 1: Build production-ready app/layout.tsx** - `abf3557` (feat)
2. **Task 2: Refactor AppShell to use ClientProviders** - `f043d93` (refactor)

## Files Created/Modified
- `app/layout.tsx` - Full Server Component root layout with metadata, viewport, fonts, CSS, theme script, ClientProviders
- `src/AppShell.tsx` - Refactored to use ClientProviders with routerWrapper prop, removed 10 provider imports

## Decisions Made
- App Router layout uses Next.js metadata/viewport exports instead of manual `<meta>` tags in `<Head>` (API-driven approach is type-safe and enables framework optimizations)
- Dual theme-color array with `prefers-color-scheme` media queries replaces single static theme-color from `_document.tsx` (better dark mode support)
- ClientProviders in `app/layout.tsx` does NOT receive routerWrapper (App Router pages don't use react-router-dom; only Pages Router AppShell passes `routerWrapper={Router}`)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- App Router root layout is production-ready for serving App Router pages
- AppShell delegates to ClientProviders -- single source of truth for provider nesting order
- Both routers coexist cleanly, ready for route migration in Plan 03 and beyond

## Self-Check: PASSED

All files exist, all commits verified.

---
*Phase: 40-app-router-foundation*
*Completed: 2026-02-24*
