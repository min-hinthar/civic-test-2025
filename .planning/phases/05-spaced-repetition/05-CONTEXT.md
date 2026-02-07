# Phase 5: Spaced Repetition - Context

**Gathered:** 2026-02-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Personalized review scheduling using the FSRS algorithm. Users manually add questions to their review deck, study due cards in a flashcard-style session, and see review scheduling adapt based on their recall performance. Cross-device sync via Supabase with offline queuing. Interview simulation, social features, and new study modes are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Review session flow
- One card at a time, flashcard style (reuse 3D flip card from study guide)
- User chooses session size before starting (e.g., 10, 20, all due)
- Progress bar + card count shown during session ("Card 7 of 15")
- Optional timer toggle (some users want test pressure simulation)
- WhyButton (tap-to-expand) for explanations — not auto-shown
- After rating, briefly show next review interval ("Next review: 3 days")
- Exit mid-session saves progress — reviewed cards update, remaining stay in queue
- End-of-session: summary stats + nudge to practice weak categories
- Swipe gestures: right = Easy, left = Hard (with tap buttons as fallback)

### Card management
- Users manually add cards from study guide and test review screen (two touchpoints)
- Users can remove cards from their deck at any time
- Deck management page lives under Study Guide tab (alongside flashcards and review mode)
- Deck page shows cards with simple labels (New/Due/Done) + color-coded interval strength (red → yellow → green)
- Review mode accessible from Study Guide (not top-level nav)
- Dashboard widget taps navigate to study guide review tab

### Grading & difficulty model
- Binary rating: 2 buttons — Easy and Hard
- FSRS mapping: Easy → Good, Hard → Again
- Bilingual labels with icons on both buttons
- Swipe indicators: color gradient (green right / orange left) AND text labels at edges
- Green flash for Easy, orange flash for Hard, plus next-review interval text
- Brief bilingual encouragement message when user rates Hard
- No FSRS parameter customization — use sensible defaults
- Test/practice mode answers do NOT feed into SRS scheduling — review-only updates

### Dashboard & scheduling UX
- Dashboard SRS widget: compact by default, expandable
- Compact: due count + streak (Claude's discretion on exact layout)
- Expanded: due count, separate review streak, category breakdown, review heatmap
- Review heatmap: GitHub-style activity grid (Claude's discretion on day range based on mobile constraints)
- Streak is separate from existing study streak — specifically tracks daily review habit
- Bilingual streak messages
- Badge count on Study Guide nav for due cards
- Context-aware empty state: suggests adding cards if deck empty, shows encouraging "all caught up + next due time" if reviewed

### Notifications
- Push notifications when cards are due — user-configurable preferred reminder time in settings
- Reuses Phase 2 push notification infrastructure

### Claude's Discretion
- Whether forgotten (Hard) cards re-queue within the same session or just get shorter FSRS interval
- Rating button placement relative to flipped card
- Bulk-add option (e.g., "Add all weak questions") vs individual-only
- Deck page statistics detail level
- Compact widget summary content
- Heatmap day range
- Whether initial card difficulty is seeded from Phase 4 mastery data
- Full deck sync vs history-only sync across devices
- Conflict resolution strategy (last-write-wins vs event replay)
- Sync conflict notification (silent vs toast)
- Whether SRS works without login (local IndexedDB only) or requires auth

</decisions>

<specifics>
## Specific Ideas

- Review card reuses the existing 3D flip flashcard component from study guide (Phase 3)
- Swipe gestures with progressive color gradient + edge labels — "both gradient + labels for maximum clarity"
- Hard rating shows bilingual encouragement — matches the app's anxiety-reducing philosophy from Phase 3
- Partial offline: can review cached cards offline, scheduling updates queue via existing Phase 2 sync infrastructure
- Auto-sync only (no manual sync button) — SRS review events feed into existing sync queue patterns
- Summary screen at end of review nudges toward category practice for weak areas (connects to Phase 4)

</specifics>

<deferred>
## Deferred Ideas

- Myanmar font rendering fixes — UI/bug fix, not Phase 5 scope

</deferred>

---

*Phase: 05-spaced-repetition*
*Context gathered: 2026-02-07*
