/**
 * FSRS Engine - Thin wrapper over ts-fsrs for the spaced repetition system.
 *
 * Provides card creation, binary grading (Easy/Hard), due-date checks,
 * bilingual next-review text, card status labels, and interval strength colors.
 *
 * The FSRS instance is a module-level singleton (stateless scheduler,
 * expensive to create -- no reason to instantiate per-component).
 */

import { createEmptyCard, fsrs, Rating, State, type Card, type RecordLogItem } from 'ts-fsrs';

// ---------------------------------------------------------------------------
// FSRS singleton with sensible defaults
// ---------------------------------------------------------------------------

const f = fsrs({
  enable_fuzz: true, // slight randomness to prevent review clustering
  enable_short_term: true, // allow same-day re-review for learning cards
  maximum_interval: 365, // cap at 1 year for civics test prep context
});

// ---------------------------------------------------------------------------
// Card creation
// ---------------------------------------------------------------------------

/** Create a brand-new FSRS card with default state (New, due now). */
export function createNewSRSCard(): Card {
  return createEmptyCard(new Date());
}

// ---------------------------------------------------------------------------
// Grading
// ---------------------------------------------------------------------------

/**
 * Grade a card with binary Easy/Hard rating.
 *
 * CRITICAL mapping:
 * - Easy  -> Rating.Good  (successful recall, increase interval)
 * - Hard  -> Rating.Again (failed recall, reset to learning)
 *
 * Do NOT use Rating.Hard -- in FSRS it means "successful but difficult"
 * which still increases the interval. Rating.Again is the only true failure.
 */
export function gradeCard(card: Card, isEasy: boolean): RecordLogItem {
  const rating = isEasy ? Rating.Good : Rating.Again;
  return f.next(card, new Date(), rating);
}

// ---------------------------------------------------------------------------
// Due check
// ---------------------------------------------------------------------------

/** Check whether a card is currently due for review. */
export function isDue(card: Card): boolean {
  return card.due <= new Date();
}

// ---------------------------------------------------------------------------
// Burmese numeral helpers
// ---------------------------------------------------------------------------

const BURMESE_DIGITS = [
  '\u1040', // 0
  '\u1041', // 1
  '\u1042', // 2
  '\u1043', // 3
  '\u1044', // 4
  '\u1045', // 5
  '\u1046', // 6
  '\u1047', // 7
  '\u1048', // 8
  '\u1049', // 9
];

function toBurmeseNumeral(n: number): string {
  return String(n)
    .split('')
    .map(ch => BURMESE_DIGITS[Number(ch)] ?? ch)
    .join('');
}

// ---------------------------------------------------------------------------
// Next review text (bilingual)
// ---------------------------------------------------------------------------

/**
 * Generate bilingual text describing when the next review is due.
 *
 * Returns both English and Burmese (Myanmar) text with Burmese numerals.
 */
export function getNextReviewText(card: Card): { en: string; my: string } {
  const diffMs = card.due.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { en: 'Now', my: '\u101A\u1001\u102F' }; // ယခု
  }
  if (diffDays === 1) {
    return {
      en: '1 day',
      my: `${toBurmeseNumeral(1)} \u101B\u1000\u103A`, // ၁ ရက်
    };
  }
  if (diffDays < 7) {
    return {
      en: `${diffDays} days`,
      my: `${toBurmeseNumeral(diffDays)} \u101B\u1000\u103A`, // X ရက်
    };
  }
  if (diffDays < 30) {
    const weeks = Math.round(diffDays / 7);
    return {
      en: `${weeks} week${weeks > 1 ? 's' : ''}`,
      my: `${toBurmeseNumeral(weeks)} \u1015\u1010\u103A`, // X ပတ်
    };
  }

  const months = Math.round(diffDays / 30);
  return {
    en: `${months} month${months > 1 ? 's' : ''}`,
    my: `${toBurmeseNumeral(months)} \u101C`, // X လ
  };
}

// ---------------------------------------------------------------------------
// Card status label (bilingual)
// ---------------------------------------------------------------------------

/**
 * Map a card's state to a UI label with bilingual text and color.
 *
 * - New  (blue-500):    card has never been reviewed
 * - Due  (warning-500): card is due for review
 * - Done (success-500): card is reviewed and not yet due
 */
export function getCardStatusLabel(card: Card): {
  label: string;
  labelMy: string;
  color: string;
} {
  if (card.state === State.New && card.reps === 0) {
    return {
      label: 'New',
      labelMy: '\u1021\u101E\u1005\u103A', // အသစ်
      color: 'text-blue-500',
    };
  }
  if (card.due <= new Date()) {
    return {
      label: 'Due',
      labelMy: '\u1015\u103C\u1014\u103A\u101C\u100A\u103A\u101B\u1014\u103A', // ပြန်လည်ရန်
      color: 'text-warning-500',
    };
  }
  return {
    label: 'Done',
    labelMy: '\u1015\u103C\u102E\u1038\u1006\u102F\u1036\u1038', // ပြီးဆုံး
    color: 'text-success-500',
  };
}

// ---------------------------------------------------------------------------
// Interval strength color
// ---------------------------------------------------------------------------

/**
 * Return a Tailwind background class based on the card's scheduled interval.
 *
 * - <= 1 day:  warning orange (learning / weak)
 * - <= 7 days: orange (short interval)
 * - <= 30 days: yellow (medium retention)
 * - > 30 days: green  (strong retention)
 */
export function getIntervalStrengthColor(card: Card): string {
  const { scheduled_days } = card;
  if (scheduled_days <= 1) return 'bg-warning-500';
  if (scheduled_days <= 7) return 'bg-orange-500';
  if (scheduled_days <= 30) return 'bg-yellow-500';
  return 'bg-green-500';
}
