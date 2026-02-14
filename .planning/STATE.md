# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** v2.1 Quality & Polish -- Phase 18: Language Mode (gap closure complete)

## Current Position

Phase: 18 of 25 (Language Mode)
Plan: 7 of 7 in current phase + gap closure
Status: Phase complete (gaps closed)
Last activity: 2026-02-14 -- Closed verification gaps in TestPage.tsx, StudyGuidePage.tsx

Progress: [##########] 100% (7/7 plans + gap closure)

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
- v2.1: 8 plans, ~75 min total

## Accumulated Context

### Decisions

All decisions archived in PROJECT.md Key Decisions table.

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

Last session: 2026-02-14
Stopped at: Phase 18 gap closure complete (TestPage, StudyGuidePage showBurmese guards added)
Next step: Begin Phase 19

---

*State initialized: 2026-02-05*
*Last updated: 2026-02-14 (Phase 18 gap closure -- showBurmese guards for TestPage + StudyGuidePage)*
