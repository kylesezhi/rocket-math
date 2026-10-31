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

  for (let i = 0; i < count; i++) {
    const fixed = fixedFactors[Math.floor(rng() * fixedFactors.length)];
    const other = otherMin + Math.floor(rng() * range);
    if (rng() < 0.5) {
      problems.push({ a: fixed, b: other });
    } else {
      problems.push({ a: other, b: fixed });
    }
  }

  return problems;
}

export default generateProblems;