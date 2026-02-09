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

### Active

No active requirements. Use `/gsd:new-milestone` to define v2 scope.

### Out of Scope

- Native mobile app (Capacitor/React Native wrapper) — PWA is sufficient
- Real-time chat — high complexity, not core to test prep
- Video content — storage/bandwidth costs, unnecessary for civics test format
- AI chatbot tutor — expensive API costs, risk of incorrect answers
- Paid/premium tier — app stays free for immigrants
- Multi-language beyond English/Burmese — may expand later

## Context

**Existing codebase:** Next.js 15 + React 19 + Supabase + React Router DOM (SPA inside Next.js catch-all route). Tailwind CSS for styling. Sentry for error tracking. Deployed on Vercel.

**Current state (post v1.0):** Full-featured bilingual PWA with 55 satisfied requirements across test-taking, study, spaced repetition, interview simulation, social features, and offline support. 247 tests passing, zero TypeScript/ESLint errors. Duolingo-inspired UI with 3D buttons, sound effects, and onboarding tour.

**User base:** Burmese immigrants preparing for the US naturalization civics test. Many users are more comfortable in Burmese than English. The app feels warm and supportive.

**Design direction:** Duolingo-inspired 3D chunky buttons, rounded cards (20px), spring physics animations, warm color palette. Both English and Burmese text displayed together (not a language toggle). Anxiety-reducing: gentle orange for errors, encouraging bilingual messages.

**Architecture:** 189 source files, ~37,500 LOC. Provider hierarchy: ErrorBoundary → Offline → Language → Theme → Toast → Auth → Social → SRS → Router. IndexedDB for offline storage (7 stores), Supabase for cloud sync.

## Constraints

- **Framework**: Next.js + React — no framework migration
- **Backend**: Supabase (PostgreSQL + Auth) — no backend migration
- **Budget**: Free tier services only — no paid additions
- **Platform**: PWA — installable web app, not native wrapper
- **Design**: Duolingo-inspired theme — evolve, don't rebrand
- **Languages**: English and Burmese displayed together — no language toggle

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PWA over native wrapper | Keeps deployment simple, avoids app store review process, free | Validated — installable PWA working on iOS/Android/desktop |
| Keep React Router DOM inside Next.js | Rewriting routing is high risk for low reward this milestone | Validated — hash routing works, catch-all route serving SPA |
| Both languages always visible | Users shouldn't have to choose — seeing both builds confidence | Validated — BilingualText/Button/Heading used throughout |
| Polish existing design, not redesign | Users are familiar with current look; consistency matters | Evolved — Duolingo-inspired overhaul in Phase 9 refined the original |
| Fix known bugs before adding features | Solid foundation prevents compounding issues | Validated — Phase 1 fixed 3 critical bugs before feature work |
| FSRS over SM-2 for spaced repetition | FSRS is newer, more accurate, actively maintained | Validated — ts-fsrs integrated, 31 tests passing |
| Privacy-first social features | Immigrant users may be cautious about visibility | Validated — opt-in leaderboard, RLS policies, bilingual privacy notice |
| Canvas-only share cards | No external images avoids CORS issues in PWA context | Validated — 1080x1080 bilingual cards render without server |
| IndexedDB as primary, Supabase as sync | Offline-first architecture for unreliable connectivity | Validated — 7 IndexedDB stores, fire-and-forget Supabase sync |

## Milestones

| Version | Status | Date | Requirements |
|---------|--------|------|-------------|
| v1.0 | Complete | 2026-02-08 | 55/55 satisfied |

---
*Last updated: 2026-02-08 after v1.0 milestone completion*
