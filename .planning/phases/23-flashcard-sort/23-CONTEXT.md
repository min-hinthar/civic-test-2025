# Phase 23: Flashcard Sort Mode - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can toggle the flashcard page between Browse mode (existing) and Sort mode (new). Sort mode lets users swipe cards into Know/Don't Know piles with Tinder-style fling gestures, drill missed cards in subsequent rounds until mastery, and feed results into the SRS deck. Session persistence, progress tracking, and dashboard readiness integration are included.

</domain>

<decisions>
## Implementation Decisions

### Swipe & Sort Interaction
- Tinder-style fling gesture: card follows finger, rotates ~15 degrees in swipe direction, flings off-screen with momentum
- User controls flip: card starts on question side, user can optionally flip to see answer before swiping
- Both color overlay on card (green tint right / amber tint left) AND background zone labels ("Know" / "Don't Know") appear during drag
- Two buttons below card as alternative to swiping: Don't Know (left) and Know (right) — always visible
- Velocity-based commit threshold: fast flick commits regardless of distance; slow drag needs ~40% of card width
- Stacked deck: 2-3 cards visible in slightly offset stack behind the current card
- Undo button appears after each swipe — tapping it brings the last card back
- Both sound effects (whoosh on fling, ding for Know, thud for Don't Know) AND haptic feedback on commit
- TTS speech buttons (English + Burmese) available on cards during sort mode — same as Browse mode
- Respects current language mode: English-only shows English text only, Myanmar mode shows bilingual
- PillTabBar at top for Browse/Sort mode toggle — consistent with test/interview mode selectors
- Smart card source defaults: SRS due cards if any, otherwise all cards. Category filter available but not required.

### Round Flow & Drill Loop
- After sorting all cards: summary screen with 5-second auto-start countdown for next round (tap to skip or cancel)
- Summary stays visible with countdown overlaid on CTA button area (not full-screen takeover)
- Cards shuffled every round (including first round) — prevents pattern memorization
- Drill round cards show subtle category hint tag (e.g., "American Government") — mild context cue
- Session persistence via IndexedDB (reuse Phase 20 infrastructure) — prompt to resume on return
- Full resume prompt using ResumePromptModal from Phase 20 (shows round #, cards remaining)
- Undo history resets on resume — fresh undo stack for current session segment
- Exit button in header — tapping shows confirmation dialog
- 100% mastery celebration: confetti animation + triumphant chime sound
- Always shuffled initial round — every session feels fresh

### Progress & Scoring Display
- Live progress during sorting: dual counters (green Know count, red Don't Know count) + progress bar
- Segmented progress bar (one segment per card, color-coded) — adaptive: switches to continuous bar if card count > 40
- Counter animations: pop (spring scale) + color flash + sound on each increment — maximum juice
- Comprehensive end-of-round summary: Know %, Don't Know count, time taken, round number, improvement delta from last round
- Expandable list of missed cards on summary — user can review questions before drilling
- Per-category breakdown on summary (e.g., "American Government: 15/20 known")
- Improvement delta shown for round 2+: "+5 more known vs last round" with encouraging message
- Personal best record tracked: highest Know % on first round — shown on sort mode landing/summary
- Counter position: Claude's discretion

### SRS Integration Behavior
- SRS prompt appears at end of each round (not just end of session) — on the summary screen
- SRS add distinguishes new cards vs already-in-deck: "3 new cards to add, 5 already in your deck"
- Toast confirmation after adding: "Added 3 cards to your review deck"
- Sort results feed into dashboard readiness — weak categories from sorting inform study recommendations
- Personal best storage: Claude's discretion (localStorage vs Supabase based on existing sync infra)

### Claude's Discretion
- Round cap (unlimited vs capped at reasonable limit)
- Mastery credit policy for drill rounds (single Know vs consecutive Knows)
- SRS granularity (batch all vs checkboxes per card)
- SRS schedule effect of "Don't Know" on existing deck cards (reset vs lapse vs no effect)
- Whether "Know" swipes count as SRS reviews
- Smart default: whether to mix in non-due cards with due cards
- Counter positioning during sort

</decisions>

<specifics>
## Specific Ideas

- "Tinder-style fling" — dramatic, physical card physics with rotation during drag
- Stacked deck visual with 2-3 cards peeking behind current card
- "Maximum juice" on counters — pop animation + color flash + sound combined
- Confetti + chime for 100% mastery moment
- Reuse existing Phase 20 ResumePromptModal for sort session resume
- Reuse PillTabBar for Browse/Sort toggle (consistent with test/interview mode selectors)
- Reuse SegmentedProgressBar from Phase 21 (adaptive for high card counts)
- Category hints in drill rounds to help recall without giving away the answer

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 23-flashcard-sort*
*Context gathered: 2026-02-16*
