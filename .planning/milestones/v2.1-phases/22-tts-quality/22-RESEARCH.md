# Phase 22: TTS Quality - Research

**Researched:** 2026-02-15
**Domain:** Text-to-speech voice control, pre-generated Burmese audio, auto-read, speaking feedback UX
**Confidence:** HIGH

## Summary

Phase 22 enhances the existing TTS infrastructure (Phase 19's `ttsCore.ts` + `TTSContext` + `useTTS`/`useTTSSettings` hooks) with user-facing controls and Burmese audio support. The codebase already has a solid TTS engine with cross-browser quirk handling, a Settings page with speech rate selection, and SpeechButton components across study guide, test, practice, interview, and flashcard views. The work divides into six streams: (1) voice selection UI in Settings, (2) speed control with per-session override, (3) auto-read system, (4) pre-generated Burmese MP3 audio via edge-tts, (5) speaking feedback and pause/resume UX, and (6) error handling + 28 missing USCIS 2025 explanations.

The existing architecture is well-prepared -- `TTSSettings` already has `preferredVoice: string | null`, `TTSContext` already loads and caches voices, `useTTSSettings` is specifically documented as "intended for the future Settings page (Phase 22)", and the engine's `pause()`/`resume()` methods exist but are not yet wired to the SpeechButton. The Burmese audio stream requires pre-generating MP3 files with edge-tts CLI (Python), hosting them in `public/audio/my-MM/`, caching them via service worker `CacheFirst` strategy, and playing them through an `HTMLAudioElement`-based adapter that integrates with `TTSProvider` for unified controls.

**Primary recommendation:** Build incrementally -- voice selection and speed controls first (purely extending existing TTSContext/Settings), then auto-read hooks, then Burmese audio infrastructure, then speaking feedback polish. The 28 USCIS 2025 explanations are pure data work and can be done in parallel.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Voice Selection
- Dropdown with preview in Settings -- tapping a voice plays a sample civics question ("What is the supreme law of the land?" or similar)
- Voice grouping/filtering: Claude's discretion (English-only filter or grouped by language)
- Interview mode uses the user's selected English voice (not a dedicated examiner voice)

#### Speed Control
- 3 tiers: Slow (0.75x) / Normal (1.0x) / Fast (1.25x)
- Global default set in Settings page
- Per-session override available on pre-test, pre-practice, pre-interview, and study guide screens
- Pre-screen: speed pill selector added as a row below existing options (question count, timer, etc.)
- Per-session override does NOT sync back to global setting
- Small speed label (e.g., "1x") visible on the speech button during sessions
- Interview: Practice mode respects user's speed; Real mode uses fixed normal speed

#### Auto-Read
- User-toggleable setting (off by default)
- Available in Settings AND on pre-test/pre-practice screens as per-session override
- Interview mode always auto-reads regardless of toggle (examiner simulation)
- Auto-read language setting (English / Burmese / Both) -- default "Both" in Myanmar mode
- Study guide: auto-reads question text on front, answer text on back; explanation has manual audio button only
- Flashcards: auto-reads on navigate (both front and back)
- Test/Practice: auto-reads question text when new question appears
- Auto-read in Myanmar mode: respects auto-read language setting (English / Burmese / Both)

#### Burmese Audio
- Pre-generated MP3s via edge-tts CLI
- Two voices: male and female, labeled by actual edge-tts voice names (e.g., "Nilar (Female)", "Thiha (Male)")
- Audio coverage: questions + answers + explanations for all 128 questions
- Audio hosting: Claude's discretion (public/ folder vs CDN, considering offline-first PWA needs)
- Offline caching: Claude's discretion (service worker strategy)
- Generation timing: Claude's discretion (build script, one-time manual, or CI)
- Playback routed through TTSProvider (unified controls -- same pause/resume, speaking indicator, speed)
- Separate speech buttons: US flag for English, Myanmar flag for Burmese (visible in Myanmar mode only)
- Interview: Real mode = English only; Practice mode = English then Burmese in Myanmar mode

#### Missing USCIS 2025 Explanations
- Write all 28 missing explanation objects for `uscis-2025-additions.ts`
- Match existing explanation style and depth
- Include both English and Burmese translations

#### Speaking Feedback & Controls
- Animated speaking indicator: Claude's discretion (pulsing ring, sound wave bars, etc.)
- Speech button color: existing indigo-purple TTS speaking token (hsl 250)
- Tap behavior while playing: Claude's discretion (pause/resume vs stop/restart, based on cross-browser reliability)
- Tapping different speech button while one plays: Claude's discretion (auto-cancel vs block)
- Global indicator (top/bottom bar): Claude's discretion

#### Error & Edge Case Handling
- TTS failure: inline error state on the speech button itself (red tint, tooltip) -- no toast
- Burmese audio load failure: retry once, then show disabled state with tooltip "Burmese audio unavailable offline"
- Auto-read mid-session failure: silent retry once, then stop and let user tap manually
- No voices available: "No voices available" message in Settings voice picker with help link to browser voice settings
- Rapid speech button taps: Claude's discretion (cancel/restart or debounce)
- Unsupported browsers (no SpeechSynthesis): speech buttons visible but grayed out with tooltip "TTS not supported in this browser"
- Offline TTS: detect offline state, show small warning on speech buttons "Limited audio offline", still attempt playback

#### Settings Page Layout
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

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `ttsCore.ts` | custom | Cross-browser SpeechSynthesis wrapper with chunking, keep-alive, retry | Existing -- extend, don't replace |
| `TTSContext.tsx` | custom | React context providing shared engine, settings, voices | Existing -- add autoRead, autoReadLang settings |
| `useTTS.ts` | custom | Consumer hook with speak/cancel/pause/resume + error state | Existing -- wire pause/resume to SpeechButton |
| `useTTSSettings.ts` | custom | Lightweight settings-only hook | Existing -- use in Settings page |
| `SpeechButton.tsx` | custom | Animated button with SoundWaveIcon + ExpandingRings | Existing -- add pause/resume, speed label, error state |
| `motion/react` | ^12.33.0 | Animation library for speaking indicators | Existing |
| `@serwist/next` | ^9.5.4 | PWA service worker with runtime caching | Existing -- add audio CacheFirst route |
| `serwist` | ^9.5.4 | Service worker caching strategies | Existing |

### Supporting (new, not installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `edge-tts` (Python) | ^7.2.7 | CLI for pre-generating Burmese MP3 files | One-time generation script only -- NOT a runtime dependency |

### No New npm Dependencies Needed
The entire phase can be built with existing dependencies. Burmese audio playback uses the native `HTMLAudioElement` API (already used in `audioChime.ts` and `AudioWaveform.tsx`). The edge-tts Python CLI is a development tool, not a production dependency.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── ttsCore.ts              # EXISTING - no changes needed
│   ├── ttsTypes.ts             # EXTEND - add AutoReadLang type, BurmeseVoice type
│   └── audio/
│       ├── soundEffects.ts     # EXISTING
│       └── burmeseAudio.ts     # NEW - Burmese MP3 playback adapter
├── contexts/
│   └── TTSContext.tsx           # EXTEND - add autoRead, autoReadLang, burmeseVoice to settings
├── hooks/
│   ├── useTTS.ts               # EXTEND - wire pause/resume behavior
│   ├── useTTSSettings.ts       # EXISTING - no changes needed
│   └── useAutoRead.ts          # NEW - auto-read trigger hook
├── components/
│   └── ui/
│       ├── SpeechButton.tsx    # EXTEND - add pause/resume, speed label, error state, flag variant
│       └── VoicePicker.tsx     # NEW - voice dropdown with preview
├── pages/
│   └── SettingsPage.tsx        # EXTEND - add "Speech & Audio" section
├── constants/
│   └── questions/
│       └── uscis-2025-additions.ts  # EXTEND - add 28 explanation objects
└── styles/
    └── tokens.css              # EXISTING - TTS token already defined (--color-tts: 250 70% 55%)

public/
└── audio/
    └── my-MM/
        ├── female/             # Nilar voice MP3s
        │   ├── GOV-P01-q.mp3  # Question audio
        │   ├── GOV-P01-a.mp3  # Answer audio
        │   └── GOV-P01-e.mp3  # Explanation audio
        └── male/               # Thiha voice MP3s
            ├── GOV-P01-q.mp3
            ├── GOV-P01-a.mp3
            └── GOV-P01-e.mp3

scripts/
└── generate-burmese-audio.py   # One-time edge-tts generation script
```

### Pattern 1: Burmese Audio Adapter (HTMLAudioElement-based)

**What:** A module-level audio player that wraps `HTMLAudioElement` and exposes the same interface as the TTS engine (speak/cancel/pause/resume/state changes), so `TTSProvider` can route Burmese playback through unified controls.

**When to use:** When playing pre-generated Burmese MP3s instead of browser SpeechSynthesis.

**Example:**
```typescript
// src/lib/audio/burmeseAudio.ts
type BurmeseAudioState = {
  isSpeaking: boolean;
  isPaused: boolean;
  currentFile: string | null;
};

type StateCallback = (state: BurmeseAudioState) => void;

export function createBurmesePlayer() {
  let audio: HTMLAudioElement | null = null;
  let state: BurmeseAudioState = { isSpeaking: false, isPaused: false, currentFile: null };
  const subscribers = new Set<StateCallback>();

  function notify() {
    subscribers.forEach(cb => cb({ ...state }));
  }

  async function play(url: string, rate = 1.0): Promise<void> {
    // Cancel previous
    if (audio) {
      audio.pause();
      audio.src = '';
    }

    audio = new Audio(url);
    audio.playbackRate = rate;

    return new Promise<void>((resolve, reject) => {
      if (!audio) { reject(new Error('No audio element')); return; }

      audio.onended = () => {
        state = { isSpeaking: false, isPaused: false, currentFile: null };
        notify();
        resolve();
      };

      audio.onerror = () => {
        state = { isSpeaking: false, isPaused: false, currentFile: null };
        notify();
        reject(new Error('Audio load failed'));
      };

      state = { isSpeaking: true, isPaused: false, currentFile: url };
      notify();
      audio.play().catch(reject);
    });
  }

  function pause() {
    audio?.pause();
    state = { ...state, isPaused: true };
    notify();
  }

  function resume() {
    audio?.play();
    state = { ...state, isPaused: false };
    notify();
  }

  function cancel() {
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    state = { isSpeaking: false, isPaused: false, currentFile: null };
    notify();
  }

  function onStateChange(cb: StateCallback): () => void {
    subscribers.add(cb);
    return () => { subscribers.delete(cb); };
  }

  return { play, pause, resume, cancel, onStateChange };
}
```

### Pattern 2: Auto-Read Hook

**What:** A hook that listens for navigation events (question index changes, card flips) and auto-triggers TTS playback based on user settings.

**When to use:** In FlashcardStack, PracticeSession, TestPage, InterviewSession.

**Example:**
```typescript
// src/hooks/useAutoRead.ts
export function useAutoRead(options: {
  text: string;
  enabled: boolean;
  lang?: string;
  /** Unique key to trigger re-read (e.g., question index) */
  triggerKey: string | number;
}) {
  const { speak, cancel } = useTTS();

  useEffect(() => {
    if (!options.enabled || !options.text) return;

    // Small delay to let UI settle before speaking
    const timer = setTimeout(() => {
      speak(options.text, { lang: options.lang }).catch(() => {
        // Auto-read failure: silent -- user can tap manually
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.triggerKey, options.enabled]);
}
```

### Pattern 3: Per-Session Override via React State (Not Context)

**What:** Speed and auto-read overrides on pre-screens are local React state that gets passed to session components via props. They do NOT sync back to the global TTSSettings in localStorage.

**When to use:** PreTestScreen, PracticeConfig, InterviewSetup add speed/auto-read selectors; pass values down to session components.

**Example:**
```typescript
// In PreTestScreen
const { settings: globalSettings } = useTTSSettings();
const [sessionSpeed, setSessionSpeed] = useState<'slow' | 'normal' | 'fast'>(globalSettings.rate);
const [sessionAutoRead, setSessionAutoRead] = useState(globalSettings.autoRead ?? false);

// Pass to PracticeSession via props
<PracticeSession
  speedOverride={sessionSpeed}
  autoReadOverride={sessionAutoRead}
  ...
/>
```

### Pattern 4: Burmese Audio File Naming Convention

**What:** Consistent naming for 128 questions x 3 content types (question/answer/explanation) x 2 voices (male/female).

**Convention:** `{questionId}-{type}.mp3` where type is `q` (question), `a` (answer), `e` (explanation).

**Example:**
```
public/audio/my-MM/female/GOV-P01-q.mp3   # Nilar reading question
public/audio/my-MM/female/GOV-P01-a.mp3   # Nilar reading answer
public/audio/my-MM/female/GOV-P01-e.mp3   # Nilar reading explanation
public/audio/my-MM/male/GOV-P01-q.mp3     # Thiha reading question
```

**Total files:** 128 questions x 3 types x 2 voices = 768 MP3 files

**Note:** The 28 USCIS 2025 questions that currently lack explanations will need explanation text written BEFORE generating the explanation audio files.

### Pattern 5: Service Worker Caching for Audio

**What:** Add a `CacheFirst` runtime caching route in `src/lib/pwa/sw.ts` for `public/audio/` files.

**Example:**
```typescript
// In sw.ts, add to Serwist config's runtimeCaching array:
import { CacheFirst, ExpirationPlugin } from 'serwist';

const serwist = new Serwist({
  // ... existing config ...
  runtimeCaching: [
    ...defaultCache,
    {
      matcher({ url }) {
        return url.pathname.startsWith('/audio/');
      },
      handler: new CacheFirst({
        cacheName: 'burmese-audio',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 800,      // 768 files + buffer
            maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
          }),
        ],
      }),
    },
  ],
});
```

### Anti-Patterns to Avoid

- **Don't create a separate audio context for Burmese playback.** The existing TTS engine context manages speaking state. Burmese audio should integrate with the TTSProvider's state (isSpeaking, isPaused) so UI shows consistent indicators.
- **Don't store auto-read per-session overrides in context.** Use component-level state and prop drilling. Per-session overrides are intentionally ephemeral.
- **Don't use `setState` in effects for auto-read triggers.** Use the `useAutoRead` hook pattern with `triggerKey` dependency.
- **Don't preload all 768 audio files on app start.** Use on-demand loading with CacheFirst service worker strategy. Files cache on first access.
- **Don't use `addEventListener('voiceschanged')` -- use `onvoiceschanged` property** (Safari compatibility, Pitfall 7 in ttsCore.ts).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Speech synthesis | Custom Web Audio speech | Existing `ttsCore.ts` engine | Already handles Chrome 15s, Safari cancel, Firefox race, Android pause |
| Service worker caching | Custom fetch interceptor | Serwist `CacheFirst` + `ExpirationPlugin` | Battle-tested, handles opaque responses, quota management |
| Audio playback | Custom buffer loading | `HTMLAudioElement` | Native browser API, supports `playbackRate`, pause/resume, already used in codebase |
| Voice loading | Custom polling | Existing `loadVoices()` in ttsCore.ts | Already handles onvoiceschanged + polling + caching |
| MP3 generation | Custom TTS pipeline | edge-tts Python CLI | Free, no API key, Microsoft neural voices, supports Myanmar |

**Key insight:** The Phase 19 TTS infrastructure handles ALL the hard cross-browser problems. Phase 22 is primarily UI/UX work wiring existing capabilities to user-facing controls.

## Common Pitfalls

### Pitfall 1: SpeechSynthesis pause/resume Unreliability on Android
**What goes wrong:** Android WebView/Chrome fires pause but doesn't actually pause; resume does nothing. The existing ttsCore.ts already skips keep-alive pause/resume cycling on Android (Pitfall 5).
**Why it happens:** Android SpeechSynthesis implementation has long-standing bugs with pause/resume.
**How to avoid:** For the "tap to pause/resume" feature, implement cancel/restart semantics on Android instead of pause/resume. Detect Android via `isAndroid()` helper already in ttsCore.ts. On non-Android browsers, true pause/resume works fine.
**Warning signs:** Users reporting that speech continues playing after tapping pause on Android devices.

### Pitfall 2: Voice List Empty on First Load
**What goes wrong:** `speechSynthesis.getVoices()` returns empty array on first call in many browsers. The voice picker shows "No voices available" even though voices exist.
**Why it happens:** Voices load asynchronously in Chrome, Firefox. Safari needs `onvoiceschanged` property (not event listener).
**How to avoid:** Already handled by `loadVoices()` in ttsCore.ts (polls 8 retries + onvoiceschanged). The voice picker should show a loading state during initial voice load, then populate when `voices` array in TTSContext becomes non-empty.
**Warning signs:** Voice picker shows empty state that never resolves.

### Pitfall 3: Auto-Read Firing During Cleanup
**What goes wrong:** When navigating away from a page, the auto-read useEffect fires speak() during cleanup or immediately after the component unmounts, causing orphaned speech.
**Why it happens:** React Strict Mode double-invokes effects. Async speak() can resolve after unmount.
**How to avoid:** Cancel speech in useEffect cleanup. Use a `cancelled` flag to prevent late speak() calls. The existing useTTS hook auto-cancels on unmount which helps, but auto-read hooks must also clean up their timers.
**Warning signs:** Speech continues playing after navigating to a different page.

### Pitfall 4: Burmese Audio Files Inflating Build Size
**What goes wrong:** 768 MP3 files in `public/` get included in the Vercel deployment, significantly increasing deploy size and potentially hitting Vercel's free tier limits.
**Why it happens:** `public/` is served statically; all files deploy.
**How to avoid:** Estimate total size carefully. At ~30-80KB per short MP3, 768 files = ~23-61MB. This is within Vercel free tier limits (100MB for static files, no hard limit on serverless). However, consider using 64kbps mono (not 192kbps) for smaller files since speech doesn't need high fidelity. Target ~15-30KB per file = ~12-23MB total.
**Warning signs:** Build failing due to size limits, or slow initial deployments.

### Pitfall 5: HTMLAudioElement Rate Not Affecting Pre-Generated Audio Quality
**What goes wrong:** Setting `playbackRate` on HTMLAudioElement for pre-generated MP3s changes pitch when speeding up/slowing down, unlike SpeechSynthesis which maintains natural pitch.
**Why it happens:** HTMLAudioElement `playbackRate` is a simple time-stretch, not pitch-corrected.
**How to avoid:** For the 3 speed tiers (0.75x/1.0x/1.25x), the pitch shift is minor and acceptable for speech. Alternatively, pre-generate 3 speed variants per file (triples file count to ~2300 -- NOT recommended). Accept minor pitch shift as tradeoff.
**Warning signs:** User complaints about Burmese audio sounding "chipmunky" at fast speed.

### Pitfall 6: SpeechButton Shared Engine Cancel Race
**What goes wrong:** Multiple SpeechButtons share the same TTSEngine via TTSContext. Tapping one while another is speaking auto-cancels the first (by design in `speak()`), but the cancelled button's speaking state may not update correctly if the cancel event races with the new speak.
**Why it happens:** The engine's `speak()` method does `synth.cancel()` then `await wait(100)` before speaking. During that 100ms, both buttons see `isSpeaking: false` briefly.
**How to avoid:** The `speak()` method's `updateState()` calls handle this correctly -- it sets `isSpeaking: true` immediately for the new text and the old utterance's `onerror` (cancelled) fires, but the engine has already moved on. The UI should show the new speaking state, not react to the stale cancel. This is already handled correctly by the engine architecture.
**Warning signs:** Both buttons briefly showing "speaking" state or neither showing it.

### Pitfall 7: Edge-TTS CLI Requires Internet
**What goes wrong:** The edge-tts CLI calls Microsoft's cloud TTS API. Generating audio fails without internet connection.
**Why it happens:** edge-tts is a wrapper around Microsoft Edge's online TTS service, not a local engine.
**How to avoid:** Run the generation script once with internet access, commit the MP3 files to the repo (or host on CDN). This is a development-time dependency, not a runtime one.
**Warning signs:** Generation script fails in CI without internet access.

### Pitfall 8: focus() Without preventScroll in SpeechButton
**What goes wrong:** Calling `focus()` on the button when speaking begins scrolls the page to the button, disrupting the user's reading position.
**Why it happens:** Default `focus()` scrolls the element into view.
**How to avoid:** Already handled -- existing SpeechButton uses `buttonRef.current?.focus({ preventScroll: true })`. Maintain this pattern in any new button variants.
**Warning signs:** Page jumping to the speech button when auto-read starts.

## Code Examples

### Voice Picker with Preview
```typescript
// src/components/ui/VoicePicker.tsx
interface VoicePickerProps {
  voices: SpeechSynthesisVoice[];
  selectedVoice: string | null;
  onSelect: (voiceName: string) => void;
  lang?: string;
  showBurmese: boolean;
}

function VoicePicker({ voices, selectedVoice, onSelect, lang = 'en', showBurmese }: VoicePickerProps) {
  const { speak } = useTTS();
  const previewText = "What is the supreme law of the land?";

  // Filter voices by language
  const filteredVoices = voices.filter(v => {
    const voiceLang = v.lang?.toLowerCase().replace(/_/g, '-') ?? '';
    return voiceLang.startsWith(lang.toLowerCase());
  });

  const handlePreview = (voice: SpeechSynthesisVoice) => {
    void speak(previewText, { voice, lang: voice.lang });
  };

  if (filteredVoices.length === 0) {
    return (
      <div className="rounded-xl border border-warning bg-warning-subtle px-3 py-2">
        <p className="text-xs text-warning">No voices available</p>
        {/* Help link to browser voice settings */}
      </div>
    );
  }

  return (
    <select
      value={selectedVoice ?? ''}
      onChange={e => {
        const name = e.target.value;
        onSelect(name);
        const voice = filteredVoices.find(v => v.name === name);
        if (voice) handlePreview(voice);
      }}
    >
      <option value="">System default</option>
      {filteredVoices.map(voice => (
        <option key={voice.voiceURI} value={voice.name}>
          {voice.name} {voice.localService ? '(Local)' : '(Remote)'}
        </option>
      ))}
    </select>
  );
}
```

### Speed Label on SpeechButton
```typescript
// Added to SpeechButton props and rendering
interface SpeechButtonProps {
  // ... existing props
  showSpeedLabel?: boolean;
  speedLabel?: string; // e.g., "0.75x", "1x", "1.25x"
}

// In render, after the label span:
{showSpeedLabel && speedLabel && (
  <span className="text-[10px] font-medium text-muted-foreground opacity-70">
    {speedLabel}
  </span>
)}
```

### TTSSettings Extension for Auto-Read
```typescript
// In ttsTypes.ts
export type AutoReadLang = 'english' | 'burmese' | 'both';

export type TTSSettings = {
  rate: 'slow' | 'normal' | 'fast';
  pitch: number;
  lang: string;
  preferredVoice: string | null;
  // NEW in Phase 22:
  autoRead: boolean;            // Off by default
  autoReadLang: AutoReadLang;   // Default 'both'
  burmeseVoice: 'nilar' | 'thiha'; // Default 'nilar' (female)
};
```

### Burmese Audio URL Helper
```typescript
// src/lib/audio/burmeseAudio.ts
export type BurmeseVoice = 'nilar' | 'thiha';
export type AudioType = 'q' | 'a' | 'e'; // question, answer, explanation

export function getBurmeseAudioUrl(
  questionId: string,
  type: AudioType,
  voice: BurmeseVoice = 'nilar'
): string {
  const gender = voice === 'nilar' ? 'female' : 'male';
  return `/audio/my-MM/${gender}/${questionId}-${type}.mp3`;
}
```

### Edge-TTS Generation Script
```python
#!/usr/bin/env python3
"""Generate Burmese audio files for all 128 civics questions.

Usage:
  pip install edge-tts
  python scripts/generate-burmese-audio.py

Generates:
  public/audio/my-MM/female/{id}-{q|a|e}.mp3  (Nilar)
  public/audio/my-MM/male/{id}-{q|a|e}.mp3    (Thiha)
"""
import asyncio
import json
import os
import edge_tts

VOICES = {
    'female': 'my-MM-NilarNeural',
    'male': 'my-MM-ThihaNeural',
}

OUTPUT_DIR = 'public/audio/my-MM'

async def generate(text: str, voice: str, output_path: str):
    communicate = edge_tts.Communicate(text, voice, rate='+0%')
    await communicate.save(output_path)

async def main():
    # Load questions from a JSON export (generate separately)
    with open('scripts/questions-export.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)

    for gender, voice_name in VOICES.items():
        out_dir = os.path.join(OUTPUT_DIR, gender)
        os.makedirs(out_dir, exist_ok=True)

        for q in questions:
            qid = q['id']
            # Question
            await generate(q['question_my'], voice_name, f'{out_dir}/{qid}-q.mp3')
            # Answer (join all study answers)
            answer_text = '။ '.join(a['text_my'] for a in q['studyAnswers'])
            await generate(answer_text, voice_name, f'{out_dir}/{qid}-a.mp3')
            # Explanation (if available)
            if q.get('explanation') and q['explanation'].get('brief_my'):
                await generate(
                    q['explanation']['brief_my'],
                    voice_name,
                    f'{out_dir}/{qid}-e.mp3'
                )

asyncio.run(main())
```

## Discretion Recommendations

### Voice List Filtering/Grouping Strategy
**Recommendation:** Filter by English voices (`en-*` locale) by default. Show a "Show all languages" toggle at the bottom of the picker for users who want other language voices. Group by local vs remote (local voices are faster, remote voices are higher quality).
**Rationale:** Most users want English voices for the civics test. Showing all 100+ voices across all languages is overwhelming.

### Animated Speaking Indicator Design
**Recommendation:** Keep the existing SoundWaveIcon (3-bar equalizer) + ExpandingRings combination. It already uses the `--color-tts` token (hsl 250) and respects `prefers-reduced-motion`. No changes needed -- the current design is polished.
**Rationale:** Existing implementation already satisfies TTS-04 (animated speaking indicator).

### Tap-While-Playing Behavior
**Recommendation:** **Pause/resume** on non-Android, **cancel/restart** on Android.
**Rationale:** Android's SpeechSynthesis pause/resume is unreliable (known platform bug, documented in ttsCore.ts Pitfall 5). On iOS/desktop, true pause/resume provides better UX. The SpeechButton can detect platform and choose behavior. This satisfies TTS-05 (pause/resume).

### Multi-Play Behavior (Tapping Different Button While Speaking)
**Recommendation:** **Auto-cancel** the current speech and start the new one. This is already the behavior of `engine.speak()` which calls `synth.cancel()` before speaking new text.
**Rationale:** Blocking would be confusing -- user taps a button and nothing happens. Auto-cancel is intuitive (the new tap clearly overrides the old one). Already implemented at the engine level.

### Global Speaking Indicator
**Recommendation:** **Button only** (no global bar). The SpeechButton's speaking state (indigo-purple color, SoundWaveIcon, ExpandingRings) is sufficient. Adding a global bar would require significant layout changes and add visual noise.
**Rationale:** The app already has a bottom nav bar. Adding a speaking indicator bar reduces content space and complicates the layout. The button-level feedback is clear enough.

### Audio File Format and Bitrate
**Recommendation:** MP3 at 48kHz, 64kbps, mono. Edge-tts defaults to 48kHz/192kbps which is overkill for speech. Use `--rate +0%` flag and post-process with ffmpeg to reduce bitrate:
```bash
ffmpeg -i input.mp3 -ab 64k -ac 1 output.mp3
```
Target: ~15-25KB per file, ~12-19MB total for 768 files.
**Rationale:** Speech doesn't need high fidelity. 64kbps mono is standard for audiobook/podcast speech and indistinguishable from 192kbps for spoken word.

### Audio Hosting Strategy
**Recommendation:** **`public/audio/` folder** committed to repo. NOT a CDN.
**Rationale:** This is an offline-first PWA. CDN defeats the offline purpose. The files will be cached by the service worker on first access. Total size (~15-20MB) is well within Vercel's free tier limits and Git can handle it (use Git LFS if needed, but MP3s at this size are fine in regular Git).

### Service Worker Caching Strategy
**Recommendation:** `CacheFirst` with `ExpirationPlugin` (maxEntries: 800, maxAgeSeconds: 90 days). Audio files are immutable (versioned by content), so CacheFirst is ideal -- never re-fetch once cached.
**Rationale:** Audio files don't change. CacheFirst avoids network requests after first load. The 90-day TTL prevents stale cache forever, and maxEntries prevents quota issues.

### Edge-TTS Generation Process
**Recommendation:** **One-time manual script** with instructions in a README. NOT a build step or CI task.
**Rationale:** Audio generation requires internet access (edge-tts calls Microsoft's cloud API), takes several minutes for 768 files, and the output is committed to the repo. Running it in CI would be slow, fragile, and wasteful since the audio rarely changes.

### Rapid Tap Handling
**Recommendation:** **Cancel and restart** (debounce of ~150ms). If user taps the same button rapidly, cancel current speech and start fresh after 150ms debounce.
**Rationale:** More responsive than blocking. The 150ms debounce prevents audio stuttering from extremely rapid taps. The engine already handles cancel-then-speak correctly.

### Testing Strategy
**Recommendation:** Unit tests for: settings persistence, voice filtering/grouping logic, auto-read hook trigger/cleanup, Burmese audio URL helper, speed label rendering. Manual testing for: actual audio quality, cross-browser TTS behavior, service worker caching verification.
**Rationale:** Audio playback is inherently manual-test territory (jsdom has no SpeechSynthesis or HTMLAudioElement). Logic around the audio can be unit tested.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useRef` for TTS engine | `useState` + `useRef` with state subscription | Phase 19 (this project) | React Compiler safe, reactive UI updates |
| Global speech rate number | Named rate tiers ('slow'/'normal'/'fast') | Phase 19 (this project) | Better UX, Settings-friendly |
| No voice selection | `preferredVoice` in TTSSettings | Phase 19 (prepared) | Ready for voice picker UI |
| No Burmese TTS | Pre-generated MP3 via edge-tts | Phase 22 (upcoming) | Bypasses browser's lack of Myanmar voices |
| `speechSynthesis.addEventListener('voiceschanged')` | `synth.onvoiceschanged = fn` property | Always (Safari) | Safari compat (documented in ttsCore.ts Pitfall 7) |

## Open Questions

1. **Git LFS for Audio Files?**
   - What we know: 768 MP3 files at ~15-25KB each = ~12-19MB total. Standard Git can handle this.
   - What's unclear: Whether the Git history will balloon if audio files are regenerated. Each regeneration doubles the storage in `.git`.
   - Recommendation: Start without Git LFS. If audio regeneration becomes frequent, switch to LFS later. Add `public/audio/` to `.gitattributes` with LFS tracking as a future optimization.

2. **Explanation Audio for Questions Without Explanations**
   - What we know: 28 USCIS 2025 questions have no explanation objects. Explanation audio (e.mp3) requires explanation text to exist first.
   - What's unclear: Nothing -- this is a known dependency.
   - Recommendation: Write the 28 explanation objects first, then generate all audio (including explanation audio) in one batch.

3. **Auto-Read Interaction with Interview Session**
   - What we know: Interview always auto-reads (examiner simulation). The interview already uses `speak()` in its phase machine (`safeSpeakLocal` in InterviewSession.tsx).
   - What's unclear: Whether the new `useAutoRead` hook should replace the interview's existing speak calls or coexist.
   - Recommendation: Don't use `useAutoRead` in InterviewSession. The interview has its own phase machine that controls when speech happens. The auto-read hook is for simpler screens (flashcards, test questions, practice questions).

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/lib/ttsCore.ts`, `src/lib/ttsTypes.ts`, `src/contexts/TTSContext.tsx`, `src/hooks/useTTS.ts`, `src/hooks/useTTSSettings.ts`, `src/components/ui/SpeechButton.tsx`
- Codebase analysis: `src/pages/SettingsPage.tsx`, `src/components/test/PreTestScreen.tsx`, `src/components/practice/PracticeConfig.tsx`, `src/components/interview/InterviewSetup.tsx`, `src/components/interview/InterviewSession.tsx`
- Codebase analysis: `src/lib/pwa/sw.ts`, `next.config.mjs`, `tailwind.config.js`, `src/styles/tokens.css`
- Codebase analysis: `src/constants/questions/uscis-2025-additions.ts` (28 questions, 0 explanations confirmed)
- Serwist docs (Context7): CacheFirst + ExpirationPlugin configuration patterns
- Edge-tts voice list gist: https://gist.github.com/BettyJJ/17cbaa1de96235a7f5773b8690a20462 (confirmed my-MM-NilarNeural Female, my-MM-ThihaNeural Male)

### Secondary (MEDIUM confidence)
- edge-tts GitHub: https://github.com/rany2/edge-tts (v7.2.7, CLI usage patterns)
- edge-tts PyPI: https://pypi.org/project/edge-tts/ (installation, basic usage)
- Chrome audio/video caching docs: https://developer.chrome.com/docs/workbox/serving-cached-audio-and-video
- Serwist runtime caching docs: https://serwist.pages.dev/docs/serwist/runtime-caching

### Tertiary (LOW confidence)
- Edge-tts MP3 file size estimates (extrapolated from bitrate calculations, not measured with actual Myanmar text)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All core tools already exist in codebase; only edge-tts is new (dev tool only)
- Architecture: HIGH - Patterns extend existing well-documented codebase; no novel architecture needed
- Pitfalls: HIGH - Most pitfalls are documented in existing ttsCore.ts comments; Android pause/resume is well-known
- Burmese audio: MEDIUM - Voice names confirmed (NilarNeural/ThihaNeural), but actual file sizes and audio quality untested
- Auto-read: MEDIUM - Hook pattern is standard React, but cross-screen integration complexity may surface edge cases

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days -- stable domain, no fast-moving dependencies)
