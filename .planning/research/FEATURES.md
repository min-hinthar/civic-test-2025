# Feature Landscape: v2.1 Quality & Polish

**Domain:** Bilingual civics test prep PWA -- UX overhaul, TTS quality, card interactions, accessibility
**Researched:** 2026-02-13
**Focus:** Duolingo-style test UX, Quizlet-style card interactions, natural TTS voices, language mode toggle behavior, session persistence with resume, accessibility best practices for learning apps

## Context: What v2.0 Already Delivers

v2.0 shipped phases 11-17. The following already exist and form the foundation for v2.1 polish:

- Mock test with 20 questions, 1.5s auto-advance after answer, horizontal progress bar, 3D chunky answer buttons, circular timer, correct/incorrect sound effects (oscillator-based), confetti on completion
- Practice mode with category selection, weak areas, configurable question count, optional timer
- Interview simulation with realistic/practice modes, TTS reading (Web Speech API), self-grading, audio recording
- Study guide with 3D flip flashcards, bilingual content, horizontal swipe navigation (FlashcardStack), SRS review with swipe-to-rate (ReviewCard)
- Language context with `bilingual` | `english-only` toggle, persisted to localStorage
- Sound effects via Web Audio API oscillators (correct ding, incorrect tone, level-up arpeggio, milestone chord, swoosh)
- Navigation lock during active test sessions (beforeunload + popstate + context lock)
- Dashboard with NBA contextual CTA, compact stat row
- Progress Hub with 4 tabs (Overview/Categories/History/Achievements)
- Save session guard with mutex-protected saves
- Reduced motion support via `useReducedMotion` hook

**Current UX gaps identified for v2.1:**
- Auto-advance (1.5s delay) feels rushed; no user control over pacing
- No explicit "Check" step before committing an answer
- Feedback is inline text only; no bottom sheet or full-width feedback panel
- No session persistence -- closing the browser loses test/practice progress
- Flashcards only support navigation swipe; no "know/don't know" sorting
- TTS uses Web Speech API only; voice quality varies drastically by device/browser
- Language toggle is global but doesn't affect TTS behavior or content filtering
- No aria-live announcements for correct/incorrect feedback
- No haptic feedback on answer selection

---

## Epic 1: Duolingo-Style Test & Practice UX

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **Explicit Check button with bottom feedback panel** | Duolingo's core pattern: select answer, then tap "Check" to confirm. Bottom panel slides up with green (correct) or red (incorrect) background, correct answer text, and "Continue" button. This two-step flow prevents accidental answer commits and gives users a moment to reconsider. Current app auto-commits on tap. | Med | TestPage.tsx, PracticeSession.tsx, AnswerFeedback.tsx |
| **Bottom feedback banner (green/red slide-up)** | After checking, a full-width banner slides up from bottom: green with checkmark + "Correct!" for right answers, red/amber with X + "Incorrect" + correct answer for wrong answers. This is THE signature Duolingo interaction -- users of any learning app expect it in 2026. | Med | New BottomFeedbackPanel component, motion/react AnimatePresence |
| **User-controlled pacing (Continue button replaces auto-advance)** | Current 1.5s auto-advance is too fast for users who want to read explanations, and too slow for power users. Duolingo never auto-advances -- user must tap "Continue" or "Got It". This respects user pace while maintaining flow. | Low | Remove FEEDBACK_DELAY_MS timeout, add Continue button |
| **Progress bar with segmented fill** | Current progress bar is a simple percentage fill. Duolingo uses a segmented bar where each segment represents one question, colored green (correct), red (incorrect), or gray (unanswered). Gives at-a-glance performance picture, not just position. | Med | Progress component enhancement |
| **Streak/XP micro-reward within session** | During a session, show "+10 XP" or streak count increment after correct answers. Duolingo shows XP gain after each correct answer as a small animated counter. Reinforces every correct answer. | Low | Existing streak/badge infrastructure |

### Expected Behaviors

**Answer submission flow (Duolingo pattern):**

```
1. Question displayed with answer options
2. User taps an option -> option highlights (selected state, blue/primary border)
3. "Check" button activates at bottom (was grayed out before selection)
4. User taps "Check" -> answer is committed
5. Bottom feedback panel slides up:
   - CORRECT: Green bg, checkmark icon, "Correct!" text (en + my), Continue button
   - INCORRECT: Red/amber bg, X icon, "Incorrect" text, correct answer shown, Continue button
   - Sound plays (existing playCorrect/playIncorrect)
   - Haptic feedback (navigator.vibrate if available)
6. User reads feedback, optionally expands explanation (WhyButton)
7. User taps "Continue" -> panel slides down, next question slides in
```

**Critical difference from current behavior:** Current flow commits the answer on first tap (step 2 = step 4 combined). This prevents changing your mind and creates accidental submissions, especially on small touch screens. The two-step flow is table stakes for 2026 quiz UX.

**Bottom feedback panel anatomy:**
- Full-width, pinned to bottom of viewport (not scrolling content)
- Height: ~120-160px (enough for answer text + Continue button)
- Background: `bg-success/10` (correct) or `bg-warning/10` (incorrect) with subtle border-top
- Icon: Animated checkmark or X (scale spring animation)
- Text: Bilingual feedback ("Correct! / မှန်ပါသည်!" or "Review this answer / ဤအဖြေကို ပြန်လည်သုံးသပ်ပါ")
- Correct answer (when incorrect): "The answer is: [correct answer]" in both languages
- Continue button: Full-width, 3D chunky style, matches feedback color (green/amber)
- Slide-up animation: `translateY(100%) -> translateY(0)` with spring physics

**Progress bar segments:**
- Each question = one segment of equal width
- Colors: green (answered correctly), red/amber (answered incorrectly), gray (upcoming), blue-pulse (current)
- On answer: current segment animates to green or red
- On mobile: segments are thin (4px height) for space efficiency

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Keyboard shortcut for Check/Continue** | Enter key = Check (when answer selected) or Continue (when feedback shown). Space/1-4 = select answer options. Power users can speed through without touching mouse. | Low | KeyboardEvent listeners |
| **Explanation expansion pauses session timer** | When user expands WhyButton explanation, practice timer pauses (already partially implemented). Make this systematic across all modes. | Low | Existing handleExplanationExpandChange pattern |
| **Haptic feedback on Check** | `navigator.vibrate(10)` on correct, `navigator.vibrate([20, 50, 20])` on incorrect. Subtle physical reinforcement. Free on Android; no-op on iOS (not supported in PWAs). | Low | navigator.vibrate API |
| **Answer change before Check** | User can tap a different answer before hitting Check. Selected option changes. Only possible with the two-step flow. | Low | State management in answer selection |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Auto-advance after feedback** | Current 1.5s auto-advance is the primary UX complaint. Never auto-advance. User controls pacing. | Continue button only. No timeout. |
| **Heart/life system** | Duolingo's hearts limit mistakes per session. Punitive for test prep where making mistakes is part of learning. | Unlimited attempts. Track accuracy but never block progress. |
| **Animated mascot reactions** | Duolingo has Duo owl reacting to answers. Cute but scope creep -- adds asset complexity, increases bundle, not needed for serious test prep. | Keep feedback to icons, colors, and sounds. |
| **Full-screen answer transition** | Some quiz apps do full-screen green/red flash. Disorienting, accessibility concern (photosensitivity), and overkill for a test prep app. | Bottom panel only. Content area stays stable. |

---

## Epic 2: Quizlet-Style Flashcard Interactions

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **Know/Don't Know sorting** | Quizlet's core flashcard pattern: swipe right = "Know", swipe left = "Don't Know". Cards sort into two piles. End of session shows how many you knew vs. didn't. Then re-study the "Don't Know" pile. Currently, FlashcardStack only supports navigation swipe (left/right = previous/next). | Med | FlashcardStack.tsx refactor, new FlashcardSortMode component |
| **Progress counter with know/don't-know tallies** | Quizlet shows "3 of 20" plus separate counts: "Know: 8 / Still Learning: 5". Users need to see their sorting progress, not just card position. | Low | UI state for sorted counts |
| **End-of-round summary** | After going through all cards, show: "You knew 15/20. Study the 5 you missed?" with option to restart with only missed cards. Quizlet does this automatically. | Med | Summary screen component, filtered card re-queue |
| **Card flip with tap AND swipe** | Current cards support tap-to-flip. Keep this AND add: swipe up/down for flip (alternative gesture), swipe left/right for know/don't-know sorting. Gesture must not conflict with navigation. | Med | Gesture disambiguation in FlashcardStack |

### Expected Behaviors

**Flashcard study mode redesign:**

Currently the app has two card interaction modes:
1. **FlashcardStack** (study guide): Swipe left/right = navigate, tap = flip. Pure browsing.
2. **ReviewCard** (SRS review): Swipe left = Hard, swipe right = Easy. Tap = flip.

**Proposed v2.1 mode: "Sort Mode" (Quizlet-style):**

```
1. Card shows question face
2. User taps card to flip (see answer)
3. User swipes right = "Know" (card flies off right with green trail)
   OR swipes left = "Don't Know" (card flies off left with amber trail)
   OR taps "Know" / "Don't Know" buttons below card
4. Next card slides in from center/bottom
5. Counter updates: "Card 4 of 20 | Know: 2 | Learning: 1"
6. After all cards:
   - Summary: "You knew 15 of 20! Great progress!"
   - "Study missed cards" button (re-queues the 5 "Don't Know" cards)
   - "Done" button (return to study guide)
7. Second round through missed cards, repeat until all "Know"
```

**Gesture disambiguation:**
- In Sort Mode: Left/right swipe = sort (know/don't know). No navigation swipe.
- In Browse Mode (current): Left/right swipe = navigate. No sorting.
- Mode toggle: Button at top of FlashcardStack ("Browse" vs "Sort")
- Flip: Tap always flips. Consider swipe up as alternative flip gesture.

**Visual feedback during swipe:**
- Already exists in ReviewCard: progressive color gradient (green right, amber left), edge labels ("Easy" / "Hard")
- Adapt this same pattern for Sort Mode with "Know" / "Don't Know" labels
- Card rotation during swipe: 0-15 degrees proportional to drag distance
- Release threshold: 80px (same as ReviewCard's SWIPE_THRESHOLD)

**Star/bookmark integration:**
- Quizlet allows starring individual cards during study for later review
- The app already has AddToDeckButton (adds to SRS deck). This IS the star equivalent.
- Surface AddToDeckButton more prominently on the card face during Sort Mode
- "Don't Know" cards could auto-suggest "Add to deck?" after sorting

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Auto-add "Don't Know" to SRS deck** | Cards sorted as "Don't Know" are automatically offered for SRS deck addition. Bridges study guide and spaced repetition without manual effort. | Low | Existing AddToDeckButton/useSRS integration |
| **Sort Mode persistence** | If user closes mid-sort, resume from where they left off (see Epic 5: Session Persistence). Know/Don't Know piles preserved. | Med | IndexedDB session state |
| **Bilingual sort labels** | "Know / သိပါတယ်" and "Don't Know / မသိပါ" on swipe edges. Consistent bilingual UX. | Low | BilingualText component |
| **Round counter** | "Round 2: Studying 5 missed cards" -- shows iteration through missed cards. Motivating progress indicator. | Low | State counter |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Tinder-style card stack visual** | Stacked cards behind current card look cool but add rendering complexity, cause performance issues on low-end phones, and the visual metaphor (dating app) is inappropriate for test prep. | Single card with slide-in animation (current AnimatePresence pattern). |
| **Spaced repetition within sort session** | Don't re-show "Don't Know" cards during the same round (interleaving). Show them as a separate round after completing all cards. Simpler mental model. | Sequential rounds: all cards first, then missed cards only. |
| **Automatic flip after delay** | Some apps auto-flip the card after 5 seconds. Removes user agency and creates anxiety. | User-initiated flip only. |
| **Gravity/physics card throw** | Cards flying with physics simulation. Fun but accessibility nightmare (motion sickness), hard to implement well, and distracting from content. | Simple slide-off animation (300ms spring). |

---

## Epic 3: TTS Quality Improvements

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **Preferred voice selection** | Current TTS picks the "best available" voice automatically (Apple > Android > enhanced > local > any). Users should be able to choose their preferred voice from available options. Some voices sound more natural than others depending on device. | Med | Settings page, useSpeechSynthesis.ts, localStorage persistence |
| **Speech rate control (global)** | Interview mode already has speech rate control (slow/normal/fast via localStorage `civic-prep-speech-rate`). Extend this to ALL TTS contexts (study guide play buttons, test question reading). Currently only interview uses rate preference. | Low | Unify rate reading in useSpeechSynthesis.ts |
| **Graceful TTS failure handling** | TTS can fail silently (no voices loaded, AudioContext suspended, Chrome Android onend unreliability). Current code handles this in useInterviewTTS but useSpeechSynthesis has no onEnd/error callback. Standardize error handling. | Med | useSpeechSynthesis.ts refactor |

### Expected Behaviors

**Voice quality landscape (2026 browser TTS):**

The Web Speech API (`speechSynthesis`) is the only zero-cost, client-side TTS option. Voice quality depends entirely on the user's device and browser:

| Platform | Quality | Key Voices |
|----------|---------|-----------|
| macOS Safari/Chrome | HIGH | Samantha, Ava (Enhanced), Alex |
| iOS Safari | HIGH | Same as macOS, neural voices available |
| Chrome Desktop (Win/Mac) | MEDIUM | Google US English |
| Android Chrome | MEDIUM-LOW | Google US English, Samsung TTS |
| Firefox | LOW | eSpeak/mbrola (Linux), system voices (Win/Mac) |

**Burmese TTS availability:** Browser Web Speech API does NOT support Burmese/Myanmar (`my-MM`) on any major platform. No browser ships Burmese voices. Third-party APIs (Google Cloud TTS, Amazon Polly, CAMB.AI) support Burmese but require server-side API calls and have per-character costs.

**Recommendation:** Keep TTS English-only for now (current approach). Add a visual indicator when Burmese text is displayed without TTS: "TTS not available for Burmese / မြန်မာဘာသာစကားအတွက် TTS မရရှိနိုင်ပါ". Do NOT pretend Burmese TTS works.

**Voice selection UI:**
```
Settings > Speech
  Voice: [Dropdown of available voices for en-US]
  Speed: [Slow | Normal | Fast] (current interview-only control, made global)
  Preview: [Play "The president lives in the White House"] button
```

**Cloud TTS consideration (future, NOT v2.1):**
- Google Cloud TTS: 4M chars/month free (Standard), 1M chars/month free (WaveNet)
- Amazon Polly: 5M chars/month free for 12 months
- These would require a serverless API route (Next.js API route or Vercel Edge Function)
- Adds latency, complexity, and ongoing cost monitoring
- Verdict: Defer to v2.2+. Web Speech API is adequate for English. The improvement in v2.1 should be making the EXISTING TTS experience better (voice selection, rate control, error handling), not adding cloud APIs.

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **"Speaking" visual indicator** | When TTS is playing, show animated sound wave icon near the SpeechButton. Users currently can't tell if TTS is active, buffering, or failed. | Low | useSpeechSynthesis return `isSpeaking` state |
| **Sequential read mode** | "Read question, then answer" button that speaks question, pauses 1s, then speaks the correct answer. Useful for hands-free study (commute, cooking). | Med | useInterviewTTS callback chaining pattern |
| **Pause/resume TTS** | Tap the speaking button again to pause (not cancel). `speechSynthesis.pause()` and `.resume()` exist. Currently, second tap cancels entirely. | Low | State toggle in SpeechButton |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Burmese TTS via cloud API** | Adds server-side dependency, API cost, latency, and CSP complexity for a feature that benefits a subset of users. Burmese-speaking users can read Burmese text directly. | English TTS only. Clearly label that Burmese TTS is unavailable. |
| **AI-generated voice cloning** | CAMB.AI and similar offer voice cloning. Cool but ethically complex for a civic app, adds latency, and the Web Speech API is free. | Stick with built-in browser voices. |
| **Background audio playback** | TTS continuing when app is backgrounded. Creates surprising behavior, drains battery, and conflicts with user's media. | Stop TTS on visibility change (document.hidden). |

---

## Epic 4: Language Mode Toggle Behavior

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **Language mode affects all content, not just text visibility** | Current `useLanguage()` only toggles `showBurmese` boolean, which hides/shows Myanmar text. In English-only mode, TTS should still work (it does), but flashcard backs should hide Burmese answers, test answer options should hide Burmese text, and the interview should feel fully English-immersive. Currently, some components check `showBurmese` and some don't. | Med | Audit all components using BilingualText, answer rendering, flashcard backs |
| **Per-context language override** | Global toggle is "bilingual" or "english-only", but interview mode should ALWAYS be English-only (simulating USCIS interview where only English is spoken). Study guide should ALWAYS show bilingual (that's its purpose -- learning). Test/practice should respect the global toggle. | Med | LanguageContext.tsx enhancement, per-page override |
| **Accessible toggle placement** | Current toggle is in Settings page only. Users need to switch mid-study without navigating away. Place a compact toggle in the top bar or as a floating action button during study/test sessions. | Low-Med | Compact LanguageToggle component |

### Expected Behaviors

**Language mode behavior matrix:**

| Screen | Bilingual Mode | English-Only Mode | Override? |
|--------|---------------|-------------------|-----------|
| Dashboard | EN + MY text | EN only | Respects global |
| Study Guide (Browse) | EN + MY | EN + MY | Always bilingual (study aid purpose) |
| Study Guide (Sort Mode) | EN + MY card faces, MY on back | EN only card faces, EN only back | Respects global |
| Mock Test | EN + MY questions & answers | EN only questions & answers | Respects global |
| Practice | EN + MY | EN only | Respects global |
| Interview | EN only | EN only | Always English (USCIS simulation) |
| Progress Hub | EN + MY labels | EN only labels | Respects global |

**Toggle UX patterns (from multilingual UX research):**

Best practices for language toggles in bilingual apps:
1. Use the globe icon (internationally recognized) or translate icon
2. Show the current mode label in both languages: "Bilingual / နှစ်ဘာသာ" vs "English Only"
3. Toggle, not dropdown (only 2 modes)
4. Persist to localStorage (already implemented)
5. Place in persistent location: settings (existing) + floating mini-toggle in study/test chrome

**Recommended toggle component:**
```
[Globe icon] [EN + MY <==> EN]  -- small pill-shaped toggle
```
- In bilingual mode: pill shows "EN + MY" with both flags/indicators
- In English-only mode: pill shows "EN" with single indicator
- Tap toggles between modes with slide animation
- Placed in top bar next to timer (test) or above flashcard stack (study)

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **USCIS Interview Prep Mode** | When language is set to "english-only" AND user starts a mock test, show a brief message: "This simulates the real USCIS interview -- English only" with encouragement. Makes the toggle meaningful for test prep strategy. | Low | Conditional message in PreTestScreen |
| **Language-aware TTS** | In bilingual mode, SpeechButton could optionally read the English text. In English-only mode, SpeechButton is the same. This is already the behavior but making it explicit and consistent. | Low | Already implemented |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **More than 2 language modes** | "Burmese-only" mode makes no sense for a US civics test where answers must be in English. | Two modes only: bilingual and English-only. |
| **Per-question language toggle** | Toggling language per-question is confusing and adds UI clutter to every question card. | Global toggle affects all content consistently. |
| **Auto-detect language from browser** | `navigator.language` detection for auto-setting language mode. User's browser language doesn't indicate their study preference. A Burmese speaker might want English-only for practice. | Default to bilingual. Manual toggle. |

---

## Epic 5: Session Persistence & Resume

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **Test session resume** | If user closes browser mid-test, reopening should offer "Resume test? (Question 8 of 20, 5 correct)" or "Start new test". Losing 10 minutes of test progress is the #1 PWA frustration. | Med-High | IndexedDB via idb-keyval (already installed), TestPage.tsx state serialization |
| **Practice session resume** | Same as test: resume mid-practice session with previous answers preserved. | Med | PracticePage.tsx state serialization, IndexedDB |
| **Flashcard sort position resume** | If user is sorting flashcards and closes, resume at the same card with know/don't-know piles intact. | Med | FlashcardStack state serialization |

### Expected Behaviors

**Session state schema (stored in IndexedDB via idb-keyval):**

```typescript
interface PersistedTestSession {
  id: string;                    // UUID
  type: 'test' | 'practice';
  startedAt: string;             // ISO timestamp
  questions: SerializedQuestion[]; // Question IDs + shuffled answer order
  currentIndex: number;
  results: QuestionResult[];     // Already-answered questions
  timeLeft: number;              // Remaining seconds (test only)
  config?: PracticeConfigType;   // Practice config (practice only)
  version: number;               // Schema version for migrations
}

interface PersistedSortSession {
  id: string;
  type: 'flashcard-sort';
  startedAt: string;
  questionIds: string[];         // All cards in this session
  currentIndex: number;
  knownIds: string[];            // Cards sorted as "Know"
  unknownIds: string[];          // Cards sorted as "Don't Know"
  round: number;                 // Current round (1 = first pass, 2+ = reviewing missed)
  version: number;
}
```

**Resume flow:**

```
1. User opens Test page
2. Check IndexedDB for persisted session with type='test'
3. If found AND session < 24 hours old:
   - Show resume modal: "You have an unfinished test from [time ago]"
   - "Resume" button: restore state, resume timer
   - "Start New" button: discard persisted session, fresh start
4. If found AND session > 24 hours old:
   - Silently discard (test is stale)
5. If not found:
   - Show PreTestScreen as normal
```

**State persistence timing:**
- Save to IndexedDB after each answer commit (not on every state change -- too many writes)
- Save on `visibilitychange` event (user switching tabs/apps)
- Save on `beforeunload` event (user closing browser)
- Use the existing `createSaveSessionGuard` mutex pattern to prevent concurrent writes
- Debounce saves: minimum 1 second between writes

**Resume UX:**
- Resume modal: glass-panel overlay with session info
- Show: "Question X of Y | Z correct | [time remaining]"
- "Resume" and "Start New" buttons (both 3D chunky style)
- Auto-dismiss after 30 seconds (default to Start New if user doesn't interact)

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Cross-device resume via Supabase** | Persist session state to Supabase for logged-in users. Start on phone, resume on desktop. | High | Supabase table, sync logic, conflict resolution |
| **Resume countdown** | "Resuming in 5... 4... 3..." with option to cancel. Gives user time to orient before timer resumes. | Low | Simple countdown component |
| **Session expiry warning** | "Your unfinished test will expire in 2 hours" notification on dashboard if persisted session exists. | Low | NBA card integration |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Auto-resume without asking** | Silently resuming mid-test without user consent is disorienting. User may not remember where they were. | Always show resume modal with session info. |
| **Persist indefinitely** | Sessions older than 24 hours are stale -- test conditions have changed, user's mental state has changed. | 24-hour expiry. Auto-discard stale sessions. |
| **Cross-device resume (v2.1)** | Requires Supabase schema changes, conflict resolution, and sync logic. Too complex for v2.1. | Local IndexedDB only. Cross-device is v2.2+. |
| **Persist interview sessions** | Interview simulation is ephemeral by design -- it simulates a real interview where you can't pause and resume. | Test and practice only. Interview starts fresh. |

---

## Epic 6: Accessibility for Learning Apps

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **aria-live announcements for answer feedback** | Screen reader users cannot see the green/red feedback panel. After checking an answer, an `aria-live="assertive"` region must announce "Correct!" or "Incorrect. The correct answer is [answer]". This is WCAG 2.1 Level A (4.1.3 Status Messages). | Med | New aria-live region in test/practice layout, announcement text |
| **Focus management after answer submission** | When feedback panel appears, focus must move to it (so keyboard users and screen readers engage with feedback). When "Continue" is pressed, focus must move to the next question. Current auto-advance breaks focus management entirely. | Med | Requires explicit `ref.focus()` calls after state transitions |
| **Touch target compliance (WCAG 2.5.8)** | WCAG 2.2 requires 24x24px minimum touch targets (Level AA). Apple HIG recommends 44x44pt. Current app mostly has `min-h-[44px]` but it's inconsistent -- some icons and secondary buttons are undersized. | Low-Med | Audit all interactive elements, apply min sizes |
| **Keyboard navigation for quiz** | Full keyboard control: Tab to navigate between answer options, Enter/Space to select, Enter to Check, Enter to Continue. Arrow keys to move between answer options. Current quiz relies entirely on mouse/touch. | Med | KeyboardEvent handlers, `tabIndex` on answer buttons, focus ring styles |
| **Timer accessibility** | Screen reader users need periodic time announcements (not a continuous live region -- that would be annoying). Announce time at 5-minute intervals, at 2 minutes, and at 1 minute. WCAG 2.2.1 (Timing Adjustable) requires timer extension option. | Med | Periodic aria-live announcements, optional timer pause/extension |

### Expected Behaviors

**aria-live implementation pattern:**

```tsx
// In test/practice layout, render an invisible live region:
<div
  role="status"
  aria-live="assertive"
  aria-atomic="true"
  className="sr-only"
>
  {feedbackAnnouncement}
</div>

// After answer check:
// Correct: setFeedbackAnnouncement("Correct! The answer is: George Washington")
// Incorrect: setFeedbackAnnouncement("Incorrect. The correct answer is: George Washington. You answered: Abraham Lincoln")
```

**Key accessibility requirements:**
- Live region must exist in DOM on page load (not dynamically added)
- Wait 100ms after state change before updating live region text (gives screen reader time to detect)
- Use `aria-live="assertive"` for answer feedback (interrupts current speech)
- Use `aria-live="polite"` for progress updates ("Question 5 of 20")

**Focus management sequence:**
```
1. Page load -> focus on first answer option
2. Tab between answer options (circular: last -> first)
3. Enter/Space selects option (visual highlight)
4. Tab to Check button -> Enter to check
5. Focus auto-moves to feedback panel
6. Tab to Continue button -> Enter to advance
7. Focus auto-moves to first answer option of next question
```

**Timer accessibility per WCAG 2.2.1:**
- Option to hide timer (already exists via CircularTimer `allowHide`)
- Option to extend time by 50% (one-time extension per session)
- Screen reader announcements at 15min, 10min, 5min, 2min, 1min marks
- Final 60 seconds: "One minute remaining" announcement

**Touch target audit areas:**
- SpeechButton icons (currently 32x32, needs 44x44 touch area minimum)
- AddToDeckButton compact mode (small icon, needs padding for touch)
- Progress Hub tab buttons (already 44px height, verify width)
- Flashcard navigation arrows (already 48x48, good)
- Filter toggle buttons in test results (verify)

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Reduced motion alternative animations** | Current `useReducedMotion` disables animations entirely. Better: provide ALTERNATIVE animations (fade instead of slide, opacity instead of scale). Users who prefer reduced motion still benefit from state change indicators. | Med | Motion variants with reduced alternatives |
| **High contrast mode** | Detect `prefers-contrast: more` and increase border widths, text weights, and color contrast ratios. Myanmar script in particular benefits from higher contrast. | Low | CSS media query, Tailwind dark/light tokens |
| **Screen reader mode for flashcards** | When screen reader is detected, flashcards auto-announce question text, and "flip" announces answer. No visual flip animation needed -- just content swap with aria-live. | Med | Screen reader detection heuristic, alternative card rendering |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Removing timer entirely for accessibility** | The timer simulates real USCIS test conditions. Removing it changes the test's purpose. | Make timer optional (toggle), extendable (50% more time), and screen-reader friendly. |
| **Auto-reading questions aloud** | Automatically reading every question via TTS is overwhelming and removes user control. | SpeechButton exists. User initiates TTS. |
| **Verbose aria descriptions** | Over-describing UI elements ("This is a green button with a checkmark icon that indicates your answer was correct and you should press it to continue") | Concise: "Correct. Continue to next question." |

---

## Feature Dependencies (v2.1 Cross-Epic)

```
[Epic 1: Duolingo Test UX]
    |
    +-- required-before --> [Epic 6: Accessibility] (feedback panel needs aria-live, focus management)
    +-- enables --> [Epic 5: Session Persistence] (Check/Continue flow creates clear save points)
    |
    +-- independent-of --> [Epic 2: Flashcard Sort]
    +-- independent-of --> [Epic 3: TTS Quality]
    +-- independent-of --> [Epic 4: Language Toggle]

[Epic 2: Flashcard Sort]
    |
    +-- enhanced-by --> [Epic 5: Session Persistence] (sort state resume)
    +-- enhanced-by --> [Epic 4: Language Toggle] (card content filtering)
    |
    +-- independent-of --> [Epic 1, 3, 6]

[Epic 3: TTS Quality]
    |
    +-- enhanced-by --> [Epic 4: Language Toggle] (TTS behavior per mode)
    |
    +-- independent-of --> [Epic 1, 2, 5, 6]

[Epic 4: Language Toggle]
    |
    +-- enhances --> [Epic 1, 2, 3] (content filtering across all modes)
    +-- independent (can be done in any order)

[Epic 5: Session Persistence]
    |
    +-- depends-on --> [Epic 1] (save points align with Check/Continue flow)
    +-- enhanced-by --> [Epic 2] (sort state persistence)
    |
    +-- independent-of --> [Epic 3, 4, 6]

[Epic 6: Accessibility]
    |
    +-- depends-on --> [Epic 1] (feedback panel focus management, aria-live for Check flow)
    +-- cross-cutting --> applies to all epics (touch targets, keyboard nav, screen reader)
    |
    +-- should-be-done-with --> [Epic 1] (build accessible from the start, not retrofit)
```

### Recommended Build Order

1. **Epic 1: Duolingo Test UX** -- highest-impact UX change, establishes new interaction pattern for test/practice
2. **Epic 6: Accessibility** -- build accessible feedback panel alongside Epic 1 (not as retrofit)
3. **Epic 4: Language Toggle** -- cross-cutting behavior change, affects content rendering everywhere
4. **Epic 3: TTS Quality** -- independent, settings-focused, low risk
5. **Epic 2: Flashcard Sort Mode** -- independent, study guide enhancement
6. **Epic 5: Session Persistence** -- depends on stable test UX from Epic 1, highest complexity

---

## MVP Recommendation

### Must Have (v2.1 launch)

1. **Check/Continue flow with bottom feedback panel** -- eliminates the #1 UX complaint (auto-advance), aligns with industry standard (Duolingo)
2. **aria-live announcements for answer feedback** -- basic accessibility requirement, WCAG 2.1 Level A
3. **Keyboard navigation for quiz** -- accessibility table stakes
4. **Know/Don't Know flashcard sorting** -- transforms passive browsing into active study
5. **Speech rate control (global)** -- already exists for interview, just needs unification

### Should Have (v2.1 launch if time permits)

6. **Session persistence for test/practice** -- prevents progress loss, PWA table stakes
7. **Language toggle consistency audit** -- makes English-only mode meaningful across all screens
8. **Segmented progress bar** -- visual upgrade, enhances test UX
9. **Voice selection in settings** -- empowers users with poor default voices
10. **Touch target audit** -- WCAG 2.2 compliance

### Defer to v2.2

11. **Cross-device session resume** (requires Supabase schema changes)
12. **Cloud TTS for higher quality voices** (requires server-side API, costs)
13. **Burmese TTS** (no browser support, requires cloud API)
14. **Reduced motion alternative animations** (nice-to-have polish)
15. **Screen reader mode for flashcards** (specialized, needs user testing)

---

## Sources

### Duolingo UX Patterns
- [Duolingo Onboarding UX Breakdown](https://userguiding.com/blog/duolingo-onboarding-ux) - MEDIUM confidence (third-party analysis)
- [Duolingo Micro-Interactions Analysis](https://medium.com/@Bundu/little-touches-big-impact-the-micro-interactions-on-duolingo-d8377876f682) - MEDIUM confidence
- [Duolingo Exercise UI Recreation (GitHub)](https://github.com/KasraTabrizi/duolingo-exercise-project) - MEDIUM confidence (implementation reference)
- [Duolingo Exercise Types (Wiki)](https://duolingo.fandom.com/wiki/Exercise) - MEDIUM confidence
- [Duolingo Step-by-Step User Flow](https://medium.com/@raghadware/navigating-duolingo-a-step-by-step-user-flow-for-choosing-and-completing-a-lesson-14de76946aaf) - MEDIUM confidence
- [Duolingo Button CSS Replication](https://medium.com/@lilskyjuicebytes/clone-the-ui-1-replicating-duolingos-button-in-pure-css-bd37a97edb7e) - MEDIUM confidence
- [Josh Comeau 3D Button Tutorial](https://www.joshwcomeau.com/animation/3d-button/) - HIGH confidence
- [Haptic Rewards UX Pattern](https://bootcamp.uxdesign.cc/haptic-rewards-to-keep-you-glued-6efddf33801c) - MEDIUM confidence

### Quizlet Flashcard Patterns
- [Quizlet Flashcard Study Mode Help](https://help.quizlet.com/hc/en-us/articles/360030988091-Studying-with-Flashcards) - HIGH confidence (official docs)
- [Quizlet New Flashcards Mode](https://quizlet.com/blog/introducing-our-new-flip-flashcards-mode) - HIGH confidence (official blog)
- [Quizlet Learn Mode Help](https://help.quizlet.com/hc/en-us/articles/360030986971-Studying-with-Learn) - HIGH confidence
- [Quizlet Stars Feature](https://help.quizlet.com/hc/en-us/articles/360031172312-Studying-most-missed-terms-with-stars) - HIGH confidence

### TTS & Voice Quality
- [Best Free TTS APIs 2026 (CAMB.AI)](https://www.camb.ai/blog-post/best-free-text-to-speech-ai-apis) - MEDIUM confidence
- [Google Cloud TTS Pricing](https://cloud.google.com/text-to-speech) - HIGH confidence (official)
- [SM Myanmar TTS](https://saomaicenter.org/en/smsoft/burmesetts) - MEDIUM confidence
- [Narakeet Burmese TTS](https://www.narakeet.com/languages/burmese-text-to-speech/) - MEDIUM confidence

### Language Toggle UX
- [Multilingual UX Design (Lindie Botes)](https://medium.com/@lindiebotes/ui-ux-design-for-a-multilingual-world-languages-digital-literacy-in-app-design-5870c5fa6949) - MEDIUM confidence
- [Language Selector UX (Smart Interface Design Patterns)](https://smart-interface-design-patterns.com/articles/language-selector/) - HIGH confidence
- [Language Selector Design Best Practices 2025](https://www.linguise.com/blog/guide/best-practices-designing-language-selector/) - MEDIUM confidence
- [Designing Language Switch (Usersnap)](https://usersnap.com/blog/design-language-switch/) - MEDIUM confidence

### Session Persistence
- [PWA Offline Data (web.dev)](https://web.dev/learn/pwa/offline-data) - HIGH confidence (Google official)
- [IndexedDB for Session Persistence (Turnkey)](https://www.turnkey.com/blog/introducing-indexeddb-improved-session-persistence-verifiable-sessions-and-upgraded-auth-for-seamless-web-apps) - MEDIUM confidence
- [Offline-First Frontend Apps 2025 (LogRocket)](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/) - MEDIUM confidence

### Accessibility
- [WCAG 2.2 Official Specification](https://www.w3.org/TR/WCAG22/) - HIGH confidence
- [WCAG 2.2 New Success Criteria](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) - HIGH confidence
- [WCAG 2.5.8 Target Size Minimum](https://wcag.dock.codes/documentation/wcag258/) - HIGH confidence
- [ARIA Live Regions (Harvard Digital Accessibility)](https://accessibility.huit.harvard.edu/technique-form-feedback-live-regions) - HIGH confidence
- [ARIA Live Regions (MDN)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) - HIGH confidence
- [Sara Soueidan: Accessible Notifications with ARIA](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/) - HIGH confidence

### Swipe Card Implementations
- [Framer Motion Swipe Cards (GeeksforGeeks)](https://www.geeksforgeeks.org/reactjs/how-to-create-tinder-card-swipe-gesture-using-react-and-framer-motion/) - MEDIUM confidence
- [React Tinder Card (npm)](https://www.npmjs.com/package/react-tinder-card) - MEDIUM confidence
- [React Spring Swipe Cards](https://medium.com/swlh/tinder-card-swipe-feature-using-react-spring-and-react-use-gesture-7236d7abf2db) - MEDIUM confidence

---

*Feature research for: Civic Test Prep v2.1 Quality & Polish*
*Researched: 2026-02-13*
*Supersedes: v2.0 feature research (retained in git history)*
