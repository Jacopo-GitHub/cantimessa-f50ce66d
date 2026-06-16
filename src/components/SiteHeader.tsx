import { Link } from "@tanstack/react-router";
import { Music } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 backdrop-blur-sm bg-background/70 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-sm">
            <Music className="w-4 h-4" />
          </span>
          <span className="font-display text-xl tracking-tight">
            Canti <span className="text-accent">della Messa</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/canti"
            className="px-3 py-2 rounded-md hover:bg-secondary transition-colors"
            activeProps={{ className: "px-3 py-2 rounded-md bg-secondary text-foreground font-medium" }}
          >
            Repertorio
          </Link>
          <Link
            to="/messa"
            className="px-3 py-2 rounded-md hover:bg-secondary transition-colors"
            activeProps={{ className: "px-3 py-2 rounded-md bg-secondary text-foreground font-medium" }}
          >
            Messa
          </Link>
        </nav>
      </div>
    </header>
  );
}