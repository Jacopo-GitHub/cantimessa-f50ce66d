import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { Upload, Search, Trash2, FileText, Image as ImageIcon, FileType2, Loader2, Eye } from "lucide-react";
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
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Scegli un file");
      if (!title.trim()) throw new Error("Inserisci il titolo del canto");
      return uploadSong(file, title.trim());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["songs"] });
      setTitle("");
      setFile(null);
      setError(null);
      if (inputRef.current) inputRef.current.value = "";
    },
    onError: (e: Error) => setError(e.message),
  });

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
          <h2 className="font-display text-2xl mb-4">Aggiungi un canto</h2>
          <div className="grid sm:grid-cols-[1fr_auto] gap-3">
            <input
              type="text"
              placeholder="Titolo del canto (es. Symbolum 77)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-md bg-background border border-input px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <label className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2.5 text-sm cursor-pointer hover:bg-secondary">
              <Upload className="w-4 h-4" />
              {file ? file.name : "Scegli un file"}
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.docx,application/pdf,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  if (f && classifyFile(f) === "unsupported") {
                    setError("Formato non supportato. Usa PDF, JPG, PNG o DOCX.");
                    setFile(null);
                    e.target.value = "";
                    return;
                  }
                  setError(null);
                  setFile(f);
                  if (f && !title) {
                    setTitle(f.name.replace(/\.[^.]+$/, ""));
                  }
                }}
              />
            </label>
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <div className="mt-4">
            <button
              onClick={() => upload.mutate()}
              disabled={upload.isPending || !file || !title.trim()}
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {upload.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Carica canto
            </button>
          </div>
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