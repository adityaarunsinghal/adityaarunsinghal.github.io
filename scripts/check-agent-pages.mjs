import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { htmlToMarkdown } from "./markdown.mjs";
import {
  documentPages, markdownPages, publicPages, site,
} from "../dist-ssr/site/render.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "dist");
const read = (name) => readFile(path.join(output, name), "utf8");
const privateReference = /latest-resume|Aditya_Singhal_Resume|\/(?:login|progress|lovesingy|translate|wife)(?:\/|["'#?])|\.local\/|\/Users\/|\.env\b/;
const sourceEntities = new Map();
const htmlFor = (urlPath) => urlPath === "/" ? "index.html" : `${urlPath}/index.html`;

async function actualFile(urlPath) {
  let file = path.join(output, decodeURIComponent(urlPath));
  if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
  return readFile(file, "utf8");
}

async function checkLocalUrls(content, checkFragments = false) {
  const urls = new Set(
    [...content.matchAll(/https:\/\/adityasinghal\.com[^\s"'<>)]*/g)]
      .map((match) => match[0].replaceAll("&amp;", "&")),
  );
  for (const value of urls) {
    const url = new URL(value);
    const target = await actualFile(url.pathname);
    if (checkFragments && url.hash && /\.html$|\/$/.test(url.pathname)) {
      assert.ok(target.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),
        `Missing fragment: ${value}`);
    }
  }
}

for (const page of publicPages) {
  assert.match(page.modified, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(page.modified <= new Date().toISOString().slice(0, 10), "Content date must not be in the future");
  const html = await read(htmlFor(page.path));
  assert.ok(!privateReference.test(html), page.path);
  const alternates = [...html.matchAll(/<link rel="alternate" type="text\/markdown" href="([^"]+)"/g)];
  assert.equal(alternates.length, 1, `One Markdown alternate: ${page.path}`);
  assert.ok((await actualFile(new URL(alternates[0][1]).pathname)).startsWith("# "));
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const graph = JSON.parse(match[1]);
    for (const node of graph["@graph"] || [graph]) {
      assert.ok(node["@id"], "Schema entities need a stable identifier");
      sourceEntities.set(node["@id"], { "@context": graph["@context"], ...node });
    }
  }
}

for (const page of markdownPages) {
  const markdown = await read(page.markdown);
  const html = await read(htmlFor(page.path));
  assert.equal(markdown, htmlToMarkdown(html, site.origin + page.path),
    `Markdown must come from published HTML: ${page.path}`);
  assert.ok(markdown.startsWith("# "), page.markdown);
  assert.equal((markdown.match(/^# /gm) || []).length, 1, page.markdown);
  assert.doesNotMatch(markdown, /<!doctype|<script|<iframe|Skip to content|site-analytics/i);
  assert.ok(!privateReference.test(markdown), page.markdown);
  assert.equal((markdown.match(/^```/gm) || []).length % 2, 0, page.markdown);
  await checkLocalUrls(markdown, true);
}

for (const page of documentPages) {
  const html = await read(htmlFor(page.path));
  assert.equal((html.match(/<main\b/g) || []).length, 1);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(!/site-analytics|<script[^>]*src="[^"]*(?:firebase|react)|modulepreload|id="root"/i.test(html),
    `Document must not bootstrap an app or analytics: ${page.path}`);
  for (const match of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    await actualFile(new URL(match[1], site.origin).pathname);
  }
}

const feed = (await read("feeds/site-schema.jsonl")).trim().split("\n").map(JSON.parse);
assert.equal(new Set(feed.map((node) => node["@id"])).size, feed.length);
for (const node of feed) {
  assert.equal(node["@context"], "https://schema.org");
  assert.ok(node["@type"] && node["@id"]);
  assert.deepEqual(node, sourceEntities.get(node["@id"]), "Feed must match the visible page's schema");
}

const catalog = JSON.parse(await read(".well-known/ard.json"));
assert.ok(catalog.entries.length > 0);
assert.equal(new Set(catalog.entries.map((entry) => entry.identifier)).size, catalog.entries.length);
for (const entry of catalog.entries) {
  assert.match(entry.identifier, /^urn:air:adityasinghal\.com:[a-z0-9:_-]+$/);
  assert.ok(entry.displayName && entry.description && entry.type);
  assert.ok(entry.url && !("data" in entry));
  assert.ok(entry.representativeQueries.length >= 2 && entry.representativeQueries.length <= 5);
  assert.equal(new URL(entry.url).origin, site.origin);
  assert.ok((await actualFile(new URL(entry.url).pathname)).trim().length > 0);
}

for (const name of ["llms.txt", "agents.md", "auth.md", "openapi.json",
  ".well-known/ard.json", "schemamap.xml", "feeds/site-schema.jsonl",
  "developers/llms.txt", "agentic-ai-workshop/llms.txt", "agentic-ai-workshop-2025/llms.txt"]) {
  const content = await read(name);
  assert.ok(!privateReference.test(content), name);
  await checkLocalUrls(content);
}
assert.ok((await read("robots.txt")).includes(`schemamap: ${site.origin}/schemamap.xml`));
assert.ok((await read("schemamap.xml")).includes("<sf:contentType>structuredData/schema.org</sf:contentType>"));
assert.equal((await read("sitemap.xml")).match(/<lastmod>/g).length, publicPages.length);
assert.ok((await readdir(output)).includes(".nojekyll"));
for (const forbidden of [".local", "temp", ".env", "AGENTS.md", "CLAUDE.md"]) {
  assert.ok(!(await readdir(output)).includes(forbidden), forbidden);
}

console.log(`Passed: ${markdownPages.length} generated Markdown twins; ${publicPages.length} dated canonical pages; real alternates and local links; ${feed.length} matching schema-feed entities; ${catalog.entries.length} ARD resources; public-only discovery and no private app bootstrap.`);
