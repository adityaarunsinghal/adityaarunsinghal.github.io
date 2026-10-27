import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { setImmediate } from "node:timers/promises";
import test from "node:test";
import vm from "node:vm";

const script = await readFile(new URL("../public/site-agent-tools.js", import.meta.url), "utf8");
const metadata = {
  apiVersion: "1", sourceUrl: "https://adityasinghal.com/", modified: "2026-10-27",
};
const profile = {
  ...metadata, name: "Aditya Singhal", alternateName: "Adi Singhal",
  biography: "Applied Scientist and workshop instructor.", description: "Public biography.",
  jobTitle: "Applied Scientist", employer: "Amazon", topics: ["Agentic AI", "MCP"],
  profiles: { github: "https://github.com/adityaarunsinghal" },
};
const resources = {
  ...metadata,
  resources: [
    { category: "Public projects", name: "Prompt Evaluator", url: "https://example.com/evaluation", description: "Evaluate MCP prompts." },
    { category: "Technical writing", name: "MCP article", url: "https://example.com/article", description: "A tools guide." },
    { category: "Agentic AI and MCP teaching", name: "Workshop", url: "https://adityasinghal.com/agentic-ai-workshop/", description: "Practical prompt evaluation." },
  ],
};
const workshops = {
  ...metadata,
  workshops: [2026, 2025].map((year) => ({
    year, status: year === 2026 ? "current" : "archive", title: `Workshop ${year}`,
    url: `https://adityasinghal.com/agentic-ai-workshop${year === 2025 ? "-2025" : ""}/`,
    description: "Public course materials.", modified: "2026-10-27", recordings: [],
    materials: year === 2026 ? [{
      name: "Student tools", access: "registered-students",
      links: [{ url: "https://example.com/student-tools" }],
      note: "Available to registered students.",
    }] : [],
  })),
};
const json = (data) => new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json; charset=utf-8" } });
const plain = (value) => JSON.parse(JSON.stringify(value));

function load({ fetch: fetcher = async () => json(profile), primary = true, legacy = false, register } = {}) {
  const tools = new Map();
  const calls = [];
  const registrations = [];
  const registry = (kind) => ({
    registerTool(tool) {
      registrations.push({ kind, name: tool.name });
      if (register) return register(tool, kind);
      tools.set(tool.name, tool);
      return kind === "primary" ? Promise.resolve() : undefined;
    },
  });
  const context = {
    document: primary ? { modelContext: registry("primary") } : {},
    navigator: legacy ? { modelContext: registry("legacy") } : {},
    URL,
    fetch: async (...args) => {
      calls.push(args);
      return fetcher(...args);
    },
  };
  vm.runInNewContext(script, context);
  return { tools, calls, registrations, context };
}

test("ordinary browsing has no dependency on WebMCP and makes no background API requests", () => {
  const result = load({ primary: false });
  assert.equal(result.tools.size, 0);
  assert.equal(result.calls.length, 0);
  assert.deepEqual(Object.keys(result.context.document), []);
  assert.doesNotThrow(() => vm.runInNewContext(script, {}));
});

test("the current Document API takes precedence and the Navigator API is only a compatibility fallback", async () => {
  const current = load({ legacy: true });
  assert.equal(current.tools.size, 3);
  assert.ok(current.registrations.every(({ kind }) => kind === "primary"));
  assert.ok([...current.tools.values()].every((tool) => tool.annotations.readOnlyHint));
  assert.equal(current.calls.length, 0);

  const legacy = load({ primary: false, legacy: true });
  assert.equal(legacy.tools.size, 3);
  assert.ok(legacy.registrations.every(({ kind }) => kind === "legacy"));
  assert.equal((await legacy.tools.get("get_public_profile").execute({})).profile.name, "Aditya Singhal");
});

test("synchronous and asynchronous registration failures do not stop other tools or escape as rejections", async () => {
  const seen = [];
  assert.doesNotThrow(() => load({
    register(tool) {
      seen.push(tool.name);
      if (seen.length === 1) throw new Error("Experiment disabled");
      if (seen.length === 2) return Promise.reject(new Error("Registration denied"));
      return Promise.resolve();
    },
  }));
  await setImmediate();
  assert.equal(seen.length, 3);
  const document = Object.defineProperty({}, "modelContext", {
    get() { throw new Error("Unavailable in this context"); },
  });
  assert.doesNotThrow(() => vm.runInNewContext(script, { document }));
});

test("profile reads the fixed public endpoint without credentials and preserves attribution", async () => {
  const { tools, calls } = load();
  const controller = new AbortController();
  const result = await tools.get("get_public_profile").execute({}, { signal: controller.signal });
  assert.equal(result.ok, true);
  assert.deepEqual(plain(result.profile), profile);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "/api/v1/profile.json");
  assert.equal(calls[0][1].method, "GET");
  assert.equal(calls[0][1].credentials, "omit");
  assert.equal(calls[0][1].headers.Accept, "application/json");
  assert.equal(calls[0][1].signal, controller.signal);
});

test("resource discovery matches every query word, filters category, and returns source links", async () => {
  const { tools, calls } = load({ fetch: async () => json(resources) });
  const find = tools.get("find_public_resources").execute;
  const result = await find({ query: "  mCp PROMPT ", category: "public PROJECTS" });
  assert.equal(result.ok, true);
  assert.equal(result.total, 1);
  assert.equal(result.resources[0].url, "https://example.com/evaluation");
  assert.equal(result.sourceUrl, metadata.sourceUrl);
  assert.equal(result.truncated, false);
  assert.equal(calls[0][0], "/api/v1/resources.json");
  const empty = await find({ query: "missing word" });
  assert.equal(empty.total, 0);
  assert.equal(empty.resources.length, 0);
  const category = await find({ category: "not a category" });
  assert.equal(category.error.code, "INVALID_INPUT");
  assert.deepEqual(plain(category.categories), resources.resources.map(({ category }) => category));
});

test("resource results stay bounded and invalid inputs are rejected before network access", async () => {
  const many = { ...resources, resources: Array.from({ length: 30 }, (_, index) => ({
    ...resources.resources[0], name: `Resource ${index}`,
  })) };
  const { tools, calls } = load({ fetch: async () => json(many) });
  const find = tools.get("find_public_resources").execute;
  const defaultResult = await find({});
  assert.equal(defaultResult.resources.length, 8);
  assert.equal(defaultResult.total, 30);
  assert.equal(defaultResult.truncated, true);
  assert.equal((await find({ limit: 20 })).resources.length, 20);
  const before = calls.length;
  for (const input of [
    null, [], "query", { query: 42 }, { query: "x".repeat(161) },
    { category: "x".repeat(81) }, { category: [] }, { limit: 0 }, { limit: 21 },
    { limit: 1.5 }, { limit: "8" }, { url: "https://example.com/private" },
  ]) {
    assert.equal((await find(input)).error.code, "INVALID_INPUT");
  }
  assert.equal(calls.length, before);
});

test("workshop selection distinguishes current course and archive using numeric years", async () => {
  const { tools, calls } = load({ fetch: async () => json(workshops) });
  const read = tools.get("get_public_workshops").execute;
  assert.equal((await read({})).workshops.length, 2);
  const archive = await read({ year: 2025 });
  assert.equal(archive.workshops.length, 1);
  assert.equal(archive.workshops[0].year, 2025);
  assert.equal(archive.workshops[0].status, "archive");
  const current = await read({ year: 2026 });
  assert.equal(current.workshops[0].materials[0].access, "registered-students");
  assert.equal(current.workshops[0].materials[0].note, "Available to registered students.");
  assert.equal(calls[0][0], "/api/v1/workshops.json");
  const before = calls.length;
  assert.equal((await read({ year: 2024 })).error.code, "INVALID_INPUT");
  assert.equal((await read({ year: "2025" })).error.code, "INVALID_INPUT");
  assert.equal(calls.length, before);
});

test("HTTP, content-type, malformed-data and network failures return actionable structured results", async (t) => {
  const cases = [
    ["missing path", async () => new Response("<html>Missing</html>", { status: 404 }), "HTTP_ERROR", 404],
    ["HTML success", async () => new Response("<html>Homepage</html>", { headers: { "Content-Type": "text/html" } }), "UNEXPECTED_RESPONSE"],
    ["invalid JSON", async () => new Response("{", { headers: { "Content-Type": "application/json" } }), "INVALID_DATA"],
    ["wrong data", async () => json({ success: true }), "INVALID_DATA"],
    ["wrong version", async () => json({ ...profile, apiVersion: "2" }), "INVALID_DATA"],
    ["oversized data", async () => json({ ...profile, biography: "a".repeat(1000001) }), "INVALID_DATA"],
    ["network", async () => { throw new Error("Private implementation detail"); }, "FETCH_FAILED"],
  ];
  for (const [name, fetcher, code, status] of cases) {
    await t.test(name, async () => {
      const { tools } = load({ fetch: fetcher });
      const result = await tools.get("get_public_profile").execute({});
      assert.equal(result.ok, false);
      assert.equal(result.error.code, code);
      if (status) assert.equal(result.error.status, status);
      assert.ok(result.error.message.length > 15);
      assert.ok(result.error.hint.length > 15);
      assert.equal(result.documentation, "https://adityasinghal.com/developers/");
      assert.ok(!JSON.stringify(result).includes("Private implementation detail"));
    });
  }
});

test("cancellation prevents pending reads and reaches an in-flight fetch", async () => {
  const stopped = new AbortController();
  stopped.abort();
  const first = load();
  const cancelled = await first.tools.get("get_public_profile").execute({}, { signal: stopped.signal });
  assert.equal(cancelled.error.code, "CANCELLED");
  assert.equal(first.calls.length, 0);

  const controller = new AbortController();
  const active = load({
    fetch: async (_path, { signal }) => {
      assert.equal(signal, controller.signal);
      controller.abort();
      throw controller.signal.reason;
    },
  });
  const result = await active.tools.get("get_public_profile").execute({}, { signal: controller.signal });
  assert.equal(result.error.code, "CANCELLED");
  assert.equal(active.calls.length, 1);
});
