import { jsPDF } from 'jspdf';
import type { Problem, WorksheetConfig } from '../types';
import { POPPINS_BOLD, POPPINS_REGULAR } from './fonts';

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
  // Allow fewer effective rows to make room for extra margin after each row of boxes
  const requestedRows = config?.rows ?? 9;
  const rows = Math.max(1, requestedRows - 1);
  const margin = 0.5;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter',
  });

  // Register Poppins font
  doc.addFileToVFS('Poppins-Regular.ttf', POPPINS_REGULAR);
  doc.addFont('Poppins-Regular.ttf', 'Poppins', 'normal');
  doc.addFileToVFS('Poppins-Bold.ttf', POPPINS_BOLD);
  doc.addFont('Poppins-Bold.ttf', 'Poppins', 'bold');

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const cellWidth = usableWidth / cols;
  const rowGap = 0.16;
  const baseCellHeight = usableHeight / requestedRows;

  const numberFontSize = 16;
  const timesFontSize = 14;

  doc.setFont('Poppins', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);

  const maxProblems = rows * cols;
  const problemsToDraw = problems.slice(0, maxProblems);

  for (let i = 0; i < problemsToDraw.length; i++) {
    const problem = problemsToDraw[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    // guard against rows beyond configured rows: still draw (best effort)
    const x = margin + col * cellWidth;
    const y = margin + row * baseCellHeight + row * rowGap;

    const boxWidth = cellWidth * 0.72;
    const boxX = x + (cellWidth - boxWidth) / 2;
    const rightX = boxX + boxWidth - 0.08;
    const leftX = boxX + 0.08;
    const topNumberY = y + 0.24;
    const bottomNumberY = y + 0.52;

    // Top number (right-aligned)
    doc.setFont('Poppins', 'bold');
    doc.setFontSize(numberFontSize);
    doc.text(String(problem.a), rightX, topNumberY, { align: 'right' });

    // Bottom: × on left, number right-aligned
    doc.setFont('Poppins', 'normal');
    doc.setFontSize(timesFontSize);
    doc.text('\u00d7', leftX, bottomNumberY);
    doc.setFont('Poppins', 'bold');
    doc.setFontSize(numberFontSize);
    doc.text(String(problem.b), rightX, bottomNumberY, { align: 'right' });

    // Rounded answer box below expression, centered
    const boxHeight = 0.4;
    const boxY = bottomNumberY + 0.22;
    const radius = 0.06;
    doc.setLineWidth(0.012);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, radius, radius, 'S');
  }

  const blob = doc.output('blob');
  return blob;
}

export default generateWorksheet;