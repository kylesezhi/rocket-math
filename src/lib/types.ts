export type Operation = 'multiplication';

export interface Problem {
  a: number;
  b: number;
}

export interface WorksheetConfig {
  operation: Operation;
  fixedFactors: number[];
  otherMin: number;
  otherMax: number;
  cols: number;
  rows: number;
  title: string;
}