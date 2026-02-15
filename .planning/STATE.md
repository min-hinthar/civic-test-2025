# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** v2.1 Quality & Polish -- Phase 22 in progress

## Current Position

Phase: 22 of 25 (TTS Quality)
Plan: 02 of 9 in current phase
Status: In progress
Last activity: 2026-02-15 -- Completed 22-02-PLAN.md (SpeechButton enhancement)

Progress: [█░░░░░░░░] 11% (1/9 plans complete)

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
- v2.1: 31 plans (Phase 18: 7, Phase 19: 6, Phase 20: 6, Phase 21: 12)

## Accumulated Context

### Decisions

All decisions archived in PROJECT.md Key Decisions table.

**Phase 22 decisions:**
- Android gets cancel/restart semantics instead of pause/resume (Android Chrome pause bug)
- 150ms debounce window for rapid taps via useRef timestamp
- PauseIcon is static two-bar SVG (not SoundWaveIcon with animate=false)
- Native browser title tooltip (span wrapper) for error/unsupported/offline states
- Tooltip priority: unsupported > error > offline > none
- Online/offline state tracked with useState + window event listeners (self-contained, not OfflineContext)

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

Last session: 2026-02-15
Stopped at: Phase 22, plan 02 complete
Next step: Continue Phase 22 execution (plans 03-09)

---

*State initialized: 2026-02-05*
*Last updated: 2026-02-15 (Phase 22, plan 02 complete -- SpeechButton enhancement)*
