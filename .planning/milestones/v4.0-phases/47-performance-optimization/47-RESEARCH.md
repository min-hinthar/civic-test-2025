# Phase 47: Performance Optimization - Research

**Researched:** 2026-03-01
**Domain:** Next.js bundle optimization (dynamic imports, optimizePackageImports, Web Vitals)
**Confidence:** HIGH

## Summary

Phase 47 targets measurable bundle size reduction through two mechanisms: (1) dynamic imports for heavy libraries that shouldn't be in the initial bundle, and (2) `optimizePackageImports` for tree-shaking improvement. The codebase already has excellent lazy-loading patterns in place (DotLottie via `React.lazy`, CelebrationOverlay via `next/dynamic`), so the actual work is narrow.

The primary gap is `InterviewResults.tsx`, which statically imports 7 recharts named exports and the `Confetti` component directly. Recharts is the biggest bundle impact (~200KB minified). The `@next/bundle-analyzer` is already wired up via `ANALYZE=true`, making before/after measurement straightforward.

**Primary recommendation:** Dynamic-import the recharts chart section within InterviewResults as a standalone component, fix the direct Confetti import, add `recharts` to `optimizePackageImports`, and document bundle size with the existing analyzer.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Capture total JS bundle size plus per-route initial load size for key routes: /home, /test, /interview, /study
- Run `ANALYZE=true pnpm build` before and after optimizations to generate comparison data
- **Focus on actual gaps only** -- don't refactor what's already lazy-loaded
- **Recharts** (`InterviewResults.tsx`): Direct import, needs dynamic/lazy wrapper -- this is the main gap
- **Confetti** (`InterviewResults.tsx`): Imports `Confetti` directly even though `CelebrationOverlay` in `GlobalOverlays.tsx` already dynamically imports it. Fix the direct import in InterviewResults
- **DotLottie**: Already lazy-loaded via `React.lazy` in `DotLottieAnimation.tsx` and behind `next/dynamic` via `GlobalOverlays.tsx` -- no work needed
- Skip date-fns entirely -- zero imports exist in the codebase
- Mark PERF-02 as partially met (recharts only added to `optimizePackageImports`)
- Add `recharts` to the existing `optimizePackageImports` array in `next.config.mjs` (already has `lucide-react`)
- Do not add date-fns (not used)
- Use Lighthouse CI to measure before and after optimization
- Measure key user paths: /home, /test, /interview, /study
- Baseline is pre-optimization v4.0 state (not comparing against v3.0 git tag)
- Null fallback for both Recharts and Confetti when dynamically imported -- no skeleton, no spinner
- Confetti is a visual effect; chart appears on a results page where slight delay is acceptable

### Claude's Discretion
- Where exactly the before/after bundle report lives (verification file, standalone doc, or inline)
- Web Vitals regression threshold (industry-standard acceptable margin)
- Whether to dynamic-import recharts/confetti per-library within InterviewResults or dynamic-import the entire InterviewResults component -- pick whichever gives better bundle reduction with minimal code churn

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PERF-01 | Heavy components (recharts, DotLottie, confetti) use dynamic imports | Recharts and Confetti in InterviewResults need dynamic import. DotLottie already lazy-loaded. |
| PERF-02 | `optimizePackageImports` configured for date-fns and recharts | Add `recharts` to existing array. date-fns not used -- mark as partially met. |
| PERF-03 | Bundle size documented with before/after comparison | Use existing `ANALYZE=true pnpm build` with `@next/bundle-analyzer`. Capture `next build` route-level output. |
| PERF-04 | Web Vitals verified against v3.0 baseline (no regressions) | Use Lighthouse CLI for LCP, FID/INP, CLS measurement on key routes. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next/dynamic | (Next.js built-in) | Dynamic imports with SSR control | Official Next.js API for code-splitting |
| @next/bundle-analyzer | (already installed) | Bundle visualization | Official Next.js bundle analysis tool |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lighthouse | CLI | Web Vitals measurement | `npx lighthouse <url> --output json` for automated metrics |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Per-library dynamic import in InterviewResults | Dynamic-import entire InterviewResults component | InterviewResults is only used in InterviewPage; however, dynamically importing the full component would also defer non-heavy imports (motion, lucide). Per-library approach is more surgical but requires extracting chart into a sub-component. |

**Recommendation:** Extract the recharts chart section into a `ScoreTrendChart` sub-component and dynamic-import that. This is the most surgical approach -- it only defers the heavy recharts library without affecting the rest of InterviewResults' render path. For Confetti, use `next/dynamic` inline in InterviewResults.

## Architecture Patterns

### Pattern 1: next/dynamic for Named Exports
**What:** Dynamic import with module resolution for named exports
**When to use:** When importing a named export from a module
**Example (from existing GlobalOverlays.tsx):**
```typescript
import dynamic from 'next/dynamic';

const CelebrationOverlay = dynamic(
  () => import('@/components/celebrations').then(m => m.CelebrationOverlay),
  { ssr: false }
);
```

### Pattern 2: Extracted Sub-Component for Partial Dynamic Import
**What:** Extract the heavy-dependency section into its own component, then dynamic-import just that
**When to use:** When only part of a large component uses a heavy library
**Example:**
```typescript
// ScoreTrendChart.tsx (new file, extracted from InterviewResults)
'use client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
// ... chart rendering logic

// InterviewResults.tsx
const ScoreTrendChart = dynamic(
  () => import('./ScoreTrendChart').then(m => m.ScoreTrendChart),
  { ssr: false, loading: () => null }
);
```

### Pattern 3: optimizePackageImports
**What:** Next.js experimental config that auto-transforms barrel imports to direct file imports
**When to use:** For packages with large barrel exports (like recharts, lucide-react)
**Example (existing in next.config.mjs):**
```javascript
experimental: {
  optimizePackageImports: ['lucide-react', 'recharts'],
}
```

### Anti-Patterns to Avoid
- **Lazy-loading already-lazy components:** DotLottie is already behind `React.lazy` -- don't double-wrap
- **Dynamic import with loading spinners for decorative content:** Confetti and charts are non-critical UI; null fallback is correct
- **Using React.lazy in App Router pages:** Prefer `next/dynamic` which integrates with Next.js streaming/SSR

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bundle analysis | Custom webpack stats parser | `ANALYZE=true pnpm build` | @next/bundle-analyzer already configured |
| Web Vitals measurement | Manual performance.mark/measure | Lighthouse CLI | Standardized, reproducible, industry-accepted |
| Code splitting | Manual `import()` with state management | `next/dynamic` | Handles SSR, loading states, error boundaries |

## Common Pitfalls

### Pitfall 1: Dynamic Import Breaking TypeScript Props
**What goes wrong:** Extracting a component to dynamic import breaks type inference for props
**Why it happens:** `next/dynamic` returns a dynamically loaded component; TypeScript may lose prop types
**How to avoid:** Export the props interface from the new component file and import it in the parent
**Warning signs:** TypeScript errors on the dynamic component's usage

### Pitfall 2: Confetti Direct Import in Multiple Files
**What goes wrong:** Fixing Confetti import in InterviewResults but missing other direct imports
**Why it happens:** Confetti is imported directly in 4 files: InterviewResults, BadgeCelebration, MasteryMilestone, SortModeContainer
**How to avoid:** The context says to focus on InterviewResults only. The other imports (Dashboard, HubPage, StudyGuidePage) are page-level components that load on navigation -- canvas-confetti is relatively small (~6KB gzipped) and these pages aren't initial load paths
**Warning signs:** Over-scoping the Confetti changes beyond what CONTEXT.md specifies

### Pitfall 3: SSR Mismatch with Dynamic Imports
**What goes wrong:** Components using browser APIs (canvas, window) crash during SSR
**Why it happens:** Dynamic imports without `ssr: false` still render on server
**How to avoid:** Always use `{ ssr: false }` for recharts (uses SVG measuring) and confetti (uses canvas)

### Pitfall 4: Bundle Analyzer Comparing Wrong Builds
**What goes wrong:** Before/after comparison is invalid because builds used different settings
**Why it happens:** ANALYZE=true adds analyzer overhead; comparing against non-ANALYZE build is misleading
**How to avoid:** Use `next build` route-level output (First Load JS) for comparison, not analyzer totals. Use analyzer for visual confirmation only.

## Code Examples

### Dynamic Import for ScoreTrendChart
```typescript
// src/components/interview/ScoreTrendChart.tsx
'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { getTokenColor } from '@/lib/tokens';

interface ScoreTrendChartProps {
  data: Array<{ date: string; score: number }>;
}

export function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
          {/* ... existing chart JSX from InterviewResults */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Dynamic Import in InterviewResults
```typescript
import dynamic from 'next/dynamic';

const ScoreTrendChart = dynamic(
  () => import('./ScoreTrendChart').then(m => m.ScoreTrendChart),
  { ssr: false, loading: () => null }
);

const Confetti = dynamic(
  () => import('@/components/celebrations/Confetti').then(m => m.Confetti),
  { ssr: false, loading: () => null }
);
```

### optimizePackageImports Config
```javascript
// next.config.mjs line 18
optimizePackageImports: ['lucide-react', 'recharts'],
```

### Bundle Size Capture (next build output)
```bash
# Before optimization
pnpm build --webpack 2>&1 | tee /tmp/bundle-before.txt

# After optimization
pnpm build --webpack 2>&1 | tee /tmp/bundle-after.txt
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual `import()` + useState | `next/dynamic` with options | Next.js 13+ | Cleaner API, SSR integration |
| `React.lazy` + Suspense | `next/dynamic` (preferred in App Router) | Next.js 13+ | Better streaming support |
| Manual tree-shaking config | `optimizePackageImports` | Next.js 13.5+ | Automatic barrel optimization |

## Open Questions

1. **Web Vitals baseline source**
   - What we know: Context says "pre-optimization v4.0 state" not v3.0 git tag
   - What's unclear: Whether to run Lighthouse locally or in CI
   - Recommendation: Run Lighthouse locally on `pnpm build && pnpm start` for both before/after snapshots. Document in bundle report.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x with jsdom |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test -- --run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PERF-01 | Recharts/Confetti use dynamic imports | build verification | `pnpm build --webpack` (verify no recharts in initial chunks) | Wave 0 |
| PERF-02 | optimizePackageImports configured | config check | `grep 'recharts' next.config.mjs` | N/A (manual) |
| PERF-03 | Bundle size documented | build output | `pnpm build --webpack` route output comparison | Wave 0 |
| PERF-04 | Web Vitals no regression | Lighthouse | `npx lighthouse http://localhost:3000 --output json` | Manual |

### Sampling Rate
- **Per task commit:** `pnpm typecheck && pnpm lint`
- **Per wave merge:** `pnpm build --webpack` (full build)
- **Phase gate:** Full build green + Lighthouse metrics documented

### Wave 0 Gaps
None -- existing build infrastructure (`pnpm build --webpack`, `ANALYZE=true`, vitest) covers all phase requirements. No new test files needed for this phase since verification is build-output-based.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `InterviewResults.tsx` (lines 6-14, 29) -- confirmed direct recharts + Confetti imports
- Codebase analysis: `next.config.mjs` (line 18) -- confirmed `optimizePackageImports: ['lucide-react']`
- Codebase analysis: `GlobalOverlays.tsx` -- confirmed `next/dynamic` pattern for SSR-false imports
- Codebase analysis: `DotLottieAnimation.tsx` -- confirmed already lazy-loaded via `React.lazy`

### Secondary (MEDIUM confidence)
- Next.js documentation on `optimizePackageImports` -- stable since Next.js 13.5, works with recharts barrel exports
- Lighthouse CLI for Web Vitals measurement -- industry standard

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all tools already in the project
- Architecture: HIGH - patterns already established in codebase (GlobalOverlays.tsx, DotLottieAnimation.tsx)
- Pitfalls: HIGH - well-understood domain (dynamic imports in Next.js)

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable domain, no fast-moving dependencies)
