# Project Research Summary

**Project:** Civic Test Prep 2025 v4.0 — Next-Gen Architecture
**Domain:** Bilingual PWA migration + intelligent study features + content enrichment
**Researched:** 2026-02-23
**Confidence:** HIGH (migration) / HIGH (features) / HIGH (architecture) / HIGH (pitfalls)

## Executive Summary

The v4.0 milestone is fundamentally a migration with features on top. The project is a mature, 70K LOC offline-first PWA that currently runs on Next.js 15 Pages Router with react-router-dom handling all client-side routing inside a single catch-all `pages/[[...slug]].tsx` shell. The migration target is Next.js 16 App Router with file-based routing, eliminating react-router-dom entirely. This migration is the highest-risk work in v4.0 — it touches every page component (~40-60 files) and replaces the entire routing and navigation layer — but it delivers clean URLs, nonce-based CSP, automatic per-route code splitting, and a proper foundation for future server-side features. Critically, this migration does NOT mean converting to server-rendered pages: every page component stays `'use client'` because the app requires IndexedDB, SpeechSynthesis, and other browser-only APIs.

On top of the migration, v4.0 adds intelligent study features using infrastructure that already exists in the codebase. The readiness scoring system (`computeReadiness`), category mastery calculations (`calculateCategoryMastery`), weak area detection (`detectWeakAreas`), and FSRS spaced repetition state are all already implemented — they are just not surfaced to users. The highest-value work is promoting internal logic to first-class UI: a visible readiness ring, a dedicated weak-area drill entry point, and a test date countdown with daily targets. No new state management, no new ML libraries, no new API costs — these features are pure TypeScript utility modules consuming existing data.

The critical risks are: (1) Turbopack default in Next.js 16 breaks the webpack plugin chain immediately on upgrade — use `next build --webpack` from day one; (2) mixing Pages Router and App Router routes during incremental migration causes hard navigations that lose all React state and re-initialize the 12-deep provider hierarchy — migrate all routes in one phase, not incrementally; (3) the readiness score algorithm must penalize unstudied categories heavily or it will give false confidence to users who may fail their USCIS interview; (4) content enrichment (mnemonics) must be English-first since Burmese mnemonics require native speaker input and language-specific mnemonic devices that do not transfer across scripts.

## Key Findings

### Recommended Stack

The stack changes for v4.0 are minimal on the dependencies side but significant on the configuration side. The core upgrade is Next.js 15.5.12 to Next.js ^16.1.6, which forces three related changes: `@serwist/next` must be replaced by `@serwist/turbopack` (or a webpack flag used as fallback), `@next/bundle-analyzer` is removed in favor of the built-in `next build --analyze`, and `middleware.ts` must be renamed to `proxy.ts` with the export renamed from `middleware` to `proxy`. The only new runtime dependency is `date-fns@^4.1.0` for test date countdown arithmetic. React, TypeScript, and all other dependencies are unchanged.

**Core technologies:**
- `next@^16.1.6`: App Router with file-based routing, Turbopack default, built-in bundle analyzer — official upgrade path from current 15.5.12
- `@serwist/turbopack@^9.5.5`: Turbopack-compatible PWA service worker — replaces `@serwist/next`; same service worker API, different build integration; use `--webpack` flag as fallback if Serwist Turbopack is unstable
- `@sentry/nextjs@^10.39.0+`: Auto-detects Turbopack, requires new `instrumentation.ts` and `app/global-error.tsx` for App Router
- `date-fns@^4.1.0`: Tree-shakeable date arithmetic for test date countdown (~6KB gzipped for needed functions only)
- `react-router-dom`: REMOVED — replaced by Next.js file-based routing and `next/navigation` hooks

**What stays unchanged:** `@supabase/supabase-js`, `motion/react`, `ts-fsrs`, `idb-keyval`, `tailwindcss`, all `@radix-ui/*`, `recharts`, `lucide-react`, `react-canvas-confetti`, `@lottiefiles/dotlottie-react`. The service worker logic, IndexedDB stores, Supabase auth, and all context providers retain the same logic — only their housing changes.

### Expected Features

The feature research revealed that the existing codebase has substantial study intelligence that is invisible to users. The v4.0 feature work is primarily about surfacing existing logic rather than building new intelligence from scratch.

**Must have (table stakes):**
- **Test readiness score as a visible UI element** — the `computeReadiness` function already exists internally; users need an answer to "Am I ready?" with a radial ring (color-coded: red/amber/green/gold) and per-dimension breakdown (accuracy, coverage, consistency, test performance)
- **Dedicated weak-area drill mode** — `getWeakQuestions()` and `detectWeakAreas()` already exist; users need an explicit "Drill Weak Areas" entry point, not just the implicit 70/30 selection in practice mode
- **Test date countdown with daily targets** — users with a scheduled USCIS interview date need a countdown and a simple "Today: review X SRS cards + study Y new questions" card on the dashboard

**Should have (differentiators):**
- **Mnemonics expanded to all 128 questions** — currently 17/128 have mnemonics; this is the single most effective memorization tool for arbitrary factual recall; the data structure already supports `mnemonic_en`/`mnemonic_my` fields
- **Category study tips** — 7 authored introduction objects (one per USCIS category) with study strategy, common pitfalls, and estimated study time; shown as dismissible cards at the top of category practice
- **"See Also" related questions** — all 128 questions already have `relatedQuestionIds` populated; rendering these as clickable chips is a UI-only change

**Defer to later milestone:**
- AI-generated study plans (API cost, offline incompatibility, risk of hallucinated advice for a consequential real-world test)
- Calendar-based scheduling UI (over-engineering for a 128-question single-subject test)
- Predictive pass probability (misleading without validated psychometric models)
- Video content (storage, bandwidth, production cost)
- User-generated mnemonics (moderation burden, quality risk for a bilingual audience)

**Content enrichment (high effort, high value, can parallel feature phases):**
- Fun facts: 25/128 populated, target 128/128
- Common mistakes: 28/128 populated, target 128/128
- Citations: 48/128 populated, target 128/128

### Architecture Approach

The App Router migration preserves the fundamental architecture: a client-side SPA where Next.js serves a shell, all pages are Client Components, IndexedDB is the primary data store, and Supabase provides auth and cloud sync. The structural changes are: the 12-provider hierarchy moves from `AppShell.tsx` into a `ClientProviders.tsx` file (marked `'use client'`) imported by `app/layout.tsx` (which stays as a Server Component); BrowserRouter from react-router-dom is removed; routing is handled by the `app/` directory structure and `next/navigation` hooks. The existing provider nesting order constraints (OfflineProvider inside ToastProvider, TTSProvider wrapping TTS consumers) are preserved exactly.

**Major components:**
1. `app/layout.tsx` (Server Component) — root layout; reads nonce from headers; exports metadata, viewport, PWA config; imports fonts and global CSS; wraps children in `ClientProviders`
2. `src/components/ClientProviders.tsx` ('use client') — the 12-provider hierarchy (ErrorBoundary -> Language -> Theme -> TTS -> Toast -> Offline -> Auth -> Social -> SRS -> State -> Navigation); preserves existing nesting order constraints
3. `app/(protected)/layout.tsx` ('use client') — auth guard; replaces `ProtectedRoute` component; wraps protected routes in NavigationShell; uses `useAuth` + `redirect` pattern
4. `app/(protected)/template.tsx` — page transition wrapper using `usePathname()` as AnimatePresence key; replaces react-router location-keyed transitions; delivers enter-only animations (exit animations are an unresolved App Router limitation)
5. `proxy.ts` — renamed from `middleware.ts`; generates per-request nonce; enables CSP to switch from hash-based to nonce-based (App Router advantage over Pages Router)
6. `src/lib/readiness/readinessEngine.ts` — pure function; calculates 0-100 readiness score from existing FSRS data, mastery, test history, and streak; projects FSRS retrievability to test date rather than using today's R value
7. `src/lib/readiness/weakAreaDrill.ts` — pure function; generates focused drill sessions from category mastery data

### Critical Pitfalls

1. **Turbopack default breaks webpack plugin chain** — Add `"build": "next build --webpack"` to package.json scripts immediately when upgrading to Next.js 16. The `@serwist/next` + `@sentry/nextjs` + `@next/bundle-analyzer` wrapper chain is entirely webpack-based; Turbopack does not support webpack plugins. Build fails in CI/CD on day one without this flag. Plan Turbopack migration as a separate future task after all three plugins have stable Turbopack equivalents.

2. **Mixed Pages Router and App Router causes hard navigations** — Do NOT incrementally migrate routes. When Pages Router routes and App Router routes coexist, navigation between them causes full page reloads, losing all React state including the 12 context providers, TTS engine state, auth session, navigation locks, and SRS deck state. Migrate all 15 routes in a single phase by keeping everything under one router boundary at all times.

3. **Provider hierarchy must be a Client Component wrapper** — `app/layout.tsx` is a Server Component. All 12 context providers use `useState`/`useEffect`/`createContext` and cannot run in a Server Component. Create a `ClientProviders.tsx` with `'use client'` directive that wraps all providers; import it into `layout.tsx`. Do NOT mark `layout.tsx` itself as `'use client'` — that defeats Server Component benefits and grows the bundle unnecessarily.

4. **Readiness score gives false confidence** — A weighted average over accuracy and coverage can score a user "85% ready" when they have never studied key categories. Any unstudied category is a real risk since the USCIS test draws randomly from all 128 questions. The algorithm must: penalize zero-coverage categories (cap readiness at 60% if any category is unstudied), use FSRS retrievability projected to the test date not today's R value, and weight mock test performance more heavily than practice/flashcard performance.

5. **CSP migration is its own phase** — The move from hash-based to nonce-based CSP is an App Router advantage, but it must be a separate sub-phase after routing is stable. Simultaneously migrating routing and CSP doubles the debugging surface. Hash-based CSP still works in App Router; keep it initially, then migrate to nonces in a dedicated step with targeted testing of Google OAuth, Sentry, TTS, service worker, and push notifications.

## Implications for Roadmap

Based on combined research, the pitfall ordering constraints dictate the phase structure. The routing migration is the critical path; all other work depends on completing it without breaking the app's core offline-first functionality.

### Phase 1: Next.js 16 Upgrade and Tooling

**Rationale:** Build tooling must be resolved before touching any routing or features. Turbopack compatibility is a build-time dependency that blocks all subsequent phases if unresolved. Sentry must be reconfigured immediately so errors are captured during the migration itself.
**Delivers:** Working Next.js 16 build with webpack flag; updated Sentry configuration (`instrumentation.ts`, `global-error.tsx`); `middleware.ts` renamed to `proxy.ts` with export renamed; build scripts updated (`lint: eslint .`, `analyze: next build --analyze`); Vercel Node.js 20+ runtime verified; `@serwist/next` replaced by `@serwist/turbopack` (or webpack fallback confirmed); `date-fns` added.
**Avoids:** Pitfall 1 (Turbopack build failure), Pitfall 2 (middleware rename), Pitfall 9 (Sentry App Router requirements), Pitfall 18 (async request APIs in new Server Component code).
**Research flag:** SKIP — official Next.js 16 upgrade guide and Sentry docs provide exact steps. No novel research needed.

### Phase 2: App Router Foundation (Layout and Providers)

**Rationale:** The provider hierarchy and root layout must exist before any routes can be migrated. This phase creates the structural shell that all page components will live inside. No user-facing changes.
**Delivers:** `app/layout.tsx` (Server Component with metadata, fonts, theme script, hash-based CSP initially); `ClientProviders.tsx` (12-provider hierarchy extracted from `AppShell.tsx`); route group directories `app/(public)/`, `app/(auth)/`, `app/(protected)/` with shell layout files; `app/(protected)/layout.tsx` auth guard.
**Avoids:** Pitfall 5 (provider hierarchy in Server Component), Pitfall 3 (mixed router hard navigations — foundation only, no routes moved yet).
**Research flag:** SKIP — well-documented App Router pattern. Official Next.js SPA guide covers this exactly.

### Phase 3: Route Migration (All 15 Routes, One Phase)

**Rationale:** The hard navigation pitfall (Pitfall 3) requires migrating all routes at once. This is the largest single phase — approximately 40-60 files need react-router-dom hook replacements. The Next.js codemod handles mechanical changes; the remaining work is `useNavigate` -> `useRouter`, `useLocation` -> `usePathname`, `Navigate` -> `redirect`, and converting `pages/` files to `app/` directory structure.
**Delivers:** All 15+ SPA routes as `app/` page files; `react-router-dom` removed from package.json; `AppShell.tsx` deleted; `ProtectedRoute` converted to `(protected)/layout.tsx`; `PageTransition` updated to `usePathname()` + `template.tsx` pattern (enter-only animations accepted); `HubPage` sub-routes converted to `app/(protected)/hub/*/page.tsx` nested structure; API routes migrated to `app/api/push/*/route.ts` Route Handlers; clean URLs (no more `#` prefix).
**Avoids:** Pitfall 3 (mixed router hard navigations — all routes migrated at once), Pitfall 6 (router hook replacement scope — inventory all imports first), Pitfall 7 (page transitions — accept enter-only via template.tsx), Pitfall 8 (next/head removal — use metadata exports), Pitfall 16 (useRouter import confusion), Pitfall 17 (theme script moves to layout.tsx), Pitfall 21 (circular dependencies — keep route config in constants).
**Research flag:** SKIP — mechanical migration. The codemod `pnpm dlx @next/codemod@canary upgrade latest` automates most changes; remaining work follows documented patterns.

### Phase 4: CSP Nonce Migration and PWA Update

**Rationale:** CSP migration is isolated here after routing is stable. Simultaneous CSP and routing changes would double the debugging surface. Service worker path updates are grouped with CSP because both affect the app's security and caching infrastructure.
**Delivers:** `proxy.ts` updated with per-request nonce generation; `app/layout.tsx` reads nonce via `headers()` and passes to theme script via `<Script strategy="beforeInteractive" nonce={nonce}>`; CSP switches from hash-based to nonce-based with `'strict-dynamic'`; service worker source moved to `app/sw.ts`; offline fallback verified on all routes; push notification API routes verified as Route Handlers.
**Avoids:** Pitfall 4 (CSP strategy change — isolated phase), Pitfall 10 (service worker path changes).
**Research flag:** SKIP — official Next.js CSP guide documents the nonce pattern exactly. Serwist App Router docs cover service worker placement.

### Phase 5: Test Readiness Score and Drill Mode

**Rationale:** With the migration complete and the app stable, the highest-impact feature work begins. Readiness scoring is the foundation that study plan recommendations depend on. Pure TypeScript computation using existing FSRS and mastery data — no new libraries, no UI framework changes.
**Delivers:** `src/lib/readiness/readinessEngine.ts` (pure function, unit tested); `useReadinessScore` hook aggregating existing `useStreak`, `useSRS`, `useCategoryMastery`, `useAuth`, and `getInterviewHistory`; ReadinessRing component on Dashboard and Progress Hub Overview tab; per-dimension breakdown display (knowledge, retention, test performance, consistency); readiness formula penalizing zero-coverage categories and projecting FSRS R to test date; dedicated "Drill Weak Areas" entry point on Dashboard and Progress Hub; category-level drill buttons; drill session pre/post mastery delta display.
**Addresses:** Test Readiness Score (table stakes, Priority 1) and Smart Weak-Area Drill (table stakes, Priority 2) from FEATURES.md.
**Avoids:** Pitfall 12 (false confidence — penalize zero-coverage categories, project R to test date), Pitfall 20 (FSRS retrievability misuse — use `forgetting_curve(elapsed_days, stability)` to project future R).
**Research flag:** NEEDS RESEARCH — the exact `ts-fsrs@5.2.3` API for projecting retrievability to a future date (`forgetting_curve` function signature) needs verification before implementation. Recommend a targeted research task at the start of this phase.

### Phase 6: Test Date Countdown and Study Plan

**Rationale:** Depends on readiness score (Phase 5) being visible, since the "take a mock test" recommendation is driven by readiness data. Simple arithmetic using `date-fns`, not complex scheduling logic.
**Delivers:** Test date input in Settings (date picker, stored in localStorage); countdown display on Dashboard and Progress Hub; "Today's Plan" card on Dashboard (daily new questions + SRS review count + mock test recommendation when readiness score suggests it); adaptive recalculation on each Dashboard visit; positive framing that never shows "behind schedule" messaging; graceful no-op when no test date is set.
**Addresses:** Test Date Countdown with Daily Targets (table stakes, Priority 3) from FEATURES.md.
**Avoids:** Pitfall 13 (rigid scheduling causing abandonment — recalculate daily, frame positively, celebrate partial completion).
**Research flag:** SKIP — simple date arithmetic with `date-fns`. Adaptive framing is a design decision, not a research question.

### Phase 7: Content Enrichment (Mnemonics, Tips, Depth)

**Rationale:** Fully independent of the migration and can be parallelized with Phases 5-6 if resources allow. Highest content authoring effort, but code changes are small. English mnemonics first; Burmese mnemonics deferred given the BRMSE-01 known constraint.
**Delivers:** Mnemonics authored for all 128 questions (currently 17/128 have them); visual mnemonic treatment in FeedbackPanel and flashcards (lightbulb icon, distinct styling block with accent border); 7 category introduction objects with study strategy and common pitfalls (shown as dismissible cards, dismissal stored in localStorage); "Tricky Questions" difficulty badges; "See Also" related question chips (data exists for all 128, UI missing); expanded fun facts (25->128), common mistakes (28->128), citations (48->128).
**Addresses:** Mnemonics (differentiator, Priority 4), Study Tips (differentiator, Priority 5), Content Depth (Priority 6) from FEATURES.md.
**Avoids:** Pitfall 14 (culturally inappropriate mnemonics — English-only initially, prefer visual/structural devices over English wordplay or letter-based acronyms).
**Research flag:** SKIP for code work. Content authoring is a content task, not a technical research question. Flag BRMSE-01 for native speaker review before adding any Burmese mnemonics.

### Phase 8: Performance Optimization and Bundle Audit

**Rationale:** Performance optimization is data-driven and requires the completed app. Bundle analysis before migration is premature since App Router's automatic per-route code splitting is the biggest structural improvement and is only measurable after all routes exist.
**Delivers:** Dynamic imports for heavy components (recharts on Hub pages, DotLottie/confetti on celebrations, InterviewPage speech recognition); `optimizePackageImports` extended to cover `date-fns` and `recharts` in next.config.ts; bundle size before/after comparison documented; service worker precache list verified correct for App Router assets; Web Vitals regression check against v3.0 baseline.
**Addresses:** Bundle optimization goals from STACK.md. Estimated improvement from ~300KB initial JS to ~150KB with per-route splitting.
**Avoids:** Pitfall 15 (bundle size regression — monitor with `next build --analyze` at each step), Pitfall 19 (OneDrive webpack cache corruption — `rm -rf .next` before each major build step).
**Research flag:** SKIP — standard Next.js bundle optimization patterns. Official bundle optimization guide covers `dynamic()`, `optimizePackageImports`, and the built-in analyzer.

### Phase Ordering Rationale

- Phases 1-4 form a strict dependency chain: tooling must work before routes migrate; routes must be stable before CSP changes; CSP must be isolated from routing to keep the debugging surface tractable.
- Phases 5-6 have a soft dependency (study plan uses readiness score) and can begin only after Phase 3 completes since features must target the new App Router route structure.
- Phase 7 is fully independent and can be parallelized with Phases 5-6 if separate authoring and development tracks are available.
- Phase 8 is intentionally last: the App Router's automatic code splitting (the biggest bundle win) is only measurable after all routes exist, and optimization is only meaningful on a complete app.
- This ordering aligns exactly with the pitfall analysis's recommended sequence: upgrade -> foundation -> routes -> CSP/PWA -> features -> content -> performance.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (Readiness Scoring):** The `ts-fsrs@5.2.3` API for projecting retrievability to a future date needs verification. Specifically: the `forgetting_curve(elapsed_days, stability)` function signature and whether the library exposes it for external use. Recommend a targeted research task (not a full research-phase) at the start of Phase 5 planning.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Next.js 16 Upgrade):** Official upgrade guide is comprehensive and step-by-step.
- **Phase 2 (App Router Foundation):** Official Next.js SPA guide covers the exact pattern for this app.
- **Phase 3 (Route Migration):** Mechanical — the Next.js codemod handles most changes; remaining changes follow `useNavigate` -> `useRouter` patterns.
- **Phase 4 (CSP/PWA):** Official Next.js CSP guide covers nonce pattern precisely; Serwist docs cover service worker.
- **Phase 6 (Study Plan):** Simple date arithmetic; design decisions are not research questions.
- **Phase 7 (Content Enrichment):** Content authoring task, not a technical research question.
- **Phase 8 (Performance):** Standard optimization patterns with official documentation.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js 16 official docs, Serwist/Sentry official docs, verified package versions. The webpack fallback strategy is confirmed. Only uncertainty is Serwist Turbopack stability at `@serwist/turbopack@9.5.5` — mitigated by keeping `--webpack` fallback. |
| Features | HIGH | Existing codebase analyzed thoroughly; new features are mostly UI promotion of already-implemented logic. Feature priorities reasoned against competitor research (Achievable, Brainscape, UWorld, 300Hours). Content enrichment scope (128 questions) is definite and finite. |
| Architecture | HIGH | Official Next.js 16 and App Router migration guides are comprehensive. Codebase analysis of 300+ source files informs the exact migration surface. Provider hierarchy ordering constraints documented in CLAUDE.md and preserved in architecture recommendations. |
| Pitfalls | HIGH | Critical pitfalls confirmed from official docs (Turbopack, middleware rename, mixed router hard navigation, provider server component constraint). Exit animation limitation confirmed from Next.js GitHub discussions with 2000+ comments. FSRS retrievability projection pitfall is MEDIUM confidence — based on algorithm understanding, needs API verification. |

**Overall confidence:** HIGH

### Gaps to Address

- **FSRS retrievability projection API:** The `ts-fsrs@5.2.3` `forgetting_curve` function signature needs verification before the readiness engine is implemented. Mitigate by allocating a targeted research task before Phase 5.
- **Serwist Turbopack stability:** `@serwist/turbopack@9.5.5` is actively maintained but less battle-tested than `@serwist/next`. Mitigate by keeping `--webpack` fallback build script throughout Phases 1-7; attempt full Turbopack only in Phase 8 if all plugins are confirmed stable.
- **Exit animation regression:** App Router does not support AnimatePresence exit animations on route transitions (confirmed GitHub issue, unresolved as of 2026). The `template.tsx` workaround delivers enter-only animations. This is an accepted regression for v4.0; revisit with React 19.2 ViewTransition API in a future milestone.
- **Burmese mnemonic quality (BRMSE-01):** English mnemonics in Phase 7 are tractable. Burmese mnemonics require native speaker review since wordplay and letter-based mnemonics do not transfer across scripts. Plan native speaker review as a separate content QA task before any Burmese mnemonics are authored.
- **Readiness algorithm calibration:** Formula weights (accuracy, coverage, consistency, test performance) are reasoned but not empirically validated. Post-launch, compare readiness score predictions against mock test results to tune weights. Never display 100% readiness.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) — migration steps, breaking changes, async APIs
- [Next.js 16.1 Release Blog](https://nextjs.org/blog/next-16-1) — built-in bundle analyzer
- [Next.js App Router Migration Guide](https://nextjs.org/docs/app/guides/migrating/app-router-migration) — Pages to App Router pattern
- [Next.js SPA Guide](https://nextjs.org/docs/app/guides/single-page-applications) — SPA pattern in App Router (exact use case for this app)
- [Next.js CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy) — nonce-based CSP in App Router
- [Sentry Next.js Manual Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/) — `instrumentation.ts`, `global-error.tsx` requirements
- [Sentry Turbopack Support Blog](https://blog.sentry.io/turbopack-support-next-js-sdk/) — Sentry Turbopack compatibility confirmation
- [Serwist Next.js Docs](https://serwist.pages.dev/docs/next/getting-started) — service worker migration path
- [@serwist/turbopack npm](https://www.npmjs.com/package/@serwist/turbopack) — v9.5.5, Turbopack-native PWA integration
- [FSRS Algorithm Wiki](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm) — retrievability, stability, forgetting curve
- [Next.js Discussion #42658](https://github.com/vercel/next.js/discussions/42658) — exit animation limitation in App Router (confirmed unresolved)
- [Next.js Issue #61694](https://github.com/vercel/next.js/issues/61694) — CSP nonces in App Router
- [USCIS Naturalization Test Performance Data](https://www.uscis.gov/citizenship-resource-center/naturalization-related-data-and-statistics/naturalization-test-performance) — official test format and question selection
- Codebase analysis of 300+ source files — provider hierarchy constraints, existing mastery algorithms, question data structures, IndexedDB stores

### Secondary (MEDIUM confidence)
- [Achievable Test Readiness Score Discussion](https://talk.achievable.me/t/how-does-test-readiness-score-work/2522) — readiness scoring UX patterns
- [Brainscape CBR Whitepaper](https://edcuration.com/resource/product/3/Brainscape%20whitepaper.pdf) — confidence-based repetition and weak area drilling patterns
- [300Hours CFA Study Planner](https://300hours.com/cfa-study-planner/) — study plan UX patterns
- [FSRS Algorithm Explanation](https://expertium.github.io/Algorithm.html) — retrievability projection mechanics
- [Serwist + Next.js 16 PWA](https://aurorascharff.no/posts/dynamically-generating-pwa-app-icons-nextjs-16-serwist/) — App Router service worker setup reference
- [Vercel Blog: Common App Router Mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) — provider pattern, client component boundaries

### Tertiary (LOW confidence, needs validation)
- [date-fns vs dayjs comparison](https://www.dhiwise.com/post/date-fns-vs-dayjs-the-battle-of-javascript-date-libraries) — library selection rationale (date-fns chosen for tree-shakeability; recommendation accepted)

---
*Research completed: 2026-02-23*
*Ready for roadmap: yes*
*Recommended phases: 8*
*Critical path: Phase 1 (Tooling) -> Phase 2 (Foundation) -> Phase 3 (Route Migration) -> Phase 4 (CSP/PWA) -> Phase 5 (Readiness Score)*
*Parallel opportunity: Phase 7 (Content Enrichment) can run alongside Phases 5-6*
