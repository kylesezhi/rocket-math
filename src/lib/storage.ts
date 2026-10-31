const STORAGE_KEY = 'rocket-math:fixedFactors';
const DEFAULT_FACTORS = [3];

function isValidFactor(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 12;
}

export function loadFixedFactors(): number[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [...DEFAULT_FACTORS];
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return [...DEFAULT_FACTORS];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...DEFAULT_FACTORS];
    }
    const factors = parsed.filter(isValidFactor);
    // de-duplicate while preserving order
    const unique: number[] = [];
    for (const f of factors) {
      if (!unique.includes(f)) unique.push(f);
    }
    return unique.length > 0 ? unique : [...DEFAULT_FACTORS];
  } catch {
    return [...DEFAULT_FACTORS];
  }
}

export function saveFixedFactors(factors: number[]): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const valid = factors.filter(isValidFactor);
    const unique: number[] = [];
    for (const f of valid) {
      if (!unique.includes(f)) unique.push(f);
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  } catch {
    // Ignore storage errors (e.g. quota, disabled storage).
  }
}