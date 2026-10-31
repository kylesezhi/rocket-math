# Tasks: Build Rocket Math Multiplication Worksheet Generator

Each task builds on the previous ones. Complete in order. After each task, perform the manual validation listed to confirm it's working correctly.

---

## Task 1: Scaffold Vite + React + TypeScript project
**Goal**: Create the base project structure with all necessary dependencies and configuration files.

**Steps**:
1. Initialize Vite project with React + TypeScript template in the repo root
2. Install dependencies: `jspdf`, `vitest`, `@vitest/ui` (optional), `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
3. Update `package.json` scripts to include `test` (vitest) and ensure dev/build work
4. Create `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts` as needed
5. Create base `index.html`, `src/main.tsx`, `src/App.tsx` (minimal placeholder)
6. Create empty `src/styles.css`

**Files to create/modify**:
- `package.json`
- `vite.config.ts`
- `tsconfig.json`, `tsconfig.node.json`
- `index.html`
- `src/main.tsx`, `src/App.tsx`, `src/styles.css`
- `vitest.config.ts` (if needed for tests)

**Manual validation**:
- [ ] Run `npm install` successfully
- [ ] Run `npm run dev` and see the Vite dev server start without errors
- [ ] Run `npm run build` completes successfully with no TypeScript errors
- [ ] Open the app in browser at dev URL and see a basic placeholder page render

---

## Task 2: Define types and utilities (random, storage)
**Goal**: Create the core type definitions and helper utilities that the rest of the app will use.

**Steps**:
1. Create `src/lib/types.ts` with `Operation`, `Problem`, `WorksheetConfig` types as specified in the plan
2. Create `src/lib/random.ts` with a simple RNG function (defaulting to `Math.random()`, exportable for easy replacement)
3. Create `src/lib/storage.ts` for loading/saving `fixedFactors` from/to `localStorage` with sensible defaults and error handling

**Files to create**:
- `src/lib/types.ts`
- `src/lib/random.ts`
- `src/lib/storage.ts`

**Manual validation**:
- [ ] TypeScript compiles without errors (`npm run build` or `tsc --noEmit`)
- [ ] `storage.ts` has functions like `loadFixedFactors()` and `saveFixedFactors(factors: number[])`
- [ ] `random.ts` exports a function that returns numbers in expected range
- [ ] Types are properly exported and importable

---

## Task 3: Implement multiplication problem generator
**Goal**: Create the core logic to generate 63 vertical multiplication problems with selected fixed factors on top and random bottom factors (0-12).

**Steps**:
1. Create `src/lib/generators/multiplication.ts`
2. Implement `generateProblems(config: WorksheetConfig, count: number, rng: () => number): Problem[]`
3. Ensure: if `config.fixedFactors` is empty, throw an error or return empty array (be explicit and predictable)
4. For each problem: `a = pick from fixedFactors`, `b = random in [otherMin, otherMax]` inclusive
5. Generate exactly `count` problems in order (left-to-right, top-to-bottom as consumed by layout)

**Files to create**:
- `src/lib/generators/multiplication.ts`

**Manual validation**:
- [ ] TypeScript compiles without errors
- [ ] Can import and call `generateProblems` with a test config
- [ ] With `fixedFactors: [3]`, all generated `a` values are `3`
- [ ] With `fixedFactors: [2,5]`, all `a` values are either `2` or `5`
- [ ] All `b` values are between 0-12 inclusive
- [ ] Generating 63 problems returns exactly 63 items

---

## Task 4: Write unit tests for the generator
**Goal**: Add tests to verify generator behavior and catch regressions.

**Steps**:
1. Create `tests/multiplication.test.ts` (or `src/lib/generators/multiplication.test.ts`)
2. Configure Vitest if not already configured (update `vite.config.ts` or add `vitest.config.ts`)
3. Write tests:
   - Returns correct count (63)
   - All top operands are from fixedFactors set
   - All bottom operands are in [0,12]
   - Empty fixedFactors throws an error
   - Distribution reasonably covers both factors when multiple selected (optional but nice)
4. Add test script to package.json if needed

**Files to create/modify**:
- `tests/multiplication.test.ts`
- `vitest.config.ts` or `vite.config.ts`
- `package.json` (test script)

**Manual validation**:
- [ ] Run `npm test` and all tests pass
- [ ] Tests fail as expected if generator logic is broken (spot check)
- [ ] Test coverage includes the cases mentioned above

---

## Task 5: Implement PDF generation (jsPDF layout)
**Goal**: Create the function to generate a PDF with the 7×9 vertical multiplication grid matching Rocket Math style.

**Steps**:
1. Create `src/lib/pdf/generateWorksheet.ts`
2. Implement `generateWorksheet(problems: Problem[], config?: Partial<WorksheetConfig>): Blob`
3. Set up jsPDF with Letter size (8.5×11 in), portrait
4. Use margins 0.5 in
5. Calculate cell width = (usableWidth / cols), cell height = (usableHeight / rows)
6. For each problem in order (row by row), draw:
   - Top number, right-aligned near top of cell
   - `×` symbol left of bottom number, bottom number right-aligned to align with top number
   - Horizontal line across ~80% of cell width
   - Rounded rectangle (answer box) below line, centered, dimensions ~0.75×cellWidth × 0.28 in
7. Draw grid left-to-right, top-to-bottom (63 problems total)
8. Return PDF as Blob

**Files to create**:
- `src/lib/pdf/generateWorksheet.ts`

**Manual validation**:
- [ ] TypeScript compiles without errors
- [ ] Can generate a PDF blob from test problems
- [ ] PDF opens correctly in a PDF viewer (download and open manually)
- [ ] Layout shows 7 columns × 9 rows = 63 problems
- [ ] Problems are vertical format with `×` between numbers
- [ ] Each problem has a horizontal line and a rounded answer box underneath
- [ ] No header/title/name line present (as requested)
- [ ] Margins look reasonable (0.5 in)

---

## Task 6: Build UI components (Controls and PdfPreview)
**Goal**: Create the React components for controls and PDF preview.

**Steps**:
1. Create `src/components/Controls.tsx`:
   - Checkbox group for factors 0-12
   - "Select all" and "Clear" buttons/actions
   - Display "Other factor: 0-12" as read-only
   - Randomize button (disabled if no factors selected)
   - Download PDF button
   - Show inline message "Select at least one operand." when no factors selected
   - Props to receive state and callbacks
2. Create `src/components/PdfPreview.tsx`:
   - Accepts PDF Blob or object URL
   - Renders `<iframe>` to display PDF
   - Handles cleanup of object URLs (via callback or effect)
3. Add basic styling classes (will be styled in Task 7)

**Files to create**:
- `src/components/Controls.tsx`
- `src/components/PpPdfPreview.tsx` (or `PdfPreview.tsx`)

**Manual validation**:
- [ ] Components compile without TypeScript errors
- [ ] Controls show all checkboxes 0-12
- [ ] Select all/Clear work as expected
- [ ] Randomize disabled when nothing selected, enabled when something selected
- [ ] Message appears when no factors selected
- [ ] PdfPreview renders iframe element

---

## Task 7: Wire up App with state, generation, and persistence
**Goal**: Connect everything together in App.tsx with proper state management.

**Steps**:
1. Update `src/App.tsx`:
   - State: `fixedFactors` (number[]), `nonce` (number) for triggering regeneration
   - Load `fixedFactors` from localStorage on mount, default to `[3]` if not present
   - Save to localStorage whenever `fixedFactors` change
   - Generate problems using `generateProblems` when `fixedFactors` or `nonce` change
   - Generate PDF blob using `generateWorksheet` when problems change
   - Create object URL for PDF blob, store in state
   - Revoke old object URL when creating new one or on unmount
   - Pass props to Controls and PdfPreview
   - Handle Download button (create temporary link and click)
   - Randomize increments nonce
2. Update `src/styles.css` with plain CSS for centered layout, controls styling, responsive iframe
3. Update `src/main.tsx` if needed

**Files to modify**:
- `src/App.tsx`
- `src/styles.css`
- `src/main.tsx`

**Manual validation**:
- [ ] App loads with default factors `[3]` selected
- [ ] Settings persist - change factors, refresh page, factors remain selected
- [ ] PDF preview updates automatically when factors change
- [ ] Click Randomize generates different problems (bottom numbers change)
- [ ] Click Download PDF downloads a valid PDF file
- [ ] No factors selected → Randomize disabled, message shown, preview may be empty/disabled gracefully
- [ ] Select multiple factors (e.g., 2,3,4) → PDF shows mix of those factors on top
- [ ] Layout is responsive and looks clean

---

## Task 8: Integration testing and polish
**Goal**: End-to-end testing, cleanup, and final verification against requirements.

**Steps**:
1. Run all tests: `npm test`
2. Run build: `npm run build` - ensure no errors
3. Manual end-to-end testing:
   - Fresh load (clear localStorage) → defaults to [3]
   - Generate with single factor, download PDF, verify 63 problems
   - Generate with multiple factors, verify both appear on top
   - Randomize multiple times, verify different bottom numbers
   - Test on mobile viewport (responsive)
4. Check for object URL leaks (regenerate several times)
5. Verify no header/name line in PDF
6. Verify vertical layout with × and answer boxes
7. Clean up any console errors/warnings

**Manual validation**:
- [ ] `npm test` passes all tests
- [ ] `npm run build` succeeds with no errors or warnings
- [ ] PDF has exactly 7×9 grid (63 problems), vertical format
- [ ] No name/header section in PDF
- [ ] Answer boxes are rounded rectangles below horizontal lines
- [ ] Randomize works correctly
- [ ] Download works correctly
- [ ] localStorage persistence works
- [ ] No console errors in browser dev tools
- [ ] App works in dev mode and built preview

---

## Definition of Done
- All tasks completed with manual validations passing
- Tests pass (`npm test`)
- Build succeeds (`npm run build`)
- App meets all requirements: 7×9 vertical multiplication grid, selectable fixed factors (0-12), random other factors (0-12), Randomize and Download buttons, live PDF preview, no header/name line, plain CSS, client-side only
