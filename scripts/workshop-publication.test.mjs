import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import vm from "node:vm";
import {
  learningWorkshopPublication as learning, personalWorkshopPublication,
  renderWorkshop, workshopAssistantLinks, workshopCanonicalUrl, workshopMachineDocuments,
} from "../dist-ssr/workshop/render.mjs";

test("canonical rollout keeps old paths readable and preserves 2025 feedback", () => {
  const personal = personalWorkshopPublication();
  const rolled = personalWorkshopPublication("https://learningwithagents.com");
  assert.equal(workshopCanonicalUrl("/agentic-ai-workshop/", personal), "https://adityasinghal.com/agentic-ai-workshop-2026/");
  assert.equal(workshopCanonicalUrl("/agentic-ai-workshop/", rolled), "https://learningwithagents.com/2026/");
  assert.equal(workshopCanonicalUrl("/agentic-ai-workshop/feedback/", learning), "https://learningwithagents.com/2025/feedback/");
  assert.equal(renderWorkshop("/login/", "/style.css", undefined, undefined, learning), null);
  assert.throws(() => personalWorkshopPublication("https://unrelated.example"));
  const html = renderWorkshop("/", "/style.css", undefined, undefined, learning);
  assert.ok(html.includes('href="/2026/"'));
  assert.ok(html.includes('href="/2025/"'));
  assert.ok(html.includes('origin=https%3A%2F%2Flearningwithagents.com'));
  assert.ok(html.includes('"@id":"https://adityasinghal.com/#person"'));
});

test("hosted assistant links belong only to dedicated support navigation and guidance", () => {
  const personal = renderWorkshop("/agentic-ai-workshop-2026/", "/style.css");
  const dedicated = renderWorkshop("/2026/", "/style.css", undefined, undefined, learning);
  assert.ok(!personal.includes(workshopAssistantLinks.chat));
  assert.ok(!personal.includes(workshopAssistantLinks.guestInstructions));
  assert.ok(dedicated.includes(`href="${workshopAssistantLinks.chat}" target="_blank" rel="noopener noreferrer"`));
  assert.ok(dedicated.includes(`href="${workshopAssistantLinks.guestInstructions}" target="_blank" rel="noopener noreferrer"`));
  assert.ok(!dedicated.match(/<main\b[^>]*>[\s\S]*<\/main>/)[0].includes(workshopAssistantLinks.chat));
  assert.ok(!dedicated.includes("widget/loader.js"));
  assert.ok(!dedicated.includes("data-ambipath"));
  for (const path of ["/llms.txt", "/agents.md", "/auth.md"]) {
    const document = workshopMachineDocuments(learning)[path];
    assert.ok(document.includes(workshopAssistantLinks.chat));
    assert.ok(document.includes(workshopAssistantLinks.guestInstructions));
    assert.ok(!document.includes("/.well-known/ambipath"));
  }
});

const script = await readFile(new URL("../src/workshop/agent-tools.js", import.meta.url), "utf8");
function load(fetcher, { available = true, rejectRegistration = false } = {}) {
  const tools = [];
  const calls = [];
  vm.runInNewContext(script, {
    document: available ? { modelContext: { registerTool: (tool) => {
      tools.push(tool);
      return rejectRegistration ? Promise.reject(new Error("Disabled")) : undefined;
    } } } : {},
    fetch: async (...args) => { calls.push(args); return fetcher(...args); },
  });
  return { tools, calls };
}
const data = {
  apiVersion: "1", sourceUrl: "https://learningwithagents.com/2026/", modified: "2026-11-02",
  workshops: [2026, 2025].map((year) => ({
    year, title: "Course", description: "Workshop", status: "archived", modified: "2026-11-02",
    url: `https://learningwithagents.com/${year}/`, recordings: [],
  })),
};
const json = (body) => new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });

test("dedicated browser entry exposes only workshop retrieval without background requests", async () => {
  const { tools, calls } = load(async () => json(data));
  assert.deepEqual(tools.map((tool) => tool.name), ["get_public_workshops"]);
  assert.equal(calls.length, 0);
  const result = await tools[0].execute({ year: 2025 });
  assert.equal(result.workshops.length, 1);
  assert.equal(result.workshops[0].year, 2025);
  assert.equal(calls[0][0], "/api/v1/workshops.json");
  assert.equal(calls[0][1].credentials, "omit");
  assert.equal((await tools[0].execute({ year: 2024 })).error.code, "INVALID_INPUT");
  assert.equal(calls.length, 1);
  assert.equal(load(() => { throw new Error("Must not fetch"); }, { available: false }).tools.length, 0);
});

test("workshop browser tool handles cancellation and non-JSON failures", async () => {
  const { tools, calls } = load(async () => new Response("<html>missing</html>", { headers: { "Content-Type": "text/html" } }));
  const controller = new AbortController();
  controller.abort();
  assert.equal((await tools[0].execute({}, { signal: controller.signal })).error.code, "CANCELLED");
  assert.equal(calls.length, 0);
  assert.equal((await tools[0].execute({})).error.code, "UNEXPECTED_RESPONSE");
  assert.equal((await load(async () => json({ ...data, workshops: [{}] })).tools[0].execute({})).error.code, "INVALID_DATA");
  load(async () => json(data), { rejectRegistration: true });
  await new Promise((resolve) => setImmediate(resolve));
});

test("artifact checker rejects added app files, symlinks and modified dependencies", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "learning-artifact-test-"));
  try {
    await cp(new URL("../dist-learningwithagents", import.meta.url), directory, { recursive: true });
    const check = () => spawnSync(process.execPath, ["scripts/check-learningwithagents.mjs", directory], { encoding: "utf8" });
    assert.equal(check().status, 0);
    await writeFile(path.join(directory, "login.html"), "private app");
    assert.notEqual(check().status, 0);
    await rm(path.join(directory, "login.html"));
    await symlink("index.html", path.join(directory, "unexpected-link"));
    assert.notEqual(check().status, 0);
    await rm(path.join(directory, "unexpected-link"));
    await writeFile(path.join(directory, "workshops/agent-tools.js"), "// corrupted");
    assert.notEqual(check().status, 0);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
