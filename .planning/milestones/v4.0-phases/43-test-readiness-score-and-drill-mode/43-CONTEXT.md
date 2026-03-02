# Phase 43: Test Readiness Score and Drill Mode - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Surface a 0-100% readiness score on the Dashboard with per-dimension breakdown (accuracy, coverage, consistency), plus a dedicated drill mode targeting weak areas with pre/post improvement tracking. The readiness formula penalizes zero-coverage categories and projects FSRS retrievability. Category-level drill buttons appear on categories below mastery threshold. Test date setting and daily study targets belong to Phase 44.

</domain>

<decisions>
## Implementation Decisions

### Score Visualization
- Radial progress ring style (circular arc, percentage centered inside)
- Hero position — largest card at top of Dashboard, the centerpiece
- Large ring (~120-140px diameter), thick stroke (12-16px)
- Smooth gradient color: red through amber to green as fill increases
- Visible faint track behind the colored fill (Apple Activity style)
- Bold, large font (700+ weight, ~32-36px) for the percentage number inside ring
- 4-tier status labels below percentage:
  - 0-25%: "Getting Started"
  - 26-50%: "Building Up"
  - 51-75%: "Almost Ready"
  - 76-100%: "Test Ready"
- Title + subtitle header on the card (e.g., "Test Readiness" / "Based on your study history")
- Animate ring fill from 0 to current value on every Dashboard load (satisfying sweep)
- Subtle micro-interactions: gentle pulse on score change, soft glow on hover/tap
- Brighter/neon tones in dark mode so the ring pops against dark backgrounds
- Subtle gradient card background that shifts with score tier (warm red tones when low, cool green when high)
- 60% cap warning: small warning badge explaining "Score capped — you haven't studied [category]" with link to that category
- 0% empty state: show empty ring at 0% with encouraging text "Start studying to see your readiness"
- All status labels and text localized (Burmese translation when language is Burmese)

### Dimension Breakdown
- 3 mini radial rings side-by-side (visual echo of main ring) for accuracy, coverage, consistency
- Distinct colors per dimension (e.g., blue for accuracy, purple for coverage, teal for consistency)
- FSRS retrievability projection integrated into the consistency dimension score (no separate display)
- Tap-to-expand inline: tapping the ring card expands it — ring shrinks to ~80px, slides left/up, breakdown fills remaining space
- Smooth expand animation: card height transitions, ring shrinks with spring physics, breakdown elements fade/slide in
- Chevron toggle icon on card header (rotates when expanded) + tap to collapse
- Tooltip on tap for each dimension: brief explanation (e.g., "Coverage: % of all 128 questions you've attempted")
- Always starts collapsed on load (not persisted)
- Per-category list below dimension rings showing all 7 USCIS categories:
  - Sorted by ascending mastery (weakest first)
  - Each row: category name + mastery percentage + small "Drill" button for categories below 70% mastery threshold
  - Zero-coverage categories: red/warning accent with alert icon
  - Category names localized (Burmese when active)

### Drill Session Flow
- User chooses drill length: 5, 10, or 20 questions
- Pre-drill screen shows: focus areas (which categories/topics), question count selector, estimated time, "Start Drill" button
- Question format: same as existing practice mode (flashcard or quiz style) — familiar, no new learning curve
- Drill mode has distinct accent color (e.g., orange) or header badge so user knows they're in drill mode
- Question selection (main "Drill Weak Areas"): weakest questions across all categories regardless of topic
- Question selection (category-specific drill): only questions from that USCIS category
- Question order: randomized within the drill session
- If fewer weak questions than selected count: fill remaining with medium-mastery questions
- Progress bar at top showing "3 of 10" filling across
- Real-time mastery/FSRS updates per answer (early exit preserves all answered progress)
- User can exit early — shows partial results with "Completed 6 of 10 questions" note
- Reuse existing answer feedback (same sounds/visuals as current practice mode)
- Post-drill: only "New Drill" offered (re-selects weakest, no replay of same set)
- Multiple entry points: Dashboard + Progress Hub + end-of-practice suggestion when weak areas detected

### Improvement Display
- Full-screen dedicated results page after drill completion
- Headline metrics: overall drill score (e.g., 7/10) + mastery delta
- Mastery delta shown as animated counter: number counts up from pre to post value
- Animated mini readiness ring on results that animates from old to new value
- Consistent red→green gradient colors matching main readiness ring
- Tiered celebration based on drill score (questions correct):
  - 80%+ correct: confetti/celebration animation
  - 50-79% correct: encouraging message
  - Below 50%: motivational nudge
- No-improvement/decline: encouraging + specific tone ("Tough set! Review these topics and try again.")
- Partial completion: same celebration logic, just note "Completed 6 of 10 questions" — no judgment
- Three post-drill actions:
  1. "New Drill" — start another weak-area session
  2. "Practice [Category Name]" — links to weakest category from that drill
  3. "Back to Dashboard" — return to main view
- Updated readiness score shown (e.g., "Your readiness: 63% → 65%")
- No drill history tracking (each drill is standalone)
- Reuse existing animation patterns/libraries for confetti
- All text fully localized (Burmese translation)

### Claude's Discretion
- Drill CTA button placement (inside ring card vs separate card below)
- Exact spacing, padding, and typography details
- Exact dimension ring colors (blue/purple/teal are suggestions)
- Progress bar styling details
- Animation timing and easing curves
- Confetti/celebration animation implementation approach
- Error state handling throughout

</decisions>

<specifics>
## Specific Ideas

- Ring should feel like Apple's Activity Rings — thick, vibrant, satisfying fill animation
- Mini dimension rings echo the main ring creating a visual family
- The 60% cap warning should feel informative not punishing — "here's what's holding your score back" with a direct link to fix it
- Pre-drill screen sets expectations (estimated time, focus areas) so users know what they're committing to
- Animated counter on results page creates a dramatic reveal moment — counting from pre to post value
- Celebration tiers make the app feel alive and rewarding without overdoing it
- "Practice [Category Name]" post-drill button is prescriptive — takes user directly to their weakest category, not a generic picker

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 43-test-readiness-score-and-drill-mode*
*Context gathered: 2026-02-25*
