import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { build } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "dist");
await build({
  root, configFile: false, envFile: false, publicDir: false,
  build: {
    ssr: "src/site/render.ts",
    outDir: "dist-ssr/site",
    rollupOptions: { output: { entryFileNames: "render.mjs" } },
  },
});
const site = await import(pathToFileURL(path.join(root, "dist-ssr/site/render.mjs")).href);
const app = await readFile(path.join(output, "app.html"), "utf8");
if (!app.includes('name="robots" content="noindex, follow"')) {
  throw new Error("The application entry must remain noindex.");
}
if (!app.includes("<!-- site:route-compatibility -->")) {
  throw new Error("The application entry is missing its route compatibility marker.");
}

async function write(name, content) {
  const destination = path.join(output, name);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, content);
}

const compatibility = site.renderCompatibilityScript();
const hash = createHash("sha256").update(compatibility).digest("hex").slice(0, 12);
const script = `/assets/site-routes-${hash}.js`;
await write(script, compatibility);
// Run route normalization before the app module so an early redirect cannot
// discard React Router's later sign-in return state.
const appEntry = app.replace(
  "<!-- site:route-compatibility -->",
  `<script src="${script}"></script>`,
);
for (const page of site.appPages) {
  await write(
    `${page.path}/index.html`,
    appEntry.replace(/<title>.*?<\/title>/s, `<title>${site.escapeHtml(page.title)} | Aditya Singhal</title>`),
  );
}
await rm(path.join(output, "app.html"));

await write("index.html", site.renderHome(script));
await write("static/index.html", site.renderHome(script));
await write("404.html", site.renderNotFound(script));
for (const page of site.shortcutPages) {
  await write(`${page.path}/index.html`, site.renderShortcut(page));
}
await write("llms.txt", site.renderReadingMap());
await write("sitemap.xml", site.renderSitemap());
await write(
  "sitemap.txt",
  site.publicPages.map((page) => `${site.site.origin}${page.path}`).join("\n") + "\n",
);
console.log(`Generated the public homepage, ${site.appPages.length} app entries, ${site.shortcutPages.length} shortcuts, discovery files, and 404 page.`);
