import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export function PdfCanvasViewer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
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
        const targetWidth = Math.min(container.clientWidth - 16, 1200);
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = targetWidth / baseViewport.width;
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
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
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
  }, [url]);

  return (
    <div className="w-full h-full overflow-auto bg-white p-2 sm:p-4" style={{ WebkitOverflowScrolling: "touch" }}>
      {loading && (
        <div className="w-full grid place-items-center py-12 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}
      {error && <div className="p-6 text-destructive">Errore: {error}</div>}
      <div ref={containerRef} />
    </div>
  );
}