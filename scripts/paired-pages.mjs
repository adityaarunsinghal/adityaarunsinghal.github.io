import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectArtifact } from './check-public-artifacts.mjs';

export const manifestName = 'release-manifest.json';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const targets = {
  workshops: { directory: 'dist-learningwithagents', origin: 'https://learningwithagents.com', repository: 'adityaarunsinghal/learningwithagents.com' },
  personal: { directory: 'dist', origin: 'https://adityasinghal.com', repository: 'adityaarunsinghal/adityaarunsinghal.github.io' },
};
const command = (name, args, options = {}) => execFileSync(name, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim();
const git = (cwd, ...args) => command('git', args, { cwd });
const json = filename => JSON.parse(readFileSync(filename, 'utf8'));
const unlistedPath = name => /resume/i.test(name.normalize('NFD').replace(/\p{M}/gu, ''));
// The frozen inventory remains complete for integrity checks. Its public marker
// must not turn intentionally unlisted documents into discoverable URLs.
export function publicManifest(manifest) {
  const result = { ...manifest };
  for (const field of ['files', 'retainedFiles']) {
    if (manifest[field]) result[field] = Object.fromEntries(Object.entries(manifest[field]).filter(([name]) => !unlistedPath(name)));
  }
  return result;
}
function safePath(name) {
  if (!name || name === manifestName || name.startsWith('/') || name.includes('\\') || name.split('/').some(part => !part || part === '.' || part === '..' || part === '.git')) throw new Error(`Unsafe artifact path: ${name}`);
}
export function inventory(directory, { checkout = false } = {}) {
  const files = {};
  function walk(relative = '') {
    for (const item of readdirSync(path.join(directory, relative), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const name = relative ? `${relative}/${item.name}` : item.name;
      if (name === '.git' && checkout) continue;
      if (name === manifestName) continue;
      safePath(name);
      if (item.isSymbolicLink()) throw new Error(`Symlink in artifact: ${name}`);
      if (item.isDirectory()) walk(name);
      else if (item.isFile()) files[name] = digest(readFileSync(path.join(directory, name)));
      else throw new Error(`Unsupported artifact entry: ${name}`);
    }
  }
  walk();
  return files;
}
export function validate(directory, expectedRole) {
  const manifest = json(path.join(directory, manifestName));
  if (manifest.schema !== 1 || manifest.role !== expectedRole || !/^[a-f0-9]{40}$/.test(manifest.sourceSha) || !/^[a-f0-9]{64}$/.test(manifest.sourceDigest) || !manifest.releaseId || !manifest.files) throw new Error('Invalid release manifest');
  for (const name of Object.keys(manifest.files)) safePath(name);
  const actual = inventory(directory);
  if (JSON.stringify(actual) !== JSON.stringify(manifest.files)) throw new Error(`Artifact changed after freeze: ${expectedRole}`);
  for (const name of Object.keys(actual)) {
    if (/(?:^|\/)(?:AGENTS\.md|CLAUDE\.md|\.local|\.env(?:\..*)?|node_modules)(?:\/|$)/.test(name)) throw new Error(`Private artifact path: ${name}`);
    if (/-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/.test(readFileSync(path.join(directory, name), 'utf8'))) throw new Error(`Private key in artifact: ${name}`);
    const findings = inspectArtifact(`${expectedRole === 'personal' ? 'dist' : 'dist-learningwithagents'}/${name}`, readFileSync(path.join(directory, name)), { built: true });
    if (findings.length) throw new Error(`Public artifact check failed: ${name} (${findings.map(f => f.kind).join(', ')})`);
  }
  if (readFileSync(path.join(directory, 'CNAME'), 'utf8').trim() !== new URL(targets[expectedRole].origin).hostname) throw new Error(`Wrong CNAME: ${expectedRole}`);
  for (const required of ['index.html', '404.html', '.nojekyll']) if (!(required in actual)) throw new Error(`Missing ${required}: ${expectedRole}`);
  if (expectedRole === 'workshops') {
    for (const name of Object.keys(actual)) if (/(?:^|\/)(?:login|progress|lovesingy|translate|book|projects|profile)(?:\/|\.)|resume|résumé|ambipath|poppy/i.test(name)) throw new Error(`Non-workshop artifact: ${name}`);
  }
  return manifest;
}
export function prepare(root, bundle, { sourceSha, releaseId, runId = '', sourceDigest } = {}) {
  if (existsSync(bundle)) throw new Error('Release bundle already exists; use the frozen artifact for a retry');
  if (!sourceDigest) {
    const names = git(root, 'ls-files', '-z').split('\0').filter(Boolean).sort();
    const hash = createHash('sha256');
    for (const name of names) { hash.update(`${name}\0`); hash.update(readFileSync(path.join(root, name))); }
    sourceDigest = hash.digest('hex');
  }
  for (const [role, target] of Object.entries(targets)) {
    const directory = path.join(bundle, role);
    cpSync(path.join(root, target.directory), directory, { recursive: true, dereference: false });
    const manifest = { schema: 1, sourceSha, sourceDigest, releaseId, runId: String(runId), role, routeMapVersion: 1, files: inventory(directory) };
    writeFileSync(path.join(directory, manifestName), `${JSON.stringify(manifest, null, 2)}\n`);
    validate(directory, role);
  }
  return validatePair(bundle);
}
export function validatePair(bundle) {
  const manifests = Object.fromEntries(Object.keys(targets).map(role => [role, validate(path.join(bundle, role), role)]));
  for (const key of ['sourceSha', 'sourceDigest', 'releaseId', 'runId', 'routeMapVersion']) if (manifests.personal[key] !== manifests.workshops[key]) throw new Error(`Pair differs in ${key}`);
  return manifests;
}
function remoteHead(repository) {
  return command('git', ['ls-remote', repository, 'refs/heads/gh-pages']).split(/\s/)[0] || '';
}
function checkout(repository, directory) {
  git(path.dirname(directory), 'init', '--quiet', directory);
  git(directory, 'remote', 'add', 'origin', repository);
  const head = remoteHead(repository);
  if (head) {
    git(directory, 'fetch', '--quiet', '--depth=1', 'origin', head);
    git(directory, 'checkout', '--quiet', '--detach', 'FETCH_HEAD');
  }
  return { repository, directory, head, manifest: existsSync(path.join(directory, manifestName)) ? json(path.join(directory, manifestName)) : null };
}
const compatibilityAsset = name => /^assets\//.test(name) || /\.(?:js|css|woff2?|ttf|otf|png|jpe?g|gif|webp|svg|mp4|webm|pdf)$/i.test(name);
export function overlay(directory, source, role) {
  const old = existsSync(path.join(directory, manifestName)) ? json(path.join(directory, manifestName)) : null;
  const next = validate(source, role);
  const before = inventory(directory, { checkout: true });
  // Every dedicated-site byte is managed. On the personal site preserve the
  // initial inventory and old asset URLs, while allowing managed pages to retire.
  for (const name of Object.keys(before)) {
    const managed = role === 'workshops' || (old?.files && name in old.files);
    if (managed && !(name in next.files) && (role === 'workshops' || (!compatibilityAsset(name) && !unlistedPath(name)))) rmSync(path.join(directory, name));
  }
  cpSync(source, directory, { recursive: true });
  const retainedFiles = Object.fromEntries(Object.entries(inventory(directory, { checkout: true })).filter(([name]) => !(name in next.files)));
  const published = { ...next, retainedFiles };
  writeFileSync(path.join(directory, manifestName), `${JSON.stringify(publicManifest(published), null, 2)}\n`);
  return published;
}
export async function verifyLive(manifest, origin, { fetcher = fetch, attempts = 40, delayMs = 15000, allowLegacyMarker = false } = {}) {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const query = `?release=${encodeURIComponent(manifest.releaseId)}`;
      const response = await fetcher(`${origin}/${manifestName}${query}`, { signal: AbortSignal.timeout(30000), cache: 'no-store' });
      if (!response.ok) throw new Error(`Manifest HTTP ${response.status}`);
      if (response.url && new URL(response.url).origin !== origin) throw new Error('Manifest redirected to another origin');
      const live = await response.json();
      const matchesPublicMarker = JSON.stringify(live) === JSON.stringify(publicManifest(manifest));
      const matchesLegacyMarker = allowLegacyMarker && JSON.stringify(live) === JSON.stringify(manifest);
      if (!matchesPublicMarker && !matchesLegacyMarker) throw new Error('Live manifest does not match prepared artifact');
      const entries = Object.entries({ ...manifest.retainedFiles, ...manifest.files });
      // Bounded concurrency checks every generated and retained file, not just the manifest.
      for (let offset = 0; offset < entries.length; offset += 8) await Promise.all(entries.slice(offset, offset + 8).map(async ([name, hash]) => {
        safePath(name);
        const item = await fetcher(`${origin}/${name.split('/').map(encodeURIComponent).join('/')}${query}`, { signal: AbortSignal.timeout(30000), cache: 'no-store' });
        if ((item.url && new URL(item.url).origin !== origin) || !item.ok || digest(Buffer.from(await item.arrayBuffer())) !== hash) throw new Error(`Live file differs: ${name}`);
      }));
      return;
    } catch (error) { lastError = error; }
    if (attempt + 1 < attempts) await sleep(delayMs);
  }
  throw new Error(`Live verification failed for ${origin}: ${lastError.message}`);
}
export function publishCheckout(state, source, role) {
  if (remoteHead(state.repository) !== state.head) throw new Error(`Unexpected destination change: ${role}`);
  const manifest = overlay(state.directory, source, role);
  git(state.directory, 'add', '--all');
  if (git(state.directory, 'status', '--porcelain')) {
    git(state.directory, '-c', 'user.name=Aditya Singhal', '-c', 'user.email=adityaarunsinghal@users.noreply.github.com', '-c', 'core.hooksPath=/dev/null', 'commit', '--quiet', '-m', `Publish paired pages ${manifest.releaseId} (${manifest.sourceSha})`);
    // The new commit descends from the recorded head. The lease adds an atomic
    // compare-and-swap check; it is never used to rewrite destination history.
    git(state.directory, 'push', '--quiet', `--force-with-lease=refs/heads/gh-pages:${state.head}`, 'origin', 'HEAD:refs/heads/gh-pages');
  }
  state.head = git(state.directory, 'rev-parse', 'HEAD');
  state.manifest = publicManifest(manifest);
  return manifest;
}
function summary(message) {
  console.log(message);
  if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, `${message}\n`, { flag: 'a' });
}
export async function publishPair(bundle, { repositories, origins, verify = verifyLive, allowRollback = false, skipSourceCheck = false, sourceHead, restoreArtifact } = {}) {
  const manifests = validatePair(bundle);
  const temporary = mkdtempSync(path.join(tmpdir(), 'paired-pages-'));
  let started = false;
  try {
    const states = Object.fromEntries(Object.entries(targets).map(([role, target]) => [role, checkout(repositories?.[role] || `git@pages-${role}:${target.repository}.git`, path.join(temporary, role))]));
    const oldWorkshop = states.workshops.manifest;
    const oldPersonal = states.personal.manifest;
    if (!allowRollback && oldWorkshop && (!oldPersonal || oldWorkshop.releaseId !== oldPersonal.releaseId) && oldWorkshop.releaseId !== manifests.workshops.releaseId) {
      if (!oldWorkshop.runId || !/^[0-9]+$/.test(oldWorkshop.runId)) throw new Error('Incomplete prior pair requires its frozen artifact');
      const recovered = path.join(temporary, 'recovery');
      if (restoreArtifact) await restoreArtifact(oldWorkshop, recovered);
      else command('gh', ['run', 'download', oldWorkshop.runId, '--repo', targets.personal.repository, '--name', `paired-pages-${oldWorkshop.sourceSha}`, '--dir', recovered]);
      const recoveryManifest = validatePair(recovered).workshops;
      if (recoveryManifest.releaseId !== oldWorkshop.releaseId || recoveryManifest.sourceSha !== oldWorkshop.sourceSha) throw new Error('Recovery artifact does not match incomplete destination');
      summary(`Recovering incomplete release ${oldWorkshop.releaseId} before starting ${manifests.workshops.releaseId}.`);
      await publishPair(recovered, { repositories, origins, verify, skipSourceCheck: true, sourceHead, restoreArtifact });
      // Reload destination heads after recovery, preserving the original candidate.
      return await publishPair(bundle, { repositories, origins, verify, allowRollback, skipSourceCheck, sourceHead, restoreArtifact });
    }
    const resumingPair = oldWorkshop?.releaseId === manifests.workshops.releaseId;
    if (!skipSourceCheck && !allowRollback && !resumingPair) {
      const latest = sourceHead ? await sourceHead() : command('git', ['ls-remote', 'origin', 'refs/heads/master']).split(/\s/)[0];
      if (latest !== manifests.personal.sourceSha) { summary(`Skipped stale release ${manifests.personal.sourceSha}; master is ${latest}.`); return; }
    }
    // A matching previous pair may still be waiting for Pages propagation after
    // a failed verification. Finish observing it before advancing either head.
    if (!allowRollback && oldWorkshop && oldPersonal && oldWorkshop.releaseId === oldPersonal.releaseId && oldWorkshop.releaseId !== manifests.workshops.releaseId) {
      for (const role of Object.keys(targets)) await verify(states[role].manifest, origins?.[role] || targets[role].origin, { allowLegacyMarker: true });
    }
    for (const role of ['workshops', 'personal']) {
      // Reject a changed second destination before mutating the first, too.
      for (const state of Object.values(states)) if (remoteHead(state.repository) !== state.head) throw new Error('Destination changed during paired release');
      const published = publishCheckout(states[role], path.join(bundle, role), role);
      started = true;
      summary(`${role}: published ${states[role].head}; source ${published.sourceSha}; release ${published.releaseId}.`);
      await verify(published, origins?.[role] || targets[role].origin);
      summary(`${role}: every generated and retained file verified live.`);
    }
    summary(`Paired release ${manifests.personal.releaseId} verified on both destinations.`);
  } catch (error) {
    summary(`${started ? 'PARTIAL RELEASE: ' : ''}${error.message}. Rerun this workflow to reuse its frozen artifact; newer runs recover an incomplete pair first.`);
    throw error;
  } finally { rmSync(temporary, { recursive: true, force: true }); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [action, bundle = '.paired-release'] = process.argv.slice(2);
  if (action === 'prepare') prepare(process.cwd(), path.resolve(bundle), {
    sourceSha: process.env.RELEASE_SOURCE_SHA || git(process.cwd(), 'rev-parse', 'HEAD'),
    releaseId: process.env.RELEASE_ID || `${git(process.cwd(), 'rev-parse', 'HEAD')}-${process.env.GITHUB_RUN_ID || 'local'}`,
    runId: process.env.GITHUB_RUN_ID,
  });
  else if (action === 'check') validatePair(path.resolve(bundle));
  else if (action === 'publish') await publishPair(path.resolve(bundle), { allowRollback: process.env.ALLOW_ROLLBACK === 'true' });
  else throw new Error('Usage: node scripts/paired-pages.mjs prepare|check|publish [bundle-directory]');
}
