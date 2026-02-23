# Phase 39: Next.js 16 Upgrade and Tooling - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Upgrade the app from Next.js 15 to Next.js 16 with all existing functionality intact. Reconfigure Sentry and service worker tooling for the new framework. The existing Pages Router SPA shell stays — App Router migration is Phase 40-41.

Requirements: MIGR-01, MIGR-02, MIGR-03

</domain>

<decisions>
## Implementation Decisions

### Build Tooling
- Target Turbopack everywhere (dev and prod) as primary bundler
- Auto-fallback to webpack if any plugin (Serwist, Sentry) is incompatible with Turbopack
- Add separate npm scripts: `npm run dev` (Turbopack), `npm run dev:webpack` (fallback)
- Set up dual CI builds (Turbopack + webpack) to catch regressions
- Migrate to Next.js 16's new config API if @serwist and @sentry support it; fall back to legacy wrapping pattern if not
- Pin exact Next.js version (e.g., `"next": "16.0.0"`) — no caret ranges
- Keep Pages Router working in this phase — `pages/[[...slug]].tsx` stays as SPA shell
- Follow Next.js 16 tsconfig recommendations (update module resolution, target, etc.)

### Dependency Handling
- Upgrade ALL dependencies to latest, not just broken ones — take the opportunity for a clean slate
- Separate commit for non-Next dependency upgrades first, verify tests pass, THEN upgrade Next.js — isolates breakage
- Delete and regenerate pnpm-lock.yaml (`rm pnpm-lock.yaml && pnpm install`) — clean lockfile
- Use pnpm overrides with TODO comments if transitive deps haven't updated for Next.js 16
- Priority order for Next.js-coupled deps: Sentry > Serwist > next-themes
- If @serwist/next doesn't support Next.js 16, drop the wrapper and use serwist directly with custom plugin
- Upgrade React to latest version alongside Next.js 16
- Claude evaluates whether any deps are redundant and can be dropped (e.g., next-themes if ThemeContext covers it)

### Sentry Migration
- Full App Router integration: create `instrumentation.ts` and `global-error.tsx`
- Delete old Pages Router Sentry files (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`) — clean break
- Upgrade @sentry/nextjs to latest SDK version
- Keep existing `errorSanitizer.ts` and PII scrubbing unchanged
- Reconfigure source maps upload for the new build chain (Turbopack/webpack dual)
- `global-error.tsx`: functional only — reports to Sentry, shows reset button. No design polish yet.
- Create dev-only test page with throw button to verify Sentry captures end-to-end
- Add Next.js 16 noise filters (hydration mismatches, chunk load failures, etc.) to beforeSend

### Verification
- All Vitest tests must pass — fix any tests broken by Next.js 16 API changes (no .skip() or .todo())
- Manual smoke test with formal feature checklist covering:
  - Auth: login, logout, Google One Tap OAuth
  - Quiz: start test, answer questions, see score with celebrations
  - SRS + Dashboard: spaced repetition deck, progress tracking, mastery milestones
  - TTS + PWA + Offline: text-to-speech, service worker install, offline mode, sync queue
- Create pre-upgrade git tag (`v3.0-pre-upgrade`) before any changes for easy rollback
- Compare bundle sizes before/after — document significant changes in commit
- Visual parity required — any CSS/layout regression blocks the phase
- No performance regression — Lighthouse/Web Vitals must be same or better
- `pnpm build` succeeds and app loads in browser

### Claude's Discretion
- Choice of serwist direct configuration if @serwist/next wrapper needs replacing
- Whether to drop next-themes or other redundant dependencies
- Exact Next.js 16 noise filter patterns for Sentry
- Compression algorithm and temp file handling during build

</decisions>

<specifics>
## Specific Ideas

- Dual npm scripts pattern: `dev` for Turbopack (fast), `dev:webpack` for fallback (compatible)
- Pre-upgrade git tag as safety net before touching anything
- Dependency upgrades in a separate commit before the Next.js bump — git bisect friendly
- Sentry test page with intentional throw to verify error capture pipeline end-to-end

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 39-next-js-16-upgrade-and-tooling*
*Context gathered: 2026-02-23*
