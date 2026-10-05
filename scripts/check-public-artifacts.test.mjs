import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { inspectArtifact } from "./check-public-artifacts.mjs";

const syntheticTranslate = "AI" + "za" + "a".repeat(35);
const syntheticFirebase = "AI" + "za" + "b".repeat(35);
const hash = (value) => createHash("sha256").update(value).digest("hex");
const denied = new Set([hash(syntheticTranslate)]);
const firebaseShape = (value) => `const config={apiKey:\`${value}\`,authDomain:"fixture.firebaseapp.com",projectId:"fixture"};`;

test("denies the preserved-credential fingerprint even in a Firebase-shaped build asset", () => {
  const result = inspectArtifact("dist/assets/app.js", firebaseShape(syntheticTranslate), { built: true, denied });
  assert.deepEqual(result, [{ path: "dist/assets/app.js", kind: "denied-credential" }]);
  assert.equal(JSON.stringify(result).includes(syntheticTranslate), false);
  assert.equal(JSON.stringify(result).includes(hash(syntheticTranslate)), false);
});

test("retains benign public Firebase web configuration in generated assets", () => {
  assert.deepEqual(inspectArtifact("dist/assets/app.js", firebaseShape(syntheticFirebase), { built: true, denied }), []);
});

test("rejects unapproved literal keys outside generated Firebase config", () => {
  for (const [name, text, built] of [
    ["src/example.js", firebaseShape(syntheticFirebase), false],
    ["dist/assets/app.js", `const translateKey="${syntheticTranslate}";`, true],
    ["dist/assets/app.js", `const apiKey="${syntheticFirebase}";`, true],
  ]) {
    const result = inspectArtifact(name, text, { built, denied });
    assert.equal(result.length, 1);
    assert.equal(JSON.stringify(result).includes(syntheticTranslate), false);
    assert.equal(JSON.stringify(result).includes(syntheticFirebase), false);
  }
});

test("rejects private paths and working artifacts without returning source content", () => {
  const privatePath = "/" + "Users" + "/fixture/private-document.md";
  assert.deepEqual(inspectArtifact("log.md", privatePath), [
    { path: "log.md", kind: "private-artifact" },
    { path: "log.md", kind: "private-path" },
  ]);
  assert.deepEqual(inspectArtifact(".env.example", "VITE_FIREBASE_API_KEY=\n"), []);
});
