/**
 * Seeded Pseudo-Random Number Generator (PRNG) implementation using Mulberry32.
 * Allows reproducible card shuffling for automated tests, demonstrations, and deterministic replay.
 */

export function hashString(str: string): number {
  let hash = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(hash ^ str.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return hash >>> 0;
}

export function createPRNG(seed: number | string): () => number {
  let state = typeof seed === 'number' ? seed >>> 0 : hashString(seed);
  if (state === 0) state = 1;

  // Mulberry32 generator
  return function () {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle using an optional PRNG or standard Math.random.
 * Returns a new shuffled array without mutating the input.
 */
export function shuffleArray<T>(items: readonly T[], randomFn: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}
