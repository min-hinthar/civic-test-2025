# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** v2.1 Quality & Polish -- Phase 20 COMPLETE, ready for Phase 21

## Current Position

Phase: 20 of 25 (Session Persistence) -- COMPLETE (VERIFIED)
Plan: 6 of 6 in current phase
Status: Phase complete, verified
Last activity: 2026-02-15 -- Phase 20 complete + verified (6/6 must-haves, 7/7 requirements)

Progress: [██████████] 100% (6/6 plans complete)

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
- v2.1: 19 plans (Phase 18: 7, Phase 19: 6, Phase 20: 6)

## Accumulated Context

### Decisions

All decisions archived in PROJECT.md Key Decisions table.

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
Stopped at: Phase 20 verified complete
Next step: Phase 21 (Test & Practice UX Overhaul) — plan then execute

---

*State initialized: 2026-02-05*
*Last updated: 2026-02-15 (Phase 20 COMPLETE + VERIFIED -- 6/6 plans, 7/7 requirements)*
