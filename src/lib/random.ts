/**
 * Default random number generator.
 *
 * Returns a number in the half-open interval [0, 1), mirroring `Math.random`.
 * Exported under several aliases so callers can depend on a stable name
 * while still being able to swap in a seeded PRNG later.
 */
export function random(): number {
  return Math.random();
}

export const rng = random;

export default random;