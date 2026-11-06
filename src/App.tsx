import React, { useEffect, useState } from 'react';
import { Controls } from './components/Controls';
import { PdfPreview } from './components/PdfPreview';
import { BASE_CONFIG } from './lib/config';
import { generateProblems } from './lib/generators/multiplication';
import { generateWorksheet } from './lib/pdf/generateWorksheet';
import { loadFixedFactors, saveFixedFactors } from './lib/storage';
import type { Problem, WorksheetConfig } from './lib/types';

function App(): React.ReactElement {
  const [fixedFactors, setFixedFactors] = useState<number[]>(() => loadFixedFactors());
  const [nonce, setNonce] = useState(0);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Persist settings whenever they change.
  useEffect(() => {
    saveFixedFactors(fixedFactors);
  }, [fixedFactors]);

  // Regenerate problems whenever factors or nonce change.
  useEffect(() => {
    if (fixedFactors.length === 0) {
      setProblems([]);
      return;
    }
    const config: WorksheetConfig = { ...BASE_CONFIG, fixedFactors };
    const next = generateProblems(config, 63);
    setProblems(next);
  }, [fixedFactors, nonce]);

  // Regenerate PDF whenever problems change.
  useEffect(() => {
    if (problems.length === 0) {
      setPdfBlob(null);
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const blob = generateWorksheet(problems);
    const url = URL.createObjectURL(blob);
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setPdfBlob(blob);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [problems]);

  const handleRandomize = () => setNonce((n) => n + 1);

  const handleDownload = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'multiplication-worksheet.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const noFactors = fixedFactors.length === 0;

  return (
    <main className="app">
      <h1 className="app__title">Rocket Math Multiplication</h1>
      <Controls
        fixedFactors={fixedFactors}
        onChange={setFixedFactors}
        onRandomize={handleRandomize}
        onDownload={handleDownload}
        randomizeDisabled={noFactors}
        downloadDisabled={noFactors || !pdfBlob}
      />
      <div className="app__preview">
        <PdfPreview url={pdfUrl} />
      </div>
    </main>
  );
}

export default App;
export { App };