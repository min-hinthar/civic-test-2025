# Phase 21: Test & Practice UX Overhaul - Context

**Gathered:** 2026-02-14 (updated 2026-02-14)
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace auto-advance quiz flow with an explicit Check/Continue flow (Duolingo-style) in both Mock Test and Practice modes. Includes feedback panel, segmented progress bar, redesigned timer, keyboard navigation, redesigned results screen, and skip/review mechanics. Also includes a full Interview UX overhaul: chat-style conversation layout, animated examiner character, voice-only input, Practice/Real interview modes, and interview-specific results screen.

</domain>

<decisions>
## Implementation Decisions

### Feedback Panel (Test & Practice)
- Slide-up from bottom (Duolingo-style), no overlay/dimming on question area above
- Full-width color band background: green for correct, amber/red for incorrect
- Correct answer: shows "Correct!" message + the answer text the user selected
- Incorrect answer: shows user's wrong pick (dimmed/gray) + correct answer + explanation (Practice mode only, NOT mock test)
- Bilingual feedback: shows Burmese translations when in Myanmar language mode
- Advance via Continue button OR tapping anywhere on the panel (both work), NO swipe dismiss
- Sound effects: correct ding + incorrect buzz on Check
- Haptic feedback on mobile: light tap for correct, double-tap for incorrect (Vibration API)
- Animated icons: checkmark bounces in for correct, X shakes for incorrect
- Streak counter: shows "X in a row!" badge on consecutive correct answers
- TTS button on explanation text in Practice mode (read aloud the explanation)
- Timer pauses during feedback panel display in Mock Test mode
- Mock test stays multiple choice (not open text field)
- Panel height and question number display: Claude's discretion

### Progress Bar (Test & Practice)
- Full-width horizontal segmented bar at top
- Segment colors: Claude picks from design token palette (green/correct, red-or-amber/incorrect, gray/unanswered, blue/current, amber-yellow/skipped)
- Fraction label (e.g., "3/10") displayed alongside the bar
- Current segment has animated pulse to indicate position
- Smooth color fill transition when segment state changes
- Rounded/pill-like segment corners
- Tappable segments in Practice mode only (review answered questions), NOT in Mock Test
- Review via segment tap is read-only (cannot change answers)
- Live score tally ("7/8 correct") shown in Practice mode only, hidden in Mock Test
- Skipped questions get their own distinct color (amber/yellow), separate from incorrect
- Completion animation: sparkle/glow effect when all segments filled before results transition
- Bar scrolls with content (NOT sticky)
- Segment width handling for many questions and mobile label placement: Claude's discretion

### Skip Mechanic (Test & Practice)
- Dedicated Skip button next to Check (side by side, both prominent)
- Skip button is secondary/outline style, Check is primary/solid
- Skipped questions shown as amber/yellow in progress bar
- In Practice mode: "review skipped" phase at end of quiz presents skipped questions in original order
- In Mock Test: skipped questions stay skipped, no review phase

### Answer Selection & Check Flow (Test & Practice)
- Selected option: highlighted border + subtle background fill
- User can freely change selection before Check (tap different option to switch)
- Check button disabled until an answer is selected
- Brief intentional delay (200-300ms) after Check before showing result (builds suspense)
- After Check: answer options visually colored (correct option green, wrong pick red) IN ADDITION to feedback panel
- After Check: options become visually locked/disabled (unclickable)
- Single selection always (even for questions with multiple valid answers)
- Question number header ("Question 3 of 10") displayed above question text
- Answer options show text only (no letter prefixes A, B, C, D)
- Everything scrolls together (question + options in one scrollable view, nothing pinned)
- Question transition: slide left animation (current slides out, next slides in from right)
- First question has animated entrance (slide-from-right)
- SRS marking at end of quiz (batch approach on results screen), not after each Check

### Timer Redesign (Mock Test only)
- Circular countdown ring replacing current timer
- Color progression: green → yellow (< 2 min) → red (< 30 sec)
- Placement: Claude's discretion based on layout balance
- Timer pauses during feedback panel display

### Quiz Header & Exit (Test & Practice)
- Top bar with back/exit button (X), question info, and timer
- Exit mid-quiz shows confirmation dialog: "Your progress is saved. You can resume this session later."
- Escape key triggers the same exit confirmation dialog

### Results Screen — Test & Practice (Full Redesign)
- Big score number + pass/fail indicator
- Color-coded question list showing correct/wrong/skipped
- Category breakdown (which topics strong/weak)
- Time taken + comparison to previous attempts
- Action buttons: Retry (same quiz), Review (wrong + skipped only), Home (dashboard)
- Share button via native share API for score/pass-fail
- Celebration on passing (6/10+): confetti animation + glowing pass badge + sound effect
- SRS integration: offer to add wrong answers to SRS deck at end

### Keyboard Navigation (Test & Practice)
- Up/Down arrow keys directly select (highlight) answer options
- Context-sensitive Enter: Check when answer selected, Continue when feedback showing
- No number key shortcuts
- Visible focus ring on focused option (always visible, not focus-visible only)
- Standard Tab order: options → Skip → Check
- Escape opens exit confirmation
- Auto-focus to Continue button when feedback panel appears
- No visible keyboard shortcut hints on screen

---

### Interview Flow & Pacing
- Keep greeting phase before questions (simulates real USCIS experience)
- TTS auto-read + text display for each question (dual input)
- Voice-only answer input (microphone, no text fallback)
- Two modes: **Practice Interview** (immediate per-question feedback) and **Real Interview** (grading at end)
- USCIS 2025 rules: 20 questions, pass at 12 correct, fail at 9 incorrect
- Real mode: early termination at pass (12 correct) or fail (9 incorrect) thresholds
- Practice mode: always ask all 20 questions
- Brief examiner acknowledgment between questions in Real mode ("Thank you", "Next question")
- Gentle time limit per question: visual indicator after 15-20s, auto-advance eventually
- Timeout counts as skipped in Practice, incorrect in Real mode
- Repeat question: voice command ("repeat") OR tap button
- Rephrase option: user can request alternate wording, 1 rephrase per question (counts as additional attempt)
- Auto-detect silence to stop recording (no manual stop needed)
- Manual submit button as fallback: Claude's discretion
- Ambient sound effects: chime for new question, recording indicator sound, feedback sounds
- Show transcription to user before grading — user can confirm or re-record (up to 3 attempts)
- Re-record only (no text typing fallback)
- Animated audio waveform while recording
- Practice interview feedback: full feedback (correct/incorrect + correct answer + explanation) via chat bubble with TTS
- Real interview: no per-question feedback, examiner just acknowledges and moves on
- Examiner goodbye at end of interview (TTS)
- Real mode early termination: examiner explains outcome ("You've passed!" or "Unfortunately...")
- Response time tracked silently per question for analytics
- Exit mid-interview: allowed in Practice mode (with session save), NOT allowed in Real mode
- Warm-up question before scored questions: Claude's discretion

### Interview Visual Design
- Chat-style conversation layout: examiner messages on left, user answers on right
- Animated illustrated examiner character: professional illustration style (not cartoon)
- Character animations: idle breathing, speaking animation during TTS, nod/reaction on answers
- Character positioned at top of screen (large, prominent)
- User's transcribed answers appear as chat bubbles (right-aligned)
- User avatar (profile picture or initials) on user's chat bubbles
- Auto-scroll to latest message
- Typing indicator dots before examiner messages appear
- Recording area (mic + waveform) fixed at bottom of screen
- Repeat and Rephrase buttons appear as quick-reply buttons below examiner's question bubble (in chat flow)
- Distinct darker/moody color theme for interview screens
- Background: gradient/color with US flag SVG motif
- Character resize on mobile during recording: Claude's discretion

### Interview Results Screen
- Interview-specific results design (matches chat/interview aesthetic, NOT shared with test results)
- Comprehensive results: score + analytics + full scrollable transcript + comparison to previous attempts
- Transcript review: each answer bubble has color border (green/red) AND check/X icon
- Incorrect answers: tap to reveal correct answer (expandable, not inline)
- Action buttons: Retry + Review + Home + Share
- Share uses interview-branded format ("USCIS Interview Simulation" branding)
- Celebration on passing: confetti + glow badge + sound (same as test mode)
- Per-answer confidence score showing match quality (e.g., 85% match)
- Difficulty indicators per question
- Early termination point shown in results (e.g., "Interview ended at question 15 — you passed!")
- SRS integration: batch offer to add wrong answers to SRS deck (same as test mode)
- Performance trend chart: Claude's discretion
- Personalized recommendation ("You're ready!" or "Practice these topics"): Claude's discretion

### Claude's Discretion (Test & Practice)
- Feedback panel height (fixed vs dynamic)
- Question number display in feedback panel
- Check button position (fixed bottom vs below options)
- Progress bar segment width strategy for many questions
- Mobile layout for fraction label vs progress bar
- Timer ring placement relative to other elements
- Exact design tokens/colors for segment states
- Loading skeleton during question transitions

### Claude's Discretion (Interview)
- Warm-up question inclusion
- Manual submit button fallback for voice recording
- Mobile character resize behavior
- Progress indicator style per mode (Practice vs Real may differ)
- Performance trend chart on results
- Personalized recommendation on results

</decisions>

<specifics>
## Specific Ideas

- "Duolingo-style Check/Continue flow" — explicit reference for the overall test/practice UX pattern
- Practice mode is educational (more info: explanations, live score, review skipped), Mock Test is realistic (less info: no explanations, no live score, no skip review)
- Same Practice/Real split for Interview: Practice Interview = educational with per-question feedback, Real Interview = authentic USCIS simulation
- Celebration should be multi-sensory: confetti + glow badge + sound effect for passing scores (both test and interview)
- Slide-left card-swiping feel for question transitions
- Session persistence from Phase 20 integrated into exit confirmation messaging
- Interview chat layout should feel like a real conversation — typing indicators, auto-scroll, examiner avatar
- Professional illustrated examiner character with idle/speaking/reaction animations — NOT cartoon
- US flag SVG motif on interview background — patriotic and thematic
- Moderate fuzzy grading for spoken answers: accept minor variations but require key terms
- USCIS 2025 updated rules: 20 questions, 12 to pass, 9 to fail (not the old 10/6 format)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope (Interview UX was added to Phase 21 scope)

</deferred>

---

*Phase: 21-test-practice-ux*
*Context gathered: 2026-02-14*
