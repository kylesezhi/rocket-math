import { describe, it, expect } from 'vitest';
import { generateProblems } from '../src/lib/generators/multiplication';
import type { WorksheetConfig } from '../src/lib/types';

function makeConfig(fixedFactors: number[]): WorksheetConfig {
  return {
    operation: 'multiplication',
    fixedFactors,
    otherMin: 0,
    otherMax: 12,
    cols: 7,
    rows: 9,
    title: 'Multiplication Practice',
  };
}

describe('generateProblems', () => {
  it('returns exactly the requested count (63)', () => {
    const rng = () => 0.5;
    const problems = generateProblems(makeConfig([3]), 63, rng);
    expect(problems).toHaveLength(63);
  });

  it('returns the requested count for arbitrary counts', () => {
    const rng = () => 0.25;
    expect(generateProblems(makeConfig([3]), 0, rng)).toHaveLength(0);
    expect(generateProblems(makeConfig([3]), 1, rng)).toHaveLength(1);
    expect(generateProblems(makeConfig([3]), 5, rng)).toHaveLength(5);
  });

  it('one operand is from the fixedFactors set and the other is random', () => {
    const rng = () => 0.1;
    const factors = [2, 5, 7];
    const problems = generateProblems(makeConfig(factors), 63, rng);
    for (const p of problems) {
      expect(factors.includes(p.a) || factors.includes(p.b)).toBe(true);
      if (factors.includes(p.a) && !factors.includes(p.b)) {
        expect(factors).toContain(p.a);
      } else if (factors.includes(p.b) && !factors.includes(p.a)) {
        expect(factors).toContain(p.b);
      } else {
        // if somehow both are from factors (possible if other also in factors), just ensure at least one is
        expect(factors.includes(p.a) || factors.includes(p.b)).toBe(true);
      }
    }
  });

  it('all bottom operands are within [0, 12]', () => {
    let i = 0;
    const rng = () => (i++ % 13) / 13;
    const problems = generateProblems(makeConfig([3]), 63, rng);
    for (const p of problems) {
      expect(p.b).toBeGreaterThanOrEqual(0);
      expect(p.b).toBeLessThanOrEqual(12);
    }
  });

  it('respects custom otherMin/otherMax range', () => {
    let i = 0;
    const rng = () => {
      const val = (i++ % 10) / 10;
      // For order, make it always put fixed on top for predictable test
      if (i % 3 === 0) return 0.25;
      return val;
    };
    const config: WorksheetConfig = {
      ...makeConfig([3]),
      otherMin: 4,
      otherMax: 8,
    };
    const problems = generateProblems(config, 63, rng);
    for (const p of problems) {
      const other = p.a === 3 ? p.b : p.a;
      expect(other).toBeGreaterThanOrEqual(4);
      expect(other).toBeLessThanOrEqual(8);
    }
  });

  it('throws when fixedFactors is empty', () => {
    const rng = () => 0.5;
    expect(() => generateProblems(makeConfig([]), 63, rng)).toThrow();
  });

  it('throws when fixedFactors is not an array', () => {
    const rng = () => 0.5;
    const config = { ...makeConfig([3]), fixedFactors: null } as unknown as WorksheetConfig;
    expect(() => generateProblems(config, 63, rng)).toThrow();
  });

  it('covers both factors when multiple are selected', () => {
    let calls = 0;
    const rng = () => {
      calls += 1;
      // Use calls to control: odd calls for factor selection, even calls for random operand, next for order
      if (calls % 3 === 1) {
        // factor selection
        return Math.floor(calls / 3) % 2 === 0 ? 0 : 0.999;
      } else if (calls % 3 === 2) {
        // random operand
        return 0.5;
      } else {
        // order - make it deterministic
        return 0.25; // always put fixed on top
      }
    };
    const problems = generateProblems(makeConfig([2, 5]), 20, rng);
    const factorValues = new Set(problems.flatMap((p) => [p.a, p.b]).filter((v) => v === 2 || v === 5));
    expect(factorValues.has(2)).toBe(true);
    expect(factorValues.has(5)).toBe(true);
  });

  it('does not mutate the provided config', () => {
    const config = makeConfig([3]);
    const before = JSON.stringify(config);
    generateProblems(config, 10, () => 0.4);
    expect(JSON.stringify(config)).toBe(before);
  });

  it('works when rng is omitted (uses default)', () => {
    const problems = generateProblems(makeConfig([3]), 5);
    expect(problems).toHaveLength(5);
    for (const p of problems) {
      expect(p.a === 3 || p.b === 3).toBe(true);
      const other = p.a === 3 ? p.b : p.a;
      expect(other).toBeGreaterThanOrEqual(0);
      expect(other).toBeLessThanOrEqual(12);
    }
  });

  it('problem a/b are numbers', () => {
    const problems = generateProblems(makeConfig([3]), 3, () => 0.5);
    for (const p of problems) {
      expect(typeof p.a).toBe('number');
      expect(typeof p.b).toBe('number');
    }
  });
});