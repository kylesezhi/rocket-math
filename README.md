# Rocket Math Multiplication Worksheet Generator

A static, client-side web app built with Vite + React + TypeScript for generating Rocket Math-style multiplication worksheets as PDFs. 

## Features

- **Instant PDF Generation**: Creates a 7×8 grid (56 problems) of vertical multiplication problems
- **Customizable Factors**: Select one or more fixed factors (1-12) to practice; the other operand is randomly chosen from 1-12
- **PDF Preview**: Embedded preview of the generated worksheet before downloading
- **Randomize**: Generate a new set of random problems with the click of a button
- **Download as PDF**: Save the worksheet to your device
- **Persistent Settings**: Your selected factors are saved in localStorage
- **Clean Layout**: Rocket Math-style vertical format with blank rounded answer boxes, no headers or page numbers

## Tech Stack

- [Vite](https://vitejs.dev/) - Build tool and dev server
- [React 19](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [Vitest](https://vitest.dev/) - Unit testing
- [Oxlint](https://oxc.rs/) - Linting

## Getting Started

### Prerequisites

- Node.js (version compatible with dependencies)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Testing

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

### Linting

```bash
npm run lint
```

## How It Works

1. **Select Factors**: Choose one or more numbers from 1-12 as the fixed factor (appears on top in vertical problems)
2. **Generate Worksheet**: The app creates 63 random problems where one operand is from your selected factors and the other is randomly chosen from 1-12
3. **Preview & Download**: View the PDF in the embedded preview or download it directly

## Project Structure

```
src/
  components/        # React components (Controls, PdfPreview)
  lib/
    generators/      # Problem generation logic
    pdf/             # PDF layout and generation
    types.ts         # Type definitions
    random.ts        # RNG utilities
    storage.ts       # localStorage persistence
  App.tsx           # Main application component
  styles.css        # Application styles
```
