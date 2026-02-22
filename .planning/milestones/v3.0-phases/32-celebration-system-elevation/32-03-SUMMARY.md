---
phase: 32-celebration-system-elevation
plan: 03
subsystem: ui
tags: [lottie, wasm, animation, dotlottie, csp, lazy-loading, a11y]

# Dependency graph
requires:
  - phase: 31-animation-interaction-polish
    provides: useReducedMotion hook and animation infrastructure
provides:
  - DotLottieAnimation lazy-loaded wrapper component
  - CSP wasm-unsafe-eval directive for WASM compilation
  - public/lottie/ directory for animation assets
affects: [32-celebration-system-elevation, celebration consumers]

# Tech tracking
tech-stack:
  added: ["@lottiefiles/dotlottie-react@0.18.1"]
  patterns: [lazy-loaded WASM component, adaptive frame-rate performance]

key-files:
  created:
    - src/components/celebrations/DotLottieAnimation.tsx
  modified:
    - middleware.ts
    - src/components/celebrations/index.ts
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "DotLottie type imported from @lottiefiles/dotlottie-react re-export (not direct dotlottie-web dependency)"
  - "All hooks called before reduced-motion early return to satisfy rules-of-hooks"
  - "Glow wrapper uses inline CSS hex+alpha (33 = 20% opacity) for simplicity over token variables"

patterns-established:
  - "Lazy WASM component: React.lazy + Suspense fallback={null} for supplementary animations"
  - "Adaptive performance: measure frame timing over N samples, downgrade speed if below threshold"

requirements-completed: [CELB-06]

# Metrics
duration: 21min
completed: 2026-02-20
---

# Phase 32 Plan 03: DotLottie Animation Wrapper Summary

**Lazy-loaded DotLottie WASM wrapper with CSP wasm-unsafe-eval, reduced motion support, and adaptive frame-rate performance degradation**

## Performance

- **Duration:** 21 min
- **Started:** 2026-02-20T13:11:44Z
- **Completed:** 2026-02-20T13:32:57Z
- **Tasks:** 1
- **Files modified:** 5

## Accomplishments
- Installed @lottiefiles/dotlottie-react (WASM-based 60fps Lottie renderer)
- Updated production CSP with wasm-unsafe-eval (narrower than unsafe-eval, only allows WASM compilation)
- Created DotLottieAnimation component with React.lazy for ~200KB WASM lazy loading
- Implemented adaptive performance: samples 10 frames, downgrades to 0.5x speed if avg frame duration exceeds 33ms (<30fps)
- Reduced motion returns null (DotLottie is supplementary -- confetti + sound carry celebrations)
- Optional glowColor prop renders radial gradient backdrop behind animation

## Task Commits

Each task was committed atomically:

1. **Task 1: Install DotLottie, update CSP, and create DotLottieAnimation wrapper** - `640b8c0` (feat)

**Plan metadata:** (pending final docs commit)

## Files Created/Modified
- `src/components/celebrations/DotLottieAnimation.tsx` - Lazy-loaded DotLottie wrapper with reduced motion, glow, and adaptive performance
- `middleware.ts` - Added wasm-unsafe-eval to production CSP script-src
- `src/components/celebrations/index.ts` - Added DotLottieAnimation export
- `package.json` - Added @lottiefiles/dotlottie-react dependency
- `pnpm-lock.yaml` - Lock file updated

## Decisions Made
- Imported DotLottie type from `@lottiefiles/dotlottie-react` re-export rather than adding `@lottiefiles/dotlottie-web` as a direct dependency (it's a transitive dep of dotlottie-react)
- All hooks (useState, useRef, useCallback, useEffect) called before the reduced-motion early return to satisfy React rules-of-hooks lint rule
- Glow wrapper uses inline CSS with hex+alpha notation (`${glowColor}33` = 20% opacity) for simplicity, since this is a one-off decorative element not governed by design tokens

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed hooks ordering for rules-of-hooks compliance**
- **Found during:** Task 1 (Component creation)
- **Issue:** Initial implementation had useCallback after early return for reduced motion, violating react-hooks/rules-of-hooks
- **Fix:** Moved useCallback before the early return so all hooks are called unconditionally
- **Files modified:** src/components/celebrations/DotLottieAnimation.tsx
- **Verification:** `pnpm lint` passes with no errors from DotLottieAnimation
- **Committed in:** 640b8c0

**2. [Rule 3 - Blocking] Fixed DotLottie type import path**
- **Found during:** Task 1 (TypeScript type checking)
- **Issue:** `import type { DotLottie } from '@lottiefiles/dotlottie-web'` failed because dotlottie-web is a transitive dependency not directly installed
- **Fix:** Changed import to `from '@lottiefiles/dotlottie-react'` which re-exports all types from dotlottie-web
- **Files modified:** src/components/celebrations/DotLottieAnimation.tsx
- **Verification:** `pnpm typecheck` passes
- **Committed in:** 640b8c0

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both auto-fixes necessary for lint/type compliance. No scope creep.

## Issues Encountered
- OneDrive webpack cache corruption caused build failures (ENOENT for pages-manifest.json and middleware-manifest.json) on first two attempts. Third build succeeded after `rm -rf .next` with sufficient delay. This is a known environment issue, not related to the DotLottie changes.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- DotLottieAnimation component ready for consumers to import from `@/components/celebrations`
- Animation .lottie files not yet sourced (public/lottie/ directory created but empty) -- consumers will gracefully skip DotLottie if files are missing
- CSP updated for WASM, no deployment blockers

## Self-Check: PASSED

All created files verified on disk. Commit 640b8c0 verified in git log.

---
*Phase: 32-celebration-system-elevation*
*Completed: 2026-02-20*
