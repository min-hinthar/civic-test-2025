# Phase 34: Content & About Page - Research

**Researched:** 2026-02-19
**Domain:** Content page creation, bilingual rendering, navigation integration
**Confidence:** HIGH

## Summary

Phase 34 builds a bilingual About page with origin story narrative and dedication cards for Dwight D. Clark and Dorothy & James Guyot (with Sayar-Gyi Khin Maung Win). The page must be accessible from the landing page, Settings, and app header (heart icon). On mobile, it should be a full-screen reading experience with bottom nav hidden and a back button at top.

No new libraries are needed. The existing stack (motion/react for animations, lucide-react for icons, Tailwind + design tokens for styling, LanguageContext for bilingual toggle) covers everything. The USCIS 2025 explanation completeness (CONT-01, CONT-02) is already satisfied -- all 128 questions have explanation objects with brief_en, brief_my, citation, and optional fields.

**Primary recommendation:** Build a single `AboutPage.tsx` in `src/pages/`, register at `#/about` route, create a `DedicationCard` component with tap-to-expand (reusing the WhyButton/ExplanationCard expand pattern), and add navigation entry points in GlassHeader, SettingsPage, and LandingPage.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- All 128 USCIS questions already have full explanation objects (brief_en, brief_my, citation, optional commonMistake/funFact/relatedQuestionIds)
- The 28 USCIS 2025 additions have been populated since roadmap creation
- No new explanation writing or quality audit work required
- If any gaps are discovered during implementation, fill them matching the existing format and depth
- **Tone:** Personal storytelling -- warm, first-person or close narrative voice ("This app was born from...")
- **Emotional weight:** Heartfelt and moving -- the reader should feel something
- **Burmese framing:** Burmese-anchored, broader welcome -- born from the Burmese community experience, but welcoming to anyone preparing for the civics test
- **Content:** Claude drafts narrative from publicly available information about VIA, Pre-Collegiate Program, and Learning Across Borders
- **No tech details** -- focus purely on mission, people, and impact
- **Page length:** Medium read (3-4 scrolls) -- enough room for meaningful story without feeling like an essay
- **Language:** Follows the app's language toggle (English OR Burmese based on user setting)
- **Call to action:** Share the app -- encourage sharing with community members who might benefit
- **External links:** A few key links (2-3 stable resources like USCIS.gov, VIA's website)
- **Footer:** Version + year + open source notice with GitHub repo link
- **Two dedication cards:** One for Dwight D. Clark, one shared for Dorothy & James Guyot
- **Dwight D. Clark:** Founder of VIA (Volunteers in Asia) and Learning Across Borders
- **Dorothy & James Guyot:** Co-founders of Pre-Collegiate Program (Yangon), with Sayar-Gyi Khin Maung Win (Philosophy) named as co-founder within their card
- **Prominence:** Featured section with visual emphasis -- distinct, honored part of the page
- **Bilingual rendering:** Follows language toggle, same as rest of page
- **Interaction:** Tap to expand -- cards show brief tribute by default, tap/click to reveal more detail
- **Route:** `#/about` -- clean, standard hash route
- **Accessible from:** Landing page + Settings + app header
- **Landing page:** Narrative teaser -- brief sentence/section hinting at the story, linking to About page
- **Header:** Heart icon linking to About page
- **Settings:** Link to About page
- **Mobile layout:** Full-screen reading experience -- hide bottom nav bar, back button at top to return

### Claude's Discretion
- Section flow and ordering of the About page
- Dedication card visual treatment and entrance animation
- Dedication card content structure (name/role/tribute/quote balance)
- External resource link selection
- Narrative teaser wording on landing page
- Header heart icon placement and sizing

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONT-01 | All 28 USCIS 2025 questions receive validated explanation objects | VERIFIED: All 128 questions (including 28 USCIS 2025 additions) have full explanation objects. No work needed. |
| CONT-02 | Explanation quality audit across all 128 questions -- consistent format and depth | VERIFIED: Regex count confirms 128/128 questions have explanation blocks with brief_en, brief_my, citation. Prior phases completed this work. |
| CONT-03 | About page with full narrative: app origin, mission statement, VIA history, Pre-Collegiate Program story | Research provides factual foundation for VIA (1963 founding, Dwight Clark, Stanford), PCP (2003 founding, Guyots, Khin Maung Win), and LAB. Page structure follows existing page patterns. |
| CONT-04 | Bilingual dedication cards for Dwight D. Clark and Dorothy & James Guyot | Expand/collapse pattern exists (WhyButton/ExplanationCard). Lucide Heart icon verified available. Research provides biographical content for both cards. |
| CONT-05 | About page accessible from Settings and/or navigation | GlassHeader (public pages) and Sidebar/BottomTabBar (app pages) patterns documented. HIDDEN_ROUTES and navConfig integration points identified. |
| CONT-06 | About page renders in both English-only and bilingual modes | LanguageContext `showBurmese` pattern used across entire app. BilingualText/BilingualHeading components available. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion/react | ^12.33.0 | Animations (expand, fade, stagger) | Already used by 30+ components |
| lucide-react | ^0.475.0 | Icons (Heart, ChevronDown, ExternalLink, Share2, ArrowLeft) | Already the project's icon library |
| clsx | ^2.1.1 | Conditional class composition | Already standard in project |
| react-router-dom | (bundled) | Hash routing (`#/about`) | Already handles all navigation |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS | (bundled) | Styling with design tokens | All visual styling |
| @fontsource/noto-sans-myanmar | ^5.2.7 | Myanmar typography | Burmese text rendering with `font-myanmar` class |

### No New Dependencies Required
This phase requires zero new npm packages.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── pages/
│   └── AboutPage.tsx              # Main About page (new)
├── components/
│   └── about/
│       └── DedicationCard.tsx      # Tap-to-expand dedication card (new)
├── constants/
│   └── about/
│       └── aboutContent.ts         # Bilingual narrative content (new)
```

### Pattern 1: Public Page with GlassHeader (Existing)
**What:** Full-page content with glass-morphism header, no sidebar/bottom nav
**When to use:** Public-facing content pages (landing, op-ed, about)
**Example from OpEdPage.tsx:**
```typescript
const AboutPage = () => {
  return (
    <div className="page-shell">
      <GlassHeader showBack backHref="/" />
      <main className="mx-auto max-w-4xl px-6 py-10 space-y-10">
        {/* Content sections */}
      </main>
    </div>
  );
};
```

### Pattern 2: Bilingual Content Rendering (Existing)
**What:** Show English always, show Burmese only when `showBurmese` is true
**When to use:** All user-facing text
**Example from LandingPage.tsx:**
```typescript
const { showBurmese } = useLanguage();

<h2 className="text-2xl font-extrabold text-foreground">
  Everything You Need to Pass
</h2>
{showBurmese && (
  <p className="mt-1 font-myanmar text-2xl text-muted-foreground">
    အောင်မြင်ဖို့ လိုအပ်တာအားလုံး ဒီမှာရှိပါတယ်
  </p>
)}
```

### Pattern 3: Tap-to-Expand Card (Existing)
**What:** Card with collapsed summary and expandable detail, AnimatePresence height animation
**When to use:** Dedication cards that show brief tribute by default, full content on tap
**Example from WhyButton.tsx:**
```typescript
const [isExpanded, setIsExpanded] = useState(false);
const shouldReduceMotion = useReducedMotion();

<button onClick={() => setIsExpanded(prev => !prev)} aria-expanded={isExpanded}>
  {/* Collapsed content */}
  <motion.span animate={{ rotate: isExpanded ? 180 : 0 }}>
    <ChevronDown />
  </motion.span>
</button>

<AnimatePresence initial={false}>
  {isExpanded && (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      {/* Expanded content */}
    </motion.div>
  )}
</AnimatePresence>
```

### Pattern 4: Navigation Integration Points
**What:** Four specific locations need modification to add About page access
**Integration points:**

1. **Route registration** (`src/AppShell.tsx`):
   ```typescript
   import AboutPage from '@/pages/AboutPage';
   // Add BEFORE catch-all route:
   <Route path="/about" element={<AboutPage />} />
   ```

2. **HIDDEN_ROUTES** (`src/components/navigation/navConfig.ts`):
   ```typescript
   // Add '/about' to hide sidebar/bottom nav on About page:
   export const HIDDEN_ROUTES = ['/', '/auth', '/auth/forgot', '/auth/update-password', '/op-ed', '/about'];
   ```

3. **GlassHeader** (`src/components/navigation/GlassHeader.tsx`):
   ```typescript
   // Add showAbout prop with Heart icon linking to /about
   // Heart icon in header, consistent with existing GlassHeader pattern
   ```

4. **Sidebar/BottomTabBar**: NOT modified. About is a public page accessed via GlassHeader/Settings link, not a primary nav tab.

### Pattern 5: Full-Screen Mobile Reading
**What:** Hide bottom nav bar on About page, show back button at top
**How:** Adding `/about` to HIDDEN_ROUTES automatically hides both Sidebar and BottomTabBar (the NavigationShell checks HIDDEN_ROUTES). GlassHeader provides the back button via `showBack` prop.

### Anti-Patterns to Avoid
- **Do not add About as a nav tab**: It's a content page, not a core feature. Use heart icon in header + Settings link + landing teaser instead.
- **Do not create a new navigation component**: GlassHeader already supports the back button pattern needed.
- **Do not use inline strings**: All bilingual content should be in a dedicated constants file for maintainability.
- **Do not use `backdrop-filter` on preserve-3d elements**: Known pitfall from MEMORY.md -- but not relevant since no 3D transforms needed.
- **Do not use hex colors**: Stylelint enforces `color-no-hex: true`. Use CSS custom properties from tokens.css.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Expand/collapse animation | Custom height animation | WhyButton pattern (AnimatePresence + height: 'auto') | Handles reduced motion, overflow, and exit correctly |
| Bilingual text rendering | Custom language switching | `useLanguage()` + conditional Burmese blocks | Consistent with 20+ existing pages |
| Page transitions | Manual route animations | Existing `PageTransition` wrapper in AppShell | Already handles enter/exit direction |
| Glass morphism header | Custom header component | `GlassHeader` with showBack/showAbout props | Reuses proven pattern from landing + op-ed pages |
| Responsive nav hiding | Custom media queries | `HIDDEN_ROUTES` in navConfig.ts | Single source of truth for all nav surfaces |
| Myanmar font application | Manual CSS | `font-myanmar` Tailwind class | Already configured in tailwind.config.js |

**Key insight:** This phase is primarily content creation and integration, not infrastructure. Every UI pattern needed already exists in the codebase.

## Common Pitfalls

### Pitfall 1: Route Not in HIDDEN_ROUTES
**What goes wrong:** About page renders with sidebar AND bottom nav, defeating the full-screen reading experience.
**Why it happens:** Forgetting to add `/about` to the HIDDEN_ROUTES array.
**How to avoid:** Add to HIDDEN_ROUTES in navConfig.ts. Both NavigationShell and BottomTabBar check this array.
**Warning signs:** Sidebar visible on desktop, bottom tab bar visible on mobile when viewing About page.

### Pitfall 2: Burmese Text Without font-myanmar Class
**What goes wrong:** Myanmar script renders in Inter (the default sans-serif), causing illegible or incorrectly shaped glyphs.
**Why it happens:** Forgetting to add `font-myanmar` class to Burmese text elements.
**How to avoid:** Every `{showBurmese && ...}` block must include `className="font-myanmar"` on the containing element.
**Warning signs:** Burmese text looks wrong or has broken conjuncts.

### Pitfall 3: Missing ProtectedRoute on Public Page
**What goes wrong:** About page requires authentication, blocking unauthenticated users.
**Why it happens:** Wrapping the route in `<ProtectedRoute>` by copy-pasting from other routes.
**How to avoid:** About page route must NOT be wrapped in ProtectedRoute. It should be accessible like `/op-ed` and `/`.
**Warning signs:** Redirects to /auth when trying to view About page.

### Pitfall 4: GlassHeader Heart Icon Conflict with Existing Props
**What goes wrong:** Heart icon doesn't render or conflicts with showBack/showSignIn.
**Why it happens:** GlassHeader currently has mutually exclusive action buttons (showSignIn OR showBack).
**How to avoid:** Add heart icon as a separate, always-visible element (not mutually exclusive with other buttons). Place it between the logo and the action button area, or add as a new prop `showAbout`.
**Warning signs:** Heart icon missing on some pages, or replacing the sign-in/back button.

### Pitfall 5: Sayar-Gyi Honorific Lost in Translation
**What goes wrong:** "Sayar-Gyi" dropped or transliterated incorrectly in the English version.
**Why it happens:** Treating it as a regular name component rather than a Burmese cultural honorific.
**How to avoid:** Preserve "Sayar-Gyi" in both English and Burmese text. In English: "Sayar-Gyi Khin Maung Win". In Burmese: the appropriate honorific form.
**Warning signs:** Card text says just "Khin Maung Win" without the honorific.

### Pitfall 6: Settings Link Navigation Back-Button Break
**What goes wrong:** Navigating from Settings to About and pressing back doesn't return to Settings.
**Why it happens:** Using `navigate('/about')` from Settings means back button goes to wherever was before Settings, not Settings itself.
**How to avoid:** The GlassHeader showBack already uses `backHref` prop -- can be set dynamically or always point to `/`. Alternatively, Settings link opens About, and About's back button uses `navigate(-1)` to return to wherever user came from.
**Warning signs:** Back button from About doesn't go to the expected previous page.

## Code Examples

### Example 1: About Page Structure
```typescript
// src/pages/AboutPage.tsx
'use client';

import { Link } from 'react-router-dom';
import { Heart, ExternalLink, Share2, ArrowLeft } from 'lucide-react';
import { GlassHeader } from '@/components/navigation/GlassHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { FadeIn, StaggeredList, StaggeredItem } from '@/components/animations/StaggeredList';
import { DedicationCard } from '@/components/about/DedicationCard';
import { aboutContent } from '@/constants/about/aboutContent';

export default function AboutPage() {
  const { showBurmese } = useLanguage();

  return (
    <div className="page-shell">
      <GlassHeader showBack backHref="/" />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-10">
        {/* Hero/Origin section */}
        <FadeIn>
          <section>
            <h1 className="text-3xl font-extrabold text-foreground">
              {aboutContent.hero.title.en}
            </h1>
            {showBurmese && (
              <p className="mt-1 font-myanmar text-3xl text-muted-foreground">
                {aboutContent.hero.title.my}
              </p>
            )}
            {/* Narrative paragraphs */}
          </section>
        </FadeIn>

        {/* Dedication Cards section */}
        <section>
          <DedicationCard person={aboutContent.dedications.dwightClark} />
          <DedicationCard person={aboutContent.dedications.guyots} />
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">
          <p>v2.1 &middot; 2026 &middot; Open Source</p>
          <a href="https://github.com/min-hinthar/civic-test-2025" target="_blank" rel="noreferrer">
            View on GitHub
          </a>
        </footer>
      </main>
    </div>
  );
}
```

### Example 2: DedicationCard Component
```typescript
// src/components/about/DedicationCard.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';

interface DedicationPerson {
  name: { en: string; my: string };
  role: { en: string; my: string };
  briefTribute: { en: string; my: string };
  fullTribute: { en: string; my: string };
}

export function DedicationCard({ person }: { person: DedicationPerson }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        className="flex w-full items-center gap-4 p-5 text-left min-h-[44px]
                   hover:bg-muted/50 transition-colors duration-150
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-expanded={isExpanded}
      >
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">{person.name.en}</h3>
          {showBurmese && (
            <p className="font-myanmar text-lg text-muted-foreground">{person.name.my}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">{person.role.en}</p>
          <p className="mt-2 text-sm text-foreground">{person.briefTribute.en}</p>
          {showBurmese && (
            <p className="mt-1 font-myanmar text-sm text-muted-foreground">
              {person.briefTribute.my}
            </p>
          )}
        </div>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border/40 pt-4">
              <p className="text-sm text-foreground leading-relaxed">{person.fullTribute.en}</p>
              {showBurmese && (
                <p className="mt-2 font-myanmar text-sm text-muted-foreground leading-relaxed">
                  {person.fullTribute.my}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Example 3: Bilingual Content Constants
```typescript
// src/constants/about/aboutContent.ts
import type { BilingualString } from '@/lib/i18n/strings';

interface DedicationPerson {
  name: BilingualString;
  role: BilingualString;
  briefTribute: BilingualString;
  fullTribute: BilingualString;
}

interface AboutContent {
  hero: {
    title: BilingualString;
    narrative: BilingualString[];
  };
  mission: { /* ... */ };
  via: { /* ... */ };
  preCollegiate: { /* ... */ };
  dedications: {
    dwightClark: DedicationPerson;
    guyots: DedicationPerson;
  };
  callToAction: { /* ... */ };
  externalLinks: Array<{ label: BilingualString; url: string }>;
  footer: { version: string; year: number; repoUrl: string };
}

export const aboutContent: AboutContent = { /* ... */ };
```

### Example 4: GlassHeader Heart Icon Addition
```typescript
// Modified GlassHeader -- add showAbout prop
interface GlassHeaderProps {
  showSignIn?: boolean;
  showBack?: boolean;
  backHref?: string;
  showAbout?: boolean;  // NEW: shows heart icon linking to /about
}

// In the header JSX, add heart icon before action buttons:
{showAbout && (
  <Link
    to="/about"
    className="flex items-center justify-center h-9 w-9 rounded-full text-muted-foreground
               hover:bg-primary/10 hover:text-primary transition-colors"
    aria-label="About this app"
  >
    <Heart className="h-4 w-4" />
  </Link>
)}
```

### Example 5: Settings Page About Link
```typescript
// In SettingsPage, add to Help & Guidance section:
<SettingsRow
  label="About This App"
  labelMy="ဤအက်ပ်အကြောင်း"
  description="Origin story and dedications"
  descriptionMy="ဇာတ်ကြောင်းနှင့် ဂုဏ်ပြုချက်များ"
  showBurmese={showBurmese}
  action={
    <button
      type="button"
      onClick={() => navigate('/about')}
      className="rounded-xl bg-primary-subtle px-4 py-2 text-sm font-bold text-primary
                 hover:bg-primary-subtle transition-colors min-h-[44px]"
    >
      {showBurmese ? 'ကြည့်ပါ' : 'View'}
    </button>
  }
/>
```

## Biographical Research for Dedication Content

### Dwight D. Clark -- VIA & Learning Across Borders
**Confidence:** HIGH (multiple verified sources)

- **VIA founding (1963):** Dean of Freshman Men at Stanford University, organized a summer volunteer project sending 23 Stanford undergraduates to Hong Kong to assist programs serving Chinese refugees through rooftop schools, medical clinics, recreation programs, and road building
- **Formal incorporation (1966):** Programs incorporated as "Volunteers in Asia" (501(c)(3))
- **40-year tenure:** Served as VIA President for 40 years, sending thousands of American students to volunteer across eight East Asian countries
- **Two-way exchange (1977):** Pioneered bringing Japanese university students (Keio, Waseda) to Stanford for summer English language and American society programs -- "not just sending Americans to Asia but giving Asians a chance to come here"
- **Burma/Myanmar connection:** VIA maintained volunteer positions in Burma; Dwight led a 2-week Burma study tour in November 2009 with 16 VIA alumni and friends, visiting Yangon, Mandalay, and Bagan
- **Learning Across Borders:** After retiring from VIA, founded Learning Across Borders -- a nonprofit offering experiential programs in Southeast Asia for Japanese and Taiwanese university students, connecting East Asia youth/students with Southeast Asia youth/students
- **Stanford connection:** Long-time Stanford figure, program based at Stanford campus

**Sources:**
- VIA History page (viaprograms.org/who-we-are/history/)
- Stanford Magazine "Ambassador to Asia" (stanfordmag.org)
- VIA Voices blog - Burma Study Tour (viaprograms.wordpress.com)
- Wikipedia - VIA Programs
- China Development Brief - VIA profile

### Dorothy & James (Jim) Guyot -- Pre-Collegiate Program
**Confidence:** HIGH (multiple verified sources)

- **Background:** Both pursued doctorates at Yale; Dorothy PhD in International Relations with dissertation on "The Political Impact of the Japanese Occupation of Burma"; Jim political science professor at CUNY Graduate Center and Baruch College
- **Burma connection (1961-1962):** Lived in Burma for 18 months conducting research; their first child was born there; Dorothy studied Burmese language at Yale for field work
- **PCP founding (2003):** Co-founded the Pre-Collegiate Program of Yangon together with Prof. Dr. U Khin Maung Win
- **Program mission:** Develops critical reasoning, civic engagement, and understanding of diverse communities within Myanmar among youth preparing to attend colleges abroad
- **Student outcomes:** 18-month intensive liberal arts curriculum; 80+ Myanmar students gained college admittance (US, Canada, Japan) on full-ride scholarships
- **Student diversity:** Students from diverse religious, ethnic, and socio-economic backgrounds across Myanmar
- **Dorothy's role:** Oversaw day-to-day program operations, spending significant time annually in Myanmar
- **Family:** Raised three children including Khin Khin (a teacher) -- showing deep personal connection to Myanmar

**Sources:**
- Pre-Collegiate Yangon About page (precollegiateyangon.info/about/)
- Myanmar Foundation for Analytic Education (myanmar-foundation.org/pcp)
- Leonia Lives profile (leonialives50.wordpress.com)
- Academia.edu - "A 12 year history of the Pre-Collegiate Program of Myanmar" by Dorothy Guyot

### Sayar-Gyi Khin Maung Win
**Confidence:** MEDIUM (fewer direct sources, mostly contextual)

- **Title:** Prof. Dr. U Khin Maung Win -- "Sayar-Gyi" is the honorific (literally "great teacher" in Burmese)
- **Academic role:** Head of Department of Philosophy at University of Yangon (1964-1975)
- **Government role:** Minister of Education in the Socialist Republic of the Union of Burma (1974-1980)
- **PCP co-founder:** Co-founded the Pre-Collegiate Program with Dorothy and James Guyot in 2003
- **Philosophy connection:** PCP curriculum includes World Philosophy and Comparative Literature, reflecting his philosophical background
- **Cultural significance:** As a Myanmar national and philosophy professor, he bridges the Burmese academic tradition with the liberal arts approach of the PCP

**Sources:**
- Pre-Collegiate Yangon About page
- Myanmar Foundation for Analytic Education
- MYANMORE article on PCP

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline bilingual strings | Centralized constants files | v2.0 (Phase 20+) | Content in dedicated files, not embedded in components |
| Single-purpose page headers | Reusable GlassHeader component | v2.1 (Phase 29) | Add props, don't create new header components |
| Manual nav visibility | HIDDEN_ROUTES array | v2.1 (Phase 29) | Single array controls all nav surfaces |

**No deprecated approaches relevant to this phase.**

## Open Questions

1. **GlassHeader Heart Icon -- Which Pages?**
   - What we know: Decision says "app header" should have heart icon. GlassHeader is used on public pages (landing, op-ed). Sidebar is the "header" for authenticated pages.
   - What's unclear: Does the heart icon go in GlassHeader (public pages) only, or also somewhere in the Sidebar (authenticated pages)?
   - Recommendation: Add `showAbout` prop to GlassHeader for public pages. For authenticated users, the Settings link provides access. Could optionally add a small heart icon in the Sidebar utility area, but keeping it simple (GlassHeader + Settings) is cleaner. The user said "app header" which likely means GlassHeader since that's the visible header on public pages.

2. **About Page -- Protected or Public?**
   - What we know: The About page tells the app's origin story. It's a content page like `/op-ed`.
   - What's unclear: Should unauthenticated users be able to read it?
   - Recommendation: Make it public (no ProtectedRoute). It's an origin story and mission page -- restricting it to authenticated users defeats the purpose of the landing page teaser. The op-ed page follows the same pattern.

3. **Narrative Burmese Translation Quality**
   - What we know: The narrative is personal storytelling with emotional weight. Machine translation of emotionally nuanced English to natural Burmese is difficult.
   - What's unclear: Whether Claude's Burmese drafting will achieve the desired naturalness for a storytelling context.
   - Recommendation: Draft both English and Burmese in the content constants file. Flag in verification that Burmese narrative text may need native speaker review (BRMSE-01 from known issues). Keep Burmese simple and direct rather than attempting literary flourish.

## Sources

### Primary (HIGH confidence)
- Codebase exploration: AppShell.tsx, navConfig.ts, GlassHeader.tsx, BottomTabBar.tsx, Sidebar.tsx, NavigationShell.tsx, OpEdPage.tsx, LandingPage.tsx, SettingsPage.tsx, WhyButton.tsx, ExplanationCard.tsx
- Question data verification: All 7 question files confirmed 128/128 explanations present
- Icon verification: lucide-react Heart, HeartHandshake, Share2, ExternalLink, Info icons confirmed available

### Secondary (MEDIUM confidence)
- VIA History (viaprograms.org) -- organizational history, Dwight Clark founding details
- VIA Voices blog (viaprograms.wordpress.com) -- Burma study tour details
- Pre-Collegiate Yangon (precollegiateyangon.info) -- PCP founding, curriculum, outcomes
- Leonia Lives (leonialives50.wordpress.com) -- Guyot personal biography
- Myanmar Foundation for Analytic Education (myanmar-foundation.org) -- PCP and Khin Maung Win connection

### Tertiary (LOW confidence)
- Khin Maung Win's specific philosophy department tenure dates (1964-1975) -- from single source search result, could not verify with official University of Yangon records

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH -- no new dependencies, all patterns exist in codebase
- Architecture: HIGH -- route registration, nav integration, page structure all follow proven existing patterns
- Pitfalls: HIGH -- documented from direct codebase analysis and MEMORY.md known issues
- Biographical content: MEDIUM-HIGH -- multiple web sources cross-referenced, but some details (especially Khin Maung Win) rely on fewer sources

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (stable -- content page patterns don't change fast)
