# Phase 1: Foundation & Code Quality - Research

**Researched:** 2026-02-05
**Domain:** Testing infrastructure, TypeScript strict mode, bug fixes, error handling, code organization
**Confidence:** HIGH

## Summary

This phase establishes the codebase foundation: fixing three critical bugs (shuffle bias, save race condition, history leak), enabling TypeScript strict mode, setting up Vitest with CI enforcement, hardening error handling with Sentry error boundaries, and modularizing the 100+ civics questions by USCIS category.

The codebase already has:
- TypeScript `strict: true` enabled in tsconfig.json
- Sentry @sentry/nextjs v10.26.0 configured (but missing error boundaries)
- A custom toast system (can be enhanced for bilingual error messages)
- ESLint 9 + eslint-config-next (needs flat config migration for CI enforcement)

**Primary recommendation:** Use Vitest with @testing-library/react for unit/integration tests, implement Fisher-Yates shuffle with statistical regression tests, use async-mutex for save serialization, and split questions into 7 category files with stable IDs (e.g., `GOV-01`, `HIST-15`).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Testing strategy:**
- Broad foundation coverage: critical bug regression tests + utility functions + component rendering tests (~50-70 tests)
- Unit and integration tests only (Vitest) - E2E with Playwright deferred to later phase
- GitHub Actions CI pipeline runs tests on every push/PR
- 70% minimum coverage threshold enforced in CI
- Must-test behaviors: the 3 bug fixes + test completion saves correctly + study guide loads all questions + score calculation accuracy

**Error handling UX:**
- Toast notifications for user-facing errors (non-blocking, bottom/top of screen)
- Error messages always bilingual (Burmese + English) regardless of app language setting
- Sentry for production error monitoring with error boundaries
- Anonymized user context in Sentry reports - hashed user ID + device info, personal details stripped
- Failed operations show error toast immediately with "Try again" button (no silent retry)
- Per-page React error boundaries - each route gets its own boundary so one crash doesn't take down the whole app
- Offline: show bilingual toast telling user they're offline (full offline queue is Phase 2)

**Code organization:**
- Split questions file by USCIS category (american-government.ts, american-history.ts, integrated-civics.ts, etc.)
- Questions stored as TypeScript files with typed interfaces
- Each question gets a stable unique ID (e.g., 'GOV-01', 'HIST-15') for reliable SRS tracking
- Layer-based folder structure: src/components/, src/hooks/, src/utils/, src/types/
- Centralized shared types in src/types/
- ESLint + Prettier enforced strictly with CI checks (eslint-config-next + strict TypeScript rules)
- Husky + lint-staged pre-commit hooks for linting and type checking on staged files

**Bug fix verification:**
- Automated regression tests only (no manual verification steps)
- Shuffle bias: statistical test - run shuffle 1000+ times, verify distribution within expected variance
- Save race condition: fix using mutex/queue pattern to serialize save operations
- History leak: Claude's discretion on fix approach (replaceState vs stack limiting)
- All 3 bug fixes batched together for single deployment
- Bugs tracked in planning docs only, not GitHub Issues

### Claude's Discretion

- Test data management approach (fixtures vs factory functions)
- Snapshot testing strategy (none vs selective)
- Barrel file pattern for question imports
- History.pushState leak fix approach
- Exact Sentry configuration and error boundary fallback UI
- Compression/optimization of question data files

### Deferred Ideas (OUT OF SCOPE)

- App security hardening, RLS policies, Supabase security, auth - belongs in its own security-focused phase or as part of Phase 2/5 when Supabase is actively used
- E2E testing with Playwright - deferred until UI is more stable (after Phase 3)
</user_constraints>

## Standard Stack

The established libraries/tools for this phase:

### Core Testing
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vitest | ^3.x | Test runner | [Official Next.js recommendation](https://nextjs.org/docs/app/guides/testing/vitest); faster than Jest; native ESM support |
| @vitejs/plugin-react | ^4.x | React JSX transform | Required for Vitest with React |
| @testing-library/react | ^16.x | Component testing | Standard React testing library; React 19 compatible |
| @testing-library/dom | ^10.x | DOM testing utilities | Peer dependency for @testing-library/react |
| @testing-library/user-event | ^14.x | User interaction simulation | More realistic than fireEvent |
| vite-tsconfig-paths | ^5.x | Path alias resolution | Maps @/* imports in tests |
| jsdom | ^26.x | DOM environment | Test environment for Vitest |
| @vitest/coverage-v8 | ^3.x | Coverage reporting | V8 coverage provider for Vitest |

### Code Quality
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| husky | ^9.x | Git hooks | [Industry standard](https://github.com/typicode/husky) for pre-commit hooks |
| lint-staged | ^15.x | Staged file linting | Only lint changed files for speed |
| @typescript-eslint/parser | ^8.x | TypeScript ESLint parser | Required for strict TypeScript linting |
| @typescript-eslint/eslint-plugin | ^8.x | TypeScript rules | Strict TypeScript rules |
| prettier | ^3.x | Code formatting | Consistent formatting |
| eslint-config-prettier | ^10.x | Disable conflicting rules | Prettier + ESLint harmony |

### Bug Fix Utilities
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| async-mutex | ^0.5.x | Mutex pattern | [Recommended](https://www.npmjs.com/package/async-mutex) for serializing async operations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vitest | Jest | Jest is more mature but slower; Vitest has better ESM/TypeScript support |
| async-mutex | Custom promise queue | Hand-rolling risks edge cases; library is battle-tested |
| @vitest/coverage-v8 | @vitest/coverage-istanbul | V8 is faster; Istanbul offers more detailed reporting |

**Installation:**
```bash
# Testing
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/dom @testing-library/user-event vite-tsconfig-paths jsdom @vitest/coverage-v8

# Code quality
npm install -D husky lint-staged @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier

# Bug fix utilities
npm install async-mutex
```

## Architecture Patterns

### Recommended Project Structure

After reorganization:
```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI primitives
│   └── ErrorBoundary.tsx # Per-page error boundaries
├── constants/
│   └── questions/       # Split question files
│       ├── index.ts     # Barrel file aggregating all
│       ├── american-government.ts
│       ├── american-history-colonial.ts
│       ├── american-history-1800s.ts
│       ├── american-history-recent.ts
│       ├── civics-symbols-holidays.ts
│       └── rights-responsibilities.ts
├── contexts/            # React contexts
├── hooks/               # Custom hooks
├── lib/                 # Utilities
│   ├── shuffle.ts       # Fisher-Yates implementation
│   └── saveMutex.ts     # Async mutex for save operations
├── pages/               # Route components
├── types/               # Shared TypeScript interfaces
└── __tests__/           # Test files (or co-located)
```

### Pattern 1: Fisher-Yates Shuffle

**What:** Unbiased array shuffling algorithm with O(n) time complexity
**When to use:** Any time you need random ordering (test questions, answer choices)
**Example:**
```typescript
// Source: https://bost.ocks.org/mike/shuffle/
export function fisherYatesShuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

### Pattern 2: Async Mutex for Save Serialization

**What:** Lock mechanism preventing concurrent save operations
**When to use:** When multiple rapid user actions could trigger overlapping async saves
**Example:**
```typescript
// Source: https://www.npmjs.com/package/async-mutex
import { Mutex } from 'async-mutex';

const saveMutex = new Mutex();

export async function saveTestSession(session: TestSession): Promise<void> {
  const release = await saveMutex.acquire();
  try {
    await actualSaveOperation(session);
  } finally {
    release();
  }
}
```

### Pattern 3: Per-Page Error Boundary

**What:** Route-specific error boundaries catching rendering crashes
**When to use:** Wrap each page component to isolate failures
**Example:**
```typescript
// Source: https://docs.sentry.io/platforms/javascript/guides/react/features/error-boundary/
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: React.ReactNode;
  fallback: React.ReactNode;
  pageName: string;
}

export function PageErrorBoundary({ children, fallback, pageName }: Props) {
  return (
    <Sentry.ErrorBoundary
      fallback={fallback}
      beforeCapture={(scope) => {
        scope.setTag('page', pageName);
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
```

### Pattern 4: Bilingual Toast Messages

**What:** Error toasts that always show both English and Burmese
**When to use:** All user-facing error notifications
**Example:**
```typescript
interface BilingualMessage {
  en: string;
  my: string;
}

export function showBilingualError(message: BilingualMessage, options?: { retry?: () => void }) {
  toast({
    title: message.en,
    description: message.my,
    variant: 'destructive',
    action: options?.retry ? { label: 'Try again', onClick: options.retry } : undefined,
  });
}
```

### Pattern 5: Stable Question IDs

**What:** Deterministic IDs for each question enabling SRS tracking
**When to use:** All question definitions
**Example:**
```typescript
// ID format: [CATEGORY_PREFIX]-[PADDED_NUMBER]
// GOV-01, GOV-02... (Principles of American Democracy / System of Government)
// HIST-01, HIST-02... (American History)
// RR-01, RR-02... (Rights and Responsibilities)
// SYM-01, SYM-02... (Symbols and Holidays)

export interface Question {
  id: string; // Changed from number to string for stable IDs
  question_en: string;
  question_my: string;
  category: Category;
  studyAnswers: StudyAnswer[];
  answers: Answer[];
}
```

### Anti-Patterns to Avoid

- **Naive shuffle with sort(() => Math.random() - 0.5):** Produces biased distribution; use Fisher-Yates
- **Multiple pushState calls without replaceState:** Causes history stack leak; use replaceState for navigation locking
- **Concurrent save operations without mutex:** Race conditions cause duplicate/lost data
- **Global error boundary only:** One crash takes down entire app; use per-page boundaries
- **Hardcoded error messages:** Prevents bilingual support; use message objects

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Array shuffling | Custom shuffle logic | Fisher-Yates algorithm | Naive approaches are provably biased |
| Async serialization | Promise chains with flags | async-mutex | Edge cases around error handling, cancellation |
| Coverage thresholds | Custom CI checks | Vitest coverage.thresholds | Built-in, maintained, accurate |
| Pre-commit hooks | Manual git hooks | Husky + lint-staged | Cross-platform, team-friendly |
| Error boundaries | Try-catch in render | Sentry.ErrorBoundary | Automatic Sentry reporting, proper React lifecycle |

**Key insight:** The three bugs in this phase (shuffle bias, save race condition, history leak) are all cases where "simple" custom solutions failed. Use proven patterns.

## Common Pitfalls

### Pitfall 1: TypeScript Errors Escaping CI

**What goes wrong:** Tests pass but TypeScript errors exist because `tsc --noEmit` wasn't run
**Why it happens:** Vitest doesn't type-check; it only transpiles
**How to avoid:** Add `npx tsc --noEmit` to CI pipeline as separate step
**Warning signs:** Type errors appearing after PR merge

### Pitfall 2: Test Coverage Gaming

**What goes wrong:** 70% coverage hit by testing trivial code, missing critical paths
**Why it happens:** Coverage metrics don't measure test quality
**How to avoid:** Require specific test cases for critical behaviors (the 3 bugs, save logic, score calculation)
**Warning signs:** High coverage but bugs still ship

### Pitfall 3: Flaky Statistical Shuffle Tests

**What goes wrong:** Shuffle distribution test fails randomly
**Why it happens:** Statistical variance; too few iterations or too tight bounds
**How to avoid:** Run 10,000+ iterations; use chi-squared test with p-value threshold; document expected variance
**Warning signs:** Same test passes/fails on identical code

### Pitfall 4: lint-staged TypeScript Project Reference Issues

**What goes wrong:** `tsc --noEmit` fails in lint-staged with "Option 'project' cannot be mixed with source files"
**Why it happens:** lint-staged passes individual files to tsc, which conflicts with tsconfig.json
**How to avoid:** Run `tsc --noEmit` on whole project in pre-commit, not per-file; or skip tsc in lint-staged and rely on CI
**Warning signs:** Pre-commit hook errors when tsconfig.json uses project references

### Pitfall 5: replaceState Breaking Browser Navigation

**What goes wrong:** User can't use back button after test completion
**Why it happens:** Overly aggressive replaceState usage
**How to avoid:** Only use replaceState during active test; restore normal navigation on completion
**Warning signs:** User complaints about "broken back button"

### Pitfall 6: Sentry PII Leakage

**What goes wrong:** User emails, names in Sentry error reports despite anonymization intent
**Why it happens:** Default Sentry config sends PII; forgot to configure beforeSend
**How to avoid:** Set `sendDefaultPii: false`; use beforeSend to hash user IDs; strip email from user object
**Warning signs:** GDPR complaints; user data visible in Sentry dashboard

## Code Examples

Verified patterns from official sources:

### Vitest Configuration with Coverage Thresholds

```typescript
// vitest.config.ts
// Source: https://vitest.dev/config/coverage
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/types/**'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
```

### GitHub Actions CI Workflow

```yaml
# .github/workflows/ci.yml
# Source: https://github.com/davelosert/vitest-coverage-report-action
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Run tests with coverage
        run: npx vitest run --coverage.enabled true

      - name: Report Coverage
        if: github.event_name == 'pull_request'
        uses: davelosert/vitest-coverage-report-action@v2
```

### Husky + lint-staged Setup

```json
// package.json additions
{
  "scripts": {
    "prepare": "husky",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
npm run lint-staged
npx tsc --noEmit
```

### Sentry Configuration with Anonymization

```typescript
// instrumentation-client.ts
// Source: https://docs.sentry.io/platforms/javascript/guides/nextjs/data-management/sensitive-data/
import * as Sentry from '@sentry/nextjs';
import { createHash } from 'crypto';

function hashUserId(userId: string): string {
  return createHash('sha256').update(userId).digest('hex').substring(0, 16);
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // Lower in production
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: false, // CRITICAL: Disable default PII

  beforeSend(event) {
    // Anonymize user data
    if (event.user) {
      event.user = {
        id: event.user.id ? hashUserId(event.user.id) : undefined,
        // Strip email, name, ip_address, etc.
      };
    }

    // Sanitize error messages (remove potential DB schema exposure)
    if (event.exception?.values) {
      event.exception.values = event.exception.values.map(ex => ({
        ...ex,
        value: ex.value?.replace(/column ".*?"/g, 'column "[REDACTED]"')
          .replace(/relation ".*?"/g, 'relation "[REDACTED]"'),
      }));
    }

    return event;
  },

  integrations: [Sentry.replayIntegration()],
});
```

### Statistical Shuffle Test

```typescript
// src/__tests__/shuffle.test.ts
import { describe, it, expect } from 'vitest';
import { fisherYatesShuffle } from '@/lib/shuffle';

describe('Fisher-Yates Shuffle', () => {
  it('produces uniform distribution (chi-squared test)', () => {
    const input = [0, 1, 2, 3, 4];
    const iterations = 10000;
    const positionCounts: number[][] = input.map(() => new Array(input.length).fill(0));

    for (let i = 0; i < iterations; i++) {
      const shuffled = fisherYatesShuffle(input);
      shuffled.forEach((value, position) => {
        positionCounts[value][position]++;
      });
    }

    // Expected count per position: iterations / n
    const expected = iterations / input.length;

    // Chi-squared test: sum of (observed - expected)^2 / expected
    // Should be < critical value for p=0.01 with df=(n-1)*(n-1)=16 => ~32
    let chiSquared = 0;
    for (const valueCounts of positionCounts) {
      for (const count of valueCounts) {
        chiSquared += Math.pow(count - expected, 2) / expected;
      }
    }

    // With 16 degrees of freedom, chi-squared critical value at p=0.01 is ~32
    expect(chiSquared).toBeLessThan(50); // Use generous threshold for stability
  });

  it('returns new array (does not mutate input)', () => {
    const input = [1, 2, 3];
    const result = fisherYatesShuffle(input);
    expect(result).not.toBe(input);
  });

  it('contains same elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = fisherYatesShuffle(input);
    expect(result.sort()).toEqual(input.sort());
  });
});
```

### Question File Structure with Stable IDs

```typescript
// src/constants/questions/american-government.ts
import type { Question } from '@/types';

// Principles of American Democracy: GOV-01 to GOV-12
// System of Government: GOV-13 to GOV-47

export const americanGovernmentQuestions: Question[] = [
  {
    id: 'GOV-01',
    question_en: 'What is the supreme law of the land?',
    question_my: 'နိုင်ငံ၏ အမြင့်ဆုံးဥပဒေကား အဘယ်နည်း။',
    category: 'Principles of American Democracy',
    studyAnswers: [
      { text_en: 'the Constitution', text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေ' }
    ],
    answers: [
      { text_en: 'the Constitution', text_my: 'ဖွဲ့စည်းပုံအခြေခံဥပဒေ', correct: true },
      { text_en: 'the Declaration of Independence', text_my: 'လွတ်လပ်ရေးကြေညာစာတမ်း', correct: false },
      { text_en: 'the Articles of Confederation', text_my: 'ကွန်ဖက်ဒရေးရှင်း ဆောင်းပါးများ', correct: false },
      { text_en: 'the Emancipation Proclamation', text_my: 'လွတ်မြောက်ရေး ကြေညာချက်', correct: false },
    ],
  },
  // ... more questions
];
```

```typescript
// src/constants/questions/index.ts (barrel file)
export { americanGovernmentQuestions } from './american-government';
export { americanHistoryColonialQuestions } from './american-history-colonial';
export { americanHistory1800sQuestions } from './american-history-1800s';
export { americanHistoryRecentQuestions } from './american-history-recent';
export { rightsResponsibilitiesQuestions } from './rights-responsibilities';
export { civicsSymbolsHolidaysQuestions } from './civics-symbols-holidays';

import { americanGovernmentQuestions } from './american-government';
import { americanHistoryColonialQuestions } from './american-history-colonial';
import { americanHistory1800sQuestions } from './american-history-1800s';
import { americanHistoryRecentQuestions } from './american-history-recent';
import { rightsResponsibilitiesQuestions } from './rights-responsibilities';
import { civicsSymbolsHolidaysQuestions } from './civics-symbols-holidays';

// Aggregated export for backward compatibility
export const civicsQuestions = [
  ...americanGovernmentQuestions,
  ...americanHistoryColonialQuestions,
  ...americanHistory1800sQuestions,
  ...americanHistoryRecentQuestions,
  ...rightsResponsibilitiesQuestions,
  ...civicsSymbolsHolidaysQuestions,
];
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ESLint `.eslintrc.*` | ESLint flat config (`eslint.config.js`) | ESLint 9 (2024) | Required for new Next.js projects |
| Jest for Next.js | Vitest | 2024-2025 | Faster, native ESM, official Next.js recommendation |
| react-toastify | Sonner | 2024 | Lighter, better animations, shadcn/ui default |
| Framer Motion | motion | v11 (2024) | Package renamed; same library |
| Husky v4 hooks format | Husky v9 shell scripts | 2023 | Simpler, more reliable |

**Deprecated/outdated:**
- `next-pwa`: Unmaintained since 2022; use Serwist (Phase 2)
- Jest with Next.js: Still works but Vitest is now recommended
- `.eslintrc.*` config format: Deprecated in ESLint 9, removed in ESLint 10

## Open Questions

Things that couldn't be fully resolved:

1. **USCIS Official Category Names**
   - What we know: Current codebase uses 7 categories matching USCIS topic areas
   - What's unclear: Official USCIS documentation (128 questions PDF) wasn't parseable to confirm exact naming
   - Recommendation: Use existing category names from codebase; they appear to match USCIS structure

2. **ID Prefix Mapping**
   - What we know: Need stable IDs like `GOV-01`, `HIST-15`
   - What's unclear: Exact prefix for each category (is "Civics: Symbols and Holidays" -> `SYM` or `CSH`?)
   - Recommendation: Use these prefixes:
     - `GOV` = Principles of American Democracy + System of Government (47 questions)
     - `HIST-C` = American History: Colonial Period and Independence (13 questions)
     - `HIST-1` = American History: 1800s (7 questions)
     - `HIST-R` = Recent American History (10 questions)
     - `RR` = Rights and Responsibilities (10 questions)
     - `SYM` = Civics: Symbols and Holidays (13 questions)

3. **React 19 Error Boundary Compatibility**
   - What we know: Sentry.ErrorBoundary works with React 18
   - What's unclear: Any React 19 specific changes to error boundary behavior
   - Recommendation: Use Sentry.ErrorBoundary; test thoroughly; monitor Sentry docs for React 19 updates

## Sources

### Primary (HIGH confidence)
- [Next.js Vitest Testing Guide](https://nextjs.org/docs/app/guides/testing/vitest) - Official setup
- [Vitest Coverage Configuration](https://vitest.dev/config/coverage) - Threshold configuration
- [Fisher-Yates Shuffle (Mike Bostock)](https://bost.ocks.org/mike/shuffle/) - Algorithm visualization
- [async-mutex npm](https://www.npmjs.com/package/async-mutex) - Mutex pattern documentation
- [Sentry React Error Boundary](https://docs.sentry.io/platforms/javascript/guides/react/features/error-boundary/) - Error boundary API
- [Sentry Scrubbing Sensitive Data](https://docs.sentry.io/platforms/javascript/guides/nextjs/data-management/sensitive-data/) - PII filtering

### Secondary (MEDIUM confidence)
- [Husky + lint-staged setup guide](https://duncanlew.medium.com/getting-started-with-husky-and-lint-staged-for-pre-commit-hooks-c2764d8c9ae) - Pre-commit configuration
- [ESLint 9 Flat Config with Next.js](https://thelinuxcode.com/nextjs-eslint-a-practical-modern-guide-for-2026/) - Migration guide
- [Vitest Coverage Report Action](https://github.com/davelosert/vitest-coverage-report-action) - GitHub Actions integration

### Tertiary (LOW confidence)
- USCIS civics categories: Inferred from existing codebase; PDF not machine-readable

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation for all tools
- Architecture patterns: HIGH - Well-documented, widely used patterns
- Bug fixes: HIGH - Fisher-Yates and mutex are proven solutions
- Pitfalls: MEDIUM - Based on common issues in similar projects

**Research date:** 2026-02-05
**Valid until:** 2026-03-05 (30 days - stable tooling)
