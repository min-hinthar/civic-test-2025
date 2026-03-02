---
phase: 40-app-router-foundation
plan: 01
subsystem: ui
tags: [react, context-providers, theme, csp, app-router-migration]
requirements-completed: [MIGR-04]

# Dependency graph
requires:
  - phase: 39-nextjs-16-upgrade
    provides: "Next.js 16 with App Router support"
provides:
  - "Shared THEME_SCRIPT constant for both Pages Router and App Router"
  - "ClientProviders component with 10 context providers in correct nesting order"
  - "routerWrapper prop pattern for framework-agnostic provider tree"
affects: [40-02, 40-03, app-router-layout, appshell-refactor]

# Tech tracking
tech-stack:
  added: []
  patterns: ["shared constant extraction for dual-router CSP", "framework-agnostic provider tree with optional router wrapper"]

key-files:
  created:
    - src/lib/themeScript.ts
    - src/components/ClientProviders.tsx
  modified:
    - pages/_document.tsx

key-decisions:
  - "THEME_SCRIPT extracted as byte-for-byte identical string to preserve CSP hash"
  - "ClientProviders uses optional routerWrapper prop (not hard-coded BrowserRouter) for framework agnosticism"

patterns-established:
  - "Shared constants pattern: extract inline scripts to importable modules for dual-router reuse"
  - "Provider tree composition: optional routerWrapper between StateProvider and NavigationProvider"

requirements-completed: [MIGR-04]

# Metrics
duration: 4min
completed: 2026-02-24
---

# Phase 40 Plan 01: Shared Foundations Summary

**Shared THEME_SCRIPT constant and ClientProviders component with 10 context providers for dual Pages/App Router usage**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-24T08:39:43Z
- **Completed:** 2026-02-24T08:43:38Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Extracted inline THEME_SCRIPT from _document.tsx to shared `src/lib/themeScript.ts` module (byte-for-byte identical runtime string preserving CSP hash)
- Created `src/components/ClientProviders.tsx` with all 10 context providers nested in exact AppShell.tsx order
- ClientProviders accepts optional `routerWrapper` prop for framework-agnostic usage by both Pages Router and App Router

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract theme script to shared constant and update _document.tsx** - `80f0906` (feat)
2. **Task 2: Create ClientProviders component with 10 context providers** - `df65dd3` (feat)

## Files Created/Modified
- `src/lib/themeScript.ts` - Shared THEME_SCRIPT constant for CSP-hashed inline theme script
- `src/components/ClientProviders.tsx` - Framework-agnostic provider tree (ErrorBoundary + 10 providers + optional router wrapper)
- `pages/_document.tsx` - Updated to import THEME_SCRIPT from shared module, CSP comment references proxy.ts

## Decisions Made
- THEME_SCRIPT extracted as byte-for-byte identical string to preserve CSP hash in proxy.ts
- ClientProviders uses optional `routerWrapper` prop pattern rather than hard-coding BrowserRouter -- enables App Router usage without react-router-dom dependency
- CSP hash comment updated from "middleware.ts" to "proxy.ts" to reflect the 39-02 rename

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `THEME_SCRIPT` ready for import in `app/layout.tsx` (Plan 02)
- `ClientProviders` ready for use in both AppShell refactor and App Router layout (Plan 02)
- Provider nesting order preserved exactly, safe for AppShell to delegate to ClientProviders

## Self-Check: PASSED

All files exist, all commits verified.

---
*Phase: 40-app-router-foundation*
*Completed: 2026-02-24*
