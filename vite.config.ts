import { defineConfig } from "vite";
import copy from "rollup-plugin-copy";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";
import { readFile } from "node:fs/promises";
import { htmlToMarkdown } from "./scripts/markdown.mjs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "public-site-documents",
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          if (request.method !== "GET" && request.method !== "HEAD") return next();
          const url = new URL(request.url || "/", "http://localhost");
          if (/^\/(?:@|src\/|node_modules\/)/.test(url.pathname)) return next();
          try {
            const site = await server.ssrLoadModule("/src/site/render.ts");
            if (url.pathname === "/__site/routes.js") {
              response.setHeader("Content-Type", "application/javascript; charset=utf-8");
              response.end(request.method === "HEAD" ? undefined : site.renderCompatibilityScript());
              return;
            }
            const machine = site.renderMachineDocuments()[url.pathname];
            if (machine !== undefined) {
              const type = url.pathname.endsWith(".md") ? "text/markdown"
                : url.pathname.endsWith(".json") ? "application/json"
                : url.pathname.endsWith(".jsonl") ? "application/x-ndjson"
                : url.pathname.endsWith(".xml") ? "application/xml" : "text/plain";
              response.setHeader("Content-Type", `${type}; charset=utf-8`);
              response.end(request.method === "HEAD" ? undefined : machine);
              return;
            }
            const markdown = site.markdownPages.find(
              (page: { markdown: string }) => page.markdown === url.pathname,
            );
            if (markdown) {
              let html = markdown.path === "/" ? site.renderHome() : site.renderDocument(markdown.path);
              if (!html) {
                const workshop = await server.ssrLoadModule("/src/workshop/render.tsx");
                html = workshop.renderWorkshop(markdown.path, "/__workshop/2026.css");
              }
              response.setHeader("Content-Type", "text/markdown; charset=utf-8");
              response.end(request.method === "HEAD" ? undefined
                : htmlToMarkdown(html, `${site.site.origin}${markdown.path}`));
              return;
            }
            const canonical = site.canonicalLocalRoute(url.pathname);
            if (canonical && canonical !== url.pathname) {
              response.statusCode = 308;
              response.setHeader("Location", canonical + url.search);
              response.end();
              return;
            }
            let html: string | undefined;
            if (canonical === "/" || canonical === "/static/") {
              html = site.renderHome();
            } else if (canonical && site.renderDocument(canonical)) {
              html = site.renderDocument(canonical);
            } else {
              const app = site.appPages.find((page: { path: string }) => page.path === canonical);
              const shortcut = site.shortcutPages.find((page: { path: string }) => page.path === canonical);
              if (app) {
                html = (await readFile(path.resolve(__dirname, "app.html"), "utf8"))
                  .replace(/<title>.*?<\/title>/s, `<title>${site.escapeHtml(app.title)} | Aditya Singhal</title>`)
                  .replace("<!-- site:route-compatibility -->", '<script src="/__site/routes.js"></script>');
              } else if (shortcut) {
                html = site.renderShortcut(shortcut);
              } else if (canonical && canonical !== "/404.html") {
                // The existing workshop middleware owns its documents.
                return next();
              } else if (!path.extname(url.pathname) || url.pathname.endsWith(".html")) {
                response.statusCode = 404;
                html = site.renderNotFound();
              }
            }
            if (!html) return next();
            response.setHeader("Content-Type", "text/html; charset=utf-8");
            response.end(
              request.method === "HEAD" ? undefined : await server.transformIndexHtml(url.pathname, html),
            );
          } catch (error) {
            next(error as Error);
          }
        });
      },
    },
    {
      name: "workshop-documents",
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          const url = new URL(request.url || "/", "http://localhost");
          if (request.method !== "GET" && request.method !== "HEAD")
            return next();
          try {
            const stylesheet = url.pathname.match(
              /^\/__workshop\/(2025|2026)\.css$/,
            );
            if (stylesheet) {
              const component =
                stylesheet[1] === "2025"
                  ? "AgenticAIWorkshop2025"
                  : "AgenticAIWorkshop";
              const [base, css, recordings] = await Promise.all([
                readFile(
                  path.resolve(__dirname, "src/workshop/base.css"),
                  "utf8",
                ),
                readFile(
                  path.resolve(
                    __dirname,
                    `src/components/${component}/${component}.css`,
                  ),
                  "utf8",
                ),
                readFile(
                  path.resolve(__dirname, "src/workshop/recordings.css"),
                  "utf8",
                ),
              ]);
              response.setHeader("Content-Type", "text/css; charset=utf-8");
              response.end(base + "\n" + css + "\n" + recordings);
              return;
            }
            if (
              !/^\/(?:agentic-ai-workshop(?:-2025)?(?:\/|$)|registration-form\/?$)/.test(
                url.pathname,
              )
            )
              return next();
            const { renderWorkshop, pageDefinitions } =
              await server.ssrLoadModule("/src/workshop/render.tsx");
            const canonical = url.pathname.endsWith("/")
              ? url.pathname
              : url.pathname + "/";
            const page = pageDefinitions.find(
              (entry: { path: string }) => entry.path === canonical,
            );
            if (!page) return next();
            if (url.pathname !== canonical) {
              response.statusCode = 302;
              response.setHeader("Location", canonical + url.search);
              response.end();
              return;
            }
            response.setHeader("Content-Type", "text/html; charset=utf-8");
            response.end(
              renderWorkshop(
                canonical,
                `/__workshop/${page.kind === "archive" ? 2025 : 2026}.css`,
              ),
            );
          } catch (error) {
            next(error as Error);
          }
        });
      },
    },
    visualizer({
      filename: "temp/build-reports/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/contexts": path.resolve(__dirname, "./src/contexts"),
      "@/images": path.resolve(__dirname, "./src/images"),
      "@/config": path.resolve(__dirname, "./src/config"),
    },
  },
  server: {
    fs: {
      strict: false,
      allow: [".."],
    },
    watch: {
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/.DS_Store",
        "**/Trash/**",
        "**/.Trash/**",
      ],
    },
  },
  build: {
    // NOTE: vite is pinned to an EXACT version (8.0.16) in package.json, not a
    // caret range, to patch the two vite Dependabot CVEs deterministically.
    //
    // The manualChunks below restores the vendor split we had on vite 8.0.8.
    // That split used to come from a rolldown default that changed in later
    // 8.0.x/8.1.x releases (which merge all vendor code into the single ~700kB
    // entry chunk). We reinstate it explicitly so the large, near-static
    // firebase dep stays in its own chunk and remains cached across app-code
    // deploys, instead of being re-downloaded every ship.
    //
    // What we deliberately did NOT do, and why:
    //  - Did NOT use a catch-all `node_modules -> 'vendor'` rule: because the
    //    eager graph imports firebase, a single vendor chunk drags lazy-only
    //    deps (firestore, confetti, react-spring, charts) onto the eager path,
    //    growing first-load from ~216kB to ~258kB gzip. The targeted rule below
    //    only names firebase + react, so everything else keeps its default
    //    (lazy, per-route) chunking.
    // If you bump vite, re-check temp/build-reports/stats.html and the eager
    // modulepreload set in the generated application documents before shipping.
    rollupOptions: {
      input: path.resolve(__dirname, "app.html"),
      plugins: [
        copy({
          targets: [{ src: "public/CNAME", dest: "dist" }],
        }),
      ],
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/@firebase") ||
            id.includes("node_modules/firebase")
          ) {
            return "firebase";
          }
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "react";
          }
        },
      },
    },
  },
});
