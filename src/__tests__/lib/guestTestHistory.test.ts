/**
 * Unit tests for the guest (no-account) mock-test history store.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getGuestTestHistory,
  addGuestTestSession,
  clearGuestTestHistory,
} from '@/lib/testHistory/guestTestHistory';
import type { TestSession } from '@/types';

const baseSession: Omit<TestSession, 'id'> = {
  date: '2026-06-30T00:00:00.000Z',
  score: 18,
  totalQuestions: 20,
  durationSeconds: 300,
  passed: true,
  incorrectCount: 2,
  endReason: 'complete',
  results: [],
};

describe('guestTestHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty array when nothing is stored', () => {
    expect(getGuestTestHistory()).toEqual([]);
  });

  it('persists an added session with a generated id', () => {
    const list = addGuestTestSession(baseSession);
    expect(list).toHaveLength(1);
    expect(list[0].id).toMatch(/^guest-/);
    expect(list[0].score).toBe(18);

    // Survives a fresh read (persisted to localStorage)
    const reread = getGuestTestHistory();
    expect(reread).toHaveLength(1);
    expect(reread[0].id).toBe(list[0].id);
  });

  it('orders newest first', () => {
    addGuestTestSession({ ...baseSession, score: 10 });
    const list = addGuestTestSession({ ...baseSession, score: 20 });
    expect(list[0].score).toBe(20);
    expect(list[1].score).toBe(10);
  });

  it('caps history at 50 sessions', () => {
    let list: TestSession[] = [];
    for (let i = 0; i < 55; i++) {
      list = addGuestTestSession({ ...baseSession, score: i });
    }
    expect(list).toHaveLength(50);
    // Newest (score 54) retained, oldest dropped
    expect(list[0].score).toBe(54);
    expect(list.some(s => s.score === 0)).toBe(false);
  });

  it('clears stored history', () => {
    addGuestTestSession(baseSession);
    expect(getGuestTestHistory()).toHaveLength(1);
    clearGuestTestHistory();
    expect(getGuestTestHistory()).toEqual([]);
  });

  it('recovers from corrupt stored data', () => {
    localStorage.setItem('civic-prep-guest-test-history', '{not valid json');
    expect(getGuestTestHistory()).toEqual([]);
  });
});
