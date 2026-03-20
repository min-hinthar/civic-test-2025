# Roadmap: Civic Test Prep 2025

## Milestones

- v1.0 MVP - Phases 1-10 (shipped 2026-02-08)
- v2.0 Unified Learning Hub - Phases 11-17 (shipped 2026-02-13)
- v2.1 Quality & Polish - Phases 18-28 (shipped 2026-02-19)
- v3.0 World-Class UX - Phases 29-38 (shipped 2026-02-22)
- v4.0 Next-Gen Architecture - Phases 39-47 (shipped 2026-03-02)
- v4.1 Production Hardening - Phases 48-53 (in progress)

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

<details>
<summary>v4.0 Next-Gen Architecture (Phases 39-47) - SHIPPED 2026-03-02</summary>

- [x] Phase 39: Next.js 16 Upgrade and Tooling (4 plans)
- [x] Phase 40: App Router Foundation (3 plans)
- [x] Phase 41: Route Migration (5 plans)
- [x] Phase 42: CSP Nonce Migration and PWA Update (2 plans)
- [x] Phase 43: Test Readiness Score and Drill Mode (4 plans)
- [x] Phase 43.5: Integration Wiring and Tech Debt (2 plans)
- [x] Phase 44: Test Date Countdown and Study Plan (2 plans)
- [x] Phase 45: Content Enrichment (3 plans)
- [x] Phase 46: Cross-Device Sync (3 plans)
- [x] Phase 47: Performance Optimization (2 plans)

</details>

## v4.1 Production Hardening (In Progress)

**Milestone Goal:** Harden the shipped 226-requirement codebase against regressions, security leaks, and maintenance burden through testing infrastructure, error resilience, PWA stability, accessibility compliance, and dependency cleanup.

## Phases

- [ ] **Phase 48: Test Infrastructure + Quick Wins** - Safety net for all subsequent phases: shared test utility, Playwright config, dead code removal, CI hardening, coverage thresholds, Sentry fingerprinting
- [ ] **Phase 49: Error Handling + Security** - Error.tsx sanitization and bilingual rendering, component error boundaries with session save, provider ordering guard
- [ ] **Phase 50: PWA + Sync Resilience** - Service worker update UX with session-lock guard, per-field LWW settings sync, IndexedDB cache versioning
- [ ] **Phase 51: Unit Test Expansion** - Provider tests for 8 untested contexts using renderWithProviders, dependency audit and cleanup
- [ ] **Phase 52: E2E Critical Flows + Accessibility** - 7 Playwright E2E tests for critical user flows, axe-core WCAG 2.2 scans, touch target audit, glass contrast verification
- [ ] **Phase 53: Component Decomposition** - InterviewSession.tsx split into state machine hook + rendering sub-components under full E2E safety net

## Phase Details

### Phase 48: Test Infrastructure + Quick Wins
**Goal**: Developers have a complete testing foundation and CI catches regressions that currently slip through
**Depends on**: Nothing (first phase of v4.1)
**Requirements**: TEST-01, TEST-02, TEST-11, TEST-12, DEPS-01, DEPS-02, DEPS-03, DX-01, DX-02, ERRS-05
**Success Criteria** (what must be TRUE):
  1. Any developer can write a provider or view test using `renderWithProviders` without manually wiring 10+ providers
  2. Running `pnpm test:e2e` executes Playwright against a production build with a working webServer config
  3. CI pipeline fails on CSS regressions (lint:css) and coverage drops below established thresholds on src/lib/ files
  4. The @lottiefiles/dotlottie-react package and its WASM infrastructure are fully removed from the bundle
  5. Sentry groups network/IndexedDB/Supabase errors by operation class instead of creating individual issues per occurrence
**Plans**: TBD

Plans:
- [ ] 48-01: TBD
- [ ] 48-02: TBD
- [ ] 48-03: TBD

### Phase 49: Error Handling + Security
**Goal**: Users never see raw error messages or English-only error screens, and feature-level crashes are contained without killing the entire app
**Depends on**: Phase 48
**Requirements**: ERRS-01, ERRS-02, ERRS-03, ERRS-04, ERRS-06, DX-03
**Success Criteria** (what must be TRUE):
  1. When an error occurs on any route, the user sees a sanitized bilingual error message with a "Return home" button -- never raw SQL, stack traces, or English-only text
  2. A crash in InterviewSession, PracticeSession, TestPage, or CelebrationOverlay shows a localized error fallback without disrupting other parts of the app
  3. When an error boundary catches a crash during an active session, in-progress state is saved to IndexedDB before the fallback renders
  4. In development mode, mounting providers in the wrong order produces a console warning identifying the ordering violation
**Plans**: TBD

Plans:
- [ ] 49-01: TBD
- [ ] 49-02: TBD

### Phase 50: PWA + Sync Resilience
**Goal**: Users are notified of app updates without mid-session disruption, offline settings changes survive sync, and stale cached data is invalidated on version mismatch
**Depends on**: Phase 48
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-06
**Success Criteria** (what must be TRUE):
  1. When a new service worker version is detected, a persistent bilingual toast appears offering "Update now" -- the update never activates silently mid-session
  2. During an active mock test or interview, the update toast is suppressed until the session completes
  3. A user who changes settings offline and then logs in on another device retains their offline changes via per-field last-write-wins merge
  4. When the app deploys with updated question content, stale IndexedDB-cached questions are invalidated and refreshed on next load
**Plans**: TBD

Plans:
- [ ] 50-01: TBD
- [ ] 50-02: TBD

### Phase 51: Unit Test Expansion
**Goal**: All context providers have unit test coverage, preventing provider bugs from reaching production undetected
**Depends on**: Phase 48, Phase 49
**Requirements**: TEST-10, DEPS-04, DEPS-05
**Success Criteria** (what must be TRUE):
  1. All 8 previously untested context providers (SupabaseAuth, Language, Theme, SRS, Social, Offline, State, Navigation) have unit tests exercising their core behaviors
  2. Per-file coverage thresholds are added simultaneously with each new test file -- no speculative thresholds on untested code
  3. Dependency overrides and ignored CVEs are re-evaluated with current audit data, and react-joyride is pinned to stable 3.0.0 if available
**Plans**: TBD

Plans:
- [ ] 51-01: TBD
- [ ] 51-02: TBD

### Phase 52: E2E Critical Flows + Accessibility
**Goal**: The 7 most critical user flows have automated regression detection, and WCAG 2.2 compliance gaps in touch targets and glass contrast are identified and resolved
**Depends on**: Phase 50, Phase 51
**Requirements**: TEST-03, TEST-04, TEST-05, TEST-06, TEST-07, TEST-08, TEST-09, A11Y-01, A11Y-02, A11Y-03, A11Y-04
**Success Criteria** (what must be TRUE):
  1. Playwright E2E tests cover: auth login to dashboard, mock test lifecycle, practice session, flashcard sort, offline-to-online sync, interview session (text input), and SW update flow
  2. axe-core WCAG 2.2 AA scans pass on dashboard, test, interview, and settings pages with documented exceptions for backdrop-filter elements
  3. All interactive components across 30+ directories have touch targets verified at 44px minimum, with violations fixed
  4. Glass-morphism color contrast is verified against WCAG AA requirements, resolving VISC-05
**Plans**: TBD

Plans:
- [ ] 52-01: TBD
- [ ] 52-02: TBD
- [ ] 52-03: TBD

### Phase 53: Component Decomposition
**Goal**: InterviewSession.tsx is maintainable and testable -- split into focused sub-components without breaking the 9-phase state machine
**Depends on**: Phase 52
**Requirements**: ARCH-04, ARCH-05
**Success Criteria** (what must be TRUE):
  1. InterviewSession.tsx parent component is under 400 lines, with each phase-specific UI sub-component under 200 lines
  2. The `useInterviewStateMachine` hook encapsulates all interview state logic and is independently unit-testable
  3. Full 20-question Practice and Real interview flows pass the existing E2E test from Phase 52 after decomposition
**Plans**: TBD

Plans:
- [ ] 53-01: TBD
- [ ] 53-02: TBD

## Progress

**Execution Order:** 48 -> 49 -> 50 -> 51 -> 52 -> 53
(Phases 49 and 50 both depend on 48 but are sequential; Phase 51 needs both 48+49; Phase 52 needs 50+51; Phase 53 needs 52)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 48. Test Infrastructure + Quick Wins | 0/TBD | Not started | - |
| 49. Error Handling + Security | 0/TBD | Not started | - |
| 50. PWA + Sync Resilience | 0/TBD | Not started | - |
| 51. Unit Test Expansion | 0/TBD | Not started | - |
| 52. E2E Critical Flows + Accessibility | 0/TBD | Not started | - |
| 53. Component Decomposition | 0/TBD | Not started | - |

## Historical Progress

| Milestone | Phases | Plans | Requirements | Status | Date |
|-----------|--------|-------|-------------|--------|------|
| v1.0 MVP | 1-10 | 72 | 55/55 | Complete | 2026-02-08 |
| v2.0 Unified Learning Hub | 11-17 | 47 | 29/29 | Complete | 2026-02-13 |
| v2.1 Quality & Polish | 18-28 | 82 | 65/66 | Complete | 2026-02-19 |
| v3.0 World-Class UX | 29-38 | 47 | 39/39 | Complete | 2026-02-22 |
| v4.0 Next-Gen Architecture | 39-47 | 30 | 38/38 | Complete | 2026-03-02 |

**Total (through v4.0):** 48 phases, 278 plans, 226/227 requirements across 5 milestones

---
*Roadmap created: 2026-02-05*
*v4.1 roadmap added: 2026-03-19*
