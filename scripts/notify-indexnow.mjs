import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { selectChanges, submitChanges, verifyLive, verifyRelease } from "./indexnow.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const { values } = parseArgs({
  options: {
    "previous-ref": { type: "string" },
    "verified-release": { type: "string" },
    "send": { type: "boolean", default: false },
  },
});
if (!values["previous-ref"] || !values["verified-release"]) {
  throw new Error("Usage: node scripts/notify-indexnow.mjs --previous-ref <Pages SHA> --verified-release <live-verification.json> [--send]");
}
const git = (...args) => execFileSync("git", args, { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
const previousSha = git("rev-parse", "--verify", `${values["previous-ref"]}^{commit}`).toString().trim();
const sourceSha = git("rev-parse", "HEAD").toString().trim();
const receipt = JSON.parse(await readFile(path.resolve(root, values["verified-release"]), "utf8"));
verifyRelease(receipt, sourceSha);
const { publicPages, site } = await import(pathToFileURL(path.join(root, "dist-ssr/site/render.mjs")).href);
function readPrevious(file) {
  try {
    return git("show", `${previousSha}:${file}`);
  } catch (error) {
    // A missing document is an addition; malformed refs were rejected above.
    if (error.status === 128 && /does not exist in|exists on disk, but not in/.test(error.stderr.toString())) return null;
    throw error;
  }
}
const previousSitemap = readPrevious("sitemap.xml");
if (!previousSitemap) throw new Error("Previous Pages release needs its sitemap to establish public canonical URLs.");
const previousUrls = [...previousSitemap.toString("utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
const changes = selectChanges({
  origin: site.origin, currentPaths: publicPages.map(({ path: pathname }) => pathname),
  previousUrls, readPrevious,
  readCurrent: (file) => readFileSync(path.join(root, "dist", file)),
});
const checks = await verifyLive({ origin: site.origin, changes });
const submission = values.send
  ? await submitChanges({ origin: site.origin, changes })
  : { outcome: "dry_run", attempts: [] };
const report = {
  checked_at: new Date().toISOString(), source_sha: sourceSha, pages_sha: receipt.pages_sha,
  previous_pages_sha: previousSha, changes, http_checks: checks, submission,
};
const directory = path.join(root, "temp/indexnow");
await mkdir(directory, { recursive: true });
const name = `${report.checked_at.replace(/[:.]/g, "-")}.json`;
await writeFile(path.join(directory, name), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ changed_public_urls: changes.map(({ url }) => url), outcome: submission.outcome, receipt: `temp/indexnow/${name}` }, null, 2));
if (submission.outcome === "failed") process.exitCode = 1;
