# Phase 32: Celebration System Elevation - Research

**Researched:** 2026-02-20
**Domain:** Multi-sensory celebration choreography (confetti, sound, haptics, animation, DotLottie)
**Confidence:** HIGH

## Summary

This phase elevates the existing celebration system from simple confetti bursts and thin oscillator beeps to a choreographed, multi-sensory experience. The current codebase already has the foundational pieces: `Confetti.tsx` (react-canvas-confetti v2.0.7), `soundEffects.ts` (Web Audio API oscillators), `haptics.ts` (navigator.vibrate), `CountUpScore.tsx` (react-countup), and `XPPopup.tsx` (motion/react float animation). The primary work involves: (1) fixing a setInterval leak in Confetti.tsx's celebration mode, (2) building a `useCelebration` hook + overlay using DOM CustomEvents, (3) rewriting TestResultsScreen with multi-stage choreography, (4) integrating DotLottie for richer visual animations, (5) adding harmonics to existing oscillator sounds, and (6) creating an XP counter with spring pulse.

The main technical risk is DotLottie's WASM dependency conflicting with the project's strict CSP. The CSP in `middleware.ts` currently has `script-src 'self' <hash> https://accounts.google.com` with no `wasm-unsafe-eval` directive. DotLottie requires `'wasm-unsafe-eval'` in `script-src` for WASM compilation. This is a mandatory CSP update. The alternative (non-WASM lottie-web) is 5-10x slower for complex animations. Self-hosting the WASM file (copying to `public/`) eliminates CDN `connect-src` issues but the `wasm-unsafe-eval` directive is still required.

**Primary recommendation:** Fix the confetti leak first, build the celebration orchestration layer (useCelebration + CelebrationOverlay), then layer in sound harmonics, DotLottie, and choreography. The CSP update for `wasm-unsafe-eval` is safe (no known security implications beyond WASM compilation) and should be done early to unblock DotLottie work.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Vibe**: Playful & energetic -- game-like pop, bouncy animations, satisfying sounds (Duolingo/Kahoot energy)
- **Intensity scaling**: Gradual build -- even small wins feel good (visible confetti), big wins add more layers. Every celebration feels rewarding, just bigger ones are richer
- **Overlap handling**: Queue celebrations -- each plays fully in sequence with ~300ms gap between them. Nothing gets lost
- **Subtle queue counter**: Show a tiny "2 more" pill in the corner during queued celebrations for anticipation
- **Reduced motion**: Full respect -- no confetti, no scale animations, no DotLottie playback. Only color changes, static badge frames, and text. Sound still plays
- **No celebrations toggle**: Reduced-motion handles accessibility; no separate user toggle needed
- **Surprises**: Occasional rare variations -- Claude gets creative with 2-3 surprise elements to keep celebrations fresh
- **First-time specials**: First occurrence of each milestone type gets an elevated celebration; subsequent ones are the standard version
- **Dismissal**: Celebrations always play fully -- no tap-to-skip. They're short enough
- **Blocking**: Brief blocking overlay (~1-2 seconds during peak moment), then non-blocking for fade-out
- **Colors**: Mix of app theme colors for base confetti + gold accents for big achievements
- **Particle shapes**: Themed -- mix of stars, circles, and small flag/shield shapes (civics theme)
- **Confetti physics**: Party popper style -- bursts from bottom-center, fans outward and up, then falls
- **Aftermath**: Subtle remnants -- a few pieces settle briefly, then fade. Realistic physics touch
- **Low-end devices**: Reduce particle count (e.g., 200 -> 50) but same celebration style
- **Dark mode**: Theme-adapted -- brighter/more luminous particles in dark mode, slightly more saturated in light mode
- **Screen shake**: Subtle shake (100-200ms) for biggest celebrations only (100% perfect score)
- **XP counter**: Bouncy spring scale-up with floating "+N" text that drifts upward and fades
- **XP ding pitch**: Rising pitch on consecutive correct answers -- ascending scale builds momentum
- **Silent mode**: Mute sound only; visual celebrations + haptics still fire
- **Choreography pacing (full details)**: See CONTEXT.md for exhaustive pacing/timing decisions for TestResultsScreen, mid-quiz, practice mode, replay, 100% ultimate, background gradient, etc.
- **DotLottie visual style**: Playful & detailed, theme base + gold accents, marketplace source + custom colors, context-dependent loop behavior, different animations per tier, reduced-motion shows static final frame
- **DotLottie library**: Claude's discretion (dotlottie-react vs dotlottie-web)
- **Sound character**: Game-like SFX, warm harmonics (2nd/3rd at moderate volume), layered sounds, mix of synthesized + pre-recorded, ascending chimes for streaks, coin-collect XP ding, soft error tone
- **Audio sources**: Mix of synthesized (Web Audio API oscillators with harmonics) + pre-recorded audio files for complex SFX

### Claude's Discretion
- DotLottie file size budget
- DotLottie library choice (dotlottie-react vs dotlottie-web)
- DotLottie preloading strategy
- Trophy animation playback speed
- Celebration volume levels
- Score tick vs XP ding sound distinction
- Pre-recorded audio file sources and size budget
- 100% fanfare design
- 2-3 rare surprise celebration variations
- Count-up tick/ding pitch reset behavior at results screen

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CELB-01 | Fix existing Confetti.tsx setInterval leak before building new celebrations | Confetti.tsx line 90: `setInterval` in `celebration` case has no cleanup on unmount. The `useEffect` at line 123 does not clear the interval. Must store interval ref and clear in effect cleanup. |
| CELB-02 | `useCelebration` hook + `CelebrationOverlay` using DOM CustomEvents (not new Context) | DOM CustomEvent pattern avoids adding to provider tree. Hook dispatches typed events; overlay listens. Queue management with ~300ms gap. See Architecture Patterns section. |
| CELB-03 | Achievement-scaled confetti: 5-streak=sparkle, 10-streak=burst, test pass=burst, 100%=celebration | canvas-confetti supports custom shapes via `shapeFromPath` (star, flag/shield SVG paths) and `shapeFromText` (emoji). Particle count scales with level. Party popper origin from bottom-center. |
| CELB-04 | Multi-stage TestResultsScreen choreography: card scale-in -> count-up -> pass/fail reveal -> confetti -> sound -> action buttons stagger | Current TestResultsScreen uses simple FadeIn delays. Needs rewrite to sequential promise-based choreography with `motion/react` animation controls. CountUpScore already exists but needs overshoot easing enhancement. |
| CELB-05 | Haptic patterns fire at celebration peaks -- synchronized with confetti and sound | Existing `haptics.ts` has light/medium/heavy/double. Haptic calls wired into choreography stages at known timestamps. Fire from event handlers (React Compiler safe). |
| CELB-06 | DotLottie celebration animations (checkmark, trophy, badge glow, star burst) lazy-loaded | `@lottiefiles/dotlottie-react` v0.18.x wraps `dotlottie-web` WASM renderer. Requires CSP `wasm-unsafe-eval` update. Self-host WASM file to avoid CDN dependency. Lazy load via `React.lazy()` + dynamic import. |
| CELB-07 | Sound warming -- add 2nd/3rd harmonics to existing oscillator sounds for richer audio | Additive synthesis: layer multiple OscillatorNodes at harmonic frequencies (2x, 3x fundamental) with reduced gain. Modify existing `playNote()` helper in soundEffects.ts. |
| CELB-08 | `playCelebrationSequence(stage)` sound function for multi-stage choreography timing | New module function that schedules Web Audio API notes at precise `ctx.currentTime + offset` for count-up ticks, confetti pop, pass/fail reveal, etc. Pre-recorded MP3s for complex SFX (pop, sparkle). |
| CELB-09 | XP counter in quiz session header with spring pulse animation on increment | QuizHeader currently has no XP slot. Add XP display with `motion/react` spring scale animation + floating "+N" via existing XPPopup pattern. |
| CELB-10 | Score count-up with dramatic easing -- slow start, accelerating middle, spring overshoot landing | Current CountUpScore uses linear `react-countup`. Enhance with custom easing function + motion/react `useAnimationControls` for font-size overshoot + color shift during count-up. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-canvas-confetti | ^2.0.7 | Confetti rendering on canvas | Already in project, wraps canvas-confetti with React lifecycle |
| canvas-confetti | (peer dep) | Confetti physics + custom shapes | `shapeFromPath` for star/flag shapes, `shapeFromText` for emoji, `reset()` for cleanup |
| motion/react | ^12.33.0 | Animation choreography | Already in project (30+ components), spring physics, `useAnimationControls`, AnimatePresence |
| react-countup | ^6.5.3 | Score count-up | Already in project, needs custom easing function passed via `easingFn` prop |
| @lottiefiles/dotlottie-react | ^0.18.x | DotLottie animations | Official React wrapper, WASM-based renderer (60fps), lazy-loadable |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Web Audio API (browser) | N/A | Sound synthesis + harmonics | For warm oscillator tones, count-up ticks, rising pitch sequences |
| HTMLAudioElement | N/A | Pre-recorded SFX playback | For complex sounds (confetti pop, sparkle, fanfare) that can't be synthesized well |
| navigator.vibrate | N/A | Haptic feedback | Android devices, graceful no-op on iOS/desktop |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @lottiefiles/dotlottie-react (WASM) | lottie-react (lottie-web, no WASM) | No CSP issue but 5-10x slower rendering for complex animations, larger JS bundle |
| react-canvas-confetti | @neoconfetti/react | Smaller bundle, CSS-based, but no custom SVG shapes, no canvas physics control |
| Pre-recorded MP3s | All synthesized (Web Audio) | No file size cost but limited sound palette -- pop/sparkle effects sound thin when synthesized |

**Installation:**
```bash
pnpm add @lottiefiles/dotlottie-react
```

Note: `react-canvas-confetti`, `motion/react`, and `react-countup` are already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/celebrations/
│   ├── Confetti.tsx           # EXISTING - fix setInterval leak, add custom shapes
│   ├── CountUpScore.tsx       # EXISTING - enhance with overshoot easing + color shift
│   ├── CelebrationOverlay.tsx # NEW - global overlay listens for CustomEvents, renders queue
│   ├── DotLottieAnimation.tsx # NEW - lazy-loaded wrapper around DotLottieReact
│   ├── XPCounter.tsx          # NEW - spring-animated XP display for quiz header
│   ├── ScoreCountUp.tsx       # NEW (or enhance existing) - dramatic easing + X/Y sync
│   └── index.ts               # EXISTING - update exports
├── hooks/
│   └── useCelebration.ts      # NEW - dispatches celebration CustomEvents
├── lib/audio/
│   ├── soundEffects.ts        # EXISTING - add harmonics to playNote(), new celebration sequences
│   ├── celebrationSounds.ts   # NEW - multi-stage choreography sound scheduling
│   └── audioPlayer.ts         # EXISTING - used for pre-recorded MP3 SFX
└── lib/
    └── haptics.ts             # EXISTING - already has light/medium/heavy patterns
```

### Pattern 1: DOM CustomEvent Celebration Bus (CELB-02)
**What:** A pub/sub system using browser CustomEvents to trigger celebrations from any component without adding a React Context provider.
**When to use:** When you need global event dispatch (celebrate from quiz, sort, SRS, badges) without coupling to provider tree.
**Example:**
```typescript
// src/hooks/useCelebration.ts
export type CelebrationLevel = 'sparkle' | 'burst' | 'celebration' | 'ultimate';

interface CelebrationDetail {
  level: CelebrationLevel;
  source: string;       // "streak-5", "test-pass", "badge-earned", etc.
  isFirstTime?: boolean; // first occurrence = elevated
}

const CELEBRATION_EVENT = 'civic:celebrate';

export function celebrate(detail: CelebrationDetail): void {
  window.dispatchEvent(
    new CustomEvent(CELEBRATION_EVENT, { detail })
  );
}

export function useCelebrationListener(
  callback: (detail: CelebrationDetail) => void
): void {
  useEffect(() => {
    const handler = (e: Event) => {
      callback((e as CustomEvent<CelebrationDetail>).detail);
    };
    window.addEventListener(CELEBRATION_EVENT, handler);
    return () => window.removeEventListener(CELEBRATION_EVENT, handler);
  }, [callback]);
}
```

### Pattern 2: Celebration Queue in Overlay (CELB-02)
**What:** A singleton overlay component that queues celebrations and plays them sequentially.
**When to use:** When multiple achievements can fire simultaneously (e.g., streak + badge + mastery milestone).
**Example:**
```typescript
// In CelebrationOverlay.tsx
function CelebrationOverlay() {
  const [queue, setQueue] = useState<CelebrationDetail[]>([]);
  const [current, setCurrent] = useState<CelebrationDetail | null>(null);

  useCelebrationListener(useCallback((detail) => {
    setQueue(prev => [...prev, detail]);
  }, []));

  // When current finishes, wait 300ms, then dequeue next
  const handleComplete = useCallback(() => {
    setTimeout(() => {
      setCurrent(null);
      setQueue(prev => {
        const [next, ...rest] = prev;
        if (next) setCurrent(next);
        return rest;
      });
    }, 300);
  }, []);
  // ... render confetti, DotLottie, sound, haptics based on current
}
```

### Pattern 3: Additive Synthesis for Warm Harmonics (CELB-07)
**What:** Layer multiple oscillators at harmonic multiples of the fundamental frequency for richer sound.
**When to use:** Upgrading existing thin single-oscillator beeps to warm, game-like tones.
**Example:**
```typescript
// Enhanced playNote with harmonics
function playNoteWithHarmonics(
  ctx: AudioContext,
  freq: number,
  delay: number,
  duration: number,
  gain: number,
  waveType: OscillatorWaveType = 'sine',
  harmonics: { multiplier: number; gainRatio: number }[] = [
    { multiplier: 2, gainRatio: 0.3 },  // 2nd harmonic at 30% volume
    { multiplier: 3, gainRatio: 0.15 }, // 3rd harmonic at 15% volume
  ]
): void {
  // Fundamental
  playNote(ctx, freq, delay, duration, gain, waveType);
  // Harmonics
  for (const h of harmonics) {
    playNote(ctx, freq * h.multiplier, delay, duration, gain * h.gainRatio, waveType);
  }
}
```

### Pattern 4: Sequential Choreography with Promises (CELB-04)
**What:** Chain animation stages using motion/react controls + setTimeout promises for deterministic timing.
**When to use:** TestResultsScreen multi-stage reveal.
**Example:**
```typescript
async function runChoreography(isPassing: boolean) {
  // Stage 1: Card entrance
  await cardControls.start({ scale: 1, y: 0 });

  // Stage 2: Score count-up (CountUpScore onComplete callback)
  await new Promise(resolve => setOnCountComplete(() => resolve(undefined)));

  // Stage 3: Pass/fail reveal (100ms gap per user decision)
  await sleep(100);
  await badgeControls.start({ scale: [0, 1.15, 1] });

  // Stage 4: Confetti + sound (simultaneous)
  celebrate({ level: isPassing ? 'burst' : 'sparkle', source: 'test-result' });
  playCelebrationSequence(isPassing ? 'pass' : 'fail');
  hapticHeavy();

  // Stage 5: Action buttons stagger in
  await sleep(200);
  setShowButtons(true);
}
```

### Pattern 5: DotLottie Lazy Loading (CELB-06)
**What:** Lazy-load DotLottie React component via React.lazy to avoid WASM + animation data in initial bundle.
**When to use:** All DotLottie usage -- the WASM runtime is ~200KB, should not block initial load.
**Example:**
```typescript
// src/components/celebrations/DotLottieAnimation.tsx
import { lazy, Suspense } from 'react';

const DotLottieReact = lazy(() =>
  import('@lottiefiles/dotlottie-react').then(mod => ({
    default: mod.DotLottieReact,
  }))
);

export function DotLottieAnimation({ src, ...props }) {
  return (
    <Suspense fallback={null}> {/* No visible fallback -- animation is supplementary */}
      <DotLottieReact src={src} {...props} />
    </Suspense>
  );
}
```

### Anti-Patterns to Avoid
- **Adding a CelebrationContext provider:** Requirement explicitly says DOM CustomEvents, not new Context. Adding a provider would increase the already-deep provider nesting (10+ levels).
- **setInterval without cleanup ref:** The existing Confetti.tsx bug. Never use `setInterval` inside a function called from useEffect without storing the interval ID in a ref and clearing it in the cleanup.
- **Blocking the main thread with WASM init:** DotLottie WASM init is async. If you `setWasmUrl()` synchronously before render, the WASM is fetched async in the background. Do not `await` WASM init on the render path.
- **Simultaneous celebration stages:** User explicitly chose "visibly sequenced, not simultaneous." Each stage must complete before the next begins (except sound+confetti+haptic which fire together).
- **Creating new AudioContext per sound:** Reuse the module-level singleton. Multiple AudioContexts cause resource exhaustion on mobile.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Confetti physics | Custom canvas particle system | canvas-confetti `shapeFromPath`/`shapeFromText` | Gravity, drag, rotation, afterglow already solved; custom shapes via SVG paths |
| Animation choreography | Custom timer chains | motion/react `useAnimationControls` + async `.start()` | Spring physics, GPU-accelerated, promise-based sequencing built in |
| Count-up easing | Manual requestAnimationFrame loop | react-countup `easingFn` prop | Handles decimal precision, timing, display formatting |
| Lottie rendering | JSON parsing + canvas drawing | @lottiefiles/dotlottie-react | WASM renderer handles complex vector animations at 60fps |
| Sound synthesis scheduling | setTimeout chains for notes | Web Audio API `ctx.currentTime + delay` | Sample-accurate timing, no drift from JS event loop |
| Haptic patterns | Custom vibrate sequences | Existing `haptics.ts` light/medium/heavy | Already tested, graceful no-op on unsupported platforms |

**Key insight:** The existing codebase has working implementations of each individual sensory channel (confetti, sound, haptics, animation). This phase is about orchestrating them together, not rebuilding them. The orchestration layer (useCelebration + CelebrationOverlay + choreography functions) is the new code; the individual effects are upgrades to existing code.

## Common Pitfalls

### Pitfall 1: setInterval Leak on Unmount (CELB-01 -- THE BUG)
**What goes wrong:** Confetti.tsx's `celebration` case creates a `setInterval` inside `fireConfetti()`, which is called from a `useEffect`. If the component unmounts during the 3-second celebration, the interval continues firing, calling `instance()` on a null/stale reference.
**Why it happens:** The interval ID is stored in a local variable `interval` inside `fireConfetti()`, not in a ref. The `useEffect` cleanup doesn't know about it.
**How to avoid:** Store interval ID in a `useRef<number | null>`. Clear it in the `useEffect` cleanup function AND in the `clearInterval` call inside the interval callback.
**Warning signs:** Console errors about calling functions on unmounted components; memory leaks in dev tools.

### Pitfall 2: DotLottie WASM CSP Violation
**What goes wrong:** DotLottie fails to load with CSP error: "Refused to compile or instantiate WebAssembly module because 'unsafe-eval' is not an allowed source."
**Why it happens:** The project's CSP in `middleware.ts` has `script-src 'self' <hash>` without `'wasm-unsafe-eval'`. WASM compilation requires this directive.
**How to avoid:** Add `'wasm-unsafe-eval'` to the `script-src` directive in `middleware.ts`. This is narrower than `'unsafe-eval'` -- it only allows WASM compilation, not JS eval(). Self-host the WASM file in `public/` and use `setWasmUrl()` to avoid CDN `connect-src` issues.
**Warning signs:** Blank space where DotLottie should render; CSP violation in browser console.

### Pitfall 3: Race Condition in Celebration Queue
**What goes wrong:** Multiple celebrations fire simultaneously (e.g., streak milestone + badge earned + mastery milestone), causing overlapping confetti/sound/haptics.
**Why it happens:** Each source dispatches independently; without a queue, the overlay tries to play all at once.
**How to avoid:** The CelebrationOverlay must maintain a FIFO queue. Only one celebration plays at a time. When one completes, wait 300ms, then dequeue the next. Show a subtle "N more" pill for user anticipation.
**Warning signs:** Simultaneous confetti bursts, overlapping sounds, visual chaos.

### Pitfall 4: Web Audio Context Suspended After Tab Switch
**What goes wrong:** Sound effects silently fail after the user switches tabs and returns.
**Why it happens:** Browsers suspend AudioContext when tab loses focus. The existing `getContext()` function already handles this with `ctx.resume()`, but the celebration sound scheduler might schedule notes at `ctx.currentTime + offset` where `currentTime` was stale.
**How to avoid:** Always read `ctx.currentTime` fresh when scheduling. The existing pattern in `soundEffects.ts` does this correctly -- maintain the same pattern for new celebration sounds.
**Warning signs:** First sound after tab return is silent; subsequent sounds work.

### Pitfall 5: Animation Jank from Simultaneous Canvas + DOM Animations
**What goes wrong:** Confetti canvas rendering + motion/react DOM animations + DotLottie WASM rendering all compete for the main thread, causing < 60fps on low-end devices.
**Why it happens:** Three rendering systems fighting for paint cycles.
**How to avoid:** (1) Reduce confetti particle count on low-end devices (200 -> 50), (2) DotLottie adaptive framerate (start 60fps, drop to 30fps on performance issues), (3) Stagger start times so not all three systems peak simultaneously. Motion/react uses GPU-accelerated transforms which helps.
**Warning signs:** Frame drops during celebrations on mid-range Android devices.

### Pitfall 6: React Compiler Incompatibility with setState in Effect
**What goes wrong:** ESLint errors from `react-hooks/set-state-in-effect` rule when managing choreography state.
**Why it happens:** The project uses React Compiler ESLint rules which forbid `setState()` directly in effect bodies.
**How to avoid:** Use `useAnimationControls()` from motion/react for choreography sequencing (returns promises, no setState needed). For state that must change during choreography, use callback refs or event handlers, not effects. The CelebrationOverlay can use the CustomEvent listener pattern which fires callbacks (not effects).
**Warning signs:** ESLint errors on build; pre-commit hook failures.

### Pitfall 7: CountUpScore Overshoot with react-countup
**What goes wrong:** The `easingFn` prop in react-countup doesn't natively support spring overshoot (value goes above target then settles back).
**Why it happens:** react-countup's `easingFn` maps `t` (0->1) to progress (0->1). Spring overshoot means progress > 1.0 temporarily, which react-countup may clamp.
**How to avoid:** Use react-countup for the base count (0 to target), then use `motion/react` `useAnimationControls` for the overshoot effect (scale font-size up then back, show "+3" overshoot text then subtract). The visual overshoot is a display trick, not a count-up value overshoot.
**Warning signs:** Count-up value never exceeds target; overshoot feels flat.

## Code Examples

### Custom Confetti Shapes for Civics Theme (CELB-03)
```typescript
// Source: canvas-confetti docs - shapeFromPath API
import confetti from 'canvas-confetti';

// Star shape (5-pointed)
const starShape = confetti.shapeFromPath({
  path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
});

// Shield shape (civics theme)
const shieldShape = confetti.shapeFromPath({
  path: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5L12 1z',
});

// Flag emoji shape
const flagShape = confetti.shapeFromText({ text: '\uD83C\uDDFA\uD83C\uDDF8', scalar: 2 });

// Usage: mix shapes in confetti options
instance({
  ...confettiDefaults,
  shapes: [starShape, shieldShape, 'circle'],
  shapeWeights: [2, 1, 3], // stars twice as common as shields
  origin: { x: 0.5, y: 1.0 }, // bottom-center party popper
  angle: 90, // upward
  spread: 70,
  startVelocity: 45,
  gravity: 1.2,
});
```

### Harmonics-Enhanced Sound (CELB-07)
```typescript
// Enhanced playNote with additive harmonics
function playNoteWarm(
  ctx: AudioContext,
  freq: number,
  delay: number,
  duration: number,
  gain: number,
  wave: OscillatorWaveType = 'sine'
): void {
  const startTime = ctx.currentTime + delay;

  // Fundamental
  const osc1 = ctx.createOscillator();
  const g1 = ctx.createGain();
  osc1.type = wave;
  osc1.frequency.value = freq;
  g1.gain.setValueAtTime(gain, startTime);
  g1.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc1.connect(g1).connect(ctx.destination);
  osc1.start(startTime);
  osc1.stop(startTime + duration);

  // 2nd harmonic (octave above, 30% volume)
  const osc2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  osc2.type = wave;
  osc2.frequency.value = freq * 2;
  g2.gain.setValueAtTime(gain * 0.3, startTime);
  g2.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc2.connect(g2).connect(ctx.destination);
  osc2.start(startTime);
  osc2.stop(startTime + duration);

  // 3rd harmonic (fifth above octave, 15% volume)
  const osc3 = ctx.createOscillator();
  const g3 = ctx.createGain();
  osc3.type = wave;
  osc3.frequency.value = freq * 3;
  g3.gain.setValueAtTime(gain * 0.15, startTime);
  g3.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc3.connect(g3).connect(ctx.destination);
  osc3.start(startTime);
  osc3.stop(startTime + duration);
}
```

### DotLottie with WASM Self-Hosting (CELB-06)
```typescript
// src/components/celebrations/DotLottieAnimation.tsx
import { lazy, Suspense, useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Lazy load the entire DotLottie module
const LazyDotLottie = lazy(async () => {
  const { DotLottieReact, setWasmUrl } = await import('@lottiefiles/dotlottie-react');
  // Self-hosted WASM -- avoids CDN connect-src CSP issues
  setWasmUrl('/wasm/dotlottie-player.wasm');
  return { default: DotLottieReact };
});

interface Props {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function DotLottieAnimation({ src, loop, autoplay = true, speed, style, className }: Props) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    // Show static final frame via <img> fallback or nothing
    return null;
  }

  return (
    <Suspense fallback={null}>
      <LazyDotLottie
        src={src}
        loop={loop}
        autoplay={autoplay}
        speed={speed}
        style={style}
        className={className}
      />
    </Suspense>
  );
}
```

### CSP Update for WASM (CELB-06 prerequisite)
```typescript
// middleware.ts -- add 'wasm-unsafe-eval' to script-src
const scriptSrc = isDev
  ? `'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com`
  : `'self' 'wasm-unsafe-eval' ${THEME_SCRIPT_HASH} https://accounts.google.com`;
```

### Confetti Leak Fix (CELB-01)
```typescript
// Confetti.tsx -- store interval in ref, clear on unmount
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

const fireConfetti = useCallback(() => {
  // ... sparkle/burst cases unchanged ...
  case 'celebration': {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    // Clear any existing interval first
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        onComplete?.();
        return;
      }
      // ... burst logic ...
    }, 250);
    break;
  }
}, [/* deps */]);

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
}, []);
```

### XP Counter with Spring Pulse (CELB-09)
```typescript
// XP counter that pulses on increment
function XPCounter({ xp, previousXp }: { xp: number; previousXp: number }) {
  const controls = useAnimationControls();
  const shouldReduceMotion = useReducedMotion();
  const gained = xp - previousXp;

  useEffect(() => {
    if (gained > 0 && !shouldReduceMotion) {
      controls.start({
        scale: [1, 1.3, 1],
        transition: { type: 'spring', stiffness: 400, damping: 10 },
      });
    }
  }, [xp]); // Fire on xp change

  return (
    <div className="relative">
      <motion.span animate={controls} className="font-bold text-amber-500 tabular-nums">
        {xp} XP
      </motion.span>
      {gained > 0 && <XPPopup points={gained} show={true} />}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| lottie-web (JS renderer, 300KB) | dotlottie-web (WASM renderer, ~200KB WASM + small JS) | 2024 | 2-5x faster rendering for complex animations |
| @dotlottie/react-player (deprecated) | @lottiefiles/dotlottie-react | 2024 | Official replacement, active maintenance |
| Single oscillator beeps | Additive synthesis with harmonics | Always available in Web Audio | Noticeably richer, warmer sound |
| Canvas confetti (basic shapes) | canvas-confetti `shapeFromPath` + `shapeFromText` | v1.6.0+ (2023) | Custom SVG and emoji confetti shapes |
| CSS animations for celebrations | motion/react `useAnimationControls` async | motion v12 | Promise-based choreography sequencing |

**Deprecated/outdated:**
- `@dotlottie/react-player`: Deprecated in favor of `@lottiefiles/dotlottie-react` -- do not use
- `lottie-web` directly: Still works but heavier and slower than WASM-based dotlottie-web for complex animations
- `react-lottie`: Unmaintained, uses old lottie-web API

## Open Questions

1. **DotLottie animation file sourcing**
   - What we know: User decided marketplace (LottieFiles) + customize colors/timing. Free tier available.
   - What's unclear: Exact licensing terms for LottieFiles marketplace animations in an open-source PWA. Some marketplace animations are "free for personal use" vs "free for commercial use."
   - Recommendation: Use animations with explicit open/permissive licenses. LottieFiles has a "Free" filter that includes commercial-use animations. Alternatively, the checkmark and star-burst can be found on the free tier. Trophy and badge glow may need the premium tier or custom creation.

2. **Pre-recorded audio file sourcing and format**
   - What we know: User decided mix of synthesized + pre-recorded for complex SFX (confetti pop, sparkle shimmer, fanfare).
   - What's unclear: Whether to use freesound.org (CC0/CC-BY licensed), generate with AI tools, or synthesize all sounds.
   - Recommendation: Start with Web Audio synthesis for everything. Only add pre-recorded MP3s if synthesized versions sound inadequate for confetti pop and sparkle effects. This minimizes bundle size and licensing concerns.

3. **DotLottie WASM performance on low-end Android**
   - What we know: STATE.md flagged this as unverified. WASM renderer should be faster than JS, but the WASM binary itself is ~200KB.
   - What's unclear: Cold-start WASM compilation time on older devices (Snapdragon 400-series).
   - Recommendation: Lazy-load DotLottie so WASM compile happens in background. The celebration fires after user action (not cold start). If WASM fails to load, gracefully degrade (no DotLottie animation, confetti + sound carry the celebration).

4. **React 19 compatibility with @lottiefiles/dotlottie-react**
   - What we know: The project uses React 19.2.0. dotlottie-react v0.18.x peer deps not explicitly verified for React 19.
   - What's unclear: Whether React 19 strict mode or concurrent features cause issues.
   - Recommendation: Install and test early. If peer dependency warnings appear, use `pnpm` overrides. The library's core rendering is WASM-based (not React-dependent), so compatibility risk is LOW.

## Sources

### Primary (HIGH confidence)
- `/catdad/canvas-confetti` via Context7 - custom shapes (shapeFromPath, shapeFromText), reset(), origin, spread options
- `/lottiefiles/dotlottie-web` via Context7 - DotLottieReact component API, WASM self-hosting, setWasmUrl, lazy loading
- Codebase analysis: `src/components/celebrations/Confetti.tsx`, `src/lib/audio/soundEffects.ts`, `src/lib/haptics.ts`, `src/components/results/TestResultsScreen.tsx`, `src/components/quiz/QuizHeader.tsx`, `src/components/quiz/XPPopup.tsx`, `middleware.ts`

### Secondary (MEDIUM confidence)
- [LottieFiles dotlottie-web CSP/WASM wiki](https://github.com/LottieFiles/dotlottie-web/wiki/CSP-and-WASM-Self%E2%80%90Hosting-Guide) - CSP requirements, self-hosting approach, setWasmUrl API
- [MDN OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode) - Web Audio API oscillator types, harmonics
- [MDN script-src CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src) - wasm-unsafe-eval directive
- [GitHub Issue: dotlottie-web #562](https://github.com/LottieFiles/dotlottie-web/issues/562) - wasm-unsafe-eval CSP requirement confirmation
- [Additive Synthesis Web Audio](https://teropa.info/blog/2016/09/20/additive-synthesis.html) - Harmonic series and additive synthesis patterns

### Tertiary (LOW confidence)
- DotLottie React 19 compatibility: Not explicitly documented; based on inference from library architecture (WASM core, thin React wrapper)
- `wasm-unsafe-eval` on Safari/WebKit: [Bug 197759](https://bugs.webkit.org/show_bug.cgi?id=197759) shows it was implemented, but older Safari versions may not support it -- needs testing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project or well-documented official packages
- Architecture: HIGH - DOM CustomEvent pattern is standard, motion/react choreography well-documented, existing codebase patterns clear
- Pitfalls: HIGH - setInterval leak is visible in source code, CSP issue is verified via middleware.ts inspection + DotLottie docs
- Sound synthesis: MEDIUM - Additive harmonics pattern is well-established in Web Audio but exact gain ratios for "warm game-like" sound require tuning by ear
- DotLottie integration: MEDIUM - Library is well-documented but React 19 compat and WASM performance on low-end devices are unverified

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (stable domain, libraries mature)
