import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  course,
  pageDefinitions,
  renderWorkshop,
} from "../dist-ssr/workshop/render.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "dist");
const read = (name) => readFile(path.join(output, name), "utf8");
const form =
  "https://docs.google.com/forms/d/e/1FAIpQLSd_lhxUjjw0NMCvsf5qojymmS8Wur0tA26rqOnSCZarhkV31g/viewform";
const currentPath = "/agentic-ai-workshop/";
const archivePath = "/agentic-ai-workshop-2025/";
let checked = 0;

for (const page of pageDefinitions) {
  const html = await read(`${page.path}/index.html`);
  assert.ok(html.startsWith("<!DOCTYPE html>"));
  assert.ok(html.includes(`<title>${page.title}</title>`));
  assert.ok(
    html.includes(
      `rel="canonical" href="https://adityasinghal.com${page.canonical}"`,
    ),
  );
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(html.includes('id="main-content"'));
  assert.equal(
    (html.match(/<script\b/g) || []).length,
    page.kind === "current" ? 2 : 0,
    `${page.path} should use only its slide download and portrait enhancements`,
  );
  if (page.kind === "current") {
    assert.ok(html.includes('src="/workshops/download-slides.js" defer'));
    assert.ok(html.includes('src="/workshops/instructor-portraits-2026-10-09.js" defer'));
  }
  assert.ok(!html.includes('href="#"'));
  assert.ok(
    !html.includes("-personal"),
    "Private repository reference in public HTML",
  );
  assert.ok(!html.includes("user-scalable=no"));
  for (const match of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    const url = new URL(
      match[1].replaceAll("&amp;", "&"),
      "https://adityasinghal.com",
    );
    const target = path.join(output, url.pathname);
    const info = await stat(target);
    if (info.isDirectory()) await stat(path.join(target, "index.html"));
  }
  for (const match of html.matchAll(/href="#([^"]+)"/g))
    assert.ok(html.includes(`id="${match[1]}"`), `Missing anchor ${match[1]}`);
  checked++;
}

const current = await read(`${currentPath}/index.html`);
assert.ok(!current.includes("Pause wave"));
assert.ok(!current.includes("data-wave-toggle"));
for (const text of [
  "October 8, 15, 22 &amp; 29, 2026",
  "5:30–7:00 PM ET",
  "CDS 7th Floor Open Space",
  "DS-UA 112",
  "A2UI &amp; MCP Apps",
  "Jev",
  "Auto-Research",
  "Friday office hours",
  "60 minutes",
  "30 minutes",
  "1–2 hours",
  "Coffee chats",
])
  assert.ok(current.includes(text), `Missing course fact: ${text}`);
assert.equal((current.match(/class="coming-soon"/g) || []).length, 0);
assert.equal(current.includes(form), course.state === "registration-open");
assert.ok(!/notebook|codex|openai|—/i.test(current), "Unexpected 2026 wording");
for (const destination of [
  course.publicRepositoryUrl,
  "https://raw.githubusercontent.com/adityaarunsinghal/agentic-ai-workshop-2026/refs/heads/main/session-01-agent-harnesses/session-01-agent-harnesses-2026-10-07.html",
  `${course.publicRepositoryUrl}/tree/main/session-01-agent-harnesses/demo-app`,
])
  assert.ok(
    current.includes(`href="${destination}"`),
    `Missing published material: ${destination}`,
  );
assert.ok(current.includes("day before class"));
assert.ok(current.includes('download="session-01-agent-harnesses-2026-10-07.html"'));
for (const kind of ["registration", "feedback", "archived-registration"]) {
  for (const page of pageDefinitions.filter((item) => item.kind === kind)) {
    const html = await read(`${page.path}/index.html`);
    assert.ok(html.includes("noindex, follow"));
    if (kind === "registration")
      assert.equal(html.includes(form), course.state === "registration-open");
    if (kind === "feedback") {
      assert.ok(html.includes("https://forms.gle/CbqwHw1mtBcL7hHZ7"));
      assert.ok(html.includes("2025 workshop feedback"));
      assert.ok(!html.includes(form));
    }
  }
}

// Check every public entry against lifecycle changes, including the root registration alias.
for (const state of [
  "registration-open",
  "registration-closed",
  "in-progress",
  "complete",
]) {
  for (const route of [
    currentPath,
    "/registration-form/",
    "/agentic-ai-workshop/registration-form/",
  ]) {
    const html = renderWorkshop(route, "/test.css", state);
    assert.equal(
      html.includes(form),
      state === "registration-open",
      `Wrong registration action in ${state} at ${route}`,
    );
    assert.equal(
      html.includes("Register for the workshop"),
      state === "registration-open",
    );
    assert.ok(
      html.includes(course.publicRepositoryUrl) ||
        route.includes("registration-form"),
    );
  }
}
assert.equal(renderWorkshop("/unknown/", "/test.css"), null);
const archive = await read(`${archivePath}/index.html`);
for (const text of [
  "2025 workshop archive",
  "Oct 1-22, 2025",
  "Wednesdays 5:00-6:30 PM",
  "Luca Chang",
  "Jupyter",
  "agentic-ai-workshop-2025",
  "PLgF7i4LH-YxYvhXK-yywN7eFRjRjQrq89",
])
  assert.ok(archive.includes(text));
assert.ok(archive.includes("archive-quotes"));
assert.ok(!archive.includes("Tech Leader"));
assert.equal(
  await readFile(path.join(output, "hype.csv"), "utf8"),
  await readFile(path.join(root, "public/hype.csv"), "utf8"),
);
assert.equal(
  await read("CNAME"),
  await readFile(path.join(root, "public/CNAME"), "utf8"),
);
assert.equal(
  await read("sw.js"),
  await readFile(path.join(root, "public/sw.js"), "utf8"),
);
for (const year of [2025, 2026]) {
  const png = await readFile(
    path.join(output, `workshops/workshop-social-${year}.png`),
  );
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
}
// The backgrounds are identical. Equal images mean their year-specific text was lost.
assert.notDeepEqual(
  await readFile(path.join(output, "workshops/workshop-social-2025.png")),
  await readFile(path.join(output, "workshops/workshop-social-2026.png")),
  "Social cards lost their year-specific text",
);
const sitemap = await read("sitemap.xml");
assert.ok(sitemap.includes(currentPath) && sitemap.includes(archivePath));
assert.ok(!(sitemap.includes("feedback") || sitemap.includes("progress")));
assert.ok(
  (await read("robots.txt")).includes(
    "Sitemap: https://adityasinghal.com/sitemap.xml",
  ),
);
assert.ok(
  (await read("static/index.html")).includes(
    'href="/agentic-ai-workshop/" target="_top"',
  ),
);
console.log(
  `Passed: ${checked} static routes; course facts; resource availability; 4 lifecycle states; archive; assets; metadata; preserved CSV, CNAME, and service worker.`,
);
