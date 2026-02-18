/**
 * Sound Effects Module
 *
 * Provides gamified audio feedback for correct/incorrect answers,
 * level-ups, milestones, and navigation transitions.
 *
 * Extends the audioChime.ts pattern: module-level AudioContext singleton
 * with lazy initialization. All functions are module-level (NOT hooks)
 * and are React Compiler safe -- call from event handlers only.
 *
 * Failures are silently caught so sound issues never break app flow.
 */

// ---------------------------------------------------------------------------
// Mute preference
// ---------------------------------------------------------------------------

const SOUND_MUTE_KEY = 'civic-prep-sound-muted';

/**
 * Check whether sound effects are muted.
 * Returns true when muted or when running in SSR (no window).
 */
export function isSoundMuted(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(SOUND_MUTE_KEY) === 'true';
}

/**
 * Toggle mute state. Returns the new muted value.
 */
export function toggleMute(): boolean {
  const next = !isSoundMuted();
  localStorage.setItem(SOUND_MUTE_KEY, String(next));
  return next;
}

/**
 * Explicitly set mute state.
 */
export function setSoundMuted(muted: boolean): void {
  localStorage.setItem(SOUND_MUTE_KEY, String(muted));
}

// ---------------------------------------------------------------------------
// AudioContext singleton (separate from audioChime.ts)
// ---------------------------------------------------------------------------

let audioContext: AudioContext | null = null;

/**
 * Lazily create / resume the shared AudioContext.
 * Returns null when AudioContext is unavailable (SSR, old browser, error).
 */
function getContext(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }
    return audioContext;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Reusable note helper
// ---------------------------------------------------------------------------

type OscillatorWaveType = 'sine' | 'square' | 'sawtooth' | 'triangle';

/**
 * Play a single note with an oscillator + gain envelope.
 *
 * @param ctx   - AudioContext
 * @param freq  - Frequency in Hz
 * @param delay - Seconds from now to start
 * @param duration - Seconds the note sustains
 * @param gain  - Peak gain (0-1)
 * @param waveType - Oscillator wave shape
 */
function playNote(
  ctx: AudioContext,
  freq: number,
  delay: number,
  duration: number,
  gain = 0.25,
  waveType: OscillatorWaveType = 'sine'
): void {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = waveType;
  osc.frequency.value = freq;

  const startTime = ctx.currentTime + delay;

  gainNode.gain.setValueAtTime(gain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

// ---------------------------------------------------------------------------
// Sound functions
// ---------------------------------------------------------------------------

/**
 * Ascending two-note ding for correct answers.
 * C5 (523 Hz) -> E5 (659 Hz). Bright, cheerful.
 */
export function playCorrect(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    playNote(ctx, 523, 0, 0.15, 0.25); // C5
    playNote(ctx, 659, 0.12, 0.15, 0.25); // E5
  } catch {
    // Silently ignore -- sound failure must never break app flow
  }
}

/**
 * Soft descending two-note for incorrect answers.
 * E4 (330 Hz) -> C4 (262 Hz). Gentle, not punishing.
 */
export function playIncorrect(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    playNote(ctx, 330, 0, 0.2, 0.15); // E4
    playNote(ctx, 262, 0.15, 0.3, 0.15); // C4
  } catch {
    // Silently ignore
  }
}

/**
 * Ascending arpeggio for level-ups.
 * C5 -> E5 -> G5 in quick succession. Energetic.
 */
export function playLevelUp(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    playNote(ctx, 523, 0, 0.2, 0.3); // C5
    playNote(ctx, 659, 0.1, 0.2, 0.3); // E5
    playNote(ctx, 784, 0.2, 0.2, 0.3); // G5
  } catch {
    // Silently ignore
  }
}

/**
 * Triumphant chord for milestone celebrations.
 * C5+E5+G5 simultaneous with longer sustain, followed by octave C6.
 */
export function playMilestone(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    // Simultaneous chord
    playNote(ctx, 523, 0, 0.4, 0.25); // C5
    playNote(ctx, 659, 0, 0.4, 0.25); // E5
    playNote(ctx, 784, 0, 0.4, 0.25); // G5
    // Octave C6 after a brief pause
    playNote(ctx, 1047, 0.3, 0.4, 0.25); // C6
  } catch {
    // Silently ignore
  }
}

/**
 * Quick pitch sweep for navigation/transitions.
 * Frequency ramp from 400 Hz to 800 Hz over 0.15s. Subtle.
 */
export function playSwoosh(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Silently ignore
  }
}

// ---------------------------------------------------------------------------
// Countdown sounds
// ---------------------------------------------------------------------------

/**
 * Short click/tick for countdown numbers (5, 4, 3, 2, 1).
 * 800 Hz sine wave, 80ms duration, volume 0.15. Subtle but audible.
 */
export function playCountdownTick(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    playNote(ctx, 800, 0, 0.08, 0.15);
  } catch {
    // Silently ignore
  }
}

/**
 * Ascending two-note "Go!" chime for countdown completion.
 * C5 (523 Hz) at t=0 for 150ms, then G5 (784 Hz) at t=0.1 for 200ms.
 * Energetic start signal.
 */
export function playCountdownGo(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    playNote(ctx, 523, 0, 0.15, 0.25); // C5
    playNote(ctx, 784, 0.1, 0.2, 0.25); // G5
  } catch {
    // Silently ignore
  }
}

// ---------------------------------------------------------------------------
// Quiz interaction sounds
// ---------------------------------------------------------------------------

/**
 * Short neutral tone for skipping a question.
 * 500 Hz triangle wave, 100ms. Quick, non-judgmental.
 */
export function playSkip(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    playNote(ctx, 500, 0, 0.1, 0.15, 'triangle');
  } catch {
    // Silently ignore
  }
}

/**
 * Ascending 3-note arpeggio for streak milestones.
 * E5 (659 Hz) -> G5 (784 Hz) -> C6 (1047 Hz). Celebratory.
 */
export function playStreak(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    playNote(ctx, 659, 0, 0.12, 0.25, 'triangle'); // E5
    playNote(ctx, 784, 0.1, 0.12, 0.25, 'triangle'); // G5
    playNote(ctx, 1047, 0.2, 0.15, 0.25, 'triangle'); // C6
  } catch {
    // Silently ignore
  }
}

/**
 * Quick frequency sweep for feedback panel reveal.
 * Sine wave 200 Hz -> 600 Hz over 120ms. Subtle "whoosh" upward.
 */
export function playPanelReveal(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Silently ignore
  }
}

/**
 * Short sparkly burst for progress bar completion.
 * High-frequency sine wave (2000 Hz) with quick decay. Satisfying.
 */
export function playCompletionSparkle(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    playNote(ctx, 2000, 0, 0.08, 0.2);
    playNote(ctx, 2400, 0.04, 0.08, 0.15);
  } catch {
    // Silently ignore
  }
}

// ---------------------------------------------------------------------------
// Sort mode sounds
// ---------------------------------------------------------------------------

/**
 * Whoosh sound for card fling gesture.
 * Frequency sweep from 800 Hz -> 300 Hz over 0.2s. Quick, kinetic.
 */
export function playFling(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Silently ignore
  }
}

/**
 * Ascending two-note ding for "Know" sort.
 * C5 (523 Hz) -> E5 (659 Hz). Bright, affirming.
 */
export function playKnow(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    playNote(ctx, 523, 0, 0.2, 0.12); // C5
    playNote(ctx, 659, 0.1, 0.2, 0.12); // E5
  } catch {
    // Silently ignore
  }
}

/**
 * Low single-note thud for "Don't Know" sort.
 * 200 Hz triangle wave. Soft, non-punishing.
 */
export function playDontKnow(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    playNote(ctx, 200, 0, 0.15, 0.15, 'triangle');
  } catch {
    // Silently ignore
  }
}

/**
 * Triumphant five-note chime for 100% mastery completion.
 * C5+E5+G5 chord, then ascending C6 and E6. Celebratory.
 */
export function playMasteryComplete(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    // Simultaneous chord
    playNote(ctx, 523, 0, 0.3, 0.4); // C5
    playNote(ctx, 659, 0, 0.3, 0.4); // E5
    playNote(ctx, 784, 0, 0.3, 0.4); // G5
    // Ascending resolution
    playNote(ctx, 1047, 0.3, 0.3, 0.5); // C6
    playNote(ctx, 1319, 0.5, 0.25, 0.5); // E6
  } catch {
    // Silently ignore
  }
}

// ---------------------------------------------------------------------------
// Timer warning sounds
// ---------------------------------------------------------------------------

/**
 * Short tick for per-question timer warning (at <= 5 seconds remaining).
 * 800 Hz sine wave, 80ms duration, volume 0.15. Distinct from countdown tick
 * by being used per-second during the warning phase.
 */
export function playTimerWarningTick(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    playNote(ctx, 800, 0, 0.08, 0.15);
  } catch {
    // Silently ignore
  }
}
