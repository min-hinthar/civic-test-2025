'use client';

import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ExaminerCharacterProps {
  /** Current animation state of the examiner */
  state: 'idle' | 'speaking' | 'nodding' | 'listening';
  /** Size preset: sm=80px, md=120px, lg=160px */
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = { sm: 80, md: 120, lg: 160 } as const;

/**
 * Professional SVG examiner character with CSS keyframe animations.
 *
 * Features:
 * - Professional illustration: suited figure with head, shoulders, tie, USCIS badge
 * - 4 animation states: idle (breathing), speaking (mouth), nodding (head), listening (tilt)
 * - CSS keyframes only (no Lottie - saves 133KB per research)
 * - Respects prefers-reduced-motion
 * - Uses design tokens for colors
 */
export function ExaminerCharacter({ state, size = 'md' }: ExaminerCharacterProps) {
  const shouldReduceMotion = useReducedMotion();
  const px = SIZE_MAP[size];

  // Determine which animation class to apply to each group
  const animState = shouldReduceMotion ? 'idle' : state;

  return (
    <div
      className="relative mx-auto"
      style={{ width: px, height: px }}
      role="img"
      aria-label="USCIS examiner"
    >
      {/* Inline CSS keyframe animations */}
      <style>{`
        @keyframes examiner-breathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.02); }
        }
        @keyframes examiner-speak {
          0%, 100% { transform: scaleY(1); }
          30% { transform: scaleY(1.3); }
          60% { transform: scaleY(0.7); }
        }
        @keyframes examiner-nod {
          0% { transform: rotate(0deg); }
          30% { transform: rotate(-3deg); }
          60% { transform: rotate(2deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes examiner-listen-tilt {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes examiner-listen-breathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.01); }
        }
        .examiner-head-idle { }
        .examiner-chest-idle {
          animation: examiner-breathe 3s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .examiner-mouth-idle { }
        .examiner-head-speaking { }
        .examiner-chest-speaking {
          animation: examiner-breathe 3s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .examiner-mouth-speaking {
          animation: examiner-speak 0.4s ease-in-out infinite;
          transform-origin: center center;
        }
        .examiner-head-nodding {
          animation: examiner-nod 0.6s ease-in-out forwards;
          transform-origin: center bottom;
        }
        .examiner-chest-nodding {
          animation: examiner-breathe 3s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .examiner-mouth-nodding { }
        .examiner-head-listening {
          animation: examiner-listen-tilt 4s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .examiner-chest-listening {
          animation: examiner-listen-breathe 4s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .examiner-mouth-listening { }
      `}</style>

      <svg
        width={px}
        height={px}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle cx="80" cy="80" r="78" className="fill-primary-100 dark:fill-primary-50/10" />

        {/* Chest / shoulders group */}
        <g className={`examiner-chest-${animState}`}>
          {/* Suit jacket body */}
          <path
            d="M40 130 C40 105, 55 95, 80 95 C105 95, 120 105, 120 130 L120 160 L40 160 Z"
            className="fill-primary-700 dark:fill-primary-300"
          />
          {/* Suit lapels */}
          <path
            d="M65 95 L73 115 L80 105 L87 115 L95 95"
            className="stroke-primary-800 dark:stroke-primary-200"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Shirt collar visible between lapels */}
          <path d="M72 97 L80 110 L88 97" fill="hsl(0 0% 95%)" className="dark:fill-slate-200" />
          {/* Tie */}
          <path d="M78 105 L80 130 L82 105 Z" className="fill-patriotic dark:fill-red-400" />
          {/* Tie knot */}
          <circle cx="80" cy="104" r="2" className="fill-patriotic-red dark:fill-red-400" />

          {/* USCIS badge on left lapel */}
          <g transform="translate(52, 108)">
            <rect x="0" y="0" width="12" height="8" rx="1.5" className="fill-amber-500" />
            <rect x="1.5" y="1.5" width="9" height="5" rx="0.5" className="fill-amber-600" />
            <path d="M6 2.5 L7.5 4 L6 5.5 L4.5 4 Z" fill="hsl(0 0% 100%)" />
          </g>
        </g>

        {/* Neck */}
        <rect
          x="73"
          y="85"
          width="14"
          height="14"
          rx="4"
          fill="hsl(30 50% 75%)"
          className="dark:fill-amber-700"
        />

        {/* Head group */}
        <g className={`examiner-head-${animState}`}>
          {/* Head shape */}
          <ellipse
            cx="80"
            cy="60"
            rx="25"
            ry="30"
            fill="hsl(30 50% 75%)"
            className="dark:fill-amber-700"
          />

          {/* Hair */}
          <path
            d="M55 55 C55 35, 65 28, 80 28 C95 28, 105 35, 105 55 C105 48, 95 38, 80 38 C65 38, 55 48, 55 55 Z"
            className="fill-slate-600 dark:fill-slate-400"
          />

          {/* Left eye */}
          <ellipse cx="70" cy="58" rx="3" ry="2.5" className="fill-slate-900 dark:fill-slate-100" />
          {/* Right eye */}
          <ellipse cx="90" cy="58" rx="3" ry="2.5" className="fill-slate-900 dark:fill-slate-100" />

          {/* Eyebrows */}
          <path
            d="M65 53 Q70 50, 75 53"
            className="stroke-slate-600 dark:stroke-slate-400"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M85 53 Q90 50, 95 53"
            className="stroke-slate-600 dark:stroke-slate-400"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Nose */}
          <path
            d="M80 60 L78 68 L82 68"
            fill="none"
            stroke="hsl(30 30% 60%)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Mouth group */}
          <g className={`examiner-mouth-${animState}`}>
            {/* Friendly but professional slight smile */}
            <path
              d="M73 74 Q80 78, 87 74"
              stroke="hsl(10 30% 50%)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* Ears */}
          <ellipse
            cx="55"
            cy="60"
            rx="4"
            ry="6"
            fill="hsl(30 50% 72%)"
            className="dark:fill-amber-600"
          />
          <ellipse
            cx="105"
            cy="60"
            rx="4"
            ry="6"
            fill="hsl(30 50% 72%)"
            className="dark:fill-amber-600"
          />
        </g>
      </svg>
    </div>
  );
}
