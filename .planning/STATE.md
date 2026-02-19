# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** v2.1 Quality & Polish -- Phase 28 in progress

## Current Position

Phase: 28 of 28 (Interview UX & Voice Flow Polish)
Plan: 5 of 9 in current phase
Status: In progress (Wave 2)
Last activity: 2026-02-19 -- Completed 28-05-PLAN.md (ModeBadge, InterviewProgress, InterviewTimer enhancement, LongPressButton)

Progress: [#####-----] 55% (5/9 plans complete)

## Completed Milestones

| Version | Date | Phases | Plans | Requirements |
|---------|------|--------|-------|-------------|
| v1.0 | 2026-02-08 | 10 | 72 | 55/55 |
| v2.0 | 2026-02-13 | 7 | 47 | 29/29 |

See `.planning/MILESTONES.md` for details.

## Performance Metrics

**Velocity:**
- v1.0: 72 plans in ~14 hours (~11 min/plan avg)
- v2.0: 47 plans in ~5 days, 162 commits, +32K/-8K lines
- v2.1: 69 plans (Phase 18: 7, Phase 19: 6, Phase 20: 6, Phase 21: 12, Phase 22: 9, Phase 23: 9, Phase 24: 10, Phase 25: 10)

## Accumulated Context

### Decisions

All decisions archived in PROJECT.md Key Decisions table.

**Phase 27 decisions:**
- Exact threshold matching (=== 300/120/60) not range for sr-only announcements -- fires once per threshold crossing
- sr-only span placed outside aria-hidden wrapper so announcements work when timer is visually hidden
- Overall timer documented as WCAG 2.2.1 essential timing exception (USCIS simulation)
- role="timer" with aria-label on outer container for continuous accessible label
- Followed PerQuestionTimer pattern: simple derived value, no refs or flags needed

**Phase 26 decisions:**
- RESUME_SESSION action not phase-guarded (resume can happen from initial answering phase at index 0)
- Read resumeDataRef.current into local variable before clearing to ensure dispatch happens before null
- VoicePicker uses native <select> for accessibility (per Phase 22 decision)
- English voices filtered and sorted local-first then alphabetical in VoicePicker
- Mic icon used for Voice row in Settings to differentiate from Volume2 section header icon
- Interview realistic mode overrides showBurmese locally (destructure as globalShowBurmese, derive from mode)
- Sort route in UnfinishedBanner uses /study#sort matching StudyGuidePage hash-based tab navigation

**Phase 25 decisions:**
- Glossary organized in 8 sections: no-translate, civics/government, UI actions, navigation, study tabs, achievements, number formatting, sentence patterns
- Practice (လေ့ကျင့်) vs Test (စာမေးပွဲ) use clearly distinct Burmese words
- Noto Sans Myanmar loaded from Google Fonts CDN (CSP already allows fonts.googleapis.com and fonts.gstatic.com)
- Myanmar line-breaking uses overflow-wrap: anywhere + word-break: keep-all + line-break: strict
- Badge names: creative Burmese + (English Name) pattern for international recognition
- Hub nav label uses "တိုးတက်မှု" (Progress) matching glossary
- All Unicode escape sequences converted to literal Myanmar characters for readability
- @verified TSDoc markers on all centralized string files (pending 3-AI consensus)
- Proper noun transliterations standardized to glossary canonical forms across all question files
- USCIS 2025 additions: targeted fixes only (not rewrites) to preserve good existing translations
- Japanese character (への) found and fixed in RR-11 study answer
- Non-standard Burmese "motto" (မိုထိုး) replaced with correct ဆောင်ပုဒ်
- Broken phonetic "senator" (ဆင်နေတာ) replaced with proper အထက်လွှတ်တော်အမတ် (Senator)
- American Government: formal question endings (အဘယ်နည်း/သနည်း) converted to casual (ဘာလဲ/ဘယ်သူလဲ)
- American Government: ယခု (formal "now") replaced with အခု (casual) in dynamic questions
- American Government: အမှုဆောင်ဌာန changed to glossary-standard အုပ်ချုပ်ရေးဌာန (Executive Branch)
- American Government: တရားရုံးချုပ် changed to glossary-standard တရားလွှတ်တော်ချုပ် (Supreme Court)
- American Government: ကွန်ဂရက် expanded to ကွန်ဂရက်လွှတ်တော် (Congress) for clarity
- Quiz/Interview/Progress: QuizHeader, AnswerOption, SkipButton already centralized -- no changes needed
- Quiz/Interview/Progress: ExaminerCharacter is pure SVG with no visible text -- skipped
- Quiz/Interview/Progress: Arabic numerals kept for scores/counts/percentages in technical display
- PWA buttons: "English / Burmese" slash pattern replaced with English primary + Burmese <span> subtitle
- Formal ပါသည် endings replaced with casual ပါတယ် in PWA/session components
- Transliterated loanwords (စင့်ခ်) replaced with natural Burmese (ချိန်ကိုက်)
- WhatsNew State Personalization title simplified: ပြည်နယ်ပုဂ္ဂိုလ်ရေးသတ်မှတ်ခြင်း -> ပြည်နယ်အလိုက် ပြင်ဆင်ခြင်း
- Review terminology standardized: 'ပြန်လှည့်' (turn back) replaced with 'ပြန်လည်သုံးသပ်' (review) across SRS components
- SRS context terms fixed: 'စာမေးပွဲ' (test/exam) replaced with 'ပြန်လည်သုံးသပ်' (review) in SRSWidget
- Leaderboard term standardized: 'ဥူးဆောင်ဘုတ်' replaced with glossary 'အဆင့်ဇယား' across social components
- Points term standardized: 'ရမှတ်' replaced with glossary 'အမှတ်' across leaderboard components
- Node.js scripts needed for Myanmar Unicode text replacement (Edit tool has encoding issues with Myanmar combining characters)
- Rendering audit: OpEdPage Myanmar word is editorial content (language label), not bilingual UI -- no showBurmese guard needed
- Rendering audit: Toast messages with Myanmar text handled by BilingualToast internally -- no per-component font-myanmar needed
- Rendering audit: 75 TSX files with Myanmar Unicode, 101 with font-myanmar, only 1 gap found (OpEdPage)
- Rendering audit: All 108 showBurmese-using components verified -- zero unguarded Burmese text
- Rendering audit: No responsive overflow issues -- font-myanmar class includes overflow-wrap: anywhere
- Audio regeneration: deleted all existing female files and regenerated from scratch for consistency
- Audio regeneration: male voice (ThihaNeural) generated in addition to female (NilarNeural) for complete coverage
- Waves 3+ (component inline strings) applied directly with no cross-check needed (UI chrome, not civics content)

**Phase 24 decisions:**
- jsx-a11y/no-autofocus disabled (project intentionally uses autoFocus for modals and UX flows)
- Interactive pattern jsx-a11y rules set to warn (components manage focus programmatically via useRovingFocus etc.)
- vitest-axe registered via expect.extend(matchers) not import extend-expect (extend-expect.js is empty in v0.1.0)
- sr-only assertive region placed outside animated panel div to avoid animation delays affecting screen reader announcements
- Mock test verdict uses simpler text (no explanation) for USCIS simulation fidelity
- Segment container changed from role="progressbar" to role="list" for individual segment accessibility
- Segment status labels capitalized for screen reader clarity (Correct not correct)
- FlagToggle sr-only announcement uses aria-live="polite" (not assertive) since user initiated
- Toast container uses aria-live="polite" while individual toasts use conditional roles (alert vs status)
- Removed aria-atomic from toast container (each toast is a separate announcement)
- Persistent sr-only div always in DOM (not inside AnimatePresence) for reliable screen reader announcements
- Visual animation elements marked aria-hidden=true; separate sr-only div handles announcements
- High contrast overrides at semantic token level (--color-text-secondary, --color-border) to cascade through backward compat aliases
- Focus moves to question area (tabIndex=-1, outline-none) after TRANSITION_COMPLETE via requestAnimationFrame
- Skip-to-content link uses sr-only + focus:not-sr-only pattern (visible only on focus)
- Inline backfaceVisibility only (removed backface-hidden class) for reliable cross-browser 3D
- Damping 22 (up from 18) eliminates flip overshoot flicker without noticeable animation change
- OPACITY_STEP set to 0 in SwipeableStack for fully opaque behind-cards
- isolation: isolate creates new stacking context preventing compositing issues with siblings
- No separate web-vitals library -- Sentry SDK v10+ captures all Web Vitals via browserTracingIntegration
- Production tracesSampleRate set to 0.2 (20%), development stays at 1.0 (100%)
- Bundle analyzer wraps inside Sentry in config chain (Sentry must be outermost for source map upload)
- Myanmar font preload skipped -- webpack hashes paths per build; @fontsource v5 already sets font-display: swap
- No SW changes needed -- audio files already cached with CacheFirst (1200 entries, 90 days)
- Lower swipe threshold from 40% to 25% card width (~75px on 300px mobile card)
- Lower velocity threshold from 800 to 500px/s for easier flick commits
- Combined commit: velocity > 300 AND distance > 15% catches medium gestures
- dragElastic reduced from 1 to 0.6 for less bounceback
- Auto-read uses 500ms delay (not onAnimationComplete callback) for simplicity
- Auto-read triggerKey is card ID (unique), not currentIndex (could repeat across rounds)
- Crossfade via CSS opacity transition (not motion/react) for Flashcard3D reduced motion flip
- pendingDirection state prop defers SwipeableCard animation to useEffect for button-initiated sorts under reduced motion
- 150ms easeOut standard for interactive control reduced motion transitions; 200ms for progress bars
- SessionCountdown and StreakReward already had adequate reduced motion handling -- no changes needed
- Timer color uses CSS custom properties (--color-success, --color-warning, --color-destructive) for theme awareness
- sr-only announcement fires at exactly timeLeft === 5 (not range) to avoid repeated announcements
- Callback refs synced via useEffect (not render-time assignment) for React Compiler safety
- One-shot warning/expiry flags use refs accessed only inside setInterval callback (handler context)
- Timer extension toast uses E keyboard shortcut with input/textarea guard

**Phase 23 decisions:**
- Single Know swipe = mastered for session (no consecutive-correct tracking)
- Undo resets allUnknownIds for dont-know cards (full reversal)
- FINISH_SESSION preserves roundHistory for post-session display
- RESUME_SESSION reconstructs Sets from serialized arrays, resets undoStack
- createIdleState helper for clean idle state construction
- Sort reducer follows same phase-guarded pattern as quizReducer
- Sort card uses accent-purple color token (distinct from primary/success/accent for other modes)
- SortSnapshot stores card IDs not full Question objects (compact IndexedDB payloads)
- No SESSION_VERSION bump for sort union addition (backward-compatible)
- SortRoundResult defined inline in sessionTypes.ts (mirrors sortTypes.ts, avoids circular deps)
- Personal best tracked via useMemo derivation (not useState/useEffect) for React Compiler safety
- Weak area detection omitted from smart defaults (requires async mastery data); falls back to all questions
- Sort tab placed as second tab (Browse, Sort, Deck, Review) in PillTabBar
- Round summary has manual 'Study Missed Cards' button that triggers countdown (not auto-countdown)
- Category detail view gains 'Sort Cards' secondary button alongside existing flashcard button
- Reuse CountUp from react-countup for hero stat animation (already installed)
- Per-category breakdown uses sub-category colors, not USCIS main categories
- allUnknownIds prop kept in RoundSummary for parent-level SRSBatchAdd integration
- MissedCardsList uses AnimatePresence for expand/collapse (not CSS transition)
- SRSBatchAdd checkbox selection defaults all new cards checked; expandable for deselection
- No effect on existing SRS schedules from sort mode Don't Know classification
- toMyanmarNumeral helper defined locally (small utility, not shared module)

**Phase 22 decisions:**
- Explanation style matches existing american-government.ts (direct, factual, 2-3 sentences, why-not-what)
- Burmese explanation translations use formal-but-accessible register with English terms in parentheses
- Optional fields (citation, commonMistake, relatedQuestionIds) included where genuinely helpful
- VoicePicker uses native <select> for accessibility (not custom dropdown)
- Voice preview plays "What is the supreme law of the land?" on selection change
- Interview section replaced by Speech & Audio section (above Sound & Notifications)
- Sound & Notifications icon changed from Volume2 to Bell to differentiate from Speech & Audio
- Auto-read language selector only visible when autoRead is ON and showBurmese is true
- Burmese voice selector always visible in bilingual mode (not gated on autoRead)
- Settings merge uses { ...DEFAULT_SETTINGS, ...parsed } for backward-compatible field additions
- Android gets cancel/restart semantics instead of pause/resume (Android Chrome pause bug)
- 150ms debounce window for rapid taps via useRef timestamp
- PauseIcon is static two-bar SVG (not SoundWaveIcon with animate=false)
- Native browser title tooltip (span wrapper) for error/unsupported/offline states
- Tooltip priority: unsupported > error > offline > none
- Online/offline state tracked with useState + window event listeners (self-contained, not OfflineContext)
- Module-level singleton player shared across BurmeseSpeechButton instances
- Myanmar flag as simple 3-stripe SVG (yellow/green/red) with white star at 16x16
- RATE_MAP duplicated inline in BurmeseSpeechButton (avoids importing from TTSContext)
- SpeechAnimations.tsx extracted as shared module for both SpeechButton and BurmeseSpeechButton
- BurmeseSpeechButton tracks per-instance isSpeaking via URL comparison (currentFile === myUrl)
- Burmese audio URL convention: /audio/my-MM/{female|male}/{questionId}-{q|a|e}.mp3
- Per-session overrides use useState from global settings, never synced back to localStorage
- Interview auto-read always on (no toggle), speed selector only in Practice mode
- Real mode interview uses fixed normal speed (USCIS simulation fidelity)
- SpeechOverrides exported from PreTestScreen, InterviewSpeechOverrides from InterviewSetup
- Optional callback parameters maintain backward compatibility with existing consumers
- SPEED_OPTIONS constant with en/my labels reused across all three pre-screens
- Auto-read handles English only via SpeechSynthesis; Burmese uses pre-generated MP3 via manual BurmeseSpeechButton
- PracticeSession auto-read gated on answering phase only (not feedback/checked/transition)
- Flashcard3D back face Burmese SpeechButton replaced with BurmeseSpeechButton (MP3 playback instead of browser TTS)
- Per-session override flow: PracticeConfig -> PracticePage state -> PracticeSession props
- Results view speech buttons also get speed labels and Burmese buttons for consistency
- InterviewSession safeSpeakLocal always passes numericRate override to speak()
- Practice + Myanmar: English TTS then Burmese MP3 sequentially per question
- Real mode: English only regardless of language mode (no Burmese audio)
- Burmese audio failure is non-blocking (console.debug, no toast)
- ChatMessage extended with questionId for Burmese replay button targeting
- BurmeseSpeechButton in interview chat uses compact styling (!py-1 !min-h-[32px])
- InterviewTranscript accepts speedLabel prop for results view Burmese buttons
- Speed override flow: InterviewSetup -> InterviewPage state -> InterviewSession/Results props
- Mock Audio uses class-based implementation (not vi.fn().mockImplementation) to avoid vitest warnings
- Settings persistence tested via React state verification (not direct localStorage read) due to jsdom limitations
- Voice filtering tested as extracted logic (same algorithm as VoicePicker useMemo)

**Phase 21 decisions:**
- Quiz state machine uses 6 phases with strict guards preventing invalid state combinations
- Haptics use Vibration API directly (no library) with silent no-op on unsupported platforms
- Sound effects follow existing module pattern: mute check, lazy AudioContext, silent catch
- Threshold helpers (hasPassedThreshold/hasFailedThreshold) are pure functions for consumer flexibility
- playCompletionSparkle uses dual-tone (2000Hz + 2400Hz) for richer sparkle effect
- Compound number phrases handled before individual number words to avoid partial replacements
- Bidirectional synonym mapping (freedom/liberty) for keyword matching
- Extended stop words list includes spoken filler words (think, would, could) for natural speech tolerance
- PillTabBar uses inline style for dynamic grid-template-columns (tab count varies 2-4+)
- PillTabBar reduced motion support via useReducedMotion (disables scale, instant pill position)
- PreTestScreen onCountChange prop optional for backward compatibility
- InterviewSetup PillTabBar selector replaces two-card direct-click with mode selector + info panel
- Native Web Speech API used directly instead of react-speech-recognition (avoids dependency, per user instruction)
- CSS keyframe animations for examiner character (no Lottie, saves 133KB)
- Web Speech API type declarations added as ambient .d.ts for TypeScript
- Silence detection uses cancelled-flag pattern for React Compiler safety
- FeedbackPanel uses SPRING_SNAPPY for slide-up, SPRING_BOUNCY for checkmark icon
- AnswerOptionGroup arrow keys directly select answers (not just focus) per locked decision
- AnswerOption uses inline shadow-[0_4px_0] with border color token for 3D chunky style
- useRovingFocus is a generic hook for W3C radiogroup keyboard navigation
- Segment completion tracked via refs (hasPlayedRef) to avoid setState-in-effect React Compiler violation
- SkipButton uses 3D chunky outline style with border shadow matching Check button visual language
- Quiz i18n strings added as new 'quiz' section separate from existing 'test' and 'actions' sections
- Individual Segment wrapped in React.memo to avoid re-rendering all segments on state change
- SkippedReviewPhase uses isolated internal quizReducer for review state
- Segment tap review uses inline modal dialog (not separate route)
- Inline exit confirmation dialog for practice (ExitConfirmDialog component pending)
- SRS marking batched at end of practice (recordAnswer loop, not per-question)
- Timer pauses during feedback phase (isFeedback gates timer effect)
- PracticeSnapshot extended with optional skippedIndices for session persistence
- hasCompletedRef prevents double-firing onComplete from effect on finished state
- Chat-style conversation log replaces old Q&A card layout in InterviewSession
- ExaminerCharacter replaces InterviewerAvatar with state-driven animations
- Auto-grading via gradeAnswer when speech recognition available, SelfGradeButtons fallback
- Practice mode: per-question feedback with TTS, exit allowed; Real mode: brief acks, early termination
- Dark gradient background (slate-900/800) for interview immersion
- Typing indicator phase (1.2s) before each question for natural conversation feel
- Response time tracked from TTS end to answer submit (InterviewResult confidence/responseTimeMs fields)
- InterviewPage.tsx unchanged -- InterviewSession props interface backward compatible
- Batch SRS recording on finish (not per-answer) for better performance
- 250ms intentional delay between CHECK and SHOW_FEEDBACK for suspense
- TRANSITION_COMPLETE dispatched 50ms after CONTINUE for animation timing
- Exit dialog uses Radix Dialog for focus trap and portal rendering
- Check button uses rounded-full pill shape with 3D chunky shadow
- Feedback panel fixed to bottom with z-40
- Helper function getQuestionAtIndex outside component for React Compiler purity
- ExaminerCharacter replaces InterviewerAvatar on results screen (consistent with chat session)
- Dark gradient (slate-900/800) for interview results matching session aesthetic
- getRecommendation pure function with 3 score tiers (>=16, >=12, <12)
- SRS batch offer uses sequential addCard loop (no batch API available)
- Review Transcript button scrolls to transcript section instead of separate route
- Confidence stats (avg/min/max) shown only when speech recognition data available
- Score comparison fetches second-most-recent session from history array
- InterviewResult type extended with transcript, matchedKeywords, missingKeywords (backward compatible)
- TestResultsScreen shared between mock-test and practice with mode-specific behavior
- timeTaken made optional for practice mode (practice doesn't track time)
- PracticeResults delegates to TestResultsScreen instead of duplicating results UI
- CategoryBreakdown sorts categories weakest-first for actionable review
- QuestionReviewList supports skipped questions as third filter tab
- Duration stat grid conditionally renders 3 or 4 columns based on timeTaken availability
- Streak milestones at 3,5,7,10,15,20 (not every correct answer) with badge tiers flame/star/trophy
- playStreak() sound only at streak >= 10 to avoid audio fatigue
- XP popup uses useState animKey pattern instead of Date.now() for React Compiler purity
- Focus rings always visible (focus:ring-2) not keyboard-only (focus-visible:ring-2)
- Context-sensitive Enter key: Check when answer selected, Continue when feedback showing
- Escape opens exit dialog globally (not just from QuizHeader)

**Phase 20 decisions:**
- 1-per-type session limit enforced in saveSession (max 3 snapshots total)
- 24-hour expiry checked on every load plus cleanExpiredSessions on startup
- VERSION constant for migration safety -- mismatched versions auto-discarded
- useSessionPersistence uses cancelled-flag async IIFE pattern for React Compiler safety
- Countdown tick at 800 Hz / 80ms, Go chime as C5+G5 ascending pair
- Added playCountdownTick/playCountdownGo stubs so plan 02 compiles independently of parallel plan 01
- Step-based countdown state (5 to -1) with useEffect timer for React Compiler safety
- Skip button auto-focuses with preventScroll to avoid scroll jank
- Myanmar Go text uses Unicode escape sequences for font compatibility
- NavItem TabBadge uses explicit switch cases for new badge keys (not dynamic lookup)
- Practice sessions count toward testSessionCount badge (both mock-test and practice types)
- Session count fetch added to existing runCheck in useNavBadges for consistency
- ResumeSessionCard as button element for click-to-select in multiple-session modal
- Metadata-only card content (no question snippets) for simplicity and privacy
- Inline confirmation swap (not sub-dialog) for Start Fresh action
- Resume button 600ms loading delay before callback for intentional feel
- Single session auto-selected; multiple sessions require explicit selection
- Practice countdown shown on resume when timer enabled (fresh timer duration)
- Interview resume skips greeting, starts at chime phase for next ungraded question
- Interview questions changed from useMemo to useState lazy init for resume seeding
- resumeData cleared on retry/switchMode to prevent stale state
- TestPage questions changed from useMemo to useState lazy init (React Compiler enforces declaration order)
- Timer and navigation lock effects gated on showCountdown to prevent ticking during countdown animation
- deleteSession called after saveTestSession succeeds on completion (cleanup only after Supabase confirm)
- Countdown subtitle: Q{index}/{count} for resume vs {count} Questions for new

**Phase 19 decisions:**
- eslint-disable for currentUtterance: module-level GC prevention pattern (intentional assign-only variable)
- void swallow pattern in safeSpeak: consumes destructured param without triggering unused-var lint error
- Android UA detection: single exception to no-UA-sniffing rule for pause/resume cycling (breaks Android Chrome)
- Combined test tasks into single commit when ESLint unused-import prevents committing infrastructure alone
- Global test setup speechSynthesis mock made configurable: true for test-level overrides
- Error state local to useTTS hook, not in provider context -- each consumer has independent error lifecycle
- Isolated engine via useRef with state subscription, ref.current only in effects/handlers (React Compiler safe)
- voiceName prop kept for backward compat in SpeechButton but unused -- ttsCore findVoice handles voice selection
- TTS speaking color as dedicated indigo-purple token (hsl 250) distinct from primary blue and accent-purple
- safeSpeakLocal wraps useTTS speak (not raw engine) -- simpler, useTTS handles cancellation silently
- handleReplay uses Promise-based delay instead of setTimeout callback for cleaner async flow
- Chime effect calls handleReading directly from timeout (no separate reading useEffect)
- Direct TTSProvider import (not next/dynamic) since AppShell has isClient gate
- SettingsPage migrated from raw localStorage to useTTSSettings for settings sync

**Phase 18 decisions:**
- Exported LanguageMode type for downstream consumers (additive, non-breaking)
- HTML lang set to 'en-my' for bilingual, 'en' for english-only
- Used SPRING_BOUNCY for tap animation (WAAPI 3-keyframe arrays unsupported)
- Analytics stub uses console.debug (intentional no-console warning)
- Interview TTS/STT stays English regardless of language mode (USCIS simulation)
- AnswerReveal needed no changes (all Burmese already gated)
- USCIS simulation message shown every time before mock test (not just first time)
- "Answer in English" guidance only in Myanmar mode
- ErrorBoundary uses localStorage for language mode (class component, no hooks)
- DynamicAnswerNote showBurmese prop optional with default true (backward compatible)
- Sub-components (StatCard, DeckCardItem) receive showBurmese via prop from parent
- OnboardingTour: extracted inline step JSX into React components for hook access
- TOOLTIP_KEY at module scope to avoid React Compiler issues with in-component constants
- Tooltip only shows in sidebar expanded mode (collapsed too narrow for popover)
- Settings page: custom div layout for Display Language row (better FlagToggle alignment)
- Old LanguageToggle has zero consumers after migration -- ready for deletion
- SRSWidget and AchievementsTab already used conditional class pattern (showBurmese ? 'font-myanmar' : '') -- no changes needed
- TestPage and StudyGuidePage required wrapping font-myanmar blocks with {showBurmese && (...)}
- [Phase 28]: Cache name audio-v2 matches SW CacheFirst config for seamless offline playback
- [Phase 28]: Batch size of 6 parallel fetches balances speed vs connection saturation
- [Phase 28]: Partial failures tracked (not thrown) so interview starts with whatever cached
- [Phase 28]: checkNetworkQuality defaults to fast on unexpected errors to avoid blocking interview start
- [Phase 28]: Navigator connection typed via Record<string, unknown> to avoid eslint no-explicit-any
- [Phase 28]: highlightKeywords exported as pure utility for testability
- [Phase 28]: Word boundary regex with longest-first keyword sorting prevents partial-word highlights
- [Phase 28]: iOS Safari detection auto-detected via UA string, overridable via showIOSSafariHint prop
- [Phase 28]: TextAnswerInput uses textarea with no Enter key submit -- accepts multiline naturally
- [Phase 28]: ScreenOrientationWithLock interface extends ScreenOrientation for type-safe lock/unlock (TypeScript DOM lib omits lock method)
- [Phase 28]: History guard uses state object marker ({ interviewGuard: true }) to distinguish back press from hash routing popstate
- [Phase 28]: Orientation lock returns { locked, supported } tuple for conditional CSS landscape overlay fallback
- [Phase 28]: Loading phase runs precacheInterviewAudio and checkNetworkQuality in parallel
- [Phase 28]: 300ms delay after loading completes before transitioning to countdown for visual smoothness
- [Phase 28]: useRef loadingStarted flag prevents double-invocation in StrictMode
- [Phase 28]: TTSFallbackBadge uses compact (icon-only) and full (icon+text) variants
- [Phase 28]: LandscapeOverlay uses Tailwind landscape:flex portrait:hidden for CSS-only orientation detection
- [Phase 28]: Burmese rotation prompt text: simple imperative sentence for clarity
- [Phase 28]: ModeBadge uses fixed positioning (top-4 right-4 z-40) with backdrop-blur for visibility
- [Phase 28]: InterviewProgress uses progressbar role with aria-valuenow/max for accessibility
- [Phase 28]: InterviewTimer SVG ring uses strokeDashoffset with CSS transition for smooth countdown
- [Phase 28]: Three-tier urgency: white (>5s), amber (5s-3s), red (<3s) using CSS custom properties
- [Phase 28]: LongPressButton uses requestAnimationFrame (not setInterval) for smooth 60fps progress
- [Phase 28]: Refs only in event handlers (not render) for React Compiler safety in LongPressButton

### Roadmap Evolution

- Phase 28 added: Interview UX & Voice Flow Polish (Real/Practice mode UI/UX, voice flow improvements, error/fallback fixes)

### Research Notes

- Language mode touches 59 files, 334 font-myanmar occurrences, 171 conditional render points
- TTS consolidation must happen before TTS quality improvements
- Session persistence must happen before UX overhaul integration
- Burmese TTS requires pre-generated MP3 via @andresaya/edge-tts (no browser support)
- Phases 22 and 23 can run in parallel after shared dependencies complete

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-19
Stopped at: Completed 28-05-PLAN.md
Next step: Continue Phase 28 Wave 2 (plan 06) then Wave 3
Resume file: .planning/phases/28-interview-ux-voice-flow-polish/28-05-SUMMARY.md

---

*State initialized: 2026-02-05*
*Last updated: 2026-02-19 (Phase 28 plan 05 complete)*
