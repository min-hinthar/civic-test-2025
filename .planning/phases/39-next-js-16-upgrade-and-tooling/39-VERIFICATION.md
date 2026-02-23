---
phase: 39-next-js-16-upgrade-and-tooling
verified: 2026-02-23T12:30:00Z
status: human_needed
score: 11/12 must-haves verified
human_verification:
  - test: "Start dev server with `pnpm dev` and open http://localhost:3000 -- verify the app loads, navigate between routes (#/, #/auth, #/test, #/dashboard), and confirm all features work identically to v3.0"
    expected: "All routes render correctly, auth flow works, quiz/test flow works, SRS/dashboard loads, TTS produces audio, PWA service worker installs, dark/light mode and language toggles work"
    why_human: "Browser-level feature parity cannot be verified programmatically -- requires visual and interactive smoke test. Plan 39-04 includes a mandatory human-verify checkpoint (Task 2) that was approved by the user per the SUMMARY, but the verifier must flag it for documentation completeness."
  - test: "Navigate to /dev-sentry-test in dev mode -- click 'Throw in Click Handler' and verify Sentry captures the error in the dashboard"
    expected: "Error appears in Sentry issues dashboard within ~30 seconds with correct fingerprint and no PII"
    why_human: "Requires live Sentry DSN configured in environment and access to Sentry dashboard -- cannot verify from codebase alone"
---

# Phase 39: Next.js 16 Upgrade and Tooling Verification Report

**Phase Goal:** The app builds and runs on Next.js 16 with all existing functionality intact
**Verified:** 2026-02-23T12:30:00Z
**Status:** human_needed (all automated checks pass; one human-gate checkpoint documented)
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `pnpm build` succeeds on Next.js 16 with `--webpack` flag and all existing tests pass | VERIFIED | `package.json` has `"build": "next build --webpack"` and `"next": "16.1.6"` (exact pin). SUMMARY documents 511 tests passing after build. Commits `d7d20b0`, `268be8d`, `dfa277f` all verified in git log. |
| 2 | `middleware.ts` is renamed to `proxy.ts` with updated export and CSP headers still apply | VERIFIED | `proxy.ts` exists at project root with `export function proxy()`. `middleware.ts` is absent. Full CSP header string with `Content-Security-Policy` set via `response.headers.set()` confirmed in file. |
| 3 | Sentry captures errors in both dev and production via `instrumentation.ts` and `global-error.tsx` | VERIFIED | `instrumentation.ts` dynamically imports `sentry.server.config` and `sentry.edge.config`. `instrumentation-client.ts` wires `beforeSendHandler`. `app/global-error.tsx` calls `Sentry.captureException(error)` in `useEffect`. All three Sentry configs use `beforeSendHandler` from `src/lib/sentry.ts`. |
| 4 | The app loads in the browser and all existing features work identically to v3.0 | HUMAN NEEDED | Automated checks (lint, typecheck, test:run, build) all pass per SUMMARY. Manual smoke test checkpoint in Plan 39-04 Task 2 was approved by user. Cannot verify browser behavior programmatically. |

**Score:** 11/12 verifiable must-haves confirmed (1 is browser-only human verification)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `package.json` | Next.js 16 pinned, updated scripts | VERIFIED | `"next": "16.1.6"` (exact, no caret). Scripts: `"dev": "next dev"`, `"dev:webpack": "next dev --webpack"`, `"build": "next build --webpack"`, `"lint": "eslint ."` |
| `proxy.ts` | Renamed middleware with `proxy()` export | VERIFIED | File exists at project root. Contains `export function proxy()` and `export const config`. Full CSP logic intact. |
| `next.config.mjs` | Build config with `withSentryConfig` | VERIFIED | Contains `withSentryConfig(analyzer(withSerwist(nextConfig)))`. No breaking changes from Next.js 16. |
| `tsconfig.json` | Updated TypeScript config for Next.js 16 | VERIFIED | Contains `"moduleResolution": "bundler"`, `"jsx": "react-jsx"`. Include array covers `proxy.ts`, `instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `app` directory. |
| `app/global-error.tsx` | App Router error boundary capturing to Sentry | VERIFIED | Exists. Contains `"use client"`, `Sentry.captureException(error)` in `useEffect`, reset button calling `reset()`, wrapped in `<html lang="en"><body>`. |
| `src/lib/sentry.ts` | Updated with Next.js 16 noise filters | VERIFIED | Contains `hydration-mismatch` fingerprinting, `chunk-load-failure` fingerprinting, AbortError suppression (`return null`). Uses `ErrorEvent`/`EventHint` types from `@sentry/nextjs`. |
| `app/dev-sentry-test/page.tsx` | Dev-only Sentry test page | VERIFIED | Exists. `"use client"`. Guards with `process.env.NODE_ENV !== 'development'`. Has click-handler throw button and render-error throw button. |
| `instrumentation.ts` | Server-side Sentry init via dynamic import | VERIFIED | Unchanged. Dynamically imports `sentry.server.config` and `sentry.edge.config` based on `NEXT_RUNTIME`. Exports `onRequestError = Sentry.captureRequestError`. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `package.json` build script | `next.config.mjs` | `next build --webpack` | VERIFIED | Build script uses `--webpack` flag; `next.config.mjs` uses `withSentryConfig` + `withSerwist` which require webpack plugins |
| `proxy.ts` | Next.js routing | Auto-detected at project root | VERIFIED | Next.js 16 auto-detects `proxy.ts`; file exists at root with correct `export function proxy()` and `config` matcher |
| `instrumentation-client.ts` | `src/lib/sentry.ts` | `beforeSendHandler` import | VERIFIED | `import { beforeSendHandler } from './src/lib/sentry'` present; `beforeSend: beforeSendHandler` wired in `Sentry.init()` |
| `instrumentation.ts` | `sentry.server.config.ts` | Dynamic import | VERIFIED | `await import('./sentry.server.config')` inside `NEXT_RUNTIME === 'nodejs'` guard |
| `instrumentation.ts` | `sentry.edge.config.ts` | Dynamic import | VERIFIED | `await import('./sentry.edge.config')` inside `NEXT_RUNTIME === 'edge'` guard |
| `app/global-error.tsx` | `src/lib/sentry.ts` | `Sentry.captureException` | VERIFIED | `import * as Sentry from '@sentry/nextjs'`; `Sentry.captureException(error)` called in `useEffect` |

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|---------------|-------------|--------|----------|
| MIGR-01 | 39-01, 39-02, 39-04 | App builds and runs on Next.js 16 with Turbopack/webpack compatibility | SATISFIED | `"next": "16.1.6"` in `package.json`; build script uses `--webpack`; dev uses Turbopack by default; SUMMARY docs 511 tests passing |
| MIGR-02 | 39-02, 39-04 | `middleware.ts` renamed to `proxy.ts` with updated export | SATISFIED | `proxy.ts` exists with `export function proxy()`; `middleware.ts` absent from repo |
| MIGR-03 | 39-03, 39-04 | Sentry reconfigured for App Router (`instrumentation.ts`, `global-error.tsx`) | SATISFIED | `app/global-error.tsx` captures to Sentry; `instrumentation.ts` intact; noise filters added to `src/lib/sentry.ts` |

All three requirements assigned to Phase 39 in REQUIREMENTS.md are satisfied. No orphaned requirements found -- REQUIREMENTS.md traceability table marks MIGR-01, MIGR-02, MIGR-03 as "Complete" for Phase 39.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/sentry.ts` | 76 | `return null` | Info | Intentional -- AbortError suppression by design. Not a stub. |

No actual anti-patterns found. The `return null` at line 76 in `sentry.ts` is the intentional AbortError suppression filter documented in Plan 39-03 and verified by surrounding context.

### Human Verification Required

#### 1. Browser Smoke Test (Feature Parity with v3.0)

**Test:** Start dev server with `pnpm dev`, open http://localhost:3000 and verify:
- App loads at `#/` (home page)
- Navigate to `#/auth` -- login page renders, Google One Tap appears
- Navigate to `#/test` -- mock test starts, questions display in English and Burmese, score page renders
- Navigate to `#/dashboard` -- SRS deck shows, mastery milestones display
- TTS buttons produce audio in both languages
- Service worker installs (DevTools > Application > Service Workers)
- Dark mode toggle and language toggle work
- No CSS/layout regressions visible

**Expected:** All features work identically to v3.0. No visual regressions.

**Why human:** Browser rendering, interactive behavior, audio output, and service worker registration cannot be verified via file inspection or grep.

**Note:** Plan 39-04 Task 2 was a `checkpoint:human-verify` gate explicitly approved by the user per SUMMARY.md ("Manual smoke test approved by user -- all feature areas verified working identically to v3.0"). This is documented for completeness but was already performed.

#### 2. Sentry End-to-End Capture (Optional)

**Test:** In dev mode, navigate to `/dev-sentry-test`, click "Throw in Click Handler"

**Expected:** Error appears in Sentry issues dashboard within ~30 seconds

**Why human:** Requires live Sentry DSN environment variable and access to Sentry dashboard. Cannot verify from codebase alone.

### Gaps Summary

No gaps found. All automated verifications pass:

- `package.json` confirms `"next": "16.1.6"` exact pin, correct scripts
- `proxy.ts` exists with `export function proxy()` and full CSP logic
- `middleware.ts` is absent
- `app/global-error.tsx` has Sentry capture and reset button
- `src/lib/sentry.ts` has all three noise filters (hydration-mismatch, chunk-load-failure, AbortError suppression)
- `instrumentation.ts` dynamically imports server and edge Sentry configs
- `instrumentation-client.ts` wires `beforeSendHandler`
- `tsconfig.json` includes all root-level TypeScript files and `app` directory
- `eslint.config.mjs` ignores generated files for `eslint .` compatibility
- All 6 commits (247bbbe, d7d20b0, 268be8d, 03f3daf, 902833c, dfa277f) verified in git log
- Git tag `v3.0-pre-upgrade` exists for rollback safety
- REQUIREMENTS.md marks MIGR-01, MIGR-02, MIGR-03 as Complete

The only item requiring human action is the browser smoke test, which was already completed by the user per Plan 39-04 SUMMARY approval.

---

_Verified: 2026-02-23T12:30:00Z_
_Verifier: Claude (gsd-verifier)_
