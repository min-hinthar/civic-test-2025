# Phase 22: TTS Quality - Context

**Gathered:** 2026-02-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Enhance text-to-speech quality and control across the app. Users get voice selection, speed control, auto-read, Burmese pre-generated audio for all 128 questions (questions + answers + explanations), graceful error handling, and pause/resume. This phase also fills the 28 missing USCIS 2025 explanation objects. No new TTS consumers or features beyond what exists.

</domain>

<decisions>
## Implementation Decisions

### Voice Selection
- Dropdown with preview in Settings — tapping a voice plays a sample civics question ("What is the supreme law of the land?" or similar)
- Voice grouping/filtering: Claude's discretion (English-only filter or grouped by language)
- Interview mode uses the user's selected English voice (not a dedicated examiner voice)

### Speed Control
- 3 tiers: Slow (0.75x) / Normal (1.0x) / Fast (1.25x)
- Global default set in Settings page
- Per-session override available on pre-test, pre-practice, pre-interview, and study guide screens
- Pre-screen: speed pill selector added as a row below existing options (question count, timer, etc.)
- Per-session override does NOT sync back to global setting
- Small speed label (e.g., "1x") visible on the speech button during sessions
- Interview: Practice mode respects user's speed; Real mode uses fixed normal speed

### Auto-Read
- User-toggleable setting (off by default)
- Available in Settings AND on pre-test/pre-practice screens as per-session override
- Interview mode always auto-reads regardless of toggle (examiner simulation)
- Auto-read language setting (English / Burmese / Both) — default "Both" in Myanmar mode
- Study guide: auto-reads question text on front, answer text on back; explanation has manual audio button only
- Flashcards: auto-reads on navigate (both front and back)
- Test/Practice: auto-reads question text when new question appears
- Auto-read in Myanmar mode: respects auto-read language setting (English / Burmese / Both)

### Burmese Audio
- Pre-generated MP3s via edge-tts CLI
- Two voices: male and female, labeled by actual edge-tts voice names (e.g., "Nilar (Female)", "Thiha (Male)")
- Audio coverage: questions + answers + explanations for all 128 questions
- Audio hosting: Claude's discretion (public/ folder vs CDN, considering offline-first PWA needs)
- Offline caching: Claude's discretion (service worker strategy)
- Generation timing: Claude's discretion (build script, one-time manual, or CI)
- Playback routed through TTSProvider (unified controls — same pause/resume, speaking indicator, speed)
- Separate speech buttons: US flag for English, Myanmar flag for Burmese (visible in Myanmar mode only)
- Interview: Real mode = English only; Practice mode = English then Burmese in Myanmar mode

### Missing USCIS 2025 Explanations
- Write all 28 missing explanation objects for `uscis-2025-additions.ts`
- Match existing explanation style and depth
- Include both English and Burmese translations

### Speaking Feedback & Controls
- Animated speaking indicator: Claude's discretion (pulsing ring, sound wave bars, etc.)
- Speech button color: existing indigo-purple TTS speaking token (hsl 250)
- Tap behavior while playing: Claude's discretion (pause/resume vs stop/restart, based on cross-browser reliability)
- Tapping different speech button while one plays: Claude's discretion (auto-cancel vs block)
- Global indicator (top/bottom bar): Claude's discretion

### Error & Edge Case Handling
- TTS failure: inline error state on the speech button itself (red tint, tooltip) — no toast
- Burmese audio load failure: retry once, then show disabled state with tooltip "Burmese audio unavailable offline"
- Auto-read mid-session failure: silent retry once, then stop and let user tap manually
- No voices available: "No voices available" message in Settings voice picker with help link to browser voice settings
- Rapid speech button taps: Claude's discretion (cancel/restart or debounce)
- Unsupported browsers (no SpeechSynthesis): speech buttons visible but grayed out with tooltip "TTS not supported in this browser"
- Offline TTS: detect offline state, show small warning on speech buttons "Limited audio offline", still attempt playback

### Settings Page Layout
- Dedicated "Speech & Audio" section on Settings page
- Contains: voice picker (with preview), speed selector, auto-read toggle, auto-read language
- Burmese voice selection for Myanmar mode users

### Claude's Discretion
- Voice list filtering/grouping strategy
- Animated speaking indicator design
- Tap-while-playing behavior (pause/resume vs stop/restart)
- Multi-play behavior (auto-cancel vs block)
- Global speaking indicator (button only vs button + bar)
- Audio file format and bitrate
- Audio hosting strategy (public/ vs CDN)
- Service worker caching strategy for Burmese audio
- Edge-tts generation process (build script vs one-time vs CI)
- Rapid tap handling
- Testing strategy (unit tests for logic, manual for audio quality)

</decisions>

<specifics>
## Specific Ideas

- Voice preview uses a real civics question sample (e.g., "What is the supreme law of the land?")
- Burmese voices labeled by edge-tts voice names with gender in parentheses (e.g., "Nilar (Female)")
- Flag icons (US / Myanmar) differentiate the two speech buttons, matching existing FlagToggle pattern
- Pre-screen audio controls: single row with speed pill selector + auto-read toggle below existing options
- Interview Practice mode in Myanmar mode plays English then Burmese for learning support
- Interview Real mode always English-only for USCIS simulation accuracy

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 22-tts-quality*
*Context gathered: 2026-02-15*
