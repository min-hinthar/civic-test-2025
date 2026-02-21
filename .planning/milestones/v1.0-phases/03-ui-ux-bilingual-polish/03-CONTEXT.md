# Phase 3: UI/UX & Bilingual Polish - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Visual refinement, animations, accessibility, complete bilingual coverage, and anxiety-reducing design across the entire app. Users experience a polished, fully bilingual interface that reduces test anxiety through warm design and encouraging feedback. No new features or capabilities — this phase refines how existing functionality looks, feels, and communicates.

</domain>

<decisions>
## Implementation Decisions

### Visual Tone & Color Language

**Color system:**
- Bold & confident aesthetic inspired by Duolingo energy
- Patriotic blue as primary accent — multi-shade blue system (light blue surfaces, medium blue accents, dark blue primary buttons)
- Red accent for patriotic decoration only (stars, stripes, banners) — never for errors or alarming states
- Green for progress bars, completion indicators, and correct answer feedback
- Spacious layout with generous padding and margins

**Feedback states:**
- Wrong answers: soft orange briefly, then immediately shift attention to the explanation/correct answer
- Correct answers: mini celebration with escalating streaks — small sparkle for 1 correct, bigger burst at 3-in-a-row, full confetti + badge + bilingual praise at 5+ and test completion
- Peak celebration (perfect score/milestones): full-screen confetti burst + gold stars + badge unlock animation + bilingual congratulations

**Component styling:**
- Pill buttons (fully rounded ends) — friendly, Duolingo-style
- Subtle elevation on cards with light shadows — physical study card feel
- Very rounded border-radius (16px+) — bubbly, friendly
- Bold headings (heavy font weight) — strong, confident
- Filled/solid icons throughout — bold, visible
- White answer cards with blue border on hover, elevated shadow
- Bold colored header (blue/primary background) — strong app-like feel

**Dark mode:**
- Polish it properly — ensure all feedback colors, cards, and states look intentional

**Empty states:**
- Illustrated + encouraging with bilingual text (e.g., "You're just getting started!")

**Dashboard:**
- Balanced overview with a few cards showing different metrics (score, streak, weak areas) at-a-glance

**Flashcards:**
- Physical card aesthetic — thick card look, paper-like texture

### Motion & Transitions

**Animation library:** Framer Motion / Motion
**Overall speed:** Snappy (150-250ms) for interactions, matches Duolingo responsiveness
**Reduced motion:** Honor prefers-reduced-motion — keep feedback colors, cut all decorative animation

**Page transitions:**
- Slide + fade combo between pages — modern app feel
- Bottom-sheet slide-up for modals (install, onboarding)

**Interactions:**
- Button press: scale down + spring back — tactile, Duolingo-like
- Hover (desktop): both scale up + shadow lift — maximum tactile feedback
- Test questions: horizontal swipe left/right between questions — mobile-native flashcard feel

**Loading & progress:**
- Shimmer animation on skeleton loaders — feels alive
- Staggered entrance for list items (study guide, test history) — items fade/slide in sequentially
- Smooth scroll-to-top and section navigation

**Celebrations:**
- Canvas-based particle effects for confetti — smooth, performant
- Animated count-up from 0 to final score on test completion — suspenseful, satisfying
- Rolling/odometer number animation for score and count changes

**Flashcard:**
- 3D card flip rotation in 3D space showing front/back

**Timer:**
- Animated circular arc that depletes smoothly
- Color change at thresholds: blue -> yellow at 50% -> orange at 25% -> red pulse at 10%

**Tabs:**
- Sliding underline indicator that smoothly moves between tabs

**Toasts:**
- Bottom center, slide up

**Answer feedback:**
- Instant feedback — no suspense delay

**Focus rings:**
- Custom styled — thick blue outline matching brand

**Streaks:**
- Animated flickering flame icon that grows with streak length (Duolingo-style)

### Bilingual Text Presentation

**Layout pattern:**
- English on top, Burmese below (stacked)
- Burmese text subtly lighter color/weight than English — present but clearly secondary (subtle difference, e.g., gray-600 vs gray-900)
- Context-dependent sizing: navigation/buttons equal size, long content (questions, explanations) primary language larger

**Coverage levels:**
- Key action buttons (Start Test, Submit, etc.): always bilingual
- Smaller nav items: primary language only
- All questions and answer options: always both languages visible
- All error messages, toasts, system text: always bilingual
- Settings/about pages: fully bilingual
- Placeholders: bilingual (e.g., "Search / ရှာဖွေ")
- HTML meta/SEO: bilingual page titles, descriptions, OG tags
- Screen reader announcements: bilingual

**Font:**
- Noto Sans Myanmar — self-hosted/bundled for offline PWA support
- Three weights: Regular + Medium + Bold
- Fallback: system Myanmar font (font-display: swap behavior)

**Section headers:**
- English as main header text, Burmese as smaller subtitle below

**Burmese specifics:**
- Culturally adapted messages (not literal translations) for encouragement and microcopy
- Burmese numerals (၀, ၁, ၂) used within Burmese text context; Western digits in English context
- Burmese text center-alignment considered where it reads better
- Line break handling: Claude's discretion (CSS word-break or manual hints)

**Language toggle:**
- Quick toggle in header + full language control in settings
- English-only practice mode: toggle available both on test start screen and in settings (simulates real USCIS test conditions)

**Date/time:**
- English format only (Jan 15, 2026) — universally understood

### Anxiety-Reducing Patterns

**Microcopy tone:** Warm coach — "You're doing great — let's keep going!" Empowering, personal, encouraging.
- Mix of citizenship-referencing messages ("Every question brings you closer to your citizenship!") and general encouragement
- Rotating variety of encouraging wrong-answer messages — not repetitive

**Timer:**
- Visible by default with clear option to hide
- Circular arc with color thresholds (blue -> yellow -> orange -> red pulse)

**Test start:**
- Calming pre-test screen with: encouraging message + test info (question count, time) + breathing animation
- Breathing animation: user-controlled — runs until user taps "I'm ready"

**Test progress:**
- Progress bar + "Question 5 of 10" text count

**Test completion (all scores):**
- Growth-focused: show improvement compared to previous attempts
- Always encouraging and kind — celebrate what was answered correctly
- Full-screen celebration for milestones (50% complete, first perfect score, etc.)

**Quit test:**
- Gentle confirmation: "Take a break? Your progress will be saved." — reassuring, not guilt-tripping

**Wrong answers:**
- Icons + colors for color-blind accessibility (checkmark for correct, X for incorrect, plus green/orange)
- Orange flash then shift to explanation — learning-focused

**Onboarding:**
- Guided step-by-step tooltip walkthrough on first visit
- Skippable but encourage completion (Skip button less prominent)

**First visit study guide:**
- Warm invitation message + specific category suggestion to start (reduce decision paralysis)

**Study guide sections:**
- Bilingual encouraging intros for each category

**Dashboard greeting:**
- Personal: "Welcome back, [Name]!" in both languages when logged in

**Streak breaks:**
- Acknowledge + normalize: "It's okay to take breaks! Let's get back to studying."

**Errors:**
- Gentle + solution-focused: "Oops! No worries — we'll try again." Focus on the fix, not the problem.

### Claude's Discretion
- Exact blue shade palette values (multi-shade system direction is locked)
- Burmese line break/wrapping handling (CSS vs manual hints)
- Loading skeleton exact layout
- Exact animation easing curves and spring physics
- Badge/trophy designs for milestones
- Specific illustration choices for empty states and onboarding
- Walkthrough tooltip sequence and content
- Confetti particle count and physics

</decisions>

<specifics>
## Specific Ideas

- "I want Duolingo energy" — bright, fun, gamified feel with bold colors and playful interactions
- Physical flashcard aesthetic — cards should feel like holding a real study card
- Patriotic color palette (blue primary, red decorative) ties the app to the American citizenship journey
- Escalating celebrations build momentum — small sparkle at 1 correct, bigger at 3, full party at 5+
- Breathing animation before tests — user controls when they're ready, not a forced timer
- Rolling odometer numbers for score changes — satisfying, clear
- Animated flame for study streaks — Duolingo's signature motivation mechanic
- "Every practice makes you stronger" — growth mindset messaging throughout

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-ui-ux-bilingual-polish*
*Context gathered: 2026-02-06*
