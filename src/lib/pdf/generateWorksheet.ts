import { jsPDF } from 'jspdf';
import type { Problem, WorksheetConfig } from '../types';

export interface GenerateWorksheetOptions {
  margin?: number;
}

/**
 * Generate a Rocket Math-style multiplication worksheet PDF.
 *
 * Layout: Letter portrait, 0.5 in margins, 7 columns x 9 rows (by default)
 * of vertical multiplication problems. Each cell contains the two operands
 * stacked, a horizontal line, and a rounded answer box below.
 */
export function generateWorksheet(
  problems: Problem[],
  config?: Partial<WorksheetConfig>,
): Blob {
  const cols = config?.cols ?? 7;
  const rows = config?.rows ?? 9;
  const margin = 0.5;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const cellWidth = usableWidth / cols;
  const cellHeight = usableHeight / rows;

  const numberFontSize = 16;
  const timesFontSize = 14;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);

  for (let i = 0; i < problems.length; i++) {
    const problem = problems[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    // guard against rows beyond configured rows: still draw (best effort)
    const x = margin + col * cellWidth;
    const y = margin + row * cellHeight;

    const boxWidth = cellWidth * 0.72;
    const boxX = x + (cellWidth - boxWidth) / 2;
    const rightX = boxX + boxWidth - 0.08;
    const leftX = boxX + 0.08;
    const topNumberY = y + 0.26;
    const bottomNumberY = y + 0.54;

    // Top number (right-aligned)
    doc.setFontSize(numberFontSize);
    doc.text(String(problem.a), rightX, topNumberY, { align: 'right' });

    // Bottom: × on left, number right-aligned
    doc.setFontSize(timesFontSize);
    doc.text('\u00d7', leftX, bottomNumberY);
    doc.setFontSize(numberFontSize);
    doc.text(String(problem.b), rightX, bottomNumberY, { align: 'right' });

    // Rounded answer box below expression, centered
    const boxHeight = 0.42;
    const boxY = bottomNumberY + 0.18;
    const radius = 0.06;
    doc.setLineWidth(0.012);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, radius, radius, 'S');
  }

  const blob = doc.output('blob');
  return blob;
}

export default generateWorksheet;