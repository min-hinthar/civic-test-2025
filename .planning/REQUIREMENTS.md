# Requirements: Civic Test Prep 2025

**Defined:** 2026-02-05
**Core Value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.

## v1 Requirements (COMPLETE)

All 55 v1 requirements satisfied. See `.planning/milestones/v1.0/REQUIREMENTS.md` for full list.

**Summary:** 10 categories (FNDN, PWA, UIUX, BILN, ANXR, EXPL, CPRO, SRS, INTV, SOCL) -- 55/55 complete.

## v2.0 Requirements

Requirements for the Unified Learning Hub milestone. Each maps to roadmap phases.

### Navigation (NAV)

- [ ] **NAV-01**: User sees consistent 5-tab navigation on both mobile and desktop
- [ ] **NAV-02**: User sees badge dots on tabs showing SRS due count and unread notifications
- [ ] **NAV-03**: User can access all primary features without a "More" menu
- [ ] **NAV-04**: User experiences smooth tab-switch animations with active state indicators
- [ ] **NAV-05**: Navigation remains locked during active mock test sessions

### Dashboard (DASH)

- [ ] **DASH-01**: User sees a single "Next Best Action" card with contextual recommendation
- [ ] **DASH-02**: NBA card changes based on user state (SRS due, streak risk, weak category, no recent test, high mastery, new user)
- [ ] **DASH-03**: User sees bilingual reasoning explaining why the action is recommended
- [ ] **DASH-04**: User sees compact stat summary row (streak, mastery %, due reviews) below NBA card
- [ ] **DASH-05**: Dashboard shows compact previews linking to Progress Hub for detailed views

### Progress Hub (HUB)

- [ ] **HUB-01**: User sees all progress data in a single tabbed page (Overview, Categories, History, Achievements)
- [ ] **HUB-02**: Overview tab shows readiness score, overall mastery, streak, and recent activity
- [ ] **HUB-03**: History tab shows test session timeline (migrated from HistoryPage)
- [ ] **HUB-04**: Achievements tab shows full badge gallery and leaderboard
- [ ] **HUB-05**: Old /history and /progress routes redirect to Progress Hub with correct tab selected

### UI System (UISYS)

- [ ] **UISYS-01**: Design tokens standardized (spacing 4px grid, typography scale, shadow levels, border-radius)
- [ ] **UISYS-02**: Navigation chrome uses glass-morphism (backdrop-blur, translucent backgrounds)
- [ ] **UISYS-03**: All interactive elements meet 44px minimum touch target
- [ ] **UISYS-04**: Micro-interactions on all primary actions (button press, tab switch, progress fill)
- [ ] **UISYS-05**: Dark mode uses frosted glass variants

### USCIS 2025 (USCIS)

- [ ] **USCIS-01**: Question bank contains all 128 USCIS 2025 civics questions with bilingual content
- [ ] **USCIS-02**: Category structure aligns with USCIS 2025 organization (Gov/History/Integrated Civics)
- [ ] **USCIS-03**: Questions with dynamic answers (current officials) are clearly marked in code for manual updates
- [ ] **USCIS-04**: App displays "Updated for USCIS 2025" version indicator
- [ ] **USCIS-05**: All thresholds, mastery calculations, and badge criteria updated for 128-question total

### Security (SEC)

- [ ] **SEC-01**: Content Security Policy headers configured for Next.js + Supabase + PWA
- [ ] **SEC-02**: All Supabase tables have audited Row Level Security policies
- [ ] **SEC-03**: User-facing input fields are sanitized against XSS
- [ ] **SEC-04**: npm dependencies audited with no critical/high vulnerabilities

## v2.1+ Requirements (Deferred)

### Burmese Translation Trust (BRMSE)

- **BRMSE-01**: Translation quality indicator per question (verified/community/unverified)
- **BRMSE-02**: Community report mechanism for translation issues
- **BRMSE-03**: Translation changelog showing improvements

### Enhanced Audio

- **AUD-01**: Burmese TTS when browser voices available
- **AUD-02**: Fallback audio files for Burmese content when TTS unavailable

### Community

- **COMM-01**: Study groups - invite friends to study together
- **COMM-02**: Discussion forum per question
- **COMM-03**: User-generated study tips

### Additional Languages

- **LANG-01**: Support for additional Myanmar ethnic languages
- **LANG-02**: Language toggle option for users who prefer single-language view

### Admin

- **ADMN-01**: Admin panel for question management
- **ADMN-02**: Analytics dashboard for usage metrics

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app (Capacitor/RN) | PWA is sufficient |
| Real-time chat | High complexity, not core to test prep |
| Video content | Storage/bandwidth costs, unnecessary for civics format |
| AI chatbot tutor | Expensive API costs, risk of incorrect answers |
| Paid/premium tier | App stays free for immigrants |
| Full voice input recognition | Complex, privacy concerns |
| AI-generated questions | Legal test prep must use only official USCIS content |
| Full Liquid Glass component library | Immature libraries, bundle size, browser compat issues |
| Burmese translation crowd-editing | Quality control nightmare, vandalism risk |
| Supporting both 2008 and 2025 tests | 2008 test audience is diminishing |
| Hamburger menu / sidebar drawer | Hides navigation, bad for target audience |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | Phase 14 | Pending |
| NAV-02 | Phase 14 | Pending |
| NAV-03 | Phase 14 | Pending |
| NAV-04 | Phase 14 | Pending |
| NAV-05 | Phase 14 | Pending |
| DASH-01 | Phase 16 | Pending |
| DASH-02 | Phase 16 | Pending |
| DASH-03 | Phase 16 | Pending |
| DASH-04 | Phase 16 | Pending |
| DASH-05 | Phase 16 | Pending |
| HUB-01 | Phase 15 | Pending |
| HUB-02 | Phase 15 | Pending |
| HUB-03 | Phase 15 | Pending |
| HUB-04 | Phase 15 | Pending |
| HUB-05 | Phase 15 | Pending |
| UISYS-01 | Phase 11 | Pending |
| UISYS-02 | Phase 17 | Pending |
| UISYS-03 | Phase 17 | Pending |
| UISYS-04 | Phase 17 | Pending |
| UISYS-05 | Phase 17 | Pending |
| USCIS-01 | Phase 12 | Pending |
| USCIS-02 | Phase 12 | Pending |
| USCIS-03 | Phase 12 | Pending |
| USCIS-04 | Phase 12 | Pending |
| USCIS-05 | Phase 12 | Pending |
| SEC-01 | Phase 13 | Pending |
| SEC-02 | Phase 13 | Pending |
| SEC-03 | Phase 13 | Pending |
| SEC-04 | Phase 13 | Pending |

**Coverage:**
- v2.0 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0

---
*Requirements defined: 2026-02-05*
*Last updated: 2026-02-09 after v2.0 roadmap creation (all 29 requirements mapped)*
