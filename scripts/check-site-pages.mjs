import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import {
  appPages, shortcutPages, site, profileLinks, publicPages, legacyTarget,
} from "../dist-ssr/site/render.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "dist");
const read = (name) => readFile(path.join(output, name), "utf8");

async function checkLocalReferences(html) {
  for (const match of html.matchAll(/(?:href|src|data-still-src|data-wave-src)="(\/[^"]*)"/g)) {
    const url = new URL(match[1].replaceAll("&amp;", "&"), site.origin);
    const file = path.join(output, url.pathname);
    const info = await stat(file);
    if (info.isDirectory()) await stat(path.join(file, "index.html"));
  }
}

const home = await read("index.html");
assert.equal((home.match(/<h1\b/g) || []).length, 1);
assert.ok(home.includes("<h1>Aditya Singhal</h1>"));
assert.ok(home.includes("Model Context Protocol (MCP)"));
assert.ok(home.includes('rel="canonical" href="https://adityasinghal.com/"'));
assert.ok(home.includes(`name="google-site-verification" content="${site.googleVerification}"`));
assert.ok(!/<iframe\b|id="root"|type="module"|rel="modulepreload"/.test(home));
assert.ok(!/src="[^"]*(?:firebase|react-dom)|\{\{(?:site|link)\./i.test(home));
assert.ok(!/latest-resume|Aditya_Singhal_Resume|profile-links|wave-toggle/.test(home));
assert.equal(await read("static/index.html"), home, "Legacy homepage must share content and canonical.");
await checkLocalReferences(home);

const graph = JSON.parse(home.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
const person = graph["@graph"].find((item) => item["@type"] === "Person");
const profile = graph["@graph"].find((item) => item["@type"] === "ProfilePage");
assert.equal(person["@id"], `${site.origin}/#person`);
assert.equal(person.name, site.name);
assert.equal(person.jobTitle, site.jobTitle);
assert.equal(person.worksFor.name, site.employer);
assert.equal(profile.mainEntity["@id"], person["@id"]);
assert.deepEqual(person.sameAs, Object.values(profileLinks));
assert.ok(!JSON.stringify(graph).includes("Resume"));

const scriptPath = home.match(/src="(\/assets\/site-routes-[^"]+\.js)"/)[1];
const compatibility = await read(scriptPath);
const scenarios = [
  ["/", "", "#current", null],
  ["/", "?utm_source=workshop", "#book", null],
  ["/index.html", "?from=old", "#contact", "/?from=old#contact"],
  ["/index", "", "#current", "/#current"],
  ["/static/index", "", "#book", "/static/#book"],
  ["/GitHub", "?from=old", "", "/github/?from=old"],
  ["/progress/", "?day=today", "", null],
  ["/", "?/progress&day=today~and~view=week", "#today", "/progress/?day=today&view=week#today"],
  ["/", "?/Agentic-AI-Workshop&from=email~and~source=old", "#materials", "/agentic-ai-workshop/?from=email&source=old#materials"],
  ["/agentic-ai-workshop//", "?from=old", "#schedule", "/agentic-ai-workshop/?from=old#schedule"],
  ["/missing-page/", "", "", null],
  ["/", "?/missing-page", "", "/404.html"],
  ["/", "?//example.com", "", "/404.html"],
  ["/", "?/%2f%2fexample.com", "", "/404.html"],
  ["/", "?/%E0%A4%A", "", "/404.html"],
  ["/%E0%A4%A", "", "", null],
  ["/constructor", "", "", null],
  ["/__proto__", "", "", null],
];
for (const page of [...appPages, ...shortcutPages]) {
  scenarios.push([page.path.toUpperCase(), "", "#saved", `${page.path}#saved`]);
}
for (const [pathname, search, hash, expected] of scenarios) {
  assert.equal(legacyTarget(pathname, search, hash), expected);
  let destination = null;
  vm.runInNewContext(compatibility, {
    window: { location: { pathname, search, hash, replace: (url) => { destination = url; } } },
  });
  assert.equal(destination, expected, `Generated compatibility script: ${pathname}${search}${hash}`);
}

for (const page of appPages) {
  const html = await read(`${page.path}/index.html`);
  assert.ok(html.includes('name="robots" content="noindex, follow"'));
  assert.ok(html.includes('id="root"'));
  assert.ok(html.includes('type="module"'));
  assert.ok(html.includes(`src="${scriptPath}"`));
  assert.ok(html.indexOf(`src="${scriptPath}"`) < html.indexOf('type="module"'));
  assert.ok(!html.includes("site:route-compatibility"));
  assert.ok(!html.includes('rel="canonical"'));
  assert.ok(!html.includes("application/ld+json"));
  assert.ok(html.includes('href="/manifest.json"'));
  assert.ok(html.includes(`<title>${page.title} | Aditya Singhal</title>`));
  await checkLocalReferences(html);
}
for (const page of shortcutPages) {
  const html = await read(`${page.path}/index.html`);
  assert.ok(html.includes('name="robots" content="noindex,'));
  assert.ok(html.includes(`http-equiv="refresh" content="0; url=${page.destination}"`));
  assert.ok(html.includes(`href="${page.destination}"`));
  assert.ok(!html.includes('type="module"'), "Shortcuts must work without the app.");
}

const notFound = await read("404.html");
assert.ok(notFound.includes("<h1>What URL is that???</h1>"));
assert.ok(notFound.includes('name="robots" content="noindex, follow"'));
assert.ok(notFound.includes(`src="${scriptPath}"`));
assert.ok(!notFound.includes('type="module"'));
await checkLocalReferences(notFound);

const sitemap = await read("sitemap.xml");
const listed = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
assert.deepEqual(listed, publicPages.map((page) => site.origin + page.path));
assert.equal(new Set(listed).size, listed.length);
for (const page of publicPages) {
  const html = await read(page.path === "/" ? "index.html" : `${page.path}/index.html`);
  assert.ok(!html.includes('content="noindex'));
}
for (const name of ["sitemap.xml", "sitemap.txt", "llms.txt"]) {
  const content = await read(name);
  assert.ok(!/latest-resume|Aditya_Singhal_Resume|\/login|\/progress|\/lovesingy|\/translate|\/wife|stats\.html/.test(content), name);
}
assert.ok((await read("llms.txt")).includes(site.description));
// Production paths are case-sensitive; macOS may resolve the intentionally
// public agents.md when checking for the unrelated private AGENTS.md file.
const rootFiles = await readdir(output);
for (const name of ["app.html", "stats.html", "src", ".local", "AGENTS.md"]) {
  assert.ok(!rootFiles.includes(name), `${name} must not enter the build.`);
}
await stat(path.join(root, "temp/build-reports/stats.html"));
console.log(`Passed: direct public HTML and schema; ${appPages.length} app entries; ${shortcutPages.length} shortcuts; ${scenarios.length} legacy-route scenarios; unlisted résumé; discovery files; private build report.`);
