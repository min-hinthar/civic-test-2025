# Architecture

**Analysis Date:** 2026-02-05

## Pattern Overview

**Overall:** Next.js hybrid architecture with React Router client-side routing, Context API state management, and Supabase backend integration.

**Key Characteristics:**
- Next.js Pages Router with catch-all route (`pages/[[...slug]].tsx`) delegating to client-side SPA
- Client-side React Router for navigation (not Next.js routing)
- Context API for authentication and theme state
- Supabase PostgreSQL database with real-time auth
- Type-safe TypeScript with strict mode enabled
- Bilingual (English/Burmese) UI throughout

## Layers

**Presentation Layer (Components):**
- Purpose: UI components and page containers
- Location: `src/components/`, `src/pages/`
- Contains: Page components (Dashboard, TestPage, etc.), UI primitives (SpeechButton), navigation (AppNavigation), auth components (ProtectedRoute, GoogleOneTapSignIn)
- Depends on: React Router, Contexts, custom hooks, UI libraries (lucide-react, recharts)
- Used by: Next.js pages route handler

**State Management Layer (Contexts):**
- Purpose: Global state and side effects
- Location: `src/contexts/`
- Contains: `SupabaseAuthContext` (user auth, test session persistence), `ThemeContext` (light/dark mode)
- Depends on: Supabase client, React hooks
- Used by: All page components and UI components

**Data & Integration Layer:**
- Purpose: External service clients and data transformation
- Location: `src/lib/`
- Contains: `supabaseClient.ts` (Supabase initialization), custom hooks (`useSpeechSynthesis`, `useViewportHeight`, `useAuth`), `nativeBridge.ts` (mobile integration)
- Depends on: Supabase SDK, browser APIs (Web Speech API)
- Used by: Contexts and page components

**Constants & Types:**
- Purpose: Shared data definitions and type safety
- Location: `src/constants/civicsQuestions.ts`, `src/types/index.ts`
- Contains: 100+ civic test questions with bilingual text, type definitions for Question, TestSession, User
- Depends on: None
- Used by: TestPage, StudyGuidePage, SupabaseAuthContext

**Styles:**
- Purpose: Global styling and theming
- Location: `src/styles/globals.css`
- Contains: Tailwind CSS configuration, CSS variables for theme, utility classes
- Depends on: Tailwind CSS, PostCSS
- Used by: All components via className

## Data Flow

**User Authentication:**

1. User navigates to `/` (LandingPage)
2. If not authenticated, app shows public content
3. User clicks "Sign In" → routes to `/auth` (AuthPage)
4. AuthPage accepts email/password OR Google OAuth credential
5. `login()` or `loginWithGoogleIdToken()` called from `SupabaseAuthContext`
6. Supabase auth service validates credentials, returns session
7. Context triggers `hydrateFromSupabase()` to fetch user profile and test history
8. User state updated in context, protected routes become accessible

**Test Session Creation & Persistence:**

1. User navigates to `/test` (TestPage)
2. `civicsQuestions` shuffled and 20 random questions selected
3. Questions displayed with timed countdown (20 minutes)
4. Each answer creates a `QuestionResult` object added to `results[]`
5. Timer or answer threshold triggers end condition (passThreshold=12 correct, failThreshold=9 incorrect, time limit, or all 20 answered)
6. Test marked as finished, `TestEndReason` set
7. User clicks "Save Test" → `saveTestSession()` called
8. Context creates `mock_tests` record in Supabase with user_id
9. For each question result, creates `mock_test_responses` record
10. Context refetches user history and updates local state
11. User can navigate to `/history` to view all test sessions

**Data Retrieval for Dashboard:**

1. Dashboard component mounts
2. Calls `useAuth()` to get current user and `testHistory` (already hydrated)
3. Transforms test history into analytics:
   - Calculates total questions answered, overall accuracy, best score
   - Aggregates results by category to find strengths/blind spots
   - Counts "mastered" categories (100% correct)
4. Displays metrics as cards with links to drill down by category

**Study Guide Navigation:**

1. User navigates to `/study?category=System%20of%20Government`
2. StudyGuidePage filters `civicsQuestions` by category
3. Displays flashcard-style UI with bilingual question/answers
4. State maintains flipped cards locally (no persistence)
5. SpeechButton on each card triggers `useSpeechSynthesis` to read text aloud
6. Voice language selected automatically (English vs Burmese)

**State Management:**

- **Authentication state**: Managed in `SupabaseAuthContext`, persists across page navigations via Supabase session
- **Theme state**: Managed in `ThemeContext`, persisted to localStorage
- **Page state**: Local component state (e.g., TestPage's `timeLeft`, `currentIndex`, `results`)
- **Server state**: Supabase PostgreSQL (user profiles, mock tests, test responses)

## Key Abstractions

**User Type:**
- Purpose: Represents authenticated user identity and test history
- Examples: `src/types/index.ts` - `interface User { id, email, name, testHistory }`
- Pattern: Loaded once on auth, maintained in context, enriched with test history on every session change

**TestSession Type:**
- Purpose: Encapsulates a single mock test attempt with results
- Examples: `src/types/index.ts` - `interface TestSession { id, date, score, totalQuestions, passed, results }`
- Pattern: Created in memory during test, persisted to Supabase, retrieved for history/analytics

**Question & Answer Types:**
- Purpose: Type-safe representation of civic questions with bilingual content
- Examples: `src/types/index.ts`, `src/constants/civicsQuestions.ts`
- Pattern: Single source of truth in constants, immutable, used for validation in TestPage

**AuthContextValue:**
- Purpose: Provides auth operations and state to entire app
- Examples: `src/contexts/SupabaseAuthContext.tsx`
- Pattern: Custom hook `useAuth()` enforces context usage within provider boundary

**ThemeContextValue:**
- Purpose: Theme switching and persistence
- Examples: `src/contexts/ThemeContext.tsx`
- Pattern: Custom hook `useThemeContext()` with localStorage fallback

## Entry Points

**Next.js Page Route:**
- Location: `pages/[[...slug]].tsx`
- Triggers: Browser requests to any path
- Responsibilities: Renders AppShell component with SSR disabled (`dynamic(..., { ssr: false })`)

**AppShell Component:**
- Location: `src/AppShell.tsx`
- Triggers: Dynamic import from catch-all route
- Responsibilities: Wraps app in ThemeProvider and AuthProvider contexts, sets up React Router with all Routes, renders Toaster for notifications

**_app.tsx:**
- Location: `pages/_app.tsx`
- Triggers: Next.js initialization
- Responsibilities: Loads global CSS, renders Component with pageProps

**Protected Routes:**
- Location: `src/components/ProtectedRoute.tsx`
- Triggers: Navigation to `/dashboard`, `/test`, `/study`, `/history`
- Responsibilities: Checks `useAuth()` loading and user state; redirects to `/auth` if not authenticated

## Error Handling

**Strategy:** Combination of try-catch in async operations, error state in contexts, and user-facing toast notifications.

**Patterns:**

- **Auth errors** (`SupabaseAuthContext`): Set in `authError` state, thrown to caller, displayed via error toast in AuthPage
  - Example: `setAuthError(error.message)` then UI checks `authError` to display "Invalid credentials"

- **Test session save errors** (`SupabaseAuthContext`): Caught in `saveTestSession()`, logged, re-thrown to caller; TestPage shows error toast
  - Example: `catch (error) { console.error('Failed to save mock test session', error); throw error; }`

- **Missing Supabase credentials**: Thrown at module load in `supabaseClient.ts`
  - Example: `if (!supabaseUrl || !supabaseAnonKey) { throw new Error('Missing Supabase environment variables'); }`

- **Missing context provider**: Thrown at hook call time
  - Example: `useAuth()` and `useThemeContext()` check for undefined context and throw descriptive error

- **Speech synthesis**: Gracefully degrades if not supported (SpeechButton disables when `isSupported === false`)

## Cross-Cutting Concerns

**Logging:** `console.error()` in catch blocks for debugging (e.g., SupabaseAuthContext). No structured logging library.

**Validation:**
- Type safety via TypeScript strict mode
- Runtime validation: Question category enum, TestEndReason discriminated union
- Form validation in AuthPage (email/password checks, password reset token validation)

**Authentication:**
- Supabase Auth handles session management (OAuth, email/password, password reset)
- SupabaseAuthContext hydrates user on mount via `getSession()` and listens to `onAuthStateChange()`
- Protected routes check user state before rendering
- Session persisted in browser storage by Supabase SDK

**Bilingual Support:**
- All Question/Answer types have `text_en` and `text_my` fields
- UI components conditionally render English and Burmese text (e.g., in AppNavigation, Dashboard)
- SpeechSynthesis with language selection (English vs Burmese Myanmar)
- CSS class `font-myanmar` applies Burmese typography

**Performance:**
- React Router lazy routing (no code splitting explicitly configured)
- `useMemo()` on questions shuffle in TestPage to prevent re-randomization
- `useMemo()` on analytics calculations in Dashboard (category breakdown)
- Supabase query selection limits returned fields to reduce payload

---

*Architecture analysis: 2026-02-05*
