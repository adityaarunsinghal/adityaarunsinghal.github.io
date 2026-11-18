import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { htmlToMarkdown } from "./markdown.mjs";
import {
  learningWorkshopPublication, renderWorkshop, workshopAssets,
  workshopCanonicalUrl, workshopMachineDocuments, workshopMarkdownPath, workshopPages,
} from "../dist-ssr/workshop/render.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = path.join(root, "dist");
const output = path.join(root, "dist-learningwithagents");
const publication = { ...learningWorkshopPublication };
// Supply only the installation block issued for this domain. Personal-site
// assistant setup and ownership proofs are never copied into this artifact.
if (process.env.LEARNING_ASSISTANT_SCRIPT_URL || process.env.LEARNING_ASSISTANT_WEBSITE_ID) {
  const scriptUrl = new URL(process.env.LEARNING_ASSISTANT_SCRIPT_URL);
  if (scriptUrl.protocol !== "https:" || !process.env.LEARNING_ASSISTANT_WEBSITE_ID) {
    throw new Error("A domain-specific assistant needs an HTTPS script and website ID.");
  }
  publication.assistant = { scriptUrl: scriptUrl.href, websiteId: process.env.LEARNING_ASSISTANT_WEBSITE_ID };
}

const styles = {};
for (const [year, route] of [[2026, "/agentic-ai-workshop-2026/"], [2025, "/agentic-ai-workshop-2025/"]]) {
  const html = await readFile(path.join(source, route, "index.html"), "utf8");
  const stylesheet = html.match(/rel="stylesheet" href="(\/assets\/workshop-\d{4}-[a-f0-9]{12}\.css)"/)?.[1];
  if (!stylesheet) throw new Error(`Missing ${year} stylesheet; run the personal-site build first.`);
  styles[year] = stylesheet;
}

await rm(output, { recursive: true, force: true });
const files = new Map();
async function write(name, contents) {
  const relative = name.replace(/^\/+/, "");
  if (!relative || relative.split("/").includes("..")) throw new Error(`Unsafe output path: ${name}`);
  const target = path.join(output, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents);
  files.set(relative, createHash("sha256").update(contents).digest("hex"));
}
async function copy(name) {
  const sourcePath = path.join(source, name);
  const info = await lstat(sourcePath);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error(`Workshop dependency must be a regular file: ${name}`);
  await write(name, await readFile(sourcePath));
}

for (const asset of [...workshopAssets, ...Object.values(styles).map((name) => name.slice(1))]) await copy(asset);
await write("workshops/agent-tools.js", await readFile(path.join(root, "src/workshop/agent-tools.js")));

const pages = workshopPages(publication);
for (const page of pages) {
  const html = renderWorkshop(page.path, styles[page.kind === "archive" ? 2025 : 2026], undefined, undefined, publication);
  if (!html) throw new Error(`Missing workshop route: ${page.path}`);
  await write(`${page.path}index.html`, html);
  await write(workshopMarkdownPath(page.path), htmlToMarkdown(html, workshopCanonicalUrl(page.path, publication)));
}
const machine = workshopMachineDocuments(publication);
for (const [name, content] of Object.entries(machine)) await write(name, content);
// Reading maps follow all course aliases while preserving each edition.
for (const page of pages.filter((page) => ["current", "archive"].includes(page.kind))) {
  if (page.path === "/") continue;
  await write(`${page.path}llms.txt`, machine[page.kind === "current" ? "/2026/llms.txt" : "/2025/llms.txt"]);
}
await write("CNAME", "learningwithagents.com\n");
await write(".nojekyll", "");
await write("404.html", `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, follow"><title>Page not found | Learning with Agents</title><link rel="icon" href="/workshops/workshop-favicon.svg"></head>
<body><main><h1>Page not found</h1><p>Find the workshop material in one of these editions.</p><nav aria-label="Workshop editions"><a href="/2026/">2026 workshop</a> · <a href="/2025/">2025 archive</a></nav></main></body></html>\n`);
await write("workshop-build.json", JSON.stringify({
  version: 1, role: "learning", origin: publication.origin, routeMapVersion: 1,
  routes: pages.map(({ path: route, kind }) => ({ path: route, kind, canonical: workshopCanonicalUrl(route, publication) })),
  files: Object.fromEntries([...files].sort(([a], [b]) => a.localeCompare(b))),
}, null, 2) + "\n");
console.log(`Generated ${pages.length} workshop routes and ${files.size} allowlisted files in dist-learningwithagents.`);
