# Milestones

## v3.0 World-Class UX (Shipped: 2026-02-22)

**Phases:** 29-38 (10 phases, 47 plans)
**Commits:** 196 | **Files:** 577 | **Lines:** +33,182 / -4,419
**Timeline:** 4 days (2026-02-19 → 2026-02-22)
**Requirements:** 39/39 satisfied (VISC, MOBI, ANIM, CELB, STAT, CONT)

**Key accomplishments:**
1. Enforced consistent visual language across all screens — 4px grid, locked typography scale, unified motion tokens, 44px touch targets
2. Built multi-sensory celebration system with queued confetti, DotLottie, Web Audio harmonics, haptics across 4 intensity tiers
3. Added native mobile feel — PWA overscroll guard, safe area insets, haptic feedback utility, swipe-to-dismiss toasts
4. Created reusable state pattern library — skeletons, empty states, error recovery with retry, screen reader announcements
5. Launched bilingual About page with dedication cards for Dwight D. Clark and Dorothy & James Guyot, share CTA, and 4 navigation entry points
6. Hardened codebase with 104-item security checklist, withRetry/safeAsync utilities, Sentry optimization, and 9-domain bug sweep

### Known Gaps
- **CELB-06**: DotLottie animation assets not sourced from marketplace (code complete, graceful degradation)
- **VISC-05**: Dark mode glass panel readability needs human visual QA
- **BRMSE-01**: Burmese translation naturalness needs native speaker assessment (carried from v2.1)

See `.planning/milestones/v3.0-ROADMAP.md` for full phase archive.

---

## v2.1 Quality & Polish (Shipped: 2026-02-19)

**Phases:** 18-28 (11 phases, 82 plans)
**Commits:** 315 | **Files:** 1,613 | **Lines:** +69,119 / -9,004
**Timeline:** 6 days (2026-02-14 → 2026-02-19)
**Requirements:** 65/66 satisfied + 1 partial (BRMSE-01 — human review needed)

**Key accomplishments:**
1. Duolingo-inspired test/practice UX with Check/Continue flow, feedback panels, segmented progress bar, haptics, and keyboard navigation
2. Chat-style interview simulation with Practice/Real modes, speech recognition, animated examiner, USCIS 2025 rules, audio pre-caching, and text input fallback
3. Comprehensive TTS system — shared ttsCore module, voice selection, speed control, 256 pre-generated Burmese MP3s, pause/resume
4. Flashcard sort mode with swipeable Know/Don't Know cards, multi-round drilling, and SRS batch integration
5. Session persistence via IndexedDB with resume prompts for interrupted mock tests, practice sessions, and flashcard sorts
6. WCAG 2.2 accessibility — screen reader support, focus management, reduced motion alternatives, per-question timer with extension, high contrast mode
7. Burmese translation audit — standardized glossary, natural phrasing across 503 font-myanmar usages, Noto Sans Myanmar integration

### Known Gaps
- **BRMSE-01**: All UI strings have Burmese translations and infrastructure is verified, but translation naturalness requires native Myanmar speaker assessment (cannot be programmatically verified)

See `.planning/milestones/v2.1-ROADMAP.md` for full phase archive.

---

## v2.0 Unified Learning Hub (Shipped: 2026-02-13)

**Phases:** 11-17 (7 phases, 47 plans)
**Commits:** 162 | **Files:** 277 | **Lines:** +32,484 / -8,444
**Timeline:** 5 days (2026-02-09 → 2026-02-13)
**Requirements:** 29/29 satisfied (NAV, DASH, HUB, UISYS, USCIS, SEC)

**Key accomplishments:**
1. Two-tier design token architecture (tokens.css → Tailwind) with dark mode FOUC prevention
2. Full 128-question USCIS 2025 bank with bilingual dynamic answers and state-aware content
3. Security hardening: CSP headers, JWT-verified push API, RLS audit, dependency pruning
4. Unified 6-tab navigation with glass-morphism, badge indicators, test lock, and onboarding tour
5. Consolidated Progress Hub (Overview/Categories/History/Achievements) replacing 3 separate pages
6. NBA-focused Dashboard with contextual single-CTA, bilingual reasoning, compact stat row
7. iOS-inspired UI polish: glass tiers, spring micro-interactions, 44px touch targets, frosted dark mode

See `.planning/milestones/v2.0-ROADMAP.md` for full phase archive.

---

## v1.0 MVP (Shipped: 2026-02-08)

**Phases:** 1-10 (10 phases, 72 plans)
**Requirements:** 55/55 satisfied

**Key accomplishments:**
1. Full bilingual (English/Burmese) PWA with offline support and push notifications
2. FSRS spaced repetition with Supabase cloud sync
3. Interview simulation with TTS and realistic pacing
4. Social features: streaks, badges, privacy-first leaderboard
5. Duolingo-inspired UI with 3D buttons, spring animations, 7-step onboarding

See `.planning/milestones/v1.0/` for full archive.

---
