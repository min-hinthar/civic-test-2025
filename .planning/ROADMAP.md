# Roadmap: Civic Test Prep 2025

## Overview

This roadmap tracks all development phases for the Civic Test Prep app. The v1.0 milestone shipped a full-featured bilingual PWA with 55 requirements across 10 phases. The v2.0 "Unified Learning Hub" milestone delivers a polished, premium experience with unified navigation, dashboard intelligence, consolidated progress tracking, updated USCIS 2025 question bank, iOS-inspired visual system, and security hardening.

## Completed Milestones

### v1.0 (2026-02-08)

10 phases, 72 plans, 55/55 requirements satisfied. See `.planning/milestones/v1.0/` for full archive.

**Phases delivered:**
1. Foundation & Code Quality (5 plans)
2. PWA & Offline (6 plans)
3. UI/UX & Bilingual Polish (10 plans)
4. Learning - Explanations & Category Progress (9 plans)
5. Spaced Repetition (9 plans)
6. Interview Simulation (6 plans)
7. Social Features (8 plans)
8. Critical Integration Fixes (3 plans)
9. UI Polish & Onboarding (12 plans)
10. Tech Debt Cleanup (4 plans)

## Phases

**Phase Numbering:**
- Phases 1-10: v1.0 (complete, archived)
- Phases 11-17: v2.0 Unified Learning Hub (active)
- Decimal phases (e.g., 12.1): Urgent insertions if needed

**v2.0 Phase Summary:**
- [ ] **Phase 11: Design Token Foundation** - Consolidate design tokens into single CSS variable source of truth
- [ ] **Phase 12: USCIS 2025 Question Bank** - Expand to full 128-question bank with updated thresholds
- [ ] **Phase 13: Security Hardening** - Authenticate push subscriptions, add CSP headers, audit RLS and dependencies
- [ ] **Phase 14: Unified Navigation** - Single 5-tab navigation structure across mobile and desktop
- [ ] **Phase 15: Progress Hub** - Consolidate progress, history, and achievements into one tabbed page
- [ ] **Phase 16: Dashboard Next Best Action** - Simplify dashboard to single contextual CTA with compact stats
- [ ] **Phase 17: UI System Polish** - Apply glass-morphism, micro-interactions, touch targets, and dark mode polish

## Phase Details

### Phase 11: Design Token Foundation
**Goal**: All visual styling flows from a single source of truth, eliminating the current three-way fragmentation between globals.css, tailwind.config.js, and design-tokens.ts
**Depends on**: Nothing (independent foundation work)
**Requirements**: UISYS-01
**Success Criteria** (what must be TRUE):
  1. All color, spacing, shadow, and border-radius values are defined as CSS custom properties in one file and consumed by Tailwind config
  2. Dark mode switches entirely via CSS variable values (no manual `.dark .bg-primary-500` overrides scattered across components)
  3. Typography uses a consistent scale (defined once, referenced everywhere) with no hardcoded font-size values outside the scale
**Plans**: TBD

Plans:
- [ ] 11-01: TBD

### Phase 12: USCIS 2025 Question Bank
**Goal**: Users study the complete, legally accurate USCIS 2025 civics test content with all 128 questions, correct category structure, and updated progress metrics
**Depends on**: Nothing (independent data work)
**Requirements**: USCIS-01, USCIS-02, USCIS-03, USCIS-04, USCIS-05
**Success Criteria** (what must be TRUE):
  1. User sees 128 questions in the study guide, organized into the official USCIS 2025 category structure (American Government, American History, Integrated Civics)
  2. Questions with dynamic answers (current president, senators, etc.) are clearly marked in code with comments explaining what to update and when
  3. App displays "Updated for USCIS 2025" indicator visible from the dashboard or study page
  4. All mastery percentages, readiness scores, badge thresholds, and "questions practiced" counters reflect a 128-question total (no user sees their mastery drop from expanding the bank)
  5. Mock test continues to draw 20 random questions with pass/fail thresholds aligned to the 128-question bank
**Plans**: TBD

Plans:
- [ ] 12-01: TBD

### Phase 13: Security Hardening
**Goal**: The app's API endpoints, client-side inputs, and dependency chain are hardened against known vulnerability classes
**Depends on**: Nothing (independent security work)
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04
**Success Criteria** (what must be TRUE):
  1. Push subscription API verifies the authenticated user's JWT before accepting or modifying subscriptions (no more trusting client-provided userId)
  2. Content Security Policy headers are configured and active for all pages, allowing only Supabase, Sentry, and PWA service worker origins
  3. All Supabase tables have Row Level Security policies reviewed and documented (no table allows unrestricted public access)
  4. Running `npm audit` shows zero critical or high severity vulnerabilities
**Plans**: TBD

Plans:
- [ ] 13-01: TBD

### Phase 14: Unified Navigation
**Goal**: Users see the same navigation structure everywhere -- 5 persistent tabs on mobile, matching sidebar on desktop -- with no hidden "More" menu
**Depends on**: Phase 11 (design tokens for consistent styling)
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05
**Success Criteria** (what must be TRUE):
  1. User sees exactly 5 tabs on mobile bottom bar and the same 5 sections in the desktop sidebar, with all primary features reachable in one tap
  2. Badge dots appear on relevant tabs showing SRS due count and unread notifications (counts update in real time)
  3. Tab switches animate smoothly with clear active state indicators (highlighted icon, label, or underline)
  4. Navigation is locked during an active mock test session (tabs are visually disabled, tapping them does nothing)
  5. The onboarding tour still functions correctly after navigation restructuring (all tour targets exist and are visible)
**Plans**: TBD

Plans:
- [ ] 14-01: TBD

### Phase 15: Progress Hub
**Goal**: Users find all their progress data -- overview, category mastery, test history, achievements, and leaderboard -- in one tabbed page instead of scattered across three separate pages
**Depends on**: Phase 14 (unified navigation defines the /hub route and tab)
**Requirements**: HUB-01, HUB-02, HUB-03, HUB-04, HUB-05
**Success Criteria** (what must be TRUE):
  1. User can switch between Overview, Categories, History, and Achievements tabs on a single Progress Hub page
  2. Overview tab shows readiness score, overall mastery percentage, current streak, and recent activity summary
  3. History tab displays the full test session timeline (identical content to the old /history page)
  4. Achievements tab shows the complete badge gallery and leaderboard (identical content to the old achievements/social pages)
  5. Visiting /progress, /history, or /social redirects to /hub with the correct tab pre-selected (no broken bookmarks or push notification links)
**Plans**: TBD

Plans:
- [ ] 15-01: TBD

### Phase 16: Dashboard Next Best Action
**Goal**: Users open the app to a clear, single recommendation of what to do next, instead of an overwhelming wall of 11 sections and 3 competing CTAs
**Depends on**: Phase 15 (dashboard links to Progress Hub for detailed views)
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05
**Success Criteria** (what must be TRUE):
  1. User sees one prominent "Next Best Action" card at the top of the dashboard with a single primary CTA button
  2. The NBA card changes recommendation based on user state: SRS reviews due, streak at risk, weak category needs practice, no recent test taken, high mastery (test readiness), or brand new user
  3. User sees bilingual (English + Burmese) reasoning text explaining why this action is recommended
  4. A compact stat summary row below the NBA card shows current streak, overall mastery percentage, and SRS due count
  5. Dashboard shows compact preview cards that link to the Progress Hub for detailed analytics (no duplicate full-size widgets)
**Plans**: TBD

Plans:
- [ ] 16-01: TBD

### Phase 17: UI System Polish
**Goal**: The entire app feels premium and iOS-inspired with consistent glass effects, responsive micro-interactions, proper touch targets, and polished dark mode
**Depends on**: Phase 16 (all layout and structural changes are stable; polish applies on top)
**Requirements**: UISYS-02, UISYS-03, UISYS-04, UISYS-05
**Success Criteria** (what must be TRUE):
  1. Navigation bars and card surfaces use glass-morphism (backdrop-blur with translucent backgrounds) in both light and dark mode
  2. All interactive elements (buttons, tabs, cards, toggles) meet a 44px minimum touch target size
  3. Primary actions have visible micro-interactions: button press scales, tab switches animate, progress bars fill with spring physics
  4. Dark mode uses frosted glass card variants with subtle border glow, distinct from simply inverting light mode colors
**Plans**: TBD

Plans:
- [ ] 17-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 11 > 12 > 13 > 14 > 15 > 16 > 17
(Phases 11, 12, 13 have no inter-dependencies and could run in any order, but sequential execution avoids context switching.)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 11. Design Token Foundation | v2.0 | 0/TBD | Not started | - |
| 12. USCIS 2025 Question Bank | v2.0 | 0/TBD | Not started | - |
| 13. Security Hardening | v2.0 | 0/TBD | Not started | - |
| 14. Unified Navigation | v2.0 | 0/TBD | Not started | - |
| 15. Progress Hub | v2.0 | 0/TBD | Not started | - |
| 16. Dashboard Next Best Action | v2.0 | 0/TBD | Not started | - |
| 17. UI System Polish | v2.0 | 0/TBD | Not started | - |

| Milestone | Phases | Plans | Requirements | Status |
|-----------|--------|-------|-------------|--------|
| v1.0 | 10 | 72 | 55/55 | Complete |
| v2.0 | 7 | TBD | 0/29 | In progress |

---

*Roadmap created: 2026-02-05*
*v2.0 phases added: 2026-02-09*
