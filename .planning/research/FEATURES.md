# Feature Landscape: v2.0

**Domain:** Bilingual civics test prep PWA for Burmese immigrants
**Researched:** 2026-02-09
**Focus:** Unified navigation, "Next Best Action" dashboard, Progress Hub, iOS-inspired UI, USCIS 2025 128Q bank, Burmese translation trust, security hardening

## Context: What v1.0 Already Delivers

v1.0 shipped with 55 requirements across 10 phases. The following already exist:

- Mock test (20 random Qs from 120-question pool), timed sessions, pass/fail
- Study guide with flashcard-style bilingual cards, TTS
- Dashboard with accuracy metrics, category breakdown, readiness indicator
- Per-category mastery tracking with progress rings, skill tree
- Category-focused practice mode with weak area emphasis (SuggestedFocus)
- FSRS spaced repetition with review heatmap
- Interview simulation with TTS and realistic pacing
- Study streaks, 12 badges, milestone celebrations
- Score sharing with Canvas-rendered cards
- Privacy-first leaderboard (opt-in, RLS)
- Duolingo-inspired 3D buttons, sound effects
- 7-step onboarding tour, vertical skill tree
- Mobile bottom tab bar (3 tabs + More sheet), desktop top nav (7 links)
- Dark/light theme, PWA with offline study, push notifications

**Current question bank:** 120 questions (100 original + 20 "uscis2025Additions")
**USCIS 2025 requirement:** 128 questions (effective Oct 20, 2025). Gap: 8 questions missing.

---

## Epic 1: Unified Navigation

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **Consistent nav across mobile and desktop** | Users currently see different navigation structures on mobile (3 tabs + More sheet) vs desktop (7-link top bar). Switching devices feels disjointed. | Med | Existing BottomTabBar.tsx, AppNavigation.tsx |
| **5-tab bottom bar (eliminate More menu)** | Duolingo, Khan Academy, and all major education apps use 4-5 persistent bottom tabs. The "More" sheet hides Interview, Progress, History, and Social -- users forget they exist. | Med | Bottom tab bar redesign |
| **Active state with haptic/visual feedback** | iOS and Material Design both mandate clear active state. Current implementation has subtle indicators. | Low | Existing tab components |
| **Badge/notification dots on tabs** | SRS due count already shows on Study in desktop nav but NOT on mobile tab bar. Users miss review reminders. | Low | useSRS context, BottomTabBar |

### Expected Behaviors

**5-Tab Structure (recommendation based on Duolingo core tabs redesign pattern):**

1. **Home** (dashboard) -- primary landing, "Next Best Action" card
2. **Study** (study guide + SRS reviews) -- cards, flashcards, review deck
3. **Test** (mock test + interview) -- combined assessment modes
4. **Progress** (consolidated hub) -- mastery, streaks, badges, history
5. **Profile/Settings** -- account, preferences, language, theme

This collapses 7 current navigation targets into 5, matching iOS Human Interface Guidelines recommending 3-5 bottom tabs. The "More" sheet pattern (current mobile) violates Apple's guidance: hidden navigation gets 60-80% less engagement than visible tabs.

**Desktop parity:** Desktop top nav should mirror the same 5 sections. Currently shows 7 links, creating cognitive dissonance when switching breakpoints.

**Transition behavior:** Active tab should animate (scale + color transition). Duolingo uses a pill-shaped active indicator that shifts between tabs.

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Smart tab badges** | Show SRS due count on Study tab, "new test available" on Test tab, unread badge on Progress tab when milestone earned | Low | Existing context data |
| **Nav-locked mode preservation** | During active mock test, navigation is locked. This already exists but needs to work with new 5-tab layout. | Low | Existing `locked` prop on AppNavigation |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Hamburger menu** | Hides navigation, reduces discoverability. Target audience (older immigrants) struggles with hidden menus. | Visible bottom tabs always present |
| **Sidebar drawer navigation** | Desktop pattern that feels foreign on mobile PWA. Creates two navigation paradigms. | Single consistent tab bar that adapts (bottom on mobile, top on desktop) |
| **Swipe-between-tabs gesture** | Conflicts with horizontal card swiping in Study and flashcard interactions | Tap-only tab switching |

---

## Epic 2: "Next Best Action" Dashboard

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **Single primary CTA** | Current dashboard has 3 equal-weight quick action buttons (Study, Test, Interview). Users with decision fatigue need ONE clear "do this next" action. | Med | Dashboard.tsx, mastery data, SRS data |
| **Contextual recommendation** | The "Next Best Action" card should change based on user state: new user gets "Start studying", user with due SRS cards gets "Review 12 cards", user with high mastery gets "Take a mock test" | Med | useCategoryMastery, useSRS, useStreak hooks |
| **Compact widget layout** | Current dashboard is long scroll with 10+ sections. Needs progressive disclosure -- hero action, summary cards, then details on demand. | Med | Dashboard component restructure |

### Expected Behaviors

**"Next Best Action" (NBA) decision tree:**

Based on research into education app personalization patterns and predictive UX:

```
Priority 1: SRS cards due > 0
  -> "Review {N} cards" (orange urgency card)
  -> Rationale: spaced repetition timing is time-sensitive

Priority 2: Streak about to break (last activity > 20 hours ago)
  -> "Keep your streak! Quick 5-minute review" (amber card)
  -> Rationale: streak preservation is a strong motivator

Priority 3: Weak category detected (mastery < 50%)
  -> "Practice {weakest category}" (blue card)
  -> Rationale: targeted practice on weak areas

Priority 4: No test taken in 7+ days
  -> "Ready for a mock test?" (green card)
  -> Rationale: regular testing validates progress

Priority 5: High mastery (> 80% overall)
  -> "You're almost ready! Take the full test" (celebration card)
  -> Rationale: confidence building for test-ready users

Fallback: New user / no data
  -> "Start your journey -- study {first category}" (welcoming card)
  -> Rationale: clear onboarding path
```

**Card anatomy (single NBA card):**
- Icon + bilingual title (en + my)
- 1-line bilingual description of why this action matters
- Single prominent CTA button (3D Duolingo-style)
- Dismiss/snooze option (X or "Later")
- Subtle progress indicator (e.g., "3 of 12 cards reviewed today")

**Below the NBA card:** Compact stat summary row (streak days, mastery %, questions practiced). NOT the current verbose section-by-section layout.

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Bilingual NBA reasoning** | "You haven't practiced American History in 5 days" in both languages. Builds trust -- user understands WHY the app recommends this. | Low | i18n strings |
| **Time-aware recommendations** | Morning: "Start your day with a quick review". Evening: "Wind down with flashcards". Uses local time. | Low | Date APIs |
| **Anxiety-calibrated urgency** | Never use red/urgent styling. Even overdue SRS cards use warm amber, not alarming red. "Gentle nudge" design pattern. | Low | Design tokens |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Multiple simultaneous recommendations** | Decision fatigue. Users freeze when given choices. | Single NBA card. One action. One tap. |
| **AI-generated personalization copy** | Expensive, unpredictable, potentially incorrect for legal test prep context | Rule-based decision tree with handcrafted bilingual messages |
| **Notification-style urgency** | "You MUST review now!" creates anxiety for already-stressed test takers | Warm, encouraging framing: "Great time to review" |
| **Complex analytics on home screen** | Overwhelming. Metrics belong in Progress Hub, not on the action-oriented home. | Move charts/breakdowns to Progress Hub |

---

## Epic 3: Progress Hub Consolidation

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **Single page for all progress data** | Currently scattered across Dashboard (category accuracy, badges, leaderboard), ProgressPage (skill tree, mastery rings, trend chart), HistoryPage (test sessions). Users visit 3 pages to understand their status. | Med-High | ProgressPage.tsx, HistoryPage.tsx, Dashboard.tsx |
| **Test history timeline** | Move from separate HistoryPage into a tab/section within Progress Hub | Med | HistoryPage content migration |
| **Badge showcase** | Currently a small widget on Dashboard. Should be a proper gallery in Progress Hub. | Low | BadgeHighlights component |
| **Streak visualization** | Current StreakWidget on Dashboard. Progress Hub should show calendar/heatmap view. | Low-Med | StreakWidget, ReviewHeatmap components |

### Expected Behaviors

**Progress Hub structure (tab-based within single page):**

Based on consolidated learning analytics patterns:

1. **Overview tab** (default): Readiness score hero, overall mastery ring, questions practiced count, current streak, recent activity timeline (last 5 actions)
2. **Categories tab**: Current ProgressPage content (skill tree, category cards with sub-categories, mastery trend chart)
3. **History tab**: Current HistoryPage content (test session list with scores, duration, date)
4. **Achievements tab**: Full badge gallery (12 badges), milestone timeline, leaderboard position

**Key consolidation moves:**
- ReadinessIndicator moves from Dashboard to Progress Hub Overview
- CategoryGrid stays on Dashboard as compact preview, links to Progress Hub Categories
- StreakWidget stays on Dashboard as compact widget, links to Progress Hub Overview
- BadgeHighlights stays on Dashboard as compact preview, links to Progress Hub Achievements
- LeaderboardWidget moves from Dashboard to Progress Hub Achievements
- Full trend chart moves from ProgressPage to Progress Hub Categories
- HistoryPage becomes a tab, its route `/history` redirects to `/progress#history`

**Dashboard after consolidation:** Becomes focused and clean:
- NBA card (hero)
- Compact stat row (streak, mastery %, due reviews)
- Quick action buttons (Study, Test, Interview) -- below NBA card
- SRS widget (compact)
- Compact category preview (clickable to Progress Hub)

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **"Am I ready?" confidence meter** | Single number/gauge answering the user's real question. Based on coverage + accuracy + consistency. Already exists as ReadinessIndicator, but elevate it as the Progress Hub centerpiece. | Low | Existing ReadinessIndicator |
| **Bilingual milestone timeline** | "Feb 1: Mastered American Government" in both languages. Gives sense of journey. | Med | Badge/milestone data, i18n |
| **Exportable progress summary** | "Share your progress" generates a card showing readiness score, streak, badges. Extends existing Canvas share card. | Med | Existing score sharing infrastructure |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Separate pages for each data type** | Current problem: data scattered across 3 pages | Consolidate into tabbed Progress Hub |
| **Complex data visualizations** | Target audience wants "am I ready?" not "what's my p-value?" | Simple rings, bars, and clear labels |
| **Comparison with other users** | Anxiety-inducing for test prep. Leaderboard exists but is opt-in. | Keep leaderboard opt-in, tucked in Achievements tab |

---

## Epic 4: iOS-Inspired Design System

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **Consistent component library** | Current components are ad-hoc: some use Card/CardContent, some use raw divs with Tailwind classes. No design system consistency. | Med-High | All UI components |
| **Proper spacing/typography scale** | Duolingo's recent core tabs refresh specifically cited inconsistent header sizes, typography hierarchy, and spacing as problems they fixed. Same issues exist here. | Med | globals.css, Tailwind config |
| **Touch target compliance** | iOS requires 44pt minimum. Most components already have `min-h-[44px]` but should be systematic, not per-component. | Low | Tailwind utility classes |

### Expected Behaviors

**Apple Liquid Glass is the current design trend (WWDC 2025, iOS 26)** but should be applied sparingly to a PWA:

**What to adopt:**
- **Frosted glass navigation bars**: `backdrop-filter: blur(20px)` on both top nav and bottom tab bar. Current AppNavigation already uses `backdrop-blur-xl` -- good. BottomTabBar uses `backdrop-blur-xl` -- good. Standardize to a shared design token.
- **Translucent card surfaces**: Cards with subtle background blur and 95% opacity. Current cards are solid `bg-card`. Add a "glass" variant.
- **Smooth spring animations**: Current motion/react usage is good. Standardize timing curves. Use `type: 'spring', stiffness: 400, damping: 30` consistently (already used in BottomTabBar sheet).
- **SF-style rounded corners**: `rounded-2xl` (16px) is already standard. Good.
- **Subtle shadows with color tinting**: Current `shadow-lg shadow-primary/10` is the right approach.

**What NOT to adopt:**
- **Full Liquid Glass refraction effects**: Requires SVG filters, has cross-browser issues (Safari/Firefox don't support SVG filter inputs for backdrop-filter). Over-engineered for a PWA.
- **Parallax/depth effects**: Performance-heavy, accessibility concerns, conflicts with `prefers-reduced-motion`.
- **System-wide blur on everything**: Restrict glass effects to navigation chrome and modal overlays only.

**Design token standardization:**

```
Spacing: 4px grid (space-1 = 4px, space-2 = 8px, space-3 = 12px, space-4 = 16px)
Border radius: sm=8px, md=12px, lg=16px, xl=24px
Shadows: subtle (cards), medium (elevated cards), heavy (modals/sheets)
Typography: h1=2xl/extrabold, h2=xl/bold, h3=lg/semibold, body=sm, caption=xs
Glass: backdrop-blur-xl bg-card/95 (navigation), backdrop-blur-md bg-card/90 (cards)
```

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Glass-morphism navigation** | Modern, premium feel. Differentiates from other civics apps which look like 2018 Material Design. | Low | CSS backdrop-filter (already supported) |
| **Micro-interactions on all interactive elements** | 3D button press (already exists), tab switch animation, card flip smoothness, progress ring fill animation | Med | motion/react (already installed) |
| **Dark mode glass** | Frosted dark glass (bg-slate-950/80 with blur) looks stunning. Current dark mode is solid colors. | Low | Tailwind dark mode tokens |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Full Liquid Glass component library** | Libraries like liquid-glass-js and liquidglassui.org exist but are immature (released 2025), add bundle size, and have browser compat issues | Use native CSS backdrop-filter + Tailwind. 3 lines of CSS, not a dependency. |
| **Heavy blur on content areas** | Hurts readability, especially for bilingual text with Myanmar script. Myanmar glyphs are complex and need clear backgrounds. | Glass on chrome only (nav bars, modals). Content areas stay solid. |
| **Parallax scrolling** | Motion sickness, performance hits on low-end devices (common in target audience), conflicts with reduced motion preference | Static layouts with subtle fade-in animations |
| **Custom fonts** | Additional load time, FOUT issues. Myanmar script already needs system font fallback. | System font stack + existing font-myanmar class |

---

## Epic 5: Burmese Translation Trust

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **Translation quality indicator** | Users need to know if Burmese translations are machine-generated or human-verified. Trust is critical for test prep. | Low | Question data schema, UI indicator |
| **Community reporting mechanism** | Users who find translation errors need a way to flag them. Even a simple "Report issue" button per question. | Med | Supabase table for reports, UI components |

### Expected Behaviors

**Translation trust model (3 tiers):**

Based on crowdsourced translation verification patterns (Google Crowdsource, Crowdin, Transifex):

1. **Verified** (green checkmark): Reviewed by native Burmese speaker with civics knowledge. Gold standard.
2. **Community-reviewed** (blue checkmark): Flagged by 2+ community members as accurate. Intermediate trust.
3. **Machine/initial** (no indicator or gray): Initial translation, not yet verified. Honest about limitations.

**Per-question trust flow:**
- Each question shows a subtle trust indicator next to Burmese text
- Tapping the indicator shows: "This translation was verified by a native speaker" or "Help improve this translation -- report issues"
- "Report translation issue" opens a simple form: dropdown (Inaccurate, Unclear, Grammatical error, Other) + optional text field
- Reports stored in Supabase `translation_reports` table
- Admin can review reports and update translations

**Why this matters for this audience:** Burmese immigrants studying for a high-stakes legal test must trust the study material. Machine translations of legal/civics content can be dangerously misleading. Transparency about translation quality builds trust.

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Bilingual trust transparency** | No other civics app shows translation quality indicators. Most apps just show translations without context. | Low | UI badge component |
| **Community contribution path** | Users can contribute to improving translations, creating ownership and engagement | Med | Report form, Supabase table |
| **Translation changelog** | "Updated Feb 2026: Improved translation for Q42 based on community feedback" | Med | Supabase versioning |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **User-editable translations** | Quality control nightmare. Vandalism risk. Legal liability for incorrect civics content. | Report-only. Admin reviews and updates. |
| **Voting on translations** | Complex UI, requires critical mass of Burmese-speaking users, gamification of serious content | Simple report mechanism. Admin decides. |
| **AI-powered translation improvement** | Machine translation of civics/legal content is unreliable. "The 14th Amendment" has specific legal meaning that AI may mishandle. | Human verification only. AI can suggest, humans approve. |

---

## Epic 6: USCIS 2025 128-Question Bank

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **Complete 128-question bank** | USCIS 2025 civics test uses 128 questions (effective Oct 20, 2025). Current app has 120 (100 original + 20 additions). Missing 8 questions. | Low-Med | Question constants, category mapping |
| **Updated test format** | 2025 test: 20 questions asked, 12 correct to pass. Current app already uses this format. Verify alignment. | Low | TestPage.tsx verification |
| **Category alignment with USCIS 2025** | USCIS 2025 organizes into: American Government (72Q: Principles 15Q + System of Government 47Q + Rights 10Q), American History (32Q), Integrated Civics (24Q). Current mapping needs validation. | Med | categoryMapping.ts, question files |

### Expected Behaviors

**USCIS 2025 test structure (HIGH confidence - official USCIS source):**

- **Total questions:** 128 (up from 100 in 2008 test)
- **Test format:** Officer asks up to 20 questions, applicant must answer 12 correctly
- **Categories:**
  - American Government: ~72 questions
    - A: Principles of American Government (~15 questions)
    - B: System of Government (~47 questions)
    - C: Rights and Responsibilities (~10 questions)
  - American History: ~32 questions
  - Integrated Civics: ~24 questions
- **Key changes from 2008:** Geography questions largely removed, more focus on history and governance. ~75% content from 2008 test (some verbatim, some revised), ~25% new content.
- **Dynamic answers:** Some questions have answers that change (current president, current senators, etc.). USCIS provides updates at uscis.gov/citizenship/testupdates.

**Current app gap analysis:**

The app currently has 120 questions across 7 sub-categories:
- GOV-P01-P16 (Principles of American Democracy): 16 questions -- includes 4 from uscis2025Additions
- GOV-S01-S39 (System of Government): 39 questions -- includes 4 from uscis2025Additions
- RR-01-RR-13 (Rights and Responsibilities): 13 questions -- includes 3 from uscis2025Additions
- HIST-C01-C16 (Colonial Period): 16 questions -- includes 3 from uscis2025Additions
- HIST-101-109 (1800s): 9 questions -- includes 2 from uscis2025Additions
- HIST-R01-R12 (Recent History): 12 questions -- includes 2 from uscis2025Additions
- SYM-01-SYM-15 (Symbols & Holidays): 15 questions -- includes 2 from uscis2025Additions

**To reach 128:** Need 8 more questions. Must cross-reference with official USCIS PDF to identify which specific questions are missing from the official 2025 list.

**Dynamic answer handling:** Questions about current officeholders (president, VP, Speaker, senators) need a mechanism to update without code deploy. Options:
1. Supabase table for dynamic answers (overrides static constants)
2. Build-time env vars for current officials
3. Comment in code indicating which answers need periodic updates

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Question-bank-version indicator** | "Updated for USCIS 2025 (128 questions)" badge on landing page and study guide. Builds trust that content is current. | Low | UI badge, version constant |
| **Dynamic answer system** | Answers that change (current president, senators) auto-update without app update. | Med | Supabase or config-based answer override |
| **Question coverage tracker** | "You've practiced 96 of 128 questions" -- specific to USCIS 2025 total. Current tracker shows against `totalQuestions` which is correct. | Low | Already exists, verify number |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Auto-generating questions with AI** | Legal test prep content must be authoritative. AI-generated civics questions could be wrong and harmful. | Use ONLY official USCIS questions. Hand-translate to Burmese. |
| **Supporting both 2008 and 2025 tests** | Adds complexity. 2008 test only for N-400 filed before Oct 20, 2025. Diminishing audience. | 2025 test only. Users on 2008 test can still use the app (120/128 questions overlap). |
| **User-submitted questions** | Quality control, legal liability, incorrect content risk | Official USCIS questions only |

---

## Epic 7: Security Hardening

### Table Stakes

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **Content Security Policy headers** | Prevents XSS attacks. Currently no CSP headers configured. | Med | next.config.mjs, Vercel headers |
| **Supabase RLS audit** | Verify all tables have proper Row Level Security. Leaderboard and social features added in v1 need RLS review. | Med | Supabase dashboard, SQL policies |
| **Input sanitization** | Translation report form (new in v2) and any user-generated content must be sanitized. `errorSanitizer.ts` exists but is for error messages only. | Low-Med | New sanitization utility |
| **Dependency audit** | Check for known vulnerabilities in npm dependencies. | Low | `npm audit` |

### Expected Behaviors

**CSP configuration for Next.js + Supabase + PWA:**

```
default-src 'self';
script-src 'self' 'nonce-{random}' https://accounts.google.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://*.supabase.co;
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
font-src 'self';
worker-src 'self';
manifest-src 'self';
```

Note: `'unsafe-inline'` for styles is needed for Tailwind's dynamic class injection. Nonce-based CSP for scripts requires server-side rendering of nonces, which conflicts with the SPA architecture (SSR disabled via `dynamic(..., { ssr: false })`). A meta-tag CSP or Vercel headers config is the pragmatic approach.

**RLS audit checklist:**
- `profiles` table: users can only read/write their own profile
- `mock_tests` table: users can only read/write their own tests
- `mock_test_responses` table: users can only read/write their own responses
- `leaderboard_scores` table: all can read (public), users can only write their own
- `interview_sessions` table: users can only read/write their own
- New `translation_reports` table: users can insert their own, admins can read all

**Dependency audit approach:**
- Run `npm audit` and fix critical/high vulnerabilities
- Pin dependency versions in package-lock.json (already done via lockfile)
- Review Supabase client SDK version for known issues

### Differentiators

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Privacy-first data handling** | Immigrant users are justifiably cautious about data collection. Minimize PII, use anonymous IDs where possible, clear privacy policy. | Low | Policy document, data review |
| **Offline-first security** | IndexedDB data is encrypted-at-rest on device. Supabase tokens expire and refresh properly. | Low | Already handled by Supabase SDK |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Complex auth requirements** | MFA, email verification, etc. create barriers for target audience. | Simple Google OAuth + email/password. Already implemented. |
| **Data collection beyond necessity** | Analytics tracking, usage telemetry, etc. | Minimal data: auth, test results, progress. No tracking pixels. Sentry for errors only. |
| **IP-based rate limiting** | Users on shared WiFi/cellular NAT could be blocked together | Token-based rate limiting via Supabase RLS policies |

---

## Feature Dependencies (v2 Cross-Epic)

```
[Epic 1: Unified Navigation]
    |
    +-- required-before --> [Epic 2: NBA Dashboard] (dashboard layout depends on nav structure)
    +-- required-before --> [Epic 3: Progress Hub] (new tab structure routes to Progress)
    |
    +-- enhances --> [Epic 4: iOS Design] (nav is the most visible glass surface)

[Epic 2: NBA Dashboard]
    |
    +-- depends-on --> [Epic 1: Navigation] (dashboard is the Home tab)
    +-- depends-on --> [Epic 3: Progress Hub] (dashboard shows compact previews, links to Hub)
    |
    +-- enhanced-by --> [Epic 6: 128Q Bank] (NBA can reference "X of 128 questions")

[Epic 3: Progress Hub]
    |
    +-- depends-on --> [Epic 1: Navigation] (Progress is a primary tab)
    +-- absorbs --> existing ProgressPage.tsx, HistoryPage.tsx, Dashboard widgets
    |
    +-- independent-of --> [Epic 5, 6, 7]

[Epic 4: iOS Design System]
    |
    +-- independent (cross-cutting) --> applies to all epics
    +-- best-done-first --> establishes design tokens before other UI work
    |
    +-- does-NOT-depend-on --> any other epic

[Epic 5: Burmese Translation Trust]
    |
    +-- independent --> can be done in any order
    +-- requires --> [Epic 7: Security] for translation_reports table RLS
    |
    +-- enhances --> [Epic 6: 128Q] (new questions need trust indicators too)

[Epic 6: USCIS 128Q Bank]
    |
    +-- independent --> can be done early as pure data work
    +-- enhanced-by --> [Epic 5] (trust indicators on new questions)
    |
    +-- impacts --> SRS system (new cards need scheduling), mastery calculation

[Epic 7: Security Hardening]
    |
    +-- independent --> can be done in any order
    +-- should-be-done-before --> [Epic 5] (translation reports need RLS)
    +-- should-be-done-early --> foundational security before new features
```

### Recommended Build Order

1. **Epic 4: iOS Design System** -- establish tokens first, all subsequent UI work uses them
2. **Epic 6: USCIS 128Q Bank** -- pure data work, no UI dependencies, unblocks question count accuracy
3. **Epic 7: Security Hardening** -- foundational, unblocks translation reports table
4. **Epic 1: Unified Navigation** -- structural change that everything else depends on
5. **Epic 2: NBA Dashboard** -- redesign dashboard within new navigation structure
6. **Epic 3: Progress Hub** -- consolidate progress views into new tab
7. **Epic 5: Burmese Translation Trust** -- can be done alongside or after Hub

---

## MVP Recommendation

### Must Have (v2.0 launch)

1. **USCIS 128Q bank** -- factual gap, blocks test accuracy claim
2. **Unified 5-tab navigation** -- structural improvement, most visible change
3. **NBA dashboard card** -- single biggest UX improvement, replaces decision fatigue with guidance
4. **Design token standardization** -- foundational for consistent UI

### Should Have (v2.0 launch if time permits)

5. **Progress Hub consolidation** -- reduces page sprawl, cleaner information architecture
6. **Security hardening (CSP + RLS audit)** -- responsible engineering practice
7. **Glass-morphism polish** -- visual differentiation, premium feel

### Defer to v2.1

8. **Burmese translation trust system** -- important but needs community infrastructure
9. **Dynamic answer system** -- current officials rarely change; manual update is fine short-term
10. **Full design system documentation** -- formalize after patterns stabilize

---

## Sources

### USCIS 2025 Civics Test
- [USCIS 2025 Civics Test Official Page](https://www.uscis.gov/citizenship-resource-center/naturalization-test-and-study-resources/2025-civics-test) - HIGH confidence
- [128 Civics Questions and Answers PDF](https://www.uscis.gov/sites/default/files/document/questions-and-answers/2025-Civics-Test-128-Questions-and-Answers.pdf) - HIGH confidence
- [Federal Register: Implementation Notice](https://www.federalregister.gov/documents/2025/09/18/2025-18050/notice-of-implementation-of-2025-naturalization-civics-test) - HIGH confidence
- [Immiva 128Q Breakdown](https://immiva.com/blog/128-civics-questions-for-us-citizenship-test-study-guide) - MEDIUM confidence (third-party summary)
- [MyAttorneyUSA Guide](https://myattorneyusa.com/immigration-blog/navigating-the-u-s-naturalization-civics-test-from-100-to-128-questions-a-guide-for-aspiring-citizens/) - MEDIUM confidence

### Navigation & Dashboard Patterns
- [Duolingo Core Tabs Redesign (Feb 2026)](https://blog.duolingo.com/core-tabs-redesign/) - HIGH confidence (official blog)
- [Duolingo Home Screen Redesign](https://blog.duolingo.com/new-duolingo-home-screen-design/) - HIGH confidence
- [Duolingo Achievements System](https://blog.duolingo.com/achievement-badges/) - HIGH confidence
- [Next Best Action Guide - CleverTap](https://clevertap.com/blog/next-best-action/) - MEDIUM confidence
- [Next Best Action - Braze](https://www.braze.com/resources/articles/next-best-action) - MEDIUM confidence
- [Education App Design Trends 2025 - Lollypop](https://lollypop.design/blog/2025/august/top-education-app-design-trends-2025/) - MEDIUM confidence

### iOS Design / Liquid Glass
- [Apple Liquid Glass Wikipedia](https://en.wikipedia.org/wiki/Liquid_Glass) - HIGH confidence
- [Liquid Glass CSS Implementation - LogRocket](https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/) - MEDIUM confidence
- [Liquid Glass React Components](https://liquid-glass-js.com/) - LOW confidence (new library)
- [Liquid Glass UI for Next.js](https://liquidglassui.org/) - LOW confidence (new library)
- [Behind the Design: Duolingo - Apple](https://developer.apple.com/news/?id=jhkvppla) - HIGH confidence

### Translation Trust & Crowdsourcing
- [Google Crowdsource App](https://en.m.wikipedia.org/wiki/Crowdsource_(app)) - MEDIUM confidence
- [Crowdin Localization Platform](https://crowdin.com/) - HIGH confidence (official docs)
- [Transifex Crowdsourcing Guide](https://help.transifex.com/en/articles/6231849-crowdsourcing-translations) - MEDIUM confidence

### Security
- [Supabase API Security Docs](https://supabase.com/docs/guides/api/securing-your-api) - HIGH confidence
- [Supabase RLS Performance](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) - HIGH confidence
- [Next.js CSP Guide](https://nextjs.org/docs/pages/guides/content-security-policy) - HIGH confidence
- [Supabase Data API Hardening](https://supabase.com/docs/guides/database/hardening-data-api) - HIGH confidence

### PWA & Mobile UX
- [PWA App Design - web.dev](https://web.dev/learn/pwa/app-design) - HIGH confidence
- [PWA iOS Safe Area CSS](https://dev.to/marionauta/avoid-notches-in-your-pwa-with-just-css-al7) - MEDIUM confidence
- [Mobile UX Patterns 2026](https://www.sanjaydey.com/mobile-ux-ui-design-patterns-2026-data-backed/) - MEDIUM confidence

---

*Feature research for: Civic Test Prep v2.0*
*Researched: 2026-02-09*
*Supersedes: v1.0 feature research from 2026-02-05*
