# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Bilingual (English + Burmese) U.S. Citizenship Civics Test prep app. Offline-first PWA with spaced repetition, interview simulation, and progress tracking. Deployed at https://civic-test-2025.vercel.app/

## Commands

```bash
npm run dev          # Next.js dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Vitest watch mode
npm run test:run     # Vitest single run (CI)
npm run test:run -- src/lib/ttsCore.test.ts  # Run single test file
npm run test:coverage # Coverage report (v8 provider)
npm run lint:css     # Stylelint (excludes tokens.css)
npm run format:check # Prettier check
```

Package manager: `pnpm@10.28.0`. Pre-commit hook runs lint-staged (ESLint + Prettier on staged TS/TSX files).

## Architecture

### Routing: Dual-layer system
- **Next.js Pages Router** serves the shell via `pages/[[...slug]].tsx`
- **react-router-dom** handles all client navigation with **hash routing** (`#/`, `#/auth`, `#/test`, `#/dashboard`, etc.)
- `AppShell.tsx` is dynamically imported with SSR disabled — the entire app is a client-side SPA

### Provider Tree (nesting order matters)
```
ErrorBoundary → LanguageProvider → ThemeProvider → TTSProvider → ToastProvider
→ OfflineProvider → AuthProvider → SocialProvider → SRSProvider → StateProvider
→ NavigationProvider → NavigationShell → Routes
```
Key constraint: **OfflineProvider must be inside ToastProvider** (needs toast for sync notifications). **TTSProvider must wrap any component that uses TTS**.

### State Management
No Redux/Zustand — eight React Context providers handle all state:
- **AuthProvider** — Supabase auth + Google One Tap OAuth
- **SRSContext** — Spaced repetition deck (FSRS via ts-fsrs), IndexedDB-backed, syncs to Supabase
- **OfflineContext** — Online/offline detection + sync queue (idb-keyval)
- **TTSContext** — Text-to-speech engine with cross-browser quirk handling
- **LanguageContext** — English/Burmese toggle (persisted to localStorage)
- **ThemeContext** — Light/dark mode (persisted to localStorage)
- **StateContext** — User's US state selection (for personalized civics answers)
- **SocialContext** — Leaderboard, badges, streaks

### Data: Civics Questions
128 questions across 7 categories in `src/constants/questions/`. Each has English + Burmese text, optional explanations, and category metadata. 28 USCIS 2025 additions in `uscis-2025-additions.ts` are missing explanation objects (known data gap).

### Offline-First Pattern
- **IndexedDB** (via `idb-keyval`) stores SRS deck and queued actions
- **Sync queue** (`src/lib/pwa/syncQueue.ts`) batches writes when back online
- **Service worker** (`src/lib/pwa/sw.ts`) via `@serwist/next` handles caching + offline page

### TTS Engine
`src/lib/ttsCore.ts` wraps browser SpeechSynthesis with workarounds for Chrome 15s cutoff, Safari cancel errors, Firefox race conditions, and Android pause breakage. `speak()` must throw (not silently return) when engine is null.

## Key Conventions

### Path Aliases
`@/*` maps to `src/*` (configured in tsconfig.json)

### TypeScript
- Strict mode enabled
- `@typescript-eslint/no-explicit-any: error`
- Unused args prefixed with `_` are allowed

### Styling
- Tailwind CSS with `dark:` prefix (class-based theme switching on `<html>`)
- Stylelint enforces `color-no-hex: true` — use CSS custom properties from `src/styles/tokens.css`
- Tailwind directives (`@tailwind`, `@apply`, `@layer`, `@config`) are allowlisted in stylelint

### React Patterns (React 19 + strict ESLint)
- No `setState()` directly in effect bodies — use `useMemo` for derived state
- No ref `.current` access during render — only in effects/event handlers
- `useMemo<Type>(() => ...)` generic syntax breaks the compiler — use `const x: Type = useMemo()`
- Use `useState(() => initialValue)` lazy init instead of `useRef(initialValue)` for render purity

### Commits
Convention: `{type}({scope}): {message}` — types: `feat`, `fix`, `docs`, `test`, `refactor`

### Security
- CSP uses **hash-based allowlisting** (not nonce) — Pages Router on Vercel can't forward nonce headers
- `errorSanitizer.ts` scrubs PII before sending to Sentry
- Never commit `.env` values — see `.env.example` for required variables

## Testing

- **Framework**: Vitest 4 + jsdom + @testing-library/react
- **Setup**: `src/__tests__/setup.ts` mocks `matchMedia` and `speechSynthesis`
- **Coverage thresholds**: `shuffle.ts` (100%), `errorSanitizer.ts` (90%), `saveSession.ts` (70%), `ErrorBoundary.tsx` (70%)
- Tests are co-located with source files and also in `src/__tests__/`

## Deployment

Vercel with Next.js. Build chain: `@serwist/next` (PWA) wraps `@sentry/nextjs` (error tracking) in `next.config.mjs`. Environment variables for Supabase, Google OAuth, Sentry, and VAPID push keys are set in Vercel dashboard.
