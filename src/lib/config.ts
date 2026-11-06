import type { WorksheetConfig } from './types';

/** Base worksheet configuration; `fixedFactors` is supplied by the caller. */
export const BASE_CONFIG = {
  operation: 'multiplication' as const,
  otherMin: 1,
  otherMax: 12,
  cols: 7,
  rows: 9,
  title: 'Multiplication Practice',
} satisfies Omit<WorksheetConfig, 'fixedFactors'>;
