# Roadmap: Civic Test Prep 2025

## Milestones

- v1.0 MVP - Phases 1-10 (shipped 2026-02-08)
- v2.0 Unified Learning Hub - Phases 11-17 (shipped 2026-02-13)
- v2.1 Quality & Polish - Phases 18-28 (shipped 2026-02-19)
- v3.0 World-Class UX - Phases 29-38 (shipped 2026-02-22)
- **v4.0 Next-Gen Architecture** - Phases 39-47 (in progress)

See `.planning/MILESTONES.md` for completed milestone details.

<details>
<summary>v1.0 MVP (Phases 1-10) - SHIPPED 2026-02-08</summary>

- [x] Phase 1: Foundation & Code Quality (5 plans)
- [x] Phase 2: PWA & Offline (6 plans)
- [x] Phase 3: UI/UX & Bilingual Polish (10 plans)
- [x] Phase 4: Learning, Explanations & Category Progress (9 plans)
- [x] Phase 5: Spaced Repetition (9 plans)
- [x] Phase 6: Interview Simulation (6 plans)
- [x] Phase 7: Social Features (8 plans)
- [x] Phase 8: Critical Integration Fixes (5 plans)
- [x] Phase 9: Testing & Launch Prep (7 plans)
- [x] Phase 10: Final Polish & Ship (7 plans)

</details>

<details>
<summary>v2.0 Unified Learning Hub (Phases 11-17) - SHIPPED 2026-02-13</summary>

- [x] Phase 11: Design Token Foundation (7 plans)
- [x] Phase 12: USCIS 2025 Question Bank (6 plans)
- [x] Phase 13: Security Hardening (5 plans)
- [x] Phase 14: Unified Navigation (7 plans)
- [x] Phase 15: Progress Hub (6 plans)
- [x] Phase 16: Dashboard Next Best Action (5 plans)
- [x] Phase 17: UI System Polish (11 plans)

</details>

<details>
<summary>v2.1 Quality & Polish (Phases 18-28) - SHIPPED 2026-02-19</summary>

- [x] Phase 18: Language Mode (7 plans)
- [x] Phase 19: TTS Core Extraction (6 plans)
- [x] Phase 20: Session Persistence (6 plans)
- [x] Phase 21: Test, Practice & Interview UX Overhaul (12 plans)
- [x] Phase 22: TTS Quality (9 plans)
- [x] Phase 23: Flashcard Sort Mode (9 plans)
- [x] Phase 24: Accessibility & Performance (10 plans)
- [x] Phase 25: Burmese Translation Audit (10 plans)
- [x] Phase 26: Gap Closure - Session, Navigation & TTS Fixes (3 plans)
- [x] Phase 27: Gap Closure - Timer Accessibility (1 plan)
- [x] Phase 28: Interview UX & Voice Flow Polish (9 plans)

</details>

<details>
<summary>v3.0 World-Class UX (Phases 29-38) - SHIPPED 2026-02-22</summary>

- [x] Phase 29: Visual Foundation (7 plans)
- [x] Phase 30: Mobile Native Feel (4 plans)
- [x] Phase 31: Animation & Interaction Polish (5 plans)
- [x] Phase 32: Celebration System Elevation (8 plans)
- [x] Phase 33: States & Accessibility (5 plans)
- [x] Phase 34: Content & About Page (3 plans)
- [x] Phase 35: Touch Target Fix + Tech Debt (2 plans)
- [x] Phase 36: Mock Test Celebration Unification (1 plan)
- [x] Phase 37: Bug Fixes & UX Polish (7 plans)
- [x] Phase 38: Security Analysis & Refactoring (5 plans)

</details>

## Phases

**v4.0 Next-Gen Architecture**

- [x] **Phase 39: Next.js 16 Upgrade and Tooling** - Upgrade to Next.js 16, configure webpack fallback, reconfigure Sentry and service worker tooling
- [x] **Phase 40: App Router Foundation** - Create root layout, extract ClientProviders, set up route group directories and auth guard (completed 2026-02-24)
- [x] **Phase 41: Route Migration** - Migrate all 15+ routes from react-router-dom to App Router file-based routing in one pass (completed 2026-02-24)
- [x] **Phase 42: CSP Nonce Migration and PWA Update** - Switch from hash-based to nonce-based CSP and update service worker for App Router (completed 2026-02-25)
- [ ] **Phase 43: Test Readiness Score and Drill Mode** - Surface readiness scoring and weak-area drilling as first-class Dashboard features
- [ ] **Phase 44: Test Date Countdown and Study Plan** - Add test date setting with countdown display and adaptive daily study targets
- [ ] **Phase 45: Content Enrichment** - Author mnemonics, fun facts, common mistakes, citations, study tips, and related question links for all 128 questions
- [ ] **Phase 46: Cross-Device Sync** - Sync answer history, bookmarks, settings, and streak data to Supabase for multi-device continuity
- [ ] **Phase 47: Performance Optimization** - Dynamic imports, optimizePackageImports, bundle audit, and Web Vitals regression check

## Phase Details

### Phase 39: Next.js 16 Upgrade and Tooling
**Goal**: The app builds and runs on Next.js 16 with all existing functionality intact
**Depends on**: Nothing (first phase of v4.0)
**Requirements**: MIGR-01, MIGR-02, MIGR-03
**Success Criteria** (what must be TRUE):
  1. `pnpm build` succeeds on Next.js 16 with `--webpack` flag and all existing tests pass
  2. `middleware.ts` is renamed to `proxy.ts` with updated export and CSP headers still apply
  3. Sentry captures errors in both dev and production via `instrumentation.ts` and `global-error.tsx`
  4. The app loads in the browser and all existing features work identically to v3.0
**Plans**: 4 plans
Plans:
- [x] 39-01-PLAN.md -- Pre-upgrade safety tag and non-Next dependency upgrades
- [x] 39-02-PLAN.md -- Next.js 16 upgrade, scripts, middleware-to-proxy rename
- [x] 39-03-PLAN.md -- Sentry App Router integration and noise filters
- [x] 39-04-PLAN.md -- Full verification suite and manual smoke test

### Phase 40: App Router Foundation
**Goal**: The App Router shell exists with providers and auth guard, ready to receive migrated routes
**Depends on**: Phase 39
**Requirements**: MIGR-04, MIGR-07
**Success Criteria** (what must be TRUE):
  1. `app/layout.tsx` serves as Server Component root with metadata, fonts, global CSS, and theme script
  2. `ClientProviders.tsx` wraps all 12 context providers in correct nesting order as a `'use client'` component
  3. Protected route group `(protected)/layout.tsx` redirects unauthenticated users to auth page
  4. The app still loads via the existing Pages Router catch-all (no routes moved yet)
**Plans**: 3 plans
Plans:
- [x] 40-01-PLAN.md -- Theme script extraction and ClientProviders creation
- [x] 40-02-PLAN.md -- App Router layout and AppShell refactor
- [x] 40-03-PLAN.md -- Auth guard layout and returnTo migration

### Phase 41: Route Migration
**Goal**: All routes use Next.js file-based routing with clean URLs and react-router-dom is removed
**Depends on**: Phase 40
**Requirements**: MIGR-05, MIGR-06, MIGR-08, MIGR-11, MIGR-12
**Success Criteria** (what must be TRUE):
  1. All 15+ routes are accessible via clean URLs (e.g., `/dashboard` instead of `#/dashboard`)
  2. `react-router-dom` is removed from `package.json` and no imports remain in the codebase
  3. Page transitions animate on route changes using the `template.tsx` pattern
  4. API routes respond correctly as App Router Route Handlers (`app/api/*/route.ts`)
  5. Navigation between all routes preserves provider state (no full page reloads)
**Plans**: 5 plans
Plans:
- [x] 41-01-PLAN.md -- Route scaffolding: page.tsx wrappers, template.tsx, error/loading/not-found, hub catch-all, config redirects
- [x] 41-02-PLAN.md -- API route migration: 4 push notification Route Handlers
- [x] 41-03-PLAN.md -- Navigation + page migration: nav components, hooks, useNavigationGuard, all page files
- [x] 41-04-PLAN.md -- Component migration: dashboard, hub, SRS, social, onboarding, test/interview/practice components
- [x] 41-05-PLAN.md -- Cleanup: wire layouts, delete Pages Router, remove react-router-dom, full verification

### Phase 42: CSP Nonce Migration and PWA Update
**Goal**: CSP uses nonce-based allowlisting and the service worker caches App Router assets correctly
**Depends on**: Phase 41
**Requirements**: MIGR-09, MIGR-10
**Success Criteria** (what must be TRUE):
  1. CSP headers use per-request nonces instead of hashes, and inline scripts execute without violations
  2. Google OAuth, Sentry, TTS, and push notifications all function without CSP blocks
  3. The service worker caches App Router asset paths and the app works fully offline
  4. PWA install prompt and offline fallback page work on all routes
**Plans**: 2 plans
Plans:
- [ ] 42-01-PLAN.md -- CSP nonce migration: proxy.ts rewrite with nonce + strict-dynamic, layout async nonce, GoogleOneTap nonce plumbing, security header consolidation
- [ ] 42-02-PLAN.md -- SW verification, proxy unit tests, and full build verification

### Phase 43: Test Readiness Score and Drill Mode
**Goal**: Users can see how ready they are for the USCIS test and drill their weakest areas
**Depends on**: Phase 41
**Requirements**: RDNS-01, RDNS-02, RDNS-03, RDNS-04, RDNS-05, RDNS-06
**Success Criteria** (what must be TRUE):
  1. User sees a 0-100% readiness score on the Dashboard with a color-coded radial ring
  2. User can expand the readiness score to see per-dimension breakdown (accuracy, coverage, consistency)
  3. Readiness score caps at 60% when any USCIS category has zero study coverage
  4. User can tap "Drill Weak Areas" on Dashboard to start a focused session on their lowest-mastery questions
  5. After completing a drill session, user sees a pre/post mastery improvement delta
**Plans**: TBD

### Phase 44: Test Date Countdown and Study Plan
**Goal**: Users with a scheduled USCIS interview see a countdown and know exactly what to study today
**Depends on**: Phase 43
**Requirements**: RDNS-07, RDNS-08, RDNS-09, RDNS-10
**Success Criteria** (what must be TRUE):
  1. User can set their USCIS test date in Settings and it persists across sessions
  2. Dashboard and Progress Hub show a countdown with days remaining until the test date
  3. Dashboard shows a "Today's Plan" card with specific SRS review count, new question target, and mock test recommendation
  4. Daily targets recalculate when the user studies ahead or misses a day (no "behind schedule" shaming)
**Plans**: TBD

### Phase 45: Content Enrichment
**Goal**: Every question has mnemonics, fun facts, common mistakes, citations, study tips, and related question links to deepen learning
**Depends on**: Phase 41
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08
**Success Criteria** (what must be TRUE):
  1. All 128 questions display a mnemonic with lightbulb icon and accent border in feedback panels and flashcards
  2. All 128 questions have fun fact, common mistake, and citation fields populated and visible in study contexts
  3. Each of the 7 categories shows a dismissible study tip card at the top of category practice
  4. Hard questions display a "Tricky Question" difficulty badge
  5. Related question chips appear in study/review contexts and navigate to the linked question
**Plans**: TBD

### Phase 46: Cross-Device Sync
**Goal**: Users can switch devices and find their progress, bookmarks, settings, and streaks intact
**Depends on**: Phase 41
**Requirements**: SYNC-01, SYNC-02, SYNC-03, SYNC-04
**Success Criteria** (what must be TRUE):
  1. Logged-in user's answer history and mastery data appear on a second device after sync
  2. Bookmarks created on one device appear on another device after sync
  3. User settings (theme, language, voice preference, test date) sync across devices
  4. Study streak count is consistent across devices (no double-counting or lost days)
**Plans**: TBD

### Phase 47: Performance Optimization
**Goal**: Bundle size is measurably reduced and Web Vitals show no regression from v3.0
**Depends on**: Phase 45, Phase 46
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04
**Success Criteria** (what must be TRUE):
  1. Recharts, DotLottie, and confetti load via dynamic imports (not in the initial bundle)
  2. `optimizePackageImports` is configured for date-fns and recharts in `next.config.ts`
  3. A before/after bundle size comparison is documented showing measurable reduction
  4. Web Vitals (LCP, FID, CLS) meet or beat v3.0 baseline values
**Plans**: TBD

## Progress

**Execution Order:**
Phases 39 -> 40 -> 41 -> 42 -> 43 -> 44 -> 45 -> 46 -> 47
Note: Phases 42, 43, 45, 46 all depend on Phase 41. Phase 44 depends on Phase 43. Phase 47 is last.

**v4.0 Progress:**

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 39. Next.js 16 Upgrade and Tooling | 4/4 | Complete    | 2026-02-23 |
| 40. App Router Foundation | 3/3 | Complete    | 2026-02-24 |
| 41. Route Migration | 5/5 | Complete    | 2026-02-24 |
| 42. CSP Nonce Migration and PWA Update | 2/2 | Complete   | 2026-02-25 |
| 43. Test Readiness Score and Drill Mode | 0/? | Not started | - |
| 44. Test Date Countdown and Study Plan | 0/? | Not started | - |
| 45. Content Enrichment | 0/? | Not started | - |
| 46. Cross-Device Sync | 0/? | Not started | - |
| 47. Performance Optimization | 0/? | Not started | - |

**Cumulative:**

| Milestone | Phases | Plans | Requirements | Status | Date |
|-----------|--------|-------|-------------|--------|------|
| v1.0 MVP | 1-10 | 72 | 55/55 | Complete | 2026-02-08 |
| v2.0 Unified Learning Hub | 11-17 | 47 | 29/29 | Complete | 2026-02-13 |
| v2.1 Quality & Polish | 18-28 | 82 | 65/66 | Complete | 2026-02-19 |
| v3.0 World-Class UX | 29-38 | 47 | 39/39 | Complete | 2026-02-22 |
| v4.0 Next-Gen Architecture | 39-47 | TBD | 3/38 | In progress | - |

**Total:** 38 phases + 9 new = 47 phases, 248+ plans, 188/189 + 38 requirements across 5 milestones

---
*Roadmap created: 2026-02-05*
*v4.0 roadmap added: 2026-02-23*
