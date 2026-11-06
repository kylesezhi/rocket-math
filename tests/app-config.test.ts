import { describe, it, expect } from 'vitest';
import { BASE_CONFIG } from '../src/lib/config';

describe('BASE_CONFIG', () => {
  it('generates problems with operands in 1-12 (never 0)', () => {
    expect(BASE_CONFIG.otherMin).toBe(1);
    expect(BASE_CONFIG.otherMax).toBe(12);
  });

  it('uses the multiplication operation', () => {
    expect(BASE_CONFIG.operation).toBe('multiplication');
  });
});
