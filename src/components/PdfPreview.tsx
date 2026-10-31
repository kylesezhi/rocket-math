import React, { useEffect, useState } from 'react';

export interface PdfPreviewProps {
  /** Object URL to display (aliases supported: src, pdfUrl, objectUrl). */
  url?: string | null;
  src?: string | null;
  pdfUrl?: string | null;
  objectUrl?: string | null;
  /** Blob to display; component creates/revokes object URL. */
  blob?: Blob | null;
  title?: string;
  className?: string;
}

export function PdfPreview(props: PdfPreviewProps): React.ReactElement {
  const externalUrl = props.url ?? props.src ?? props.pdfUrl ?? props.objectUrl ?? null;

  const [internalUrl, setInternalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!props.blob) {
      setInternalUrl(null);
      return;
    }
    const url = URL.createObjectURL(props.blob);
    setInternalUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [props.blob]);

  const src = externalUrl ?? internalUrl;

  const iframeTitle = props.title ?? 'PDF preview';

  if (!src) {
    return (
      <div className={`pdf-preview pdf-preview--empty ${props.className ?? ''}`}>
        <p>No PDF to preview.</p>
      </div>
    );
  }

  return (
    <div className={`pdf-preview ${props.className ?? ''}`}>
      <iframe
        src={src}
        title={iframeTitle}
        className="pdf-preview__iframe"
      />
    </div>
  );
}

export default PdfPreview;