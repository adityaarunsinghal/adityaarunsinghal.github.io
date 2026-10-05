import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const forbiddenPath = /(?:^|\/)(?:log\.md|\.env(?:\..*)?|\.secret\.local|[^/]+\.pem)$|^docs\/(?:audit-findings-raw-|audit-workflow\.mjs|repo-audit-report-|visitsdenmark\/TODOS\.md)|^tmp\//;
const privatePath = /\/Users\/[A-Za-z0-9_.-]+\//;
const googleKey = /AIza[0-9A-Za-z_-]{35}/g;
// Only fingerprints enter source control. This deny takes priority over every
// public Firebase configuration exception, regardless of the surrounding text.
const deniedCredentials = new Set(["49b750949b2098ae9608f8e5091773e4d9c6eb943382aac484d7d218b3795581"]);

export function inspectArtifact(name, raw, { built = false, denied = deniedCredentials } = {}) {
  const findings = [];
  if (name !== ".env.example" && forbiddenPath.test(name)) findings.push({ path: name, kind: "private-artifact" });
  const text = raw.toString("utf8");
  if (privatePath.test(text)) findings.push({ path: name, kind: "private-path" });
  for (const match of text.matchAll(googleKey)) {
    if (denied.has(createHash("sha256").update(match[0]).digest("hex"))) {
      findings.push({ path: name, kind: "denied-credential" });
      continue;
    }
    // Firebase web config is intentionally public. Only its explicit config
    // field in a generated asset may contain a literal Google web API key.
    const prefix = text.slice(Math.max(0, match.index - 50), match.index);
    const nearby = text.slice(Math.max(0, match.index - 150), match.index + 500);
    const publicWebConfig = built && /^dist\/assets\/.*\.js$/.test(name)
      && /(?:apiKey|VITE_FIREBASE_API_KEY)["'`]?\s*:\s*["'`]$/.test(prefix)
      && /(?:authDomain|VITE_FIREBASE_AUTH_DOMAIN)/.test(nearby)
      && /(?:projectId|VITE_FIREBASE_PROJECT_ID)/.test(nearby);
    if (!publicWebConfig) findings.push({ path: name, kind: "credential-literal" });
  }
  return findings;
}

function scan(name, built, findings) {
  if (existsSync(path.join(root, name))) findings.push(
    ...inspectArtifact(name, readFileSync(path.join(root, name)), { built }),
  );
}

function walk(directory, findings) {
  for (const item of readdirSync(path.join(root, directory), { withFileTypes: true })) {
    const name = `${directory}/${item.name}`;
    if (item.isSymbolicLink()) {
      findings.push({ path: name, kind: "public-symlink" });
    } else if (item.isDirectory()) {
      walk(name, findings);
    } else if (item.isFile()) {
      scan(name, true, findings);
    }
  }
}

export function checkPublicArtifacts() {
  const findings = [];
  const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: root })
    .toString().split("\0").filter(Boolean);
  for (const name of tracked) scan(name, false, findings);
  if (!existsSync(path.join(root, "dist"))) {
    throw new Error("Build the website before checking public artifacts.");
  }
  walk("dist", findings);
  return { checked: "tracked source and dist", findings };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = checkPublicArtifacts();
  // Never echo matched values or source lines into CI output.
  console.log(JSON.stringify(report, null, 2));
  if (report.findings.length) process.exitCode = 1;
}
