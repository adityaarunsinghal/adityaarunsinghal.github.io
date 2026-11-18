import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inspectArtifact } from "./check-public-artifacts.mjs";
import {
  learningWorkshopPublication, workshopAssets, workshopCanonicalUrl,
  workshopAssistantLinks, workshopMachineDocuments, workshopMarkdownPath, workshopPages,
} from "../dist-ssr/workshop/render.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.resolve(root, process.argv[2] || "dist-learningwithagents");
const personal = path.resolve(root, process.argv[3] || "dist");
const publication = learningWorkshopPublication;
const pages = workshopPages(publication);
const read = (name) => readFile(path.join(output, name.replace(/^\/+/, "")), "utf8");
const manifest = JSON.parse(await read("workshop-build.json"));
const expected = new Set([
  ...workshopAssets, "workshops/agent-tools.js", "CNAME", ".nojekyll", "404.html",
  ...Object.keys(workshopMachineDocuments(publication)).map((name) => name.slice(1)),
  ...pages.flatMap((page) => [
    `${page.path.slice(1)}index.html`,
    workshopMarkdownPath(page.path).slice(1),
    ...(["current", "archive"].includes(page.kind) && page.path !== "/" ? [`${page.path.slice(1)}llms.txt`] : []),
  ]),
]);
const styles = new Set();
const index = await read("2026/index.html");
const archive = await read("2025/index.html");
for (const html of [index, archive]) {
  const stylesheet = html.match(/rel="stylesheet" href="(\/assets\/workshop-(?:2025|2026)-[a-f0-9]{12}\.css)"/)?.[1];
  assert.ok(stylesheet, "Each edition must have its own scoped stylesheet");
  styles.add(stylesheet.slice(1));
}
assert.equal(styles.size, 2);
styles.forEach((name) => expected.add(name));
assert.deepEqual(Object.keys(manifest.files).sort(), [...expected].sort(), "The build manifest must match the fixed workshop allowlist");
assert.equal(manifest.origin, publication.origin);
assert.equal(manifest.role, "learning");
assert.deepEqual(manifest.routes, pages.map((page) => ({
  path: page.path, kind: page.kind, canonical: workshopCanonicalUrl(page.path, publication),
})));

async function walk(directory, prefix = "") {
  const files = [];
  for (const item of await readdir(directory)) {
    const relative = `${prefix}${item}`;
    const info = await lstat(path.join(directory, item));
    assert.ok(!info.isSymbolicLink(), `Symlink excluded: ${relative}`);
    if (info.isDirectory()) files.push(...await walk(path.join(directory, item), `${relative}/`));
    else { assert.ok(info.isFile()); files.push(relative); }
  }
  return files;
}
const actual = await walk(output);
// Release manifests are written only by the paired publisher after this build.
assert.deepEqual(actual.filter((name) => !["workshop-build.json", "release-manifest.json"].includes(name)).sort(), [...expected].sort());
for (const name of expected) {
  const bytes = await readFile(path.join(output, name));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), manifest.files[name], `File hash: ${name}`);
  assert.deepEqual(inspectArtifact(`dist-learningwithagents/${name}`, bytes, { built: true }), [], `Public artifact policy: ${name}`);
  if (/\.(?:html|js|css|json|md|txt|svg|xml)$/.test(name)) {
    assert.doesNotMatch(bytes.toString(), /(?:VITE_FIREBASE_|firebaseapp\.com|\/api\/v1\/(?:profile|resources)\.json|-----BEGIN [A-Z ]*PRIVATE KEY-----|\.local\/agent-notes|\/\.well-known\/ambipath-verification)/i, `Excluded payload in ${name}`);
  }
}
for (const asset of [...workshopAssets, ...styles]) {
  assert.deepEqual(await readFile(path.join(output, asset)), await readFile(path.join(personal, asset)), `Shared asset bytes: ${asset}`);
}
assert.equal(await read("CNAME"), "learningwithagents.com\n");

const main = (html) => html.match(/<main\b[^>]*>[\s\S]*<\/main>/)?.[0] || "";
const content = (html) => main(html)
  .replace(/<nav\b[\s\S]*?<\/nav>/g, "")
  .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const externalLinks = (html) => [...main(html).matchAll(/<a\b[^>]*href="(https:[^"]+)"/g)].map((match) => match[1]).sort();

async function localTarget(url, from) {
  const target = new URL(url.replaceAll("&amp;", "&"), `${publication.origin}${from}`);
  if (target.origin !== publication.origin) return;
  const relative = decodeURIComponent(target.pathname).replace(/^\/+/, "");
  const info = await stat(path.join(output, relative)).catch(() => null);
  assert.ok(info, `Missing local dependency ${url} from ${from}`);
  if (info.isDirectory()) await stat(path.join(output, relative, "index.html"));
}

for (const page of pages) {
  const html = await read(`${page.path}index.html`);
  const canonical = workshopCanonicalUrl(page.path, publication);
  assert.ok(html.startsWith("<!DOCTYPE html>"));
  assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
  assert.ok(html.includes(`property="og:url" content="${canonical}"`));
  assert.ok(html.includes(`href="${publication.origin}${workshopMarkdownPath(page.path)}"`));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(html.includes('id="main-content"'));
  assert.ok(html.includes(`href="${workshopAssistantLinks.chat}" target="_blank" rel="noopener noreferrer"`));
  assert.ok(html.includes(`href="${workshopAssistantLinks.guestInstructions}" target="_blank" rel="noopener noreferrer"`));
  assert.doesNotMatch(html, /widget\/loader\.js|data-ambipath/);
  assert.doesNotMatch(html, /<script[^>]+(?:type="module"|src="\/assets\/index-)/);
  assert.doesNotMatch(html, /http-equiv="refresh"|window\.location/);
  const coursePage = ["current", "archive"].includes(page.kind);
  assert.ok(html.includes(`content="${coursePage ? "index, follow" : "noindex, follow"}"`));
  if (coursePage) {
    const personalHtml = await readFile(path.join(personal, page.sourcePath, "index.html"), "utf8");
    assert.equal(content(html), content(personalHtml), `Published course text parity: ${page.path}`);
    assert.deepEqual(externalLinks(html), externalLinks(personalHtml), `Published resource destinations: ${page.path}`);
    assert.ok(html.includes('src="/workshops/agent-tools.js"'));
    for (const embed of html.matchAll(/src="(https:\/\/www\.youtube-nocookie\.com\/embed\/[^"]+)"/g)) {
      assert.equal(new URL(embed[1].replaceAll("&amp;", "&")).searchParams.get("origin"), publication.origin);
    }
    const schema = JSON.parse(html.match(/type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema["@graph"][0].url, canonical);
    assert.equal(schema["@graph"][1].url, canonical);
  }
  for (const match of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) await localTarget(match[1], page.path);
}
for (const style of styles) {
  const css = await read(style);
  for (const match of css.matchAll(/url\(["']?(\/[^)"']+)/g)) await localTarget(match[1], `/${style}`);
}

const api = JSON.parse(await read("api/v1/workshops.json"));
assert.deepEqual(api.workshops.map((workshop) => workshop.year), [2026, 2025]);
for (const workshop of api.workshops) assert.equal(workshop.url, `${publication.origin}/${workshop.year}/`);
const personalApi = JSON.parse(await readFile(path.join(personal, "api/v1/workshops.json"), "utf8"));
const facts = (data) => data.workshops.map(({ url: _url, ...workshop }) => workshop);
assert.deepEqual(facts(api), facts(personalApi), "Structured course facts must match the personal site");
const openapi = JSON.parse(await read("openapi.json"));
assert.deepEqual(Object.keys(openapi.paths).sort(), ["/api/v1/index.json", "/api/v1/workshops.json"]);
assert.ok((await read("sitemap.xml")).includes("<loc>https://learningwithagents.com/2026/</loc>"));
assert.doesNotMatch(await read("sitemap.xml"), /agentic-ai-workshop|registration|feedback/);
assert.ok((await read("agentic-ai-workshop/feedback/index.html")).includes("2025 workshop feedback"));
assert.ok((await read("404.html")).includes("Page not found"));
console.log(`Learning with Agents: ${pages.length} routes, ${expected.size} allowlisted files, shared assets, course text and API parity verified.`);
