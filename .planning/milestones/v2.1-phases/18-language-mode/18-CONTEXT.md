# Phase 18: Language Mode - Context

**Gathered:** 2026-02-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Consistent English-only / bilingual behavior across all 59 consuming components. Users set a global language mode (English or Myanmar) and every screen in the app respects it — English mode shows English only, Myanmar mode shows bilingual content (English + Burmese). No per-screen exceptions.

**Overrides from roadmap spec:**
- Roadmap SC#3 said "Interview simulation always runs in English-only mode regardless of toggle" — **overridden**: interview follows the global language mode like everything else.
- Roadmap SC#1 said "navbar excluded" — **overridden**: navigation follows the mode too. English mode = 100% English everywhere, zero exceptions.

</domain>

<decisions>
## Implementation Decisions

### Toggle UX & Placement
- **Dual placement:** Compact flag toggle in navbar + extended controls in settings page
- **Navbar position:** Far right, before settings icon
- **Flag style:** Custom SVG icons, rounded rectangle shape, 24px (same size as other nav icons)
- **Both flags always visible:** Active flag highlighted, inactive flag dimmed — user taps inactive flag to switch
- **Active state indicator:** Claude's discretion (opacity, ring, or border)
- **Switch animation:** Subtle bounce/highlight animation on the tapped flag before switching (not instant)
- **Brief spinner:** Tiny loading indicator on the flag for 100-200ms during switch for tactile feedback
- **Haptic feedback:** Light vibration on mobile devices when toggling
- **First-time tooltip:** One-time onboarding hint pointing at the flags (style at Claude's discretion — popover or toast)
- **Screen reader labels:** Accessible labels (e.g., "English mode active, switch to Myanmar")
- **Default mode:** Myanmar (bilingual) — target audience is Burmese immigrants
- **Settings page:** Extended controls with explanation text describing what each mode does (e.g., "English mode hides all Burmese text")
- **Settings preview:** Claude's discretion on whether to include inline preview
- **Navbar visibility during tests:** Claude's discretion on whether to hide toggle during active sessions

### English-Only Behavior
- **100% English, zero exceptions:** English mode means English text only on ALL screens — test, practice, flashcard, dashboard, study guide, interview, navigation, categories, explanations, toasts, modals, error messages
- **No bilingual exceptions:** No UI strings remain bilingual in English mode (not even app title or nav labels)
- **Category names:** English-only in English mode (hide Burmese part of "American Government / အမေရိကန်အစိုးရ")
- **TTS matches mode:** In English mode, TTS reads English only; in Myanmar mode, TTS reads both languages
- **Font loading:** Always load Padauk font regardless of mode (instant switching, no lazy-load delay)
- **Data handling:** Claude's discretion — don't render vs filter at source (pick simplest/most maintainable)
- **Bilingual layout:** In Myanmar mode, English text first, Burmese translation below
- **Burmese text styling in bilingual mode:** Claude's discretion based on existing design system
- **USCIS simulation message:** Shown every time before mock test AND interview when in English mode, saying "This simulates the real USCIS test — questions are in English only"
- **USCIS message language:** Follows current mode (bilingual in Myanmar mode, English-only in English mode)

### Transition & Switching
- **Scroll position:** Preserved when switching language — content changes around the user
- **Mid-session switching:** Claude's discretion on whether to block/warn/allow during active tests
- **Content transition:** Claude's discretion on fade vs instant swap
- **Layout shift animation:** Brief placeholder shimmer/collapse where Burmese text appears or disappears
- **Animation scope:** Claude's discretion — per-element or page-level transition
- **TTS during switch:** If TTS is playing, finish current utterance then future TTS follows new mode
- **Switch confirmation:** Claude's discretion on whether flag animation alone is sufficient or needs toast
- **Rapid toggle debounce:** Claude's discretion
- **Multi-tab sync:** Claude's discretion based on existing state management patterns
- **Cached content reactivity:** Claude's discretion — immediate update or on next navigation
- **HTML lang attribute:** Claude's discretion based on accessibility best practices
- **Keyboard shortcut:** Claude's discretion
- **URL state:** Claude's discretion on whether language mode belongs in URL params
- **Analytics:** Track language preference and mode switches

### Interview Behavior (NO Exception)
- **No special interview mode:** Interview follows global language mode exactly like every other screen
- **English mode interview:** English-only questions, English-only feedback, English-only instructions, USCIS simulation message shown before start
- **Myanmar mode interview:** Bilingual questions (English + Burmese), bilingual feedback, bilingual instructions
- **Interview TTS:** Always English TTS for the examiner's spoken questions, even in Myanmar mode (because the real USCIS interview is spoken in English)
- **Interview STT:** Always English speech-to-text recognition regardless of language mode (answers must be in English)
- **Burmese question display:** In Myanmar mode, Burmese translation appears simultaneously with English text as TTS plays
- **Answer prompt in Myanmar mode:** Include Burmese guidance hint like "Answer in English" alongside the translated prompt
- **Examiner label:** "USCIS Officer" translated to bilingual in Myanmar mode
- **Interview results:** Follow language mode
- **Interview analytics:** Track which language mode was active during each session

### Claude's Discretion
- Active flag visual indicator style (opacity, ring, or border)
- Toggle visibility during active test/practice sessions
- Content transition animation (fade vs instant)
- Layout shift handling approach
- Switch confirmation feedback (flag animation alone or toast)
- Rapid toggle debounce implementation
- Multi-tab language sync behavior
- Cached content update timing
- HTML lang attribute handling
- Keyboard shortcut for language toggle
- URL state for language mode
- Data handling approach (don't render vs filter)
- Burmese text visual differentiation in bilingual mode
- Settings page preview inclusion
- First-time tooltip style (popover vs toast)
- Animation scope (per-element vs page-level)

### Persistence
- Language preference persists across sessions (Claude decides mechanism — existing settings context or localStorage)

</decisions>

<specifics>
## Specific Ideas

- Flag icons should be custom SVG rounded rectangles at 24px — consistent with other nav icons, not emoji
- "I want both flags always visible side by side, with the active one highlighted" — like a mini segmented control but with flags
- USCIS simulation message should appear both before mock test AND interview in English mode — reinforces the real-test feel
- In interview Myanmar mode, show Burmese translation simultaneously while English TTS plays — user reads while listening
- Include Burmese guidance "Answer in English" in the answer prompt during Myanmar-mode interview
- Light haptic vibration on mobile when toggling language

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 18-language-mode*
*Context gathered: 2026-02-13*
