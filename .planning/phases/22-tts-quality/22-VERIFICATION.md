---
phase: 22-tts-quality
verified: 2026-02-15T11:15:00Z
status: human_needed
score: 5/5 automated checks verified
must_haves:
  truths:
    - "User can select their preferred TTS voice from available system voices in Settings"
    - "User can set speech rate (slow/normal/fast) that applies consistently across all TTS contexts"
    - "TTS failures show user-visible feedback instead of failing silently"
    - "User sees an animated speaking indicator while TTS is actively playing"
    - "User can tap the speech button to pause active TTS, and tap again to resume (not restart)"
  artifacts:
    - path: "src/components/ui/VoicePicker.tsx"
      provides: "Voice selection dropdown with preview"
      status: verified
    - path: "src/pages/SettingsPage.tsx"
      provides: "Speech & Audio settings section with voice picker, speed, auto-read controls"
      status: verified
    - path: "src/components/ui/SpeechButton.tsx"
      provides: "Enhanced speech button with pause/resume, speed label, error state"
      status: verified
    - path: "src/components/ui/BurmeseSpeechButton.tsx"
      provides: "Myanmar flag speech button for pre-generated MP3 playback"
      status: verified
    - path: "src/hooks/useAutoRead.ts"
      provides: "Auto-read hook with triggerKey-based re-triggering"
      status: verified
    - path: "src/lib/audio/burmeseAudio.ts"
      provides: "Burmese audio adapter and URL helper"
      status: verified
    - path: "scripts/generate-burmese-audio.py"
      provides: "Edge-tts generation script for Burmese audio"
      status: verified (scripts committed, MP3 generation pending human action)
  key_links:
    - from: "src/components/ui/VoicePicker.tsx"
      to: "src/hooks/useTTS.ts"
      via: "speak() for voice preview playback"
      status: wired
    - from: "src/pages/SettingsPage.tsx"
      to: "src/hooks/useTTSSettings.ts"
      via: "updateTTSSettings for voice/rate/autoRead persistence"
      status: wired
    - from: "src/components/ui/SpeechButton.tsx"
      to: "src/hooks/useTTS.ts"
      via: "speak/pause/resume/cancel state management"
      status: wired
    - from: "src/hooks/useAutoRead.ts"
      to: "src/hooks/useTTS.ts"
      via: "speak/cancel for auto-triggered TTS"
      status: wired
    - from: "src/components/ui/BurmeseSpeechButton.tsx"
      to: "src/lib/audio/burmeseAudio.ts"
      via: "createBurmesePlayer for MP3 playback"
      status: wired
human_verification:
  - test: "Voice selection and preview"
    expected: "Selecting a voice in Settings plays preview sample with selected voice"
    why_human: "Audio playback requires real browser voices and human listening"
  - test: "Pause/resume TTS playback"
    expected: "Tapping speech button while speaking pauses; tapping again resumes from same position"
    why_human: "State timing and audio continuity need manual testing across browsers"
  - test: "Speed settings consistency"
    expected: "Setting slow/normal/fast in Settings applies to all screens (test, practice, study, interview)"
    why_human: "Cross-screen behavior requires navigating multiple app flows"
  - test: "Auto-read on navigation"
    expected: "With auto-read enabled, navigating flashcards/questions triggers automatic TTS after 300ms delay"
    why_human: "Timing and trigger behavior require manual interaction"
  - test: "Burmese audio playback (after MP3 generation)"
    expected: "BurmeseSpeechButton plays pre-generated MP3 for question/answer/explanation in Myanmar mode"
    why_human: "Requires MP3 files to be generated first; audio quality needs human listening"
  - test: "TTS error handling"
    expected: "When TTS fails, button shows red tint with error tooltip; no silent failures"
    why_human: "Error scenarios require simulating TTS unavailability or network issues"
---

# Phase 22: TTS Quality Verification Report

**Phase Goal:** Users hear clear, natural speech with control over voice and speed, including Burmese audio for all 128 questions

**Verified:** 2026-02-15T11:15:00Z  
**Status:** human_needed  
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can select their preferred TTS voice from available system voices in Settings | VERIFIED | VoicePicker component exists (90 lines), filters to English voices, plays preview on selection (line 49: speak(PREVIEW_TEXT)), persists via useTTSSettings |
| 2 | User can set speech rate (slow/normal/fast) that applies consistently across all TTS contexts | VERIFIED | TTSSettings.rate persisted globally; SpeechButton accepts rate prop; all screens (test/practice/study/interview) wire effectiveSpeed from overrides or global default |
| 3 | TTS failures show user-visible feedback instead of failing silently | VERIFIED | SpeechButton renders error state (red tint + tooltip) when useTTS.error is not null (line 109); VoicePicker shows "No voices available" message when filteredVoices.length === 0 |
| 4 | User sees an animated speaking indicator while TTS is actively playing | VERIFIED | SpeechButton renders SoundWaveIcon with animation when isSpeaking=true && !isPaused (line 148); ExpandingRings show when !shouldReduceMotion (SpeechAnimations.tsx) |
| 5 | User can tap the speech button to pause active TTS, and tap again to resume (not restart) | VERIFIED | SpeechButton handleClick (lines 80-95): isPaused -> resume(), isSpeaking -> pause() (or cancel on Android via isAndroid() check), idle -> speak() |

**Score:** 5/5 truths verified


### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| src/components/ui/VoicePicker.tsx | Voice selection dropdown with preview | VERIFIED | 90 lines; filters to en-* voices via lang.startsWith('en-'); plays preview via speak(); shows "No voices available" message; native select element for accessibility |
| src/pages/SettingsPage.tsx | Speech & Audio settings section | VERIFIED | Speech & Audio section (line 392+) with VoicePicker, speed pills, auto-read toggle, autoReadLang selector, burmeseVoice selector; all wired to updateTTSSettings |
| src/components/ui/SpeechButton.tsx | Enhanced button with pause/resume, speed label, error state | VERIFIED | 170+ lines; handleClick with pause/resume/speak logic; shows PauseIcon when paused; red tint when error; tooltips for unsupported/error/offline; speedLabel rendering; Android cancel fallback |
| src/components/ui/BurmeseSpeechButton.tsx | Myanmar flag speech button for MP3 playback | VERIFIED | 160+ lines; Myanmar flag SVG icon (3 stripes + star); createBurmesePlayer integration; pause/resume/error states matching SpeechButton; RATE_MAP for speed control |
| src/hooks/useAutoRead.ts | Auto-read hook with triggerKey-based re-triggering | VERIFIED | 69 lines; 300ms delay; silent retry once on failure (lines 46-56); cancelledRef for React Strict Mode safety; cleanup on unmount calls cancel() |
| src/lib/audio/burmeseAudio.ts | Burmese audio adapter and URL helper | VERIFIED | getBurmeseAudioUrl helper; createBurmesePlayer factory; HTMLAudioElement-based player with state subscription; retry-once error handling |
| src/lib/ttsTypes.ts | Extended TTSSettings type | VERIFIED | autoRead, autoReadLang, burmeseVoice fields added; AutoReadLang type ('english','burmese','both'); BurmeseVoice type ('nilar','thiha') |
| src/contexts/TTSContext.tsx | Backward-compatible settings defaults | VERIFIED | DEFAULT_SETTINGS includes new fields (autoRead: false, autoReadLang: 'both', burmeseVoice: 'nilar'); loadInitialSettings merges {...DEFAULT_SETTINGS, ...parsed} for backward compatibility |
| src/components/ui/SpeechAnimations.tsx | Shared animation components | VERIFIED | SoundWaveIcon, ExpandingRings, PauseIcon extracted to shared module; used by both SpeechButton and BurmeseSpeechButton to avoid duplication |
| scripts/generate-burmese-audio.py | Edge-tts generation script for 128 questions | VERIFIED | Python script with edge_tts integration; generates female/male voices; idempotent (skips existing files); 768 MP3 files generated and committed (7727aca) |
| scripts/export-questions.ts | TypeScript question export script | VERIFIED | Exports Burmese text (question_my, answer_my, explanation_my) to JSON for Python consumption; 1563 bytes committed |
| scripts/compress-audio.sh | ffmpeg compression script | VERIFIED | Shell script for 64kbps mono conversion; 1628 bytes committed; reduces file sizes ~50% |


### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| VoicePicker.tsx | useTTS.ts | speak() for voice preview | WIRED | Line 49: speak(PREVIEW_TEXT, { voice, lang: voice.lang }) on selection change |
| SettingsPage.tsx | useTTSSettings.ts | updateTTSSettings for persistence | WIRED | Lines 202, 215, 414, 482, 506, 541: updateTTSSettings calls for voice/rate/autoRead/autoReadLang/burmeseVoice |
| SpeechButton.tsx | useTTS.ts | speak/pause/resume/cancel | WIRED | Line 41: destructures all methods from useTTS; handleClick uses pause/resume/cancel/speak based on state |
| useAutoRead.ts | useTTS.ts | speak/cancel for auto-triggered TTS | WIRED | Line 34: const { speak, cancel } = useTTS(); useEffect calls speak with retry logic; cleanup calls cancel |
| BurmeseSpeechButton.tsx | burmeseAudio.ts | createBurmesePlayer | WIRED | Lazily creates player via getBurmesePlayer(); onStateChange subscription; play/pause/resume/cancel methods called in handleClick |
| FlashcardStack.tsx | useAutoRead.ts | Auto-read on card navigate | WIRED | useAutoRead hook integrated with currentIndex as triggerKey |
| TestPage.tsx | useAutoRead.ts | Auto-read on question change | WIRED | useAutoRead hook integrated with questionIndex as triggerKey |
| PracticeSession.tsx | useAutoRead.ts | Auto-read (answering phase only) | WIRED | useAutoRead hook gated on quizState.phase === 'answering' |
| PreTestScreen.tsx | TestPage.tsx | Per-session overrides | WIRED | onStart callback passes SpeechOverrides; TestPage stores in state and forwards to components |
| PracticeConfig.tsx | PracticePage -> PracticeSession | Per-session overrides forwarding | WIRED | PracticeConfigType extended; PracticePage stores speedOverride/autoReadOverride state and passes to PracticeSession props |
| InterviewSetup.tsx | InterviewPage -> InterviewSession | Per-session speed override | WIRED | InterviewSpeechOverrides passed via handleStart; InterviewPage forwards to InterviewSession and InterviewResults |
| Flashcard3D.tsx | BurmeseSpeechButton.tsx | Myanmar flag button on cards | WIRED | BurmeseSpeechButton rendered with questionId prop for MP3 URL lookup |
| StudyGuidePage.tsx | BurmeseSpeechButton.tsx | Burmese buttons in flip cards | WIRED | BurmeseSpeechButton integrated in all 4 flip card instances (category view + legacy grid) |
| InterviewSession.tsx | BurmeseSpeechButton.tsx | Burmese audio in Practice mode | WIRED | BurmeseSpeechButton rendered in ChatMessage for examiner questions; sequential English then Burmese playback |
| InterviewTranscript.tsx | BurmeseSpeechButton.tsx | Burmese buttons in transcript | WIRED | BurmeseSpeechButton rendered after each examiner question in Myanmar mode with speedLabel prop |


### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| TTS-01 | SATISFIED | Voice selection implemented with VoicePicker in Settings |
| TTS-02 | SATISFIED | Global speech rate in Settings; per-session overrides on pre-screens; rate applied consistently |
| TTS-03 | SATISFIED | Error state rendering in SpeechButton; "No voices available" message in VoicePicker |
| TTS-04 | SATISFIED | SoundWaveIcon animation when isSpeaking=true; ExpandingRings when !shouldReduceMotion |
| TTS-05 | SATISFIED | Pause/resume toggle in SpeechButton handleClick; Android gets cancel/restart fallback |
| TTS-06 | SATISFIED | 768 MP3 files generated and committed (7727aca); scripts + audio in public/audio/my-MM/ |

### Anti-Patterns Found

None detected. All code follows established patterns:

- Settings merge pattern for backward compatibility (DEFAULT_SETTINGS merge in TTSContext)
- Per-session overrides stay local (useState, never mutate global settings)
- Shared animation components extracted to module (SpeechAnimations.tsx)
- HTMLAudioElement adapter with state subscription (burmeseAudio.ts singleton player)
- React Strict Mode safety (cancelledRef in useAutoRead for cleanup)
- Debounce pattern for rapid-tap prevention (150ms window in SpeechButton)
- Android platform detection for pause/cancel fallback
- Module-level singleton player shared across BurmeseSpeechButton instances


### Human Verification Required

#### 1. Voice Selection and Preview Playback

**Test:**  
1. Navigate to Settings > Speech & Audio
2. Click the English Voice dropdown
3. Select a different voice from the list
4. Listen to the preview sample ("What is the supreme law of the land?")
5. Change voice again and verify preview plays with new voice

**Expected:**  
Preview plays immediately on selection with the chosen voice. Different voices have noticeably different characteristics (gender, accent, pitch). Preview completes without errors.

**Why human:**  
Audio playback requires real browser SpeechSynthesis API and human listening to verify voice quality and correctness.

---

#### 2. Pause/Resume TTS Playback

**Test:**  
1. Navigate to Study Guide or Flashcards
2. Tap a SpeechButton to start TTS
3. While speaking, tap the button again (should pause)
4. Verify button shows pause icon and dimmed state
5. Tap again to resume
6. Verify speech continues from where it paused (not restart)

**Expected:**  
First tap while speaking pauses TTS. Button shows PauseIcon (two vertical bars) in dimmed tts color. Second tap resumes speech from same position. Android devices may restart instead of resume (known platform limitation).

**Why human:**  
State timing, audio continuity, and cross-platform behavior (iOS Safari vs Android Chrome vs desktop) require manual testing.

---

#### 3. Speed Settings Consistency Across All TTS Contexts

**Test:**  
1. Go to Settings > Speech & Audio
2. Set speed to "Slow"
3. Navigate to Study Guide and tap SpeechButton (verify slow)
4. Navigate to Test and tap SpeechButton (verify slow)
5. Navigate to Practice and tap SpeechButton (verify slow)
6. Navigate to Interview Practice mode and listen to examiner (verify slow)
7. Change speed to "Fast" in Settings
8. Repeat steps 3-6 (all should now be fast)

**Expected:**  
All TTS contexts respect global speed setting. Per-session overrides on pre-screens (if set) override global. Speed label appears on buttons when enabled. Real mode interview always uses normal speed (ignores global setting).

**Why human:**  
Cross-screen behavior requires navigating multiple app flows and manually listening to TTS playback speed.

---

#### 4. Auto-Read on Question/Card Navigation

**Test:**  
1. Go to Settings > Speech & Audio
2. Enable "Auto-Read Questions" toggle
3. Navigate to Flashcards
4. Tap next card and verify TTS starts after ~300ms delay
5. Navigate to Test
6. Answer question and tap Continue, verify next question auto-reads
7. Navigate to Practice
8. During answering phase, tap Continue and verify next question auto-reads
9. During feedback phase, verify auto-read does NOT trigger

**Expected:**  
Auto-read triggers automatically after 300ms delay on navigation. Silent retry once on failure (no error toast). Practice session auto-read is gated to answering phase only (not feedback). User can still manually tap SpeechButton to interrupt/restart.

**Why human:**  
Timing behavior and trigger logic across different navigation flows require manual interaction and observation.

---

#### 5. Burmese Audio Playback (After MP3 Generation)

**Test:**  
PREREQUISITE: Run `python scripts/generate-burmese-audio.py` to generate MP3 files first.

1. Switch to Myanmar mode (bilingual)
2. Navigate to Study Guide
3. Tap Myanmar flag button on a flashcard and verify Burmese question MP3 plays
4. Flip card and tap back Myanmar flag button, verify Burmese answer MP3 plays
5. Navigate to Test
6. Tap Myanmar flag button and verify Burmese question MP3 plays
7. Navigate to Interview Practice mode
8. Verify examiner reads question in English, then Burmese MP3 plays sequentially
9. Check Interview Results transcript and verify Myanmar flag buttons appear for each question

**Expected:**  
BurmeseSpeechButton plays pre-generated MP3 files with correct Nilar (female) or Thiha (male) voice based on Settings. Audio quality is clear and natural (not robotic). MP3 files are cached by service worker after first fetch. Offline playback works for previously-fetched files. Error handling: missing MP3 shows error state but does not crash app.

**Why human:**  
Requires MP3 files to be generated first; audio quality, voice selection correctness, and caching behavior need manual verification.

---

#### 6. TTS Error Handling and Graceful Degradation

**Test:**  
1. Use a browser with no TTS voices installed (or mock by disabling speechSynthesis)
2. Navigate to Settings > Speech & Audio
3. Verify VoicePicker shows "No voices available" message
4. Navigate to Study Guide
5. Tap SpeechButton and verify button shows red tint and error tooltip
6. Go offline (disable network)
7. Tap SpeechButton and verify tooltip shows "(Limited audio offline)"
8. Verify Burmese buttons show error state when MP3 files are missing/unreachable

**Expected:**  
"No voices available" message in VoicePicker when no browser voices. SpeechButton shows red border/background with error tooltip when TTS fails. Offline tooltip appends "(Limited audio offline)" when idle and offline. Unsupported browsers show disabled button with explanatory tooltip. No silent failures: all TTS errors surface to UI.

**Why human:**  
Error scenarios require simulating TTS unavailability, network issues, and missing files; browser compatibility testing across platforms.

---

### Gaps Summary

No gaps. All requirements (TTS-01 through TTS-06) fully satisfied.

TTS-06 update: 768 MP3 files were generated and committed in `7727aca` after original verification. Audio generation checkpoint is complete.

---

*Verified: 2026-02-15T11:15:00Z*  
*Verifier: Claude (gsd-verifier)*
