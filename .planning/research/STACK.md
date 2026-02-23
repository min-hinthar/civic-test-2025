# Stack Research

**Domain:** Next.js 16 App Router Migration + Intelligent Study Features + Bundle Optimization
**Researched:** 2026-02-23
**Confidence:** HIGH (core migration) / MEDIUM (new features) / HIGH (bundle optimization)

## Executive Summary

This research covers stack additions and changes needed for the v4.0 milestone. The project currently runs Next.js 15.5.12 with Pages Router serving a client-side SPA via `react-router-dom` hash routing. The v4.0 migration targets Next.js 16 with full App Router file-based routing, eliminating `react-router-dom` entirely.

**Key finding:** Next.js 16 (released October 2025, latest 16.1.6) defaults to Turbopack, which does NOT support webpack plugins. The current `next.config.mjs` chains three webpack-based wrappers (`withBundleAnalyzer`, `withSerwist`, `withSentryConfig`). All three have Turbopack-compatible paths, but the migration order matters. Sentry auto-detects Turbopack. Serwist requires switching from `@serwist/next` to `@serwist/turbopack`. The old `@next/bundle-analyzer` is replaced by Next.js 16.1's built-in analyzer.

**No new runtime libraries needed for study features.** Test readiness scoring, study planning, and smart drills are computed from existing FSRS data and question metadata using pure TypeScript utility modules. Mnemonics/memory aids and deeper explanations are static content additions to the existing questions data structure. The only new dependency is `date-fns` for test date countdown calculations.

## Recommended Stack

### Core Framework Upgrades

| Technology | Current | Target | Purpose | Why |
|------------|---------|--------|---------|-----|
| Next.js | 15.5.12 | ^16.1.6 | Framework | App Router with file-based routing, Turbopack default, React Compiler support, `proxy.ts` replacing `middleware.ts`, built-in bundle analyzer |
| React | ^19.2.0 | ^19.2.0 | UI library | Already at required version. Next.js 16 uses React canary with View Transitions, `useEffectEvent`, `<Activity>` |
| TypeScript | ~5.8.2 | ~5.8.2 | Type safety | Already meets 5.1+ minimum required by Next.js 16 |
| Node.js | (runtime) | >=20.9.0 | Runtime | Next.js 16 drops Node.js 18 support. Verify Vercel deployment runtime. |

### Packages to REMOVE

| Package | Current Version | Why Remove |
|---------|----------------|------------|
| `react-router-dom` | ^7.0.2 | Replaced by Next.js App Router file-based routing. All 15 routes convert to `app/` directory structure. |
| `@next/bundle-analyzer` | ^16.1.6 (dev) | Next.js 16.1 has built-in experimental bundle analyzer for Turbopack. `@next/bundle-analyzer` only works with webpack. |
| `@serwist/next` | ^9.5.4 | Replaced by `@serwist/turbopack` for Turbopack compatibility. Same `serwist` core, different build integration. |

### Packages to ADD

| Package | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@serwist/turbopack` | ^9.5.5 | PWA service worker with Turbopack | Replaces `@serwist/next` for Turbopack builds. Same service worker API, different build-time integration. Actively maintained (updated daily). |
| `date-fns` | ^4.1.0 | Test date countdown, daily study targets | Tree-shakeable (only import `differenceInDays`, `format`, `addDays`). ~6KB gzipped for needed functions. Functional API matches project style. No mutable Date objects. |
| `babel-plugin-react-compiler` | ^1.0.0 (dev) | React Compiler | Optional but recommended. Auto-memoization eliminates manual `useMemo`/`useCallback`. Stable in Next.js 16. Increases build time but eliminates entire category of re-render bugs. |

### Packages to UPGRADE (Breaking Changes)

| Package | Current | Target | Breaking Changes |
|---------|---------|--------|-----------------|
| `@sentry/nextjs` | ^10.26.0 | ^10.39.0+ | Auto-detects Turbopack. `autoInstrumentServerFunctions`, `autoInstrumentMiddleware`, `excludeServerRoutes` are no-ops with Turbopack. Source maps use native Debug IDs (Next.js 16+). |
| `serwist` (dev) | ^9.5.4 | ^9.5.5 | Keep in sync with `@serwist/turbopack`. |

### Packages UNCHANGED (No Migration Needed)

| Package | Version | Notes |
|---------|---------|-------|
| `@supabase/supabase-js` | ^2.81.1 | Works identically in App Router. API routes become Route Handlers (`app/api/push/route.ts`). |
| `motion` (motion/react) | ^12.33.0 | Client component library, unaffected by routing change. |
| `ts-fsrs` | ^5.2.3 | Pure computation library. Readiness scoring uses existing FSRS card data (stability, difficulty, retrievability). |
| `idb-keyval` | ^6.2.2 | IndexedDB abstraction, browser-only, unaffected. |
| `tailwindcss` | ^3.4.17 | CSS framework, unaffected by router migration. |
| `@radix-ui/*` | current | Client components, unaffected. |
| `lucide-react` | ^0.475.0 | Icon library, already optimized via `optimizePackageImports`. |
| `recharts` | ^3.4.1 | Chart library for dashboard, client-only. |
| `clsx` | ^2.1.1 | Utility, no changes. |
| `react-canvas-confetti` | ^2.0.7 | Celebration animations, client-only. |
| `@lottiefiles/dotlottie-react` | ^0.18.1 | Animation library, client-only. |

## Migration-Critical Configuration Changes

### next.config.mjs to next.config.ts

Next.js 16 supports native TypeScript configs. The current webpack wrapper chain:

```javascript
// CURRENT (v15 - webpack-based)
export default withSentryConfig(analyzer(withSerwist(nextConfig)), sentryOptions);
```

Becomes:

```typescript
// TARGET (v16 - Turbopack-based)
import { withSerwist } from '@serwist/turbopack';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  reactCompiler: true, // Stable in Next.js 16
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
};

export default withSentryConfig(withSerwist(nextConfig), sentryOptions);
```

**Key changes:**
- `@next/bundle-analyzer` wrapper removed (use `next build --analyze` instead)
- `withSerwistInit` from `@serwist/next` replaced by `withSerwist` from `@serwist/turbopack`
- `withSentryConfig` wrapper preserved (auto-detects bundler)
- `reactCompiler: true` at top level (was `experimental.reactCompiler` in v15)
- Turbopack is default -- no `--turbopack` flag needed

### middleware.ts to proxy.ts

```typescript
// CURRENT: middleware.ts with named export `middleware`
export function middleware() { ... }

// TARGET: proxy.ts with named export `proxy`
export function proxy() { ... }
// Also: skipMiddlewareUrlNormalize -> skipProxyUrlNormalize
```

CSP logic stays identical. The rename is cosmetic but required for deprecation path. Note: `proxy.ts` runs on Node.js runtime (not Edge), which is actually simpler.

### API Routes to Route Handlers

Pages Router API routes (`pages/api/push/*.ts`) become App Router Route Handlers:

```
pages/api/push/subscribe.ts    -> app/api/push/subscribe/route.ts
pages/api/push/send.ts         -> app/api/push/send/route.ts
pages/api/push/srs-reminder.ts -> app/api/push/srs-reminder/route.ts
pages/api/push/weak-area-nudge.ts -> app/api/push/weak-area-nudge/route.ts
```

**Signature change:**
```typescript
// CURRENT (Pages Router)
export default async function handler(req: NextApiRequest, res: NextApiResponse) { ... }

// TARGET (App Router Route Handler)
export async function POST(request: Request) {
  // return new Response(JSON.stringify({ success: true }), { status: 200 });
  // return NextResponse.json({ success: true });
}
export async function DELETE(request: Request) { ... }
```

### Sentry Configuration Files

The existing `sentry.server.config.ts` and `sentry.edge.config.ts` at project root continue to work with App Router. Sentry's App Router integration also requires:
- `app/global-error.tsx` for React rendering error capture
- `instrumentation.ts` at project root for server-side Sentry initialization

### _document.tsx Theme Script Migration

The blocking theme script currently in `pages/_document.tsx` moves to `app/layout.tsx`:

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

CSP hash for the theme script remains the same since the script content is unchanged.

## App Router Directory Structure

The current SPA routes in `AppShell.tsx` map to file-based routes:

```
app/
  layout.tsx              -- Root layout (providers, meta, theme script, fonts)
  page.tsx                -- Landing page (/)
  global-error.tsx        -- Sentry error boundary
  not-found.tsx           -- 404 page
  providers.tsx           -- 'use client' provider tree (all 8 contexts)
  auth/
    page.tsx              -- Auth page
    forgot/page.tsx       -- Password reset
    update-password/page.tsx
  (protected)/            -- Route group with auth guard layout
    layout.tsx            -- ProtectedRoute wrapper
    home/page.tsx         -- Dashboard
    hub/
      layout.tsx          -- Hub tabs layout
      overview/page.tsx
      categories/page.tsx
      history/page.tsx
      achievements/page.tsx
    test/page.tsx
    study/page.tsx
    practice/page.tsx
    interview/page.tsx
    settings/page.tsx
  about/page.tsx
  op-ed/page.tsx
  api/
    push/
      subscribe/route.ts
      send/route.ts
      srs-reminder/route.ts
      weak-area-nudge/route.ts
```

**All page components are `'use client'`** -- this is a client-heavy SPA. Server Components are used only for the root layout, metadata, and API route handlers. This is the correct architecture for an offline-first PWA where everything must work without a server.

## New Feature Stack (No New Dependencies)

### Test Readiness Score

Pure TypeScript module using existing data:

```typescript
// src/lib/readiness/readinessScore.ts
// Inputs: FSRS card states, test history, category mastery percentages
// Output: 0-100 readiness score with breakdown
// Algorithm: Weighted composite of:
//   - Category coverage (have you seen all categories?) 25%
//   - Retention rate (FSRS retrievability across all cards) 30%
//   - Recent test performance (last 3 mock test scores) 25%
//   - Weak area depth (lowest category mastery) 20%
```

**No ML library needed.** FSRS already provides per-card retrievability (probability of recall). The readiness score is a weighted average of existing metrics.

### Test Date Countdown + Study Plan

Uses `date-fns` for date arithmetic:

```typescript
// src/lib/planner/studyPlan.ts
import { differenceInDays, addDays, format } from 'date-fns';
// Calculates: days remaining, questions per day, recommended daily sessions
// Stored: test date in localStorage (same as theme/language preference)
```

### Smart Weak-Area Drill

Pure TypeScript using existing SRS data:

```typescript
// src/lib/drill/weakAreaDrill.ts
// Reads: category mastery from SRS context, test history errors
// Generates: prioritized question queue weighted toward weak categories
// No new dependencies -- uses existing question bank + FSRS state
```

### Mnemonics / Memory Aids Content

Static content additions to existing question data structure:

```typescript
// Extend existing Question type in src/constants/questions/types.ts
interface QuestionEnrichment {
  mnemonic?: {
    en: string;      // English mnemonic
    my?: string;     // Burmese mnemonic (optional)
    type: 'acronym' | 'association' | 'rhyme' | 'visual' | 'chunking';
  };
  historicalContext?: {
    en: string;
    my?: string;
  };
  studyTip?: {
    en: string;
    my?: string;
  };
}
```

**No AI/LLM dependency.** Mnemonics are hand-crafted content stored in TypeScript constant files alongside existing question data. This keeps the app free (no API costs) and works offline.

## Bundle Optimization Strategy

### Built-in Next.js 16 Optimizations (Zero Configuration)

| Optimization | How It Works |
|-------------|-------------|
| Turbopack builds | 2-5x faster production builds than webpack |
| Route-based code splitting | Each `app/` route is automatically a separate bundle |
| Layout deduplication | Shared layouts downloaded once, not per-route |
| Incremental prefetching | Only prefetch what is not in cache |
| Tree shaking | Turbopack removes unused exports |

### Configuration-Based Optimizations

| Setting | Config | Effect |
|---------|--------|--------|
| `optimizePackageImports` | `['lucide-react', 'date-fns', 'recharts']` | Tree-shake barrel exports without full traversal |
| `reactCompiler: true` | Top-level config | Auto-memoization, fewer re-renders |
| Dynamic imports | `next/dynamic` with `ssr: false` | Lazy-load heavy client components |

### Lazy-Load Candidates (Dynamic Import)

Components that should use `next/dynamic` with `{ ssr: false }`:

| Component | Estimated Size | Why Lazy |
|-----------|---------------|----------|
| `CelebrationOverlay` | ~15KB | Only shown on achievements |
| `OnboardingTour` (react-joyride) | ~40KB | Only for first-time users |
| `InterviewPage` | ~25KB | Complex speech recognition, only one route |
| `recharts` components | ~80KB | Only on Hub/dashboard pages |
| `@lottiefiles/dotlottie-react` | ~20KB | Only during celebrations |
| `react-canvas-confetti` | ~10KB | Only during celebrations |

### Measurement

- **Development:** `next dev` with `--inspect` for profiling (new in 16.1)
- **Production:** `next build --analyze` (built-in Turbopack analyzer in 16.1+)
- **Runtime:** Web Vitals already reported to Sentry (existing integration)

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| `date-fns` for date math | `dayjs` | `date-fns` is tree-shakeable by default (import individual functions). `dayjs` requires plugin system for features like locale. `date-fns` functional API matches project's utility-function patterns. |
| `date-fns` for date math | Native `Temporal` API | Not yet widely available in browsers. Polyfills add more weight than `date-fns`. |
| Hand-crafted mnemonics | AI-generated (OpenAI API) | Project constraint: free tier only, no paid API costs. Mnemonics are finite (128 questions) so hand-crafting is feasible. Also works offline. |
| Pure TS readiness scoring | ML library (tensorflow.js, brain.js) | Massive overkill. FSRS already has the ML model built in. Readiness is a weighted average of existing metrics. Adding ML would add 100KB+ for no benefit. |
| `@serwist/turbopack` | `next-pwa` | `next-pwa` is abandoned. Serwist is the maintained successor. Already using Serwist, just switching to the Turbopack-compatible package. |
| Built-in bundle analyzer | `webpack-bundle-analyzer` | Next.js 16.1 built-in analyzer works with Turbopack. External analyzer requires `--webpack` flag. |
| `proxy.ts` (Next.js 16) | Keep `middleware.ts` | `middleware.ts` is deprecated in Next.js 16. `proxy.ts` runs on Node.js runtime (not edge), which is simpler for CSP header injection. |
| React Compiler | Manual `useMemo`/`useCallback` | Project already has React Compiler ESLint rules enforced. Enabling the compiler would eliminate the need for manual memoization and reduce the cognitive burden of those rules. However, it increases build time, so it is recommended but optional. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `next/font` for Myanmar font | Self-hosted fonts via `@fontsource` already work offline. `next/font` optimizes Google Fonts loading but the PWA needs guaranteed offline access to font files. | Keep `@fontsource/noto-sans-myanmar` |
| `server actions` for data mutations | The app is offline-first with IndexedDB as primary store. Server Actions require network. All mutations go through IndexedDB first, then sync to Supabase. | Keep existing IndexedDB + sync queue pattern |
| Cache Components / `"use cache"` | The app is a client-heavy SPA. Pages are `'use client'` because they need IndexedDB, SpeechSynthesis, and other browser APIs. Server-side caching adds complexity without benefit for an offline-first PWA. | Static generation for the shell, client-side data fetching |
| View Transitions API (React 19.2) | Tempting for page transitions, but the existing `motion/react` `PageTransition` component is battle-tested and works in all browsers. View Transitions has limited browser support (no Firefox as of Feb 2026). | Keep `motion/react` PageTransition |
| `zustand` or `jotai` for state | 8 React Context providers work. Adding a state library would require rewriting all providers for no user-visible benefit. | Keep existing Context providers |
| `@tanstack/react-query` | The app has 4 API route handlers and uses IndexedDB as primary storage. React Query's caching model conflicts with the offline-first sync queue. | Keep existing `withRetry` + `safeAsync` patterns |
| Tailwind CSS v4 | Breaking change with new config format. Current v3 config with design tokens is stable and comprehensive. Migration effort with zero user-visible benefit. | Keep Tailwind v3 |

## Stack Patterns by Variant

**If the build fails with Turbopack due to Sentry/Serwist wrapper issues:**
- Use `next build --webpack` as temporary fallback
- Sentry and Serwist wrappers both still support webpack mode
- File a GitHub issue against the offending package

**If React Compiler causes runtime issues:**
- Disable with `reactCompiler: false` in next.config.ts
- Remove `babel-plugin-react-compiler` dev dependency
- Existing manual `useMemo`/`useCallback` patterns remain functional
- The ESLint rules for React Compiler compatibility are still beneficial even without the compiler

**If Serwist Turbopack integration is unstable:**
- Use `@serwist/next` (webpack) with `next build --webpack` for production
- Turbopack for `next dev` (Serwist is disabled in dev anyway per current config)

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| next@^16.1.6 | react@^19.2.0, react-dom@^19.2.0 | Already at compatible React version |
| next@^16.1.6 | typescript@~5.8.2 | Requires TS 5.1+, already met |
| next@^16.1.6 | node@>=20.9.0 | Drops Node 18. Verify Vercel runtime. |
| @sentry/nextjs@^10.39.0 | next@^16.0.0 | Auto-detects Turbopack. Tested with Next.js 16 e2e. |
| @serwist/turbopack@^9.5.5 | next@^16.0.0 | Turbopack-native PWA integration. |
| serwist@^9.5.5 | @serwist/turbopack@^9.5.5 | Keep versions in sync. |
| babel-plugin-react-compiler@^1.0.0 | next@^16.0.0, react@^19.2.0 | Stable in Next.js 16. Optional. |
| date-fns@^4.1.0 | (standalone) | Pure functions, no framework dependency. Tree-shakeable. |
| ts-fsrs@^5.2.3 | node@>=18.0.0 | Already compatible. |
| eslint-plugin-react-hooks@^7.0.1 | react@^19.0.0 | Already compatible, includes React Compiler rules. |

## Installation

```bash
# Upgrade core framework
pnpm add next@latest react@latest react-dom@latest

# Replace @serwist/next with Turbopack version
pnpm remove @serwist/next
pnpm add @serwist/turbopack@latest

# Add new dependencies
pnpm add date-fns@latest

# Upgrade Sentry
pnpm add @sentry/nextjs@latest

# Remove replaced dev dependencies
pnpm remove @next/bundle-analyzer

# Optional: Enable React Compiler
pnpm add -D babel-plugin-react-compiler@latest

# Keep serwist dev dep in sync
pnpm add -D serwist@latest

# Upgrade types
pnpm add -D @types/react@latest @types/react-dom@latest
```

```bash
# Post-install: Run Next.js 16 codemod
pnpm dlx @next/codemod@canary upgrade latest

# This automates:
# - middleware.ts -> proxy.ts rename
# - experimental.turbopack -> turbopack config move
# - ESLint flat config migration
# - next lint -> eslint CLI migration
```

## Build Scripts Update

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "analyze": "ANALYZE=true next build --analyze"
  }
}
```

**Key changes:**
- `"lint": "next lint"` replaced by `"lint": "eslint ."` (Next.js 16 removed `next lint`)
- `"analyze"` uses built-in `--analyze` flag instead of `@next/bundle-analyzer` env var
- `"dev"` and `"build"` no longer need `--turbopack` flag (it is the default)

## Migration Risk Assessment

| Area | Risk | Mitigation |
|------|------|------------|
| Turbopack + Sentry | LOW | Sentry auto-detects bundler. Well-documented, tested with Next.js 16. |
| Turbopack + Serwist PWA | MEDIUM | Package swap (`@serwist/next` to `@serwist/turbopack`). API differences in config setup. Service worker code unchanged. |
| react-router-dom removal | HIGH | 15 routes to convert. Every navigation call (`useNavigate`, `<Link>`, `<Navigate>`) must change to Next.js equivalents (`useRouter`, `next/link`, `redirect`). ~30 components reference React Router. |
| API route migration | LOW | 4 API routes with straightforward `NextApiRequest/Response` to `Request/Response` conversion. |
| Context providers in App Router | MEDIUM | All 8 providers need `'use client'` directive and move to a `providers.tsx` wrapper imported in root layout. Provider ordering must be preserved. |
| CSP middleware to proxy | LOW | Rename file, rename export. CSP logic unchanged. |
| Theme script (FOUC prevention) | LOW | Move from `_document.tsx` to `app/layout.tsx` `<head>`. Hash unchanged. |

## Sources

- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) -- HIGH confidence, official source
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- HIGH confidence, official docs
- [Next.js 16.1 Release Blog](https://nextjs.org/blog/next-16-1) -- HIGH confidence, built-in bundle analyzer
- [Sentry Turbopack Support Blog](https://blog.sentry.io/turbopack-support-next-js-sdk/) -- HIGH confidence, official Sentry blog
- [Sentry Next.js Manual Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/) -- HIGH confidence, official docs
- [Serwist Next.js Docs](https://serwist.pages.dev/docs/next) -- HIGH confidence, official docs
- [@serwist/turbopack npm](https://www.npmjs.com/package/@serwist/turbopack) -- HIGH confidence, v9.5.5
- [Next.js App Router Migration Guide](https://nextjs.org/docs/app/guides/migrating/app-router-migration) -- HIGH confidence, official docs
- [FSRS Algorithm Wiki](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm) -- HIGH confidence, official FSRS docs
- [ts-fsrs npm](https://www.npmjs.com/package/ts-fsrs) -- HIGH confidence, v5.2.3
- [date-fns vs dayjs comparison](https://www.dhiwise.com/post/date-fns-vs-dayjs-the-battle-of-javascript-date-libraries) -- MEDIUM confidence
- [Next.js Bundle Optimization Guide](https://nextjs.org/docs/app/guides/package-bundling) -- HIGH confidence, official docs

---
*Stack research for: Civic Test Prep 2025 v4.0 -- Next-Gen Architecture*
*Researched: 2026-02-23*
