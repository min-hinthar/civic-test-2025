# Project Research Summary

**Project:** Civic Test Prep 2025 - v2.1 Quality & Polish Milestone
**Domain:** Bilingual civics test prep PWA enhancement (UX overhaul, TTS quality, accessibility, session persistence)
**Researched:** 2026-02-13
**Confidence:** HIGH

## Executive Summary

v2.1 is a UX and quality refinement milestone focused on modernizing the test/practice experience to match 2026 industry standards (Duolingo-style interaction patterns), improving TTS accessibility for English audio, adding session persistence so users can resume interrupted sessions, and implementing a consistent language mode toggle that controls content visibility across the entire app. Unlike v2.0 which added new features (hub, dashboard, interview), v2.1 refines the foundational learning experience that 100% of users interact with.

The recommended approach prioritizes consistency over novelty. The research reveals this is NOT a greenfield project—it's a surgical enhancement of a mature 40K+ LOC codebase with established patterns (8 IndexedDB stores, 59+ components consuming language context, React Compiler ESLint rules, motion/react animations). The highest-impact changes are: (1) replacing auto-advance with explicit Check/Continue flow (eliminates #1 UX complaint), (2) unifying language mode semantics across 171 conditional render points (fixes inconsistent bilingual behavior), (3) adding session persistence with resume prompts (prevents progress loss), and (4) consolidating duplicated TTS logic before adding quality improvements.

Key risks center on cross-cutting concerns: language mode changes touch 48 files with 171 conditional render points, session persistence must handle schema evolution and stale data, TTS improvements must not break the fragile interview phase state machine, and accessibility retrofitting must coordinate with existing spring animations. The mitigation strategy is atomic migration—complete each cross-cutting change in a single phase, not incrementally. Half-migrated language mode behavior or partial TTS consolidation is worse than the status quo.

## Key Findings

### Recommended Stack

**No major stack additions.** v2.1 builds entirely on existing infrastructure: Next.js 15, React 19, motion/react 12, Tailwind, idb-keyval, Sentry, Serwist. The only new dependencies are dev/build tools and one tiny runtime addition:

**Stack additions (5 total, 1 runtime):**
- **web-vitals** (1.5KB gzipped) — Runtime performance metric collection (LCP, INP, CLS) for Sentry
- **@andresaya/edge-tts** (dev-only) — Pre-generate Burmese MP3 audio files at build time (Microsoft Edge TTS is the ONLY free service with my-MM voices)
- **vitest-axe** (dev-only) — Accessibility testing in Vitest suite
- **eslint-plugin-jsx-a11y** (dev-only) — Static accessibility linting (WCAG 2.1/2.2)
- **@next/bundle-analyzer** (optional) — Bundle size treemap analysis

**Critical finding:** Burmese TTS requires pre-generated audio. Browser Web Speech API has zero Burmese voices. Google Cloud TTS doesn't support Burmese. Kokoro TTS doesn't support Burmese. Only Microsoft Edge TTS has `my-MM-NilarNeural` and `my-MM-ThihaNeural` voices. The client-side `edge-tts-universal` library stopped working in non-Edge browsers in December 2025 (user-agent restriction). Build-time audio generation with @andresaya/edge-tts (Node.js wrapper) is the only free, offline-capable approach. 512 audio files (128 questions × 4 strings) = ~2.3MB total, well within Vercel's 100MB limit and negligible bandwidth with service worker caching.

**No new gesture library needed.** motion/react v12.33.0 already provides everything for Duolingo-style swipe interactions: `drag`, `dragConstraints`, `dragElastic`, `useMotionValue`, `useTransform`, `onDragEnd` with velocity detection. The existing FlashcardStack already uses this pattern. Upgrading to Tinder-style swipe-to-dismiss is an enhancement of existing code, not a new capability. Adding @use-gesture/react would create competing gesture systems.

### Expected Features

**Must have (table stakes for 2026 learning apps):**
- **Check/Continue flow** — Explicit "Check" button after answer selection, bottom feedback panel slides up (green/red), "Continue" button advances. Replaces auto-advance which is the #1 UX complaint. Duolingo's signature interaction pattern.
- **User-controlled pacing** — No automatic advancement. User taps Continue when ready. Respects reading speed differences.
- **aria-live announcements** — Screen reader users must hear "Correct!" or "Incorrect. The answer is [X]" after checking answer. WCAG 2.1 Level A requirement.
- **Keyboard navigation** — Tab between answers, Enter to select, Enter to Check, Enter to Continue. Arrow keys for answer options. Full quiz control without mouse/touch.
- **Session persistence** — Resume mid-session after browser close. IndexedDB-based with 24-hour expiry, version-stamped sessions, resume prompt on page load.
- **Know/Don't Know flashcard sorting** — Quizlet's core pattern. Swipe right = know, swipe left = study more. End-of-round summary: "You knew 15/20. Study the 5 you missed?"
- **Language mode consistency** — English-only mode must hide Burmese text on ALL screens. Currently inconsistent: some screens respect the toggle, others (TestPage, flashcards) show Burmese unconditionally.

**Should have (competitive differentiators):**
- **Segmented progress bar** — Each question = one segment. Green (correct), red (incorrect), gray (upcoming), blue (current). Visual performance tracking.
- **Haptic feedback** — `navigator.vibrate(10)` on correct, `[20,50,20]` on incorrect. Free on Android, no-op on iOS PWAs.
- **Voice selection in settings** — Let users pick preferred TTS voice from available options. Current auto-selection works but voice quality varies drastically (iOS Samantha vs. Android eSpeak).
- **Speech rate control (global)** — Already exists for interview mode. Extend to all TTS contexts (test, practice, study guide).
- **Auto-add "Don't Know" cards to SRS deck** — Cards sorted as "Don't Know" in flashcard mode auto-suggest SRS deck addition. Bridges study guide and spaced repetition.
- **Reduced motion alternative animations** — Fade instead of slide, opacity instead of scale. Current `useReducedMotion` disables animations entirely—better to provide alternatives.

**Defer to v2.2+:**
- **Cross-device session resume** (requires Supabase schema changes, conflict resolution)
- **Cloud TTS for higher quality voices** (requires server-side API route, per-character costs)
- **High contrast mode** (`prefers-contrast: more` detection, increased border widths)
- **Screen reader-specific flashcard mode** (needs user testing with VoiceOver/NVDA users)

### Architecture Approach

v2.1 is **enhancement, not refactoring**. The existing architecture (8 IndexedDB stores, 8 context providers, 59 files consuming LanguageContext) is sound. Changes extend existing patterns rather than introducing new ones.

**Major integration points:**

1. **LanguageContext override mechanism** — Add `pushOverride('english-only')` / `popOverride()` to context API. Interview mode calls `pushOverride` on mount to force English-only temporarily without corrupting user preference. The existing `showBurmese` boolean remains unchanged—override transparently changes what `mode` returns. Zero-change for 59 consumer components.

2. **Session persistence store (9th IndexedDB store)** — New `civic-prep-sessions` database with `active-{type}` keys. Schema includes version stamping, TTL, shuffled question order serialization. Debounced writes (2s) + immediate flush on `beforeunload`/`visibilitychange`. Resume flow: check for persisted session on mount → show resume prompt → hydrate or discard.

3. **TTS core extraction** — Consolidate duplicated voice-finding logic from `useSpeechSynthesis` and `useInterviewTTS` into shared `ttsCore.ts`. Voice loading, voice selection, utterance creation, and duration estimation as pure functions. Both hooks delegate to core. Improvements (voice quality ranking, rate persistence, Burmese voice selection) apply once.

4. **Test state machine extraction** — Extract TestPage's 819 lines into `useTestSession` hook. Separate concerns: state machine (hook) + UI rendering (components) + persistence (useSessionPersistence). Shared session UI components (`AnswerGrid`, `SessionProgress`, `SessionFeedback`) used by both test and practice.

5. **Flashcard enhancement** — Add "Sort Mode" to existing FlashcardStack. Toggle between Browse (navigation swipe) and Sort (know/don't-know swipe). Reuse existing swipe gesture code from ReviewCard. No structural changes to Flashcard3D—only prop additions for AddToDeckButton prominence.

**Critical architectural insight from PITFALLS.md:** TestPage/PracticePage/InterviewPage each implement navigation lock independently. When restructuring for shared session components, lock ownership MUST remain with a single component per page. Split ownership causes unlock timing bugs (session wrapper unlocks while session component is still active).

### Critical Pitfalls

1. **Language toggle changes touch 171 conditional render points across 48 files** — Current `showBurmese` gates some Burmese text but NOT all. TestPage shows Burmese answers unconditionally (11 `font-myanmar` ungated). Flashcard3D shows Burmese unconditionally (5 ungated). FlashcardStack progress indicator always shows Burmese. Partial migration (fixing some files but not all) creates worse UX than current inconsistency. **Mitigation:** Audit ALL 334 `font-myanmar` occurrences BEFORE coding. Categorize as gated/ungated/intentional-always. Single atomic PR wraps ALL Burmese text through `BilingualText` or `showBurmese` guards.

2. **Session persistence creates stale state bugs when question bank changes** — User starts session with question IDs from version A. App updates to version B which changes/removes IDs. User resumes with stale references → `find()` returns `undefined`. Answer shuffle desync: persisted `selectedAnswer` reference doesn't match re-shuffled answers. idb-keyval has NO schema versioning or migrations. **Mitigation:** Version-stamp sessions (`appVersion`, `questionBankHash`). Discard on version mismatch. Serialize answer selection by index, not object reference. Store shuffled question order, don't re-shuffle. 24-48 hour TTL auto-expires stale sessions.

3. **TTS improvements break interview phase state machine** — InterviewSession uses fragile 6-phase state machine (`greeting -> chime -> reading -> responding -> grading -> transition`) triggered by TTS `onEnd` callbacks. Two separate TTS hooks (`useSpeechSynthesis`, `useInterviewTTS`) duplicate voice-finding with slightly different logic. Improvements to one don't propagate. Adding Burmese TTS or voice queuing breaks timeout fallback (duration estimation is English word-count-based, fails for Burmese syllable structure). **Mitigation:** Consolidate TTS hooks into shared `ttsCore.ts` BEFORE adding features. Add Burmese duration estimation (char-count / 8 chars/sec). Test timeout fallback independently with mocked `speechSynthesis`.

4. **React Compiler ESLint rules block common session persistence patterns** — Restoring persisted state on mount requires async IndexedDB read → `setState` in effect (violates `react-hooks/set-state-in-effect`). Tracking "has session been saved" with ref and reading during render violates `react-hooks/refs`. **Mitigation:** Use "loading state" pattern (status state machine: `loading -> fresh | resumed`). Follow established `eslint-disable-next-line` patterns from existing codebase (LanguageContext line 49-55, useSpeechSynthesis line 29). Auto-save on user actions, not timers (avoids interval + stale closure).

5. **Flashcard 3D flip card pointer event management is fragile** — `backfaceVisibility: hidden` does NOT block pointer events. Card's `onClick={handleFlip}` captures ALL clicks. TTS buttons and ExplanationCard must `stopPropagation()` on click/keydown/pointerdown. Adding new interactive elements (Sort buttons, AddToDeckButton prominence) without propagation audit causes clicks to leak through and flip the card. **Mitigation:** Every interactive element inside flashcard MUST stop propagation. Maintain `pointerEvents: isFlipped ? 'auto' : 'none'` toggle on face divs. Test matrix: tap TTS on back face → no flip, expand explanation → no flip.

## Implications for Roadmap

Based on dependency analysis and risk assessment, v2.1 requires 6-7 phases in strict order. Cross-cutting concerns (language mode, TTS consolidation) must complete before dependent features.

### Suggested Phase Structure

#### Phase 1: Language Mode Override & Consistency Audit
**Rationale:** LanguageContext is consumed by 59 files. Changing its semantics affects every subsequent phase. The override mechanism (for interview English-only forcing) must exist before Phase 4 restructures interview. The consistency audit (wrapping ungated Burmese text) must complete before language mode behavior changes are user-visible.

**Delivers:**
- `pushOverride(mode)` / `popOverride()` API in LanguageContext
- All 334 `font-myanmar` occurrences audited and categorized
- TestPage answers respect language mode (wrap in BilingualText or guard)
- Flashcard3D front/back respect language mode
- FlashcardStack progress indicator respects language mode
- Compact LanguageToggle component for in-session switching

**Addresses from FEATURES.md:**
- Language mode consistency (table stakes)
- Per-context language override (interview always English)

**Avoids from PITFALLS.md:**
- Pitfall 1: Partial language migration worse than none
- Pitfall 9: BilingualText cascade through 63+ consumers

**Research flags:** Standard pattern extension. No deeper research needed.

---

#### Phase 2: TTS Core Extraction
**Rationale:** Two TTS hooks duplicate voice-finding logic. Consolidating them BEFORE Phase 3 (session persistence, which may need TTS in resume flows) and BEFORE Phase 5 (TTS quality improvements) prevents divergence. This is foundational refactoring with zero user-facing changes—safe to do early.

**Delivers:**
- `ttsCore.ts`: shared voice loading, voice finding, utterance creation, duration estimation
- `useTTS.ts`: simplified general-purpose hook (replaces useSpeechSynthesis)
- `useInterviewTTS.ts`: simplified interview hook (delegates to ttsCore)
- SpeechButton import path update
- Zero behavior changes (pure refactoring)

**Uses from STACK.md:**
- Existing Web Speech API (no new dependencies)

**Avoids from PITFALLS.md:**
- Pitfall 3: Dual TTS hook divergence
- Pitfall 4: Inline TTS improvements without extraction first

**Research flags:** Internal refactoring. No research needed.

---

#### Phase 3: Session Persistence Store & Hook
**Rationale:** Session persistence is consumed by Phases 4 (test/practice/interview UX overhaul), 6 (flashcard sort mode). Building the reusable store and hook first allows all session types to adopt persistence uniformly. Depends on Phase 2 complete (TTS consolidated) because resume flows may need to speak welcome messages.

**Delivers:**
- `sessionStore.ts`: 9th IndexedDB store, `civic-prep-sessions` database
- `useSessionPersistence<T>` hook: debounced writes, immediate flush, TTL enforcement
- `ResumePrompt.tsx`: modal for resume-or-start-new choice
- Version stamping schema, question order serialization
- Web Locks API integration for multi-tab safety

**Addresses from FEATURES.md:**
- Session persistence (table stakes)
- Resume prompt on page load

**Implements from ARCHITECTURE.md:**
- New IndexedDB store following existing `idb-keyval` + `createStore` pattern
- Debounced write with event-based flush

**Avoids from PITFALLS.md:**
- Pitfall 2: Stale session state on app update
- Pitfall 4: React Compiler violations in persistence pattern

**Research flags:** Standard IndexedDB pattern. No research needed. Reference existing 8 stores.

---

#### Phase 4: Test/Practice/Interview UX Overhaul
**Rationale:** Highest-impact user-facing change. Depends on Phase 1 (language override for interview), Phase 3 (session persistence hook). Extract state machines from monolithic page components, add Check/Continue flow, integrate persistence. This is the "Duolingo-style UX" epic from FEATURES.md.

**Delivers:**
- `useTestSession.ts`: extracted state machine from TestPage (819 lines → ~300 hook + ~200 page)
- `usePracticeSession.ts`: extracted state machine from PracticeSession
- Check/Continue flow with bottom feedback panel (BottomFeedbackPanel component)
- Segmented progress bar (green/red/gray segments per question)
- Session persistence integrated (auto-save, resume on mount)
- Haptic feedback on answer check (`navigator.vibrate`)
- Keyboard shortcuts (Enter = Check/Continue, Space/arrows = select answer)
- Shared session components: `AnswerGrid.tsx`, `SessionProgress.tsx`, `SessionFeedback.tsx`

**Addresses from FEATURES.md:**
- Check/Continue flow (table stakes)
- User-controlled pacing (table stakes)
- Bottom feedback banner (table stakes)
- Segmented progress bar (table stakes)
- Haptic feedback (differentiator)
- Keyboard shortcuts (differentiator)

**Uses from STACK.md:**
- motion/react AnimatePresence for feedback panel slide-up
- idb-keyval session persistence
- Existing AnswerFeedback + WhyButton components

**Avoids from PITFALLS.md:**
- Pitfall 5: Navigation lock ownership (single owner per page)
- Pitfall 4: React Compiler compliance in state machines

**Research flags:** **Needs /gsd:research-phase** for Check/Continue interaction timing, feedback panel animation choreography, and keyboard nav focus management. These are nuanced UX patterns not fully specified in research.

---

#### Phase 5: TTS Quality Improvements
**Rationale:** Depends on Phase 2 (TTS core extraction) complete. Now that voice logic is consolidated, quality improvements apply once to both general and interview TTS. Depends on Phase 1 (language mode) for English-only behavior in voice selection UI.

**Delivers:**
- Voice selection dropdown in Settings (shows available voices, preview button)
- Global speech rate control (unified from interview-only to all contexts)
- Voice preference storage in `ttsVoicePrefs.ts` (localStorage or IndexedDB)
- Voice quality ranking (Neural > Enhanced > Standard)
- Graceful TTS failure handling (no voices, suspended AudioContext)
- "Speaking" visual indicator (animated sound wave icon on SpeechButton)
- Burmese audio pre-generation build script (uses @andresaya/edge-tts)

**Addresses from FEATURES.md:**
- Voice selection (should-have)
- Speech rate control global (should-have)
- Burmese TTS via pre-generated audio (deferred from v2.0)

**Uses from STACK.md:**
- @andresaya/edge-tts (dev dependency, build script only)
- Existing useTTS + useInterviewTTS (now consolidated)

**Implements from ARCHITECTURE.md:**
- ttsVoicePrefs.ts preference storage
- useAudioTTS hook for MP3 playback (Burmese audio)

**Avoids from PITFALLS.md:**
- Pitfall 3: Interview phase machine breaks (already consolidated in Phase 2)
- Pitfall 10: Speech rate in localStorage (migrate to IndexedDB or document)
- Pitfall 12: Voice availability varies by OS (store as hint, not exact match)

**Research flags:** Standard pattern. Voice selection UI is settings CRUD. Build script for audio generation is straightforward.

---

#### Phase 6: Flashcard Sort Mode & Study Guide Enhancements
**Rationale:** Independent of test/practice UX. Depends on Phase 3 (session persistence) for sort state resume, Phase 1 (language mode) for card content filtering. Can run in parallel with Phase 5 if resources allow.

**Delivers:**
- FlashcardStack "Sort Mode" toggle (Browse vs. Sort)
- Swipe right = Know, swipe left = Don't Know (Tinder-style dismiss)
- Know/Don't-Know tallies counter
- End-of-round summary: "You knew X/Y. Study missed cards?"
- Missed cards re-queue for second round
- Auto-suggest SRS deck addition for "Don't Know" cards
- Sort state persistence (resume mid-sort)
- Bilingual sort labels ("Know / သိပါတယ်")

**Addresses from FEATURES.md:**
- Know/Don't Know sorting (table stakes)
- Progress counter with tallies (table stakes)
- End-of-round summary (table stakes)
- Auto-add Don't Know to SRS (differentiator)
- Sort Mode persistence (differentiator)

**Uses from STACK.md:**
- motion/react drag + useMotionValue (already in FlashcardStack)
- Existing ReviewCard swipe gesture pattern

**Avoids from PITFALLS.md:**
- Pitfall 6: Flashcard pointer event management (stopPropagation audit)
- Pitfall 2: Sort state persistence schema version stamping

**Research flags:** Gesture pattern already exists in ReviewCard. No research needed—copy pattern.

---

#### Phase 7: Accessibility & Performance Polish
**Rationale:** Final phase builds on completed UX (Phase 4), TTS (Phase 5), and flashcards (Phase 6). Accessibility testing with vitest-axe + eslint-plugin-jsx-a11y. Performance profiling with web-vitals + @next/bundle-analyzer. This is QA and refinement.

**Delivers:**
- aria-live regions for answer feedback (assertive)
- Focus management after answer submission (focus → feedback → Continue → next question)
- Touch target audit (WCAG 2.5.8: 24x24px minimum, ideally 44x44px)
- Timer accessibility (screen reader announcements at intervals, extension option)
- Reduced motion alternative animations (fade instead of slide)
- vitest-axe integration in test suite (`toHaveNoViolations()`)
- eslint-plugin-jsx-a11y in ESLint config (flat config `recommended`)
- web-vitals reporting to Sentry (LCP, INP, CLS, FCP, TTFB)
- Bundle analysis report (@next/bundle-analyzer)

**Addresses from FEATURES.md:**
- aria-live announcements (table stakes)
- Focus management (table stakes)
- Keyboard navigation (table stakes, completed in Phase 4 but tested here)
- Touch target compliance (table stakes)
- Timer accessibility (table stakes)
- Reduced motion alternatives (should-have)

**Uses from STACK.md:**
- vitest-axe (dev dependency)
- eslint-plugin-jsx-a11y (dev dependency)
- web-vitals (runtime dependency, 1.5KB)
- @next/bundle-analyzer (optional dev dependency)

**Avoids from PITFALLS.md:**
- Pitfall 7: Accessibility + animation timing (delay aria-live until onExitComplete)
- Pitfall 8: IndexedDB read waterfall (profile first, batch reads if needed)

**Research flags:** **Needs /gsd:research-phase** for WCAG 2.2 compliance specifics (2.5.8 touch targets, 2.2.1 timing adjustable, 4.1.3 status messages). Accessibility is specialized domain requiring authoritative sources.

---

### Phase Ordering Rationale

**Why this order:**

1. **Language Mode first (Phase 1)** — Cross-cutting change that affects 59 files. Interview override needed before Phase 4 restructures interview. Consistency audit prevents later rework.

2. **TTS extraction before improvements (Phase 2 → 5)** — Consolidating duplicated logic prevents divergence. Phase 5 improvements apply once, not twice.

3. **Session persistence before UX overhaul (Phase 3 → 4)** — Phase 4 test/practice restructuring integrates persistence. Building the hook first makes integration clean.

4. **UX overhaul before accessibility (Phase 4 → 7)** — Can't test aria-live announcements and focus management until Check/Continue flow exists. Accessibility is verification/enhancement of Phase 4 work.

5. **Flashcard sort independent (Phase 6)** — Can run in parallel with Phase 5. Only depends on Phases 1 and 3 (language mode, persistence).

6. **Accessibility last (Phase 7)** — Tests and validates all prior phases. Performance profiling requires complete features.

**Grouping rationale:**

- **Phases 1-3** are foundational (language, TTS, persistence) with zero user-facing changes. Low risk, enables later phases.
- **Phases 4-6** are feature delivery (UX overhaul, TTS quality, flashcard sort). High user impact.
- **Phase 7** is QA and compliance. Validates phases 4-6.

**Pitfall avoidance:**

- Atomic migration (Phase 1) prevents partial language mode worse than none (Pitfall 1)
- TTS consolidation first (Phase 2) prevents dual hook divergence (Pitfall 3)
- Version-stamped sessions (Phase 3) prevent stale data bugs (Pitfall 2)
- Single lock owner (Phase 4) prevents navigation lock timing bugs (Pitfall 5)
- Propagation audit (Phase 6) prevents flashcard flip leaks (Pitfall 6)
- Delayed aria-live (Phase 7) prevents animation timing conflicts (Pitfall 7)

### Research Flags

**Phases needing /gsd:research-phase during planning:**

- **Phase 4 (Test/Practice/Interview UX)** — Check/Continue interaction timing, feedback panel animation choreography, keyboard nav focus sequence. Nuanced UX patterns. Research Duolingo's exact timing (Check enables after selection delay? Feedback panel slide duration? Continue button animation?).

- **Phase 7 (Accessibility)** — WCAG 2.2 specifics for touch targets (2.5.8), timing adjustable (2.2.1), status messages (4.1.3). Official W3C specs are dense. Need practical implementation guides for aria-live + AnimatePresence coordination.

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Language Mode)** — Context API override is standard React. Bilingual text wrapping is mechanical grep + wrap.
- **Phase 2 (TTS Core)** — Code extraction refactoring. No new concepts.
- **Phase 3 (Session Persistence)** — IndexedDB pattern exists 8x in codebase. Copy pattern.
- **Phase 5 (TTS Quality)** — Settings UI + build script. Straightforward.
- **Phase 6 (Flashcard Sort)** — Gesture pattern exists in ReviewCard. Copy pattern.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Only 5 new packages, all verified. Pre-generated audio is only viable approach for Burmese TTS (browser support confirmed absent via official voice lists). motion/react already has all gesture capabilities needed—no new library required. |
| Features | HIGH | Duolingo/Quizlet patterns well-documented via official help docs, UX analysis articles, and implementation examples. Check/Continue flow, Know/Don't-Know sorting, session resume are table stakes per 2026 learning app research. |
| Architecture | HIGH | Direct codebase analysis of all 59 LanguageContext consumers, all 8 IndexedDB stores, all TTS hooks, and session page state machines. Integration points verified against existing patterns. No speculative architecture—all extends proven patterns. |
| Pitfalls | HIGH | Verified against codebase (React Compiler rules in MEMORY.md, existing pointer event management in Flashcard3D, navigation lock in TestPage), official docs (Web Speech API unreliability, IndexedDB schema evolution), and community sources (easy-speech library pitfalls, IndexedDB best practices). |

**Overall confidence:** HIGH

### Gaps to Address

**Audio file size validation:** STACK.md estimates ~2.3MB total for 512 pre-generated MP3 files (question + answer, English + Burmese, 128 questions). This is based on typical MP3 128kbps encoding at 2-4 second durations. **Validation needed:** Run the build script on actual USCIS question bank to measure real file sizes. If total exceeds 5MB, consider lower bitrate (96kbps) or runtime caching instead of precaching.

**Burmese TTS pronunciation quality:** Microsoft Edge NilarNeural and ThihaNeural voices exist and support `my-MM`, but pronunciation quality for USCIS civics terms in Burmese (proper nouns like "George Washington" transliterated, government terminology) is unknown. **Validation needed:** Generate sample audio for 5-10 questions during Phase 5 and validate with native Burmese speaker before generating all 512 files.

**Session resume UX on multi-device users:** Research assumes local-only IndexedDB persistence (no cross-device sync). For users who switch devices (start on phone, resume on desktop), the resume prompt will show "no session" on the second device. This is acceptable for v2.1 (local-first), but user testing may reveal this is confusing. **Defer to v2.2:** Cross-device session sync via Supabase (flagged in FEATURES.md as deferred).

**WCAG 2.2 touch target exception rules:** WCAG 2.5.8 (Target Size Minimum) has exceptions for inline text links, essential UI, and user-controlled spacing. The research identifies touch target audit as table stakes but doesn't specify which exceptions apply to this app. **Validation during Phase 7:** Review official W3C understanding docs for 2.5.8 and determine if compact SpeechButton icons (32x32) qualify for "essential UI" exception or need 44x44 touch area.

**Reduced motion + spring physics interaction:** motion/react's `useReducedMotion` returns true when `prefers-reduced-motion: reduce` is set. The research recommends "reduced motion alternatives" (fade instead of slide) but doesn't specify how to implement spring-to-fade conversion for 68 files using spring physics. **Validation during Phase 7:** Test if motion/react's transition prop can accept `reducedMotion ? {duration: 0.2} : spring` or if variants need duplication.

## Sources

### Primary (HIGH confidence)

**Stack Research:**
- [Edge TTS Voice List (GitHub Gist)](https://gist.github.com/BettyJJ/17cbaa1de96235a7f5773b8690a20462) — Confirmed `my-MM-NilarNeural` and `my-MM-ThihaNeural`
- [@andresaya/edge-tts (GitHub)](https://github.com/andresayac/edge-tts) — Node.js API, `toFile()` method
- [Google Cloud TTS Supported Languages](https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types) — Burmese NOT listed
- [motion.dev Drag Docs](https://motion.dev/docs/react-drag) — `drag`, `dragConstraints`, `onDragEnd`
- [eslint-plugin-jsx-a11y npm](https://www.npmjs.com/package/eslint-plugin-jsx-a11y) — v6.10.2, flat config support
- [@next/bundle-analyzer npm](https://www.npmjs.com/package/@next/bundle-analyzer) — Official Next.js package
- [Vercel Hobby Plan Limits](https://vercel.com/docs/limits) — 100MB deploy, 100GB bandwidth

**Features Research:**
- [Quizlet Flashcard Study Mode Help](https://help.quizlet.com/hc/en-us/articles/360030988091-Studying-with-Flashcards) — Official docs
- [Quizlet Learn Mode Help](https://help.quizlet.com/hc/en-us/articles/360030986971-Studying-with-Learn) — Official docs
- [WCAG 2.2 Official Specification](https://www.w3.org/TR/WCAG22/) — W3C standard
- [WCAG 2.2 New Success Criteria](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) — 2.5.8, 2.2.1
- [ARIA Live Regions (MDN)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) — Official docs

**Architecture Research:**
- Direct codebase analysis: 59 files consuming `useLanguage()`, 8 IndexedDB stores, LanguageContext.tsx, useSpeechSynthesis.ts, useInterviewTTS.ts, TestPage.tsx (819 lines), FlashcardStack.tsx, Flashcard3D.tsx

**Pitfalls Research:**
- [IndexedDB Best Practices - web.dev](https://web.dev/articles/indexeddb-best-practices-app-state) — Official Google guide
- [IndexedDB Pain Points (GitHub Gist)](https://gist.github.com/pesterhazy/4de96193af89a6dd5ce682ce2adff49a) — Comprehensive bug catalog
- [idb-keyval GitHub](https://github.com/jakearchibald/idb) — Library docs
- [React Compiler v1.0 Blog Post](https://react.dev/blog/2025/10/07/react-compiler-1) — Official rules
- MEMORY.md — React Compiler ESLint pitfalls, 3D flip card pointer events, CSP details

### Secondary (MEDIUM confidence)

**Stack Research:**
- [Best Free TTS APIs 2026 (CAMB.AI)](https://www.camb.ai/blog-post/best-free-text-to-speech-ai-apis) — Survey of options
- [Kokoro TTS Supported Languages](https://kokorottsai.com/) — English, French, Korean, Japanese, Mandarin only
- [edge-tts-universal Browser Restriction](https://github.com/travisvn/edge-tts-universal) — Dec 2025 user-agent requirement

**Features Research:**
- [Duolingo Onboarding UX Breakdown](https://userguiding.com/blog/duolingo-onboarding-ux) — Third-party analysis
- [Duolingo Micro-Interactions](https://medium.com/@Bundu/little-touches-big-impact-the-micro-interactions-on-duolingo-d8377876f682) — Community analysis
- [Josh Comeau 3D Button Tutorial](https://www.joshwcomeau.com/animation/3d-button/) — CSS techniques
- [Language Selector UX (Smart Interface Design Patterns)](https://smart-interface-design-patterns.com/articles/language-selector/) — Best practices

**Pitfalls Research:**
- [Taming the Web Speech API (Andrea Giammarchi)](https://webreflection.medium.com/taming-the-web-speech-api-ef64f5a245e1) — Cross-browser pitfalls
- [Lessons Learned Using speechSynthesis (Talkr)](https://talkrapp.com/speechSynthesis.html) — Production experience
- [easy-speech Library](https://github.com/leaonline/easy-speech) — Documented Web Speech API pitfalls
- [Motion Accessibility Guide](https://motion.dev/docs/react-accessibility) — Official motion/react docs
- [Sara Soueidan: ARIA Live Regions](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/) — Implementation patterns

### Tertiary (LOW confidence)

**Features Research:**
- [Implementing i18n in React 2026](https://thelinuxcode.com/implementing-internationalization-in-react-components-2026-a-practical-component-first-guide/) — Component patterns (needs validation)
- [React State Persistence (UXPin)](https://www.uxpin.com/studio/blog/how-to-use-react-for-state-persistence/) — General strategies

**Pitfalls Research:**
- [Avoiding Async State Manager Pitfalls (Evil Martians)](https://evilmartians.com/chronicles/how-to-avoid-tricky-async-state-manager-pitfalls-react) — React patterns
- [Offline-First Frontend Apps 2025 (LogRocket)](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/) — IndexedDB vs. SQLite tradeoffs

---

*Research completed: 2026-02-13*
*Ready for roadmap: YES*
*Recommended phases: 7 (6 core + 1 polish)*
*Critical path: Phase 1 → 2 → 3 → 4 → 7 (accessibility validates UX)*
*Parallel opportunity: Phase 6 (flashcards) can run alongside Phase 5 (TTS quality)*
