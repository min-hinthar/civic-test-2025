# Requirements: Civic Test Prep 2025

**Defined:** 2026-02-19
**Core Value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.

## v3.0 Requirements

Requirements for world-class UX elevation. Each maps to roadmap phases.

### Visual Consistency

- [ ] **VISC-01**: All screens enforce 4px spacing grid — no arbitrary padding/margin values
- [ ] **VISC-02**: Typography scale locked to 5-6 sizes (caption/body-sm/body/heading-sm/heading/display) across all screens
- [ ] **VISC-03**: Border radius rules enforced per component type (pills=full, buttons=xl, cards=2xl, modals=3xl, inputs=lg)
- [ ] **VISC-04**: Touch targets minimum 44x44px on all interactive elements (audit and fix gaps)
- [ ] **VISC-05**: Dark mode polish pass — glass panel contrast, shadow depth, text-on-glass readability tuned
- [ ] **VISC-06**: Motion tokens unified between CSS animations and motion/react spring configs
- [ ] **VISC-07**: Micro-interactions on every interactive element — button press, toggle, chip select, tab switch with consistent spring physics

### Mobile Native Feel

- [x] **MOBI-01**: `overscroll-behavior: none` in PWA standalone mode prevents rubber-band white flash
- [x] **MOBI-02**: Safe area inset handling for iPhone Dynamic Island on BottomTabBar and GlassHeader
- [x] **MOBI-03**: `user-select: none` on interactive elements prevents accidental text selection during taps
- [x] **MOBI-04**: Swipe-to-dismiss on toast notifications with motion/react drag
- [x] **MOBI-05**: Haptic feedback utility (`haptics.ts`) with named patterns: tap, success, error, milestone
- [x] **MOBI-06**: Haptics integrated into FeedbackPanel, StreakReward, badge celebrations, and 3D button press

### Animation & Interaction Polish

- [x] **ANIM-01**: Button press feedback tiers: 3D chunky (primary), subtle scale (secondary), opacity (tertiary)
- [x] **ANIM-02**: StaggeredList coverage audit — all item lists use stagger with cap at 8-10 items
- [x] **ANIM-03**: Exit animations on all overlays (dialogs, modals, tooltips, toasts) — fade + scale(0.95)
- [x] **ANIM-04**: Consistent card enter animation — scale(0.95→1) + fade for all card components
- [x] **ANIM-05**: Glass-morphism tier usage audit — correct tier applied per component type across all screens
- [x] **ANIM-06**: Stagger timing scales with list length — short lists faster, skip stagger for 15+ items

### Celebration System

- [ ] **CELB-01**: Fix existing Confetti.tsx setInterval leak before building new celebrations
- [ ] **CELB-02**: `useCelebration` hook + `CelebrationOverlay` using DOM CustomEvents (not new Context)
- [ ] **CELB-03**: Achievement-scaled confetti: 5-streak=sparkle, 10-streak=burst, test pass=burst, 100%=celebration
- [ ] **CELB-04**: Multi-stage TestResultsScreen choreography: card scale-in → count-up → pass/fail reveal → confetti → sound → action buttons stagger
- [ ] **CELB-05**: Haptic patterns fire at celebration peaks — synchronized with confetti and sound
- [x] **CELB-06**: DotLottie celebration animations (checkmark, trophy, badge glow, star burst) lazy-loaded
- [x] **CELB-07**: Sound warming — add 2nd/3rd harmonics to existing oscillator sounds for richer audio
- [x] **CELB-08**: `playCelebrationSequence(stage)` sound function for multi-stage choreography timing
- [x] **CELB-09**: XP counter in quiz session header with spring pulse animation on increment
- [x] **CELB-10**: Score count-up with dramatic easing — slow start, accelerating middle, spring overshoot landing

### States & Accessibility

- [ ] **STAT-01**: Skeleton screen coverage for all async content — Dashboard, Study Guide, Settings, Hub tabs
- [ ] **STAT-02**: Empty state designs for zero-data screens — Dashboard, Hub History, Hub Achievements, SRS Deck
- [ ] **STAT-03**: Inline error recovery patterns — icon + message + retry button + fallback, bilingual
- [ ] **STAT-04**: Focus management on page transitions — focus first h1 or main content on route change
- [ ] **STAT-05**: Reduced motion CSS completeness — all CSS keyframes and transitions respect prefers-reduced-motion
- [ ] **STAT-06**: Screen reader live region announcements for confetti, badge earns, mastery milestones
- [ ] **STAT-07**: Modal/dialog focus trap and focus return to trigger on dismiss

### Content & About Page

- [x] **CONT-01**: All 28 USCIS 2025 questions receive validated explanation objects
- [x] **CONT-02**: Explanation quality audit across all 128 questions — consistent format and depth
- [x] **CONT-03**: About page with full narrative: app origin, mission statement, Volunteers in Asia history, Pre-Collegiate Program story
- [x] **CONT-04**: Bilingual dedication cards for Dwight D. Clark and Dorothy & James Guyot
- [x] **CONT-05**: About page accessible from Settings and/or navigation
- [x] **CONT-06**: About page renders in both English-only and bilingual modes

## Future Requirements

Deferred beyond v3.0. Tracked but not in current roadmap.

### Advanced Animation

- **ADVN-01**: Shared layout animations (cross-page layoutId morphing)
- **ADVN-02**: Swipe between bottom tabs (gesture conflicts with SwipeableCard)
- **ADVN-03**: CSS scroll-driven animations for scroll-linked progress bars

### Gamification

- **GAME-01**: Character mascot/avatar with Rive animations
- **GAME-02**: Gamified currency/shop system

### Visual Testing

- **TEST-01**: Playwright visual regression screenshot baselines (20-32 screenshots across themes x viewports)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full component library/Storybook | Overhead unjustified for solo/small team; static audit script is more actionable |
| @use-gesture/react | Redundant with motion/react v12 drag API already proven in 92 files |
| GSAP animation library | Imperative model conflicts with declarative React + motion/react approach |
| tsParticles | Overkill over existing canvas-confetti; massive bundle |
| Shared element transitions across routes | AnimatePresence mode="wait" breaks layoutId connections in hash routing |
| Character mascot | Requires Hobbes-level animation investment to not feel gimmicky |
| AI-powered adaptive features | ts-fsrs SRS IS the adaptive engine; offline-first constraint precludes API calls |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| VISC-01 | Phase 29 | Pending |
| VISC-02 | Phase 29 | Pending |
| VISC-03 | Phase 29 | Pending |
| VISC-04 | Phase 29 | Pending |
| VISC-05 | Phase 29 | Pending |
| VISC-06 | Phase 29 | Pending |
| VISC-07 | Phase 29 | Pending |
| MOBI-01 | Phase 30 | Complete |
| MOBI-02 | Phase 30 | Complete |
| MOBI-03 | Phase 30 | Complete |
| MOBI-04 | Phase 30 | Complete |
| MOBI-05 | Phase 30 | Complete |
| MOBI-06 | Phase 30 | Complete |
| ANIM-01 | Phase 31 | Complete |
| ANIM-02 | Phase 31 | Complete |
| ANIM-03 | Phase 31 | Complete |
| ANIM-04 | Phase 31 | Complete |
| ANIM-05 | Phase 31 | Complete |
| ANIM-06 | Phase 31 | Complete |
| CELB-01 | Phase 32 | Pending |
| CELB-02 | Phase 32 | Pending |
| CELB-03 | Phase 32 | Pending |
| CELB-04 | Phase 32 | Pending |
| CELB-05 | Phase 32 | Pending |
| CELB-06 | Phase 32 | Complete |
| CELB-07 | Phase 32 | Complete |
| CELB-08 | Phase 32 | Complete |
| CELB-09 | Phase 32 | Complete |
| CELB-10 | Phase 32 | Complete |
| STAT-01 | Phase 33 | Pending |
| STAT-02 | Phase 33 | Pending |
| STAT-03 | Phase 33 | Pending |
| STAT-04 | Phase 33 | Pending |
| STAT-05 | Phase 33 | Pending |
| STAT-06 | Phase 33 | Pending |
| STAT-07 | Phase 33 | Pending |
| CONT-01 | Phase 34 | Complete |
| CONT-02 | Phase 34 | Complete |
| CONT-03 | Phase 34 | Complete |
| CONT-04 | Phase 34 | Complete |
| CONT-05 | Phase 34 | Complete |
| CONT-06 | Phase 34 | Complete |

**Coverage:**
- v3.0 requirements: 39 total
- Mapped to phases: 39
- Unmapped: 0

---
*Requirements defined: 2026-02-19*
*Last updated: 2026-02-19 after roadmap creation*
