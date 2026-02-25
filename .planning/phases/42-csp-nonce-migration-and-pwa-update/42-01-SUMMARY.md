---
phase: 42-csp-nonce-migration-and-pwa-update
plan: 01
subsystem: infra
tags: [csp, nonce, strict-dynamic, security-headers, next.js]
requirements-completed: [MIGR-09]

# Dependency graph
requires:
  - phase: 40-app-router-shell
    provides: "Root layout with inline theme script and ClientProviders"
  - phase: 41-route-migration
    provides: "App Router page wrappers including auth page"
provides:
  - "Nonce-based CSP with strict-dynamic in proxy.ts"
  - "Per-request nonce delivery via x-nonce request header"
  - "Consolidated security headers in proxy.ts (removed from next.config.mjs)"
  - "Nonce prop on GoogleOneTapSignIn component"
  - "Async RootLayout reading nonce from headers"
affects: [42-02, pwa, security, csp]

# Tech tracking
tech-stack:
  added: []
  patterns: ["nonce-based CSP with strict-dynamic", "request header nonce transport", "async Server Component layout"]

key-files:
  created: []
  modified:
    - proxy.ts
    - app/layout.tsx
    - src/lib/themeScript.ts
    - src/components/GoogleOneTapSignIn.tsx
    - app/(public)/auth/page.tsx
    - src/views/AuthPage.tsx
    - next.config.mjs

key-decisions:
  - "Nonce-based CSP with strict-dynamic replaces hash-based allowlisting"
  - "Security headers consolidated in proxy.ts (removed from next.config.mjs)"
  - "HASH_REDIRECT_SCRIPT removed as dead code after App Router migration"
  - "Auth page converted to async Server Component for nonce forwarding"

patterns-established:
  - "Nonce transport: proxy.ts sets x-nonce request header, layout.tsx reads via await headers()"
  - "YAGNI server wrapper: auth page.tsx reads nonce and forwards through props to GoogleOneTapSignIn"
  - "Matcher missing clause: skip prefetch requests in proxy to avoid unnecessary nonce generation"

requirements-completed: [MIGR-09]

# Metrics
duration: 4min
completed: 2026-02-25
---

# Phase 42 Plan 01: CSP Nonce Migration Summary

**Nonce-based CSP with strict-dynamic replacing hash-based allowlisting, security headers consolidated in proxy.ts, HASH_REDIRECT_SCRIPT dead code removed**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-25T09:35:09Z
- **Completed:** 2026-02-25T09:39:15Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Migrated CSP from SHA-256 hash-based to per-request nonce-based with strict-dynamic
- Consolidated all security headers (X-Frame-Options, Referrer-Policy, Permissions-Policy, etc.) from next.config.mjs into proxy.ts
- Removed HASH_REDIRECT_SCRIPT dead code from themeScript.ts, layout.tsx, and proxy.ts
- Wired nonce delivery chain: proxy.ts -> x-nonce header -> layout.tsx -> script tags, and proxy.ts -> auth page.tsx -> AuthPage -> GoogleOneTapSignIn -> Script tag
- Added matcher missing clause to skip prefetch requests

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite proxy.ts with nonce CSP and consolidate security headers** - `b59cff9` (feat)
2. **Task 2: Wire nonce to layout, GoogleOneTap, and auth page server wrapper** - `95fd51f` (feat)

## Files Created/Modified
- `proxy.ts` - Nonce generation, CSP with strict-dynamic, consolidated security headers, matcher with missing clause
- `next.config.mjs` - Removed headers() function (security headers moved to proxy.ts)
- `src/lib/themeScript.ts` - Removed HASH_REDIRECT_SCRIPT export and SHA-256 hash comment
- `app/layout.tsx` - Async layout reading x-nonce, applying to theme script, removed HASH_REDIRECT_SCRIPT tag
- `src/components/GoogleOneTapSignIn.tsx` - Added nonce prop interface, forwards nonce to Script tag
- `app/(public)/auth/page.tsx` - Converted to async Server Component reading nonce, passes to AuthPage
- `src/views/AuthPage.tsx` - Added nonce prop, forwards to GoogleOneTapSignIn

## Decisions Made
- Nonce format: `Buffer.from(crypto.randomUUID()).toString('base64')` -- standard UUID-based nonce
- strict-dynamic eliminates need for domain allowlists in script-src (Google, TipTopJar domains removed from script-src)
- await headers() forces dynamic rendering for all pages -- acceptable since all pages are client-rendered SPA wrappers
- Missing nonce silently omitted (nullish coalescing to undefined) -- scripts still render, just without CSP protection
- YAGNI approach: specific nonce prop on GoogleOneTapSignIn, not a generic NoncedScript wrapper
- frame-ancestors changed from 'none' to 'self' to match CONTEXT.md decision

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CSP nonce infrastructure is complete and ready for Phase 42 Plan 02 (PWA/service worker updates)
- All inline scripts have nonce attributes; strict-dynamic propagates trust to dynamically-loaded scripts
- Security headers are now fully managed in proxy.ts -- no split configuration

## Self-Check: PASSED

All 7 modified files verified present. Both task commits (b59cff9, 95fd51f) verified in git log. SUMMARY.md exists at expected path.

---
*Phase: 42-csp-nonce-migration-and-pwa-update*
*Completed: 2026-02-25*
