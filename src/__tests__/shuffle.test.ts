import { describe, it, expect } from 'vitest';
import { fisherYatesShuffle } from '@/lib/shuffle';

describe('Fisher-Yates Shuffle', () => {
  it('returns array of same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = fisherYatesShuffle(input);
    expect(result).toHaveLength(input.length);
  });

  it('contains all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = fisherYatesShuffle(input);
    expect(result.sort()).toEqual(input.sort());
  });

  it('does not mutate original array', () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    fisherYatesShuffle(input);
    expect(input).toEqual(original);
  });

  it('produces uniform distribution (chi-squared test)', () => {
    // Statistical test: Run 10,000 shuffles and verify each element
    // appears in each position with roughly equal frequency
    const input = [0, 1, 2, 3, 4];
    const iterations = 10000;
    const positionCounts: number[][] = input.map(() => new Array(input.length).fill(0));

    for (let i = 0; i < iterations; i++) {
      const shuffled = fisherYatesShuffle(input);
      shuffled.forEach((value, position) => {
        positionCounts[value][position]++;
      });
    }

    // Expected count per position = iterations / array length
    const expected = iterations / input.length;

    // Calculate chi-squared statistic
    let chiSquared = 0;
    for (const valueCounts of positionCounts) {
      for (const count of valueCounts) {
        chiSquared += Math.pow(count - expected, 2) / expected;
      }
    }

    // Chi-squared critical value for df=20, p=0.001 is ~45.3
    // We use a generous threshold of 50 to avoid flaky tests
    // A biased shuffle (like Math.random() - 0.5 sort) will produce values > 100
    expect(chiSquared).toBeLessThan(50);
  });

  it('handles empty array', () => {
    expect(fisherYatesShuffle([])).toEqual([]);
  });

  it('handles single element array', () => {
    expect(fisherYatesShuffle([42])).toEqual([42]);
  });

  it('works with objects', () => {
    const input = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = fisherYatesShuffle(input);
    expect(result).toHaveLength(3);
    expect(result.map(x => x.id).sort()).toEqual([1, 2, 3]);
  });
});
