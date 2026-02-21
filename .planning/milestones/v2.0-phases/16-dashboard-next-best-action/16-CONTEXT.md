# Phase 16: Dashboard Next Best Action - Context

**Gathered:** 2026-02-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform the dashboard from an overwhelming wall of 16 sections into a focused landing page with one contextual "Next Best Action" recommendation, a compact stat row, and two preview cards linking to the Progress Hub. Users open the app to a clear, single recommendation of what to do next.

</domain>

<decisions>
## Implementation Decisions

### NBA Card Presentation
- **Hero card**: Full-width, tall card at the very top — dominates the viewport like an Apple-style feature card
- **Glass card with gradient accents**: Glass-morphism base with contextual gradient overlays that change per recommendation type
- **Contextual gradients**: Warm gradient for streak risk, cool blue for SRS, green for test readiness — visual urgency cues
- **Themed icon**: Contextual icon that changes per recommendation type (flame for streak, brain for SRS, target for test readiness)
- **Subtle pulse for urgent states**: Icon gently pulses/glows for time-sensitive recommendations (streak, SRS due), static for others
- **English primary, Burmese below**: English recommendation in larger text, Burmese translation underneath in smaller text
- **Bilingual hint text**: Brief one-liner reasoning hint below the recommendation in both languages (not a full explanation)
- **Hint text layout**: Claude's Discretion — pick what works best with card dimensions and text length
- **Specific CTA button text**: Button text changes per action ("Review 5 cards", "Take a test", "Practice weak topics")
- **Primary + subtle skip**: Primary CTA plus a small text link suggesting the second-best contextual alternative
- **Contextual skip link**: The secondary link suggests the next-best action, not a fixed destination
- **Spring entrance animation**: Energetic spring animation with scale on mount — feels alive and urgent
- **Animate transitions**: When recommendation changes (e.g., user completes SRS), card crossfades/slides to new recommendation in real-time
- **No dismiss/snooze**: NBA card always shows — the dashboard IS the recommendation
- **Label with icon**: Small badge/label at top-left (e.g., "Recommended for you") — adds personalized context
- **New user welcome**: Brand-new users see a warm welcome message with CTA to begin their first study session
- **Time estimate**: Claude's Discretion — include estimated time if reliable estimates are available per action type

### Priority Logic & States
- **Priority order**: Claude's Discretion — determine optimal priority order based on learning science
- **8 NBA states** (expanded from roadmap's 6):
  1. Brand new user (no data) — welcome + start studying
  2. Returning after 7+ day absence — warm welcome-back card with easy re-entry action
  3. Streak at risk — threshold determined by Claude
  4. SRS reviews due — spaced repetition cards waiting
  5. Weak category — name the specific category and mastery % (e.g., "Practice American Government — you're at 35%")
  6. No recent test (7+ days since last mock test) — nudge to test
  7. High mastery / test ready — threshold determined by Claude based on existing readiness score logic
  8. Celebration state — when doing great (long streak, high mastery, SRS caught up), congratulatory card
- **Weak category threshold**: Claude's Discretion — determine if absolute or relative threshold works better
- **Streak risk threshold**: Claude's Discretion — determine when to trigger streak-at-risk state
- **Test readiness threshold**: Claude's Discretion — pick based on existing readiness score logic and pass thresholds
- **Welcome-back priority**: Claude's Discretion — determine where 7+ day absence slots in the priority chain
- **Time/pattern awareness**: Claude's Discretion — determine if considering time of day adds value
- **Interview recommendation**: At very high mastery AND after passing at least one mock test, recommend interview simulation
- **Celebration CTA**: When all is well (high mastery + recent test + SRS caught up), suggest interview practice as graduation step
- **No recent test threshold**: 7+ days since last mock test

### Compact Stat Row
- **4 stats**: Streak, overall mastery %, SRS due count, questions practiced (X/128)
- **Icon + number + label**: Each stat as a small card with icon above, bold number, label below
- **Glass cards**: Each stat in its own small glass card — consistent with design system
- **Bilingual labels**: Both English and Burmese on each stat label
- **Tappable navigation**: Tapping mastery goes to Hub Overview, SRS goes to /study#review, etc.
- **Count-up animation**: Numbers animate from 0 to current value on dashboard load
- **SRS urgency coloring**: Color-coded SRS due count (green 0-2, amber 3-5, red 6+)
- **New user stats**: Claude's Discretion — decide whether to show zeros or hide until first session
- **Grid layout**: Claude's Discretion — pick 2x2 grid vs single row based on viewport responsiveness

### Dashboard Section Cleanup
- **Final dashboard layout** (top to bottom):
  1. Update Banner (kept at very top)
  2. Welcome Header — Claude's Discretion on keep vs merge into NBA
  3. NBA Hero Card
  4. Compact Stat Row (4 glass cards)
  5. Preview Cards: Category mini preview + Recent Activity (side by side on desktop, stacked mobile)
  6. Milestone Celebration Modal (kept)
  7. Badge Celebration Modal (kept)
- **Removed entirely**: Quick Action Buttons (replaced by NBA CTA), Readiness Indicator (replaced by NBA card), Overall Accuracy, Category Accuracy Breakdown, Suggested Focus, Empty State section (replaced by new-user NBA state)
- **SRS Widget, Streak Widget, Interview Widget, Badge Highlights, Leaderboard Widget, Category Progress**: Claude's Discretion — determine which are redundant given stat row and Hub
- **Preview cards**: Category mini preview shows top 3 weak categories; Recent Activity shows last 2-3 study sessions
- **Preview card style**: Slightly different from stat cards (taller/wider but still glass) — visual distinction between stats and previews
- **Preview card interaction**: Whole card tappable to navigate to relevant Hub tab

</decisions>

<specifics>
## Specific Ideas

- NBA card should feel like an intelligent coach — not just data display, but a personalized recommendation with reasoning
- The contextual gradient + themed icon + spring animation combination should make the NBA card feel "alive"
- The celebration state is important for positive reinforcement — acknowledge when users are doing well
- Interview recommendation as the "graduation step" after passing a mock test — creates a natural learning journey progression
- Preview cards side-by-side creates a balanced visual weight below the stat row

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 16-dashboard-next-best-action*
*Context gathered: 2026-02-11*
