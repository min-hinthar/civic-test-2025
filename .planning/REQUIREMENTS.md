# Requirements: Civic Test Prep 2025

**Defined:** 2026-03-19
**Core Value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.

## v4.1 Requirements

Requirements for Production Hardening milestone. Each maps to roadmap phases.

### Testing Infrastructure

- [x] **TEST-01**: Shared `renderWithProviders` test utility with configurable provider stack and sensible defaults
- [x] **TEST-02**: Playwright E2E framework configured with `webServer` pointing to production build
- [ ] **TEST-03**: E2E test: auth login -> dashboard render with user data
- [ ] **TEST-04**: E2E test: mock test lifecycle (start, answer 20 questions, timer, pass/fail, results saved)
- [ ] **TEST-05**: E2E test: practice session (category filter, answer, feedback panel, keyword highlights)
- [ ] **TEST-06**: E2E test: flashcard sort (swipe cards, results, SRS batch add)
- [ ] **TEST-07**: E2E test: offline -> online sync (go offline, answer, reconnect, verify sync)
- [ ] **TEST-08**: E2E test: interview session (setup, questions, text input, grading, results)
- [ ] **TEST-09**: E2E test: service worker update (detect new version, toast, user-triggered reload)
- [ ] **TEST-10**: Unit tests for 8 untested context providers (SupabaseAuth, Language, Theme, SRS, Social, Offline, State, Navigation)
- [x] **TEST-11**: Coverage thresholds enforced on all `src/lib/` files with existing test suites (~15 files)
- [x] **TEST-12**: Global coverage minimum floor established

### Error Handling & Security

- [x] **ERRS-01**: All 3 error.tsx files use `sanitizeError()` to prevent raw message exposure
- [x] **ERRS-02**: All 3 error.tsx files render bilingual error messages with "Return home" navigation
- [x] **ERRS-03**: Component-level error boundaries on InterviewSession, PracticeSession, TestPage, CelebrationOverlay
- [x] **ERRS-04**: Error boundaries trigger session save in `componentDidCatch` to prevent data loss
- [x] **ERRS-05**: Sentry error fingerprinting groups network/IndexedDB/Supabase errors by class
- [x] **ERRS-06**: Provider ordering dev-mode runtime guard validates mount order in `ClientProviders.tsx`

### Architecture Resilience

- [x] **ARCH-01**: Service worker update UX with persistent "New version available" toast
- [x] **ARCH-02**: SW update deferred during active mock test/interview sessions (check NavigationProvider.isLocked)
- [ ] **ARCH-03**: Settings sync upgraded from server-wins to per-field last-write-wins with timestamps
- [ ] **ARCH-04**: InterviewSession.tsx decomposed into sub-components (<400 line parent, <200 line children)
- [ ] **ARCH-05**: `useInterviewStateMachine` hook extracted for shared interview state
- [x] **ARCH-06**: IndexedDB cache versioning with stale data invalidation on version mismatch

### Accessibility

- [ ] **A11Y-01**: Automated WCAG 2.2 axe-core scans on dashboard, test, interview, settings pages via Playwright
- [ ] **A11Y-02**: vitest-axe coverage expanded to all interactive components
- [ ] **A11Y-03**: Touch target 44px audit across all 30+ component directories
- [ ] **A11Y-04**: Glass-morphism color contrast verification (VISC-05 resolution)

### Dependency Cleanup

- [x] **DEPS-01**: Remove `@lottiefiles/dotlottie-react` and DotLottie infrastructure (CELB-06 resolution)
- [x] **DEPS-02**: Remove `safeAsync` dead code (or document as reserved infrastructure)
- [x] **DEPS-03**: Remove redundant RLS INSERT policies on `streak_data` and `earned_badges`
- [ ] **DEPS-04**: Re-evaluate ignored CVEs and dependency overrides
- [ ] **DEPS-05**: Pin react-joyride to stable 3.0.0 when available (monitor)

### Developer Experience

- [x] **DX-01**: `lint:css` step added to CI pipeline
- [x] **DX-02**: Dead code detection run (Knip) with findings addressed
- [x] **DX-03**: Console output in production replaced with structured `captureError()` where impactful

## Future Requirements

### Carried Gaps (require human action)

- **BRMSE-01**: Burmese translation naturalness — requires native Myanmar speaker assessment
- **VISC-05-MANUAL**: Dark mode glass panel readability — manual device testing after A11Y-04

## Out of Scope

| Feature | Reason |
|---------|--------|
| Visual regression testing (Playwright screenshots) | Maintenance burden extreme for solo dev; baseline images break on OS/font/browser updates. PROJECT.md explicit exclusion. |
| Full CRDT sync engine (Yjs/Automerge) | 30-100KB overhead for single-user, single-device-at-a-time app. Per-field LWW sufficient. |
| 100% test coverage target | Diminishing returns past ~70-80% for UI code. Tiered thresholds instead. |
| Cypress E2E | Playwright is faster, better multi-browser, official Next.js recommendation. |
| MSW for E2E tests | E2E should hit real endpoints. MSW for unit/integration only. |
| react-joyride replacement | Tour works, is dynamically imported. Pin to stable when available. |
| Console output bulk replacement | 36 calls in error-handling catch blocks. No PII leaked. Defer. |
| Page-level view unit tests (14 views) | E2E tests cover user flows more effectively than unit-testing declarative JSX views. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TEST-01 | Phase 48 | Complete |
| TEST-02 | Phase 48 | Complete |
| TEST-03 | Phase 52 | Pending |
| TEST-04 | Phase 52 | Pending |
| TEST-05 | Phase 52 | Pending |
| TEST-06 | Phase 52 | Pending |
| TEST-07 | Phase 52 | Pending |
| TEST-08 | Phase 52 | Pending |
| TEST-09 | Phase 52 | Pending |
| TEST-10 | Phase 51 | Pending |
| TEST-11 | Phase 48 | Complete |
| TEST-12 | Phase 48 | Complete |
| ERRS-01 | Phase 49 | Complete |
| ERRS-02 | Phase 49 | Complete |
| ERRS-03 | Phase 49 | Complete |
| ERRS-04 | Phase 49 | Complete |
| ERRS-05 | Phase 48 | Complete |
| ERRS-06 | Phase 49 | Complete |
| ARCH-01 | Phase 50 | Complete |
| ARCH-02 | Phase 50 | Complete |
| ARCH-03 | Phase 50 | Pending |
| ARCH-04 | Phase 53 | Pending |
| ARCH-05 | Phase 53 | Pending |
| ARCH-06 | Phase 50 | Complete |
| A11Y-01 | Phase 52 | Pending |
| A11Y-02 | Phase 52 | Pending |
| A11Y-03 | Phase 52 | Pending |
| A11Y-04 | Phase 52 | Pending |
| DEPS-01 | Phase 48 | Complete |
| DEPS-02 | Phase 48 | Complete |
| DEPS-03 | Phase 48 | Complete |
| DEPS-04 | Phase 51 | Pending |
| DEPS-05 | Phase 51 | Pending |
| DX-01 | Phase 48 | Complete |
| DX-02 | Phase 48 | Complete |
| DX-03 | Phase 49 | Complete |

**Coverage:**
- v4.1 requirements: 36 total
- Mapped to phases: 36
- Unmapped: 0

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 after roadmap creation*
