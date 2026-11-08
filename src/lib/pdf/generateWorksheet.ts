import { jsPDF } from 'jspdf';
import type { Problem, WorksheetConfig } from '../types';
import { MINI_ROCKET, ROCKET_LOGO } from './assets';
import { ARIMO_BOLD, POPPINS_BOLD, POPPINS_REGULAR } from './fonts';

export interface GenerateWorksheetOptions {
  margin?: number;
}

type Vec = [number, number];

const BLACK = 0;
const WHITE = 255;

/** Draw a polygon through absolute points ('F' fill, 'S' stroke). */
function polygon(doc: jsPDF, points: Vec[], style: 'F' | 'S'): void {
  const segments: Vec[] = [];
  for (let i = 1; i < points.length; i++) {
    segments.push([points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]]);
  }
  doc.lines(segments, points[0][0], points[0][1], [1, 1], style, true);
}

/** Points of a regular star: `spikes` outer tips alternating with inner valleys. */
function starPoints(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  spikes: number,
): Vec[] {
  const pts: Vec[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const angle = -Math.PI / 2 + (i * Math.PI) / spikes;
    pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return pts;
}

/** Classic 5-point star. */
function drawStar(doc: jsPDF, cx: number, cy: number, r: number): void {
  polygon(doc, starPoints(cx, cy, r, r * 0.42, 5), 'F');
}

/** 4-point sparkle (thin diamond star). */
function drawSparkle(doc: jsPDF, cx: number, cy: number, r: number): void {
  polygon(doc, starPoints(cx, cy, r, r * 0.26, 4), 'F');
}

/** Stopwatch icon: circle body, top knob, side button, two hands. */
function drawStopwatch(doc: jsPDF, cx: number, cy: number, r: number): void {
  doc.setLineWidth(0.016);
  // Top knob and stem
  doc.roundedRect(cx - 0.045, cy - r - 0.095, 0.09, 0.055, 0.015, 0.015, 'F');
  doc.rect(cx - 0.02, cy - r - 0.045, 0.04, 0.05, 'F');
  // Side button (~2 o'clock)
  doc.setLineWidth(0.022);
  doc.line(cx + r * 0.72, cy - r * 0.72, cx + r * 0.92, cy - r * 0.92);
  // Body
  doc.setLineWidth(0.016);
  doc.circle(cx, cy, r, 'S');
  // Hands: 12 o'clock and ~4:30
  doc.line(cx, cy, cx, cy - r * 0.58);
  doc.line(cx, cy, cx + r * 0.38, cy + r * 0.32);
  doc.circle(cx, cy, 0.018, 'F');
}

/** Checkered racing flag on a pole (flag at top-left of the pole). */
function drawCheckeredFlag(doc: jsPDF, x: number, y: number, w: number, h: number): void {
  const poleX = x;
  // Pole
  doc.setLineWidth(0.022);
  doc.line(poleX, y - 0.01, poleX, y + h + 0.11);
  doc.circle(poleX, y - 0.02, 0.02, 'F');
  // Flag cloth
  doc.setLineWidth(0.012);
  doc.rect(x, y, w, h, 'S');
  const cols = 4;
  const rows = 3;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 === 0) {
        doc.rect(x + (c * w) / cols, y + (r * h) / rows, w / cols, h / rows, 'F');
      }
    }
  }
}

/** Elongated hexagon badge with pointed ends, white inner outline, label and sparkles. */
function drawBadge(doc: jsPDF, cx: number, cy: number, w: number, h: number, label: string): void {
  const hex = (width: number, height: number): Vec[] => {
    const p = height * 0.6; // point inset
    return [
      [cx - width / 2 + p, cy - height / 2],
      [cx + width / 2 - p, cy - height / 2],
      [cx + width / 2, cy],
      [cx + width / 2 - p, cy + height / 2],
      [cx - width / 2 + p, cy + height / 2],
      [cx - width / 2, cy],
    ];
  };

  doc.setFillColor(BLACK, BLACK, BLACK);
  polygon(doc, hex(w, h), 'F');

  doc.setDrawColor(WHITE, WHITE, WHITE);
  doc.setLineWidth(0.008);
  polygon(doc, hex(w - 0.09, h - 0.09), 'S');
  doc.setDrawColor(BLACK, BLACK, BLACK);

  doc.setFillColor(WHITE, WHITE, WHITE);
  drawSparkle(doc, cx - w / 2 + h * 0.6 + 0.14, cy, 0.05);
  drawSparkle(doc, cx - w / 2 + h * 0.6 + 0.24, cy - 0.07, 0.026);
  drawSparkle(doc, cx + w / 2 - h * 0.6 - 0.14, cy, 0.05);
  drawSparkle(doc, cx + w / 2 - h * 0.6 - 0.24, cy + 0.07, 0.026);
  doc.setFillColor(BLACK, BLACK, BLACK);

  doc.setFont('Poppins', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(WHITE, WHITE, WHITE);
  doc.text(label, cx, cy + 0.045, { align: 'center', charSpace: 2.2 * PT });
  doc.setTextColor(BLACK, BLACK, BLACK);
}

/** Horizontal dotted separator line. */
function drawDottedLine(doc: jsPDF, x1: number, x2: number, y: number): void {
  doc.setLineCap('round');
  doc.setLineWidth(0.02);
  doc.setLineDashPattern([0.001, 0.082], 0);
  doc.line(x1, y, x2, y);
  doc.setLineDashPattern([], 0);
  doc.setLineCap('butt');
}

/** Points, in inches (jsPDF interprets charSpace in the document unit). */
const PT = 1 / 72;

/** Width of text in inches, accounting for letter spacing (charSpace in inches). */
function trackedTextWidth(doc: jsPDF, text: string, charSpace: number): number {
  return doc.getTextWidth(text) + charSpace * Math.max(0, text.length - 1);
}

/** Footer box: rounded rect with an icon, bold label, and fill-in line segments. */
function drawFooterBox(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  drawIcon: (iconX: number, centerY: number) => number,
  label: string,
  segments: Array<'line' | string>,
): void {
  const radius = 0.08;
  doc.setLineWidth(0.014);
  doc.roundedRect(x, y, w, h, radius, radius, 'S');

  const centerY = y + h / 2;
  const baseline = centerY + 0.04;
  let cursor = drawIcon(x + 0.14, centerY);

  doc.setFont('Poppins', 'bold');
  doc.setFontSize(11);
  doc.text(label, cursor, baseline);
  cursor += doc.getTextWidth(label) + 0.09;

  doc.setFont('Poppins', 'normal');
  doc.setFontSize(10);
  const lineY = y + h - 0.1;
  for (const segment of segments) {
    if (segment === 'line') {
      doc.setLineWidth(0.012);
      doc.line(cursor, lineY, cursor + 0.42, lineY);
      cursor += 0.42 + 0.08;
    } else {
      doc.text(segment, cursor, baseline);
      cursor += doc.getTextWidth(segment) + 0.08;
    }
  }
}

/**
 * Generate a "Blast Off!"-style multiplication drill worksheet PDF.
 *
 * Layout: Letter portrait with a branded header (logo, title, Name line),
 * a dotted separator, a "TIMED TEST" badge overlapping a large rounded
 * frame that holds 7 columns x 8 rows of vertical multiplication problems,
 * and a footer with TIME / GOAL / SCORE boxes and a motto.
 */
export function generateWorksheet(
  problems: Problem[],
  config?: Partial<WorksheetConfig>,
): Blob {
  const cols = config?.cols ?? 7;
  const requestedRows = config?.rows ?? 9;
  const rows = Math.max(1, requestedRows - 1);
  const subtitle = config?.title ?? 'Multiplication Drill';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter',
  });

  // Register fonts
  doc.addFileToVFS('Poppins-Regular.ttf', POPPINS_REGULAR);
  doc.addFont('Poppins-Regular.ttf', 'Poppins', 'normal');
  doc.addFileToVFS('Poppins-Bold.ttf', POPPINS_BOLD);
  doc.addFont('Poppins-Bold.ttf', 'Poppins', 'bold');
  doc.addFileToVFS('Arimo-Bold.ttf', ARIMO_BOLD);
  doc.addFont('Arimo-Bold.ttf', 'Arimo', 'bold');

  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  doc.setTextColor(BLACK, BLACK, BLACK);
  doc.setDrawColor(BLACK, BLACK, BLACK);
  doc.setFillColor(BLACK, BLACK, BLACK);

  // ---- Header ----
  doc.addImage(ROCKET_LOGO, 'PNG', 0.16, 0.05, 1.3, 0.95);

  doc.setFont('Poppins', 'bold');
  doc.setFontSize(33);
  const titleX = 1.56;
  const title = 'BLAST OFF!';
  doc.text(title, titleX, 0.7, { charSpace: 0.5 * PT });
  const titleEnd = titleX + trackedTextWidth(doc, title, 0.5 * PT);

  doc.setFont('Poppins', 'normal');
  doc.setFontSize(14);
  doc.text(subtitle, titleX + 0.02, 1.0);

  // Sparkles flanking the title
  drawSparkle(doc, titleEnd + 0.16, 0.44, 0.05);
  drawSparkle(doc, titleEnd + 0.34, 0.62, 0.036);

  // Name line
  doc.setFont('Poppins', 'normal');
  doc.setFontSize(12);
  doc.text('Name', 4.75, 0.66);
  doc.setLineWidth(0.014);
  doc.line(5.31, 0.71, 8.14, 0.71);

  // ---- Dotted separator + instructions ----
  drawDottedLine(doc, 0.24, 8.26, 1.24);

  doc.setFontSize(11);
  doc.text('Solve each problem. Work left to right, top to bottom.', centerX, 1.46, {
    align: 'center',
  });

  // ---- Problem frame ----
  const boxX = 0.4;
  const boxY = 1.72;
  const boxW = 7.7;
  const boxH = 8.36;
  doc.setLineWidth(0.018);
  doc.roundedRect(boxX, boxY, boxW, boxH, 0.17, 0.17, 'S');

  // ---- Problem grid ----
  const cellWidth = boxW / cols;
  const gridTop = boxY + 0.28;
  const gridBottom = boxY + boxH - 0.14;
  const rowPitch = (gridBottom - gridTop) / rows;

  const numberFontSize = 18;
  const timesFontSize = 16;

  const maxProblems = rows * cols;
  const problemsToDraw = problems.slice(0, maxProblems);

  for (let i = 0; i < problemsToDraw.length; i++) {
    const problem = problemsToDraw[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = boxX + col * cellWidth;
    const slotY = gridTop + row * rowPitch;

    const boxWidth = 0.62;
    const boxHeight = 0.34;
    const answerX = x + (cellWidth - boxWidth) / 2;
    const rightX = answerX + boxWidth - 0.08;
    const leftX = answerX + 0.08;
    const topNumberY = slotY + 0.25;
    const bottomNumberY = slotY + 0.5;

    // Top number (right-aligned)
    doc.setFont('Arimo', 'bold');
    doc.setFontSize(numberFontSize);
    doc.text(String(problem.a), rightX, topNumberY, { align: 'right' });

    // Bottom: × on left, number right-aligned
    doc.setFont('Poppins', 'normal');
    doc.setFontSize(timesFontSize);
    doc.text('×', leftX, bottomNumberY);
    doc.setFont('Arimo', 'bold');
    doc.setFontSize(numberFontSize);
    doc.text(String(problem.b), rightX, bottomNumberY, { align: 'right' });

    // Rounded answer box below expression, centered
    doc.setLineWidth(0.012);
    doc.roundedRect(answerX, slotY + 0.6, boxWidth, boxHeight, 0.06, 0.06, 'S');
  }

  // ---- TIMED TEST badge (overlaps the frame's top edge) ----
  drawBadge(doc, centerX, boxY, 2.32, 0.34, 'TIMED TEST');

  // ---- Footer ----
  const footerY = 10.22;
  const footerH = 0.34;

  drawStopwatch(doc, 0.62, footerY + footerH / 2, 0.16);
  drawFooterBox(doc, 0.88, footerY, 2.35, footerH, (iconX) => iconX, 'TIME:', [
    'line',
    'min',
    'line',
    'sec',
  ]);
  drawFooterBox(
    doc,
    3.5,
    footerY,
    2.32,
    footerH,
    (iconX, centerY) => {
      drawCheckeredFlag(doc, iconX + 0.02, centerY - 0.12, 0.24, 0.15);
      return iconX + 0.36;
    },
    'GOAL:',
    ['line', 'or fewer'],
  );
  drawFooterBox(
    doc,
    6.08,
    footerY,
    2.06,
    footerH,
    (iconX, centerY) => {
      drawStar(doc, iconX + 0.09, centerY, 0.095);
      return iconX + 0.26;
    },
    'SCORE:',
    ['line', `/ ${problemsToDraw.length}`],
  );

  // ---- Motto ----
  doc.setFont('Poppins', 'bold');
  doc.setFontSize(10);
  const mottoParts = ['FOCUS', 'SPEED', 'ACCURACY = SUCCESS!'];
  const mottoSpace = 1.6 * PT;
  const starR = 0.055;
  const starGap = 0.11;
  let mottoWidth = 0;
  for (const part of mottoParts) {
    mottoWidth += trackedTextWidth(doc, part, mottoSpace);
  }
  mottoWidth += (mottoParts.length - 1) * (2 * starGap + starR * 2);
  let cursor = centerX - mottoWidth / 2;
  const mottoBaseline = 10.86;
  for (let i = 0; i < mottoParts.length; i++) {
    doc.text(mottoParts[i], cursor, mottoBaseline, { charSpace: mottoSpace });
    cursor += trackedTextWidth(doc, mottoParts[i], mottoSpace);
    if (i < mottoParts.length - 1) {
      drawStar(doc, cursor + starGap + starR, mottoBaseline - 0.035, starR);
      cursor += 2 * starGap + starR * 2;
    }
  }

  // Small rocket trail decoration, bottom right
  doc.addImage(MINI_ROCKET, 'PNG', 6.65, 10.56, 1.45, 0.35);

  return doc.output('blob');
}

export default generateWorksheet;
