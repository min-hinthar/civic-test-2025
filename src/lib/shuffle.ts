/**
 * Fisher-Yates (Knuth) shuffle algorithm.
 * Produces uniformly distributed permutations.
 * Does not mutate the original array.
 *
 * @param array - The array to shuffle
 * @returns A new shuffled array
 */
export function fisherYatesShuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
