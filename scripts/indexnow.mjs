import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { indexNowEndpoint, indexNowKey, indexNowKeyFile } from "./indexnow-config.mjs";

export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
export const pageFile = (pathname) => pathname === "/" ? "index.html" : `${pathname.slice(1)}index.html`;

// Historical sitemaps are input too: never notify an app, alias, form or résumé,
// even if a past release accidentally listed it.
export function publicPath(url, origin) {
  try {
    const parsed = new URL(url);
    if (parsed.origin !== origin || parsed.search || parsed.hash) return null;
    const pathname = parsed.pathname;
    if (url !== origin + pathname) return null;
    if (!pathname.endsWith("/") || /%|\/\/|\.\./.test(pathname)) return null;
    if (/^\/(?:static|login|progress|lovesingy|translate|wife|latest-resume|github|linkedin|youtube|facebook|instagram|x|twitter)(?:\/|$)/i.test(pathname)) return null;
    if (/resume|registration-form|feedback|stats\.html|(?:^|\/)\./i.test(pathname)) return null;
    return pathname;
  } catch {
    return null;
  }
}

export function selectChanges({ origin, currentPaths, previousUrls, readCurrent, readPrevious }) {
  const current = new Set(currentPaths);
  for (const pathname of current) {
    assert.equal(publicPath(origin + pathname, origin), pathname, `Not a public canonical page: ${pathname}`);
  }
  const previous = new Set(previousUrls.map((url) => publicPath(url, origin)).filter(Boolean));
  const changes = [];
  for (const pathname of current) {
    const bytes = readCurrent(pageFile(pathname));
    const old = readPrevious(pageFile(pathname));
    if (!previous.has(pathname) || !old || sha256(bytes) !== sha256(old)) {
      changes.push({ url: origin + pathname, path: pathname, kind: previous.has(pathname) && old ? "updated" : "added", sha256: sha256(bytes) });
    }
  }
  for (const pathname of previous) {
    if (!current.has(pathname)) changes.push({ url: origin + pathname, path: pathname, kind: "deleted" });
  }
  return changes;
}

export function verifyRelease(receipt, sourceSha) {
  assert.equal(receipt.source_sha, sourceSha, "Live receipt must identify the current source commit.");
  assert.match(receipt.pages_sha || "", /^[a-f0-9]{40}$/, "Live receipt needs a Pages commit.");
  assert.equal(receipt.tree_matches, true, "Publication must have passed its live tree comparison.");
  assert.ok(Array.isArray(receipt.http_checks) && receipt.http_checks.length > 0, "Live receipt needs HTTP checks.");
  assert.ok(receipt.http_checks.every((check) => check.matches === true), "Every live HTTP check must pass.");
}

export async function verifyLive({ origin, changes, fetchImpl = fetch }) {
  const keyUrl = `${origin}/${indexNowKeyFile}`;
  const keyResponse = await fetchImpl(keyUrl, { redirect: "error", signal: AbortSignal.timeout(20000) });
  assert.equal(keyResponse.status, 200, "IndexNow key must be live.");
  assert.match(keyResponse.headers.get("content-type") || "", /^text\/plain\b/i, "Key must be a text response.");
  assert.equal((await keyResponse.text()).trim(), indexNowKey, "Hosted IndexNow key differs from configuration.");
  const checks = [{ url: keyUrl, status: 200, matches: true }];
  for (const change of changes) {
    const response = await fetchImpl(change.url, { redirect: "error", signal: AbortSignal.timeout(20000) });
    if (change.kind === "deleted") {
      assert.ok([404, 410].includes(response.status), `Deleted page must be gone: ${change.url}`);
      checks.push({ url: change.url, status: response.status, matches: true });
      continue;
    }
    assert.equal(response.status, 200, `Canonical page must return 200: ${change.url}`);
    assert.match(response.headers.get("content-type") || "", /^text\/html\b/i);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(sha256(bytes), change.sha256, `Live HTML differs from candidate: ${change.url}`);
    const html = bytes.toString("utf8");
    assert.ok(!/<meta\b[^>]*content=["'][^"']*\bnoindex\b/i.test(html), `Page must be indexable: ${change.url}`);
    assert.ok(!/\bnoindex\b/i.test(response.headers.get("x-robots-tag") || ""), "Noindex response cannot be submitted.");
    const canonicals = [...html.matchAll(/<link\b[^>]*>/gi)]
      .filter(([tag]) => /\brel=["']canonical["']/i.test(tag))
      .map(([tag]) => tag.match(/\bhref=["']([^"']+)["']/i)?.[1]);
    assert.deepEqual(canonicals, [change.url], `Canonical must match notified URL: ${change.url}`);
    checks.push({ url: change.url, status: 200, sha256: change.sha256, matches: true });
  }
  return checks;
}

export async function submitChanges({ origin, changes, fetchImpl = fetch, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) }) {
  if (changes.length === 0) return { outcome: "no_changes", attempts: [] };
  assert.ok(changes.length <= 10000, "IndexNow accepts at most 10,000 URLs per submission.");
  const urlList = [...new Set(changes.map(({ url }) => url))];
  assert.ok(urlList.every((url) => publicPath(url, origin)), "Submission contains a nonpublic URL.");
  const attempts = [];
  for (let attempt = 1; attempt <= 3; attempt++) {
    let retry = false;
    let wait = Math.min(1000 * 2 ** (attempt - 1), 10000);
    try {
      const response = await fetchImpl(indexNowEndpoint, {
        method: "POST",
        redirect: "error",
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: new URL(origin).host, key: indexNowKey,
          keyLocation: `${origin}/${indexNowKeyFile}`, urlList,
        }),
        signal: AbortSignal.timeout(20000),
      });
      attempts.push({ attempt, status: response.status, checked_at: new Date().toISOString() });
      await response.text();
      if ([200, 202].includes(response.status)) {
        return { outcome: response.status === 200 ? "received" : "key_validation_pending", attempts };
      }
      retry = response.status === 429 || response.status >= 500;
      const after = Number(response.headers.get("retry-after"));
      if (Number.isFinite(after) && after > 0) wait = Math.min(after * 1000, 10000);
    } catch (error) {
      attempts.push({ attempt, error: error.message, checked_at: new Date().toISOString() });
      retry = true;
    }
    if (!retry || attempt === 3) return { outcome: "failed", attempts };
    await sleep(wait);
  }
}
