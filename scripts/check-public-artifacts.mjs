import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: root })
  .toString().split("\0").filter(Boolean);
const forbiddenPath = /(?:^|\/)(?:log\.md|\.env(?:\..*)?|\.secret\.local|[^/]+\.pem)$|^docs\/(?:audit-findings-raw-|audit-workflow\.mjs|repo-audit-report-|visitsdenmark\/TODOS\.md)|^tmp\//;
const privatePath = /\/Users\/[A-Za-z0-9_.-]+\//;
const googleKey = /AIza[0-9A-Za-z_-]{35}/g;
const findings = [];

function scan(name, built) {
  if (!existsSync(path.join(root, name))) return;
  if (name !== ".env.example" && forbiddenPath.test(name)) findings.push({ path: name, kind: "private-artifact" });
  const text = readFileSync(path.join(root, name)).toString("utf8");
  if (privatePath.test(text)) findings.push({ path: name, kind: "private-path" });
  for (const match of text.matchAll(googleKey)) {
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
}

function walk(directory) {
  for (const item of readdirSync(path.join(root, directory), { withFileTypes: true })) {
    const name = `${directory}/${item.name}`;
    if (item.isSymbolicLink()) {
      findings.push({ path: name, kind: "public-symlink" });
    } else if (item.isDirectory()) {
      walk(name);
    } else if (item.isFile()) {
      scan(name, true);
    }
  }
}

for (const name of tracked) scan(name, false);
if (!existsSync(path.join(root, "dist"))) {
  throw new Error("Build the website before checking public artifacts.");
}
walk("dist");
// Never echo matched values or source lines into CI output.
console.log(JSON.stringify({ checked: "tracked source and dist", findings }, null, 2));
if (findings.length) process.exitCode = 1;
