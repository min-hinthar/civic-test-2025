# TTS Voice Selection Patterns

## findVoice Must Be Quality-First, Not Platform-First

**Context:** `findVoice()` in `src/lib/ttsCore.ts` originally searched Apple → Android → Edge voices in order. On Edge/Windows, this picked "Microsoft Zira" (basic, robotic) even though "Microsoft Ava Online (Natural)" was available — because `EDGE_VOICES` only listed basic voices.

**Learning:** Voice selection should prioritize quality (natural/neural) over platform. The correct order:
1. User's preferred voice (explicit selection)
2. Natural/neural voices (online preferred, then local)
3. Google US English (Chrome's best)
4. Apple voices (macOS/iOS)
5. Android voices
6. Edge basic voices (last resort)
7. Enhanced/premium hints
8. First language match

```typescript
// Quality check: "natural" or "neural" in voice name
const isNatural = (v: SpeechSynthesisVoice) => {
  const lower = v.name.toLowerCase();
  return lower.includes('natural') || lower.includes('neural');
};
const naturalOnline = matchesLang.find(v => isNatural(v) && !v.localService);
if (naturalOnline) return naturalOnline;
const naturalLocal = matchesLang.find(v => isNatural(v));
if (naturalLocal) return naturalLocal;
```

**Apply when:** Modifying voice selection logic in ttsCore.ts or adding new voice sources.

## Per-Button TTS State via currentText Matching

**Context:** All `SpeechButton` instances animated simultaneously when ANY speech played, because `isSpeaking` from TTSContext is a global flag.

**Learning:** For per-instance TTS state, compare `currentText` (what's currently being spoken) against the button's own `text` prop. This is already the pattern used by `BurmeseSpeechButton` with `currentFile` matching.

```typescript
const { isSpeaking, isPaused, currentText } = useTTS();
const isMySpeaking = isSpeaking && currentText === text;
const isMyPaused = isPaused && currentText === text;
```

**Caveat:** This breaks if two buttons have identical text. For the civics app this is fine since questions are unique.

**Apply when:** Any component that needs to know if IT specifically triggered the current TTS playback, not just whether TTS is globally active.

## VoicePicker Filter Strategy

**Context:** Chrome desktop only has local Microsoft voices + Google US English (remote). Edge has many online natural voices. Safari has Apple voices.

**Learning:** VoicePicker filters to `en-us` locale, shows ONLY online voices (`!localService`) or voices with "natural"/"neural" in name. No fallback to local basic voices. The `voiceQualityScore()` function sorts by known-good voice names, then natural/neural, then US locale.

**Supersedes:** Earlier version that fell back to all en-US when < 2 online.

**Apply when:** Modifying VoicePicker filtering or adding voice quality indicators.

## BurmesePlayer Cancel-Retry Zombie Bug

**Context:** `BurmesePlayer.cancel()` during playback caused `attemptPlay()` to reject (via audio error event). But `play()`'s catch block retried on ANY rejection — so cancelled audio restarted as a zombie.

**Learning:** Audio players with retry-on-error logic need a `cancelledFlag` to distinguish explicit cancel from network/load failures. Set the flag in `cancel()`, check it before retry.

```typescript
let cancelledFlag = false;

async play(url, rate) {
  cancelledFlag = false; // Reset on new play
  try {
    await attemptPlay(url, rate);
  } catch {
    if (cancelledFlag) { resetState(); return; } // Don't retry after cancel
    // ... retry logic for genuine errors
  }
}

cancel() {
  cancelledFlag = true;
  cleanupAudio();
  resetState();
}
```

**Apply when:** Any audio/media player with retry logic and explicit cancel support.
