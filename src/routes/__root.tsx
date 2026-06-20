import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Canti della Messa — Repertorio del coro" },
      { name: "description", content: "Carica e organizza i canti liturgici del coro: accordi e spartiti in PDF, immagine o DOCX, scelti per ogni parte della messa." },
      { property: "og:title", content: "Canti della Messa — Repertorio del coro" },
      { property: "og:description", content: "Carica e organizza i canti liturgici del coro: accordi e spartiti in PDF, immagine o DOCX, scelti per ogni parte della messa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Canti della Messa — Repertorio del coro" },
      { name: "twitter:description", content: "Carica e organizza i canti liturgici del coro: accordi e spartiti in PDF, immagine o DOCX, scelti per ogni parte della messa." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/7DGcEAEicGb7dCKNcBCUaOxuGzZ2/social-images/social-1781605535981-images.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/7DGcEAEicGb7dCKNcBCUaOxuGzZ2/social-images/social-1781605535981-images.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          globalThis polyfill — MUST run before any other script.
          Safari 12.0 doesn't have `globalThis` (added in Safari 12.1), and several
          bundled dependencies (e.g. pdf.js's compatibility shim) reference
          `globalThis` directly without a `typeof` guard. Without this, the very
          first script tag throws `ReferenceError: Can't find variable: globalThis`
          and the whole app fails to boot — a blank white page with nothing in the
          DOM, since React never gets a chance to mount.
          Written in plain ES5 (no arrow functions, no let/const-only features
          that could trip older parsers) so it runs even before any transpiled
          bundle is requested.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){if(typeof globalThis==='undefined'){" +
              "if(typeof self!=='undefined'){self.globalThis=self;}" +
              "else if(typeof window!=='undefined'){window.globalThis=window;}" +
              "else if(typeof global!=='undefined'){global.globalThis=global;}" +
              "else{Function('return this')().globalThis=Function('return this')();}" +
              "}})();",
          }}
        />

        {/*
          TEMPORARY — iOS 12 debug logger.
          Catches the very first script error (the one causing the blank page)
          and any unhandled promise rejection, then sends it via XMLHttpRequest
          (not fetch — Safari 12 has fetch, but XHR is the safest common
          denominator) to a temporary webhook.site inbox. Plain ES5 only,
          runs before any bundled/transpiled script.
          REMOVE THIS BLOCK once debugging is done.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){" +
              "var ENDPOINT='https://webhook.site/c0866ceb-3ae5-4fe4-8ab1-ac6a3fc5259f';" +
              "function send(payload){" +
              "try{" +
              "var xhr=new XMLHttpRequest();" +
              "xhr.open('POST',ENDPOINT,true);" +
              "xhr.setRequestHeader('Content-Type','text/plain');" +
              "xhr.send(JSON.stringify(payload));" +
              "}catch(e){}" +
              "}" +
              "function info(){" +
              "var ua='';try{ua=navigator.userAgent;}catch(e){}" +
              "return {ua:ua,url:String(location.href),time:new Date().toString()};" +
              "}" +
              "if(typeof window!=='undefined'&&window.addEventListener){" +
              "window.addEventListener('error',function(ev){" +
              "var d=info();" +
              "d.kind='error';" +
              "d.message=ev&&ev.message?String(ev.message):'unknown error';" +
              "d.source=ev&&ev.filename?String(ev.filename):'';" +
              "d.lineno=ev&&ev.lineno?ev.lineno:0;" +
              "d.colno=ev&&ev.colno?ev.colno:0;" +
              "try{d.stack=ev&&ev.error&&ev.error.stack?String(ev.error.stack):'';}catch(e){d.stack='';}" +
              "send(d);" +
              "});" +
              "window.addEventListener('unhandledrejection',function(ev){" +
              "var d=info();" +
              "d.kind='unhandledrejection';" +
              "try{d.message=ev&&ev.reason?String(ev.reason.message||ev.reason):'unknown rejection';}catch(e){d.message='unknown rejection';}" +
              "try{d.stack=ev&&ev.reason&&ev.reason.stack?String(ev.reason.stack):'';}catch(e){d.stack='';}" +
              "send(d);" +
              "});" +
              "}" +
              "send((function(){var d=info();d.kind='boot';d.message='inline script reached';return d;})());" +
              "})();",
          }}
        />

        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
