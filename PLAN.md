# Plan: Rocket Math Multiplication Worksheet Generator

## Goal
Create a static, client-side web app (Vite + React + TypeScript, plain CSS) that generates a Rocket Math-style multiplication worksheet PDF. The output is a 7×9 grid (63 problems) of vertical multiplication problems with blank rounded answer boxes, an embedded PDF preview, a Randomize button, and a Download PDF button. The user can select one or more fixed factors (e.g., `3` or `2,3,4`) as one operand; the other operand is randomly chosen from 1–12. No header/name line is needed.

## Tech Stack
- **Vite + React 18 + TypeScript** (strict)
- **jsPDF** for PDF generation
- **Plain CSS** (no Tailwind)
- **Vitest** for generator unit tests
- **localStorage** for persisting settings

## Project Structure
```
rocket-math/
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  tsconfig.node.json
  src/
    main.tsx
    App.tsx
    styles.css
    components/
      Controls.tsx        # factor checkboxes, buttons
      PdfPreview.tsx      # iframe + download link
    lib/
      types.ts            # Operation, Problem, WorksheetConfig
      random.ts           # RNG helper
      generators/
        multiplication.ts # generateProblems(config, count, rng)
      pdf/
        generateWorksheet.ts # jsPDF layout
      storage.ts          # localStorage load/save
  tests/
    multiplication.test.ts
```

## Domain Model
```ts
type Operation = 'multiplication'; // extensible later

interface Problem {
  a: number; // top operand (from fixed factors)
  b: number; // bottom operand (random 1-12)
}

interface WorksheetConfig {
  operation: Operation;
  fixedFactors: number[]; // selected operands (1-12), must be non-empty
  otherMin: number;      // 1
  otherMax: number;      // 12
  cols: number;          // 7
  rows: number;          // 9
  title: string;         // "Multiplication Practice" (optional, can be minimal)
}
```

## Generation Logic
1. **Validation**: `fixedFactors` must contain at least one number. If empty, Randomize is disabled and an inline message is shown.
2. **Problem creation**: For each of the 63 cells (top-to-bottom, left-to-right):
   - `a = fixedFactors[Math.floor(rng() * fixedFactors.length)]` (selected factor always on top)
   - `b = otherMin + Math.floor(rng() * (otherMax - otherMin + 1))` (random 1-12 with the app default config)
3. **Regeneration**: Randomize button increments a `nonce`. Changes to `fixedFactors` also trigger regeneration. A `useEffect` regenerates problems and the PDF whenever `fixedFactors` or `nonce` change.
4. **RNG**: Use `Math.random()` by default. Structure to allow swapping in a seeded PRNG later without changing callers.

## PDF Layout (jsPDF, Letter portrait, 8.5×11 in)
- **Margins**: 0.5 in all around
- **Grid**: 7 columns × 9 rows, usable area fills the space below margins (no title/header per requirements)
- **Per cell** (vertical layout):
  - Top number, right-aligned near the top/middle area of the cell
  - Bottom: `×` placed left of the bottom number, bottom number right-aligned to align with top number
  - Horizontal line across ~80% of cell width below the numbers
  - Rounded-corner rectangle below the line (answer box), centered, ~0.75× cell width × ~0.28 in tall
- **Output**: Generate as a Blob, display via object URL in `<iframe>`. Revoke previous object URL on regeneration/unmount to avoid leaks.
- **No footer/page number**.

## UI
- **Controls component**:
  - Factor checkbox group for 1–12 (with "Select all / Clear" actions)
  - Display of other-factor range as read-only text (1–12)
  - `Randomize` button (disabled if no factors selected)
  - `Download PDF` button
- **PdfPreview component**:
  - `<iframe>` showing the current generated PDF via object URL
  - Updates whenever PDF is regenerated
- **Layout**: Centered card layout with plain CSS, responsive (preview scales down on mobile)

## State & Persistence
- React state for `fixedFactors` and `nonce`
- Load `fixedFactors` from `localStorage` on mount (default: `[3]`)
- Save `fixedFactors` to `localStorage` on change
- Regenerate PDF blob on state changes

## Validation & Edge Cases
- Empty selection → disable Randomize, show inline message "Select at least one operand."
- 63 cells generated consistently
- Handle jsPDF blob URL creation failures gracefully (fall back to download-only if needed)
- Cleanup object URLs on unmount and regeneration

## Testing
- Unit tests for generator: count = 63, all `a` in selected set, `b` in [1,12], empty selection throws/error behavior as specified
- Optional: smoke test rendering App

## Implementation Notes
- Keep changes consistent with simple, readable patterns
- PDF layout should match Rocket Math vertical style as closely as reasonable with jsPDF primitives (rect with border radius, text positioning)
- Make the design extensible for future operations (structure allows adding more operation types later)
- No external UI libraries, just plain CSS
