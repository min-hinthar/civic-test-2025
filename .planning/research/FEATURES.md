# Feature Research

**Domain:** Bilingual civics test prep PWA for immigrants
**Researched:** 2026-02-05
**Confidence:** MEDIUM-HIGH

## Context: What Already Exists

The app already has substantial table stakes covered:
- Authentication (Supabase)
- Mock tests (20 random questions from 100+ pool)
- Timed test sessions
- Test history with analytics
- Dashboard with category accuracy tracking
- Study guide with bilingual flashcards
- Text-to-speech for English content
- Bilingual display (English/Burmese shown together)
- Dark/light theme toggle

This research focuses on **features to ADD** for the next milestone.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist in test prep apps. The app already has many, but these gaps remain critical:

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Offline access** | Users may study during commute or in areas with poor connectivity; immigrants may have limited data plans | MEDIUM | PWA with service worker + IndexedDB caching. Critical for the target audience. |
| **Answer explanations** | Every major civics app (Citizen Now, Citizenry) provides "why" context, not just correct answers | MEDIUM | Add explanation field to question data; display on review. Context helps retention and reduces anxiety. |
| **Category progress tracking** | Dashboard shows accuracy but not completion/mastery by category | LOW | Already have category data in history; need visual progress bars and mastery indicators. |
| **Installable PWA** | App-store-ready polish means users expect to "install" it on home screen like a native app | LOW | Web manifest + service worker + install prompt. Already using Next.js, straightforward addition. |

### Differentiators (Competitive Advantage)

Features that set this app apart from Citizen Now, Citizenry, and other civics apps:

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **True bilingual display** | Most apps offer language switching, not side-by-side bilingual content. This app shows both simultaneously - powerful for learners bridging languages. | ALREADY EXISTS | Current strength. Enhance with better typography and reading experience. |
| **Spaced repetition for weak areas** | AI-powered review scheduling based on missed questions. Goes beyond "study all 100 questions" to personalized learning paths. | HIGH | Implement SM-2 or FSRS algorithm. Track per-question recall history. Schedule reviews based on forgetting curve. |
| **Anxiety-reducing design** | Target users are anxious about a high-stakes test. Encouraging tone, progress celebration, "you're ready" confidence indicators. | LOW-MEDIUM | Encouraging microcopy, celebration animations, readiness score, warm colors. Psychological safety in design. |
| **Interview simulation mode** | Citizenry has AI mock interviews. Simplified version: audio-only question playback simulating interview experience. | MEDIUM | Already have TTS. Add mode that plays questions aloud, waits for user response, then reveals answer. |
| **Burmese TTS** | Currently only English TTS. Burmese audio would help users verify pronunciation and understand content. | LOW-MEDIUM | Use Web Speech API with Burmese voice if available, or integrate third-party TTS service. |
| **Encouragement notifications** | Push notifications with study reminders and encouraging messages in both languages. | MEDIUM | PWA push notification API. Careful not to be annoying. Opt-in with culturally appropriate defaults. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for this specific user base:

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Social leaderboards** | Gamification drives engagement | Increases anxiety for already-stressed users; cultural sensitivity - not all immigrant communities value public competition | Private progress tracking, personal streaks, self-comparison over time |
| **AI chatbot tutor** | Trendy feature in 2025-2026 | Expensive to run on free tier; risk of incorrect answers for legal immigration questions; adds complexity | Curated explanations from authoritative sources (USCIS, Gilder Lehrman) |
| **Real-time multiplayer** | Engagement mechanism | Complex infrastructure; users study at different times/paces; adds latency requirements incompatible with offline-first | Async community features like study tip sharing |
| **Full AI mock interview** | Citizenry offers this | Expensive API costs, privacy concerns with voice recording, complexity for free tier constraint | Simpler interview simulation with TTS playback (no voice input) |
| **Gamification badges/achievements** | Common in language apps | Can feel patronizing to adult learners in high-stakes situation; focuses on vanity metrics over actual preparation | "Readiness indicators" showing confidence levels for test day |
| **Complex analytics dashboard** | Data is valued | Target users may find overwhelming; focus should be on "am I ready?" not on metrics | Simple readiness score with category breakdown |
| **Mandatory account creation** | Enables features | Barrier to entry for cautious immigrant users who may not want to share info | Allow anonymous study, encourage account for progress sync |
| **Payment/premium tier** | Revenue | Explicitly out of scope - free tier only. Creates barrier for users with limited resources | Completely free with optional donations |

---

## Feature Dependencies

```
[Offline Access]
    |
    +--requires--> [Service Worker Setup]
    |                   |
    |                   +--requires--> [Web Manifest] (for installable PWA)
    |
    +--requires--> [IndexedDB caching]
                        |
                        +--enhances--> [Spaced Repetition] (store scheduling data offline)

[Spaced Repetition]
    |
    +--requires--> [Per-question tracking] (already have per-session, need per-question)
    |
    +--enhances--> [Category Progress] (mastery feeds into scheduling)
    |
    +--enhances--> [Dashboard] (show scheduled reviews)

[Answer Explanations]
    |
    +--requires--> [Question data schema update]
    |
    +--enhances--> [Review Mode] (show explanations after test)
    |
    +--enhances--> [Study Guide] (show explanations on flashcard back)

[Interview Simulation]
    |
    +--requires--> [Existing TTS] (already built)
    |
    +--enhances--> [Mock Test] (new mode option)
    |
    +--optional--> [Burmese TTS] (adds bilingual simulation)

[Push Notifications]
    |
    +--requires--> [Service Worker] (shared with offline)
    |
    +--requires--> [User permission flow]
    |
    +--enhances--> [Spaced Repetition] (remind when reviews due)

[Anxiety-Reducing Design]
    |
    +--independent--> (can start anytime)
    |
    +--enhances--> [All user-facing features]
```

### Dependency Notes

- **Service Worker is foundational:** Required for both offline access and push notifications. Build this first.
- **Spaced repetition has most complexity:** Requires per-question tracking, scheduling algorithm, and UI for "due reviews."
- **Answer explanations are independent:** Can be added anytime; just content + display work.
- **Anxiety-reducing design is cross-cutting:** Should be applied to every feature, not a standalone task.

---

## MVP Definition (for this milestone)

### Launch With (v1)

Minimum viable addition set - what's needed to meaningfully improve the app:

- [x] **Offline PWA capability** - Essential for target audience with limited data; enables installability
- [x] **Answer explanations** - Every competitor has this; critical for learning retention
- [x] **Category progress visualization** - Dashboard has data but lacks clear mastery indicators
- [x] **Installable PWA with app manifest** - "App-store-ready polish" requirement

### Add After Validation (v1.x)

Features to add once core is working and user feedback confirms direction:

- [ ] **Spaced repetition** - High complexity; defer until simpler features validated
- [ ] **Interview simulation mode** - Builds on existing TTS; add after core UX validated
- [ ] **Push notification reminders** - Requires careful UX to not be intrusive
- [ ] **Enhanced bilingual typography** - Polish once functionality stable

### Future Consideration (v2+)

Features to defer until product-market fit established:

- [ ] **Burmese TTS** - Depends on voice availability; enhancement not core
- [ ] **Community features** - Only if users request; start with private study
- [ ] **Additional language support** - After Burmese is polished

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority | Rationale |
|---------|------------|---------------------|----------|-----------|
| Offline PWA | HIGH | MEDIUM | P1 | Critical for target audience; enables installability |
| Answer explanations | HIGH | MEDIUM | P1 | Every competitor has it; aids retention |
| Category progress | MEDIUM | LOW | P1 | Quick win; data already exists |
| Installable manifest | MEDIUM | LOW | P1 | Required for "app-store-ready" goal |
| Spaced repetition | HIGH | HIGH | P2 | Major differentiator but complex |
| Interview simulation | MEDIUM | MEDIUM | P2 | Unique value; builds on TTS |
| Anxiety-reducing UX | HIGH | LOW | P1 | Cross-cutting; improves all features |
| Push notifications | MEDIUM | MEDIUM | P2 | Needs service worker first |
| Burmese TTS | MEDIUM | MEDIUM | P3 | Enhancement; depends on voice availability |

**Priority key:**
- P1: Must have for this milestone (immediate focus)
- P2: Should have, add when P1 complete
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Citizen Now | Citizenry | Our Approach |
|---------|-------------|-----------|--------------|
| Question pool | 100 + 128 (2025) | 100 + 128 | Same official USCIS questions |
| Bilingual | Language switching | Language switching | **Side-by-side bilingual (differentiator)** |
| TTS | English audio | English audio | English TTS; Burmese planned |
| Mock interviews | No | AI video interviews (Pro) | Simpler audio-based simulation |
| Spaced repetition | Custom quiz from starred | Top 25 missed questions | Full SR algorithm planned |
| Explanations | None found | Tips for common mistakes | Add contextual explanations |
| Offline | Unknown | Unknown | **Full offline PWA (differentiator)** |
| Analytics | Streaks, stats | Mock interview analytics | Category mastery focus |
| Community | None | None | Defer - not clear value |
| Price | Freemium | Freemium (Pro for AI) | **Completely free (differentiator)** |
| Target language | Multi-language | English + Spanish | **Burmese focus (niche differentiator)** |

---

## Special Considerations for Target Audience

### Immigrant User Needs

Based on research on immigrant education apps and UX:

1. **Anxiety is the primary barrier** - Not lack of knowledge. Design should calm, not stress.
2. **Offline access is essential** - Limited data plans, studying during commute, unreliable connectivity.
3. **Both languages visible** - Don't force switching; show side-by-side for comprehension verification.
4. **Simple over comprehensive** - Avoid overwhelming dashboards; focus on "am I ready?"
5. **Privacy sensitivity** - Some users may be cautious about accounts; allow anonymous study.
6. **Encouragement over gamification** - Adult learners in high-stakes situations don't want to "play games."

### Burmese-Specific Considerations

1. **Font rendering** - Ensure Myanmar script renders properly across devices.
2. **Reading direction** - Burmese is left-to-right, same as English (no RTL concerns).
3. **Voice synthesis** - Web Speech API may not have Burmese voices on all devices; fallback plan needed.
4. **Cultural tone** - Warm, respectful encouragement; avoid overly casual Western app patterns.

---

## Recommended Feature Order

Based on dependencies, complexity, and user value:

### Phase 1: PWA Foundation + Quick Wins
1. Service worker + web manifest (enables offline + installability)
2. Answer explanations (content work + display)
3. Category progress visualization (UI work on existing data)
4. Anxiety-reducing microcopy pass (cross-cutting UX)

### Phase 2: Smart Learning
1. Spaced repetition system (algorithm + scheduling UI)
2. Push notification for reviews (builds on service worker)
3. Interview simulation mode (builds on TTS)

### Phase 3: Polish & Enhancement
1. Burmese TTS (if voices available)
2. Enhanced bilingual typography
3. Readiness confidence indicator

---

## Sources

### Civics Test Prep Apps
- [Citizen Now](https://citizennow.com/) - Study tool with flashcards, daily tests, CarPlay support
- [Citizenry on App Store](https://apps.apple.com/us/app/us-citizenship-test-2026-uscis/id6451455299) - AI mock interviews, top 25 missed questions
- [Civics Test Flash Cards 2026](https://apps.apple.com/us/app/civics-test-flash-cards-2026/id6751293471) - Basic flashcard app
- [USCIS Official Study Materials](https://www.uscis.gov/citizenship/find-study-materials-and-resources/study-for-the-test) - Authoritative source

### Spaced Repetition
- [FSRS on GitHub](https://github.com/open-spaced-repetition/awesome-fsrs) - Modern spaced repetition algorithm
- [Spaced Repetition App Guide 2025-2026](https://makeheadway.com/blog/spaced-repetition-app/) - Best practices
- [Brainscape Algorithm Comparison](https://www.brainscape.com/academy/comparing-spaced-repetition-algorithms/) - Algorithm options

### PWA Capabilities
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) - Official documentation
- [PWA Offline Guide](https://www.romexsoft.com/blog/what-is-pwa-progressive-web-apps-and-offline-capabilities/) - Implementation patterns

### Immigrant Education & UX
- [Phrase: Multilingual UX Design](https://phrase.com/blog/posts/how-to-create-good-ux-design-for-multiple-languages/) - Bilingual design patterns
- [USAHello FindHello](https://www.boundless.com/blog/best-apps-new-immigrants) - Immigrant-focused app design
- [Test Anxiety in Naturalization](https://cronkitenews.azpbs.org/2025/10/23/new-citizenship-test/) - Understanding user stress

### Learning Psychology
- [Learning Communities and Anxiety](https://www.nature.com/articles/s41599-023-02325-2) - Research on anxiety reduction
- [Self-Determination Theory](https://www.tandfonline.com/doi/full/10.1080/23735082.2025.2536502) - Motivation in learning

---
*Feature research for: Bilingual civics test prep PWA*
*Researched: 2026-02-05*
