# Requirements: Civic Test Prep 2025

**Defined:** 2026-02-23
**Core Value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.

## v4.0 Requirements

Requirements for v4.0 Next-Gen Architecture. Each maps to roadmap phases.

### Migration

- [ ] **MIGR-01**: App builds and runs on Next.js 16 with Turbopack/webpack compatibility
- [ ] **MIGR-02**: `middleware.ts` renamed to `proxy.ts` with updated export
- [ ] **MIGR-03**: Sentry reconfigured for App Router (`instrumentation.ts`, `global-error.tsx`)
- [ ] **MIGR-04**: App Router root layout with Server Component shell and ClientProviders wrapper
- [ ] **MIGR-05**: All 15+ routes migrated from react-router-dom to Next.js file-based routing
- [ ] **MIGR-06**: `react-router-dom` removed from package.json
- [ ] **MIGR-07**: Auth guard implemented via `(protected)/layout.tsx` route group
- [ ] **MIGR-08**: Page transitions work with App Router using `template.tsx` pattern
- [ ] **MIGR-09**: CSP upgraded from hash-based to nonce-based using proxy nonce injection
- [ ] **MIGR-10**: Service worker updated for App Router asset paths
- [ ] **MIGR-11**: All API routes migrated to Route Handlers (`app/api/*/route.ts`)
- [ ] **MIGR-12**: Clean URLs work without hash prefix (no more `#/dashboard`)

### Readiness

- [ ] **RDNS-01**: User can see a test readiness score (0-100%) on Dashboard
- [ ] **RDNS-02**: Readiness score shows per-dimension breakdown (accuracy, coverage, consistency)
- [ ] **RDNS-03**: Readiness formula penalizes zero-coverage categories and projects FSRS retrievability
- [ ] **RDNS-04**: User can start a dedicated weak-area drill from Dashboard
- [ ] **RDNS-05**: Category-level drill buttons appear on categories below mastery threshold
- [ ] **RDNS-06**: Drill session shows pre/post mastery improvement delta
- [ ] **RDNS-07**: User can set test date in Settings
- [ ] **RDNS-08**: Countdown display shows days remaining on Dashboard and Progress Hub
- [ ] **RDNS-09**: Daily study targets card on Dashboard (SRS review + new questions + mock test recommendation)
- [ ] **RDNS-10**: Daily targets adapt dynamically when user misses or studies ahead

### Content

- [ ] **CONT-01**: All 128 questions have mnemonic fields populated (English)
- [ ] **CONT-02**: All 128 questions have fun fact fields populated (English + Burmese)
- [ ] **CONT-03**: All 128 questions have common mistake fields populated (English + Burmese)
- [ ] **CONT-04**: All 128 questions have citation fields populated
- [ ] **CONT-05**: Mnemonics display with distinct visual treatment (lightbulb icon, accent border)
- [ ] **CONT-06**: 7 category study tips shown as dismissible cards in category practice
- [ ] **CONT-07**: "Tricky Questions" difficulty badges on hard questions
- [ ] **CONT-08**: "See Also" related question chips rendered in study/review contexts

### Cross-Device Sync

- [ ] **SYNC-01**: Answer history (mastery data) syncs to Supabase for cross-device continuity
- [ ] **SYNC-02**: Bookmarks sync to Supabase across devices
- [ ] **SYNC-03**: User settings (theme, language, voice, test date) sync to Supabase
- [ ] **SYNC-04**: Study streak data syncs to Supabase for accurate cross-device tracking

### Performance

- [ ] **PERF-01**: Heavy components (recharts, DotLottie, confetti) use dynamic imports
- [ ] **PERF-02**: `optimizePackageImports` configured for date-fns and recharts
- [ ] **PERF-03**: Bundle size documented with before/after comparison
- [ ] **PERF-04**: Web Vitals verified against v3.0 baseline (no regressions)

## Future Requirements

Deferred to future release. Tracked but not in current roadmap.

### Content Quality

- **BRMSE-01**: Burmese mnemonic content reviewed by native Myanmar speaker (carried from v2.1)
- **CONT-09**: Burmese mnemonics authored using language-appropriate mnemonic devices
- **CONT-10**: Video explanations for complex topics

### Advanced Features

- **ADVN-01**: AI-powered adaptive study recommendations
- **ADVN-02**: Calendar-based scheduling UI with spaced repetition integration
- **ADVN-03**: Predictive pass probability based on psychometric modeling
- **ADVN-04**: User-generated mnemonics with moderation

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Incremental route migration | Mixed Pages/App Router causes hard navigations that destroy provider state |
| AnimatePresence exit animations | Unsupported in App Router (accepted regression); revisit with ViewTransition API |
| Full Turbopack migration | Webpack plugin chain (Sentry + Serwist) incompatible; use `--webpack` flag |
| Server-side rendering | App requires browser APIs (IndexedDB, SpeechSynthesis); stays client-rendered |
| Calendar scheduling UI | Over-engineering for 128-question single-subject test |
| AI chatbot tutor | API cost, offline incompatibility, hallucination risk for consequential test |
| Swipe between tabs | Gesture conflicts with existing SwipeableCard |
| Character mascot | Asset burden, scope creep |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MIGR-01 | Phase 39 | Pending |
| MIGR-02 | Phase 39 | Pending |
| MIGR-03 | Phase 39 | Pending |
| MIGR-04 | Phase 40 | Pending |
| MIGR-05 | Phase 41 | Pending |
| MIGR-06 | Phase 41 | Pending |
| MIGR-07 | Phase 40 | Pending |
| MIGR-08 | Phase 41 | Pending |
| MIGR-09 | Phase 42 | Pending |
| MIGR-10 | Phase 42 | Pending |
| MIGR-11 | Phase 41 | Pending |
| MIGR-12 | Phase 41 | Pending |
| RDNS-01 | Phase 43 | Pending |
| RDNS-02 | Phase 43 | Pending |
| RDNS-03 | Phase 43 | Pending |
| RDNS-04 | Phase 43 | Pending |
| RDNS-05 | Phase 43 | Pending |
| RDNS-06 | Phase 43 | Pending |
| RDNS-07 | Phase 44 | Pending |
| RDNS-08 | Phase 44 | Pending |
| RDNS-09 | Phase 44 | Pending |
| RDNS-10 | Phase 44 | Pending |
| CONT-01 | Phase 45 | Pending |
| CONT-02 | Phase 45 | Pending |
| CONT-03 | Phase 45 | Pending |
| CONT-04 | Phase 45 | Pending |
| CONT-05 | Phase 45 | Pending |
| CONT-06 | Phase 45 | Pending |
| CONT-07 | Phase 45 | Pending |
| CONT-08 | Phase 45 | Pending |
| SYNC-01 | Phase 46 | Pending |
| SYNC-02 | Phase 46 | Pending |
| SYNC-03 | Phase 46 | Pending |
| SYNC-04 | Phase 46 | Pending |
| PERF-01 | Phase 47 | Pending |
| PERF-02 | Phase 47 | Pending |
| PERF-03 | Phase 47 | Pending |
| PERF-04 | Phase 47 | Pending |

**Coverage:**
- v4.0 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0

---
*Requirements defined: 2026-02-23*
*Last updated: 2026-02-23 after roadmap creation*
