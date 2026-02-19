---
phase: 24-accessibility-performance
plan: 07
subsystem: infra
tags: [sentry, web-vitals, bundle-analyzer, performance, font-loading, service-worker]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Sentry client instrumentation (instrumentation-client.ts)"
provides:
  - "Explicit Web Vitals capture (LCP, INP, CLS, FCP, TTFB) via Sentry browserTracingIntegration"
  - "Bundle analyzer available via ANALYZE=true build flag"
  - "Production trace sampling reduced to 20%"
affects: [performance-monitoring, build-tooling]

# Tech tracking
tech-stack:
  added: ["@next/bundle-analyzer (already installed as devDep)"]
  patterns: ["browserTracingIntegration for Web Vitals", "config chain: Sentry > analyzer > Serwist > nextConfig"]

key-files:
  created: []
  modified:
    - "instrumentation-client.ts"
    - "next.config.mjs"

key-decisions:
  - "No separate web-vitals library -- Sentry SDK v10+ auto-captures all Web Vitals via browserTracingIntegration"
  - "Production tracesSampleRate set to 0.2 (20%), development stays at 1.0 (100%)"
  - "Bundle analyzer wraps inside Sentry (Sentry must be outermost for source map upload)"
  - "Myanmar font preload skipped -- webpack hashes file paths per build, and @fontsource v5 already sets font-display: swap"
  - "No SW changes needed -- audio files already cached with CacheFirst strategy (1200 entries, 90 days)"

patterns-established:
  - "Config wrapper chain order: withSentryConfig(analyzer(withSerwist(nextConfig))) -- Sentry outermost"
  - "Environment-conditional sampling: ternary on process.env.NODE_ENV for dev vs prod rates"

# Metrics
duration: 39min
completed: 2026-02-18
---

# Phase 24 Plan 07: Performance Monitoring & Optimization Summary

**Sentry Web Vitals via browserTracingIntegration with 20% production sampling, bundle analyzer via ANALYZE=true, and font/SW audit confirming existing optimizations are adequate**

## Performance

- **Duration:** 39 min
- **Started:** 2026-02-18T01:12:29Z
- **Completed:** 2026-02-18T01:51:13Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Explicit `browserTracingIntegration` captures LCP, INP, CLS, FCP, TTFB and sends to Sentry dashboard
- Production trace sample rate reduced from 100% to 20% (saves Sentry quota while maintaining representative data)
- Bundle analyzer available via `ANALYZE=true pnpm build` for treemap visualization
- Verified Myanmar font already uses `font-display: swap` via @fontsource v5 defaults (no layout shift)
- Verified service worker already caches audio files (including `/audio/my-MM/`) with CacheFirst strategy

## Task Commits

Each task was committed atomically:

1. **Task 1: Sentry Web Vitals + bundle analyzer configuration** - `003e42e` (feat)
   - Note: Changes included in 24-08 docs commit due to lint-staged stash interaction during commit process
2. **Task 2: Font optimization + service worker caching audit** - No code changes needed (audit-only task)

**Plan metadata:** (pending)

## Files Created/Modified
- `instrumentation-client.ts` - Added browserTracingIntegration, reduced production tracesSampleRate to 0.2
- `next.config.mjs` - Added @next/bundle-analyzer wrapper in config chain

## Decisions Made
- **No web-vitals library**: Sentry SDK v10+ captures all Web Vitals automatically when browserTracingIntegration is active (per research recommendation)
- **20% production sampling**: Balance between data quality and Sentry quota usage
- **Skip Myanmar font preload**: @fontsource v5 already sets `font-display: swap` in all @font-face declarations; webpack hashes font file paths per build making preload links fragile
- **No SW changes**: Audio caching (CacheFirst, 1200 entries, 90 days), static asset precaching, and offline fallback are already properly configured

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed unused variable in SegmentedProgressBar**
- **Found during:** Task 1 verification (build step)
- **Issue:** Uncommitted changes from plan 24-02 left `currentIndex` destructured but unused after role change from `progressbar` to `list`
- **Fix:** Prefixed with underscore: `currentIndex: _currentIndex`
- **Files modified:** src/components/quiz/SegmentedProgressBar.tsx
- **Verification:** `pnpm run build` passes
- **Committed in:** Captured in 24-02 commit `6936388`

**2. [Note] Task 1 commit absorbed into 24-08 docs commit**
- **Found during:** Task 1 commit process
- **Issue:** lint-staged backup/restore cycle during a failed commit attempt left instrumentation-client.ts and next.config.mjs changes in the staging area, which were then committed as part of the 24-08 SUMMARY docs commit
- **Impact:** Changes are correctly applied in HEAD; commit attribution is slightly off
- **Commit:** `003e42e`

---

**Total deviations:** 1 auto-fixed (1 blocking), 1 process note
**Impact on plan:** Auto-fix necessary for build to pass. Commit attribution issue is cosmetic -- all code changes are correct.

## Service Worker Caching Audit Findings

| Category | Strategy | Details |
|----------|----------|---------|
| Static assets (JS, CSS, fonts) | Precache | Via `self.__SW_MANIFEST` (Serwist auto-generated) |
| Runtime defaults | Mixed | `@serwist/next/worker` defaultCache strategies |
| Audio files (`/audio/*`) | CacheFirst | `audio-v2` cache, 1200 entries, 90 days expiry |
| Supabase API calls | Not cached | Correctly excluded from caching |
| Offline page | Precache + Fallback | `/offline.html` served for document requests |
| Navigation preload | Enabled | Faster navigations |

**Assessment:** SW caching is complete and well-configured. No changes needed.

## Font Loading Audit Findings

| Aspect | Status | Details |
|--------|--------|---------|
| font-display: swap | Set | @fontsource v5 sets it in all @font-face declarations |
| Weights loaded | 400, 500, 700 | Imported in pages/_app.tsx |
| Unicode subsets | Myanmar, Latin, Latin-ext | Automatic subsetting by @fontsource |
| Preload link | Not added | Webpack-hashed paths change per build; font-display: swap suffices |

**Assessment:** Myanmar font loads optimally with font-display: swap preventing layout shift.

## Issues Encountered
- Stale `.next` cache caused `MODULE_NOT_FOUND` for `/op-ed` page during build; resolved by cleaning `.next` directory
- Git stash/lint-staged interaction caused uncommitted changes from other plans to leak into staging area; resolved by careful staging management

## User Setup Required
None - no external service configuration required. Bundle analyzer is available immediately via `ANALYZE=true pnpm build`.

## Next Phase Readiness
- Web Vitals monitoring active in Sentry for production deployments
- Bundle analyzer ready for optimization analysis
- Font loading and SW caching confirmed optimal
- No blockers for subsequent plans

## Self-Check: PASSED

- FOUND: .planning/phases/24-accessibility-performance/24-07-SUMMARY.md
- FOUND: instrumentation-client.ts
- FOUND: next.config.mjs
- FOUND: commit 003e42e
- FOUND: browserTracingIntegration in instrumentation-client.ts
- FOUND: withBundleAnalyzer in next.config.mjs

---
*Phase: 24-accessibility-performance*
*Completed: 2026-02-18*
