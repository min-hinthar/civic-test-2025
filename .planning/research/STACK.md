# Technology Stack: v2.1 Quality & Polish

**Project:** Civic Test Prep 2025 - v2.1 Milestone
**Researched:** 2026-02-13
**Overall confidence:** HIGH

---

## Existing Stack (Validated in v1.0 + v2.0 -- DO NOT RE-ADD)

| Technology | Current Version | Status |
|------------|----------------|--------|
| Next.js (Pages Router) | 15.5.12 | Keep |
| React | 19.2.0 | Keep |
| motion/react | 12.33.0 | Keep -- already has drag/gesture/useMotionValue/useTransform |
| Tailwind CSS | 3.4.17 | Keep |
| @radix-ui/react-dialog | 1.1.15 | Keep |
| @radix-ui/react-progress | 1.1.8 | Keep |
| @serwist/next + serwist | 9.5.4 | Keep -- handles precaching and runtime caching |
| Web Speech API (browser built-in) | N/A | Keep for English TTS; Burmese TTS addressed below |
| Vitest + @testing-library/react | 4.0.18 / 16.3.2 | Keep |
| ESLint 9 flat config | 9.17.0+ | Keep |

---

## Recommended Stack Additions

### 1. @andresaya/edge-tts -- Pre-Generated Burmese Audio (Build-Time Only)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @andresaya/edge-tts | ^1.2.0 | Build script to pre-generate Burmese MP3 audio files | Microsoft Edge neural voices are the ONLY free TTS option that supports Burmese (my-MM). Two voices available: NilarNeural (female) and ThihaNeural (male). Google Cloud TTS does not support Burmese. Kokoro TTS does not support Burmese. Web Speech API has no Burmese voices in Chrome/Firefox/Safari. |

**Confidence: HIGH** -- Microsoft Edge TTS voice list verified: `my-MM-NilarNeural` and `my-MM-ThihaNeural` are confirmed available. Edge TTS is free, requires no API key.

**Why pre-generated, not runtime:**
1. `edge-tts-universal` (the browser client) stopped working in non-Edge browsers as of December 2025 -- Microsoft now requires an Edge user-agent header on the Read Aloud API WebSocket connection.
2. Pre-generated MP3 files work offline (critical for PWA use case).
3. Audio quality is consistent -- no variation by device/browser.
4. ~128 questions x 4 strings (question_en, question_my, answer_en, answer_my) = ~512 files. At ~3-5KB per short sentence MP3, total is ~2-3 MB. Well within Vercel's 100MB deploy limit.

**Why NOT these alternatives:**

| Alternative | Why Not |
|-------------|---------|
| Google Cloud TTS | Does not support Burmese (my-MM) at all |
| Kokoro TTS (WASM) | Supports only English, French, Korean, Japanese, Mandarin. No Burmese. |
| Amazon Polly | Paid API. No free tier for Burmese. |
| Web Speech API for Burmese | No browser ships Burmese voices natively. Chrome/Firefox/Safari all return zero voices for `my` or `my-MM` locale. |
| edge-tts-universal (client-side) | Blocked in non-Edge browsers since Dec 2025 due to user-agent requirement |
| edge-tts (Python) | Requires Python in CI. Node.js alternative available. |

**Build script approach:**
```bash
# Dev dependency only -- runs at build time, not shipped to client
pnpm add -D @andresaya/edge-tts
```

```typescript
// scripts/generate-audio.ts (run before deploy)
import { EdgeTTS } from '@andresaya/edge-tts';

const tts = new EdgeTTS();

// Burmese question audio
await tts.synthesize(questionMy, 'my-MM-NilarNeural');
await tts.toFile(`public/audio/my/${questionId}-q.mp3`);

// English question audio (higher quality than Web Speech API)
await tts.synthesize(questionEn, 'en-US-AriaNeural');
await tts.toFile(`public/audio/en/${questionId}-q.mp3`);
```

**English TTS strategy:** Keep Web Speech API as the default for English (works well, zero bandwidth cost). The pre-generated English audio files serve as a fallback for devices where Web Speech API is unsupported or has poor voice quality. The build script generates both languages so the fallback path is consistent.

**Service worker integration:** Pre-generated audio files in `public/audio/` are static assets. Serwist will precache them automatically if added to the manifest, or they can be cached at runtime with a cache-first strategy.

### 2. vitest-axe -- Accessibility Testing in Unit Tests

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| vitest-axe | ^0.1.0 | axe-core integration for Vitest | Adds `toHaveNoViolations()` matcher to existing Vitest + @testing-library/react test suite. Catches WCAG violations in component tests automatically. |

**Confidence: MEDIUM** -- Package works but hasn't been updated in 3 years (v0.1.0). However, it's a thin wrapper around axe-core which IS actively maintained. The API surface is tiny (one matcher function), so staleness risk is low. Compatible with Vitest 4.x and jsdom environment.

**Known limitations:**
- JSDOM does not support CSS rendering, so `color-contrast` rules will not work (expected -- visual contrast must be tested in browser).
- Must use `jsdom` environment, not `happy-dom` (project already uses jsdom).
- React 19 compatible -- vitest-axe doesn't depend on React directly; it runs axe-core on rendered DOM.

**Alternative considered: @chialab/vitest-axe** (v0.19.0, published 6 months ago). More actively maintained fork. If vitest-axe causes issues, swap to this.

```bash
pnpm add -D vitest-axe
```

**Test setup integration:**
```typescript
// src/__tests__/setup.ts (extend existing file)
import 'vitest-axe/extend-expect';
```

```typescript
// Example: src/components/ui/__tests__/SpeechButton.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import SpeechButton from '../SpeechButton';

test('SpeechButton has no accessibility violations', async () => {
  const { container } = render(
    <SpeechButton text="test" label="Listen" />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 3. eslint-plugin-jsx-a11y -- Static Accessibility Linting

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| eslint-plugin-jsx-a11y | ^6.10.2 | Static AST analysis for accessibility issues in JSX | Catches missing alt text, improper ARIA attributes, missing labels, non-interactive element handlers at lint time. Complements runtime vitest-axe testing. |

**Confidence: HIGH** -- v6.10.2 (January 2025). Supports ESLint 9 flat config via `flatConfigs.recommended`. 11M+ weekly downloads.

**Integration with existing ESLint config:**
```bash
pnpm add -D eslint-plugin-jsx-a11y
```

```javascript
// eslint.config.mjs (add to existing config)
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  // ... existing config ...
  jsxA11y.flatConfigs.recommended,
  // ... rest of config ...
];
```

**Why NOT @axe-core/react (dev overlay):** Does NOT support React 18+. Confirmed on npm: "This package does not support React 18 and above." The project uses React 19. Deque recommends their paid "axe Developer Hub" product instead. Not viable.

### 4. @next/bundle-analyzer -- Bundle Size Analysis

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @next/bundle-analyzer | ^15.5.0 | Visual treemap of client/server bundle sizes | Identifies oversized dependencies, code splitting opportunities, and dead code. Generates interactive HTML reports for client, edge, and nodejs bundles. |

**Confidence: HIGH** -- Official Next.js package. Version matches Next.js 15.5.x. Well-documented.

```bash
pnpm add -D @next/bundle-analyzer
```

**Integration:**
```javascript
// next.config.mjs (wrap existing config)
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Wrap: withSentryConfig(withSerwist(withBundleAnalyzer(nextConfig)), ...)
```

**Usage:** `ANALYZE=true pnpm build` opens three HTML reports in browser. Run ad-hoc during development, not in CI.

### 5. web-vitals -- Runtime Performance Monitoring

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| web-vitals | ^4.2.0 | Measure LCP, INP, CLS, FCP, TTFB in production | Reports real user metrics to console or Sentry. Next.js Pages Router supports `reportWebVitals` in `_app.tsx` but web-vitals gives more control and the latest metric definitions (INP replaced FID). |

**Confidence: HIGH** -- Official Google library. 4.x is latest stable. ~5M weekly downloads. Tiny (1.5KB gzipped).

```bash
pnpm add web-vitals
```

**Integration with Sentry (already installed):**
```typescript
// src/lib/vitals.ts
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';
import * as Sentry from '@sentry/nextjs';

export function reportWebVitals() {
  const sendToSentry = ({ name, value, id }: { name: string; value: number; id: string }) => {
    Sentry.metrics.distribution(`web_vital.${name}`, value, {
      unit: 'millisecond',
      tags: { vital_id: id },
    });
  };

  onCLS(sendToSentry);
  onINP(sendToSentry);
  onLCP(sendToSentry);
  onFCP(sendToSentry);
  onTTFB(sendToSentry);
}
```

---

## NO New Libraries Needed -- Existing Stack Covers These Features

### Swipeable Card Interactions (Duolingo/Quizlet-style)

**What's needed:** Tinder-like swipe-to-dismiss cards for flashcard review. Swipe right = "I know this", swipe left = "Study more". Rotation on drag, spring-back animation, stacked card depth effect.

**Already have everything in motion/react v12.33.0:**
- `drag` prop on `motion.div` -- enables pointer-based dragging
- `dragConstraints` -- limits drag area
- `dragElastic` -- rubber-band feel at constraints
- `dragDirectionLock` -- lock to first axis (horizontal swipe)
- `useMotionValue()` -- tracks drag offset without re-renders
- `useTransform()` -- maps drag X to rotation, opacity, scale
- `useSpring()` -- smooth spring-connected values
- `AnimatePresence` -- exit animations when card is dismissed
- `onDragEnd` callback with velocity + offset for swipe detection
- `PanInfo` type for gesture event data

**The project already uses this pattern.** `FlashcardStack.tsx` implements horizontal swipe navigation with `drag="x"`, `dragConstraints`, `dragElastic`, and `onDragEnd` with velocity/threshold detection. Upgrading to Tinder-style dismiss is an enhancement of the existing pattern, not a new capability.

**Implementation upgrade path:**
```typescript
// Current (FlashcardStack.tsx line 139-154): swipe changes index
// Upgrade: swipe dismisses card with rotation + fly-off animation

const x = useMotionValue(0);
const rotate = useTransform(x, [-200, 200], [-15, 15]);
const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  style={{ x, rotate, opacity }}
  onDragEnd={(_, info) => {
    if (Math.abs(info.offset.x) > 100) {
      // Swipe detected: animate off-screen, then advance
      animate(x, info.offset.x > 0 ? 500 : -500, {
        type: 'spring', stiffness: 300, damping: 30,
        onComplete: () => onSwipe(info.offset.x > 0 ? 'right' : 'left')
      });
    }
  }}
>
```

**Why NOT @use-gesture/react:** Motion's built-in drag is sufficient. @use-gesture adds another dependency (~12KB) for gesture detection that motion/react already handles. The project has zero need for pinch, scroll, or multi-touch gestures. Adding @use-gesture would create two competing gesture systems.

### TTS Voice Quality Improvements (English)

**What's needed:** Better English voice selection, consistent quality across browsers.

**Already have everything:**
- `useSpeechSynthesis.ts` -- voice selection with quality hints (enhanced, premium, Apple, Google)
- `useInterviewTTS.ts` -- speech rate preferences, timeout fallbacks
- Web Speech API works well for English across Chrome, Edge, Safari

**Enhancement approach (no new library):**
1. Add voice preference storage (user picks from available voices)
2. Improve voice ranking algorithm in `findVoice()` to prefer neural/natural voices
3. Add `SpeechSynthesisUtterance` SSML-like rate/pitch presets for clearer pronunciation
4. Fall back to pre-generated audio when Web Speech API voice quality is poor

### Performance Profiling

**What's needed:** Identify render bottlenecks, large re-renders, slow components.

**Already have everything:**
- React DevTools Profiler (built into React 19)
- React Compiler (already in use -- handles memoization automatically)
- Chrome DevTools Performance tab
- Sentry for production error/performance monitoring

**No new library needed.** The `web-vitals` addition above covers production metric collection. Development profiling uses built-in browser/React tooling.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Burmese TTS | @andresaya/edge-tts (build-time) | Google Cloud TTS | Does not support Burmese language |
| Burmese TTS | @andresaya/edge-tts (build-time) | Kokoro TTS (WASM) | Does not support Burmese -- only English, French, Korean, Japanese, Mandarin |
| Burmese TTS | @andresaya/edge-tts (build-time) | edge-tts-universal (client-side) | Blocked in non-Edge browsers since Dec 2025 (user-agent requirement) |
| Burmese TTS | @andresaya/edge-tts (build-time) | edge-tts (Python) | Requires Python in CI; @andresaya/edge-tts is pure Node.js |
| Swipe gestures | motion/react (already installed) | @use-gesture/react | Adds competing gesture system; motion's drag is sufficient |
| Swipe gestures | motion/react (already installed) | react-tinder-card | Unmaintained, no TypeScript types, bundles its own animation |
| A11y testing | vitest-axe + eslint-plugin-jsx-a11y | @axe-core/react (dev overlay) | Does not support React 18+ (project uses React 19) |
| A11y testing | vitest-axe | @chialab/vitest-axe | Fallback option if vitest-axe has issues; more actively maintained |
| A11y linting | eslint-plugin-jsx-a11y | Manual review | Catches <20% of issues human reviewers catch; automated is baseline |
| Bundle analysis | @next/bundle-analyzer | source-map-explorer | Not integrated with Next.js; requires manual source map extraction |
| Bundle analysis | @next/bundle-analyzer | webpack-bundle-analyzer | @next/bundle-analyzer wraps this with Next.js integration |
| Web vitals | web-vitals | Next.js reportWebVitals | web-vitals provides INP (replaced FID), more control over reporting |
| Web vitals | web-vitals | Vercel Analytics | Paid feature on Pro plan; web-vitals is free and reports to Sentry |

---

## Installation

```bash
# Runtime dependencies (1 package)
pnpm add web-vitals

# Dev dependencies (3 packages)
pnpm add -D @andresaya/edge-tts vitest-axe eslint-plugin-jsx-a11y

# Optional: bundle analyzer (ad-hoc use)
pnpm add -D @next/bundle-analyzer
```

Total: 4-5 new packages (1 runtime, 3-4 dev-only).

---

## Integration Points with Existing Stack

### Pre-Generated Audio with Serwist Service Worker

The pre-generated MP3 files in `public/audio/` integrate with the existing Serwist configuration. Two approaches:

**Option A: Precache (recommended for <5MB total)**
```javascript
// next.config.mjs -- add to Serwist config
const withSerwist = withSerwistInit({
  swSrc: 'src/lib/pwa/sw.ts',
  swDest: 'public/sw.js',
  additionalPrecacheEntries: [
    { url: '/offline.html', revision: '1' },
    // Audio files auto-included via public/ directory precaching
  ],
});
```

**Option B: Runtime cache with CacheFirst (if audio grows large)**
```typescript
// sw.ts -- add runtime caching rule for audio
runtimeCaching: [
  ...defaultCache,
  {
    urlPattern: /\/audio\/.*\.mp3$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'tts-audio-v1',
      expiration: { maxEntries: 600, maxAgeSeconds: 30 * 24 * 60 * 60 },
    },
  },
],
```

### Audio Playback Hook (Replaces/Augments useSpeechSynthesis for Burmese)

```typescript
// src/hooks/useAudioTTS.ts
export function useAudioTTS() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback((questionId: string, lang: 'en' | 'my', type: 'q' | 'a') => {
    const src = `/audio/${lang}/${questionId}-${type}.mp3`;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(src);
    audioRef.current.play();
  }, []);

  const cancel = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);

  return { speak, cancel };
}
```

### eslint-plugin-jsx-a11y in Existing ESLint Flat Config

```javascript
// eslint.config.mjs (modified)
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  js.configs.recommended,
  { ignores: ['.next/**', 'node_modules/**', 'dist/**', 'coverage/**', 'out/**'] },
  jsxA11y.flatConfigs.recommended, // Add a11y rules
  {
    files: ['**/*.{ts,tsx}'],
    // ... existing config unchanged
  },
  prettier,
];
```

### @next/bundle-analyzer Wrapping Existing Config Chain

```javascript
// next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer';
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

// Current: withSentryConfig(withSerwist(nextConfig), sentryOpts)
// New:     withSentryConfig(withSerwist(withBundleAnalyzer(nextConfig)), sentryOpts)
export default withSentryConfig(withSerwist(withBundleAnalyzer(nextConfig)), { /* ... */ });
```

---

## Audio File Budget Calculation

| Content | Count | Avg Duration | Avg Size | Total |
|---------|-------|-------------|----------|-------|
| English questions | 128 | ~3s | ~4KB | ~512KB |
| Burmese questions | 128 | ~4s | ~5KB | ~640KB |
| English answers | 128 | ~3s | ~4KB | ~512KB |
| Burmese answers | 128 | ~4s | ~5KB | ~640KB |
| **Total** | **512 files** | | | **~2.3 MB** |

This is 2.3% of Vercel's 100MB deploy limit. Audio files compress poorly (already compressed MP3), but their small total size makes this a non-issue.

---

## Version Compatibility Matrix

| New Package | Compatible With | Verified |
|-------------|----------------|----------|
| @andresaya/edge-tts@1.2.x | Node.js 18+ (build script only, not bundled) | YES -- Node.js API, dev dependency |
| vitest-axe@0.1.0 | Vitest 4.x, jsdom, React 19 (no React dependency) | YES -- runs axe on rendered DOM |
| eslint-plugin-jsx-a11y@6.10.2 | ESLint 9.x flat config | YES -- exports flatConfigs.recommended |
| @next/bundle-analyzer@15.5.x | Next.js 15.5.x | YES -- same major version |
| web-vitals@4.2.x | Any browser (standalone, no framework dependency) | YES -- 1.5KB, zero dependencies |

---

## Free Tier Impact

| Concern | Assessment |
|---------|------------|
| Client bundle increase | ~1.5KB gzipped (web-vitals only runtime addition) |
| Deploy size increase | ~2.3 MB (pre-generated audio in public/) |
| Bandwidth increase | Minimal -- audio cached by service worker after first load |
| Build time increase | ~30-60s for audio generation script (CI only, not dev) |
| External services | None. Edge TTS is free, no API key. All other tools are local. |

---

## Sources

### HIGH Confidence (Official Documentation, Verified Data)
- [Edge TTS Voice List (GitHub Gist)](https://gist.github.com/BettyJJ/17cbaa1de96235a7f5773b8690a20462) -- Confirmed `my-MM-NilarNeural` and `my-MM-ThihaNeural` voices
- [@andresaya/edge-tts (GitHub)](https://github.com/andresayac/edge-tts) -- Node.js/Bun package, `getVoicesByLanguage()`, `toFile()` API
- [Google Cloud TTS Supported Languages](https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types) -- Burmese NOT listed
- [motion.dev Drag Docs](https://motion.dev/docs/react-drag) -- drag, dragConstraints, dragElastic, onDragEnd
- [motion.dev Gestures Docs](https://motion.dev/docs/react-gestures) -- hover, tap, pan, drag
- [motion.dev Card Stack Tutorial](https://motion.dev/tutorials/react-card-stack) -- useMotionValue + useTransform pattern
- [@axe-core/react npm](https://www.npmjs.com/package/@axe-core/react) -- "does not support React 18 and above"
- [eslint-plugin-jsx-a11y npm](https://www.npmjs.com/package/eslint-plugin-jsx-a11y) -- v6.10.2, flat config support
- [vitest-axe GitHub](https://github.com/chaance/vitest-axe) -- v0.1.0, forked from jest-axe
- [@next/bundle-analyzer npm](https://www.npmjs.com/package/@next/bundle-analyzer) -- Official Next.js package
- [Vercel Hobby Plan Limits](https://vercel.com/docs/limits) -- 100MB deploy, 100GB bandwidth

### MEDIUM Confidence (Multiple Sources Agree)
- [Kokoro TTS Supported Languages](https://kokorottsai.com/) -- English, French, Korean, Japanese, Mandarin only
- [edge-tts-universal Browser Restriction](https://github.com/travisvn/edge-tts-universal) -- Dec 2025 user-agent requirement
- [Axe-core Testing with React (2026)](https://oneuptime.com/blog/post/2026-01-15-test-react-accessibility-axe-core/view) -- Setup patterns
- [web-vitals Library](https://github.com/GoogleChrome/web-vitals) -- INP metric, Sentry integration patterns

### LOW Confidence (Needs Validation During Implementation)
- Audio file size estimates (~3-5KB per sentence) -- Based on typical MP3 128kbps encoding at 2-4 second durations. Actual sizes should be verified when the build script is first run.
- `@andresaya/edge-tts` Burmese voice quality -- Microsoft's NilarNeural and ThihaNeural voices exist but pronunciation quality for USCIS civics terms in Burmese should be tested with actual content.

---

*Stack research for: Civic Test Prep 2025 v2.1 Quality & Polish*
*Researched: 2026-02-13*
*Key finding: 4-5 new packages (1 runtime, 3-4 dev). Pre-generated Burmese audio via Edge TTS is the only viable free approach. motion/react already handles all swipe gesture needs -- no new gesture library required.*
