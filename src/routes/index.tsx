import { createFileRoute, Link } from "@tanstack/react-router";
import { Library, ListMusic, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Canti della Messa — Il repertorio del coro" },
      {
        name: "description",
        content:
          "Un luogo sereno dove raccogliere i canti e organizzare ogni celebrazione.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-6">
            Repertorio liturgico
          </p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-foreground">
            I canti del coro,
            <br />
            <span className="italic text-gold-deep">sempre a portata di mano.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Carica gli accordi e gli spartiti, poi scegli quale canto suonare per
            ogni parte della messa. Tutto su carta bianca, leggibile come
            uno spartito stampato.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/messa"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium shadow-md hover:shadow-lg hover:bg-primary/90 transition"
            >
              Prepara la messa <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/canti"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium hover:bg-secondary transition"
            >
              Vai al repertorio
            </Link>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-24 grid sm:grid-cols-2 gap-6">
          <Link
            to="/canti"
            className="group rounded-2xl border border-border bg-card p-8 hover:border-accent transition shadow-sm hover:shadow-md"
          >
            <Library className="w-7 h-7 text-accent" />
            <h2 className="font-display text-2xl mt-4">Il repertorio</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Carica i canti in PDF, JPG, PNG o DOCX. Li ritrovi tutti in un
              elenco ordinato, pronti da visualizzare a tutta pagina.
            </p>
            <span className="mt-4 inline-flex items-center text-sm text-foreground gap-1 group-hover:gap-2 transition-all">
              Aggiungi e gestisci <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
          <Link
            to="/messa"
            className="group rounded-2xl border border-border bg-card p-8 hover:border-accent transition shadow-sm hover:shadow-md"
          >
            <ListMusic className="w-7 h-7 text-accent" />
            <h2 className="font-display text-2xl mt-4">La celebrazione</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Inizio, Kyrie, Gloria, Alleluja, Offertorio, Santo, Agnello,
              Comunione, Fine. Assegna un canto ad ogni momento, con ricerca
              rapida.
            </p>
            <span className="mt-4 inline-flex items-center text-sm text-foreground gap-1 group-hover:gap-2 transition-all">
              Apri la scaletta <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </section>
      </main>
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Per il coro — pace e bene.
      </footer>
    </div>
  );
}