# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** Phase 32 — Celebration System Elevation (v3.0 World-Class UX)

## Current Position

Phase: 32 (celebration-system-elevation)
Plan: 4 of 6
Status: In Progress
Last activity: 2026-02-20 — Completed 32-04 (score animation & XP counter)

Progress: [###-------] 2/6 plans (Phase 32)

## Completed Milestones

| Version | Date | Phases | Plans | Requirements |
|---------|------|--------|-------|-------------|
| v1.0 | 2026-02-08 | 10 | 72 | 55/55 |
| v2.0 | 2026-02-13 | 7 | 47 | 29/29 |
| v2.1 | 2026-02-19 | 11 | 82 | 65/66 |

See `.planning/MILESTONES.md` for details.

## Performance Metrics

**Velocity:**
- v1.0: 72 plans in ~14 hours (~11 min/plan avg)
- v2.0: 47 plans in ~5 days, 162 commits, +32K/-8K lines
- v2.1: 82 plans in 6 days, 315 commits, +69K/-9K lines

## Accumulated Context

### Decisions

All prior decisions archived in PROJECT.md Key Decisions table.

- **34-01:** citation field optional per type definition (48/128 questions have it) -- not a gap
- **34-01:** Four narrative sections ordered for emotional arc: origin, mission, VIA, PCP
- **34-01:** Burmese text kept simple/direct per BRMSE-01 -- native speaker review may be needed
- **34-02:** Share button uses navigator.share with clipboard fallback for broad device support
- **34-02:** Filled Heart icon used for visual warmth on dedication cards and hero
- **34-02:** FadeIn animations staggered by 80ms per section for natural reading flow
- **34-03:** Heart icon in GlassHeader is independent of showSignIn/showBack, uses flex wrapper
- **34-03:** About row placed first in Settings Help & Guidance for prominence
- **34-03:** Narrative teaser uses warm emotional copy about Burmese community
- **30-02:** Reordered haptic exports to light/medium/heavy/double for logical grouping
- **30-01:** Overscroll guard scoped to @media (display-mode: standalone) only, not global
- **30-01:** User-select uses targeted interactive-element approach, not global none + whitelist
- **30-01:** Safe area insets via inline style env() for zero-cost on non-notch devices
- **30-03:** Motion value x initialized at 300 with imperative animate() for entrance -- avoids declarative/style conflict
- **30-03:** startTimeRef initialized to 0 (not Date.now()) for React Compiler purity
- **30-03:** AnimationPlaybackControlsWithThen lacks .catch() -- use .then(noop, handler) or chain .then().catch()
- **30-04:** Haptic calls in useEffect acceptable for celebrations/feedback that are always user-action-initiated
- **30-04:** FeedbackPanel uses hapticMedium for both correct and incorrect (same tier for all grading per user decision)
- **30-04:** ShareCardPreview hosts hapticMedium on success (after async share/copy), not ShareButton
- **30-04:** InterviewSession: hapticMedium on voice start, hapticLight on stop for distinct feedback
- **31-01:** Hybrid CSS+spring approach: CSS handles shadow/translateY on :active, motion handles scale on whileTap/whileHover to avoid transform conflicts
- **31-01:** Token-based colors (hsl(var(--primary-*))) over hardcoded HSL values for BilingualButton consistency
- **31-01:** BilingualButton outline/ghost both classified as tertiary tier (opacity fade) for simplified hierarchy
- **31-01:** SPRING_PRESS_DOWN (stiffness 800, damping 30, mass 0.5) for ~50ms settle on primary tier
- **31-02:** Task execution reordered: Task 2 (playDismiss) before Task 1 (Dialog refactor) to avoid broken intermediate typecheck
- **31-02:** transformOrigin computed in useEffect + useState, not useMemo, to avoid ref.current access during render (React Compiler compliance)
- **31-02:** DialogOverlayInner renamed internally but exported as DialogOverlay for backward compatibility
- **31-04:** Card interactive branch uses explicit initial object { opacity: 0, scale: 0.95, y: 0 } transitioning to idle variant for combined enter + hover
- **31-04:** GlassCard uses two-element approach (outer motion.div + inner glass div) to avoid backdrop-filter + transform WebKit conflict
- **31-04:** animate prop defaults to true; consumers inside StaggeredList should pass animate={false}
- **31-03:** Outline with negative offset for glass edge highlight avoids border/box-shadow conflicts
- **31-03:** Dark mode glass opacity bumped (0.55/0.45/0.35) for smokier car-window feel
- **31-03:** Purple tint gradient increased from 0.05 to 0.08 in dark mode for richer glass personality
- **31-03:** All glass tier assignments verified correct in Phase 31 audit -- no mismatches found
- **31-05:** Item animation y:12 + scale:0.97 for subtler slide-up (was y:20 + scale:0.9)
- **31-05:** 15+ items skip stagger entirely -- faster than any timed entrance
- **31-05:** hardwareConcurrency <= 4 threshold for low-end device stagger skip
- **31-05:** Custom stagger prop preserved for backward compat -- 7 consumers with explicit values unchanged
- **32-02:** Default harmonics: 2nd at 0.3 gainRatio, 3rd at 0.15 gainRatio for warm game-like tones
- **32-02:** Sweep-based sounds use parallel 2x frequency oscillator instead of playNoteWarm
- **32-02:** XP ding caps at E6 (1320 Hz) to prevent ear-piercing on long chains
- **32-02:** Fail reveal uses D4->C4 descent (not buzzer) for encouraging tone
- **32-02:** playCelebrationSequence maps card-enter to playPracticeComplete for subtle entrance
- **32-04:** dramaticEasing uses 3-phase curve: cubic ease-in (0-30%), fast linear (30-80%), quadratic ease-out (80-100%)
- **32-04:** Overshoot implemented as spring scale pop + floating +N indicator (countup.js easingFn clamps, so value overshoot not possible)
- **32-04:** Color shift tracked via formattingFn + useRef + setInterval polling (100ms) for smooth CSS transition
- **32-04:** XPCounter uses render-time state comparison pattern from XPPopup for React Compiler safety

### Blockers/Concerns

- **Phase 32 research flag:** DotLottie WASM performance on low-end Android is unverified. LottieFiles license terms for open-source PWA need review during planning.
- **Confetti.tsx setInterval leak:** Must be fixed (CELB-01) before building any new celebration work.

## Session Continuity

Last session: 2026-02-20
Stopped at: Completed 32-04-PLAN.md
Resume file: .planning/phases/32-celebration-system-elevation/32-04-SUMMARY.md
Next step: Continue with remaining Phase 32 plans (32-01, 32-03, 32-05, 32-06)

---

*State initialized: 2026-02-05*
*Last updated: 2026-02-20 (32-04 score animation & XP counter complete)*
