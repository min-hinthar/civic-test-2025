# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** v2.3 Accessibility & Performance -- Phase 24 in progress

## Current Position

Phase: 24 of 25 (Accessibility & Performance)
Plan: 03 of 10 in current phase
Status: In progress (plans 02, 03 complete)
Last activity: 2026-02-18 -- Completed 24-03-PLAN.md (celebrations a11y, high contrast, skip link, focus management)

Progress: [##........] 20% (2/10 plans complete)

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
- v2.1: 40 plans (Phase 18: 7, Phase 19: 6, Phase 20: 6, Phase 21: 12, Phase 22: 9)

## Accumulated Context

### Decisions

All decisions archived in PROJECT.md Key Decisions table.

**Phase 24 decisions:**
- sr-only assertive region placed outside animated panel div to avoid animation delays affecting screen reader announcements
- Mock test verdict uses simpler text (no explanation) for USCIS simulation fidelity
- Segment container changed from role="progressbar" to role="list" for individual segment accessibility
- Segment status labels capitalized for screen reader clarity (Correct not correct)
- FlagToggle sr-only announcement uses aria-live="polite" (not assertive) since user initiated
- Toast container uses aria-live="polite" while individual toasts use conditional roles (alert vs status)
- Removed aria-atomic from toast container (each toast is a separate announcement)

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

### Research Notes

- Language mode touches 59 files, 334 font-myanmar occurrences, 171 conditional render points
- TTS consolidation must happen before TTS quality improvements
- Session persistence must happen before UX overhaul integration
- Burmese TTS requires pre-generated MP3 via @andresaya/edge-tts (no browser support)
- Phases 22 and 23 can run in parallel after shared dependencies complete

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-18
Stopped at: Phase 24 plan 02 complete
Next step: Continue Phase 24 plans (24-01, 24-04 through 24-10 remaining)

---

*State initialized: 2026-02-05*
*Last updated: 2026-02-18 (Phase 24 plan 02 complete -- screen reader announcements)*
