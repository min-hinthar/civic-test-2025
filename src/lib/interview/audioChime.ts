/**
 * Audio chime utility for interview simulation.
 *
 * Generates a short programmatic chime sound via Web Audio API.
 * Uses an OscillatorNode with a sine wave at 880 Hz (A5 note)
 * that fades out over 0.5 seconds.
 *
 * AudioContext is lazily initialized on first call to avoid
 * browser autoplay policy issues.
 */

/** Module-level AudioContext, lazily initialized */
let audioContext: AudioContext | null = null;

/**
 * Play a short chime sound.
 *
 * Creates a 0.5-second sine wave at 880 Hz (A5) that fades out
 * with an exponential ramp. Safe to call at any time -- failures
 * are silently caught so chime issues never break interview flow.
 */
export function playChime(): void {
  try {
    // Lazily create AudioContext on first user-initiated call
    if (!audioContext) {
      audioContext = new AudioContext();
    }

    // Resume if suspended (required by some browsers after tab switch)
    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = 880; // A5 note

    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.5
    );

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.5);
  } catch {
    // Silently ignore -- chime failure must never break interview flow
  }
}
