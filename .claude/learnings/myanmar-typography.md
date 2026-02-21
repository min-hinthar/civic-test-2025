# Myanmar Typography

## Minimum Font Size and Line Height for Myanmar Script

**Context:** Phase 29 added a `text-caption` Tailwind size (`0.625rem` / 10px) with `letter-spacing: 0.01em` and tight `line-height: 0.875rem`. Myanmar text at 10px was barely readable, letter-spacing disrupted glyph connections, and tight line-height clipped tall Myanmar characters.

**Learning:** Myanmar script has strict typographic requirements:
- **Minimum font size**: 12px (`0.75rem`). Below this, complex glyphs become illegible.
- **Line height**: At least 1.6 (not a fixed rem value). Myanmar glyphs are taller than Latin.
- **Letter spacing**: Never add positive letter-spacing — Myanmar is an abugida where characters connect visually. Even `0.01em` disrupts readability.

**Fix applied:**
```css
/* In .font-myanmar */
font-size: max(0.75rem, 1em); /* Floor at 12px, inherit parent if larger */
line-height: 1.6;             /* Was 1.4, tall glyphs need room */
```
```javascript
// In tailwind.config.js text-caption
caption: ['0.625rem', { lineHeight: '1rem' }], // Removed letterSpacing: '0.01em'
```

The `max(0.75rem, 1em)` pattern is key — it provides a 12px floor while allowing the font to grow with its container's font-size.

**Apply when:** Creating new Tailwind font-size entries, modifying `.font-myanmar` styles, or adding letter-spacing to any text size that Myanmar script might use.

## Myanmar Font Audit Requires Multiple Search Passes

**Context:** When auditing `.font-myanmar` usage, searching only for the class name misses Myanmar Unicode text that should have the class but doesn't. This has recurred in EVERY phase that touches UI — Phase 9 needed 2 rounds (10 → 38 more), Phase 37 needed 3 rounds (9 → 6 → 3 more across 10 files).

**Learning:** A single audit pass ALWAYS misses locations. Do a comprehensive sweep from the start:
1. Search `font-myanmar` (existing class usage — verify correctness)
2. Search Myanmar Unicode range `[\u1000-\u109F]` across ALL `.tsx` files (not just recently changed)
3. Check widget headers, stat labels, banners, session cards, heatmap labels, badge text, resume cards
4. Check components that receive Myanmar text via props but render without `font-myanmar`

Common miss categories:
- **Session/resume cards** (ResumeSessionCard labels)
- **Social widgets** (BadgeHighlights, StreakHeatmap day/month labels)
- **SRS widgets** (ReviewHeatmap day labels — need `showBurmese` prop plumbing)
- **Landing page** CTA links with Myanmar text
- **Settings page** button labels

**Apply when:** Running font audits, adding Myanmar text to new components, or any UI polish phase.
