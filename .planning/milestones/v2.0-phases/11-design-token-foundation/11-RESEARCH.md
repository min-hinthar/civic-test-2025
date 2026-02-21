# Phase 11: Design Token Foundation - Research

**Researched:** 2026-02-09
**Domain:** CSS custom properties, Tailwind CSS theming, dark mode architecture
**Confidence:** HIGH

## Summary

This phase consolidates three fragmented styling sources (globals.css, tailwind.config.js, design-tokens.ts) into a single CSS custom property system in `src/styles/tokens.css`, adds full dark mode with a polished toggle, and migrates all 103 TSX components + 14 pages to use semantic tokens exclusively.

The codebase currently has ~128 hardcoded color values (rgba/hex/hsl literals) across 24 files, ~115 non-semantic Tailwind palette classes (blue-500, amber-500, emerald-500, etc.) across 37 files, ~220 scattered `dark:` overrides across 43 files, and a `design-tokens.ts` file that is imported by **zero** components (dead code). The existing `ThemeContext.tsx` and `ThemeToggle.tsx` already implement class-based dark mode with localStorage persistence and system preference detection, but the toggle uses Lucide icons without motion animation and lacks FOUC prevention.

The migration is large but mechanical. No new dependencies are needed. The existing Tailwind v3.4 `darkMode: ['class']` strategy is correct. The key risks are: visual regression across 14 pages during the big-bang color swap, FOUC on initial page load, and ensuring canvas-based components (shareCardRenderer, AudioWaveform, CircularTimer, Confetti) can access token values.

**Primary recommendation:** Define all tokens as CSS custom properties in `tokens.css`, wire Tailwind config to reference them via `hsl(var(--token-name))`, add a blocking script in `_document.tsx` to prevent FOUC, and sweep all components in a single coordinated pass.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Token Taxonomy
- **Two-tier naming**: Primitive layer (raw palette values like --blue-500) + semantic layer (purpose-named like --color-surface referencing primitives). Components only use semantic tokens.
- **Flat with prefixes**: All tokens at root level with naming convention: --color-*, --space-*, --shadow-*, --radius-*, --duration-*, --ease-*.
- **Both layers in Tailwind**: Primitive palette classes (bg-blue-500) available for flexibility, semantic classes (bg-surface) preferred by convention.
- **Opacity variants in tokens**: Define semi-transparent variants (e.g., --color-primary-50a) as explicit tokens for overlays and glass effects (Phase 17 prep).
- **Explicit state tokens**: Define --color-primary-hover, --color-primary-active, --color-primary-disabled as separate tokens.
- **Inline documentation comments**: Each semantic token includes a short comment explaining its intended use.
- **Motion tokens included**: Define --duration-fast, --duration-normal, --duration-slow, --ease-out, --ease-spring, etc.
- **Breakpoints stay in Tailwind config**: Not tokenized as CSS custom properties.
- **No z-index tokenization**: Z-index values stay as Tailwind utilities.
- **Token file location**: `src/styles/tokens.css`, imported by globals.css.

#### Dark Mode Strategy
- **System preference + manual override**: Defaults to OS preference, user can override via in-app toggle. Preference stored in localStorage.
- **Smooth fade transition**: CSS transition on background-color and color when toggling modes.
- **Toggle in header/nav**: Sun/moon icon always accessible from any page. Animated morph between sun and moon using motion/react.
- **Two-state toggle**: Light | Dark switch. Defaults to system preference on first visit. No explicit "System" option.
- **Soft dark palette**: Dark backgrounds are dark grays/deep navy, not pure black.
- **Focus rings adapt**: Lighter/brighter focus ring colors in dark mode.
- **Charts use semantic tokens**: Any data visualizations adapt via the token system.
- **PWA theme-color updates**: meta name="theme-color" updates dynamically when mode changes.
- **Extensible theme architecture**: Token structure supports adding future themes without restructuring.

#### Migration Approach
- **Big-bang replacement**: Replace all hardcoded values across all files in one coordinated sweep.
- **Delete design-tokens.ts**: CSS variables become the single source of truth.
- **Swap + cleanup**: Replace hardcoded values AND remove unused/redundant CSS along the way.
- **Lint rule enforcement**: Add ESLint/stylelint rule to flag hardcoded hex colors, rgb values, and pixel spacing not from tokens.
- **Visual regression verification**: Before/after screenshots of key pages.
- **Equal priority**: Token system completeness and dark mode polish are equally important.

#### Token Scope & Boundaries
- **Extensible for future themes**: Architecture supports adding themes beyond dark/light without restructuring.
- **Lint covers inline styles**: Enforcement catches hardcoded values in both CSS/Tailwind and style={{}} objects.

### Claude's Discretion
- Semantic naming: Generic UI semantics vs app-domain-specific names
- Number of semantic color roles (audit codebase to determine ~8-15 roles needed)
- Primitive color palette approach (keep Tailwind defaults or custom brand)
- Typography token granularity (full type scale vs size + weight only)
- Spacing scale (strict mathematical vs audit-based)
- design-tokens.ts replacement strategy (typed JS wrapper vs raw getComputedStyle)
- Shadow token structure (single composite vs layered)
- Border-radius organization (scale-based vs semantic)
- Tailwind config restructure approach
- globals.css restructure approach
- Radix UI component tokenization
- Migration fidelity (pixel-perfect vs snap-to-scale)
- motion/react animation tokenization scope
- Responsive token values
- Icon size tokenization
- JS token access helper
- Dark mode FOUC prevention mechanism
- Burmese text dark mode contrast
- Image brightness in dark mode
- Scrollbar theming
- Form input dark mode tokens
- Component-specific vs global token boundaries
- Supabase status color tokenization
- Gradient tokenization

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS Custom Properties | Native | Token storage layer | No runtime, SSR-safe, works with any framework |
| Tailwind CSS | 3.4.19 (already installed) | Utility classes referencing tokens | Already the project's styling system |
| tailwindcss-animate | 1.0.7 (already installed) | Animation utilities | Already used for accordion/transition animations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| stylelint | 16.x | Lint CSS files for hardcoded colors | Enforce token usage in CSS |
| stylelint-config-standard | latest | Base stylelint rules | Foundation for custom rules |
| @metamask/eslint-plugin-design-tokens | latest | Flag hex colors in inline styles | Enforce token usage in JSX style={{}} objects |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS custom properties | Style Dictionary / Token Studio | Overkill for a single-app project; adds build step complexity |
| stylelint color-no-hex | Custom ESLint rule | stylelint is purpose-built for CSS linting |
| Two-tier CSS tokens | Flat single-tier | Two-tier enables theme extensibility (locked decision) |

**Installation:**
```bash
pnpm add -D stylelint stylelint-config-standard @metamask/eslint-plugin-design-tokens
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── styles/
│   ├── tokens.css          # NEW: All design tokens (primitives + semantic)
│   ├── globals.css          # MODIFIED: imports tokens.css, slimmed down
│   └── animations.css       # UNCHANGED
├── lib/
│   ├── design-tokens.ts     # DELETED (replaced by CSS vars)
│   └── tokens.ts            # NEW: JS helper to read CSS vars (for canvas/charts)
└── components/
    └── ThemeToggle.tsx       # MODIFIED: animated sun/moon morph
```

### Pattern 1: Two-Tier Token Architecture
**What:** Primitive tokens define raw palette values. Semantic tokens reference primitives and describe purpose. Dark mode swaps only semantic token values.
**When to use:** Always. This is the locked decision.
**Example:**
```css
/* src/styles/tokens.css */

/* ═══════════════════════════════════════════════════
   PRIMITIVE LAYER - Raw palette values
   Components should NOT reference these directly.
   ═══════════════════════════════════════════════════ */
:root {
  /* Blue palette */
  --blue-50: 214 100% 97%;
  --blue-100: 214 95% 93%;
  --blue-200: 213 97% 87%;
  --blue-300: 212 96% 78%;
  --blue-400: 213 94% 68%;
  --blue-500: 217 91% 60%;
  --blue-600: 221 83% 53%;
  --blue-700: 224 76% 48%;
  --blue-800: 226 71% 40%;
  --blue-900: 224 64% 33%;

  /* ... more primitive palettes: green, amber, red, purple, slate, etc. */
}

/* ═══════════════════════════════════════════════════
   SEMANTIC LAYER - Purpose-named tokens
   Components reference THESE tokens.
   ═══════════════════════════════════════════════════ */
:root {
  /* Surface colors - backgrounds */
  --color-background: var(--blue-50);        /* Main app background */
  --color-surface: 0 0% 100%;               /* Card/panel backgrounds */
  --color-surface-raised: 0 0% 100%;        /* Elevated surfaces */
  --color-overlay: 0 0% 0%;                 /* Modal backdrop (use with alpha) */

  /* Text colors */
  --color-text-primary: 222 47% 12%;        /* Main body text */
  --color-text-secondary: 215 18% 35%;      /* Muted/supporting text */
  --color-text-on-primary: 0 0% 100%;       /* Text on primary buttons */

  /* Interactive colors */
  --color-primary: var(--blue-500);          /* Primary actions, links */
  --color-primary-hover: var(--blue-600);    /* Primary hover state */
  --color-primary-active: var(--blue-700);   /* Primary pressed state */
  --color-primary-disabled: var(--blue-300); /* Primary disabled state */
  --color-primary-subtle: var(--blue-50);    /* Light primary background */

  /* ... more semantic tokens */
}

/* ═══════════════════════════════════════════════════
   DARK THEME - Swap semantic values only
   ═══════════════════════════════════════════════════ */
.dark {
  --color-background: 222 47% 11%;
  --color-surface: 222 47% 14%;
  --color-surface-raised: 222 47% 17%;

  --color-text-primary: 210 40% 98%;
  --color-text-secondary: 215 20% 65%;

  --color-primary: var(--blue-400);
  --color-primary-hover: var(--blue-300);
  --color-primary-active: var(--blue-200);
  --color-primary-disabled: var(--blue-700);
  --color-primary-subtle: 224 71% 15%;

  /* ... dark overrides */
}
```

### Pattern 2: Tailwind Config Consuming CSS Variables
**What:** Tailwind config references CSS variables so utility classes automatically adapt to themes.
**When to use:** For all color, spacing, shadow, and radius values.
**Example:**
```javascript
// tailwind.config.js
module.exports = {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // Semantic layer (preferred)
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-text-primary))',
        surface: 'hsl(var(--color-surface))',
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          foreground: 'hsl(var(--color-text-on-primary))',
          hover: 'hsl(var(--color-primary-hover))',
          active: 'hsl(var(--color-primary-active))',
          disabled: 'hsl(var(--color-primary-disabled))',
          subtle: 'hsl(var(--color-primary-subtle))',
        },
        // Primitive layer (available but not preferred)
        'blue-50': 'hsl(var(--blue-50))',
        'blue-100': 'hsl(var(--blue-100))',
        // ... etc
      },
      borderRadius: {
        DEFAULT: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        chunky: 'var(--shadow-chunky)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
    },
  },
};
```

### Pattern 3: FOUC Prevention via Blocking Script
**What:** Inline script in `_document.tsx` that reads theme preference before React hydrates.
**When to use:** Always, to prevent the light-to-dark flash on page load.
**Example:**
```tsx
// pages/_document.tsx
<Head>
  <script dangerouslySetInnerHTML={{
    __html: `
      (function() {
        try {
          var stored = localStorage.getItem('civic-theme');
          var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          var theme = stored || (prefersDark ? 'dark' : 'light');
          document.documentElement.classList.add(theme);
          document.documentElement.style.setProperty('color-scheme', theme);
          // Update theme-color meta tag
          var meta = document.querySelector('meta[name="theme-color"]');
          if (meta) meta.content = theme === 'dark' ? '#1a1f36' : '#002868';
        } catch(e) {}
      })();
    `
  }} />
</Head>
```

### Pattern 4: JS Token Access Helper for Canvas/Charts
**What:** Thin utility that reads CSS custom property values for use in Canvas API and Recharts.
**When to use:** When imperative JS code needs color values (shareCardRenderer, CircularTimer, AudioWaveform, Recharts charts).
**Example:**
```typescript
// src/lib/tokens.ts
/**
 * Read a CSS custom property value from the document root.
 * Returns the raw value (e.g., "217 91% 60%") or fallback.
 */
export function getToken(name: string, fallback = ''): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim() || fallback;
}

/**
 * Read a color token and return it as an HSL string for canvas/SVG use.
 */
export function getTokenColor(name: string, alpha?: number): string {
  const raw = getToken(name);
  if (!raw) return '';
  return alpha !== undefined
    ? `hsl(${raw} / ${alpha})`
    : `hsl(${raw})`;
}

// Usage in shareCardRenderer.ts:
// const primaryBlue = getTokenColor('--color-primary'); // => "hsl(217 91% 60%)"
// const chartBlue = getTokenColor('--color-chart-blue'); // => "hsl(217 91% 60%)"
```

### Pattern 5: Theme-Color Meta Tag Dynamic Update
**What:** ThemeContext updates the PWA theme-color meta tag when theme changes.
**When to use:** Always, as locked decision.
**Example:**
```typescript
// In ThemeContext.tsx, add to the theme effect:
useEffect(() => {
  if (!mounted) return;
  // ... existing class toggle logic ...

  // Update PWA theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content',
      theme === 'dark' ? '#1a1f36' : '#002868'
    );
  }
}, [theme, mounted]);
```

### Anti-Patterns to Avoid
- **Scattering `dark:` overrides in components:** With the token system, `dark:` prefixes should be nearly eliminated. Color switching happens at the token layer, not the component layer.
- **Referencing primitive tokens in components:** Components use `bg-surface` or `text-foreground`, never `bg-blue-500` directly (except for the handful of data-visualization colors that are inherently categorical).
- **Using `hsl()` wrapper in token definitions:** Store HSL channels only (`217 91% 60%`), wrap with `hsl()` at the Tailwind config level. This enables opacity modifiers like `bg-primary/50`.
- **Creating component-scoped CSS variables:** Keep all tokens at `:root` level. Component-specific values should be Tailwind utilities or inline styles referencing tokens.

## Discretion Recommendations

### Semantic Naming Convention
**Recommendation:** Generic UI semantics with a few app-specific exceptions.

Based on the codebase audit, these semantic roles are needed:

| Semantic Token | Light Value | Purpose |
|----------------|------------|---------|
| --color-background | blue-50 | Main app background |
| --color-surface | white | Cards, panels |
| --color-surface-raised | white | Elevated cards |
| --color-surface-muted | slate-100 | Muted backgrounds |
| --color-text-primary | slate-900 | Body text |
| --color-text-secondary | slate-500 | Muted text |
| --color-text-on-primary | white | Text on primary surfaces |
| --color-text-on-destructive | white | Text on destructive surfaces |
| --color-primary | blue-500 | Primary actions |
| --color-primary-hover | blue-600 | Primary hover |
| --color-primary-active | blue-700 | Primary pressed |
| --color-primary-disabled | blue-300 | Primary disabled |
| --color-primary-subtle | blue-50 | Light primary bg |
| --color-secondary | cyan-300 | Secondary accent |
| --color-accent | orange-400 | Accent highlights |
| --color-accent-purple | purple-500 | Achievements, badges |
| --color-destructive | rose-600 | Warm coral-red (user decision) |
| --color-destructive-hover | rose-700 | Destructive hover |
| --color-success | green-500 | Correct answers, progress |
| --color-success-subtle | green-50 | Success background |
| --color-warning | orange-500 | Wrong answers |
| --color-warning-subtle | amber-50 | Warning background |
| --color-border | slate-200 | Default borders |
| --color-border-muted | slate-100 | Subtle borders |
| --color-input | slate-200 | Input borders |
| --color-ring | blue-500 | Focus ring |
| --color-ring-dark | blue-400 | Focus ring (dark mode override) |
| --color-patriotic-red | red-500 | Decorative only |
| --color-chart-blue | blue-500 | Chart: Government |
| --color-chart-amber | amber-500 | Chart: History |
| --color-chart-emerald | emerald-500 | Chart: Civics |

Total: ~30 semantic color tokens. This covers all existing usage patterns.

### Primitive Palette Approach
**Recommendation:** Keep a custom brand palette, not Tailwind defaults.

The existing HSL values in globals.css are already custom (not standard Tailwind). Preserve these exact values as primitives to maintain visual continuity. The migration should be lossless -- same colors, new names.

### Typography Token Granularity
**Recommendation:** Size + weight only, not a full type scale.

The codebase uses Tailwind's built-in text size classes (`text-sm`, `text-lg`, `text-2xl`, etc.) consistently. Only 1 file (CircularTimer) uses inline fontSize. Tokenizing the full type scale would change too much with minimal benefit. Instead:
- Define `--font-family-sans` and `--font-family-myanmar` tokens
- Define `--font-weight-normal`, `--font-weight-medium`, `--font-weight-semibold`, `--font-weight-bold`, `--font-weight-extrabold`
- Let Tailwind's built-in text size classes remain as-is

### Spacing Scale
**Recommendation:** Audit-based, matching Tailwind defaults.

The existing `design-tokens.ts` defines a 4px-grid spacing scale that exactly matches Tailwind's default spacing. No custom spacing tokens needed -- Tailwind's defaults are the standard. The `--space-*` tokens in `tokens.css` are informational (documenting the system) rather than consumed.

### design-tokens.ts Replacement Strategy
**Recommendation:** Thin `getTokenColor()` utility function, not a typed wrapper.

Since design-tokens.ts has zero imports (dead code), the replacement is simple: delete it and add a small `src/lib/tokens.ts` utility for canvas/chart contexts that need imperative JS color access. The function uses `getComputedStyle()` to read CSS variables at runtime.

### Shadow Token Structure
**Recommendation:** Single composite values, matching existing usage.

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-chunky: 0 4px 0 hsl(var(--color-primary-active));
  --shadow-chunky-active: 0 1px 0 hsl(var(--color-primary-active));
  --shadow-card: 0 10px 40px -10px hsl(var(--color-primary) / 0.15);
  --shadow-card-hover: 0 20px 60px -15px hsl(var(--color-primary) / 0.3);
}
.dark {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.2);
  --shadow-card: 0 10px 40px -10px rgb(0 0 0 / 0.5);
  /* ... */
}
```

### Border-Radius Organization
**Recommendation:** Scale-based, matching existing usage.

```css
:root {
  --radius-sm: 0.5rem;    /* 8px - small elements */
  --radius-md: 0.75rem;   /* 12px - buttons */
  --radius-lg: 1rem;      /* 16px - inputs */
  --radius-xl: 1.25rem;   /* 20px - cards (current --radius) */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-3xl: 2rem;     /* 32px - large cards */
  --radius-full: 9999px;  /* Pill shapes */
}
```

### Tailwind Config Restructure
**Recommendation:** Keep `theme.extend` pattern, reference CSS vars for everything.

The current config has 114 lines. The new config should reference CSS variables for all colors, shadows, and radii. Primitive palette classes remain available (referencing CSS vars), semantic classes added alongside. The config should remain a single flat file.

### globals.css Restructure
**Recommendation:** Slim down dramatically.

After tokens.css absorbs all `:root` and `.dark` variable definitions:
- globals.css keeps: `@import`, `@tailwind` directives, body/page-shell styles (referencing tokens), `.font-myanmar`, focus-ring utility, flip-card CSS (layout-only), `@layer components` utilities
- globals.css removes: All `:root { }` variable blocks, all `.dark { }` override blocks, all `.dark .bg-*` hardcoded overrides (lines 138-194 currently)
- Expected reduction: ~100 lines removed from globals.css

### Dark Mode FOUC Prevention
**Recommendation:** Blocking inline script in `_document.tsx`.

The project uses Next.js Pages Router with `_document.tsx`. Add a synchronous inline script in `<Head>` that reads localStorage and applies the `dark` class before React hydrates. This is the standard pattern for Pages Router (verified via official Next.js discussion #53063 and multiple confirmed sources).

### Canvas/Chart Color Access
**Recommendation:** `getTokenColor()` utility for 3 files.

Files needing JS color access:
1. `shareCardRenderer.ts` - Canvas API, 19 hardcoded colors (gradient backgrounds, gold accents). These are fixed "brand" colors for the share image, not theme-dependent. **Leave as-is** -- the share card is always the same blue/gold design.
2. `CircularTimer.tsx` - `react-countdown-circle-timer` accepts hex colors as props. Use `getTokenColor()` or keep hardcoded (timer colors are fixed semantic: blue->yellow->orange->red).
3. `HistoryPage.tsx` / `ProgressPage.tsx` / `InterviewResults.tsx` - Recharts `<Line stroke={...}>`. Replace hex values with `getTokenColor('--color-chart-blue')` etc.

### Gradient Tokenization
**Recommendation:** Do not tokenize gradients themselves. Tokenize the colors used in gradients.

The page-shell decorative background gradients use `rgba()` values. Convert these to use token colors: `hsl(var(--color-primary) / 0.3)`. The gradient structure (angle, stops, positions) stays as CSS.

### Supabase Status Color Tokenization
**Recommendation:** Add semantic tokens for sync/connection status.

```css
--color-status-online: var(--green-500);
--color-status-offline: var(--slate-400);
--color-status-syncing: var(--blue-400);
--color-status-error: var(--red-500);
```

### Burmese Text Dark Mode Contrast
**Recommendation:** Test and adjust `--color-text-primary` in dark mode.

Noto Sans Myanmar renders slightly thinner than Inter at equivalent weights. Verify WCAG AA contrast (4.5:1 for body text) with the dark mode background. The current dark foreground (`210 40% 98%`) should provide sufficient contrast. Add `--color-text-myanmar` token only if the contrast is insufficient and needs different lightness.

### Migration Fidelity
**Recommendation:** Snap-to-token, not pixel-perfect.

Many existing components use slightly different shades of the same conceptual color (e.g., `text-gray-400` vs `text-gray-500` vs `text-gray-600` for muted text). Consolidate these to the nearest semantic token (`--color-text-secondary`). This is intentional simplification, not a regression.

### Sub-Category Colors (Data Visualization Exception)
**Recommendation:** Keep as primitive Tailwind palette classes.

The 7 sub-category colors (rose, blue, emerald, amber, fuchsia, sky, slate) used in SkillTreePath, CategoryGrid, Flashcard3D etc. are **data visualization colors**, not UI theme colors. They must remain visually distinct from each other. Define them as dedicated chart/category tokens but keep them stable across themes:

```css
--color-category-democracy: var(--rose-500);
--color-category-government: var(--blue-500);
--color-category-rights: var(--emerald-500);
--color-category-colonial: var(--amber-500);
--color-category-1800s: var(--fuchsia-500);
--color-category-recent: var(--sky-500);
--color-category-symbols: var(--slate-500);
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS color enforcement | Custom regex ESLint rule | stylelint `color-no-hex` + `@metamask/eslint-plugin-design-tokens` | Battle-tested, handles edge cases (gradients, shorthand, opacity) |
| Dark mode flash prevention | Custom React effect | Blocking `<script>` in `_document.tsx` | Must execute before React hydrates; effects run too late |
| Theme persistence | Custom storage + sync | Existing localStorage pattern (already works) | Already implemented in ThemeContext.tsx |
| CSS variable reading in JS | Full token registry object | `getComputedStyle` wrapper | Simple, no build step, always in sync |
| Animation tokens | Custom duration/easing constants | CSS custom properties + Tailwind config | Single source of truth, no import needed |

**Key insight:** This phase is a **restructuring** of existing values, not an introduction of new technology. The main complexity is the breadth of the migration (103 components), not the depth of any individual technique.

## Common Pitfalls

### Pitfall 1: FOUC (Flash of Unstyled Content) on Dark Mode
**What goes wrong:** Page loads with light theme, then flashes to dark after React hydrates.
**Why it happens:** Server-side render has no access to localStorage. React effects run after paint.
**How to avoid:** Add blocking inline script in `_document.tsx` that applies the `dark` class synchronously in `<head>` before any rendering. The script must be small, synchronous, and error-wrapped.
**Warning signs:** Any visible white flash when loading the page in dark mode.

### Pitfall 2: HSL Channel Format vs Full HSL
**What goes wrong:** Tailwind opacity modifiers (`bg-primary/50`) break because the token includes `hsl()` wrapper.
**Why it happens:** If tokens are stored as `hsl(217 91% 60%)` instead of bare channels `217 91% 60%`, Tailwind can't inject opacity.
**How to avoid:** Store HSL channels only in CSS vars: `--color-primary: 217 91% 60%;`. Wrap with `hsl()` only at consumption point: `color: hsl(var(--color-primary))`.
**Warning signs:** `/50` opacity modifiers produce incorrect colors or no effect.

### Pitfall 3: Cascading Dark Overrides Survive Migration
**What goes wrong:** Components still have `dark:bg-slate-900` classes after migration, creating double-application with token dark values.
**Why it happens:** Mechanical find-replace misses some `dark:` prefixes, or components are skipped.
**How to avoid:** After migration, grep for remaining `dark:` prefixes. The goal is near-zero `dark:` usage (except for truly conditional component-level dark styling like gradient decorations).
**Warning signs:** Unexpected color differences in dark mode, colors that are "too light" or "too dark."

### Pitfall 4: Canvas API Can't Read CSS Variables
**What goes wrong:** `ctx.fillStyle = 'hsl(var(--color-primary))'` doesn't work -- Canvas API doesn't resolve CSS variables.
**Why it happens:** Canvas 2D context is not CSS-aware; it needs resolved color strings.
**How to avoid:** Use the `getTokenColor()` utility that calls `getComputedStyle()` to resolve the variable first, then passes the resolved `hsl(...)` string to the canvas context.
**Warning signs:** Canvas elements render with default black fill instead of theme colors.

### Pitfall 5: react-countdown-circle-timer Requires Hex Colors
**What goes wrong:** CircularTimer's `colors` prop expects hex strings, not CSS variables.
**Why it happens:** The library's API is `colors={['#3B82F6', '#EAB308', ...]}`.
**How to avoid:** Either: (a) use `getTokenColor()` to resolve CSS vars to HSL strings at render time (the library may accept hsl() strings), or (b) keep these 4 threshold colors as hardcoded constants (they're semantic timer stages, not theme colors). Option (b) is pragmatic.
**Warning signs:** Timer renders with wrong colors or fails silently.

### Pitfall 6: Transition Flash When Toggling Themes
**What goes wrong:** Abrupt color jumps during dark/light toggle, especially on large background areas.
**Why it happens:** CSS transitions not applied to all elements that change color.
**How to avoid:** Add global transition: `* { transition: background-color 0.3s ease, color 0.2s ease, border-color 0.2s ease; }`. But be careful: this can slow down interactive elements. Better: apply transition only to `body`, `.page-shell`, and key surface elements.
**Warning signs:** Jarring, non-smooth theme switches.

### Pitfall 7: Recharts Colors Not Updating on Theme Change
**What goes wrong:** Charts show light-mode colors even after switching to dark mode.
**Why it happens:** Recharts `<Line stroke="#3B82F6" />` is a static prop; it doesn't re-evaluate CSS variables when theme changes.
**How to avoid:** Use the `getTokenColor()` utility called within the component render (React will re-render when theme context changes). Since the component re-renders on theme toggle, the new color value will be picked up.
**Warning signs:** Chart lines remain the same color after toggling theme.

### Pitfall 8: Confetti Colors Are Not Themeable
**What goes wrong:** Attempting to make confetti particle colors theme-aware is wasted effort.
**Why it happens:** Confetti is a celebratory effect that looks good with bright colors regardless of theme.
**How to avoid:** Leave `react-canvas-confetti` colors as hardcoded hex constants. They're decorative, ephemeral, and not part of the design system.
**Warning signs:** Spending time tokenizing something users see for <2 seconds.

### Pitfall 9: PWA Theme-Color Meta Tag Desync
**What goes wrong:** The browser chrome (address bar) shows the wrong color after theme change.
**Why it happens:** `<meta name="theme-color">` is set in `_document.tsx` (SSR) and never updated client-side.
**How to avoid:** ThemeContext effect must programmatically update the meta tag's `content` attribute when theme changes. The blocking script must also set it for correct initial load.
**Warning signs:** Address bar color doesn't match the app theme.

## Code Examples

### Example 1: Complete tokens.css Structure
```css
/* src/styles/tokens.css */
/* Design Token Foundation - Civic Test Prep 2025 */

/* ═══════════════════════════════════════════════════
   PRIMITIVES - Raw palette values (HSL channels only)
   Components should use semantic tokens, not these.
   ═══════════════════════════════════════════════════ */

:root {
  /* Blue (primary brand) */
  --blue-50: 214 100% 97%;
  --blue-100: 214 95% 93%;
  --blue-200: 213 97% 87%;
  --blue-300: 212 96% 78%;
  --blue-400: 213 94% 68%;
  --blue-500: 217 91% 60%;
  --blue-600: 221 83% 53%;
  --blue-700: 224 76% 48%;
  --blue-800: 226 71% 40%;
  --blue-900: 224 64% 33%;

  /* Purple (achievements) */
  --purple-50: 270 70% 96%;
  --purple-500: 270 70% 60%;
  --purple-600: 270 65% 52%;
  --purple-700: 270 60% 44%;

  /* Green (success) */
  --green-50: 142 76% 95%;
  --green-100: 141 84% 86%;
  --green-500: 142 71% 45%;
  --green-600: 142 76% 36%;

  /* Amber/Orange (warning) */
  --amber-50: 38 92% 95%;
  --amber-100: 39 96% 89%;
  --amber-500: 32 95% 52%;
  --amber-600: 26 90% 45%;

  /* Red (destructive - warm coral per user decision) */
  --red-500: 10 50% 45%;
  --red-600: 10 45% 38%;
  --red-700: 10 45% 35%;

  /* Slate (neutrals) */
  --slate-50: 210 60% 99%;
  --slate-100: 216 33% 94%;
  --slate-200: 210 40% 92%;
  --slate-400: 215 18% 55%;
  --slate-500: 215 18% 35%;
  --slate-600: 215 20% 25%;
  --slate-900: 222 47% 12%;

  /* Patriotic red (decoration only) */
  --patriotic-red: 0 72% 51%;

  /* Cyan (secondary) */
  --cyan-300: 192 95% 68%;

  /* Orange (accent) */
  --orange-400: 18 92% 70%;
}

/* ═══════════════════════════════════════════════════
   SEMANTIC TOKENS - Purpose-named
   ═══════════════════════════════════════════════════ */

:root {
  /* ── Surfaces ── */
  --color-background: var(--slate-50);         /* Main app background */
  --color-surface: 0 0% 100%;                 /* Card backgrounds */
  --color-surface-raised: 0 0% 100%;          /* Elevated surfaces (modals) */
  --color-surface-muted: var(--slate-100);     /* Subtle backgrounds */
  --color-overlay: 0 0% 0%;                   /* Backdrops (use with /50 alpha) */

  /* ── Text ── */
  --color-text-primary: var(--slate-900);      /* Body text */
  --color-text-secondary: var(--slate-500);    /* Muted/helper text */
  --color-text-on-primary: 0 0% 100%;         /* Text on primary bg */
  --color-text-on-destructive: 0 0% 100%;     /* Text on destructive bg */

  /* ── Primary (blue) ── */
  --color-primary: var(--blue-500);            /* Buttons, links */
  --color-primary-hover: var(--blue-600);
  --color-primary-active: var(--blue-700);
  --color-primary-disabled: var(--blue-300);
  --color-primary-subtle: var(--blue-50);      /* Light primary bg */
  --color-primary-50a: 217 91% 60% / 0.12;    /* Semi-transparent overlay */

  /* ── Secondary ── */
  --color-secondary: var(--cyan-300);
  --color-secondary-foreground: 210 40% 15%;

  /* ── Accent (orange) ── */
  --color-accent: var(--orange-400);
  --color-accent-foreground: 210 40% 10%;

  /* ── Accent Purple (achievements) ── */
  --color-accent-purple: var(--purple-500);
  --color-accent-purple-foreground: 0 0% 100%;

  /* ── Destructive (warm coral-red) ── */
  --color-destructive: var(--red-500);
  --color-destructive-hover: var(--red-600);
  --color-destructive-foreground: 0 0% 100%;

  /* ── Success (correct answers) ── */
  --color-success: var(--green-500);
  --color-success-subtle: var(--green-50);
  --color-success-foreground: 0 0% 100%;

  /* ── Warning (wrong answers) ── */
  --color-warning: var(--amber-500);
  --color-warning-subtle: var(--amber-50);
  --color-warning-foreground: 0 0% 100%;

  /* ── Borders ── */
  --color-border: var(--slate-200);
  --color-border-muted: var(--slate-100);
  --color-input: var(--slate-200);

  /* ── Focus ── */
  --color-ring: var(--blue-500);

  /* ── Decorative ── */
  --color-patriotic-red: var(--patriotic-red);

  /* ── Status indicators ── */
  --color-status-online: var(--green-500);
  --color-status-offline: var(--slate-400);
  --color-status-syncing: var(--blue-400);
  --color-status-error: var(--red-500);

  /* ── Chart/category colors (stable across themes) ── */
  --color-chart-blue: var(--blue-500);
  --color-chart-amber: var(--amber-500);
  --color-chart-emerald: var(--green-500);

  /* ── Sub-category colors (data viz, stable across themes) ── */
  --color-category-democracy: 350 89% 60%;
  --color-category-government: var(--blue-500);
  --color-category-rights: var(--green-500);
  --color-category-colonial: var(--amber-500);
  --color-category-1800s: 292 84% 61%;
  --color-category-recent: 199 89% 48%;
  --color-category-symbols: var(--slate-500);

  /* ── Spacing (informational, Tailwind handles these) ── */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */

  /* ── Border Radius ── */
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.25rem;
  --radius-2xl: 1.5rem;
  --radius-3xl: 2rem;
  --radius-full: 9999px;

  /* ── Shadows ── */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  --shadow-chunky: 0 4px 0 hsl(var(--color-primary-active));
  --shadow-chunky-active: 0 1px 0 hsl(var(--color-primary-active));

  /* ── Motion ── */
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-page: 400ms;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

  /* ── Typography ── */
  --font-sans: 'Inter', 'Noto Sans Myanmar', system-ui, -apple-system, sans-serif;
  --font-myanmar: 'Noto Sans Myanmar', 'Inter', system-ui, -apple-system, sans-serif;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
}

/* ═══════════════════════════════════════════════════
   DARK THEME
   Only semantic tokens change. Primitives stay the same.
   ═══════════════════════════════════════════════════ */

.dark {
  /* ── Surfaces (soft dark, not pure black) ── */
  --color-background: 222 47% 11%;
  --color-surface: 222 47% 14%;
  --color-surface-raised: 222 47% 17%;
  --color-surface-muted: 217 33% 17%;

  /* ── Text ── */
  --color-text-primary: 210 40% 98%;
  --color-text-secondary: 215 20% 65%;
  --color-text-on-primary: 222 47% 11%;

  /* ── Primary ── */
  --color-primary: var(--blue-400);
  --color-primary-hover: var(--blue-300);
  --color-primary-active: var(--blue-200);
  --color-primary-disabled: var(--blue-700);
  --color-primary-subtle: 224 71% 15%;
  --color-primary-50a: 213 94% 68% / 0.15;

  /* ── Secondary ── */
  --color-secondary: 200 45% 18%;
  --color-secondary-foreground: 210 40% 96%;

  /* ── Accent ── */
  --color-accent: 217 33% 20%;
  --color-accent-foreground: 210 40% 98%;

  /* ── Accent Purple ── */
  --color-accent-purple: 270 65% 65%;

  /* ── Destructive ── */
  --color-destructive: 10 45% 50%;
  --color-destructive-hover: 10 45% 55%;
  --color-destructive-foreground: 210 40% 98%;

  /* ── Success ── */
  --color-success: 142 71% 50%;
  --color-success-subtle: 142 71% 15%;
  --color-success-foreground: 222 47% 11%;

  /* ── Warning ── */
  --color-warning: 32 95% 58%;
  --color-warning-subtle: 32 95% 20%;
  --color-warning-foreground: 222 47% 11%;

  /* ── Borders ── */
  --color-border: 217 33% 25%;
  --color-border-muted: 217 33% 20%;
  --color-input: 217 33% 20%;

  /* ── Focus ── */
  --color-ring: var(--blue-400);

  /* ── Shadows ── */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.2);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.4);
  --shadow-chunky: 0 4px 0 hsl(var(--color-primary-active));
  --shadow-chunky-active: 0 1px 0 hsl(var(--color-primary-active));
}
```

### Example 2: Animated Sun/Moon Toggle with motion/react
```tsx
// src/components/ThemeToggle.tsx
'use client';

import { motion } from 'motion/react';
import { useThemeContext } from '@/contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeContext();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/80 shadow-sm transition hover:-translate-y-0.5 hover:bg-surface-muted"
    >
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ rotate: isDark ? 360 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Sun rays - scale to 0 in dark mode */}
        <motion.g
          animate={{ scale: isDark ? 0 : 1, opacity: isDark ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </motion.g>

        {/* Sun/Moon circle - morphs via radius and position */}
        <motion.circle
          cx="12"
          cy="12"
          animate={{
            r: isDark ? 5 : 5,
            cx: isDark ? 12 : 12,
            cy: isDark ? 12 : 12,
          }}
          transition={{ duration: 0.3 }}
          fill={isDark ? 'currentColor' : 'none'}
        />

        {/* Moon crescent mask (only visible in dark) */}
        <motion.circle
          cx="16"
          cy="8"
          r="3"
          animate={{
            opacity: isDark ? 1 : 0,
            scale: isDark ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          fill="hsl(var(--color-surface))"
        />
      </motion.svg>
    </button>
  );
};

export default ThemeToggle;
```

### Example 3: Blocking Theme Script for _document.tsx
```tsx
// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

const THEME_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('civic-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.add(theme);
    document.documentElement.style.setProperty('color-scheme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#1a1f36' : '#002868';
  } catch(e) {}
})();
`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#002868" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="US Civics" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

### Example 4: Token-Aware Chart Colors
```tsx
// In ProgressPage.tsx or similar
import { getTokenColor } from '@/lib/tokens';
import { useThemeContext } from '@/contexts/ThemeContext';

function ScoreChart() {
  const { theme } = useThemeContext(); // Triggers re-render on toggle

  // These resolve fresh CSS var values on each render
  const chartColors = {
    blue: getTokenColor('--color-chart-blue'),
    amber: getTokenColor('--color-chart-amber'),
    emerald: getTokenColor('--color-chart-emerald'),
  };

  return (
    <LineChart data={data}>
      <Line stroke={chartColors.blue} />
      <Line stroke={chartColors.amber} />
      <Line stroke={chartColors.emerald} />
    </LineChart>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SCSS variables + BEM | CSS custom properties + utility-first | ~2020 | Tokens are runtime-swappable, no build step |
| JS theme objects | CSS variables consumed by Tailwind | Tailwind v3+ | Single source of truth, no JS import needed |
| `prefers-color-scheme` media only | Class-based toggle + system fallback | Tailwind v3 | User control over theme preference |
| Build-time token compilation (Style Dictionary) | Runtime CSS custom properties | ~2022 | Simpler for single-app projects |
| Tailwind `dark:` on every component | CSS variable swapping at root | Community best practice 2024+ | Eliminates hundreds of `dark:` utilities |

**Deprecated/outdated:**
- `design-tokens.ts` (JS object): Already dead code in this project (zero imports). CSS variables are the standard replacement.
- Tailwind v2 `darkMode: 'media'`: Replaced by `darkMode: ['class']` for manual toggle support.

## Codebase Audit Summary

### Current Fragmentation Map

| Source | What It Defines | Lines | Status |
|--------|----------------|-------|--------|
| `globals.css` `:root{}` | 40+ CSS variables (HSL channels) | 66 | Migrate to tokens.css |
| `globals.css` `.dark{}` | 35+ dark mode variable overrides | 68 | Migrate to tokens.css |
| `globals.css` `.dark .bg-*` | 14 manual dark class overrides | 56 | Delete (token system handles) |
| `tailwind.config.js` colors | 12 color groups, some hardcoded HSL | 84 | Rewire to CSS vars |
| `design-tokens.ts` | Colors, spacing, timing, radius, shadows | 113 | Delete entirely |
| Component inline styles | rgba/hsl/hex in style={{}} | ~25 occurrences | Migrate case-by-case |
| Component Tailwind classes | Non-semantic palette classes | ~115 usages | Replace with semantic |
| Component `dark:` prefixes | Manual dark mode overrides | ~220 usages | Remove (token system handles) |

### Files Requiring Migration (by complexity)

**High complexity (canvas/chart/motion):**
1. `shareCardRenderer.ts` - 19 hardcoded colors (LEAVE AS-IS: brand share card)
2. `CircularTimer.tsx` - 6 colors (timer stages, pragmatic to keep)
3. `ProgressPage.tsx` - Recharts + 7 hardcoded hex (use getTokenColor)
4. `HistoryPage.tsx` - Recharts + 4 hardcoded hex (use getTokenColor)
5. `InterviewResults.tsx` - Recharts + 4 hardcoded hex (use getTokenColor)
6. `SkillTreePath.tsx` - 3 inline rgba boxShadow (use token vars)
7. `Card.tsx` - 2 inline rgba boxShadow (use token vars)
8. `AudioWaveform.tsx` - 2 canvas colors (use getTokenColor)

**Medium complexity (many `dark:` overrides):**
- `WelcomeModal.tsx` (20 dark:), `NotificationSettings.tsx` (19), `InstallPrompt.tsx` (14), `InterviewResults.tsx` (12), `IOSTip.tsx` (8), `StreakHeatmap.tsx` (8), `NotificationPrePrompt.tsx` (8), `SettingsPage.tsx` (8)

**Low complexity (palette swap only):**
- All other ~80 components: replace `text-gray-500` with `text-secondary`, `bg-blue-500` with `bg-primary`, etc.

### Key Numbers
- **103 TSX component files** (excluding tests)
- **14 page files**
- **128 hardcoded color literals** across 24 files
- **~115 non-semantic palette class usages** across 37 files
- **~220 `dark:` prefix usages** across 43 files
- **0 imports** of design-tokens.ts (dead code)
- **3 files** using Recharts (need JS color access)
- **1 file** using canvas for rendering (shareCardRenderer - exempt)
- **1 file** using react-countdown-circle-timer (CircularTimer - pragmatic keep)

## Open Questions

1. **Smooth Theme Transition Scope**
   - What we know: User wants smooth fade transition on toggle. CSS transitions on `background-color` and `color` can handle this.
   - What's unclear: Should the transition apply to ALL elements (`*`) or only specific surfaces? Global `*` transition can cause jank on rapid interactions.
   - Recommendation: Apply transition to `html`, `body`, `.page-shell`, card/surface elements only. Buttons and interactive elements should remain instant.

2. **Tailwind Primitive Color Names**
   - What we know: Primitives use `--blue-500`, `--green-500` etc. Tailwind defaults use the same names natively.
   - What's unclear: Will our custom `--blue-500` (HSL: 217 91% 60%) conflict with Tailwind's built-in `blue-500` (which is #3b82f6 = essentially the same but from a different source)?
   - Recommendation: Override Tailwind's default colors entirely in the config, referencing our CSS vars. This ensures consistency.

3. **System Preference Change Listener**
   - What we know: ThemeContext reads system preference on mount. User locked "two-state toggle" with no System option.
   - What's unclear: Should the app listen for OS preference changes (e.g., scheduled dark mode) and update if user hasn't manually set a preference?
   - Recommendation: Yes, add a `matchMedia` listener in ThemeContext. If no manual override is stored, follow system changes in real time. Once user manually toggles, ignore system changes.

## Sources

### Primary (HIGH confidence)
- `/websites/v3_tailwindcss` Context7 - CSS variables in theme config, dark mode class strategy
- `/stylelint/stylelint` Context7 - color-no-hex rule, custom property enforcement
- `/websites/motion_dev_react` Context7 - SVG animation, path morphing patterns
- Codebase audit: `globals.css`, `tailwind.config.js`, `design-tokens.ts`, 103 component files

### Secondary (MEDIUM confidence)
- [Next.js dark mode FOUC discussion](https://github.com/vercel/next.js/discussions/53063) - Blocking script pattern for Pages Router
- [Not A Number - Fixing Dark Mode Flickering](https://notanumber.in/blog/fixing-react-dark-mode-flickering) - FOUC prevention techniques verified against official docs
- [@metamask/eslint-plugin-design-tokens](https://github.com/MetaMask/eslint-plugin-design-tokens/blob/main/docs/rules/color-no-hex.md) - ESLint rule for hex color detection in inline styles

### Tertiary (LOW confidence)
- None - all findings verified with primary or secondary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - CSS custom properties + Tailwind v3 is the established pattern; no new dependencies needed except lint tools
- Architecture: HIGH - Two-tier token pattern is well-documented and the existing codebase already partially uses CSS vars via globals.css
- Pitfalls: HIGH - Audited actual codebase patterns; FOUC prevention verified against official Next.js documentation
- Migration scope: HIGH - Comprehensive grep/audit of all 103 component files quantified exact work needed

**Research date:** 2026-02-09
**Valid until:** 2026-03-09 (stable domain, no fast-moving dependencies)
