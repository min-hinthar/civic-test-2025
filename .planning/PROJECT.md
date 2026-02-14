# Civic Test Prep 2025

## What This Is

A bilingual (English/Burmese) US Civics Test preparation app built as an installable PWA. Designed for Burmese immigrants studying for the naturalization civics test, with a premium iOS-inspired UI featuring glass-morphism, spring micro-interactions, and frosted dark mode. Both languages are displayed together throughout — Burmese-only users can navigate and use the entire app comfortably.

## Core Value

Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.

## Requirements

### Validated

- ✓ Email/password and Google OAuth authentication — existing
- ✓ Mock test with 20 random questions from 128 civics questions — existing
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
- ✓ Fisher-Yates shuffle for uniform question distribution — v1.0
- ✓ Async state machine for test saves (no duplicate submissions) — v1.0
- ✓ replaceState navigation lock (no history memory leak) — v1.0
- ✓ TypeScript strict mode with zero `any` types — v1.0
- ✓ Sentry error boundaries with PII stripping — v1.0
- ✓ Vitest testing infrastructure with CI pipeline — v1.0
- ✓ Questions modularized into 7 category files — v1.0
- ✓ PWA: installable, manifest, service worker, offline study — v1.0
- ✓ IndexedDB question caching and sync queue — v1.0
- ✓ Push notifications with configurable reminders — v1.0
- ✓ Complete bilingual UI (all labels, buttons, messages, toasts) — v1.0
- ✓ Motion spring animations and page transitions — v1.0
- ✓ Radix UI accessible primitives (Dialog, Toast, Progress) — v1.0
- ✓ Mobile-first responsive layouts with bottom tab bar — v1.0
- ✓ Anxiety-reducing design (gentle feedback, encouraging microcopy) — v1.0
- ✓ Answer explanations for all 100 questions — v1.0
- ✓ Per-category mastery tracking with visual progress rings — v1.0
- ✓ Category-focused practice mode with weak area emphasis — v1.0
- ✓ FSRS spaced repetition with Supabase sync — v1.0
- ✓ Interview simulation with TTS and realistic pacing — v1.0
- ✓ Study streaks, badges, and milestone celebrations — v1.0
- ✓ Score sharing with Canvas-rendered cards — v1.0
- ✓ Privacy-first leaderboard (opt-in, RLS) — v1.0
- ✓ Duolingo-inspired 3D buttons and sound effects — v1.0
- ✓ 7-step onboarding tour — v1.0
- ✓ Vertical skill tree progress visualization — v1.0
- ✓ Design tokens standardized (spacing 4px grid, typography scale, shadow levels) — v2.0
- ✓ Full 128-question USCIS 2025 bank with bilingual dynamic answers — v2.0
- ✓ Content Security Policy headers for all pages — v2.0
- ✓ Row Level Security audit with documented policies — v2.0
- ✓ XSS protection via React auto-escaping (no dangerouslySetInnerHTML) — v2.0
- ✓ Zero critical/high npm vulnerabilities — v2.0
- ✓ Unified 6-tab navigation (desktop sidebar + mobile bottom bar) — v2.0
- ✓ Badge indicators on nav tabs (SRS due, SW update) — v2.0
- ✓ Navigation lock during mock test/interview sessions — v2.0
- ✓ Spring tab-switch animations with active state indicators — v2.0
- ✓ Consistent 6-tab access to all features without More menu — v2.0
- ✓ NBA Dashboard: single contextual CTA with bilingual reasoning — v2.0
- ✓ Compact stat row (streak, mastery %, SRS due) — v2.0
- ✓ Progress Hub: 4-tab consolidated page (Overview/Categories/History/Achievements) — v2.0
- ✓ Old routes (/progress, /history, /social) redirect to Hub — v2.0
- ✓ Glass-morphism navigation and card surfaces — v2.0
- ✓ 44px minimum touch targets on all interactive elements — v2.0
- ✓ Micro-interactions (button press, tab switch, progress fill with springs) — v2.0
- ✓ Frosted dark mode with glass card variants and border glow — v2.0

### Active

No active requirements. Next milestone not yet defined.

### Out of Scope

- Native mobile app (Capacitor/React Native wrapper) — PWA is sufficient
- Real-time chat — high complexity, not core to test prep
- Video content — storage/bandwidth costs, unnecessary for civics test format
- AI chatbot tutor — expensive API costs, risk of incorrect answers
- Paid/premium tier — app stays free for immigrants
- Multi-language beyond English/Burmese — may expand later
- Full Liquid Glass component library — immature libraries, bundle size, browser compat
- Burmese translation crowd-editing — quality control nightmare, vandalism risk
- Supporting both 2008 and 2025 USCIS tests — 2008 test audience is diminishing

## Context

**Current state (post v2.0):** Premium bilingual PWA with 84 validated requirements across 2 milestones (v1.0 + v2.0). 42,205 LOC TypeScript across ~200 source files. 293+ tests passing, zero TS/ESLint errors.

**Tech stack:** Next.js 15.5 + React 19 + Supabase + React Router DOM (SPA inside Next.js catch-all route). Tailwind CSS with design token architecture (tokens.css → tailwind.config.js). motion/react for spring physics. Sentry for error tracking. Deployed on Vercel.

**Architecture:** Provider hierarchy: ErrorBoundary → Offline → Language → Theme → Toast → Auth → Social → SRS → State → Navigation → Router. IndexedDB for offline storage (7 stores), Supabase for cloud sync. CSP middleware with hash-based allowlisting. JWT-verified push API with rate limiting.

**User base:** Burmese immigrants preparing for the US naturalization civics test. Many users are more comfortable in Burmese than English. The app feels warm and supportive.

**Design direction:** iOS-inspired glass-morphism with 3 glass tiers (light/medium/heavy), prismatic animated borders, spring physics (BOUNCY/SNAPPY/GENTLE configs), and frosted dark mode with purple-tinted elevation hierarchy. Both English and Burmese text displayed together. 44px minimum touch targets.

## Constraints

- **Framework**: Next.js + React — no framework migration
- **Backend**: Supabase (PostgreSQL + Auth) — no backend migration
- **Budget**: Free tier services only — no paid additions
- **Platform**: PWA — installable web app, not native wrapper
- **Design**: iOS-inspired glass-morphism — evolve, don't rebrand
- **Languages**: English and Burmese displayed together — no language toggle
- **CSP**: Hash-based allowlisting (Pages Router on Vercel can't forward nonce headers)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PWA over native wrapper | Keeps deployment simple, avoids app store review | ✓ Validated — installable PWA on iOS/Android/desktop |
| React Router DOM inside Next.js | Rewriting routing is high risk for low reward | ✓ Validated — hash routing works, catch-all route serving SPA |
| Both languages always visible | Users shouldn't have to choose — seeing both builds confidence | ✓ Validated — BilingualText/Button/Heading throughout |
| FSRS over SM-2 for spaced repetition | Newer, more accurate, actively maintained | ✓ Validated — ts-fsrs integrated, 31 tests passing |
| Privacy-first social features | Immigrant users cautious about visibility | ✓ Validated — opt-in leaderboard, RLS, bilingual privacy notice |
| Canvas-only share cards | No external images avoids CORS issues in PWA | ✓ Validated — 1080x1080 bilingual cards render without server |
| IndexedDB primary, Supabase sync | Offline-first for unreliable connectivity | ✓ Validated — 7 stores, fire-and-forget sync |
| Two-tier design tokens (CSS vars → Tailwind) | Single source of truth, dark mode via variable swap | ✓ Validated — eliminated 3-way fragmentation |
| CSP hash-based (not nonce) | Pages Router on Vercel can't forward nonce headers to _document | ✓ Validated — hash allowlisting works in prod |
| NBA Dashboard over multi-widget | Users overwhelmed by 11 sections; single CTA is clearer | ✓ Validated — contextual recommendations based on user state |
| Progress Hub consolidation | 3 separate pages → 1 tabbed page reduces navigation | ✓ Validated — Overview/Categories/History/Achievements tabs |
| Glass-morphism tiers (light/medium/heavy) | Consistent visual hierarchy across all surfaces | ✓ Validated — 3 tiers with CSS custom properties |
| Spring physics library (motion/react) | Consistent micro-interaction feel across components | ✓ Validated — BOUNCY/SNAPPY/GENTLE configs shared app-wide |
| BRMSE deferred to v2.1+ | Translation trust features lower priority than UX polish | ⚠️ Revisit — community feedback may reprioritize |

## Milestones

| Version | Status | Date | Requirements |
|---------|--------|------|-------------|
| v1.0 | Complete | 2026-02-08 | 55/55 |
| v2.0 | Complete | 2026-02-13 | 29/29 |

---
*Last updated: 2026-02-13 after v2.0 milestone completion*
