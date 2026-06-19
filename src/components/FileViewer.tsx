import { useEffect, useState } from "react";
import { X, Download, Loader2 } from "lucide-react";
import { getSignedUrl, type Song } from "@/lib/songs";
import mammoth from "mammoth/mammoth.browser";
import { PdfCanvasViewer, ZoomToolbar } from "./PdfCanvasViewer";

export function FileViewer({ song, onClose }: { song: Song | null; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!song) {
      setUrl(null);
      setDocxHtml(null);
      setError(null);
      return;
    }
    setZoom(1);
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDocxHtml(null);
    (async () => {
      try {
        const signed = await getSignedUrl(song.file_path);
        if (cancelled) return;
        setUrl(signed);
        if (song.file_type === "docx") {
          const resp = await fetch(signed);
          const buf = await resp.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer: buf });
          if (!cancelled) setDocxHtml(result.value);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [song]);

  useEffect(() => {
    if (!song) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [song, onClose]);

  if (!song) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/80 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >
      <div
        className="flex-1 flex flex-col p-3 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 text-background">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl text-ivory">{song.title}</h2>
            <p className="text-xs uppercase tracking-widest opacity-70">
              {song.file_type}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-ivory/30 px-3 py-1.5 text-sm text-ivory hover:bg-ivory/10"
              >
                <Download className="w-4 h-4" /> Scarica
              </a>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-md bg-ivory text-foreground px-3 py-1.5 text-sm font-medium hover:bg-ivory/90"
              aria-label="Chiudi"
            >
              <X className="w-4 h-4" /> Chiudi
            </button>
          </div>
        </div>

        <div className="flex-1 paper-sheet rounded-lg overflow-hidden">
          {loading && (
            <div className="w-full h-full grid place-items-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
          {error && (
            <div className="p-8 text-destructive">Errore: {error}</div>
          )}
          {!loading && !error && url && song.file_type === "pdf" && (
            <PdfCanvasViewer url={url} />
          )}
          {!loading && !error && url && song.file_type === "image" && (
            <div className="relative w-full h-full bg-white">
              <ZoomToolbar
                zoom={zoom}
                onIn={() => setZoom((z) => Math.min(z * 1.25, 4))}
                onOut={() => setZoom((z) => Math.max(z / 1.25, 0.4))}
                onFit={() => setZoom(1)}
              />
              <div
                className="w-full h-full overflow-auto p-4"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <div className="min-w-full min-h-full grid place-items-center">
                  <img
                    src={url}
                    alt={song.title}
                    style={{
                      maxWidth: zoom === 1 ? "100%" : "none",
                      maxHeight: zoom === 1 ? "100%" : "none",
                      width: zoom === 1 ? "auto" : `${zoom * 100}%`,
                      height: "auto",
                      display: "block",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          {!loading && !error && song.file_type === "docx" && docxHtml && (
            <div className="relative w-full h-full bg-white">
              <ZoomToolbar
                zoom={zoom}
                onIn={() => setZoom((z) => Math.min(z * 1.25, 4))}
                onOut={() => setZoom((z) => Math.max(z / 1.25, 0.4))}
                onFit={() => setZoom(1)}
              />
              <div
                className="w-full h-full overflow-auto bg-white text-black"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <div
                  className="docx-content p-8 sm:p-12"
                  style={{
                    fontFamily: "Georgia, serif",
                    lineHeight: 1.6,
                    // `zoom` è supportato da Safari (incluso iOS 12) e ridimensiona
                    // anche il layout, non solo l'aspetto come `transform: scale`.
                    zoom: zoom,
                  }}
                  dangerouslySetInnerHTML={{ __html: docxHtml }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}