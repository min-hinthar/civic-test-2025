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

**Context:** When auditing `.font-myanmar` usage, searching only for the class name misses Myanmar Unicode text that should have the class but doesn't.

**Learning:** Search for both:
1. `font-myanmar` (existing class usage)
2. Myanmar Unicode range `[\u1000-\u109F]` (text that needs the class)

**Apply when:** Running font audits or adding Myanmar text to new components.
