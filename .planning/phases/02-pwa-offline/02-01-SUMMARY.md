---
phase: 02-pwa-offline
plan: 01
subsystem: pwa
tags: [serwist, service-worker, pwa, offline, manifest, workbox]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Next.js project setup, ESLint configuration
provides:
  - Web app manifest with bilingual metadata
  - Service worker with Serwist precaching
  - Offline fallback page (bilingual English/Burmese)
  - App icons (192x192 and 512x512, standard and maskable)
  - PWA installability requirements met
affects: [02-02, 02-03, 02-04, 02-05, 02-06, 02-07, 02-08]

# Tech tracking
tech-stack:
  added: ["@serwist/next@9.5.4", "serwist@9.5.4", "idb-keyval@6.2.2"]
  patterns: ["Service worker with Serwist", "Manifest in public/ for Pages Router"]

key-files:
  created:
    - src/lib/pwa/sw.ts
    - public/manifest.json
    - public/offline.html
    - pages/_document.tsx
    - tsconfig.sw.json
    - public/icons/icon-192.png
    - public/icons/icon-512.png
    - public/icons/icon-maskable-192.png
    - public/icons/icon-maskable-512.png
  modified:
    - next.config.mjs
    - package.json
    - pnpm-lock.yaml
    - eslint.config.mjs
    - .gitignore

key-decisions:
  - "Used static public/manifest.json instead of app/manifest.ts (Pages Router doesn't support App Router Metadata API)"
  - "Added serviceworker globals to ESLint for service worker context"
  - "Serwist disabled in development mode to avoid caching issues during dev"
  - "Chained Serwist as inner wrapper with Sentry outer for correct webpack config order"

patterns-established:
  - "PWA files in src/lib/pwa/ directory"
  - "Bilingual error/status pages (English + Burmese)"
  - "Service worker type declarations with triple-slash reference lib directive"

# Metrics
duration: 32min
completed: 2026-02-06
---

# Phase 02 Plan 01: PWA Foundation Summary

**Serwist service worker with precaching, manifest with bilingual app metadata, and offline fallback page in English/Burmese**

## Performance

- **Duration:** 32 min
- **Started:** 2026-02-06T10:39:23Z
- **Completed:** 2026-02-06T11:11:19Z
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments

- Installed Serwist PWA dependencies with proper Next.js integration
- Created web app manifest with bilingual app name and US patriotic blue theme (#002868)
- Built service worker with Serwist precaching and navigation fallback
- Generated placeholder icons for both standard and maskable formats
- Created bilingual offline fallback page with "Try Again" functionality

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Serwist dependencies and configure Next.js** - `d98a9f2` (feat)
2. **Task 2: Create web app manifest and app icons** - `7c2e220` (feat)
3. **Task 3: Create service worker and offline fallback page** - `72e66e1` (feat)

## Files Created/Modified

- `src/lib/pwa/sw.ts` - Service worker source with Serwist configuration
- `public/manifest.json` - Web app manifest with icons and theme
- `public/offline.html` - Bilingual offline fallback page
- `pages/_document.tsx` - HTML head with manifest link and Apple PWA meta tags
- `tsconfig.sw.json` - TypeScript config for service worker compilation
- `next.config.mjs` - Chained Serwist with Sentry config
- `eslint.config.mjs` - Added serviceworker globals
- `.gitignore` - Added generated sw.js files
- `public/icons/icon-*.png` - Placeholder app icons (4 files)

## Decisions Made

1. **Static manifest.json instead of app/manifest.ts** - Project uses Pages Router which doesn't support the App Router Metadata API. Used static manifest in public/ with _document.tsx linking.

2. **serviceworker globals in ESLint** - Added `globals.serviceworker` to ESLint config to recognize ServiceWorkerGlobalScope and related types.

3. **Triple-slash reference directive** - Used `/// <reference lib="webworker" />` in sw.ts to get ServiceWorkerGlobalScope types in the main TypeScript compilation.

4. **Serwist disabled in development** - Set `disable: process.env.NODE_ENV === "development"` to prevent service worker caching issues during development.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created static manifest instead of App Router manifest.ts**
- **Found during:** Task 2 (Create web app manifest)
- **Issue:** Plan specified `src/app/manifest.ts` but project uses Pages Router, not App Router. The Metadata API is only available in App Router.
- **Fix:** Created `public/manifest.json` static file and added `pages/_document.tsx` with manifest link
- **Files modified:** public/manifest.json, pages/_document.tsx
- **Verification:** Build succeeds, manifest accessible at /manifest.json
- **Committed in:** 7c2e220 (Task 2 commit)

**2. [Rule 3 - Blocking] Added serviceworker globals to ESLint**
- **Found during:** Task 1 (Initial build verification)
- **Issue:** ESLint error `'ServiceWorkerGlobalScope' is not defined` because serviceworker globals weren't in the ESLint config
- **Fix:** Added `...globals.serviceworker` to ESLint globals
- **Files modified:** eslint.config.mjs
- **Verification:** Build succeeds without ESLint errors
- **Committed in:** d98a9f2 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 3 - Blocking)
**Impact on plan:** Both necessary for build to succeed. No scope creep - just adapting to Pages Router project structure.

## Issues Encountered

- **ServiceWorkerGlobalScope type error** - Initial build failed because the type wasn't recognized. Fixed by adding triple-slash reference directive `/// <reference lib="webworker" />` to sw.ts.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PWA foundation complete with manifest, service worker, and offline fallback
- Ready for 02-02 (IndexedDB question caching)
- Ready for 02-06 (Online/offline status indicator)
- Service worker pattern established for future plans
- idb-keyval installed and ready for use in sync queue plans

---
*Phase: 02-pwa-offline*
*Completed: 2026-02-06*

## Self-Check: PASSED
