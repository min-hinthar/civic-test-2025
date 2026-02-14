/**
 * Simplified Myanmar flag SVG component.
 * 24px rounded-rectangle design with yellow/green/red stripes and white star.
 */
export function MyanmarFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Clipping mask for rounded corners */}
      <defs>
        <clipPath id="myanmar-clip">
          <rect width="24" height="16" rx="2" />
        </clipPath>
      </defs>

      <g clipPath="url(#myanmar-clip)">
        {/* Yellow stripe (top third) */}
        <rect y="0" width="24" height="5.33" fill="#FECB32" />

        {/* Green stripe (middle third) */}
        <rect y="5.33" width="24" height="5.34" fill="#34B233" />

        {/* Red stripe (bottom third) */}
        <rect y="10.67" width="24" height="5.33" fill="#EA2839" />

        {/* White 5-pointed star (centered) */}
        <polygon
          points="12,3 13.18,6.63 17,6.63 13.91,8.87 15.09,12.5 12,10.26 8.91,12.5 10.09,8.87 7,6.63 10.82,6.63"
          fill="#fff"
        />
      </g>

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
