# Technology Stack

**Analysis Date:** 2026-03-19

## Languages

**Primary:**
- TypeScript 5.9.3 (strict mode) - all source code in `src/`, `app/`, API routes
- SQL - Supabase schema in `supabase/schema.sql`

**Secondary:**
- CSS - global styles and design tokens in `src/styles/`
- JavaScript - config files (`next.config.mjs`, `postcss.config.js`, `tailwind.config.js`)

## Runtime

**Environment:**
- Node.js 22.x (`@types/node: ^22.10.10`)

**Package Manager:**
- pnpm 10.28.0 (declared via `"packageManager"` field in `package.json`)
- Lockfile: `pnpm-lock.yaml` present and committed

## Frameworks

**Core:**
- Next.js 16.1.7 - App Router with file-based routing. Migrated from react-router-dom hash routing in v4.0.
  - Config: `next.config.mjs`
  - Build: webpack (forced via `next build --webpack`; Turbopack not used in production)
  - Instrumentation: `instrumentation.ts` + `instrumentation-client.ts` for Sentry
- React 19.2.4 - UI, strict mode enabled (`reactStrictMode: true`)
- React DOM 19.2.4

**Styling:**
- Tailwind CSS 3.4.17 - utility classes, config `tailwind.config.js`
  - Custom token system: `src/styles/tokens.css` → consumed by Tailwind via CSS custom properties
  - Plugin: `tailwindcss-animate ^1.0.7` for keyframe utilities
  - PostCSS: `postcss.config.js` (tailwindcss + autoprefixer)
  - CSS design tokens cover: colors (semantic + primitive palette), border-radius, shadows, typography scale, animation durations, safe-area insets, status colors, category colors

**Animation:**
- motion/react 12.34.3 (`motion` package) - page transitions, micro-interactions, spring animations
- `react-canvas-confetti ^2.0.7` - celebration confetti
- `@lottiefiles/dotlottie-react ^0.18.2` - Lottie animations (assets not yet sourced)
- `react-countdown-circle-timer ^3.2.1` - timer UI in test mode
- `react-countup ^6.5.3` - animated score counters

**Testing:**
- Vitest 4.0.18 - test runner, config `vitest.config.ts`
- @testing-library/react 16.3.2 - component testing
- @testing-library/jest-dom 6.9.1 - DOM matchers
- @testing-library/dom 10.4.1
- jsdom 28.1.0 - browser environment simulation
- vitest-axe 0.1.0 - accessibility assertion helpers
- @vitest/coverage-v8 4.0.18 - V8 coverage provider

**Build/Dev:**
- @next/bundle-analyzer 16.1.6 - bundle analysis (`ANALYZE=true` env var)
- vite-tsconfig-paths 6.1.1 - TypeScript path aliases in Vitest
- @vitejs/plugin-react 5.1.4 - React plugin for Vite (Vitest only)

## Key Dependencies

**Critical:**
- `@supabase/supabase-js ^2.97.0` - Auth, Postgres, RLS; client at `src/lib/supabaseClient.ts`
- `@sentry/nextjs ^10.39.0` - Error tracking, browser replay, performance tracing
- `@serwist/next ^9.5.6` + `serwist ^9.5.6` - Service worker / PWA; SW source `src/lib/pwa/sw.ts`, output `public/sw.js`
- `idb-keyval ^6.2.2` - IndexedDB wrapper for offline storage; 4 named stores (questions, sync-queue, srs, srs-sync)
- `ts-fsrs ^5.2.3` - FSRS spaced repetition algorithm; wrapped in `src/lib/srs/fsrsEngine.ts`
- `web-push ^3.6.7` - Server-side VAPID Web Push (used in `app/api/push/` route handlers)

**UI:**
- `@radix-ui/react-dialog ^1.1.15` - accessible dialog/modal primitives
- `@radix-ui/react-progress ^1.1.8` - progress bar primitives
- `lucide-react ^0.575.0` - icon library (tree-shaken via `optimizePackageImports`)
- `recharts ^3.7.0` - progress charts (dynamic import, tree-shaken via `optimizePackageImports`)
- `react-joyride 3.0.0-7` - onboarding tour (pinned at pre-release)
- `clsx ^2.1.1` - className utility
- `@fontsource/noto-sans-myanmar ^5.2.7` - self-hosted Myanmar font (weights: 400, 500, 700)

**Infrastructure:**
- `async-mutex ^0.5.0` - mutex for concurrent async operations
- `autoprefixer ^10.4.24` - CSS vendor prefixes

## Configuration

**TypeScript:**
- `tsconfig.json` - main config, strict mode, `moduleResolution: bundler`, path alias `@/*` → `src/*`, target ES2017
- `tsconfig.sw.json` - service worker config extending main, lib: `ES2020 + WebWorker`, includes only `src/lib/pwa/sw.ts`
- `tsconfig.tsbuildinfo` - incremental build cache (committed)

**Build:**
- `next.config.mjs` - wraps `withSentryConfig(withBundleAnalyzer(withSerwist(nextConfig)))`
  - Serwist: SW source `src/lib/pwa/sw.ts`, disabled in development
  - Sentry org: `mandalay-morning-star`, project: `civic-test-prep-2025`
  - Redirects: `/dashboard→/home`, `/progress→/hub/overview`, `/history→/hub/history`, `/social→/hub/achievements`
  - `optimizePackageImports`: lucide-react, recharts

**Environment:**
- No `.env` file committed; variables injected at build time
- `proxy.ts` implements Next.js middleware for nonce-based CSP and security headers

**Linting / Formatting:**
- ESLint 9.17.0 with flat config (`eslint.config.mjs`)
  - Plugins: `@typescript-eslint`, `react-hooks`, `@next/next`, `jsx-a11y`, `eslint-config-prettier`
  - Key rules: `@typescript-eslint/no-explicit-any: error`, `no-console: warn`
- Prettier 3.8.1 (`.prettierrc`): `singleQuote: true`, `semi: true`, `printWidth: 100`, `trailingComma: es5`
- Stylelint 17.3.0 (`.stylelintrc.json`): extends `stylelint-config-standard`; enforces no hex colors, no named colors; ignores `tokens.css`
- Husky 9.1.7 (`husky prepare` script) - pre-commit hook runs `lint-staged`
- lint-staged 16.2.7 (`.lintstagedrc.json`): TS/TSX → eslint --fix + prettier; JS/MJS/JSON/CSS → prettier

## Platform Requirements

**Development:**
- Node.js 22.x, pnpm 10.28.0
- `pnpm dev` starts Next.js dev server (Turbopack default; `pnpm dev:webpack` for webpack)
- Service worker disabled in development (`disable: process.env.NODE_ENV === 'development'`)

**Production:**
- Next.js standalone/server deployment (Vercel or compatible Node.js host)
- Webpack build: `pnpm build` (forced `--webpack` flag)
- CSP via middleware (`proxy.ts`); nonce per request, passed to layout via `x-nonce` header

## Stack Evolution Across Milestones

| Milestone | Key Stack Changes |
|-----------|------------------|
| v1.0 (2026-02-08) | Initial: React + react-router-dom hash routing, Vite build, Supabase, Serwist PWA, ts-fsrs |
| v2.0 (2026-02-13) | Two-tier design token system (tokens.css → Tailwind), motion/react animations, CSP hardening |
| v2.1 (2026-02-19) | 256 pre-generated Burmese MP3 audio files, ttsCore module, Noto Sans Myanmar, idb-keyval session persistence |
| v3.0 (2026-02-22) | DotLottie animations, react-canvas-confetti, Sentry optimization, withRetry/safeAsync utilities |
| v4.0 (2026-03-02) | **Next.js 16 App Router migration** (removed react-router-dom), Next.js 16 file-based routing, clean URLs, nonce-based CSP, recharts + confetti lazy loaded, async-mutex, @next/bundle-analyzer |

---

*Stack analysis: 2026-03-19*
