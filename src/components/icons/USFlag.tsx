/**
 * Simplified US flag SVG component.
 * 24px rounded-rectangle design, recognizable at small sizes.
 */
export function USFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* White background with rounded corners */}
      <rect width="24" height="16" rx="2" fill="#fff" />

      {/* Red stripes (7 red, 6 white = 13 stripes) */}
      {/* Each stripe is 16/13 ≈ 1.23px tall, simplified to ~1.23 */}
      <rect y="0" width="24" height="1.23" rx="2" fill="#B22234" />
      <rect y="2.46" width="24" height="1.23" fill="#B22234" />
      <rect y="4.92" width="24" height="1.23" fill="#B22234" />
      <rect y="7.38" width="24" height="1.23" fill="#B22234" />
      <rect y="9.85" width="24" height="1.23" fill="#B22234" />
      <rect y="12.31" width="24" height="1.23" fill="#B22234" />
      <rect y="14.77" width="24" height="1.23" fill="#B22234" />

      {/* Blue canton */}
      <rect x="0" y="0" width="10" height="8.62" rx="2" fill="#3C3B6E" />

      {/* Simplified stars (3x2 grid of small dots) */}
      <circle cx="2.5" cy="2" r="0.6" fill="#fff" />
      <circle cx="5" cy="2" r="0.6" fill="#fff" />
      <circle cx="7.5" cy="2" r="0.6" fill="#fff" />
      <circle cx="2.5" cy="4.3" r="0.6" fill="#fff" />
      <circle cx="5" cy="4.3" r="0.6" fill="#fff" />
      <circle cx="7.5" cy="4.3" r="0.6" fill="#fff" />
      <circle cx="2.5" cy="6.6" r="0.6" fill="#fff" />
      <circle cx="5" cy="6.6" r="0.6" fill="#fff" />
      <circle cx="7.5" cy="6.6" r="0.6" fill="#fff" />

      {/* Outer border for definition */}
      <rect
        width="24"
        height="16"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.1"
        strokeWidth="0.5"
      />
    </svg>
  );
}
