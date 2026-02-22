---
phase: 38-security-analysis-fixes-and-codebase-refactoring-based-on-learnings-and-error-history
plan: 01
subsystem: security
tags: [sentry, csp, xss, rls, pnpm-audit, bn.js, env-vars, security-checklist]

requires:
  - phase: 13-security-hardening
    provides: CSP middleware, RLS on all tables, PII stripping, API route auth, HTTP headers
provides:
  - Sentry DSN env-var sourcing across all config files
  - Production tracesSampleRate 0.2 for server/edge
  - bn.js CVE fix via pnpm override
  - Complete .env.example with all 11 required vars
  - Comprehensive security checklist artifact (16 sections, 104 items)
affects: [sentry-config, dependency-management, security-documentation]

tech-stack:
  added: []
  patterns: [env-var-sourced-sentry-dsn, environment-conditional-sampling]

key-files:
  created:
    - .planning/security/security-checklist.md
  modified:
    - sentry.server.config.ts
    - sentry.edge.config.ts
    - instrumentation-client.ts
    - package.json
    - pnpm-lock.yaml
    - .env.example

key-decisions:
  - "Sentry DSN moved to NEXT_PUBLIC_SENTRY_DSN env var (public key, not secret) for per-environment config and rotation"
  - "Production tracesSampleRate set to 0.2 (80% reduction) to conserve Sentry quota while keeping 100% in development"
  - "bn.js override >=5.2.3 chosen over replacing web-push (simpler fix for moderate DoS CVE)"
  - "TipTopJar external script accepted without SRI (third-party widget, CSP origin-restricted, optional feature)"

patterns-established:
  - "Sentry config: always source DSN from process.env.NEXT_PUBLIC_SENTRY_DSN"
  - "Sentry sampling: use environment-conditional rates (0.2 prod, 1.0 dev)"

requirements-completed: [CONTEXT-security-audit, CONTEXT-security-checklist]

duration: 16min
completed: 2026-02-22
---

# Phase 38 Plan 01: Security Hardening & Checklist Summary

**Sentry DSN env-var sourced across all configs, bn.js CVE patched, production tracesSampleRate reduced to 0.2, and 104-item security checklist covering 16 audit surfaces**

## Performance

- **Duration:** 16 min
- **Started:** 2026-02-22T07:55:49Z
- **Completed:** 2026-02-22T08:12:16Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Replaced hardcoded Sentry DSN in all 3 config files (server, edge, client) with `process.env.NEXT_PUBLIC_SENTRY_DSN`
- Reduced production tracesSampleRate from 1.0 to 0.2 across server/edge configs (80% quota savings)
- Fixed bn.js moderate CVE via pnpm override (`>=5.2.3`), reducing audit vulnerabilities from 4 to 1 (1 already in ignoreCves)
- Documented `NEXT_PUBLIC_SENTRY_DSN` and `SRS_CRON_API_KEY` in `.env.example` (now 11 complete vars)
- Created comprehensive 257-line security checklist covering: dependencies, auth, CSP, XSS, input sanitization, storage, HTTP headers, API routes, third-party data, service worker, push notifications, env vars, console output, ErrorBoundary, Sentry, SRI
- Fresh codebase verification for every finding (not copied from research)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix Sentry configuration and dependency vulnerability** - `f0042e9` (fix)
2. **Task 1 deviation: Fix client Sentry DSN** - `5a17906` (fix)
3. **Task 2: Produce comprehensive security checklist artifact** - `292651c` (docs)

## Files Created/Modified
- `sentry.server.config.ts` - DSN from env var, tracesSampleRate conditional
- `sentry.edge.config.ts` - DSN from env var, tracesSampleRate conditional
- `instrumentation-client.ts` - DSN from env var (deviation fix)
- `package.json` - pnpm.overrides for bn.js >=5.2.3
- `pnpm-lock.yaml` - Lockfile regenerated with bn.js override
- `.env.example` - Added NEXT_PUBLIC_SENTRY_DSN and SRS_CRON_API_KEY
- `.planning/security/security-checklist.md` - 16-section, 104-item security audit

## Decisions Made
- Sentry DSN uses `NEXT_PUBLIC_` prefix (correct -- DSN is a public key, not a secret, and needs client-side access)
- bn.js override `>=5.2.3` chosen over replacing `web-push` dependency (simpler fix, lower risk)
- TipTopJar external script accepted without SRI (CSP origin-restricted, third-party widget that would break on CDN updates)
- Console output (61 calls across 28 files) classified as ACCEPTABLE RISK -- no PII leaked, improvement deferred to later plans
- Error fingerprinting marked as ACTION NEEDED -- deferred to Plan 03+

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed hardcoded DSN in instrumentation-client.ts**
- **Found during:** Task 2 (security audit file review)
- **Issue:** `instrumentation-client.ts` (client Sentry config) also had hardcoded DSN, not mentioned in plan which only listed server/edge configs
- **Fix:** Replaced hardcoded DSN with `process.env.NEXT_PUBLIC_SENTRY_DSN`
- **Files modified:** `instrumentation-client.ts`
- **Verification:** `grep -c "process.env.NEXT_PUBLIC_SENTRY_DSN" instrumentation-client.ts` returns 1
- **Committed in:** `5a17906`

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Essential for completeness -- plan missed the third config file. No scope creep.

## Issues Encountered
- Pre-existing TypeScript error in `src/lib/async/withRetry.test.ts` (untracked file from previous session references module not yet created). Does not affect current changes -- build succeeds.

## User Setup Required
**Environment variable:** Add `NEXT_PUBLIC_SENTRY_DSN` to Vercel dashboard (and local `.env.local`) with the Sentry DSN value. The hardcoded DSN has been removed from config files -- the app will silently disable Sentry if this env var is not set.

Also add `SRS_CRON_API_KEY` if not already set in Vercel.

## Next Phase Readiness
- Security audit complete, checklist artifact ready for reference
- Error fingerprinting identified as next security improvement (Plan 03+)
- Console output cleanup and error handling standardization ready for subsequent plans

---
*Phase: 38-security-analysis-fixes-and-codebase-refactoring-based-on-learnings-and-error-history*
*Completed: 2026-02-22*
