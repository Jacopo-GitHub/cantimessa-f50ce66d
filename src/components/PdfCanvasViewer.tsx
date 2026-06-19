import { useEffect, useRef, useState } from "react";
import { Loader2, Download, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
// Build "legacy" di pdf.js: compatibile con Safari iOS 12+.
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export function PdfCanvasViewer({ url }: { url: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // userZoom = 1 → "fit". L'utente può zoomare in/out.
  const [userZoom, setUserZoom] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const scroller = scrollRef.current;
    const container = pagesRef.current;
    if (!container) return;
    container.innerHTML = "";
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const resp = await fetch(url);
        const buf = await resp.arrayBuffer();
        if (cancelled) return;
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        if (cancelled) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const availW = (scroller?.clientWidth ?? container.clientWidth) - 16;
        const availH = (scroller?.clientHeight ?? 800) - 16;
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const baseViewport = page.getViewport({ scale: 1 });
          // Fit: la pagina intera entra a schermo (sia in larghezza che in altezza).
          const fitScale = Math.min(
            availW / baseViewport.width,
            availH / baseViewport.height,
          );
          const scale = Math.max(fitScale, 0.1) * userZoom;
          const viewport = page.getViewport({ scale: scale * dpr });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${viewport.width / dpr}px`;
          canvas.style.height = `${viewport.height / dpr}px`;
          canvas.style.display = "block";
          canvas.style.margin = "0 auto 16px";
          canvas.style.background = "white";
          canvas.style.boxShadow = "0 1px 3px rgba(0,0,0,0.15)";
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          container.appendChild(canvas);
          await page.render({ canvasContext: ctx, viewport, canvas } as Parameters<typeof page.render>[0]).promise;
        }
        if (!cancelled) setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, userZoom]);

  return (
    <div className="relative w-full h-full bg-white">
      <ZoomToolbar
        zoom={userZoom}
        onIn={() => setUserZoom((z) => Math.min(z * 1.25, 4))}
        onOut={() => setUserZoom((z) => Math.max(z / 1.25, 0.4))}
        onFit={() => setUserZoom(1)}
      />
      <div
        ref={scrollRef}
        className="w-full h-full overflow-auto p-2 sm:p-4"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {loading && (
        <div className="w-full grid place-items-center py-12 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}
      {error && (
        <div className="p-6 text-center space-y-3">
          <div className="text-destructive text-sm">
            Impossibile mostrare il PDF su questo dispositivo.
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
          >
            <Download className="w-4 h-4" /> Scarica / Apri il PDF
          </a>
        </div>
      )}
        <div ref={pagesRef} />
      </div>
    </div>
  );
}

export function ZoomToolbar({
  zoom,
  onIn,
  onOut,
  onFit,
}: {
  zoom: number;
  onIn: () => void;
  onOut: () => void;
  onFit: () => void;
}) {
  return (
    <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md bg-foreground/80 text-ivory px-1 py-1 shadow-md">
      <button
        onClick={onOut}
        className="p-1.5 rounded hover:bg-ivory/15"
        aria-label="Riduci"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        onClick={onFit}
        className="px-2 py-1 text-xs rounded hover:bg-ivory/15 inline-flex items-center gap-1"
        aria-label="Adatta allo schermo"
        title="Adatta allo schermo"
      >
        <Maximize2 className="w-3.5 h-3.5" />
        <span className="tabular-nums">{Math.round(zoom * 100)}%</span>
      </button>
      <button
        onClick={onIn}
        className="p-1.5 rounded hover:bg-ivory/15"
        aria-label="Ingrandisci"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
    </div>
  );
}