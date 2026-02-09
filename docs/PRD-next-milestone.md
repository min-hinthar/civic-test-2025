# PRD: Unified Learning Hub + Premium iOS UX + Burmese Trust Upgrade (GSD)

## Document Meta
- **Owner:** Product + Engineering
- **Status:** Draft for execution
- **Target Milestone:** Next major release (MVP+)
- **Primary Audience:** Burmese ESL civics learners preparing for USCIS interview
- **Primary Goal:** Deliver a polished, premium, iOS‑inspired experience that is trustworthy for the Burmese community, with a clear learning path and updated USCIS 120‑question bank.

---

## 1) Problem Statement (What users are telling us)
Learners feel the app is **powerful but confusing**. The dashboard feels unorganized, navigation is inconsistent between desktop and mobile, and it is hard to focus on the **core path** (Study → Mock Test → Interview). Pages like Progress, History, and Community overlap and should be consolidated. The Burmese translations feel literal or inconsistent, which undermines trust. The app must also reflect updated USCIS guidance (120 questions, 20 questions per interview, pass/fail thresholds).

---

## 2) Goals & Success Metrics (GSD)

### Goals
1. **Clarity of flow** — unify navigation and guide users through Study → Mock Test → Interview.
2. **Lean IA** — consolidate Progress/History/Community into a single Progress Hub.
3. **Premium iOS feel** — consistent layout, motion, and micro‑interactions.
4. **Burmese trust upgrade** — natural, culturally appropriate Burmese translation.
5. **Accuracy to USCIS 2025 guidance** — 120 questions, 20 per interview, pass at 12 correct, fail at 9 incorrect.
6. **Security posture** — reduce surface area for auth/notification abuse.

### Success Metrics
- +20% completion rate from Study → Mock Test → Interview flow.
- -25% first‑session drop‑off (dashboard exit within 60 seconds).
- +30% CTR on “Next Best Action” CTA on Dashboard.
- <1% user‑reported translation confusion in Burmese surveys.
- 100% UI copy aligned to USCIS 2025 question count and interview thresholds.
- 0 unauthorized push subscription writes (post‑hardening audit).

---

## 3) User Experience Principles
1. **Guided confidence:** always show the next best action.
2. **Trustworthy bilingual:** Burmese must be natural and empathetic, not literal.
3. **Premium playful:** iOS‑inspired motion, spacing, and micro‑interactions.
4. **Lean UI:** reduce cognitive overload; fewer competing calls‑to‑action.
5. **Accessibility:** supports text expansion and Burmese font rendering.

---

## 4) Scope

### In Scope
- Unified navigation for desktop and mobile.
- Dashboard simplification with “Next Best Action.”
- Progress Hub (Progress + History + Community).
- Update copy and logic for 120‑question bank and interview thresholds.
- Burmese translation QA process and UX fixes for text expansion.
- Security hardening for push subscription endpoints.

### Out of Scope
- New auth provider re‑architecture.
- Full redesign of every page outside core flow.
- New languages beyond English/Burmese.

---

## 5) Epics, Tickets, & Acceptance Criteria

### Epic A: Unified Navigation & IA
**Goal:** Consistent nav across desktop and mobile with a single learning path.

**Tickets**
1. **A1: Create unified navigation config**
   - **Description:** Define a shared nav configuration consumed by both desktop and mobile.
   - **Acceptance Criteria:**
     - Desktop and mobile nav render the same primary routes.
     - “More” menu only contains secondary actions.
     - One source of truth drives label + icon mapping.

2. **A2: Redesign route grouping**
   - **Description:** Re‑group routes into the primary learning path and a single Progress Hub.
   - **Acceptance Criteria:**
     - Primary tabs: Home, Study, Mock Test, Interview, Progress Hub, Settings.
     - Progress/History/Community are accessible inside Progress Hub.

---

### Epic B: Dashboard “Next Best Action”
**Goal:** Focus the dashboard on one primary CTA + 1–2 supporting insights.

**Tickets**
1. **B1: Replace multi‑CTA cluster with primary CTA**
   - **Description:** Add logic to choose the most relevant CTA (e.g., Continue Study, Take Mock Test, Resume Interview).
   - **Acceptance Criteria:**
     - Only one primary CTA appears above the fold.
     - CTA selection is based on recent user activity.

2. **B2: Add “Today’s Plan” block**
   - **Description:** Display 2–3 short tasks with time estimates.
   - **Acceptance Criteria:**
     - Tasks adapt to mastery gaps and last activity.
     - Clear bilingual presentation.

3. **B3: Collapse secondary analytics**
   - **Description:** Move deeper analytics into a collapsible section or Progress Hub link.
   - **Acceptance Criteria:**
     - Dashboard has <3 major sections in the first viewport.

---

### Epic C: Progress Hub Consolidation
**Goal:** One destination for Progress, History, and Community.

**Tickets**
1. **C1: Create Progress Hub page**
   - **Description:** Merge Progress + History + Community into one page with tabs.
   - **Acceptance Criteria:**
     - Tabs: Overview, History, Community.
     - Existing Progress charts and history lists are reused.

2. **C2: Add deep links for legacy routes**
   - **Description:** Redirect `/history` and `/social` to the correct tab.
   - **Acceptance Criteria:**
     - Navigating to `/history` lands on Progress Hub → History tab.
     - All existing links are updated.

---

### Epic D: Premium iOS‑Inspired UI System
**Goal:** Cohesive visual system and micro‑interactions.

**Tickets**
1. **D1: Design token alignment**
   - **Description:** Standardize radius, shadows, gradients, and spacing across core pages.
   - **Acceptance Criteria:**
     - Shared tokens applied to Dashboard, Progress Hub, Study, Test, Interview.
     - Reduced visual variance of card components.

2. **D2: Micro‑interaction patterns**
   - **Description:** Standardize hover/press states with consistent motion.
   - **Acceptance Criteria:**
     - Primary CTAs have subtle spring feedback.
     - Motion respects reduced‑motion settings.

---

### Epic E: Burmese Translation Trust Upgrade
**Goal:** Natural, culturally accurate Burmese; consistent UX for text expansion.

**Tickets**
1. **E1: Translation QA workflow**
   - **Description:** Establish a review process with bilingual reviewers or community QA.
   - **Acceptance Criteria:**
     - Translation glossary + tone guide created.
     - Translation issues tracked in a dedicated list.

2. **E2: Text expansion support**
   - **Description:** Adjust layouts for longer Burmese copy, avoid clipping.
   - **Acceptance Criteria:**
     - Key screens (Dashboard, Study, Test, Interview) render without overflow in Burmese mode.
     - UI supports multi‑line text without breaking layout.

3. **E3: Context‑sensitive translations**
   - **Description:** Replace hardcoded or literal Burmese in high‑impact UI copy.
   - **Acceptance Criteria:**
     - Burmese phrasing reviewed for top 20 user‑facing strings.
     - Bilingual copy maintains meaning, not word‑for‑word translation.

---

### Epic F: USCIS 2025 Question Bank & Interview Rules
**Goal:** Align data and UI with current USCIS guidance (120 questions, 20 interview questions).

**Tickets**
1. **F1: Expand question bank to 120**
   - **Description:** Add 20 new questions with bilingual answers and explanations.
   - **Acceptance Criteria:**
     - Total question count = 120.
     - New questions are categorized consistently with USCIS categories.

2. **F2: Update test/interview thresholds**
   - **Description:** Ensure pass/fail logic and UI reflect 20 questions, pass at 12, fail at 9.
   - **Acceptance Criteria:**
     - Mock test ends early at 12 correct or 9 incorrect.
     - UI copy matches the logic.

3. **F3: Replace hardcoded “100” references**
   - **Description:** Use a shared `totalQuestions` constant for all count‑based UI.
   - **Acceptance Criteria:**
     - No remaining “100 questions” references in UI copy.
     - Progress and badges are calculated from `totalQuestions`.

---

### Epic G: Security Hardening (Push Subscriptions)
**Goal:** Prevent unauthorized push subscription writes or deletes.

**Tickets**
1. **G1: Verify authenticated user in push subscription API**
   - **Description:** Validate JWT or session before accepting `userId`.
   - **Acceptance Criteria:**
     - Requests without valid auth are rejected.
     - Only authenticated user can write/delete their own subscription.

2. **G2: Add basic abuse prevention**
   - **Description:** Throttle subscription writes per userId.
   - **Acceptance Criteria:**
     - Rapid repeated writes are blocked or rate‑limited.

---

## 6) Risks & Mitigations
- **Risk:** Navigation changes confuse existing users.  
  **Mitigation:** Add a “What’s New” tour + update onboarding.

- **Risk:** Translation updates reduce consistency.  
  **Mitigation:** Create a Burmese style guide and glossary; require review.

- **Risk:** Progress Hub consolidation breaks deep links.  
  **Mitigation:** Add redirects and hash‑based tabs.

---

## 7) Rollout Plan
1. **Alpha:** Internal QA + Burmese reviewer pass on 20 key strings.
2. **Beta:** Limited release with feedback form enabled.
3. **General:** Full rollout with onboarding tooltip updates.

---

## 8) Open Questions
- Do we want **Progress Hub** to replace “Dashboard” as the default landing after login?
- Should we prioritize **Study vs. Interview** as the default “Next Best Action” when a user is inactive?
- Should Burmese translation QA include **community reviewers** via a trusted advisory group?

