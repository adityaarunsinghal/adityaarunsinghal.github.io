import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { htmlToMarkdown } from "./markdown.mjs";
import {
  documentPages, markdownPages, publicPages, site, websiteAssistant,
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

// Mirrored course pages still have schemas even after their search canonicals
// move to the workshop domain and they leave the personal sitemap.
const schemaPages = [...new Map([...publicPages,
  ...markdownPages.filter((page) => /agentic-ai-workshop-(?:2025|2026)\/$/.test(page.path)),
].map((page) => [page.path, page])).values()];
for (const page of schemaPages) {
  if (page.modified) {
    assert.match(page.modified, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(page.modified <= new Date().toISOString().slice(0, 10), "Content date must not be in the future");
  }
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
assert.deepEqual(catalog.entries.map((entry) => entry.identifier), [
  websiteAssistant.instructionsIdentifier,
  websiteAssistant.catalogIdentifier,
  "urn:air:adityasinghal.com:api:public-data",
  "urn:air:adityasinghal.com:docs:agent-guidance",
  "urn:air:adityasinghal.com:docs:workshop-2026",
], "Guest instructions and PAP discovery must preserve the three existing public resources.");
assert.equal(new Set(catalog.entries.map((entry) => entry.identifier)).size, catalog.entries.length);
for (const entry of catalog.entries) {
  assert.match(entry.identifier, /^urn:air:adityasinghal\.com:[a-z0-9:_-]+$/);
  assert.ok(entry.displayName && entry.description && entry.type);
  assert.ok(entry.url && !("data" in entry));
  assert.ok(entry.representativeQueries.length >= 2 && entry.representativeQueries.length <= 5);
  if (entry.identifier === websiteAssistant.instructionsIdentifier) {
    assert.equal(entry.type, "text/markdown");
    assert.equal(entry.url, websiteAssistant.instructionsUrl);
    assert.match(entry.description, /guest HTTP API/);
    assert.match(entry.description, /No browser, customer account or owner sign-in required/);
  } else if (entry.identifier === websiteAssistant.catalogIdentifier) {
    assert.equal(entry.type, "application/json");
    assert.equal(entry.url, websiteAssistant.discoveryUrl);
    assert.equal(new URL(entry.url).protocol, "https:");
    assert.match(entry.description, /signed.session/);
    assert.match(entry.description, /compatible .*client/);
  } else if (entry.identifier === "urn:air:adityasinghal.com:docs:workshop-2026"
    && process.env.WORKSHOP_CANONICAL_ORIGIN === "https://learningwithagents.com") {
    assert.equal(entry.url, "https://learningwithagents.com/2026.md");
    assert.ok((await readFile(path.join(root, "dist-learningwithagents/2026.md"), "utf8")).startsWith("# "));
  } else {
    assert.equal(new URL(entry.url).origin, site.origin);
    assert.ok((await actualFile(new URL(entry.url).pathname)).trim().length > 0);
  }
}

for (const name of ["index.html", "static/index.html", "developers/index.html", "privacy/index.html"]) {
  const html = await read(name);
  const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
  assert.equal(head.split(`<link rel="service-desc" type="application/json" href="${websiteAssistant.origin}/.well-known/poppy.json"`).length - 1,
    1, `One supplied assistant discovery link in the static head: ${name}`);
  assert.equal(head.split(`<link rel="service-doc" type="text/markdown" href="${websiteAssistant.instructionsUrl}"`).length - 1,
    1, `One public connection-instructions link in the static head: ${name}`);
  assert.ok(head.includes(`type="application/vnd.oai.openapi+json" href="${site.origin}/openapi.json"`),
    `Public data discovery remains available: ${name}`);
  const loaders = [...html.matchAll(/<script\b[^>]*\bsrc="https:\/\/console\.ambipath\.com\/widget\/loader\.js"[^>]*>/g)];
  assert.equal(loaders.length, 1, `Exactly one official assistant loader: ${name}`);
  assert.ok(loaders[0][0].includes(`data-ambipath="${websiteAssistant.deploymentId}"`));
  assert.match(loaders[0][0], /\bdefer\b/);
  assert.ok(head.includes(loaders[0][0]), `The supplied loader belongs in the head: ${name}`);
  assert.ok(!loaders[0][0].includes("data-context"), "Page context sharing is not enabled.");
}

for (const name of ["404.html", "login/index.html", "progress/index.html",
  "agentic-ai-workshop/index.html", "agentic-ai-workshop-2025/index.html"]) {
  assert.ok(!(await read(name)).includes("console.ambipath.com/widget/loader.js"),
    `Assistant placement must not expand to unrelated pages: ${name}`);
}

for (const name of ["llms.txt", "agents.md", "auth.md", "developers/llms.txt", "developers.md", "developers/index.html"]) {
  const content = await read(name);
  for (const url of [websiteAssistant.instructionsUrl, websiteAssistant.openApiUrl, websiteAssistant.discoveryUrl]) {
    assert.ok(content.includes(url), `Canonical assistant connection URL missing: ${name}`);
  }
  assert.match(content, /Poppy/);
  assert.match(content, /session/i);
  assert.match(content, /do not require a customer account or owner sign-in/);
  const guidance = name.endsWith(".html") ? content.match(/<body\b[^>]*>([\s\S]*?)<\/body>/)[1] : content;
  assert.ok(guidance.indexOf(websiteAssistant.discoveryUrl) < guidance.indexOf(websiteAssistant.instructionsUrl),
    `Recommend on-domain Poppy before the guest fallback: ${name}`);
}
const primaryDiscovery = JSON.parse(await read(".well-known/poppy.json"));
const ownership = JSON.parse(await read(".well-known/ambipath.json"));
assert.equal(ownership.deployment, websiteAssistant.deploymentId);
assert.ok(ownership.proof, "The canonical deployment needs its supplied ownership proof.");
assert.equal(primaryDiscovery.protocol_version, "1.0");
assert.equal(primaryDiscovery.organization.domain, new URL(site.origin).hostname);
assert.equal(primaryDiscovery.agent.protocols[0].endpoint, websiteAssistant.conversationsUrl);
assert.equal(primaryDiscovery.apis[0].url, websiteAssistant.mcpUrl);
assert.ok(!primaryDiscovery.auth, "Public on-domain discovery must not imply customer OAuth support");
const compatibilityUrl = primaryDiscovery.supported_versions["0.4"];
assert.equal(new URL(compatibilityUrl).origin, site.origin);
const compatibilityDiscovery = JSON.parse(await actualFile(new URL(compatibilityUrl).pathname));
assert.equal(compatibilityDiscovery.protocol_version, "0.4");
assert.deepEqual(compatibilityDiscovery.agent, primaryDiscovery.agent);
assert.deepEqual(compatibilityDiscovery.apis, primaryDiscovery.apis);
assert.equal(compatibilityDiscovery.organization.domain, primaryDiscovery.organization.domain);
const wellKnownFiles = await readdir(path.join(output, ".well-known"));
for (const facade of ["agent-card.json", "agent.json", "oauth-protected-resource"]) {
  assert.ok(!wellKnownFiles.includes(facade), `Do not publish unsupported protocol metadata: ${facade}`);
}
assert.ok(!(await readdir(output)).includes("agent.json"), "No unsupported A2A facade.");

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

console.log(`Passed: ${markdownPages.length} generated Markdown twins; ${publicPages.length} dated canonical pages; real alternates and local links; ${feed.length} matching schema-feed entities; ${catalog.entries.length} ARD resources with canonical PAP discovery and separate public data; public-only discovery and no private app bootstrap.`);
