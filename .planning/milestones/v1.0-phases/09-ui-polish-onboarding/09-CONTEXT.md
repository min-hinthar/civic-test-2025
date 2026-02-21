# Phase 9: UI Polish & Onboarding - Context

**Gathered:** 2026-02-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace residual red color tokens with anxiety-reducing design tokens, wire up the existing onboarding tour for first-time users, surface offline sync status in the UI, and conduct a comprehensive UI audit with Duolingo-inspired visual overhaul across all pages. Use the `/frontend-design` skill for all UI design and implementation work.

</domain>

<decisions>
## Implementation Decisions

### Onboarding Tour Flow
- Enhance existing `react-joyride` OnboardingTour component (built in Phase 3), don't replace
- Add a welcome screen as Step 0 — centered modal with CSS-only American flag motif (gradients/shapes, no external images)
- Welcome screen is full bilingual (English + Burmese)
- Welcome auto-transitions to tour after 2 seconds (no button CTA)
- Add 2 new tour steps: SRS deck review + Interview simulation (7 steps total)
- All tour steps stay on Dashboard (single-page tour, no auto-navigation)
- Spotlight overlay style with smooth transition between steps (motion/react animations)
- Skip button always visible — users can bail out at any step
- Motivational bilingual close message on final step
- "Replay onboarding tour" button in Settings page via `forceRun` prop
- Tour trigger, progress indicator, back/next buttons, overlay click behavior, keyboard nav, language toggle step: Claude's discretion

### Sync Status Indicator
- Floating indicator at bottom-center (toast-like), only appears when items are pending sync
- Shows count + types (e.g., "2 test results, 1 review session pending")
- Icon + number only (language-neutral, no bilingual text needed)
- Auto-sync only — indicator is informational, no tap-to-sync action
- Animated tick-down as items sync, indicator slides away when empty
- Warning state (orange icon) when sync attempt fails
- No expandable detail on tap — informational only even in error state

### Red Token Replacement
- Red allowed ONLY for: data loss scenarios (delete account, clear history) AND authentication failures (wrong password, session expired)
- Red uses warm red tone (rose/coral, hue ~5-15), not harsh standard red
- Patriotic decorative red (flag motifs, stars) stays standard patriotic red — decorative, not semantic
- `destructive` token (delete buttons) uses warm red (critical data-loss actions)
- All other error/incorrect states use warning-500 orange
- Form validation errors use warning orange
- Audit scope: own components in `src/` only — third-party libraries keep defaults

### Full UI Audit — Duolingo-Inspired Overhaul
- **Design reference:** Duolingo — full Duolingo feel with civic/patriotic identity
- **Implementation:** Use `/frontend-design` skill for all UI design and implementation
- **Scope:** Comprehensive audit of all pages — consistency, polish, dark mode, responsive

#### Visual System
- More rounded: border-radius 16-20px for cards, 12px for buttons
- Intense gradients + intense shadows on cards for vibrant, high-energy feel
- Page backgrounds: enhanced feTurbulence paper texture (more visible)
- Bolder typography: heading font weights 700-800, larger sizes for punch
- 3D chunky buttons: bottom border/shadow for raised, tactile Duolingo feel
- Add accent colors: green for success, purple for achievements (keep blue as primary)
- Dark mode: same intensity as light mode, equally vibrant gradients/shadows
- Enforce Tailwind spacing utilities — replace all hardcoded px/rem values
- WCAG AA contrast standard (4.5:1 normal text, 3:1 large text)
- Enforce 44px minimum touch targets on all interactive elements
- Standardize animation values to established spring constants

#### Mascot & Illustrations
- Patriotic emojis as mascots: eagle, liberty torch, US flag, etc. (no custom character)
- SVG illustrations for empty states, celebrations, and key screens
- Patriotic emoji states for errors (sad eagle) and offline (flag)
- Animated icon reactions for test feedback: happy star/checkmark for correct, gentle nudge for incorrect + color feedback

#### Navigation
- Mobile: bottom tab bar with 5 tabs — Dashboard, Study, Test, Interview, Progress
- Active tab: colored icon + label (Duolingo pattern)
- Desktop: refreshed sidebar matching Duolingo-inspired aesthetic (icons, rounded items, active highlight)

#### Page-Specific Overhauls
- **Dashboard:** Reorganize layout — readiness score as hero element at top, rethink card arrangement and hierarchy
- **Landing page:** Full bilingual redesign from the start with patriotic motif, clear CTA, feature previews
- **Auth/login page:** Full Duolingo-inspired redesign with patriotic motif, welcoming bilingual text
- **Test page:** Full overhaul — horizontal progress bar at top + circular timer for countdown, animated icon reactions
- **Flashcards/Study Guide:** Full overhaul — category color header strip per USCIS category on each card
- **Progress page:** Duolingo-style vertical skill tree path with 7 sub-category nodes, sequential unlock (50%+ mastery), bronze/silver/gold rings
- **History page:** Keep tabs, apply visual refresh
- **Settings page:** Duolingo visual treatment — rounded cards, icons, grouped sections
- **Social hub:** Collaborative feel — community, encouragement, no competitive shame

#### Audit Checklist
- Burmese `font-myanmar` class on all Burmese text elements
- Loading states: standardize all pages to Phase 3 skeleton shimmer pattern
- Empty states: consistent design with bilingual text and encouraging tone
- Responsive: check all pages at mobile (375px), tablet (768px), desktop (1024px+)
- Animation consistency: all use established spring constants from Phase 3

#### Interactions & Sound
- Micro-interactions everywhere — all interactive elements get tactile feedback
- More exuberant celebrations: bigger confetti, bouncier animations
- Playful sound effects (bright, cheerful tones — dings, swoops, celebrations)
- Sound mute toggle in Settings
- Sound effects for: correct answer, incorrect answer, level up, milestone celebration

### Claude's Discretion
- Tour trigger timing (first visit vs first login)
- Tour progress indicator style (dots vs counter)
- Tour back/next button presence
- Tour overlay click behavior
- Tour keyboard accessibility
- Whether to highlight language toggle in a dedicated tour step
- Exact spring constants for new animations
- Specific emoji placement and frequency
- Sound effect implementation (Web Audio API patterns)
- Skill tree path visual design details

</decisions>

<specifics>
## Specific Ideas

- "Full Duolingo feel with civic/patriotic identity" — the app should feel like a learning game, not a study tool
- Patriotic emojis (eagle, liberty torch, US flag) as contextual mascots throughout the app
- CSS-only American flag motif for welcome screen (matching feTurbulence paper texture pattern — no external images)
- Skill tree path inspired by Duolingo's lesson path — vertical scrolling, nodes with bronze/silver/gold rings
- Welcome screen auto-transitions after 2 seconds — no button, just a moment to absorb the welcome
- Social hub should feel collaborative, not competitive — community studying together
- "Animated icon reactions + color" for test answer feedback

</specifics>

<deferred>
## Deferred Ideas

- Daily goal system (like Duolingo's XP target) — decided against for now, streak system is sufficient motivation

</deferred>

---

*Phase: 09-ui-polish-onboarding*
*Context gathered: 2026-02-08*
