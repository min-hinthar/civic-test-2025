# Phase 44: Test Date Countdown and Study Plan - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Add test date setting with countdown display and adaptive daily study targets. Users can set their citizenship test date and receive a personalized study plan that adapts based on remaining time and current readiness. This phase does NOT include cross-device sync of the test date (Phase 46) or content enrichment (Phase 45).

</domain>

<decisions>
## Implementation Decisions

### Test date input
- Dashboard card is the primary entry point — a card that says "Set your test date" when no date is set
- Tapping opens a date picker (Claude's discretion on native vs custom calendar)
- "No date" mode supported — study plan works without a date using general pacing; countdown only appears once a date is set
- Test date is freely editable — tap the countdown/card to change anytime, study plan recalculates automatically
- Date stored in localStorage (consistent with other user preferences in the app)

### Countdown display
- Countdown appears as a Dashboard card when test date is set
- Urgency gradient tone — neutral when far out, shifts to warm urgency as date approaches (color transitions green → amber → red)
- Readiness score shown alongside days remaining ("23 days • 68% ready") for immediate context
- After test date passes — prompt user with "How did your test go?" offering Pass/Reschedule options; if reschedule, prompt for new date; if pass, show celebration

### Study plan logic
- Gap-based daily targets — calculate what's needed to reach readiness goal by test date, factoring in unpracticed questions, weak categories, and SRS due cards, distributed across remaining days
- Study plan feeds into NBA — adds "daily target" as a new NBA priority factor; NBA still decides the action but becomes test-date-aware; minimal disruption to existing flow
- Detailed activity breakdown — show specific tasks: "5 SRS reviews, 8 new questions, 1 drill session (History)" with estimated time
- Readiness target is fixed at 90% — ambitious but appropriate for civics test preparation

### Progress tracking
- Pace indicator — simple "On track" / "Behind" / "Ahead" label on the countdown card based on readiness vs expected readiness at this point
- Study plan completion integrates with existing streak system — completing daily plan counts toward streak maintenance
- Auto-redistribute on missed days — missed work spreads across remaining days with slightly increased daily targets; no guilt messaging, plan just adapts
- Subtle checkmark on daily completion — satisfying checkmark animation, save full celebrations for bigger milestones like reaching readiness targets

### Claude's Discretion
- Date picker implementation (native input vs custom calendar widget)
- Exact daily target calculation formula and minimum/maximum bounds
- Study plan card layout and information hierarchy details
- Skeleton/loading states for countdown and study plan
- How "estimated time" for daily plan is computed
- Bilingual strings for countdown and study plan UI (follow existing i18n patterns)

</decisions>

<specifics>
## Specific Ideas

- Countdown card should feel integrated with the existing Dashboard — same card style as ReadinessHeroCard and NBAHeroCard
- The pace indicator should be encouraging, not anxiety-inducing — this is for immigrants preparing for their citizenship test
- "No date" mode means the study plan still provides general daily recommendations based on readiness gaps, just without the countdown urgency

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ReadinessHeroCard` (src/components/readiness/ReadinessHeroCard.tsx): Card with tier-based gradients, expandable breakdown — pattern for countdown card
- `CompactStatRow` (src/components/dashboard/CompactStatRow.tsx): Stat chips with CountUp animations — could add countdown chip or integrate pace indicator
- `NBAHeroCard` (src/components/dashboard/NBAHeroCard.tsx): Hero recommendation card — study plan will feed into this system
- `useReadinessScore` (src/hooks/useReadinessScore.ts): Composes readiness from SRS + mastery + streaks — foundation for study plan gap calculation
- `useNextBestAction` (src/hooks/useNextBestAction.ts): Aggregates 5+ data sources into NBA recommendation — study plan adds test-date awareness here
- `determineNBA` (src/lib/nba/determineNBA.ts): Pure function NBA engine with priority chain — new "daily target" priority factor integrates here
- `useStreak` (src/hooks/useStreak.ts): Streak tracking with daily activity dates — study plan completion feeds into this
- `GlassCard` (src/components/ui/GlassCard.tsx): Card component used across dashboard
- `useCelebration` / `MasteryMilestone` / `BadgeCelebration`: Existing celebration patterns for completion rewards

### Established Patterns
- Dashboard uses composition hooks (useReadinessScore, useNextBestAction, useCategoryMastery) that feed into presentation components
- State stored in localStorage/IndexedDB (no server-side persistence in this milestone)
- Bilingual support via useLanguage context with { en, my } string objects
- Motion animations via motion/react with useReducedMotion accessibility support
- Tier-based color gradients (red/amber/blue/green) for score visualization

### Integration Points
- Dashboard.tsx: New countdown card component slots into existing StaggeredList layout
- NBA engine (determineNBA.ts): New priority factor for test-date-aware recommendations
- useStreak: Study plan completion as streak activity
- localStorage: Test date persistence key
- Readiness scoring: Gap calculation for daily targets uses existing readiness dimensions

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 44-test-date-countdown-and-study-plan*
*Context gathered: 2026-03-01*
