# Phase 6: Interview Simulation - Context

**Gathered:** 2026-02-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Simulated USCIS civics interview experience with audio-only question delivery via Web Speech API, verbal response with optional audio recording, self-grading, and results tracking. Two modes: Realistic (timed, early stop, no quit) and Practice (self-paced, full 20 questions, explanations available). Results integrate with mastery system and sync to Supabase.

**CRITICAL CORRECTION:** The real USCIS civics test is **20 questions, pass at 12 correct, fail at 9 incorrect** (not 10/6 as previously coded). This must be corrected across the entire app, not just interview mode.

</domain>

<decisions>
## Implementation Decisions

### Audio Delivery
- **Engine:** Browser Web Speech API (TTS) — free, works offline
- **Language:** English only audio (matches real USCIS interview)
- **Replay:** Up to 2 replays per question, with ~1 second pause before replay starts
- **Replay feedback:** Show remaining replay count to user (e.g., "1 of 2 replays used")
- **Speed:** Adjustable speech rate in settings (slow/normal/fast)
- **Text display:** Question text fades in AFTER TTS finishes reading — audio-first experience
- **Burmese text:** Optional toggle — user can show/hide Burmese translation alongside English text
- **Question number:** Visible on screen during audio playback (e.g., "Question 3 of 20")
- **Audio cue:** Subtle chime before each question starts reading
- **Offline:** Must work offline — Web Speech API has device-local voices
- **Fallback:** If browser doesn't support TTS, degrade to text-only mode gracefully
- **Voice selection:** Claude's discretion — pick practical approach based on Web Speech API capabilities
- **Answer TTS:** Correct answer is also read aloud via TTS after reveal

### Interview Flow & Pacing
- **Question count:** Always 20 questions (both modes) — matches updated USCIS format
- **Question selection:** Random 20 from the full 100 question bank
- **Two modes with distinct behaviors:**
  - **Realistic mode:** 15-second auto-advance timer (subtle shrinking progress bar, not number), early stop at pass (12 correct) or fail (9 incorrect), no pause, no quit, no progress bar, no running score, question number only
  - **Practice mode:** Self-paced (tap to advance), all 20 questions always, pause allowed, quit allowed, progress bar + question counter visible, running score visible
- **Interviewer greeting:** TTS reads a USCIS-style interviewer greeting/intro before questions begin (both modes) — 2-3 randomized greeting variations
- **Closing statement:** TTS reads closing statement after session — varies by pass/fail outcome
- **3-2-1 countdown:** Visual countdown before first question starts
- **Navigation:** Top-level nav item labeled "Practice Interview"
- **Entry:** Two separate cards/buttons on the Practice Interview page — "Realistic Interview" and "Practice Interview"
- **Setup screen:** Full setup screen with mode selection cards, expandable "What to expect" tips section, and recent interview scores (last few results)
- **Interviewer persona:** Simple silhouette/icon on screen, pulses when TTS is speaking
- **No ambient audio** — just TTS voice and chime
- **Realistic mode pass/fail:** Session stops naturally when threshold reached, transitions smoothly to results (not jarring mid-question interruption)
- **No quitting in realistic mode** — must complete once started
- **Practice mode quit:** Claude's discretion on partial save behavior
- **Question transitions:** Claude's discretion on inter-question transition timing/style

### Response & Reveal
- **Response method:** Verbal + audio recording — mic records user's spoken answer for self-review
- **Recording auto-start:** Microphone recording begins automatically after TTS finishes reading the question
- **Recording indicator:** Live audio waveform visualization while recording
- **Mic permission denied:** Degrade gracefully to verbal-only (honor system, no recording/playback)
- **Answer reveal:**
  - Realistic mode: Auto-reveal after 15-second timer expires
  - Practice mode: User taps "Show Answer" button
- **Self-grading:** Two buttons — "Correct" / "Incorrect" (simple binary)
- **Grade feedback:** Brief colored flash — success (green) for correct, warning (orange) for incorrect
- **Audio playback:** Play button on reveal screen lets user hear their recording alongside correct answer
- **Recording storage:** Session-only — recordings deleted when leaving results screen
- **Post-grade flow:** Realistic mode auto-advances to next question after grading; practice mode waits for user
- **Multi-answer questions:** Show primary answer + "also accepted" alternatives listed below
- **Explanation (WhyButton):** Available only in practice mode reveal
- **AddToDeckButton (SRS):** Available only in practice mode reveal
- **Grade buttons timing:** Appear immediately with text (don't wait for answer TTS to finish)

### Session Results
- **Results content:** Full analysis — pass/fail status, score (X/20), category breakdown by USCIS categories, comparison to past sessions via mini line chart
- **History storage:** Separate interview history (distinct from regular test history)
- **History sync:** Sync to Supabase (new table)
- **Mastery integration:** Correct/incorrect answers update per-category mastery scores
- **Celebration:** Confetti for pass, gentle encouragement for fail — consistent with existing app celebrations
- **Retry:** "Try Again" button + option to switch modes (realistic/practice)
- **Trend chart:** Mini line chart showing last 5-10 interview scores, combined single line with mode icon per data point
- **Explanation on results:** Claude's discretion on whether incorrect questions are expandable with WhyButton
- **No recording playback on results** — recordings are session-only, already discarded
- **Dashboard widget:** Interview-specific card showing last score + contextual suggestion (e.g., "Try realistic mode", "Practice weak categories")
- **History page:** New "Interview" tab on History page for interview-specific results
- **Interview setup:** Shows recent past interview scores for context

### Claude's Discretion
- Voice selection strategy for Web Speech API
- Inter-question transition timing and animation
- Practice mode quit behavior (save partial or discard)
- Whether incorrect questions on results screen include expandable explanations
- Interviewer silhouette/icon design details
- Countdown animation style

</decisions>

<specifics>
## Specific Ideas

- USCIS interviewer greeting simulation — "Good morning, I'm going to ask you some questions about U.S. history and government..." — read via TTS before questions start, 2-3 randomized variations
- Closing statement varies by outcome — pass gets encouraging closing, fail gets consoling closing
- Interviewer silhouette with pulse animation when speaking — gives sense of "someone asking"
- Audio waveform for recording indicator — more engaging than simple pulsing dot
- Text fades in AFTER audio finishes — forces listening practice, audio-first experience
- The 15-second timer in realistic mode is a subtle shrinking progress bar, NOT a visible number — reduces anxiety while maintaining time pressure
- "Primary answer + also accepted" pattern for multi-answer questions on reveal
- Dashboard widget with contextual suggestion nudges user toward next meaningful action

</specifics>

<deferred>
## Deferred Ideas

- **USCIS test format correction (20 questions / pass at 12 / fail at 9):** This must be fixed across the ENTIRE app (existing test mode, history, readiness calculations), not just interview simulation. Flagged as a prerequisite or parallel fix needed before/during Phase 6.

</deferred>

---

*Phase: 06-interview-simulation*
*Context gathered: 2026-02-07*
