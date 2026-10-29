import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = fileURLToPath(new URL("../", import.meta.url));
const { values } = parseArgs({
  options: { directory: { type: "string", default: "dist" } },
});
const output = path.resolve(root, values.directory);
const readJson = async (pathname) => JSON.parse(
  await readFile(path.join(output, pathname.replace(/^\//, "")), "utf8"),
);
const origin = "https://adityasinghal.com";
const expectedPaths = [
  "/api/v1/index.json",
  "/api/v1/profile.json",
  "/api/v1/resources.json",
  "/api/v1/workshops.json",
];
const spec = await readJson("/openapi.json");
const documents = Object.fromEntries(await Promise.all(expectedPaths.map(async (pathname) => [
  pathname, await readJson(pathname),
])));

assert.match(spec.openapi, /^3\.1\.\d+$/);
assert.deepEqual(spec.security, [], "The public API must not advertise credentials.");
assert.deepEqual(spec.servers.map(({ url }) => url), [origin]);
assert.deepEqual(Object.keys(spec.paths).sort(), [...expectedPaths].sort());
assert.equal(spec.externalDocs.url, `${origin}/developers/`);
assert.ok(Object.keys(spec.components.schemas).length > 0);

// The OpenAPI schemas use local component references. Move those definitions
// into JSON Schema's $defs without altering validation rules, then use a full
// Draft 2020-12 validator for both schemas and published payloads.
function relocateReferences(value) {
  if (Array.isArray(value)) return value.map(relocateReferences);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => {
    if (key === "$ref") {
      assert.match(child, /^#\/components\/schemas\/[A-Za-z][A-Za-z0-9]*$/);
      return [key, child.replace("#/components/schemas/", "#/$defs/")];
    }
    return [key, relocateReferences(child)];
  }));
}

const schemaId = "urn:aditya-singhal:public-data:1";
const schemaRoot = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: schemaId,
  $defs: relocateReferences(spec.components.schemas),
};
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
ajv.addSchema(schemaRoot);
for (const name of Object.keys(spec.components.schemas)) {
  assert.ok(ajv.getSchema(`${schemaId}#/$defs/${name}`), `Invalid component schema: ${name}`);
}

const validators = new Map();
const operationIds = new Set();
for (const pathname of expectedPaths) {
  const entry = spec.paths[pathname];
  assert.deepEqual(Object.keys(entry), ["get"], `${pathname} must describe only its real GET operation.`);
  const operation = entry.get;
  assert.match(operation.operationId, /^[A-Za-z][A-Za-z0-9_]*$/);
  assert.ok(!operationIds.has(operation.operationId), `Duplicate operationId: ${operation.operationId}`);
  operationIds.add(operation.operationId);
  assert.ok(operation.summary && operation.description);
  assert.deepEqual(operation.security, []);
  assert.ok(!operation.requestBody && !operation.parameters, "Static documents do not accept request bodies or filtering parameters.");
  const response = operation.responses["200"].content["application/json"];
  const reference = relocateReferences(response.schema).$ref;
  assert.ok(reference, `${pathname} needs a response schema.`);
  const validate = ajv.getSchema(`${schemaId}${reference}`);
  assert.ok(validate, `${pathname} references an unknown schema.`);
  assert.ok(validate(documents[pathname]), `${pathname}: ${ajv.errorsText(validate.errors)}`);
  assert.deepEqual(response.example, documents[pathname], `${pathname} example differs from the actual response.`);
  assert.equal(operation.responses.default.content["text/html"].schema.type, "string");
  assert.ok(!operation.responses["304"].content, "A 304 response must not advertise a body.");
  validators.set(pathname, validate);
}

const index = documents["/api/v1/index.json"];
assert.equal(index.readOnly, true);
assert.equal(index.authentication, "none");
assert.equal(index.documentationUrl, `${origin}/developers/`);
assert.equal(index.openApiUrl, `${origin}/openapi.json`);
assert.deepEqual(index.endpoints.map(({ path: pathname }) => pathname).sort(), [...expectedPaths].sort());
for (const endpoint of index.endpoints) {
  assert.equal(endpoint.url, origin + endpoint.path);
  assert.equal(endpoint.method, "GET");
  assert.equal(endpoint.operationId, spec.paths[endpoint.path].get.operationId);
}

const unlistedPath = /(?:^|\/)(?:\.local|temp|tmp|dist-ssr|login|progress|lovesingy|translate|wife|latest-resume)(?:\/|$)|resume|\.env|stats\.html/i;
function assertPublicUrl(value) {
  const url = new URL(value);
  assert.equal(url.protocol, "https:", `Public links must use HTTPS: ${value}`);
  assert.ok(!url.username && !url.password, "A public URL must not contain credentials.");
  assert.ok(!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname), "A local address is not a public source.");
  assert.ok(!unlistedPath.test(decodeURIComponent(url.pathname)), `Unlisted or private path in public API: ${value}`);
  assert.ok(!/\/(?:AGENTS|CLAUDE)\.md(?:\/|$)/.test(url.pathname), `Local agent instructions in public API: ${value}`);
  assert.ok(!/-personal(?:\/|$)/i.test(url.pathname), `Private repository destination in public API: ${value}`);
}
function inspectUrls(value) {
  if (typeof value === "string" && /^https?:\/\//i.test(value)) {
    assertPublicUrl(value);
  } else if (Array.isArray(value)) {
    value.forEach(inspectUrls);
  } else if (value && typeof value === "object") {
    Object.values(value).forEach(inspectUrls);
  }
}
Object.values(documents).forEach(inspectUrls);

const workshops = documents["/api/v1/workshops.json"].workshops;
assert.deepEqual(workshops.map(({ year }) => year).sort(), [2025, 2026]);
assert.equal(workshops.find(({ year }) => year === 2025).status, "archived");
const restrictedMaterials = [];
for (const workshop of workshops) {
  assert.equal(workshop.url, `${origin}/agentic-ai-workshop-${workshop.year}/`);
  const recordingIds = new Set();
  for (const recording of workshop.recordings) {
    assert.ok(!recordingIds.has(recording.id), "Duplicate recording within a workshop.");
    recordingIds.add(recording.id);
    const url = new URL(recording.url);
    assert.equal(url.hostname, "www.youtube.com");
    assert.equal(url.pathname, "/watch");
    assert.match(url.searchParams.get("v") || "", /^[A-Za-z0-9_-]{11}$/);
    let previousStart = -1;
    for (const chapter of recording.chapters) {
      assert.ok(chapter.startSeconds > previousStart, "Recording chapters must be chronological.");
      assert.ok(chapter.startSeconds < recording.durationSeconds, "Chapter begins outside its recording.");
      assert.equal(chapter.url, `${recording.url}&t=${chapter.startSeconds}s`);
      previousStart = chapter.startSeconds;
    }
  }
  for (const material of workshop.materials) {
    if (material.access === "registered-students") {
      assert.match(material.note || "", /registered students/i);
      restrictedMaterials.push(material);
    }
    for (const link of material.links) {
      if (new URL(link.url).hostname === "nyu-workshop.adityasinghal.com") {
        assert.equal(material.access, "registered-students", "The student app store must not be described as anonymous public access.");
        assert.match(material.note || "", /registered students/i);
      }
    }
  }
}

let negativeFixtures = 0;
const additiveProfile = structuredClone(documents["/api/v1/profile.json"]);
additiveProfile.futurePublicField = "An additional public field.";
assert.ok(
  validators.get("/api/v1/profile.json")(additiveProfile),
  "Version 1 response schemas must allow additional public fields.",
);

function rejects(pathname, label, mutate) {
  const copy = structuredClone(documents[pathname]);
  mutate(copy);
  assert.equal(validators.get(pathname)(copy), false, `Invalid fixture accepted: ${label}`);
  negativeFixtures++;
}
rejects("/api/v1/profile.json", "unsupported API version", (copy) => { copy.apiVersion = "2"; });
rejects("/api/v1/profile.json", "wrong profile field type", (copy) => { copy.name = { text: copy.name }; });
rejects("/api/v1/profile.json", "missing canonical source", (copy) => { delete copy.sourceUrl; });
rejects("/api/v1/profile.json", "invalid source date", (copy) => { copy.modified = "2026-02-30"; });
rejects("/api/v1/resources.json", "invalid resource URL", (copy) => { copy.resources[0].url = "not a URL"; });
rejects("/api/v1/workshops.json", "string workshop year", (copy) => { copy.workshops[0].year = "2026"; });
rejects("/api/v1/workshops.json", "unsupported workshop year", (copy) => { copy.workshops[0].year = 1900; });
rejects("/api/v1/workshops.json", "invalid workshop status", (copy) => { copy.workshops[0].status = "accepting-payments"; });
rejects("/api/v1/workshops.json", "wrong chapters type", (copy) => { copy.workshops[0].recordings[0].chapters = "unstructured"; });
if (restrictedMaterials.length) {
  rejects("/api/v1/workshops.json", "unqualified restricted material", (copy) => {
    const material = copy.workshops.flatMap((workshop) => workshop.materials)
      .find((item) => item.access === "registered-students");
    delete material.note;
  });
}
for (const value of [
  `${origin}/latest-resume/`,
  `${origin}/progress/`,
  `${origin}/.local/agent-notes/`,
  "https://github.com/example/workshop-personal",
  "http://127.0.0.1/profile.json",
]) {
  assert.throws(() => assertPublicUrl(value), `Nonpublic URL accepted: ${value}`);
  negativeFixtures++;
}

console.log(`Passed: ${expectedPaths.length} public JSON documents and OpenAPI examples match their full schemas; ${operationIds.size} unique GET operations; source URLs and workshop access notes; additive response compatibility; ${negativeFixtures} rejected invalid fixtures.`);
