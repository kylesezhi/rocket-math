import { describe, it, expect, beforeEach } from 'vitest';
import { loadFixedFactors, saveFixedFactors, STORAGE_KEY } from '../src/lib/storage';

// Raw values are written directly to storage to simulate data persisted by
// earlier versions of the app (which allowed 0 as a factor).

describe('loadFixedFactors', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns the default [3] when nothing is stored', () => {
    expect(loadFixedFactors()).toEqual([3]);
  });

  it('filters invalid factors out of a stored array, keeping valid ones', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([0, 3]));
    expect(loadFixedFactors()).toEqual([3]);
  });

  it('returns [] when every stored factor is invalid (no default fallback)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([0]));
    expect(loadFixedFactors()).toEqual([]);
  });

  it('returns [] for a stored empty array (no default fallback)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    expect(loadFixedFactors()).toEqual([]);
  });

  it('returns [3] for unparseable JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{');
    expect(loadFixedFactors()).toEqual([3]);
  });

  it('returns [3] when the stored value is not an array', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ factors: [3] }));
    expect(loadFixedFactors()).toEqual([3]);
  });

  it('rejects non-integers and out-of-range values', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([1.5, 13, 'x', null, 2, 12]));
    expect(loadFixedFactors()).toEqual([2, 12]);
  });

  it('de-duplicates while preserving order', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([5, 3, 5, 12, 3]));
    expect(loadFixedFactors()).toEqual([5, 3, 12]);
  });
});

describe('saveFixedFactors', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists only valid, de-duplicated factors', () => {
    saveFixedFactors([0, 2, 3, 3, 15]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual([2, 3]);
  });

  it('persists an empty array when no valid factors are given', () => {
    saveFixedFactors([0]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual([]);
  });
});
