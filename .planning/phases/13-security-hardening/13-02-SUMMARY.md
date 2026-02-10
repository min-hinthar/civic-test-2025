---
phase: 13-security-hardening
plan: 02
subsystem: security
tags: [csp, nonce, middleware, security-headers, xss-protection]

# Dependency graph
requires:
  - phase: none
    provides: standalone security layer
provides:
  - Content-Security-Policy middleware with nonce-based inline script protection
  - Supplementary security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
  - Nonce-aware _document.tsx class component
affects: [all pages, Google Sign-In, Supabase API calls, Sentry reporting, service worker]

# Tech tracking
tech-stack:
  added: []
  patterns: [CSP nonce middleware, class-based _document with getInitialProps]

key-files:
  created: [middleware.ts]
  modified: [pages/_document.tsx, next.config.mjs]

key-decisions:
  - "Nonce passed via x-nonce request header from middleware to _document getInitialProps"
  - "CSP set in middleware.ts only (not next.config.mjs) to support per-request nonces"
  - "unsafe-inline required for style-src due to Tailwind and motion/react inline styles"
  - "Supplementary headers in next.config.mjs headers() complement CSP in middleware"

patterns-established:
  - "CSP nonce flow: middleware generates nonce -> x-nonce header -> _document reads via getInitialProps -> applies to script/Head/NextScript"
  - "Security header layering: CSP in middleware (dynamic nonce), static headers in next.config.mjs"

# Metrics
duration: 24min
completed: 2026-02-10
---

# Phase 13 Plan 02: CSP Headers Summary

**Nonce-based Content-Security-Policy middleware with allowlists for Google Sign-In, Supabase, Sentry, and Google Fonts, plus supplementary security headers**

## Performance

- **Duration:** 24 min
- **Started:** 2026-02-10T04:07:30Z
- **Completed:** 2026-02-10T04:31:21Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created edge middleware with per-request CSP nonce generation and full directive coverage
- Converted _document.tsx from function to class component with getInitialProps for nonce passthrough
- Added 5 supplementary security headers via next.config.mjs headers() function
- CSP violations configured to report to Sentry via report-uri directive

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CSP middleware and convert _document.tsx to nonce-aware class component** - `49b604d` (feat)
2. **Task 2: Add supplementary security headers in next.config.mjs** - `ef4d37c` (included in concurrent 13-04 commit that captured working-tree changes)

## Files Created/Modified
- `middleware.ts` - CSP nonce generation, header injection, route matcher excluding static assets
- `pages/_document.tsx` - Class component with getInitialProps reading x-nonce, nonce on script/Head/NextScript
- `next.config.mjs` - headers() function with X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-DNS-Prefetch-Control

## Decisions Made
- Nonce passed via `x-nonce` custom request header (standard Next.js middleware pattern)
- CSP only in middleware.ts to avoid header duplication with next.config.mjs
- `style-src 'unsafe-inline'` required because Tailwind and motion/react inject inline styles
- `img-src blob: data:` for ShareCardPreview canvas export and SVG noise textures
- `frame-ancestors 'none'` since app is never embedded in iframes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- OneDrive file-sync race condition caused intermittent build failures (ENOENT on `.next/build-manifest.json` and `.next/server/pages-manifest.json`). Resolved by cleaning `.next` cache and retrying.
- Task 2's next.config.mjs changes were captured by a concurrent 13-04 commit that ran between Task 1 and Task 2, so no separate commit was needed for Task 2.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CSP middleware active on all page routes
- Supplementary security headers set on all responses
- Ready for CSP validation testing at runtime
- No blockers for subsequent plans

---
*Phase: 13-security-hardening*
*Completed: 2026-02-10*
