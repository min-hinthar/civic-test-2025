# Civic Test Prep 2025

## What This Is

A bilingual (English/Burmese) US Civics Test preparation app built as an installable PWA. Designed for Burmese immigrants studying for the naturalization civics test, with warm, encouraging UX that makes test prep feel approachable rather than intimidating. Both languages are displayed together throughout — Burmese-only users can navigate and use the entire app comfortably.

## Core Value

Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.

## Requirements

### Validated

- ✓ Email/password and Google OAuth authentication — existing
- ✓ Mock test with 20 random questions from 100+ civics questions — existing
- ✓ Timed test sessions (20 minutes) with pass/fail thresholds — existing
- ✓ Test history and results persistence to Supabase — existing
- ✓ Dashboard with accuracy metrics and category breakdown — existing
- ✓ Study guide with flashcard-style bilingual question/answer cards — existing
- ✓ Text-to-speech for question content (English and Burmese voices) — existing
- ✓ Bilingual question and answer content (English/Burmese) — existing
- ✓ Dark/light theme toggle — existing
- ✓ Password reset and recovery flow — existing
- ✓ Protected routes with auth guards — existing
- ✓ Navigation locking during active test sessions — existing

### Active

**UI/UX Polish:**
- [ ] Refine visual design — better spacing, typography, component polish (keep existing theme/colors/style)
- [ ] Mobile-first responsive layouts across all pages
- [ ] Smooth page transitions and micro-interactions
- [ ] Expand bilingual UI — all labels, buttons, navigation, messages in both English and Burmese displayed together
- [ ] PWA setup — installable, app manifest, service worker, offline support
- [ ] Improve navigation flow between pages

**Codebase Cleanup:**
- [ ] Fix biased shuffle algorithm (replace Math.random sort with Fisher-Yates)
- [ ] Fix race condition in test save (prevent duplicate submissions)
- [ ] Fix history.pushState memory leak in TestPage
- [ ] Replace `any` types with proper TypeScript interfaces
- [ ] Improve error handling and Sentry integration
- [ ] Performance optimization — lazy loading, memoization, pagination for test history

**New Features — Study Improvements:**
- [ ] Spaced repetition — track weak areas and prioritize them in future tests
- [ ] Category-focused practice tests (study by topic)
- [ ] Per-category progress tracking with visual indicators

**New Features — Content & Explanations:**
- [ ] Answer explanations — why each answer is correct, bilingual
- [ ] Study materials linked to questions after test completion

**New Features — Social/Community:**
- [ ] Leaderboards — compare scores with other users
- [ ] Score sharing — share test results
- [ ] Community study groups or forums

### Out of Scope

- Native mobile app (Capacitor/React Native wrapper) — PWA is sufficient for this milestone
- Real-time chat — high complexity, not core to test prep
- Video content — storage/bandwidth costs, unnecessary for civics test format
- Multi-language beyond English/Burmese — may expand later but not this milestone
- Paid subscription features — app stays free
- Admin panel — manage content directly in code/database for now

## Context

**Existing codebase:** Next.js 15 + React 19 + Supabase + React Router DOM (SPA inside Next.js catch-all route). Tailwind CSS for styling. Sentry for error tracking. Deployed on Vercel.

**Current state:** Core functionality works — auth, test-taking, study guide, dashboard, speech synthesis. The app needs visual polish, bug fixes, expanded bilingual coverage, and new learning features to feel app-store ready.

**User base:** Burmese immigrants preparing for the US naturalization civics test. Many users are more comfortable in Burmese than English. The app must feel warm and supportive — these users may be anxious about the test.

**Design direction:** Keep the existing theme, colors, and style. Polish and refine — don't redesign. Warm and encouraging feel. Both English and Burmese text displayed together (not a language toggle).

**Known technical debt:** Biased shuffle algorithm, race conditions in test save, history.pushState leak, loose TypeScript types, monolithic questions file, no test framework, incomplete Sentry integration. See `.planning/codebase/CONCERNS.md` for full audit.

## Constraints

- **Framework**: Next.js + React — no framework migration
- **Backend**: Supabase (PostgreSQL + Auth) — no backend migration
- **Budget**: Free tier services only — no paid additions
- **Platform**: PWA — installable web app, not native wrapper
- **Design**: Evolve existing theme/colors/style — not a rebrand
- **Languages**: English and Burmese displayed together — no language toggle

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PWA over native wrapper | Keeps deployment simple, avoids app store review process, free | — Pending |
| Keep React Router DOM inside Next.js | Rewriting routing is high risk for low reward this milestone | — Pending |
| Both languages always visible | Users shouldn't have to choose — seeing both builds confidence | — Pending |
| Polish existing design, not redesign | Users are familiar with current look; consistency matters | — Pending |
| Fix known bugs before adding features | Solid foundation prevents compounding issues | — Pending |

---
*Last updated: 2026-02-05 after initialization*
