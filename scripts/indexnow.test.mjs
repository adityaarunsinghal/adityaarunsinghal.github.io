import assert from "node:assert/strict";
import test from "node:test";
import { publicPath, selectChanges, sha256, submitChanges, verifyLive, verifyRelease } from "./indexnow.mjs";
import { indexNowKey, indexNowKeyFile } from "./indexnow-config.mjs";

const origin = "https://adityasinghal.com";
test("notifications select changed canonical pages and genuine removals, never historical private/alias entries", () => {
  const changes = selectChanges({
    origin, currentPaths: ["/", "/agentic-ai-workshop/"],
    previousUrls: [origin + "/", origin + "/agentic-ai-workshop/", origin + "/old-lesson/", origin + "/latest-resume/", origin + "/progress/", origin + "/static/", "https://other.example/"],
    readCurrent: () => Buffer.from("new"),
    readPrevious: (file) => file === "index.html" ? Buffer.from("old") : Buffer.from("new"),
  });
  assert.deepEqual(changes.map(({ path, kind }) => [path, kind]), [["/", "updated"], ["/old-lesson/", "deleted"]]);
  assert.equal(publicPath(origin + "/?private=yes", origin), null);
  assert.equal(publicPath(origin + "/work/%2e%2e/", origin), null);
});

test("an old or failed release receipt cannot authorize notification", () => {
  const receipt = { source_sha: "abc", pages_sha: "a".repeat(40), tree_matches: true, http_checks: [{ matches: true }] };
  verifyRelease(receipt, "abc");
  assert.throws(() => verifyRelease(receipt, "changed"));
  assert.throws(() => verifyRelease({ ...receipt, tree_matches: false }, "abc"));
  assert.throws(() => verifyRelease({ ...receipt, http_checks: [{ matches: false }] }, "abc"));
});

test("live verification rejects stale HTML, missing key, noindex and redirects", async () => {
  const html = `<html><link rel="canonical" href="${origin}/"><h1>Content</h1></html>`;
  const changes = [{ url: origin + "/", path: "/", kind: "updated", sha256: sha256(html) }];
  const fetchImpl = async (url) => new Response(url.endsWith(indexNowKeyFile) ? indexNowKey : html, {
    headers: { "content-type": url.endsWith(indexNowKeyFile) ? "text/plain" : "text/html" },
  });
  assert.equal((await verifyLive({ origin, changes, fetchImpl })).length, 2);
  await assert.rejects(verifyLive({ origin, changes: [{ ...changes[0], sha256: sha256("stale") }], fetchImpl }));
  await assert.rejects(verifyLive({ origin, changes, fetchImpl: async () => new Response("missing", { status: 404 }) }));
  const noindexHtml = html.replace("<html>", '<html><meta name="robots" content="noindex">');
  await assert.rejects(verifyLive({
    origin, changes: [{ ...changes[0], sha256: sha256(noindexHtml) }],
    fetchImpl: async (url) => url.endsWith(indexNowKeyFile)
      ? fetchImpl(url) : new Response(noindexHtml, { headers: { "content-type": "text/html" } }),
  }));
  await assert.rejects(verifyLive({ origin, changes, fetchImpl: async (_url, options) => {
    assert.equal(options.redirect, "error");
    throw new Error("redirect");
  } }));
});

test("transient failures retry; 202 is pending validation; permanent errors stop", async () => {
  const changes = [{ url: origin + "/", kind: "updated" }];
  let count = 0;
  const result = await submitChanges({
    origin, changes, sleep: async () => {},
    fetchImpl: async (_url, options) => {
      const body = JSON.parse(options.body);
      assert.deepEqual(body.urlList, [origin + "/"]);
      assert.equal(body.host, "adityasinghal.com");
      return new Response("", { status: ++count === 1 ? 429 : 202 });
    },
  });
  assert.equal(result.outcome, "key_validation_pending");
  assert.equal(count, 2);
  const failed = await submitChanges({ origin, changes, fetchImpl: async () => new Response("", { status: 403 }) });
  assert.equal(failed.attempts.length, 1);
  assert.equal(failed.outcome, "failed");
  await assert.rejects(submitChanges({ origin, changes: [{ url: origin + "/latest-resume/" }] }));
});
