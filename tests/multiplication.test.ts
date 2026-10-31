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

  it('all top operands are from the fixedFactors set', () => {
    const rng = () => 0.1;
    const factors = [2, 5, 7];
    const problems = generateProblems(makeConfig(factors), 63, rng);
    for (const p of problems) {
      expect(factors).toContain(p.a);
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
    const rng = () => (i++ % 10) / 10;
    const config: WorksheetConfig = {
      ...makeConfig([3]),
      otherMin: 4,
      otherMax: 8,
    };
    const problems = generateProblems(config, 63, rng);
    for (const p of problems) {
      expect(p.b).toBeGreaterThanOrEqual(4);
      expect(p.b).toBeLessThanOrEqual(8);
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
      if (calls % 2 === 1) {
        return Math.floor(calls / 2) % 2 === 0 ? 0 : 0.999;
      }
      return 0.5;
    };
    const problems = generateProblems(makeConfig([2, 5]), 20, rng);
    const aValues = new Set(problems.map((p) => p.a));
    expect(aValues.has(2)).toBe(true);
    expect(aValues.has(5)).toBe(true);
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
      expect(p.a).toBe(3);
      expect(p.b).toBeGreaterThanOrEqual(0);
      expect(p.b).toBeLessThanOrEqual(12);
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