import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { Upload, Search, Trash2, FileText, Image as ImageIcon, FileType2, Loader2, Eye, X, CheckCircle2, AlertCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { FileViewer } from "@/components/FileViewer";
import { listSongs, uploadSong, deleteSong, classifyFile, type Song } from "@/lib/songs";

export const Route = createFileRoute("/canti")({
  head: () => ({
    meta: [
      { title: "Repertorio — Canti della Messa" },
      { name: "description", content: "Carica e gestisci tutti i canti del coro." },
    ],
  }),
  component: CantiPage,
});

function iconFor(type: string) {
  if (type === "pdf") return <FileText className="w-4 h-4" />;
  if (type === "image") return <ImageIcon className="w-4 h-4" />;
  return <FileType2 className="w-4 h-4" />;
}

function CantiPage() {
  const qc = useQueryClient();
  const { data: songs = [], isLoading } = useQuery({
    queryKey: ["songs"],
    queryFn: listSongs,
  });

  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<Song | null>(null);
  const [items, setItems] = useState<Array<{ file: File; title: string; status: "pending" | "uploading" | "done" | "error"; error?: string }>>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const next: typeof items = [];
    const errors: string[] = [];
    for (const f of Array.from(fileList)) {
      if (classifyFile(f) === "unsupported") {
        errors.push(`${f.name}: formato non supportato`);
        continue;
      }
      next.push({
        file: f,
        title: f.name.replace(/\.[^.]+$/, ""),
        status: "pending",
      });
    }
    setItems((prev) => [...prev, ...next]);
    setGlobalError(errors.length ? errors.join(" · ") : null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function uploadAll() {
    if (items.length === 0 || isUploading) return;
    setIsUploading(true);
    setGlobalError(null);
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.status === "done") continue;
      if (!it.title.trim()) {
        setItems((prev) => prev.map((p, idx) => idx === i ? { ...p, status: "error", error: "Titolo mancante" } : p));
        continue;
      }
      setItems((prev) => prev.map((p, idx) => idx === i ? { ...p, status: "uploading", error: undefined } : p));
      try {
        await uploadSong(it.file, it.title.trim());
        setItems((prev) => prev.map((p, idx) => idx === i ? { ...p, status: "done" } : p));
      } catch (e) {
        setItems((prev) => prev.map((p, idx) => idx === i ? { ...p, status: "error", error: (e as Error).message } : p));
      }
    }
    setIsUploading(false);
    qc.invalidateQueries({ queryKey: ["songs"] });
    setItems((prev) => prev.filter((p) => p.status !== "done"));
  }

  const remove = useMutation({
    mutationFn: deleteSong,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["songs"] }),
  });

  const filtered = useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return songs;
    return songs.filter((s) => s.title.toLowerCase().includes(t));
  }, [query, songs]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Repertorio</p>
          <h1 className="font-display text-4xl mt-1">Tutti i canti</h1>
          <p className="text-muted-foreground mt-2">
            Carica i tuoi spartiti e accordi. Formati ammessi: PDF, JPG, PNG, DOCX.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-2xl mb-4">Aggiungi canti</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Puoi selezionare più file insieme. Per ognuno potrai modificare il titolo prima di caricarli.
          </p>
          <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-background/50 px-4 py-8 text-sm cursor-pointer hover:bg-secondary/60 transition">
            <Upload className="w-6 h-6 text-accent" />
            <span className="font-medium">Scegli uno o più file</span>
            <span className="text-xs text-muted-foreground">PDF, JPG, PNG, DOCX</span>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.docx,application/pdf,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>
          {globalError && <p className="mt-3 text-sm text-destructive">{globalError}</p>}

          {items.length > 0 && (
            <>
              <ul className="mt-5 space-y-2">
                {items.map((it, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2">
                    <span className="w-8 h-8 rounded-full bg-secondary text-gold-deep grid place-items-center shrink-0">
                      {iconFor(classifyFile(it.file))}
                    </span>
                    <input
                      type="text"
                      value={it.title}
                      onChange={(e) => {
                        const v = e.target.value;
                        setItems((prev) => prev.map((p, idx) => idx === i ? { ...p, title: v } : p));
                      }}
                      disabled={it.status === "uploading" || it.status === "done"}
                      className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
                    />
                    <span className="text-xs text-muted-foreground truncate max-w-[120px] hidden sm:inline">{it.file.name}</span>
                    {it.status === "pending" && (
                      <button
                        onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        aria-label="Rimuovi"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {it.status === "uploading" && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
                    {it.status === "done" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {it.status === "error" && (
                      <span className="inline-flex items-center gap-1 text-destructive text-xs" title={it.error}>
                        <AlertCircle className="w-4 h-4" />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={uploadAll}
                  disabled={isUploading || items.every((p) => p.status === "done")}
                  className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Carica {items.filter((p) => p.status !== "done").length} canti
                </button>
                {!isUploading && (
                  <button
                    onClick={() => setItems([])}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Svuota elenco
                  </button>
                )}
              </div>
            </>
          )}
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-display text-2xl">Elenco ({songs.length})</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca un canto..."
                className="pl-9 pr-3 py-2 rounded-md bg-card border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring w-56"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin inline-block" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
              {songs.length === 0
                ? "Ancora nessun canto. Carica il primo qui sopra."
                : "Nessun canto corrisponde alla ricerca."}
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
              {filtered.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/60 transition"
                >
                  <span className="w-9 h-9 rounded-full bg-secondary text-gold-deep grid place-items-center">
                    {iconFor(s.file_type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {s.original_name} · {s.file_type.toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewing(s)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-secondary"
                  >
                    <Eye className="w-4 h-4" /> Apri
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Eliminare "${s.title}"?`)) remove.mutate(s);
                    }}
                    className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label="Elimina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <FileViewer song={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}