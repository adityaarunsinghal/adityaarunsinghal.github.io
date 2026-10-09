import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { build } from "vite";
import react from "@vitejs/plugin-react";
import { generateSocialImages } from "./workshop-social-images.mjs";
import { generateInstructorPortraits } from "./workshop-instructor-portraits.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "dist");

// Compile only the workshop renderer. Keep the existing SPA output and config independent.
await build({
  root,
  configFile: false,
  envFile: false,
  publicDir: false,
  plugins: [react()],
  build: {
    ssr: "src/workshop/render.tsx",
    outDir: "dist-ssr/workshop",
    rollupOptions: { output: { entryFileNames: "render.mjs" } },
  },
});

const { renderWorkshop, pageDefinitions } = await import(
  pathToFileURL(path.join(root, "dist-ssr/workshop/render.mjs")).href
);
await mkdir(path.join(output, "assets"), { recursive: true });
const base = await readFile(path.join(root, "src/workshop/base.css"), "utf8");
const styles = {};
for (const year of [2025, 2026]) {
  const component =
    year === 2025 ? "AgenticAIWorkshop2025" : "AgenticAIWorkshop";
  const css =
    base +
    "\n" +
    (await readFile(
      path.join(root, `src/components/${component}/${component}.css`),
      "utf8",
    ));
  const hash = createHash("sha256").update(css).digest("hex").slice(0, 12);
  const asset = `assets/workshop-${year}-${hash}.css`;
  await writeFile(path.join(output, asset), css);
  styles[year] = `/${asset}`;
}

for (const page of pageDefinitions) {
  const directory = path.join(output, page.path);
  await mkdir(directory, { recursive: true });
  const html = renderWorkshop(
    page.path,
    styles[page.kind === "archive" ? 2025 : 2026],
  );
  if (!html) throw new Error(`No HTML rendered for ${page.path}`);
  await writeFile(path.join(directory, "index.html"), html);
}

await generateSocialImages(path.join(output, "workshops"));
await generateInstructorPortraits(path.join(output, "workshops/2026/instructors"));
const urls = [
  "/",
  ...pageDefinitions
    .filter((page) => page.kind === "current" || page.kind === "archive")
    .map((page) => page.path),
];
await writeFile(
  path.join(output, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>https://adityasinghal.com${url}</loc></url>`).join("\n")}\n</urlset>\n`,
);
await writeFile(
  path.join(output, "sitemap.txt"),
  urls.map((url) => `https://adityasinghal.com${url}`).join("\n") + "\n",
);
console.log(
  `Generated ${pageDefinitions.length} workshop documents, year-specific styles and social cards.`,
);
