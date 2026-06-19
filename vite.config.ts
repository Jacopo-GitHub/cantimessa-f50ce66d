// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      legacy({
        targets: ["iOS >= 12", "Safari >= 12"],
        modernPolyfills: true,
        additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
      }),
    ],
    build: {
      target: ["es2017", "safari12"],
      cssTarget: "safari12",
    },
    esbuild: {
      target: "es2017",
      supported: {
        "optional-chaining": false,
        "nullish-coalescing": false,
        "logical-assignment": false,
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "es2017",
        supported: {
          "optional-chaining": false,
          "nullish-coalescing": false,
          "logical-assignment": false,
        },
      },
    },
  },
});
