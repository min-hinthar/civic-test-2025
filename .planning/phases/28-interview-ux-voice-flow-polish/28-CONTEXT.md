# Phase 28: Interview UX & Voice Flow Polish - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish the interview simulation experience: make the voice flow reliable via audio pre-caching, improve Real/Practice mode visual differentiation and feedback, add text input fallback with keyword grading, and handle mobile/error edge cases gracefully. This phase refines the existing interview built in Phase 21 and enhanced in Phases 22/26 — no new interview modes or capabilities.

</domain>

<decisions>
## Implementation Decisions

### Voice Flow Reliability
- Pre-cache ALL audio before interview starts: questions (20), greetings, closing statements, and feedback phrases
- Pre-cache includes both English and Burmese MP3s when user is in bilingual mode
- All examiner speech is pre-generated MP3 (questions, greetings, closings, AND feedback phrases like "Correct!"/"That's not quite right...")
- Show "Loading audio..." progress bar during the 5-4-3-2-1 countdown — interview only starts when all audio is cached
- If pre-caching partially fails (network issues), start with whatever was cached; for uncached audio, fall back to browser TTS on the fly
- Subtle badge/icon indicates when browser TTS fallback is being used instead of pre-cached MP3
- Keep random greeting pool (current behavior) — varied greetings feel more natural
- Keep MAX_REPLAYS = 2 per question (matches USCIS interview reality)
- Keep current voice speed behavior: Real mode = fixed normal speed, Practice mode = respects user's speed setting
- Single examiner voice (Ava) — no male/female option
- Keep English-first then Burmese audio order in Practice bilingual mode

### Real vs Practice Mode UX
- Same dark interview aesthetic for both modes; small 'REAL' or 'PRACTICE' badge in corner indicates mode
- Practice mode reads correct answer aloud (pre-generated audio) after grading — helps auditory learners
- Practice exit uses confirmation dialog: "Are you sure? Your progress will be saved." with Continue/Exit options
- Real mode has hidden long-press exit (3 seconds on exit button) for emergencies — session discarded, not obvious
- Keep typing indicator at 1.2 seconds before each question
- Interview setup screen shows last 3 interview scores and best score below mode selector
- Real mode 15-second timer: amber at 5s, red at 3s with gentle pulse animation for urgency
- Keep transition delay at 1.5 seconds between grading and next question for both modes
- Real mode hides running score — no score shown during interview (hidden until results)
- Real mode progress bar uses monochrome segments (no green/red coloring) — matches "hidden until results" decision
- Practice mode shows colored segments (green/red) as normal
- Practice mode: always move on after incorrect answer (no "Try Again" option)
- Progress indicator shows both question number (Q3/20) AND progress bar

### Speech Input & Grading
- Text input fallback when speech recognition unavailable (Firefox, Safari iOS) — multi-line textarea with placeholder text
- Auto-grade typed answers using the same gradeAnswer() keyword matcher
- Text submit via explicit Send button only (no Enter key submit) — better for mobile
- Keyboard/text toggle only appears when speech recognition IS available; if no speech support, text input is the only mode (no toggle needed)
- Same grading tolerance for both Real and Practice modes (current lenient keyword matching)
- Keep current TranscriptionReview behavior for low-confidence transcriptions
- Keep current AudioWaveform for mic input visualization
- Keep current mic permission request timing
- Keep current silence detection timeout (fixed value, not mode-dependent)
- Show previous transcription when re-recording (up to 3 attempts) so user can see what was misheard
- Practice mode: highlight matched keywords in green in the user's answer, show missing keywords — educational feedback
- Real mode results transcript: also show keyword highlights (both modes get keyword analysis in transcript)
- iOS Safari users: show "For voice input, try Chrome" suggestion message, then fall back to text input

### Error & Edge Cases (including mobile)
- Offline mid-interview: continue with pre-cached audio (since all audio is pre-cached, interview can proceed offline)
- Mobile keyboard: auto-scroll chat view so input area and latest question are visible above virtual keyboard
- Mic permission denied: block and explain how to enable mic permission; user must grant mic OR explicitly choose text mode to proceed
- Android TTS: use existing cancel/restart workaround pattern (no pause, cancel and re-speak)
- Audio focus loss (phone call, app switch): auto-pause interview; resume when focus returns
- Network quality check before start: test connection speed, show warning if slow ("Slow connection detected. Audio may take longer to load.")
- Browser back swipe on mobile: intercept back navigation with "Leave interview? Progress will be saved." confirmation
- Storage full (IndexedDB): graceful degradation — show toast "Couldn't save progress" but let interview continue
- Screen rotation: lock to portrait orientation during interview using Screen Orientation API
- Low battery: no special handling (existing reduced motion support is sufficient)

### Claude's Discretion
- Chime audio: Claude decides whether to keep synthesized Web Audio chime or switch to pre-generated MP3
- Tab backgrounding behavior: Claude picks best approach per mode (Real vs Practice may differ)
- Pre-cache timing: Claude decides whether to start on interview page load or during countdown
- Feedback phrase set: Claude determines appropriate phrases based on what USCIS officers actually say
- Examiner character animation expressiveness: Claude decides if subtle eye/mouth animation tweaks are worth adding
- Interview-specific screen reader a11y: Claude determines what's missing from existing Phase 24 a11y work

</decisions>

<specifics>
## Specific Ideas

- "TTS should not fail with pre-generated MP3" — user's core expectation is that audio is reliable and pre-loaded
- Progress bar should show BOTH "Question 3 of 20" text AND a visual bar for clear progress tracking
- Keyword feedback in answers should highlight matched words in green within the user's transcribed/typed answer text
- Real mode should feel like a USCIS simulation: no score hints, monochrome progress, hidden until results
- Interview setup screen should motivate users by showing their recent performance history
- Mobile errors are a key concern — screen rotation, back swipe, keyboard overlap, focus loss all need handling

</specifics>

<deferred>
## Deferred Ideas

- Male/female examiner voice choice — could be its own enhancement phase if users request it
- Adjustable silence detection timeout — keep fixed for now, revisit if users struggle with timing
- "Try Again" option for incorrect answers in Practice mode — could add to a future learning-enhancement phase

</deferred>

---

*Phase: 28-interview-ux-voice-flow-polish*
*Context gathered: 2026-02-18*
