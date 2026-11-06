import { describe, it, expect } from 'vitest';
import { generateProblems } from '../src/lib/generators/multiplication';
import type { WorksheetConfig } from '../src/lib/types';

function makeConfig(fixedFactors: number[]): WorksheetConfig {
  return {
    operation: 'multiplication',
    fixedFactors,
    otherMin: 1,
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

  it('all operands are within [1, 12], and the other operand hits both boundaries 1 and 12', () => {
    let call = 0;
    let otherIdx = 0;
    // Probe values for the other operand, cycled independently of the rng call
    // order. Under the correct range (otherMin=1, otherMax=12, range=12) they
    // map to 1, 2, 5, 8, 11, 12 — covering both boundaries. The 0.95 probe is
    // the regression tripwire: with a broken range (e.g. otherMax=13, range=13)
    // it maps to 13 and the bound assertion fails; with otherMin=0 it maps the
    // 0 probe to 0 and the lower bound fails.
    const otherProbes = [0, 0.125, 0.375, 0.625, 0.875, 0.95];
    const rng = () => {
      call += 1;
      const role = call % 3; // roles per attempt: 1 = fixed factor, 2 = other operand, 0 = order
      if (role === 1) return 0; // fixedFactors has one element, fixed = 3
      if (role === 2) return otherProbes[otherIdx++ % otherProbes.length];
      return 0.25; // order: fixed always on top
    };
    const problems = generateProblems(makeConfig([3]), 63, rng);
    const others = new Set(problems.map((p) => (p.a === 3 ? p.b : p.a)));
    for (const p of problems) {
      expect(p.a).toBeGreaterThanOrEqual(1);
      expect(p.a).toBeLessThanOrEqual(12);
      expect(p.b).toBeGreaterThanOrEqual(1);
      expect(p.b).toBeLessThanOrEqual(12);
    }
    // Boundary proof: the cycling other counter observed both range ends.
    expect(others.has(1)).toBe(true);
    expect(others.has(12)).toBe(true);
  });

  it('only generates operands in [1, 12] (never 0 or out of range)', () => {
    let i = 0;
    // Cycle through many values so all three rng roles (factor, other, order)
    // see the full range, including values that would yield 0 if otherMin were 0.
    const rng = () => (i++ % 37) / 37;
    const problems = generateProblems(makeConfig([2, 3, 5, 7]), 63, rng);
    expect(problems).toHaveLength(63);
    for (const p of problems) {
      expect(p.a).toBeGreaterThanOrEqual(1);
      expect(p.a).toBeLessThanOrEqual(12);
      expect(p.b).toBeGreaterThanOrEqual(1);
      expect(p.b).toBeLessThanOrEqual(12);
      expect(p.a).not.toBe(0);
      expect(p.b).not.toBe(0);
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
      expect(other).toBeGreaterThanOrEqual(1);
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

  it('does not produce identical ordered pairs adjacent to each other', () => {
    let call = 0;
    const rng = () => {
      call += 1;
      if (call % 3 === 1) return (call / 10) % 1; // fixed selection varies
      if (call % 3 === 2) return (call * 0.13) % 1; // other varies
      return (call % 2 === 0) ? 0.25 : 0.75; // order alternates
    };
    const problems = generateProblems(makeConfig([2, 4, 6]), 63, rng);
    for (let i = 0; i < problems.length - 1; i++) {
      const p1 = problems[i];
      const p2 = problems[i + 1];
      expect(p1.a === p2.a && p1.b === p2.b).toBe(false);
    }
  });

  it('after swapped pair (a,b),(b,a) the third does not include both a and b', () => {
    let call = 0;
    const rng = () => {
      call += 1;
      // Force sequence: (2,1), (1,2), then something else
      if (call === 1) return 0; // fixed factor selection -> first in [2], fixed=2
      if (call === 2) return 0; // other = 1 (otherMin=1, range=12)
      if (call === 3) return 0.25; // order -> fixed on top => (2,1)
      if (call === 4) return 0; // fixed factor selection -> 2
      if (call === 5) return 0; // other = 1
      if (call === 6) return 0.75; // order -> other on top => (1,2)
      if (call === 7) return 0; // fixed factor selection
      if (call === 8) return 0; // other
      if (call === 9) return 0.25; // order
      return 0.5;
    };
    const problems = generateProblems(makeConfig([2]), 3, rng);
    expect(problems[0]).toEqual({ a: 2, b: 1 });
    expect(problems[1]).toEqual({ a: 1, b: 2 });
    // third must not include both 2 and 1
    const third = problems[2];
    const hasBoth = (third.a === 2 && third.b === 1) || (third.a === 1 && third.b === 2);
    expect(hasBoth).toBe(false);
  });

  it('after swapped pair, third does not include both even if generated with different factors', () => {
    // simulate by generating with controlled rng to get swap then check
    let call = 0;
    const rng = () => {
      call += 1;
      if (call === 1) return 0; // fixed = 3
      if (call === 2) return 3 / 12; // other = 4 (otherMin=1, otherMax=12, range=12)
      if (call === 3) return 0.25; // order fixed on top => (3,4)
      if (call === 4) return 0; // fixed = 3
      if (call === 5) return 3 / 12; // other = 4
      if (call === 6) return 0.75; // order other on top => (4,3)
      // third: candidate (3,4) is invalid (contains both swapped elements), so it retries
      if (call === 7) return 0; // fixed
      if (call === 8) return 3 / 12; // other
      if (call === 9) return 0.25; // order fixed on top => candidate (3,4), rejected
      if (call === 10) return 0; // retry candidate: fixed = 3
      // retry candidate's other and order fall through to 0.1 below: other = 2, fixed on top => (3,2)
      return 0.1;
    };
    const result = generateProblems(makeConfig([3]), 3, rng);
    expect(result[0]).toEqual({ a: 3, b: 4 });
    expect(result[1]).toEqual({ a: 4, b: 3 });
    const third = result[2];
    const hasBoth = (third.a === 3 && third.b === 4) || (third.a === 4 && third.b === 3);
    expect(hasBoth).toBe(false);
  });
});