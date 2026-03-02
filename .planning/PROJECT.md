# Civic Test Prep 2025

## What This Is

A bilingual (English/Burmese) US Civics Test preparation app built as an installable PWA on Next.js 16 App Router. Designed for Burmese immigrants studying for the naturalization civics test, featuring a premium iOS-inspired UI with glass-morphism, spring micro-interactions, and multi-sensory celebration choreography. Offers five study modes: timed mock tests, category practice, flashcard sorting, spaced repetition, and voice-driven interview simulation with Practice/Real USCIS modes. Includes test readiness scoring with weak-area drilling, adaptive daily study plans, content enrichment (mnemonics, fun facts, citations), and cross-device sync via Supabase. English mode shows English only; Myanmar mode shows bilingual content throughout. All 128 USCIS 2025 questions available with bilingual explanations and pre-generated Burmese audio.

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
- ✓ 4px spacing grid enforced across all screens — v3.0
- ✓ Typography scale locked to 6 sizes across all screens — v3.0
- ✓ Border radius rules enforced per component type — v3.0
- ✓ Touch targets 44x44px on all interactive elements (re-audited) — v3.0
- ✓ Dark mode glass panel contrast, shadow depth, text readability tuned — v3.0
- ✓ Motion tokens unified between CSS and motion/react — v3.0
- ✓ Micro-interactions on every interactive element with spring physics — v3.0
- ✓ PWA overscroll-behavior: none prevents rubber-band white flash — v3.0
- ✓ Safe area inset handling for iPhone Dynamic Island — v3.0
- ✓ user-select: none on interactive elements prevents accidental selection — v3.0
- ✓ Swipe-to-dismiss toast notifications with motion/react drag — v3.0
- ✓ Haptic feedback utility with named patterns (tap, success, error, milestone) — v3.0
- ✓ Haptics integrated into FeedbackPanel, StreakReward, badges, 3D buttons — v3.0
- ✓ 3-tier button press feedback (3D chunky, scale, opacity) — v3.0
- ✓ StaggeredList with adaptive timing that scales to list length — v3.0
- ✓ Exit animations on all overlays (fade + scale) — v3.0
- ✓ Consistent card enter animations (scale + fade) — v3.0
- ✓ Glass-morphism 3-tier system correctly applied per component — v3.0
- ✓ useCelebration hook + CelebrationOverlay with DOM CustomEvents — v3.0
- ✓ Achievement-scaled confetti (sparkle → burst → celebration → ultimate) — v3.0
- ✓ Multi-stage TestResultsScreen choreography — v3.0
- ✓ DotLottie celebration animations lazy-loaded — v3.0
- ✓ Sound harmonics warming for richer celebration audio — v3.0
- ✓ XP counter with spring pulse animation — v3.0
- ✓ Score count-up with dramatic easing — v3.0
- ✓ Skeleton screens for all async content — v3.0
- ✓ Empty state designs for zero-data screens — v3.0
- ✓ Inline error recovery with retry button and fallback — v3.0
- ✓ Focus management on page transitions — v3.0
- ✓ Reduced motion CSS completeness for all keyframes — v3.0
- ✓ Screen reader live region announcements for celebrations — v3.0
- ✓ Modal/dialog focus trap and focus return — v3.0
- ✓ All 128 USCIS questions have explanation objects — v3.0
- ✓ Explanation quality audit — consistent format across all 128 — v3.0
- ✓ About page with origin story, VIA history, Pre-Collegiate Program — v3.0
- ✓ Bilingual dedication cards for Clark and Guyot families — v3.0
- ✓ About page accessible from Settings and navigation — v3.0
- ✓ About page bilingual rendering — v3.0
- ✓ withRetry/safeAsync async utilities with exponential backoff — v3.0
- ✓ 104-item security checklist (93 pass, 5 fixed, 5 acceptable risk) — v3.0
- ✓ Sentry DSN from environment variables, fingerprinting, reduced sampling — v3.0
- ✓ Bookmark persistence with dedicated IndexedDB store — v3.0
- ✓ Review Deck with clickable cards, progress filters, due badges — v3.0
- ✓ Flashcard chip row + toolbar replacing dropdown — v3.0
- ✓ Flashcard auto-play study mode with isolated TTS — v3.0

- ✓ Next.js 16 App Router with file-based routing (react-router-dom removed) — v4.0
- ✓ Nonce-based CSP replacing hash-based allowlisting — v4.0
- ✓ Test readiness score (0-100%) with per-dimension breakdown — v4.0
- ✓ Weak-area drill mode with pre/post mastery delta — v4.0
- ✓ Test date countdown with adaptive daily study targets — v4.0
- ✓ Mnemonics, fun facts, common mistakes, citations for all 128 questions — v4.0
- ✓ Study tips per category and related question links — v4.0
- ✓ Cross-device sync for settings, bookmarks, streaks, and answer history — v4.0
- ✓ Dynamic imports and bundle optimization with documented before/after — v4.0

### Active

(No active milestone — use `/gsd:new-milestone` to start next)

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
- Shared layout animations (cross-page layoutId morphing) — AnimatePresence breaks with hash routing
- Swipe between bottom tabs — gesture conflicts with SwipeableCard
- CSS scroll-driven animations — limited browser support
- Character mascot/avatar with Rive — requires Hobbes-level animation investment
- Gamified currency/shop system — scope creep, not core to test prep
- Playwright visual regression baselines — maintenance burden for solo dev

## Context

**Current state (post v4.0):** Premium bilingual PWA with 226 validated requirements across 5 milestones (v1.0 + v2.0 + v2.1 + v3.0 + v4.0). 78,281 LOC TypeScript across ~300 source files. 48 phases, 278 plans executed. Deployed at https://civic-test-2025.vercel.app/

**Tech stack:** Next.js 16 (App Router) + React 19 + TypeScript 5.9 + Supabase (Auth + Postgres + RLS). Tailwind CSS 3 with design token architecture (tokens.css → tailwind.config.js). motion/react for spring physics. Sentry for error tracking + Web Vitals. @serwist/next for PWA. ts-fsrs for spaced repetition. Deployed on Vercel.

**Architecture:** App Router with file-based routing (15+ routes). Provider hierarchy: ErrorBoundary → Language → Theme → TTS → Toast → Offline → Auth → Social → SRS → State → Navigation. IndexedDB for offline storage (10 stores including sessions + bookmarks), Supabase for cloud sync (answer history, bookmarks, settings, streaks). Nonce-based CSP via proxy.ts with strict-dynamic. JWT-verified push API with rate limiting. withRetry/safeAsync async utilities for transient failure recovery.

**User base:** Burmese immigrants preparing for the US naturalization civics test. Many users are more comfortable in Burmese than English. The app feels warm and supportive.

**Design direction:** iOS-inspired glass-morphism with 3 glass tiers, prismatic animated borders, spring physics, and frosted dark mode. Multi-sensory celebration system with confetti, DotLottie, Web Audio, and haptics. English mode = English only; Myanmar mode = bilingual. Duolingo-inspired Check/Continue flow for tests. Quizlet-inspired flashcard sorting. Chat-style interview simulation with speech recognition.

**Known issues:**
- BRMSE-01: Burmese translation naturalness needs native speaker assessment
- CELB-06: DotLottie animation assets not sourced (code complete, graceful degradation)
- VISC-05: Dark mode glass panel readability needs human visual QA

## Constraints

- **Framework**: Next.js + React — no framework migration
- **Backend**: Supabase (PostgreSQL + Auth) — no backend migration
- **Budget**: Free tier services only — no paid additions
- **Platform**: PWA — installable web app, not native wrapper
- **Design**: iOS-inspired glass-morphism — evolve, don't rebrand
- **Languages**: English mode = English only; Myanmar mode = bilingual (English + Burmese) except navbar
- **CSP**: Nonce-based allowlisting with strict-dynamic via proxy.ts

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PWA over native wrapper | Keeps deployment simple, avoids app store review | ✓ Validated — installable PWA on iOS/Android/desktop |
| App Router file-based routing | react-router-dom removed in v4.0; clean URLs, native Next.js routing | ✓ Validated — 15+ routes migrated, zero hash routing |
| Both languages always visible | Users shouldn't have to choose — seeing both builds confidence | ✓ Validated — BilingualText/Button/Heading throughout |
| FSRS over SM-2 for spaced repetition | Newer, more accurate, actively maintained | ✓ Validated — ts-fsrs integrated, 31 tests passing |
| Privacy-first social features | Immigrant users cautious about visibility | ✓ Validated — opt-in leaderboard, RLS, bilingual privacy notice |
| Canvas-only share cards | No external images avoids CORS issues in PWA | ✓ Validated — 1080x1080 bilingual cards render without server |
| IndexedDB primary, Supabase sync | Offline-first for unreliable connectivity | ✓ Validated — 10 stores, fire-and-forget sync |
| Two-tier design tokens (CSS vars → Tailwind) | Single source of truth, dark mode via variable swap | ✓ Validated — eliminated 3-way fragmentation |
| CSP nonce-based with strict-dynamic | App Router proxy.ts generates per-request nonces | ✓ Validated — nonce CSP works in prod, replaces hash-based |
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
| DOM CustomEvents for celebrations | No new Context provider needed; singleton overlay | ✓ Validated — useCelebration dispatches, CelebrationOverlay listens |
| withRetry for transient failures | Exponential backoff prevents cascade failures on network hiccups | ✓ Validated — 14 production call sites, auth/quota errors throw immediately |
| Sentry DSN in env var | Per-environment config, rotation without code changes | ✓ Validated — NEXT_PUBLIC_SENTRY_DSN across all config files |
| Local-only bookmarks (no Supabase sync) | Simplicity over sync for optional feature | ⚠️ Revisit — v4.0 added cross-device bookmark sync via Supabase |
| All-at-once route migration | Mixed Pages/App Router causes hard navigations destroying provider state | ✓ Validated — 15+ routes migrated in one phase, zero regressions |
| Webpack over Turbopack for builds | Sentry + Serwist plugin chain incompatible with Turbopack | ✓ Validated — `--webpack` flag works reliably |
| Readiness score 60% cap on zero-coverage | Prevents inflated scores when categories unstudied | ✓ Validated — uses 3 main USCIS categories |
| Cross-device sync via individual columns | Not JSONB — matches project pattern for type safety | ✓ Validated — separate user_settings + user_bookmarks tables |
| Visibility-based sync re-pull | 5s throttle prevents rapid-fire from quick tab switches | ✓ Validated — useVisibilitySync with SocialContext trigger |

## Milestones

| Version | Status | Date | Requirements |
|---------|--------|------|-------------|
| v1.0 | Complete | 2026-02-08 | 55/55 |
| v2.0 | Complete | 2026-02-13 | 29/29 |
| v2.1 | Complete | 2026-02-19 | 65/66 |
| v3.0 | Complete | 2026-02-22 | 39/39 |
| v4.0 | Complete | 2026-03-02 | 38/38 |

---
*Last updated: 2026-03-02 after v4.0 milestone completed*
