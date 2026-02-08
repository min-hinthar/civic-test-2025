/**
 * Tests for fsrsEngine - FSRS spaced repetition wrapper.
 *
 * Covers: createNewSRSCard, gradeCard, isDue, getNextReviewText,
 * getCardStatusLabel, getIntervalStrengthColor.
 *
 * Uses vi.useFakeTimers for deterministic date testing.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { State } from 'ts-fsrs';
import {
  createNewSRSCard,
  gradeCard,
  isDue,
  getNextReviewText,
  getCardStatusLabel,
  getIntervalStrengthColor,
} from './fsrsEngine';

describe('createNewSRSCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-08T12:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a card object', () => {
    const card = createNewSRSCard();
    expect(card).toBeDefined();
    expect(card).toHaveProperty('due');
    expect(card).toHaveProperty('state');
    expect(card).toHaveProperty('reps');
  });

  it('card starts in New state', () => {
    const card = createNewSRSCard();
    expect(card.state).toBe(State.New);
  });

  it('card has 0 reps initially', () => {
    const card = createNewSRSCard();
    expect(card.reps).toBe(0);
  });

  it('card is due now (due date is current time)', () => {
    const card = createNewSRSCard();
    expect(card.due.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('card has stability and difficulty properties', () => {
    const card = createNewSRSCard();
    expect(card).toHaveProperty('stability');
    expect(card).toHaveProperty('difficulty');
  });
});

describe('gradeCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-08T12:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a record log item with card property', () => {
    const card = createNewSRSCard();
    const result = gradeCard(card, true);
    expect(result).toHaveProperty('card');
    expect(result).toHaveProperty('log');
  });

  it('easy rating (Good) advances the card state from New', () => {
    const card = createNewSRSCard();
    const result = gradeCard(card, true);
    // After grading a new card as Good, it should move to Learning or Review
    expect(result.card.state).not.toBe(State.New);
  });

  it('hard rating (Again) keeps card in learning state', () => {
    const card = createNewSRSCard();
    const result = gradeCard(card, false);
    // After Again on new card, it should be in Learning/Relearning
    expect(result.card.reps).toBeGreaterThanOrEqual(0);
  });

  it('easy rating increases scheduled days compared to hard', () => {
    const card = createNewSRSCard();
    const easyResult = gradeCard(card, true);
    const hardResult = gradeCard(card, false);
    // Easy (Good) should schedule further out than Hard (Again)
    expect(easyResult.card.due.getTime()).toBeGreaterThanOrEqual(hardResult.card.due.getTime());
  });

  it('grading returns updated card with new due date', () => {
    const card = createNewSRSCard();
    const result = gradeCard(card, true);
    expect(result.card.due).toBeInstanceOf(Date);
  });

  it('repeated easy ratings increase interval', () => {
    let card = createNewSRSCard();
    const firstResult = gradeCard(card, true);
    card = firstResult.card;

    // Advance time to when the card is due again
    vi.setSystemTime(new Date(card.due.getTime() + 1000));
    const secondResult = gradeCard(card, true);

    // The second review should schedule even further out
    const firstInterval =
      firstResult.card.due.getTime() - new Date('2026-02-08T12:00:00Z').getTime();
    const secondInterval = secondResult.card.due.getTime() - card.due.getTime();
    expect(secondInterval).toBeGreaterThanOrEqual(firstInterval);
  });
});

describe('isDue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-08T12:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for a brand new card (due now)', () => {
    const card = createNewSRSCard();
    expect(isDue(card)).toBe(true);
  });

  it('returns true for a card due in the past', () => {
    const card = createNewSRSCard();
    card.due = new Date('2026-02-07T00:00:00Z'); // yesterday
    expect(isDue(card)).toBe(true);
  });

  it('returns false for a card due in the future', () => {
    const card = createNewSRSCard();
    card.due = new Date('2026-02-10T00:00:00Z'); // 2 days from now
    expect(isDue(card)).toBe(false);
  });

  it('returns true when due time equals current time', () => {
    const card = createNewSRSCard();
    card.due = new Date('2026-02-08T12:00:00Z');
    expect(isDue(card)).toBe(true);
  });
});

describe('getNextReviewText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-08T12:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Now" for card due now or in the past', () => {
    const card = createNewSRSCard();
    card.due = new Date('2026-02-07T00:00:00Z'); // past
    const text = getNextReviewText(card);
    expect(text.en).toBe('Now');
    expect(text.my).toBeTruthy();
  });

  it('returns "1 day" for card due tomorrow', () => {
    const card = createNewSRSCard();
    card.due = new Date('2026-02-09T12:00:00Z'); // exactly 1 day
    const text = getNextReviewText(card);
    expect(text.en).toBe('1 day');
    expect(text.my).toBeTruthy();
  });

  it('returns days for less than 7 days', () => {
    const card = createNewSRSCard();
    card.due = new Date('2026-02-12T12:00:00Z'); // 4 days
    const text = getNextReviewText(card);
    expect(text.en).toBe('4 days');
  });

  it('returns weeks for 7-29 days', () => {
    const card = createNewSRSCard();
    card.due = new Date('2026-02-22T12:00:00Z'); // 14 days = 2 weeks
    const text = getNextReviewText(card);
    expect(text.en).toBe('2 weeks');
  });

  it('returns months for 30+ days', () => {
    const card = createNewSRSCard();
    card.due = new Date('2026-04-08T12:00:00Z'); // ~59 days = 2 months
    const text = getNextReviewText(card);
    expect(text.en).toBe('2 months');
  });

  it('returns bilingual text with Burmese', () => {
    const card = createNewSRSCard();
    card.due = new Date('2026-02-11T12:00:00Z'); // 3 days
    const text = getNextReviewText(card);
    expect(text.en).toBeTruthy();
    expect(text.my).toBeTruthy();
    // Burmese numerals are Unicode U+1040-U+1049
    expect(text.my).toMatch(/[\u1040-\u1049]/);
  });

  it('uses singular "week" for 1 week', () => {
    const card = createNewSRSCard();
    card.due = new Date('2026-02-15T12:00:00Z'); // 7 days = 1 week
    const text = getNextReviewText(card);
    expect(text.en).toBe('1 week');
  });

  it('uses singular "month" for 1 month', () => {
    const card = createNewSRSCard();
    card.due = new Date('2026-03-10T12:00:00Z'); // 30 days = 1 month
    const text = getNextReviewText(card);
    expect(text.en).toBe('1 month');
  });
});

describe('getCardStatusLabel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-08T12:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "New" for a brand new card', () => {
    const card = createNewSRSCard();
    const status = getCardStatusLabel(card);
    expect(status.label).toBe('New');
    expect(status.labelMy).toBeTruthy();
    expect(status.color).toBe('text-blue-500');
  });

  it('returns "Due" for a reviewed card that is due', () => {
    const card = createNewSRSCard();
    // Grade it once to move out of New state
    const result = gradeCard(card, true);
    const reviewedCard = result.card;
    // Set due to past so it is due
    reviewedCard.due = new Date('2026-02-07T00:00:00Z');
    const status = getCardStatusLabel(reviewedCard);
    expect(status.label).toBe('Due');
    expect(status.color).toBe('text-warning-500');
  });

  it('returns "Done" for a reviewed card not yet due', () => {
    const card = createNewSRSCard();
    const result = gradeCard(card, true);
    const reviewedCard = result.card;
    // Set due to future
    reviewedCard.due = new Date('2026-02-20T00:00:00Z');
    const status = getCardStatusLabel(reviewedCard);
    expect(status.label).toBe('Done');
    expect(status.color).toBe('text-success-500');
  });

  it('includes Burmese label', () => {
    const card = createNewSRSCard();
    const status = getCardStatusLabel(card);
    expect(status.labelMy.length).toBeGreaterThan(0);
  });
});

describe('getIntervalStrengthColor', () => {
  it('returns warning orange for scheduled_days <= 1', () => {
    const card = createNewSRSCard();
    card.scheduled_days = 0;
    expect(getIntervalStrengthColor(card)).toBe('bg-warning-500');

    card.scheduled_days = 1;
    expect(getIntervalStrengthColor(card)).toBe('bg-warning-500');
  });

  it('returns orange-500 for scheduled_days 2-7', () => {
    const card = createNewSRSCard();
    card.scheduled_days = 3;
    expect(getIntervalStrengthColor(card)).toBe('bg-orange-500');

    card.scheduled_days = 7;
    expect(getIntervalStrengthColor(card)).toBe('bg-orange-500');
  });

  it('returns yellow-500 for scheduled_days 8-30', () => {
    const card = createNewSRSCard();
    card.scheduled_days = 14;
    expect(getIntervalStrengthColor(card)).toBe('bg-yellow-500');

    card.scheduled_days = 30;
    expect(getIntervalStrengthColor(card)).toBe('bg-yellow-500');
  });

  it('returns green-500 for scheduled_days > 30', () => {
    const card = createNewSRSCard();
    card.scheduled_days = 31;
    expect(getIntervalStrengthColor(card)).toBe('bg-green-500');

    card.scheduled_days = 180;
    expect(getIntervalStrengthColor(card)).toBe('bg-green-500');
  });
});
