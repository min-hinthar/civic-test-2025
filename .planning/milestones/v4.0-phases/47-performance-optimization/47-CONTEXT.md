# Phase 47: Performance Optimization - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Reduce bundle size through dynamic imports and `optimizePackageImports`, then verify Web Vitals show no regression. Specifically: Recharts, DotLottie, and confetti must not be in the initial bundle; bundle size is documented before/after; Web Vitals are verified against a pre-optimization baseline.

</domain>

<decisions>
## Implementation Decisions

### Bundle documentation
- Capture total JS bundle size plus per-route initial load size for key routes: /home, /test, /interview, /study
- Run `ANALYZE=true pnpm build` before and after optimizations to generate comparison data

### Dynamic import scope
- **Focus on actual gaps only** — don't refactor what's already lazy-loaded
- **Recharts** (`InterviewResults.tsx`): Direct import, needs dynamic/lazy wrapper — this is the main gap
- **Confetti** (`InterviewResults.tsx`): Imports `Confetti` directly even though `CelebrationOverlay` in `GlobalOverlays.tsx` already dynamically imports it. Fix the direct import in InterviewResults
- **DotLottie**: Already lazy-loaded via `React.lazy` in `DotLottieAnimation.tsx` and behind `next/dynamic` via `GlobalOverlays.tsx` — no work needed

### date-fns
- Skip entirely — zero imports of date-fns exist in the codebase
- Mark PERF-02 as partially met (recharts only added to `optimizePackageImports`)

### optimizePackageImports
- Add `recharts` to the existing `optimizePackageImports` array in `next.config.mjs` (already has `lucide-react`)
- Do not add date-fns (not used)

### Web Vitals measurement
- Use Lighthouse CI to measure before and after optimization
- Measure key user paths: /home, /test, /interview, /study
- Baseline is pre-optimization v4.0 state (not comparing against v3.0 git tag)

### Loading states
- Null fallback for both Recharts and Confetti when dynamically imported — no skeleton, no spinner
- Confetti is a visual effect; chart appears on a results page where slight delay is acceptable

### Claude's Discretion
- Where exactly the before/after bundle report lives (verification file, standalone doc, or inline)
- Web Vitals regression threshold (industry-standard acceptable margin)
- Whether to dynamic-import recharts/confetti per-library within InterviewResults or dynamic-import the entire InterviewResults component — pick whichever gives better bundle reduction with minimal code churn

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The requirements (PERF-01 through PERF-04) are technically precise and leave little ambiguity.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `GlobalOverlays.tsx`: Already demonstrates the `next/dynamic` + `ssr: false` pattern for heavy browser-only components — use as template
- `DotLottieAnimation.tsx`: Shows `React.lazy` + `Suspense` pattern for lazy loading — alternative approach available
- `@next/bundle-analyzer`: Already wired up in `next.config.mjs` via `ANALYZE=true` env var

### Established Patterns
- Dynamic imports use `next/dynamic` with `{ ssr: false }` and `.then(m => m.ComponentName)` for named exports
- `optimizePackageImports` array in `next.config.mjs` under `experimental` — currently has `['lucide-react']`

### Integration Points
- `InterviewResults.tsx`: Main file needing changes — imports recharts (6 named exports) and Confetti directly
- `next.config.mjs` line 18: `optimizePackageImports` array to extend
- `celebrations/index.ts`: Barrel export file — re-exports Confetti (relevant if dynamic import strategy changes)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 47-performance-optimization*
*Context gathered: 2026-03-01*
