/**
 * Celebration Sounds Module
 *
 * Multi-stage choreography sound functions for the celebration system.
 * Provides timing-aware sounds for count-up animations, confetti bursts,
 * pass/fail reveals, XP dings, and the ultimate 100% fanfare.
 *
 * Uses the shared AudioContext from soundEffects.ts via getContext().
 * All functions respect mute state and fail silently.
 */

import { getContext, isSoundMuted, playNoteWarm } from './soundEffects';

// ---------------------------------------------------------------------------
// Count-up tick (slot machine style)
// ---------------------------------------------------------------------------

/**
 * Rapid ticking that rises in pitch as the count progresses.
 * Used during score count-up animation for slot-machine feel.
 *
 * @param index - Current tick index (0-based)
 * @param total - Total number of ticks expected
 */
export function playCountUpTick(index: number, total: number): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    // Pitch rises as count progresses: 800 Hz -> 1000 Hz
    const progress = total > 0 ? index / total : 0;
    const freq = 800 + progress * 200;

    // Very short notes with minimal harmonics
    playNoteWarm(ctx, freq, 0, 0.04, 0.12, 'sine', [{ multiplier: 2, gainRatio: 0.15 }]);
  } catch {
    // Silently ignore
  }
}

// ---------------------------------------------------------------------------
// Confetti burst
// ---------------------------------------------------------------------------

/**
 * Satisfying 'pop' sound followed by gentle sparkle.
 * Quick noise burst + rapid frequency sweep down, then 3 high-pitched notes.
 */
export function playConfettiBurst(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Pop: quick burst at 1200 Hz sweeping down to 300 Hz over 30ms
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();

    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(1200, now);
    popOsc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

    popGain.gain.setValueAtTime(0.2, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    popOsc.connect(popGain);
    popGain.connect(ctx.destination);

    popOsc.start(now);
    popOsc.stop(now + 0.03);

    // Sparkle: 3 quick high-pitched notes staggered by 60ms
    const sparkleFreqs = [2000, 2400, 2800];
    for (let i = 0; i < sparkleFreqs.length; i++) {
      const offset = 0.04 + i * 0.06; // Start after pop, 60ms apart
      playNoteWarm(ctx, sparkleFreqs[i], offset, 0.02, 0.08, 'sine', [
        { multiplier: 2, gainRatio: 0.15 },
      ]);
    }
  } catch {
    // Silently ignore
  }
}

// ---------------------------------------------------------------------------
// Pass reveal
// ---------------------------------------------------------------------------

/**
 * Triumphant ascending chord for passing score reveal.
 * C5+E5+G5 simultaneous (0.3s), then C6 (0.2s), then E6 (0.15s).
 * Rich, warm tone with full harmonics. Total duration ~0.7s.
 */
export function playPassReveal(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    // Simultaneous chord: C5 + E5 + G5
    playNoteWarm(ctx, 523, 0, 0.3, 0.25); // C5
    playNoteWarm(ctx, 659, 0, 0.3, 0.25); // E5
    playNoteWarm(ctx, 784, 0, 0.3, 0.25); // G5

    // Ascending resolution
    playNoteWarm(ctx, 1047, 0.3, 0.2, 0.3); // C6
    playNoteWarm(ctx, 1319, 0.5, 0.15, 0.3); // E6
  } catch {
    // Silently ignore
  }
}

// ---------------------------------------------------------------------------
// Fail reveal
// ---------------------------------------------------------------------------

/**
 * Soft, warm, encouraging tone for failing score reveal.
 * NOT a buzzer -- gentle descending two notes with warmth.
 * D4 (294 Hz) -> C4 (262 Hz), 0.2s each. Low, brief, non-punishing.
 */
export function playFailReveal(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    // Gentle descending: D4 -> C4
    playNoteWarm(ctx, 294, 0, 0.2, 0.12); // D4
    playNoteWarm(ctx, 262, 0.2, 0.3, 0.12); // C4 with longer sustain
  } catch {
    // Silently ignore
  }
}

// ---------------------------------------------------------------------------
// XP ding
// ---------------------------------------------------------------------------

/**
 * Coin-collect style ding with rising pitch on consecutive correct answers.
 * Creates ascending momentum as the player chains correct answers.
 *
 * @param consecutiveCorrect - Number of consecutive correct answers (0-based)
 */
export function playXPDing(consecutiveCorrect: number): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    // Rising pitch: A5 (880 Hz) + 50 Hz per consecutive, capped at E6 (1320 Hz)
    const freq = Math.min(880 + consecutiveCorrect * 50, 1320);

    // Triangle wave for coin-like timbre
    playNoteWarm(ctx, freq, 0, 0.08, 0.2, 'triangle', [
      { multiplier: 2, gainRatio: 0.25 },
      { multiplier: 3, gainRatio: 0.1 },
    ]);
  } catch {
    // Silently ignore
  }
}

// ---------------------------------------------------------------------------
// Soft error
// ---------------------------------------------------------------------------

/**
 * Brief, low, gentle 'bonk' -- NOT a buzzer.
 * 200 Hz triangle wave with slight pitch bend down to 150 Hz over 100ms.
 */
export function playErrorSoft(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Fundamental with pitch bend
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);

    // Subtle harmonic at 2x
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(400, now);
    osc2.frequency.exponentialRampToValueAtTime(300, now + 0.1);

    gain2.gain.setValueAtTime(0.12 * 0.15, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now);
    osc2.stop(now + 0.1);
  } catch {
    // Silently ignore
  }
}

// ---------------------------------------------------------------------------
// Practice complete
// ---------------------------------------------------------------------------

/**
 * Quick chime for practice session completion.
 * C5 + E5 rapid (80ms each, 50ms gap). Lighter than playMilestone.
 */
export function playPracticeComplete(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    playNoteWarm(ctx, 523, 0, 0.08, 0.15); // C5
    playNoteWarm(ctx, 659, 0.13, 0.08, 0.15); // E5 (80ms note + 50ms gap = 130ms offset)
  } catch {
    // Silently ignore
  }
}

// ---------------------------------------------------------------------------
// Ultimate fanfare (100% perfect score)
// ---------------------------------------------------------------------------

/**
 * Unique victory fanfare for 100% perfect score.
 * Multi-note ascending sequence with final chord and pseudo-reverb.
 *
 * C5 (0.15s) -> E5 (0.15s) -> G5 (0.15s) -> C6+E6+G6 chord (0.4s)
 * Final chord has a slight reverb effect via delayed duplicate notes.
 */
export function playUltimateFanfare(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    // Ascending sequence
    playNoteWarm(ctx, 523, 0, 0.15, 0.35); // C5
    playNoteWarm(ctx, 659, 0.15, 0.15, 0.35); // E5
    playNoteWarm(ctx, 784, 0.3, 0.15, 0.35); // G5

    // Final triumphant chord: C6 + E6 + G6
    playNoteWarm(ctx, 1047, 0.45, 0.4, 0.35); // C6
    playNoteWarm(ctx, 1319, 0.45, 0.4, 0.35); // E6
    playNoteWarm(ctx, 1568, 0.45, 0.4, 0.35); // G6

    // Pseudo-reverb: duplicate chord at slight delay with reduced gain
    playNoteWarm(ctx, 1047, 0.47, 0.4, 0.35 * 0.5); // C6 echo
    playNoteWarm(ctx, 1319, 0.47, 0.4, 0.35 * 0.5); // E6 echo
    playNoteWarm(ctx, 1568, 0.47, 0.4, 0.35 * 0.5); // G6 echo
  } catch {
    // Silently ignore
  }
}

// ---------------------------------------------------------------------------
// Central dispatch for choreography stages
// ---------------------------------------------------------------------------

/** Options for count-up tick context. */
export interface CelebrationSoundOptions {
  /** Current index for count-up tick (0-based). */
  consecutiveIndex?: number;
  /** Total count for count-up tick. */
  total?: number;
}

/**
 * Central dispatch function that plays the appropriate sound for each
 * choreography stage of the celebration sequence.
 *
 * @param stage   - The choreography stage identifier
 * @param options - Optional context for count-up ticks
 */
export function playCelebrationSequence(
  stage:
    | 'card-enter'
    | 'count-up-tick'
    | 'count-up-land'
    | 'pass-reveal'
    | 'fail-reveal'
    | 'confetti'
    | 'buttons-enter',
  options?: CelebrationSoundOptions
): void {
  if (isSoundMuted()) return;

  switch (stage) {
    case 'card-enter':
      // Subtle whoosh for card entrance -- reuse a gentle note
      playPracticeComplete();
      break;
    case 'count-up-tick':
      playCountUpTick(options?.consecutiveIndex ?? 0, options?.total ?? 1);
      break;
    case 'count-up-land':
      // Landing sound when count-up reaches final value
      playConfettiBurst();
      break;
    case 'pass-reveal':
      playPassReveal();
      break;
    case 'fail-reveal':
      playFailReveal();
      break;
    case 'confetti':
      playConfettiBurst();
      break;
    case 'buttons-enter':
      // Subtle ding for action buttons appearing
      playCountUpTick(0, 1);
      break;
  }
}
