import type { Problem, WorksheetConfig } from '../types';
import { random } from '../random';

/**
 * Generate `count` multiplication problems.
 *
 * The top operand (`a`) is picked from `config.fixedFactors`; the bottom
 * operand (`b`) is a uniformly random integer in `[config.otherMin, config.otherMax]`.
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
    const a = fixedFactors[Math.floor(rng() * fixedFactors.length)];
    const b = otherMin + Math.floor(rng() * range);
    problems.push({ a, b });
  }

  return problems;
}

export default generateProblems;