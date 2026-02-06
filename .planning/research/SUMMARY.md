# Project Research Summary

**Project:** Bilingual PWA Civics Test Prep Enhancement
**Domain:** Immigrant education web app (civics test preparation)
**Researched:** 2026-02-05
**Confidence:** HIGH

## Executive Summary

This is a Next.js 15 + Supabase civics test prep app for Burmese-speaking immigrants preparing for US citizenship. The app already has core functionality (tests, history, bilingual flashcards, analytics) but needs PWA capabilities, offline support, and smarter learning features to compete with established apps like Citizen Now and Citizenry. The recommended approach is to build PWA foundation first (service worker, IndexedDB, installability), then layer spaced repetition for personalized learning, while maintaining the app's unique strength: true side-by-side bilingual display.

The critical architectural decision is choosing **offline-first with sync queue** over relying solely on Supabase. This requires Serwist for service worker management, idb-keyval for local persistence, and careful handling of iOS Safari's 7-day data eviction policy. The main risk is React Router + Next.js causing 404s on page refresh, which must be resolved before PWA deployment. Secondary risks include biased shuffle algorithm (currently broken), race conditions in test session saves, and Burmese font rendering failures on devices without proper Unicode support.

The roadmap should prioritize technical debt fixes (shuffle, save race condition, TypeScript strictness) before adding new features, as these foundational issues will compound with offline sync complexity. Follow with PWA infrastructure, then spaced repetition (the major differentiator), and defer social features until core learning experience is validated.

## Key Findings

### Recommended Stack

The existing stack (Next.js 15, React 19, Supabase, Tailwind) is solid and should not change. The research identifies specific additions needed for enhancement features:

**Core technologies:**
- **@serwist/next ^9.5.4**: Service worker integration — official Next.js recommendation, actively maintained Workbox fork, works with webpack in Next.js 15
- **idb-keyval ^6.2.1**: IndexedDB wrapper — tiny (600B), promise-based, perfect for offline persistence alongside Cache API
- **ts-fsrs ^4.x**: Spaced repetition engine — FSRS algorithm empirically outperforms SM-2, TypeScript-native, Open Spaced Repetition standard
- **motion ^12.x**: Animation library — formerly Framer Motion, 120fps hardware-accelerated, React 19 concurrent rendering compatible
- **@radix-ui/react-* ^1.x**: Accessible UI primitives — Shadcn/ui foundation, WCAG compliant, used by Vercel/Linear/Supabase
- **@tanstack/react-query ^5.x**: Data fetching/caching — better than raw Supabase hooks for social features, handles cache invalidation on realtime updates

**Critical stack decisions:**
- Do NOT use next-pwa (unmaintained since 2022, webpack conflicts)
- Do NOT use i18n libraries (app shows both languages simultaneously, no toggle needed)
- Do NOT use supabase-comments-extension (3 years old, deprecated dependencies)
- Build custom social features with Supabase tables + TanStack Query

**Version compatibility confirmed:** All recommendations work with React 19, Next.js 15, and Vercel + Supabase free tiers.

### Expected Features

Research on civics test apps (Citizen Now, Citizenry) and immigrant education UX reveals critical gaps and opportunities:

**Must have (table stakes):**
- **Offline access** — Users study during commute with limited data plans; immigrants often have unreliable connectivity
- **Answer explanations** — Every competitor provides "why" context, not just correct answers; essential for retention
- **Category progress tracking** — Dashboard has accuracy data but lacks visual mastery indicators
- **Installable PWA** — "App-store-ready" means users expect to install on home screen like native apps

**Should have (competitive advantage):**
- **True bilingual display** — Already exists and is the app's superpower; most competitors only offer language switching, not side-by-side
- **Spaced repetition for weak areas** — AI-powered review scheduling based on forgetting curve; differentiates from "study all 100 questions" approach
- **Anxiety-reducing design** — Target users are stressed about high-stakes test; encouraging tone, progress celebration, warm colors
- **Interview simulation mode** — Audio-only question playback simulating interview experience; simpler than Citizenry's expensive AI interviews

**Defer (v2+):**
- **Burmese TTS** — Enhancement, not core; depends on Web Speech API voice availability
- **Community features** — Only if users request; start with private study experience
- **Additional language support** — After Burmese is polished and validated

**Anti-features (avoid):**
- Social leaderboards — Increases anxiety for stressed users
- AI chatbot tutor — Expensive, risk of incorrect immigration answers
- Gamification badges — Can feel patronizing to adult learners in high-stakes situation
- Mandatory account creation — Barrier to cautious immigrant users

### Architecture Approach

The current architecture is a Next.js 15 SPA with catch-all Pages Router route delegating to client-side React Router DOM, Context API for state, and Supabase backend. This must evolve to offline-first with local database as source of truth.

**Major components:**

1. **Service Worker (Serwist)** — Asset precaching, API response caching (stale-while-revalidate), background sync queue processing
2. **IndexedDB Layer (idb)** — Local persistence with four stores: `questions` (100 cached), `srs_state` (per-user card data), `sync_queue` (pending mutations), `cache` (misc)
3. **Offline-First Data Flow** — All mutations write to IndexedDB first (immediate UI update), then queue for Supabase sync; local DB is source of truth
4. **SRS System (ts-fsrs)** — Spaced repetition scheduler with per-user per-question state; stores ease factor, interval, repetitions, next review date
5. **Context Providers** — AuthProvider (enhanced with offline caching), SRSProvider (spaced repetition state), OfflineProvider (sync management), SocialProvider (follow/leaderboard data)
6. **Supabase Backend** — Add `srs_cards` table (user_id, question_id, SM-2 state), `follows` table (social), `study_streaks` table (gamification), `achievements` table

**Key patterns:**
- Offline-first: IndexedDB write → UI update → sync queue → Supabase (when online)
- Service worker handles precaching + runtime caching + background sync
- SM-2 algorithm updates card state after each review (or use FSRS for better results)
- React Router in Next.js resolved via catch-all route (temporary) or migrate to App Router (recommended)

### Critical Pitfalls

Based on codebase analysis and domain research, these are the highest-priority issues:

1. **Biased shuffle algorithm** — Current `sort(() => Math.random() - 0.5)` produces non-uniform distribution; certain questions appear more frequently. Fix: Use Fisher-Yates shuffle. This breaks actual learning outcomes and must be fixed immediately.

2. **Race condition in test session save** — Sets `hasSavedSession = true` before async save completes; if save fails, users lose test results. Fix: Implement proper state machine (`idle` → `saving` → `saved` | `error`) with ref tracking. Critical data integrity issue.

3. **React Router + Next.js causes 404 on refresh** — Users bookmarking `/test` or `/dashboard` get 404 when they return. Fix: Catch-all route `pages/[[...slug]].tsx` as stopgap, or migrate to App Router for proper PWA integration. Blocks PWA deployment.

4. **iOS Safari purges data after 7 days** — IndexedDB and Cache API automatically cleared if PWA unused for 7 days. Fix: Request persistent storage, design for data loss, implement cloud sync as primary storage, prompt regular usage with notifications.

5. **Burmese font rendering failures** — Myanmar Unicode vs Zawgyi encoding incompatibility causes garbled text. Fix: Embed Noto Sans Myanmar font (don't rely on system fonts), use Unicode only, test on actual Myanmar devices.

6. **history.pushState memory leak** — Navigation lock calls `pushState` on every `popstate`, growing history stack unbounded. Fix: Use `replaceState` instead of `pushState` in the handler.

7. **PWA service worker caches stale content** — Without cache versioning, users see outdated questions after updates. Fix: Version cache names, implement stale-while-revalidate, notify users of updates.

8. **SM-2 treats all cards as equally difficult initially** — "Capital of US?" gets same schedule as "Name 13 colonies." Fix: Pre-seed difficulty ratings based on question complexity, or use FSRS which handles this better.

## Implications for Roadmap

Based on research findings, dependencies, and pitfalls, the recommended phase structure:

### Phase 1: Foundation & Technical Debt
**Rationale:** Critical bugs and architectural issues must be fixed before adding complexity. Biased shuffle and race condition affect data integrity; loose types will compound with offline sync.

**Delivers:**
- Correct Fisher-Yates shuffle implementation
- Proper async save state machine
- history.pushState → replaceState fix
- TypeScript strict mode enabled
- Questions split by category (maintainability)
- Test framework setup (Vitest + Playwright)

**Addresses:**
- Pitfall 1 (shuffle), 2 (save race), 3 (history leak), 9 (loose types), 10 (monolithic file), 11 (no tests)

**Avoids:**
- Adding offline sync on top of broken save logic
- Type errors proliferating through new code
- Regressions going unnoticed

**Research flag:** Standard patterns, well-documented fixes. Skip `/gsd:research-phase`.

---

### Phase 2: PWA Infrastructure
**Rationale:** Service worker and offline capabilities are foundational for all subsequent features. IndexedDB layer will be used by spaced repetition, social features, and sync queue.

**Delivers:**
- Serwist service worker setup
- Web manifest + PWA icons
- IndexedDB initialization (questions, sync_queue stores)
- Offline/online detection + sync queue manager
- Install prompt component
- Catch-all route fix for React Router (or App Router migration decision)
- iOS persistent storage request
- Cache versioning strategy

**Uses:**
- @serwist/next, idb-keyval, motion (for animations)

**Implements:**
- Service Worker component (ARCHITECTURE.md)
- IndexedDB Layer component (ARCHITECTURE.md)
- OfflineProvider (ARCHITECTURE.md)

**Addresses:**
- Features: Offline access, installable PWA (FEATURES.md table stakes)
- Pitfalls: 4 (iOS eviction), 3 (React Router 404s), 8 (cache staleness), 12 (Supabase free tier pause)

**Avoids:**
- Using next-pwa (unmaintained)
- Assuming Supabase handles offline
- Not requesting persistent storage on iOS

**Research flag:** Moderate complexity. Serwist is well-documented, but offline-first patterns may need targeted research during implementation. Consider `/gsd:research-phase` if team unfamiliar with service workers.

---

### Phase 3: Bilingual UX Polish
**Rationale:** Fix Burmese rendering before adding features that depend on it (TTS, explanations). This is foundational for the app's unique value proposition.

**Delivers:**
- Embedded Noto Sans Myanmar font
- Proper font fallback chain
- Answer explanations (bilingual)
- Enhanced bilingual typography
- Category progress visualization
- Anxiety-reducing design pass (microcopy, colors, animations)

**Uses:**
- @radix-ui/react-progress (progress bars)
- motion (celebration animations)

**Addresses:**
- Features: Answer explanations (table stakes), category progress (table stakes), anxiety-reducing design (differentiator)
- Pitfall: 6 (font rendering), 14 (anxiety UX), 15 (language switcher)

**Avoids:**
- Relying on system fonts
- Using flags for language selection
- Harsh/competitive UX patterns

**Research flag:** Standard patterns for most parts. Font embedding is well-documented. Skip `/gsd:research-phase`.

---

### Phase 4: Spaced Repetition System
**Rationale:** This is the major differentiator from competitors. Depends on IndexedDB layer (Phase 2) and proper save logic (Phase 1). Complex algorithm implementation requires dedicated focus.

**Delivers:**
- Supabase `srs_cards` table with RLS
- ts-fsrs integration (or SM-2 if preferred)
- SRS IndexedDB operations
- SRSProvider context
- Study mode with "due cards" scheduling
- Pre-seeded difficulty ratings for questions
- Dashboard showing scheduled reviews

**Uses:**
- ts-fsrs, @tanstack/react-query (for cache invalidation)

**Implements:**
- SRS System component (ARCHITECTURE.md)
- SRSProvider (ARCHITECTURE.md)

**Addresses:**
- Features: Spaced repetition (major differentiator)
- Pitfall: 7 (initial difficulty calibration)

**Avoids:**
- Using SM-2 without difficulty pre-seeding
- Syncing on every mutation (use offline-first pattern)

**Research flag:** HIGH PRIORITY for `/gsd:research-phase`. FSRS algorithm is well-documented, but integrating with offline sync and handling edge cases (overdue reviews, conflict resolution) needs careful planning. Research during phase planning recommended.

---

### Phase 5: Interview Simulation & Push Notifications
**Rationale:** Builds on existing TTS and service worker infrastructure. Interview mode differentiates from basic flashcard apps; push notifications encourage regular practice (resets iOS 7-day eviction timer).

**Delivers:**
- Interview simulation mode (audio-only questions)
- Push notification permission flow
- Supabase Edge Function for push (web-push library)
- Study reminder notifications (bilingual)
- Encouragement notifications

**Uses:**
- web-push (server-side), existing TTS

**Addresses:**
- Features: Interview simulation (differentiator), encouragement notifications (differentiator)

**Avoids:**
- Full AI mock interview (too expensive)
- Annoying notification patterns
- Voice input (complexity, privacy)

**Research flag:** Moderate. Push notifications are well-documented, but notification UX for immigrant users may need cultural research. Consider targeted research on notification patterns for anxiety-prone users.

---

### Phase 6: Social Features (Optional)
**Rationale:** Defer until core learning experience validated. Only implement if user research shows demand for community features. Can be built independently of other phases.

**Delivers:**
- Supabase tables: `follows`, `study_streaks`, `achievements`
- SocialProvider context
- Leaderboard page (opt-in only)
- Follow/unfollow UI
- Achievement notifications (non-intrusive)
- Privacy controls (anonymous mode)

**Uses:**
- @tanstack/react-query, Supabase Realtime (optional)

**Implements:**
- SocialProvider (ARCHITECTURE.md)
- Social Feature Schema (ARCHITECTURE.md)

**Addresses:**
- Features: (deferred to v2+ per FEATURES.md)
- Pitfall: 13 (privacy concerns)

**Avoids:**
- Public leaderboards by default
- Competitive/stressful gamification
- Exposing user activity without consent

**Research flag:** Low priority. Standard social feature patterns. If implemented, skip `/gsd:research-phase` unless unusual cultural considerations arise.

---

### Phase Ordering Rationale

1. **Foundation first (Phase 1)** — Broken shuffle and race conditions will corrupt spaced repetition data; must fix before adding complexity
2. **PWA infrastructure (Phase 2)** — Service worker and IndexedDB are dependencies for Phases 4-6; build once, use everywhere
3. **Bilingual polish (Phase 3)** — Font rendering must work before explanations and TTS features; low complexity, high user impact
4. **Spaced repetition (Phase 4)** — Highest complexity, highest value; requires Phases 1-2 complete
5. **Interview + notifications (Phase 5)** — Builds on existing tech (TTS, service worker); can overlap with Phase 4 if resources allow
6. **Social (Phase 6)** — Optional, independent, deferred until product-market fit validated

**Critical path:** Phase 1 → Phase 2 → Phase 4 (these must be sequential)
**Parallel opportunities:** Phase 3 can overlap with Phase 2; Phase 5 can overlap with Phase 4 once service worker is stable

### Research Flags

**Needs `/gsd:research-phase` during planning:**
- **Phase 4 (Spaced Repetition)** — Complex algorithm integration; offline sync conflicts; overdue review handling; FSRS vs SM-2 trade-offs need deep dive
- **Phase 2 (PWA Infrastructure)** — IF team unfamiliar with service workers; otherwise standard patterns sufficient
- **Phase 5 (Notifications)** — IF cultural research needed on notification UX for immigrant users

**Standard patterns (skip `/gsd:research-phase`):**
- **Phase 1 (Foundation)** — Shuffle, async state, TypeScript strictness are well-documented patterns
- **Phase 3 (Bilingual UX)** — Font embedding, Radix UI, answer explanations are straightforward
- **Phase 6 (Social)** — Standard Supabase patterns, only needed if feature is approved

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations from official docs or verified open-source projects; versions confirmed compatible |
| Features | MEDIUM-HIGH | Based on competitor analysis (Citizen Now, Citizenry) and immigrant education UX research; user testing needed to validate priorities |
| Architecture | HIGH | Patterns verified through LogRocket, RxDB, Serwist official docs; offline-first is well-understood domain |
| Pitfalls | HIGH | Mix of codebase analysis (shuffle, race condition verified in code) and domain research (iOS eviction, font rendering, React Router 404s all documented) |

**Overall confidence:** HIGH

The stack, architecture, and pitfalls are backed by authoritative sources. Feature priorities have medium-high confidence because they're based on competitor analysis and user research, but should be validated with actual Burmese immigrant users during MVP testing.

### Gaps to Address

**Gap 1: User testing with Burmese immigrants**
- Research assumes anxiety-reducing design and bilingual UX priorities based on general immigrant education literature
- Validation needed: Do Burmese users actually prefer side-by-side display? Is warmth vs efficiency the right tone?
- **How to handle:** Include user testing in Phase 3 (Bilingual UX) before finalizing design patterns

**Gap 2: FSRS vs SM-2 performance comparison**
- Research recommends ts-fsrs over SM-2 based on academic literature, but not tested in civics context
- Validation needed: Does FSRS actually improve pass rates vs simpler SM-2 for 100-question pool?
- **How to handle:** Phase 4 planning should include A/B test design; consider starting with SM-2 (simpler) with migration path to FSRS

**Gap 3: iOS persistent storage grant rate**
- iOS Safari may deny persistent storage request; unclear how often users grant permission
- Validation needed: What percentage of users grant persistent storage? What's the fallback UX?
- **How to handle:** Phase 2 should include telemetry for grant rate; design "data may be cleared" notice for denied requests

**Gap 4: Supabase free tier scaling**
- Research assumes free tier sufficient, but realtime + edge functions may hit limits faster than expected
- Validation needed: What's the actual load at 100 users? 500 users?
- **How to handle:** Phase 2 (infrastructure) should include monitoring dashboard for Supabase quota usage

**Gap 5: Burmese TTS voice availability**
- Research defers Burmese TTS to v2+, but may be critical for some users
- Validation needed: How many target devices actually have Myanmar voices in Web Speech API?
- **How to handle:** Phase 3 should test voice availability across devices; if <50% have support, use third-party TTS service

## Sources

### Primary (HIGH confidence)
- Next.js PWA Guide (official docs) — PWA setup, Serwist recommendation
- Serwist Documentation — Service worker integration patterns
- ts-fsrs GitHub — Spaced repetition algorithm
- Supabase Documentation — Auth, Realtime, RLS policies
- Motion (Framer Motion) Docs — Animation API
- Radix UI Primitives — Accessible component patterns
- MDN Web Docs — Service Worker, IndexedDB, Web Speech API, History API
- Myanmar Unicode Guide for Web Developers — Font rendering, encoding

### Secondary (MEDIUM confidence)
- LogRocket: Offline-first frontend apps 2025 — IndexedDB patterns
- RxDB Supabase Replication — Sync architecture reference
- Citizen Now, Citizenry (competitor apps) — Feature analysis
- USCIS Official Study Materials — Authoritative civics content
- Phrase: Multilingual UX Design — Bilingual design patterns
- Localization Lab: Burmese Font Issues — Real-world Myanmar text challenges
- Building PWAs with Serwist (JavaScript Plainenglish) — Implementation examples

### Tertiary (LOW confidence)
- Metacto: True Cost of Supabase — Free tier limits (validate with actual usage)
- SystemDesign.one: Leaderboard System — Architecture reference (if social features needed)

---

*Research completed: 2026-02-05*
*Ready for roadmap: yes*
