import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Eye, Plus, Pencil, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { FileViewer } from "@/components/FileViewer";
import { SongPicker } from "@/components/SongPicker";
import {
  MASS_PARTS,
  listSongs,
  listAssignments,
  setAssignment,
  type MassPartKey,
  type Song,
} from "@/lib/songs";

export const Route = createFileRoute("/messa")({
  head: () => ({
    meta: [
      { title: "La messa — Scelta dei canti" },
      { name: "description", content: "Scegli un canto per ogni parte della celebrazione." },
    ],
  }),
  component: MessaPage,
});

function MessaPage() {
  const qc = useQueryClient();
  const songsQ = useQuery({ queryKey: ["songs"], queryFn: listSongs });
  const assignsQ = useQuery({ queryKey: ["assignments"], queryFn: listAssignments });

  const songsById = useMemo(() => {
    const m = new Map<string, Song>();
    (songsQ.data ?? []).forEach((s) => m.set(s.id, s));
    return m;
  }, [songsQ.data]);

  const assignMap = useMemo(() => {
    const m = new Map<MassPartKey, string | null>();
    (assignsQ.data ?? []).forEach((a) => m.set(a.part, a.song_id));
    return m;
  }, [assignsQ.data]);

  const [pickerFor, setPickerFor] = useState<MassPartKey | null>(null);
  const [viewing, setViewing] = useState<Song | null>(null);

  const setMut = useMutation({
    mutationFn: ({ part, id }: { part: MassPartKey; id: string | null }) =>
      setAssignment(part, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });

  const pickerPart = pickerFor ? MASS_PARTS.find((p) => p.key === pickerFor)! : null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">La celebrazione</p>
          <h1 className="font-display text-4xl mt-1">Scaletta della messa</h1>
          <p className="text-muted-foreground mt-2">
            Tocca una parte per scegliere il canto dal repertorio.
          </p>
        </header>

        {songsQ.isLoading || assignsQ.isLoading ? (
          <div className="py-16 text-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin inline-block" />
          </div>
        ) : (
          <ol className="space-y-3">
            {MASS_PARTS.map((p, i) => {
              const songId = assignMap.get(p.key) ?? null;
              const song = songId ? songsById.get(songId) ?? null : null;
              return (
                <li
                  key={p.key}
                  className="group rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <div className="flex items-stretch">
                    <div className="w-14 bg-secondary grid place-items-center font-display text-xl text-gold-deep">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="flex-1 px-5 py-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">
                          {p.label}
                        </p>
                        {song ? (
                          <p className="font-display text-xl truncate mt-0.5">
                            {song.title}
                          </p>
                        ) : (
                          <p className="font-display text-xl italic text-muted-foreground mt-0.5">
                            Nessun canto scelto
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {song && (
                          <button
                            onClick={() => setViewing(song)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-secondary"
                          >
                            <Eye className="w-4 h-4" /> Apri
                          </button>
                        )}
                        <button
                          onClick={() => setPickerFor(p.key)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm hover:bg-primary/90"
                        >
                          {song ? (
                            <>
                              <Pencil className="w-4 h-4" /> Cambia
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" /> Scegli
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {(songsQ.data ?? []).length === 0 && !songsQ.isLoading && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Il repertorio è vuoto. Aggiungi prima qualche canto dalla pagina
            <a href="/canti" className="text-accent underline ml-1">Repertorio</a>.
          </p>
        )}
      </main>

      <SongPicker
        open={pickerFor !== null}
        title={pickerPart?.label ?? ""}
        songs={songsQ.data ?? []}
        currentId={pickerFor ? assignMap.get(pickerFor) ?? null : null}
        onClose={() => setPickerFor(null)}
        onPick={(id) => {
          if (pickerFor) setMut.mutate({ part: pickerFor, id });
          setPickerFor(null);
        }}
      />

      <FileViewer song={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}