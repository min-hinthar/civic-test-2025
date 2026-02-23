# Phase 39: Next.js 16 Upgrade and Tooling - Research

**Researched:** 2026-02-23
**Domain:** Next.js framework upgrade, build tooling, error monitoring, PWA service worker
**Confidence:** HIGH

## Summary

Next.js 16 is a significant major release with Turbopack as the default bundler, middleware-to-proxy rename, removal of `next lint`, async request APIs enforced, and React 19.2 bundled. The upgrade from 15.5.12 to 16.x is well-documented with official codemods. The key complexity for this project lies in the dual-plugin build chain (`@sentry/nextjs` + `@serwist/next`) that both use webpack plugins, meaning the production build **must** use `--webpack` flag since Turbopack does not support webpack plugins. Sentry SDK v10.x has native Turbopack support via OpenTelemetry hooks (not webpack plugins), but `@serwist/next` still requires webpack for its injection mechanism. The `next lint` removal requires updating the lint script to call ESLint directly.

**Primary recommendation:** Pin `next@16.1.6` (latest stable), use `--webpack` for production builds, Turbopack for dev (without Serwist), and keep the `withSentryConfig(withSerwist(nextConfig))` wrapping pattern since both libraries support it. Rename `middleware.ts` to `proxy.ts` with function rename. Update `package.json` lint script from `next lint` to `eslint .` since `next lint` is removed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Target Turbopack everywhere (dev and prod) as primary bundler
- Auto-fallback to webpack if any plugin (Serwist, Sentry) is incompatible with Turbopack
- Add separate npm scripts: `npm run dev` (Turbopack), `npm run dev:webpack` (fallback)
- Set up dual CI builds (Turbopack + webpack) to catch regressions
- Migrate to Next.js 16's new config API if @serwist and @sentry support it; fall back to legacy wrapping pattern if not
- Pin exact Next.js version (e.g., `"next": "16.0.0"`) — no caret ranges
- Keep Pages Router working in this phase — `pages/[[...slug]].tsx` stays as SPA shell
- Follow Next.js 16 tsconfig recommendations (update module resolution, target, etc.)
- Upgrade ALL dependencies to latest, not just broken ones — take the opportunity for a clean slate
- Separate commit for non-Next dependency upgrades first, verify tests pass, THEN upgrade Next.js — isolates breakage
- Delete and regenerate pnpm-lock.yaml (`rm pnpm-lock.yaml && pnpm install`) — clean lockfile
- Use pnpm overrides with TODO comments if transitive deps haven't updated for Next.js 16
- Priority order for Next.js-coupled deps: Sentry > Serwist > next-themes
- If @serwist/next doesn't support Next.js 16, drop the wrapper and use serwist directly with custom plugin
- Upgrade React to latest version alongside Next.js 16
- Claude evaluates whether any deps are redundant and can be dropped (e.g., next-themes if ThemeContext covers it)
- Full App Router integration: create `instrumentation.ts` and `global-error.tsx`
- Delete old Pages Router Sentry files (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`) — clean break
- Upgrade @sentry/nextjs to latest SDK version
- Keep existing `errorSanitizer.ts` and PII scrubbing unchanged
- Reconfigure source maps upload for the new build chain (Turbopack/webpack dual)
- `global-error.tsx`: functional only — reports to Sentry, shows reset button. No design polish yet.
- Create dev-only test page with throw button to verify Sentry captures end-to-end
- Add Next.js 16 noise filters (hydration mismatches, chunk load failures, etc.) to beforeSend
- All Vitest tests must pass — fix any tests broken by Next.js 16 API changes (no .skip() or .todo())
- Manual smoke test with formal feature checklist
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MIGR-01 | App builds and runs on Next.js 16 with Turbopack/webpack compatibility | Next.js 16.1.6 upgrade path documented; `--webpack` flag for prod builds; Turbopack for dev; both Sentry and Serwist compatible with webpack wrapping pattern |
| MIGR-02 | `middleware.ts` renamed to `proxy.ts` with updated export | Official codemod `middleware-to-proxy` available; function export renamed from `middleware` to `proxy`; `nodejs` runtime only (edge not supported in proxy) |
| MIGR-03 | Sentry reconfigured for App Router (`instrumentation.ts`, `global-error.tsx`) | Project already has `instrumentation.ts` and `instrumentation-client.ts`; needs `app/global-error.tsx` for App Router error capture; existing Sentry config files can stay since we keep Pages Router this phase |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 (pinned exact) | React framework | Latest stable; Turbopack default; official upgrade path from 15.x |
| react | ^19.2.0 | UI library | Bundled with Next.js 16; includes View Transitions, useEffectEvent, Activity |
| react-dom | ^19.2.0 | React DOM renderer | Must match React version |
| @sentry/nextjs | ^10.39.0 | Error monitoring | Latest; native Turbopack support via OpenTelemetry; webpack plugin for --webpack builds |
| @serwist/next | ^9.5.4 | PWA service worker | Latest 9.x; works with Next.js 16 via webpack; `withSerwistInit` pattern unchanged |
| serwist | ^9.5.4 | SW runtime | Must match @serwist/next version |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @next/codemod | canary | Automated migration | Run once: `npx @next/codemod@canary upgrade latest` for middleware-to-proxy and lint migration |
| @types/react | ^19.x | React types | Must match React 19.2 |
| @types/react-dom | ^19.x | React DOM types | Must match React DOM 19.2 |
| typescript | ~5.8.x | Type checking | Next.js 16 requires TypeScript 5.1+; current 5.8.2 is fine |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @serwist/next (webpack) | @serwist/turbopack | Uses route handler instead of webpack plugin; more complex setup; would enable Turbopack prod builds but adds unnecessary complexity since Sentry also needs webpack |
| Serwist configurator mode | @serwist/next classic mode | Configurator is bundler-agnostic but requires `concurrently` and different build scripts; overkill when --webpack works fine |
| next.config.mjs (current) | next.config.ts | TypeScript config gives type safety but requires experimental flag; keep .mjs for stability this phase |

**Installation:**
```bash
pnpm add next@16.1.6 react@latest react-dom@latest @sentry/nextjs@latest
pnpm add -D @types/react@latest @types/react-dom@latest
```

## Architecture Patterns

### Build Configuration Pattern
```
next.config.mjs
├── withSentryConfig()        ← outermost wrapper (source maps + instrumentation)
│   └── withBundleAnalyzer()  ← conditional on ANALYZE=true
│       └── withSerwist()     ← service worker injection
│           └── nextConfig    ← base Next.js config
```

This wrapping chain remains unchanged from v15. The `withSentryConfig` adds a webpack plugin for source map upload. The `@serwist/next` adds a webpack plugin for SW compilation. Both require webpack, so `next build --webpack` is mandatory.

### Middleware → Proxy Rename Pattern
**What:** Rename `middleware.ts` → `proxy.ts`, export function `proxy()` instead of `middleware()`
**When to use:** Required by Next.js 16; `middleware` is deprecated
**Example:**
```typescript
// proxy.ts (was middleware.ts)
import { NextResponse } from 'next/server';

// Function renamed from middleware to proxy
export function proxy() {
  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', cspHeader);
  return response;
}

// Config export stays the same structure
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|offline.html).*)'],
};
```

### Sentry App Router Error Capture Pattern
**What:** `app/global-error.tsx` catches rendering errors in the App Router tree
**When to use:** Required when App Router layout exists (which it will in Phase 40, but we create the file now)
**Example:**
```typescript
// Source: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  );
}
```

### Package.json Scripts Pattern (Next.js 16)
**What:** Updated scripts reflecting Turbopack default and `next lint` removal
**Example:**
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:webpack": "next dev --webpack",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

### Anti-Patterns to Avoid
- **Running `next build` without `--webpack` when using Serwist/Sentry webpack plugins:** Build will fail because Turbopack ignores webpack config. Always use `--webpack` for production.
- **Keeping `next lint` in scripts:** Removed in Next.js 16. Replace with direct `eslint .` call.
- **Using edge runtime in proxy.ts:** Next.js 16 proxy only supports nodejs runtime. The current middleware uses default runtime (nodejs on Vercel), so this is fine.
- **Deleting sentry.server.config.ts and sentry.edge.config.ts prematurely:** The `instrumentation.ts` file imports these. Keep them; they are the correct pattern. The CONTEXT says "delete old Pages Router Sentry files" but `instrumentation.ts` (already present) dynamically imports these config files. The actual file to note is that `instrumentation-client.ts` already exists and replaces the old `sentry.client.config.ts` naming convention.
- **Converting next.config.mjs to next.config.ts in this phase:** Adds risk for zero benefit during an already complex upgrade. Do it in a later phase if desired.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Middleware-to-proxy migration | Manual file rename + find-replace | `npx @next/codemod@canary middleware-to-proxy .` | Codemod handles file rename, function rename, and config flag renames atomically |
| ESLint migration from next lint | Manual eslint.config.mjs rewrite | `npx @next/codemod@canary next-lint-to-eslint-cli .` | Codemod updates scripts and preserves existing config |
| Service worker compilation | Custom esbuild/rollup SW build | `@serwist/next` withSerwistInit | Handles precache manifest injection, SW compilation, and Next.js integration |
| Source map upload to Sentry | Manual sentry-cli upload scripts | `withSentryConfig` in next.config.mjs | Handles client/server map separation, deletion after upload, Debug ID injection |
| Turbopack config migration | Manual experimental.turbopack → turbopack move | Next.js 16 codemod handles it | Though this project doesn't have turbopack config yet |

**Key insight:** The Next.js 16 upgrade has official codemods for every breaking change. Use them before manual fixes.

## Common Pitfalls

### Pitfall 1: Build Fails Silently Due to Webpack Config Detection
**What goes wrong:** `next build` (Turbopack by default) detects that `withSentryConfig` or `withSerwist` add webpack configuration and fails.
**Why it happens:** Next.js 16 prevents misconfiguration by failing if webpack config exists but Turbopack is the bundler.
**How to avoid:** Always use `next build --webpack` in package.json scripts when wrapping with Sentry/Serwist.
**Warning signs:** Build error mentioning "webpack configuration was found" in build output.

### Pitfall 2: `next lint` Script Breaks After Upgrade
**What goes wrong:** `npm run lint` fails because `next lint` command no longer exists in Next.js 16.
**Why it happens:** Next.js 16 removed the `next lint` wrapper. The `eslint` config option in next.config is also removed.
**How to avoid:** Update `package.json` script from `"lint": "next lint"` to `"lint": "eslint ."`. The project already uses flat config (`eslint.config.mjs`), so ESLint CLI should work directly.
**Warning signs:** "command not found: next lint" or "unknown command lint" errors.

### Pitfall 3: Proxy Runtime Confusion
**What goes wrong:** Setting `export const config = { runtime: 'edge' }` in proxy.ts causes failure.
**Why it happens:** Next.js 16 proxy only supports nodejs runtime. Edge runtime is NOT supported in proxy files.
**How to avoid:** Don't set runtime config in proxy.ts. The current middleware.ts doesn't set a runtime (defaults to nodejs on Vercel), so no change needed.
**Warning signs:** Runtime error about edge not being supported in proxy.

### Pitfall 4: Sentry Server/Edge Config Deletion Confusion
**What goes wrong:** Deleting `sentry.server.config.ts` and `sentry.edge.config.ts` breaks server-side error reporting.
**Why it happens:** The existing `instrumentation.ts` dynamically imports these files. They are NOT "old Pages Router files" — they are the correct pattern per Sentry docs.
**How to avoid:** Keep `sentry.server.config.ts` and `sentry.edge.config.ts`. They work with both Pages Router and App Router. The file that was renamed is the client config: `sentry.client.config.ts` → `instrumentation-client.ts` (already done in this project).
**Warning signs:** Server-side Sentry events stop appearing in dashboard.

### Pitfall 5: OneDrive Webpack Cache Corruption During Upgrade
**What goes wrong:** Build fails with EPERM errors on `.next/cache/webpack/*.pack` files.
**Why it happens:** OneDrive file sync locks webpack cache files during rename operations.
**How to avoid:** Always `rm -rf .next` before major builds. The new `.next/dev` vs `.next` separation in Next.js 16 may help but doesn't eliminate the risk.
**Warning signs:** EPERM errors, missing `.nft.json` files, `build-manifest.json` errors.

### Pitfall 6: pnpm Peer Dependency Resolution Failures
**What goes wrong:** `pnpm install` fails with peer dependency conflicts after upgrading Next.js.
**Why it happens:** Transitive dependencies may not have updated their peer dependency ranges for Next.js 16.
**How to avoid:** Use `pnpm.overrides` in package.json with TODO comments for any packages that haven't updated. Delete `pnpm-lock.yaml` before regenerating.
**Warning signs:** "WARN  unmet peer" or "ERR_PNPM_PEER_DEP_ISSUES" in pnpm output.

### Pitfall 7: Async Request APIs Breaking Server Components
**What goes wrong:** Build errors about synchronous access to cookies(), headers(), params, searchParams.
**Why it happens:** Next.js 16 fully removes sync access to these APIs (was temporary compat in 15).
**How to avoid:** This project uses Pages Router exclusively (no App Router server components yet), so this is NOT an issue for Phase 39. Will matter in Phase 40-41.
**Warning signs:** TypeScript errors about `Promise<>` types on params/searchParams.

### Pitfall 8: ESLint Config Incompatibility
**What goes wrong:** `eslint .` fails after migration because `@next/eslint-plugin-next` expects new flat config patterns.
**Why it happens:** `@next/eslint-plugin-next` in Next.js 16 defaults to ESLint Flat Config format.
**How to avoid:** The project already uses `eslint.config.mjs` (flat config), so this should work. Verify the `@next/eslint-plugin-next` import pattern matches the new format after upgrade.
**Warning signs:** ESLint "invalid configuration" errors.

## Code Examples

Verified patterns from official sources:

### Next.js 16 next.config.mjs with Sentry + Serwist (webpack build)
```javascript
// Source: Next.js 16 upgrade guide + Sentry manual setup + Serwist docs
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import withSerwistInit from '@serwist/next';

const analyzer = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

const withSerwist = withSerwistInit({
  swSrc: 'src/lib/pwa/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  additionalPrecacheEntries: [{ url: '/offline.html', revision: '1' }],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // optimizePackageImports is no longer experimental in Next.js 16
  // but still works in experimental for backward compat
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

export default withSentryConfig(analyzer(withSerwist(nextConfig)), {
  org: 'mandalay-morning-star',
  project: 'civic-test-prep-2025',
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
```

### proxy.ts (renamed from middleware.ts)
```typescript
// Source: https://nextjs.org/docs/app/guides/upgrading/version-16
import { NextResponse } from 'next/server';

const THEME_SCRIPT_HASH = "'sha256-NKQrmMd/nbWq2Iv4I0YgtUOgn8XHk35ntdeRQ/aIx5A='";

export function proxy() {
  const isDev = process.env.NODE_ENV === 'development';
  const scriptSrc = isDev
    ? `'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://tiptopjar.com`
    : `'self' 'wasm-unsafe-eval' ${THEME_SCRIPT_HASH} https://accounts.google.com https://tiptopjar.com`;

  // ... CSP header construction unchanged ...

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|offline.html).*)',
  ],
};
```

### app/global-error.tsx (Sentry App Router error capture)
```typescript
// Source: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  );
}
```

### Sentry Noise Filters for Next.js 16
```typescript
// Add to beforeSendHandler in src/lib/sentry.ts
// Source: Community patterns for Next.js error filtering
const errorValue = event.exception?.values?.[0]?.value ?? '';

// Next.js 16 hydration mismatch noise
if (/hydration|Minified React error #(418|419|422|423|425)/i.test(errorValue)) {
  event.fingerprint = ['hydration-mismatch'];
}

// Chunk load failures (common with Turbopack cache invalidation)
if (/ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module/i.test(errorValue)) {
  event.fingerprint = ['chunk-load-failure'];
}

// Cancel errors from navigation during async operations
if (/AbortError|The operation was aborted|signal is aborted/i.test(errorValue)) {
  return null; // Drop these entirely
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next lint` wrapper | Direct `eslint .` CLI | Next.js 16 | Must update lint script; `next build` no longer runs linting |
| `middleware.ts` with `middleware()` export | `proxy.ts` with `proxy()` export | Next.js 16 | File rename + function rename; nodejs runtime only |
| `experimental.turbopack` config | Top-level `turbopack` config | Next.js 16 | Config promoted from experimental |
| Turbopack opt-in (`--turbopack` flag) | Turbopack default (opt-out with `--webpack`) | Next.js 16 | Dev and build both use Turbopack by default |
| `sentry.client.config.ts` | `instrumentation-client.ts` | Sentry v8+ | Already migrated in this project |
| `experimental_ppr` route config | `cacheComponents` config option | Next.js 16 | Not applicable to this project |
| Sync access to cookies/headers/params | Async-only access | Next.js 16 | Not applicable until Phase 40-41 (App Router) |

**Deprecated/outdated:**
- `next lint`: Removed entirely. Use ESLint CLI directly.
- `middleware.ts` filename: Deprecated, renamed to `proxy.ts`. Still works but will be removed.
- `next/legacy/image`: Deprecated. Use `next/image`.
- `images.domains`: Deprecated. Use `images.remotePatterns`.
- `serverRuntimeConfig` / `publicRuntimeConfig`: Removed. Use env vars.
- AMP support: Removed entirely.
- `experimental.dynamicIO`: Removed. Replaced by `cacheComponents`.

## Open Questions

1. **Sentry server/edge config files: keep or restructure?**
   - What we know: The CONTEXT says "delete old Pages Router Sentry files" but `instrumentation.ts` imports `sentry.server.config.ts` and `sentry.edge.config.ts`. These files ARE the current recommended pattern per Sentry docs.
   - What's unclear: Whether the user wants to restructure the Sentry init into `instrumentation.ts` inline rather than separate files.
   - Recommendation: **Keep the current pattern.** The `instrumentation.ts` + separate config files pattern is exactly what Sentry recommends. Clarify with user if needed, but the "old Pages Router files" likely refers to the `sentry.client.config.ts` which was already renamed to `instrumentation-client.ts`.

2. **next-themes dependency: keep or drop?**
   - What we know: The project has a custom `ThemeContext` that handles theme persistence and switching. `next-themes` is NOT in the current `package.json` dependencies.
   - Recommendation: **No action needed.** The dependency doesn't exist in the project. The CONTEXT mentioned Claude evaluating this, but it's already absent.

3. **Turbopack for dev with Serwist disabled**
   - What we know: Serwist is disabled in dev (`disable: process.env.NODE_ENV === 'development'`), and Sentry works with Turbopack natively. So `next dev` (Turbopack) should work even with the webpack plugin wrappers, because disabled plugins shouldn't inject webpack config.
   - What's unclear: Whether `withSerwistInit` still injects webpack config even when `disable: true`.
   - Recommendation: Test during implementation. If `next dev` fails due to webpack config detection, use `next dev --webpack` as the default dev script. The CONTEXT already anticipates this with `dev:webpack` script.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4 + jsdom + @testing-library/react |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test:run` |
| Full suite command | `pnpm test:run` |
| Estimated runtime | ~15-30 seconds |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MIGR-01 | App builds on Next.js 16 | smoke | `pnpm build` (via build verification) | N/A — build command |
| MIGR-01 | All existing tests pass | unit | `pnpm test:run` | Yes — existing test suite |
| MIGR-02 | proxy.ts exists and exports proxy() | smoke | `pnpm typecheck` | N/A — typecheck |
| MIGR-03 | Sentry captures errors | manual | Manual: trigger error, check Sentry dashboard | N/A — requires live Sentry |
| MIGR-03 | global-error.tsx renders | unit | `pnpm test:run` | No — Wave 0 gap (optional) |

### Nyquist Sampling Rate
- **Minimum sample interval:** After every committed task → run: `pnpm test:run && pnpm typecheck`
- **Full suite trigger:** Before final task: `pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`
- **Phase-complete gate:** Full build verification suite green before `/gsd:verify-work` runs
- **Estimated feedback latency per task:** ~30 seconds (test:run + typecheck)

### Wave 0 Gaps
None critical — existing test infrastructure covers all phase requirements. The build itself (`pnpm build`) is the primary verification for MIGR-01. The typecheck covers MIGR-02 (proxy.ts types). MIGR-03 (Sentry) is best verified manually via dev-only test page.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) — Full breaking changes list, codemods, migration steps (last updated 2026-02-20)
- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16) — Release announcement with feature overview
- [Sentry Next.js Manual Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/) — instrumentation.ts, global-error.tsx, withSentryConfig patterns
- [Sentry Build Configuration](https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/build/) — Turbopack vs webpack source map behavior
- [Sentry Turbopack Support Blog](https://blog.sentry.io/turbopack-support-next-js-sdk/) — How Sentry works with Turbopack natively via OpenTelemetry
- [Serwist Next.js Getting Started](https://serwist.pages.dev/docs/next/getting-started) — withSerwistInit setup pattern
- [Serwist Next.js Config](https://serwist.pages.dev/docs/next/config) — Configurator vs classic mode, SerwistProvider
- Context7 `/vercel/next.js/v16.1.6` — middleware-to-proxy codemod details, Turbopack config promotion

### Secondary (MEDIUM confidence)
- [Serwist Turbopack Guide](https://serwist.pages.dev/docs/next/turbo) — Alternative @serwist/turbopack approach (not recommended for this project)
- [@serwist/next npm](https://www.npmjs.com/package/@serwist/next) — Version 9.5.4 latest, peer dependency info
- [@sentry/nextjs npm](https://www.npmjs.com/package/@sentry/nextjs) — Version 10.39.0 latest

### Tertiary (LOW confidence)
- Community reports on Turbopack + webpack plugin coexistence during `next dev` — needs validation during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified via npm, official docs, and Context7
- Architecture: HIGH — wrapping pattern unchanged; proxy rename is well-documented with codemod
- Pitfalls: HIGH — each pitfall sourced from official upgrade guide or project-specific known issues
- Sentry integration: HIGH — existing project already uses modern pattern (instrumentation.ts + instrumentation-client.ts)
- Serwist/Turbopack interaction: MEDIUM — Serwist works with webpack confirmed; unclear if `disable: true` prevents webpack config injection during Turbopack dev

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (30 days — stable major release, unlikely to change rapidly)
