# Phase 27: Gap Closure -- Timer Accessibility - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Add screen reader announcements to the overall mock test countdown timer (CircularTimer) at milestone thresholds, and resolve whether the overall timer gets WCAG 2.2.1 extension capability or is documented as an intentional USCIS simulation exception.

Per-question timer already has full accessibility (aria-live announcements at 5s, extension via TimerExtensionToast). This phase only addresses the OVERALL 20-minute mock test timer.

</domain>

<decisions>
## Implementation Decisions

### Timer milestone announcements
- Screen reader announces at exactly 5 minutes, 2 minutes, and 1 minute remaining (per ROADMAP success criteria)
- Use aria-live="assertive" for time warnings (matches per-question timer pattern from Phase 24)
- Announce fires at exactly the threshold value (not range) to avoid repeated announcements (established Phase 24 pattern: "sr-only announcement fires at exactly timeLeft === 5")
- Persistent sr-only div always in DOM (not inside AnimatePresence) for reliable screen reader announcements (Phase 24 pattern)
- Announcement text format: "{N} minutes remaining" -- simple, no Burmese (timer is numeric, screen readers handle numbers)
- Announcements work regardless of whether the visual timer is hidden (the hide/show toggle only affects visual display)

### Timer extension scope
- Overall mock test timer is documented as an intentional USCIS simulation exception -- no extension offered
- Rationale: The 20-minute limit simulates real USCIS interview conditions. The per-question timer already has extension (WCAG 2.2.1 satisfied at the question level). The overall timer is a test constraint, not a UI timeout.
- Document this in REQUIREMENTS.md or a code comment referencing WCAG 2.2.1 exception for "essential" timing (real-time events / assessment integrity)
- Practice mode already has no overall time limit (timer is only for Real Exam mode), which is an additional accommodation

### Claude's Discretion
- Whether to add announcements via a wrapper component around CircularTimer or inline in TestPage
- Whether to use useRef flags or conditional checks for one-shot announcement firing
- Exact wording of the WCAG exception documentation

</decisions>

<specifics>
## Specific Ideas

- Per-question timer pattern (PerQuestionTimer.tsx lines 61-69, 129) is the reference implementation for sr-only aria-live announcements -- follow same approach for overall timer
- Phase 24 established: "Callback refs synced via useEffect (not render-time assignment) for React Compiler safety" and "One-shot warning/expiry flags use refs accessed only inside setInterval callback"
- CircularTimer.tsx currently has zero aria attributes for time remaining -- needs sr-only region added

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 27-gap-closure-timer-a11y*
*Context gathered: 2026-02-18*
