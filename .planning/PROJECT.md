# Civic Test Prep 2025

## What This Is

A bilingual (English/Burmese) US Civics Test preparation app built as an installable PWA. Designed for Burmese immigrants studying for the naturalization civics test, featuring a premium iOS-inspired UI with glass-morphism and spring micro-interactions. Offers five study modes: timed mock tests, category practice, flashcard sorting, spaced repetition, and voice-driven interview simulation with Practice/Real USCIS modes. English mode shows English only; Myanmar mode shows bilingual content throughout. All 128 USCIS 2025 questions available with pre-generated Burmese audio.

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
- ✓ English-only / bilingual language mode toggle across all screens — v2.1
- ✓ Interview forces English-only regardless of global toggle — v2.1
- ✓ Mock test USCIS simulation message in English-only mode — v2.1
- ✓ TTS logic consolidated into shared ttsCore module — v2.1
- ✓ Session persistence with IndexedDB store and 24h expiry — v2.1
- ✓ Resume prompts for interrupted mock tests, practice, and flashcard sorts — v2.1
- ✓ Dashboard warning for unfinished sessions — v2.1
- ✓ Duolingo-style Check/Continue test/practice flow — v2.1
- ✓ Bottom feedback panel with correct answer display — v2.1
- ✓ Segmented progress bar with color-coded question segments — v2.1
- ✓ Full keyboard navigation for quiz flow — v2.1
- ✓ Haptic feedback on answer check — v2.1
- ✓ Streak/XP micro-reward animations — v2.1
- ✓ Chat-style interview with animated examiner and speech recognition — v2.1
- ✓ Interview Practice/Real modes with USCIS 2025 rules — v2.1
- ✓ Interview transcript with per-answer grading and confidence scores — v2.1
- ✓ Re-record up to 3 times before grading — v2.1
- ✓ Voice selection and speech rate control in Settings — v2.1
- ✓ TTS pause/resume and animated speaking indicator — v2.1
- ✓ 256 pre-generated Burmese MP3s via edge-tts — v2.1
- ✓ Flashcard sort mode (Know/Don't Know) with swipe gestures — v2.1
- ✓ Multi-round drilling of missed flashcards — v2.1
- ✓ SRS batch add from sort results — v2.1
- ✓ Sort session persistence with resume — v2.1
- ✓ Screen reader feedback announcements via aria-live — v2.1
- ✓ Focus management (feedback panel, next question) — v2.1
- ✓ Reduced motion alternatives (fade instead of slide/flip) — v2.1
- ✓ High contrast mode support — v2.1
- ✓ Per-question timer with WCAG 2.2.1 extension — v2.1
- ✓ Overall timer sr-only announcements at 5/2/1 min — v2.1
- ✓ Web Vitals reported to Sentry — v2.1
- ✓ eslint-plugin-jsx-a11y + vitest-axe integrated — v2.1
- ✓ Burmese glossary with consistent terminology — v2.1
- ✓ Noto Sans Myanmar font integration — v2.1
- ✓ 503 font-myanmar usages verified with showBurmese guards — v2.1
- ✓ Interview audio pre-caching with progress bar — v2.1
- ✓ TTS fallback with badge indication on pre-cache failure — v2.1
- ✓ Text input fallback for speech-unavailable browsers — v2.1
- ✓ Keyword highlighting in Practice feedback and results — v2.1
- ✓ Real mode: monochrome progress, hidden score, long-press exit — v2.1
- ✓ Practice mode: colored progress, keyword feedback, answer read-aloud — v2.1
- ✓ Back navigation interception during interview — v2.1
- ✓ Auto-pause on tab/app focus loss — v2.1
- ✓ Portrait orientation lock during interview — v2.1
- ✓ Network quality warning before interview start — v2.1

### Active

(No active milestone — ready for next planning cycle)

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
- Interview session persistence — simulates real USCIS conditions where you can't pause

## Context

**Current state (post v2.1):** Premium bilingual PWA with 149 validated requirements across 3 milestones (v1.0 + v2.0 + v2.1). 66,051 LOC TypeScript across ~250 source files. 315 commits in v2.1 alone. 9 IndexedDB stores. 256 pre-generated Burmese MP3 files.

**Tech stack:** Next.js 15.5 + React 19 + Supabase + React Router DOM (SPA inside Next.js catch-all route). Tailwind CSS with design token architecture (tokens.css → tailwind.config.js). motion/react for spring physics. Sentry for error tracking + Web Vitals. Deployed on Vercel.

**Architecture:** Provider hierarchy: ErrorBoundary → Language → Theme → TTS → Toast → Offline → Auth → Social → SRS → State → Navigation → Router. IndexedDB for offline storage (9 stores including sessions), Supabase for cloud sync. CSP middleware with hash-based allowlisting. JWT-verified push API with rate limiting.

**User base:** Burmese immigrants preparing for the US naturalization civics test. Many users are more comfortable in Burmese than English. The app feels warm and supportive.

**Design direction:** iOS-inspired glass-morphism with 3 glass tiers, prismatic animated borders, spring physics, and frosted dark mode. English mode = English only; Myanmar mode = bilingual. Duolingo-inspired Check/Continue flow for tests. Quizlet-inspired flashcard sorting. Chat-style interview simulation with speech recognition.

**Known issues:**
- BRMSE-01: Burmese translation naturalness needs native speaker assessment
- 28 USCIS 2025 questions missing explanation objects (data gap, not code bug)
- errorBoundary.test.tsx has 9 pre-existing test failures (localStorage mock issue, not production)

## Constraints

- **Framework**: Next.js + React — no framework migration
- **Backend**: Supabase (PostgreSQL + Auth) — no backend migration
- **Budget**: Free tier services only — no paid additions
- **Platform**: PWA — installable web app, not native wrapper
- **Design**: iOS-inspired glass-morphism — evolve, don't rebrand
- **Languages**: English mode = English only; Myanmar mode = bilingual (English + Burmese) except navbar
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
| IndexedDB primary, Supabase sync | Offline-first for unreliable connectivity | ✓ Validated — 9 stores, fire-and-forget sync |
| Two-tier design tokens (CSS vars → Tailwind) | Single source of truth, dark mode via variable swap | ✓ Validated — eliminated 3-way fragmentation |
| CSP hash-based (not nonce) | Pages Router on Vercel can't forward nonce headers to _document | ✓ Validated — hash allowlisting works in prod |
| NBA Dashboard over multi-widget | Users overwhelmed by 11 sections; single CTA is clearer | ✓ Validated — contextual recommendations based on user state |
| Progress Hub consolidation | 3 separate pages → 1 tabbed page reduces navigation | ✓ Validated — Overview/Categories/History/Achievements tabs |
| Glass-morphism tiers (light/medium/heavy) | Consistent visual hierarchy across all surfaces | ✓ Validated — 3 tiers with CSS custom properties |
| Spring physics library (motion/react) | Consistent micro-interaction feel across components | ✓ Validated — BOUNCY/SNAPPY/GENTLE configs shared app-wide |
| Language toggle = mode switch | English mode = English only; Myanmar mode = bilingual (except navbar) | ✓ Validated — 59 components updated, 503 font-myanmar usages |
| Duolingo + Quizlet UX inspiration | Best of both: Duolingo's playful feedback + Quizlet's card-based sorting | ✓ Validated — Check/Continue flow + swipeable sort mode |
| Shared ttsCore module | Eliminate duplicated voice logic across TTS contexts | ✓ Validated — single module, both hooks delegate to core |
| Pre-generated Burmese audio via edge-tts | No browser-native Myanmar TTS voices available | ✓ Validated — 256 MP3s, SW-cached, works offline |
| Session persistence in IndexedDB | Users lose progress on accidental close; localStorage too small | ✓ Validated — resume prompts for test/practice/sort with 24h expiry |
| Chat-style interview over form-based | More immersive, better simulates real USCIS interview experience | ✓ Validated — animated examiner, speech input, Practice/Real modes |
| Keyword-based answer grading | Flexible matching for civics answers with multiple valid phrasings | ✓ Validated — fuzzy matching with confidence scores |
| Audio pre-caching during countdown | Prevents audio delays during interview flow | ✓ Validated — progress bar, TTS fallback on failure |

## Milestones

| Version | Status | Date | Requirements |
|---------|--------|------|-------------|
| v1.0 | Complete | 2026-02-08 | 55/55 |
| v2.0 | Complete | 2026-02-13 | 29/29 |
| v2.1 | Complete | 2026-02-19 | 65/66 |

---
*Last updated: 2026-02-19 after v2.1 milestone completion*
