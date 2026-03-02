# Project Instructions

## Output Style

- Terse, imperative language; no filler or explanations
- Bullets over prose; tables over lists when structured
- State facts, skip justifications

## Stack

Next.js 16 (App Router) | React 19 | TypeScript 5.9 (strict) | Tailwind CSS 3 + CSS custom properties | Radix UI | motion/react | Supabase (Auth + Postgres + RLS) | Serwist (PWA) | ts-fsrs (SRS) | Sentry | Vitest + React Testing Library | Web Push API

## Commands

```bash
pnpm dev               # dev server
pnpm build             # production build (webpack)
pnpm start             # production server
pnpm test              # unit tests (Vitest watch)
pnpm test:run          # single run
pnpm test:coverage     # coverage report
pnpm lint              # ESLint
pnpm lint:css          # Stylelint (ignores tokens.css)
pnpm typecheck         # tsc --noEmit
pnpm format:check      # Prettier check
```

## Verification

Run before completing: `pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`

## Paths

| Path                 | Purpose                                |
| -------------------- | -------------------------------------- |
| `app/`               | App Router root (layout, error, API)   |
| `app/api/push/`      | Push notification endpoints            |
| `src/views/`         | Page components (14 routes)            |
| `src/components/`    | React components (30+ subfolders)      |
| `src/components/ui/` | Radix UI + custom primitives           |
| `src/contexts/`      | React Context providers (10 providers) |
| `src/hooks/`         | Custom hooks (27 hooks)                |
| `src/lib/`           | Utilities & business logic (18 modules)|
| `src/types/`         | TypeScript definitions                 |
| `src/styles/`        | Global styles + design tokens          |
| `src/constants/`     | Categories, question config            |
| `src/__tests__/`     | Unit tests                             |
| `docs/`              | PRD, architecture                      |
| `public/audio/`      | 256 pre-generated Burmese audio files  |

## Provider Hierarchy (critical nesting order)

```
ErrorBoundary
  -> LanguageProvider (en/my)
    -> ThemeProvider (light/dark)
      -> TTSProvider (async engine init)
        -> ToastProvider (bilingual)
          -> OfflineProvider (uses useToast!)
            -> AuthProvider
              -> SocialProvider
                -> SRSProvider
                  -> StateProvider
                    -> NavigationProvider
```

OfflineProvider MUST be inside ToastProvider. TTSProvider async init must throw when engine isn't ready.

## Critical Notes

- **Bilingual app** — English + Burmese; all user-facing text needs both languages
- **128 USCIS questions** across 7 categories with state-aware answers
- **Hash routing** — views use react-router-dom hash routing in catch-all
- **Offline-first** — IndexedDB (idb-keyval) + Serwist service worker
- **SRS algorithm** — ts-fsrs for spaced repetition, syncs IndexedDB <-> Supabase
- **iOS glass-morphism** — 3-tier design (light/medium/heavy)
- **44px min touch targets** — mobile-first PWA
- **Content Security Policy** — hash-based allowlisting
- **PII sanitization** — before Sentry reporting
- **Noto Sans Myanmar** — required for Burmese text rendering

## Learnings

- `.claude/learnings/INDEX.md` - scan first (provider-ordering, tts-voice, myanmar-typography, css-specificity)

