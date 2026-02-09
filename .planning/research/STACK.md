# Technology Stack: v2.0 Unified Learning Hub

**Project:** Civic Test Prep 2025 - v2.0 Milestone
**Researched:** 2026-02-09
**Overall confidence:** HIGH

---

## Existing Stack (Validated in v1.0 -- DO NOT RE-ADD)

| Technology | Current Version | Status |
|------------|----------------|--------|
| Next.js (Pages Router) | 15.1.11 | Keep |
| React | 19.2.0 | Keep |
| React Router DOM | 7.0.2 | Keep |
| @supabase/supabase-js | 2.81.1 | Keep |
| Tailwind CSS | 3.4.17 | Keep |
| tailwindcss-animate | 1.0.7 | Keep |
| motion/react | 12.33.0 | Keep |
| @radix-ui/react-dialog | 1.1.15 | Keep |
| @radix-ui/react-progress | 1.1.8 | Keep |
| @radix-ui/react-toast | 1.2.15 | Keep |
| lucide-react | 0.475.0 | Keep |
| recharts | 3.4.1 | Keep |
| @sentry/nextjs | 10.26.0 | Keep |
| @serwist/next + serwist | 9.5.4 | Keep |
| idb-keyval | 6.2.2 | Keep |
| ts-fsrs | 5.2.3 | Keep |
| web-push | 3.6.7 | Keep |
| clsx | 2.1.1 | Keep |
| @fontsource/noto-sans-myanmar | 5.2.7 | Keep |
| marked | 17.0.0 | Keep |
| react-joyride | 3.0.0-7 | Keep |
| async-mutex | 0.5.0 | Keep |

---

## Recommended Stack Additions

### 1. Radix UI Tabs -- Progress Hub Consolidation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @radix-ui/react-tabs | ^1.1.13 | Tab switching in Progress Hub | Accessible keyboard navigation, ARIA roles, controlled/uncontrolled modes. Consistent with existing Radix primitives in the project. Progress Hub needs tabs for Progress/History/Community views. |

**Confidence: HIGH** -- Same Radix ecosystem already in use. Version 1.1.13 is latest (npm, last published ~5 months ago). 3,622 npm dependents.

**Why not a custom tab component:** Radix Tabs handles keyboard navigation (arrow keys, Home/End), focus management, and ARIA `tablist`/`tab`/`tabpanel` roles correctly out of the box. Building this from scratch would be error-prone and unnecessary when the project already uses three Radix primitives.

**Integration:** Import pattern identical to existing Dialog/Toast/Progress usage. Style with Tailwind classes via `className` prop.

```bash
pnpm add @radix-ui/react-tabs
```

### 2. @supabase/ssr -- Push Subscription Auth Hardening

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @supabase/ssr | ^0.8.0 | Server-side Supabase client with cookie-based auth | Enables proper JWT verification in API routes. The current push subscription endpoint (`/api/push/subscribe`) accepts any `userId` without authentication -- anyone can subscribe/unsubscribe any user. `@supabase/ssr` provides `createServerClient` for Pages Router API routes that reads auth cookies and allows `supabase.auth.getUser()` to verify the caller's identity. |

**Confidence: HIGH** -- Official Supabase package. Replaces deprecated `@supabase/auth-helpers-nextjs`. Version 0.8.0 is latest. Documented for Pages Router specifically.

**Why this solves the security gap:** The current subscribe endpoint trusts the `userId` field in the POST body, which is trivially spoofable. With `@supabase/ssr`, the API route creates a server Supabase client from the request cookies, calls `getUser()` to verify the JWT, and uses the verified `user.id` instead of the request body's `userId`. This is the Supabase-recommended pattern.

**Why not raw JWT verification with jsonwebtoken:** Adding `jsonwebtoken` manually means managing the SUPABASE_JWT_SECRET, handling token refresh, and parsing cookies yourself. `@supabase/ssr` does all of this with a two-line setup and is maintained by the Supabase team.

```bash
pnpm add @supabase/ssr
```

### 3. No New Libraries Required -- In-Memory Rate Limiting

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| (Custom utility) | N/A | Rate limiting for push API routes | A simple in-memory Map-based rate limiter (token bucket or sliding window) is sufficient for this app's scale. The push API routes receive very low traffic -- a few dozen subscription changes per day at most. |

**Confidence: HIGH** -- Standard pattern. No external dependency needed.

**Why NOT @upstash/ratelimit:** Upstash requires a Redis instance ($0/month free tier but adds an external service dependency, requires account setup, adds network latency to each rate limit check). This app runs on Vercel free tier with minimal API traffic. A 30-line in-memory rate limiter handles the use case perfectly. If the app scales to thousands of concurrent users, upgrade to Upstash then.

**Implementation approach:** A `rateLimiter.ts` utility that stores IP/user timestamps in a `Map`, cleans expired entries on each check, and returns 429 when limit exceeded. Use in push API routes only. Vercel serverless functions are stateless, but rate limiting within a single function invocation window still prevents burst abuse from a single client. For persistent rate limiting across invocations, the Supabase `push_subscriptions` table can enforce a "last updated" check.

---

## NO New Libraries Needed -- Existing Stack Covers These Features

### Unified Navigation (Desktop + Mobile)

**What's needed:** Merge `AppNavigation.tsx` (desktop) and `BottomTabBar.tsx` (mobile) into a single component with shared route config. Add a "learning path" flow.

**Already have everything:**
- `react-router-dom` -- routing, `useLocation`, `Link`
- `lucide-react` -- icons
- `motion/react` -- tab animations, sheet transitions
- `clsx` -- conditional classes
- Tailwind responsive breakpoints (`md:hidden`, `hidden md:block`)

**No new library needed.** This is a component architecture refactor, not a technology addition.

### iOS-Inspired Design Token System

**What's needed:** Extend the existing design token system (`design-tokens.ts` + CSS custom properties in `globals.css`) with iOS-style blur, depth, and micro-interaction tokens.

**Already have everything:**
- Tailwind CSS -- `backdrop-blur-xl`, `bg-card/95`, `backdrop-filter` utilities
- CSS custom properties -- 40+ tokens already defined in `:root` and `.dark`
- `design-tokens.ts` -- TypeScript token exports for runtime use
- `motion/react` -- spring physics for micro-interactions (button press, tab switch)
- `tailwindcss-animate` -- CSS keyframe animations

**New tokens to add (no library needed):**
- `--surface-glass`: semi-transparent card backgrounds with blur
- `--surface-elevated`: raised card with subtle shadow
- `--transition-spring`: standardized spring config for iOS-like bounce
- `--safe-area-*`: already present, just need consistent usage

**Why not a design token library (Style Dictionary, design-tokens):** The project uses 40 CSS custom properties and a TypeScript token file. Adding Style Dictionary would introduce a build step for token generation, YAML/JSON config files, and a pipeline that transforms tokens to CSS. This is over-engineered for a project with one theme (light/dark). The existing `globals.css` + `design-tokens.ts` pattern is simpler and already works.

**Browser support note:** `backdrop-filter: blur()` works in Chrome, Safari, Edge. Firefox added support in v103 (2022). All target browsers support it.

### Dashboard "Next Best Action" CTA

**Already have everything:**
- Supabase queries for user progress data
- `ts-fsrs` for SRS due count
- `recharts` for progress visualization
- Mastery calculation engine (`calculateMastery.ts`)
- Weak area detection (`weakAreaDetection.ts`)

**No new library needed.** This is a smart aggregation of existing data sources into a single CTA component.

### Burmese Translation Upgrade

**What's needed:** Style guide, improved top-20 strings, text expansion handling.

**Already have everything:**
- `strings.ts` -- centralized bilingual string file (254 lines, well-structured)
- `@fontsource/noto-sans-myanmar` -- self-hosted Myanmar font (400, 500, 700 weights)
- `.font-myanmar` CSS class -- proper font-family with letter-spacing
- `BilingualText`, `BilingualButton`, `BilingualHeading` components

**No new library needed.** The Burmese upgrade is a content/style effort:
1. Write a Burmese translation style guide (glossary, tone, conventions)
2. Revise top-20 user-facing strings based on style guide
3. Audit `line-height` for Myanmar text (current: default; recommended: 1.6-1.8 for Noto Sans Myanmar to prevent glyph clipping)
4. Test text expansion -- Burmese text is typically 20-40% longer than English

### USCIS 2025 Question Bank (128 Questions)

**Critical finding:** The USCIS 2025 Naturalization Civics Test has **128 questions** (not 120 as stated in the project scope). The app currently has 120 questions (100 original + 20 additions). **8 more questions are needed** to reach the full 128.

**Source:** [USCIS 2025 Civics Test](https://www.uscis.gov/citizenship-resource-center/naturalization-test-and-study-resources/2025-civics-test) -- verified directly.

**Test format changes (effective October 20, 2025):**
- Pool: 128 questions (up from 100)
- Asked: 20 questions (up from 10)
- Pass threshold: 12 correct (up from 6)
- Test ends at 12 correct OR 9 incorrect

**Category structure (128 questions):**
- American Government: ~72 questions (Principles of American Democracy + System of Government)
- American History: ~32 questions (Colonial, 1800s, Recent)
- Integrated Civics: ~24 questions (Geography, Symbols, Holidays)

**Existing question type structure is sufficient:**
```typescript
interface Question {
  id: string;        // Stable ID like 'GOV-P13'
  question_en: string;
  question_my: string;
  category: Category;
  studyAnswers: StudyAnswer[];
  answers: Answer[];
  explanation?: Explanation;
}
```

**No new library needed.** Add 8 more questions to `src/constants/questions/` following the established pattern. Update the mock test to ask 20 questions with a 12/20 pass threshold.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Tab component | @radix-ui/react-tabs | Custom tabs with `<button>` + state | Radix handles keyboard nav, ARIA, focus management correctly; saves 100+ lines of a11y code |
| Tab component | @radix-ui/react-tabs | @headlessui/react Tabs | Headless UI is a competing ecosystem; mixing with Radix creates inconsistency |
| Server auth | @supabase/ssr | jsonwebtoken + manual cookie parsing | More code, more maintenance, no automatic token refresh handling |
| Server auth | @supabase/ssr | @supabase/auth-helpers-nextjs | Deprecated in favor of @supabase/ssr; no longer receiving updates |
| Rate limiting | In-memory Map | @upstash/ratelimit | Requires Redis service; overkill for <100 req/day on push endpoints |
| Rate limiting | In-memory Map | express-rate-limit | Not compatible with Next.js API routes (Express middleware) |
| Design tokens | CSS custom properties | Style Dictionary | Adds build pipeline for <50 tokens; over-engineered for single-theme app |
| Design tokens | CSS custom properties | @tokens-studio/css | External dependency for something Tailwind + CSS vars already handles |
| i18n | strings.ts (manual) | next-intl | Still displaying both languages together (no locale switching); next-intl adds complexity without benefit |
| Navigation | Custom component | @radix-ui/react-navigation-menu | Navigation Menu is designed for dropdown mega-menus, not mobile tab bars. The app's nav is a simple link list + bottom tab bar. |

---

## Installation

```bash
# New additions for v2.0 (only 2 packages)
pnpm add @radix-ui/react-tabs @supabase/ssr
```

That is it. Two packages. Everything else is already installed or built in-house.

---

## Integration Points with Existing Stack

### @radix-ui/react-tabs in Progress Hub

```typescript
// Replaces manual tab state in Progress Hub
import * as Tabs from '@radix-ui/react-tabs';

// Style with existing Tailwind classes
<Tabs.Root defaultValue="progress">
  <Tabs.List className="flex gap-1 border-b border-border/40">
    <Tabs.Trigger value="progress" className="...">
      {showBurmese ? strings.nav.progress.my : strings.nav.progress.en}
    </Tabs.Trigger>
    <Tabs.Trigger value="history" className="...">
      {showBurmese ? strings.nav.testHistory.my : strings.nav.testHistory.en}
    </Tabs.Trigger>
    <Tabs.Trigger value="community" className="...">
      {showBurmese ? strings.nav.socialHub.my : strings.nav.socialHub.en}
    </Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="progress"><ProgressPanel /></Tabs.Content>
  <Tabs.Content value="history"><HistoryPanel /></Tabs.Content>
  <Tabs.Content value="community"><CommunityPanel /></Tabs.Content>
</Tabs.Root>
```

### @supabase/ssr in Push API Routes

```typescript
// pages/api/push/subscribe.ts -- hardened version
import { createServerClient, serializeCookieHeader } from '@supabase/ssr';

export default async function handler(req, res) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.keys(req.cookies).map((name) => ({
            name,
            value: req.cookies[name] ?? '',
          }));
        },
        setAll(cookiesToSet) {
          res.setHeader(
            'Set-Cookie',
            cookiesToSet.map(({ name, value, options }) =>
              serializeCookieHeader(name, value, options)
            )
          );
        },
      },
    }
  );

  // Verify caller identity -- replaces trusting req.body.userId
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

  // Use verified user.id, not request body
  const userId = user.id;
  // ... rest of subscription logic
}
```

### In-Memory Rate Limiter

```typescript
// src/lib/api/rateLimiter.ts
const store = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count };
}
```

---

## Design Token Extensions (CSS Custom Properties Only)

New tokens to add to `globals.css` for the iOS-inspired UI system:

```css
:root {
  /* iOS-style surface layers */
  --surface-primary: 0 0% 100%;         /* Opaque card */
  --surface-glass: 0 0% 100% / 0.72;    /* Translucent glass */
  --surface-elevated: 0 0% 100% / 0.92; /* Slightly translucent, elevated */

  /* Depth/shadow scale (iOS-inspired) */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --shadow-md: 0 2px 8px -2px rgb(0 0 0 / 0.08);
  --shadow-lg: 0 8px 24px -4px rgb(0 0 0 / 0.12);
  --shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.04), 0 8px 20px -4px rgb(0 0 0 / 0.06);

  /* Micro-interaction timing */
  --ease-spring: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-press: 100ms;
  --duration-transition: 200ms;
  --duration-page: 350ms;

  /* iOS-style blur values */
  --blur-nav: 20px;
  --blur-sheet: 40px;
  --blur-overlay: 16px;
}

.dark {
  --surface-primary: 222 47% 14%;
  --surface-glass: 222 47% 14% / 0.72;
  --surface-elevated: 222 47% 16% / 0.92;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.2);
  --shadow-md: 0 2px 8px -2px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 8px 24px -4px rgb(0 0 0 / 0.4);
  --shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.15), 0 8px 20px -4px rgb(0 0 0 / 0.25);
}
```

These extend the existing 40+ custom properties without breaking anything. Map them to Tailwind via `tailwind.config.js` `extend.boxShadow` and `extend.backdropBlur`.

---

## USCIS 2025 Question Data Changes

### Current State
- 120 questions across 7 categories
- Mock test: 10 questions, pass at 6/10
- Question IDs: GOV-P01..P16, GOV-S01..S39, RR-01..13, HIST-C01..C16, HIST-101..109, HIST-R01..R12, SYM-01..SYM-15

### Required Changes
- Add 8 questions to reach 128 total (identify which USCIS questions are missing)
- Update mock test: 20 questions, pass at 12/20
- Update test end condition: stop at 12 correct OR 9 incorrect
- Add `studyAnswers` and bilingual content for all 8 new questions
- Write explanations for new questions
- Add `elderly65Plus` flag to 20 designated questions (65/20 special rule)
- Update `Category` type if new subcategories exist

### Category Type May Need Extension
The current `Category` type has 7 values matching the existing structure. The 2025 USCIS test uses the same major categories (American Government, American History, Integrated Civics) with the same subcategories. The existing `Category` type should cover the 8 new questions without changes, but verify against the official PDF.

---

## Version Compatibility Matrix

| New Package | Compatible With | Verified |
|-------------|----------------|----------|
| @radix-ui/react-tabs@1.1.13 | React 19.x | Yes -- same Radix version line as Dialog/Toast/Progress already in use |
| @supabase/ssr@0.8.0 | @supabase/supabase-js 2.x, Next.js 15.x Pages Router | Yes -- documented for Pages Router |

---

## Free Tier Impact

| Concern | Assessment |
|---------|------------|
| Bundle size increase | ~4KB gzipped (Radix Tabs ~2KB + @supabase/ssr ~2KB, server-only) |
| Supabase usage | @supabase/ssr calls `getUser()` per API request -- adds one auth request per push subscribe/unsubscribe. Negligible. |
| Vercel serverless | No change -- same API routes, just with auth verification added |
| New external services | None. No Redis, no new accounts needed. |

---

## Sources

### HIGH Confidence (Official Documentation, npm Registry)
- [@radix-ui/react-tabs npm](https://www.npmjs.com/package/@radix-ui/react-tabs) -- v1.1.13, 3,622 dependents
- [Radix UI Tabs docs](https://www.radix-ui.com/primitives/docs/components/tabs) -- API, keyboard navigation, accessibility
- [@supabase/ssr npm](https://www.npmjs.com/package/@supabase/ssr) -- v0.8.0, official Supabase package
- [Supabase SSR docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client) -- createServerClient for Pages Router
- [USCIS 2025 Civics Test](https://www.uscis.gov/citizenship-resource-center/naturalization-test-and-study-resources/2025-civics-test) -- 128 questions, 20 asked, 12 to pass
- [USCIS 128 Questions PDF](https://www.uscis.gov/sites/default/files/document/questions-and-answers/2025-Civics-Test-128-Questions-and-Answers.pdf) -- Official question bank
- [Chrome push notification rate limits](https://developer.chrome.com/blog/web-push-rate-limits) -- Browser-side rate limiting context

### MEDIUM Confidence (Multiple Sources Agree)
- [Supabase auth getUser() vs getSession()](https://supabase.com/docs/guides/auth/server-side/nextjs) -- Always use getUser() on server
- [Tailwind CSS backdrop-blur](https://tailwindcss.com/docs/backdrop-blur) -- Glass effect utilities
- [In-memory rate limiting for Next.js](https://peerlist.io/blog/engineering/how-to-implement-rate-limiting-in-nextjs) -- Implementation patterns

---

*Stack research for: Civic Test Prep 2025 v2.0 Unified Learning Hub*
*Researched: 2026-02-09*
*Key finding: Only 2 new npm packages needed. 128 USCIS questions (not 120).*
