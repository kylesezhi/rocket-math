import type { Problem, WorksheetConfig } from '../types';
import { random } from '../random';

/**
 * Generate `count` multiplication problems.
 *
 * For each problem, one operand is picked from `config.fixedFactors` and the
 * other operand is a uniformly random integer in `[config.otherMin, config.otherMax]`.
 * The order (which is on top/bottom) is randomized.
 *
 * Problems are produced in order (left-to-right, top-to-bottom as consumed by
 * the layout). `rng` returns a number in [0, 1).
 *
 * Constraints:
 * - No identical ordered pair adjacent to each other (e.g., 2x0 then 2x0 forbidden; 2x0 then 0x2 allowed).
 * - After a swapped pair (a,b) then (b,a), the third expression must not include both a and b.
 *
 * Throws if `config.fixedFactors` is empty.
 */
export function generateProblems(
  config: WorksheetConfig,
  count: number,
  rng: () => number = random,
): Problem[] {
  if (!Array.isArray(config.fixedFactors) || config.fixedFactors.length === 0) {
    throw new Error('fixedFactors must contain at least one factor');
  }

  if (count <= 0) return [];

  const problems: Problem[] = [];
  const { fixedFactors, otherMin, otherMax } = config;
  const range = otherMax - otherMin + 1;
  let last: Problem | null = null;
  let secondLast: Problem | null = null;

  const makeCandidate = (): Problem => {
    const fixed = fixedFactors[Math.floor(rng() * fixedFactors.length)];
    const other = otherMin + Math.floor(rng() * range);
    if (rng() < 0.5) {
      return { a: fixed, b: other };
    } else {
      return { a: other, b: fixed };
    }
  };

  const sameOrderedPair = (p1: Problem, p2: Problem) =>
    p1.a === p2.a && p1.b === p2.b;

  const isSwap = (p1: Problem, p2: Problem) =>
    p1.a === p2.b && p1.b === p2.a;

  const containsBoth = (cand: Problem, a: number, b: number) =>
    (cand.a === a && cand.b === b) || (cand.a === b && cand.b === a);

  for (let i = 0; i < count; i++) {
    let candidate = makeCandidate();
    let attempts = 0;
    const maxAttempts = 80;

    const isValid = (cand: Problem): boolean => {
      // rule 1: no identical ordered pair adjacent to each other
      if (last && sameOrderedPair(cand, last)) {
        return false;
      }
      // rule 2: after swap (secondLast, last), third cannot include both elements
      if (secondLast && last && isSwap(secondLast, last)) {
        const a1 = secondLast.a;
        const b1 = secondLast.b;
        if (containsBoth(cand, a1, b1)) {
          return false;
        }
      }
      return true;
    };

    while (!isValid(candidate) && attempts < maxAttempts) {
      candidate = makeCandidate();
      attempts++;
    }

    // fallbacks
    if (!isValid(candidate) && secondLast && last && isSwap(secondLast, last)) {
      const a1 = secondLast.a;
      const b1 = secondLast.b;
      let attempts2 = 0;
      while (
        (containsBoth(candidate, a1, b1) ||
          (last && sameOrderedPair(candidate, last))) &&
        attempts2 < maxAttempts
      ) {
        candidate = makeCandidate();
        attempts2++;
      }
    }

    if (!isValid(candidate)) {
      let attempts3 = 0;
      while (!isValid(candidate) && attempts3 < maxAttempts) {
        candidate = makeCandidate();
        attempts3++;
      }
    }

    problems.push(candidate);
    secondLast = last;
    last = candidate;
  }

  return problems;
}

export default generateProblems;