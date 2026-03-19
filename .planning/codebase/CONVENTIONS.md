# Coding Conventions

**Analysis Date:** 2026-03-19

## Naming Patterns

**Files:**
- React components: `PascalCase.tsx` (e.g., `GlassCard.tsx`, `BilingualText.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAutoRead.ts`, `useTTS.ts`)
- Context files: `PascalCaseContext.tsx` (e.g., `LanguageContext.tsx`, `TTSContext.tsx`)
- Lib utilities: `camelCase.ts` (e.g., `safeAsync.ts`, `withRetry.ts`)
- Test files: `<filename>.test.ts` or `<filename>.test.tsx` co-located with source
- Constants: `camelCase.ts` (e.g., `questions.ts`, `strings.ts`)

**Functions:**
- Named exports preferred over default exports for all hooks and utility functions
- Components use named exports (not `export default`) in most cases; some UI primitives export both
- Hooks always named `use<Noun>` (e.g., `useTTS`, `useSRSDeck`, `useRovingFocus`)
- Provider components named `<Noun>Provider` (e.g., `LanguageProvider`, `TTSProvider`)
- Context hooks named `use<Noun>` matching the provider (e.g., `useLanguage`, `useAuth`)

**Variables/Constants:**
- `camelCase` for variables, parameters, function names
- `SCREAMING_SNAKE_CASE` for true module-level constants (e.g., `SPRING_BOUNCY`, `RATE_MAP`, `DEFAULT_SETTINGS`)
- `PascalCase` for TypeScript types, interfaces, and enums
- Private storage keys use string literals prefixed with `civic-` or `civic-prep-` (e.g., `'civic-test-language-mode'`, `'civic-prep-tts-settings'`)

**Types:**
- Interfaces for object shapes (props, context values, data structures): `interface FooProps { ... }`
- Type aliases for unions, primitives, and mapped types: `type LanguageMode = 'bilingual' | 'english-only'`
- Interface fields use JSDoc inline comments for documentation (e.g., `/** Current language mode */`)
- Bilingual data structures always use `_en` / `_my` suffix convention (e.g., `text_en`, `text_my`, `brief_en`, `brief_my`)

## Code Style

**Formatting:**
- Tool: Prettier
- `singleQuote: true`
- `semi: true`
- `tabWidth: 2`
- `trailingComma: 'es5'`
- `printWidth: 100`
- `arrowParens: 'avoid'`

**Linting:**
- ESLint with `@typescript-eslint`, `eslint-plugin-react-hooks`, `@next/eslint-plugin-next`, `jsx-a11y`
- `@typescript-eslint/no-explicit-any`: error (use generics or `unknown`)
- `@typescript-eslint/no-unused-vars`: error (prefix `_` to allow intentional unused params)
- `no-console`: warn (only `console.warn` and `console.error` allowed in source)
- A11y rules: mostly `warn` level due to intentional interactive patterns (roving focus, tablist on div)
- CSS: Stylelint with `stylelint-config-standard`, tokens.css excluded from linting

## Import Organization

**Order (enforced by Prettier, not explicit grouping rules):**
1. React built-ins (`import { useState, useCallback } from 'react'`)
2. External packages (`import clsx from 'clsx'`, `import { motion } from 'motion/react'`)
3. Internal aliases with `@/` prefix (e.g., `import { useAuth } from '@/contexts/SupabaseAuthContext'`)
4. Relative imports (`import { createTTSEngine } from '../lib/ttsCore'`)

**Path Aliases:**
- `@/*` maps to `src/*` (configured in `tsconfig.json` and `vitest.config.ts`)
- Use `@/` for cross-directory imports; use relative `./` or `../` within same module tree

**Type-only imports:**
- Use `import type { Foo }` for type-only imports (enforced by `isolatedModules`)
- `type` keyword on individual specifiers also used: `import { type ReactNode }`

## TypeScript Patterns

**Strict Mode:**
- `"strict": true` in `tsconfig.json` — all strict checks enabled
- No `any` (ESLint error); use `unknown` then narrow, or generics
- Non-null assertion (`!`) used sparingly; prefer optional chaining and guards
- `as` casts used only for trusted JSON data with interface documentation

**Generics:**
- Utility functions use generics: `safeAsync<T>`, `withRetry<T>`, `SafeResult<T>`
- Type parameters documented when non-obvious

**Context Pattern (all 10 contexts follow this):**
```typescript
// 1. Define interface for context value
interface FooContextValue { ... }

// 2. Create context initialized to null
const FooContext = createContext<FooContextValue | null>(null);

// 3. Export Provider with children prop
export function FooProvider({ children }: { children: ReactNode }) { ... }

// 4. Export typed hook with null guard
export function useFoo(): FooContextValue {
  const context = useContext(FooContext);
  if (!context) {
    throw new Error('useFoo must be used within FooProvider');
  }
  return context;
}
```

**Result tuples for safe async:**
```typescript
// safeAsync returns [result, null] | [null, Error]
const [result, error] = await safeAsync(() => fetchData(), 'operationName');
if (error) { /* handle */ }
```

**Discriminated unions for state:**
- `TestEndReason = 'passThreshold' | 'failThreshold' | 'time' | 'complete'`
- `LanguageMode = 'bilingual' | 'english-only'`
- `GlassTier = 'light' | 'medium' | 'heavy'`

## React Patterns

**Context Usage:**
- All 10 contexts defined in `src/contexts/` and mounted in `src/components/ClientProviders.tsx`
- Nesting order is critical and documented in `ClientProviders.tsx` (AuthProvider outermost, NavigationProvider innermost)
- Each context provides a typed hook (e.g., `useLanguage`, `useTTS`) — never access context directly via `useContext`
- `useMemo` on context value objects to prevent unnecessary re-renders (see `TTSContext.tsx`)
- `useCallback` on all functions in context values

**Hook Patterns:**
- Hooks accept an options object for multiple parameters (e.g., `useAutoRead(options: UseAutoReadOptions)`)
- Return a named object for hooks returning multiple values (e.g., `return { focusedIndex, handleKeyDown }`)
- Return `void` for side-effect-only hooks (e.g., `useAutoRead`, `useFocusOnNavigation`)
- Cleanup always in `useEffect` return — cancel timers, remove listeners, destroy engines
- `eslint-disable-next-line react-hooks/exhaustive-deps` with comment when intentional (documented inline)
- Refs for mutable state that shouldn't trigger re-renders (e.g., `userRef`, `isolatedEngineRef`)

**Component Patterns:**
- All component files start with `'use client'` directive (App Router requirement)
- `forwardRef` used for UI primitives that need ref forwarding (e.g., `Button`)
- `displayName` set on `forwardRef` components: `Button.displayName = 'Button'`
- Reduced motion check via `useReducedMotion()` in animated components — skip animations when true
- Props interfaces defined above component, not inline

**Bilingual Component Patterns:**
- All user-facing text uses `BilingualString` type: `{ en: string; my: string }`
- Centralized strings in `src/lib/i18n/strings.ts` — add all new strings here
- `showBurmese` from `useLanguage()` controls Burmese text visibility
- English rendered first (top), Burmese below with `font-myanmar` class
- Use `<BilingualText>`, `<BilingualHeading>` primitives from `src/components/bilingual/`
- Inline bilingual available via `<BilingualTextInline>` with separator
- Myanmar text always wrapped in `font-myanmar` class (uses Noto Sans Myanmar font)
- Burmese text styled as `text-muted-foreground` (secondary, not equal weight to English)

**State Management:**
- React Context for app-wide state (auth, language, TTS, SRS, social, offline, theme, state/territory)
- Custom hooks for derived state and logic that spans multiple context pieces
- `useState` + `localStorage` for persistent UI preferences (with lazy initializer for SSR safety)
- IndexedDB (via `idb-keyval`) for offline-capable data persistence
- Local component state for ephemeral UI state (open/closed, loading, error)

## CSS Patterns

**Tailwind + Custom Properties:**
- CSS custom properties in `src/styles/tokens.css` as single source of truth
- Tailwind extended to consume tokens via `hsl(var(--color-name))` pattern
- Semantic tokens preferred over primitive palette (e.g., `bg-primary` not `bg-blue-500`)
- All color tokens store HSL channels only (no `hsl()` wrapper): `--color-primary: 217 91% 60%`
- For canvas/chart use: `getTokenColor('--color-primary')` from `src/lib/tokens.ts`

**Glass-Morphism Three-Tier System:**
- Defined in `src/styles/globals.css` under `@layer components`
- **`glass-light`**: Regular cards, list items, sections, skeletons. 16px blur. `border-radius: var(--radius-2xl)`.
- **`glass-medium`**: Hero cards, featured content, navigation headers. 24px blur.
- **`glass-heavy`**: Modals, dialogs, overlays, bottom sheets, navigation chrome. 32px blur.
- Use `<GlassCard tier="light|medium|heavy">` component (wraps CSS classes + prismatic border + animation)
- Dark mode variants included in CSS — glass tiers adapt automatically
- `@supports (backdrop-filter: blur())` guard for non-supporting browsers
- Do NOT mix glass tiers arbitrarily — follow the tier guide comments in globals.css

**Responsive Breakpoints:**
- Mobile-first: base styles target mobile, `md:` (768px) and `lg:` (1024px) for desktop
- Tailwind default breakpoints used throughout
- Bottom tab bar hidden at `md:` breakpoint (`@media (max-width: 767px)` sets `--bottom-tab-height: 64px`)
- Safe area insets for iOS notch: `pt-safe-top`, `pb-safe-bottom` etc. (custom Tailwind utilities)

**Touch Targets:**
- All interactive elements: `min-h-[44px]` (44px iOS minimum)
- Button component enforces this via `sizes` object: `sm: 'min-h-[44px]'`, `md: 'min-h-[44px]'`, `lg: 'min-h-[52px]'`
- Never reduce below 44px for any tappable element

**Motion System:**
- JS spring animations via `motion/react` (Framer Motion): use constants from `src/lib/motion-config.ts`
  - `SPRING_BOUNCY`: Primary interactions (button press, card tap)
  - `SPRING_SNAPPY`: Secondary interactions (tab switch)
  - `SPRING_GENTLE`: Large element animations (page transitions)
  - `SPRING_PRESS_DOWN`: Instant press feel (~50ms settle)
- CSS transitions for non-React elements: use `var(--duration-slow)`, `var(--ease-out)` tokens
- Always check `useReducedMotion()` and skip animations when true

**Component-Level Classes (in `@layer components`):**
- `.glass-light`, `.glass-medium`, `.glass-heavy` — glass-morphism tiers
- `.glass-card` — backward-compat alias for `glass-light`
- `.pill-accent` — pill badge with gradient
- `.interactive-tile` — tappable card with gradient and hover lift
- `.font-myanmar` — Noto Sans Myanmar font for Burmese text
- `.page-shell` — full-height page wrapper with gradient background

## Error Handling Patterns

**`safeAsync` — fire-and-forget async:**
```typescript
// src/lib/async/safeAsync.ts
const [result, error] = await safeAsync(() => fetchData(), 'contextName');
// Never throws; reports to Sentry; returns tuple
```

**`withRetry` — transient failure retry:**
```typescript
// src/lib/async/withRetry.ts
const data = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1000 });
// Exponential backoff; skips non-retryable errors (401, 400, QuotaExceededError)
```

**`ErrorBoundary` — React render errors:**
- `src/components/ErrorBoundary.tsx` — class component wrapping entire app via `ClientProviders.tsx`
- Shows bilingual fallback UI (English + Burmese error message)
- Sanitizes errors via `src/lib/errorSanitizer.ts` before display and Sentry reporting
- Accepts `fallback` prop for custom error UI; `onError` callback for side effects

**Error Sanitization:**
- `src/lib/errorSanitizer.ts` — maps error patterns to user-friendly bilingual messages
- Never expose: table names, SQL, stack traces, internal paths, PII
- Sentry reporting via `src/lib/sentry.ts` with PII stripping (`beforeSendHandler`)
- User IDs hashed (djb2) before Sentry context; emails and UUIDs redacted in event data

**Try-catch conventions:**
- Empty `catch {}` with comment when failure is intentional/non-blocking
- `catch (error)` with `instanceof Error` narrowing before accessing `.message`
- Async errors in contexts use fire-and-forget pattern with `safeAsync` wrapper

## Accessibility Patterns

**ARIA Patterns:**
- `role="radiogroup"` + `role="radio"` for answer option groups
- `role="tablist"` + `role="tab"` for tab bars (even on `div`/non-native elements)
- `role="alert"` for toast notifications
- `role="status"` for loading skeletons
- `aria-live="polite"` for TTS status and language change announcements
- `aria-live="assertive"` for toast container
- `aria-pressed` on toggle buttons (speech buttons, language toggle)
- `aria-label` on all icon-only buttons
- `aria-hidden="true"` on decorative icons

**Keyboard Navigation:**
- `useRovingFocus` hook (`src/hooks/useRovingFocus.ts`) for radiogroup keyboard nav (arrow keys)
- `useFocusOnNavigation` (`src/hooks/useFocusOnNavigation.ts`) focuses `h1` or `main` after route changes (150ms delay)
- `tabindex="-1"` for programmatic focus without tab order inclusion
- `preventScroll: true` on `.focus()` calls to avoid layout shift

**Screen Reader Announcements:**
- `.sr-only` class for visually-hidden announcement spans
- TTS speaking state announced via `role="status"` + `aria-live="polite"` in `BurmeseSpeechButton`
- Language mode change announced via `aria-live="polite"` in `FlagToggle`

**Focus Management:**
- `autoFocus` disabled by ESLint rule for general use but allowed for modal dialogs (rule set to `'off'`)
- `focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2` on all interactive elements

## Bilingual Text Patterns

**Content pattern:**
- English on top, Burmese below (stacked, never side-by-side unless using `BilingualTextInline`)
- Burmese styled as secondary (`text-muted-foreground`) to indicate supplemental nature
- Myanmar Unicode range `\u1000-\u109F` used in tests to detect Burmese presence

**String management:**
- New UI strings → `src/lib/i18n/strings.ts`
- Question content bilingual fields: `question_en`/`question_my`, `text_en`/`text_my` (suffix convention)
- Error messages bilingual via `BilingualMessage` interface (`{ en: string; my: string }`)
- All `Explanation` content bilingual: `brief_en`/`brief_my`, `mnemonic_en`/`mnemonic_my`, etc.

**Conditional rendering:**
```tsx
const { showBurmese } = useLanguage();
// ...
{showBurmese && <span className="font-myanmar">{text.my}</span>}
```

## Logging

**Policy:** `no-console` rule allows only `console.warn` and `console.error`.
- Config files: `no-console: off` (ESLint rule loosened for scripts/configs)
- Production errors: route through `captureError` in `src/lib/sentry.ts`
- Development only: `console.error` in `ErrorBoundary.componentDidCatch` behind `NODE_ENV === 'development'`
- No `console.log` in source; use Sentry breadcrumbs for production debugging

## Module Design

**Exports:**
- Named exports preferred; `export default` used only for Next.js page/layout conventions and some `forwardRef` components that also provide named export
- Barrel files (`index.ts`) used in select component directories: `src/components/bilingual/`, `src/components/celebrations/`, `src/components/onboarding/`
- `src/types/index.ts` re-exports from `supabase.ts` with type guard

**Module boundaries:**
- `src/lib/` — pure utility functions with no React dependencies (except `sentry.ts`)
- `src/hooks/` — React hooks wrapping lib functions or context access
- `src/contexts/` — React Context providers and their hooks
- `src/components/` — React components (UI + feature-specific)
- `src/views/` — Page-level components (one per route)

---

*Convention analysis: 2026-03-19*
