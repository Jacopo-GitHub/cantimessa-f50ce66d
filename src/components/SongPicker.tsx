import { useMemo, useState, useEffect } from "react";
import { Search, X, Check } from "lucide-react";
import type { Song } from "@/lib/songs";

export function SongPicker({
  open,
  songs,
  currentId,
  title,
  onClose,
  onPick,
}: {
  open: boolean;
  songs: Song[];
  currentId: string | null;
  title: string;
  onClose: () => void;
  onPick: (id: string | null) => void;
}) {
  const [q, setQ] = useState("");
  useEffect(() => {
    if (open) setQ("");
  }, [open]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return songs;
    return songs.filter((s) => s.title.toLowerCase().includes(t));
  }, [q, songs]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-40 bg-foreground/60 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-card text-card-foreground rounded-xl shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">
              Scegli canto
            </p>
            <h3 className="font-display text-2xl">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-secondary"
            aria-label="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca un canto..."
              className="w-full pl-9 pr-3 py-2.5 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="max-h-[55vh] overflow-y-auto border-t border-border">
          {currentId && (
            <button
              onClick={() => onPick(null)}
              className="w-full text-left px-5 py-3 text-sm text-destructive hover:bg-secondary border-b border-border"
            >
              Rimuovi assegnazione
            </button>
          )}
          {filtered.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              Nessun canto trovato.
            </p>
          )}
          {filtered.map((s) => {
            const active = s.id === currentId;
            return (
              <button
                key={s.id}
                onClick={() => onPick(s.id)}
                className={`w-full text-left px-5 py-3 flex items-center justify-between gap-3 hover:bg-secondary transition-colors ${
                  active ? "bg-secondary" : ""
                }`}
              >
                <span className="flex-1 truncate">{s.title}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.file_type}
                </span>
                {active && <Check className="w-4 h-4 text-accent" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}