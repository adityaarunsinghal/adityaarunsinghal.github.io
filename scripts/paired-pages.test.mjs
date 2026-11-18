import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inventory, overlay, prepare, publicManifest, publishPair, validatePair, verifyLive } from './paired-pages.mjs';

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const put = (root, name, contents) => { mkdirSync(path.dirname(path.join(root, name)), { recursive: true }); writeFileSync(path.join(root, name), contents); };
function fixture(t, suffix = 'a') {
  const root = mkdtempSync(path.join(tmpdir(), 'paired-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [directory, domain] of [['dist', 'adityasinghal.com'], ['dist-learningwithagents', 'learningwithagents.com']]) {
    put(root, `${directory}/index.html`, `<!doctype html><h1>${suffix}</h1>`);
    put(root, `${directory}/404.html`, '<h1>Missing</h1>');
    put(root, `${directory}/CNAME`, domain);
    put(root, `${directory}/.nojekyll`, '');
    put(root, `${directory}/assets/workshop-${suffix}.css`, `body{--edition:${suffix}}`);
  }
  put(root, 'dist/.well-known/ard.json', '{}');
  const bundle = path.join(root, 'bundle');
  prepare(root, bundle, { sourceSha: suffix.repeat(40), sourceDigest: suffix.repeat(64), releaseId: `release-${suffix}`, runId: '123' });
  return { root, bundle };
}
function repositories(root) {
  const result = {};
  for (const role of ['workshops', 'personal']) {
    result[role] = path.join(root, `${role}.git`);
    git(root, 'init', '--bare', '--quiet', result[role]);
  }
  return result;
}
function checkout(root, repository, name) {
  const directory = path.join(root, name);
  git(root, 'clone', '--quiet', '--branch', 'gh-pages', repository, directory);
  return directory;
}

test('frozen pair shares source identity and detects changed files, extra files and symlinks', t => {
  const { root, bundle } = fixture(t);
  assert.equal(validatePair(bundle).personal.sourceDigest, 'a'.repeat(64));
  put(bundle, 'workshops/index.html', 'changed');
  assert.throws(() => validatePair(bundle), /changed after freeze/);
  cpSync(path.join(root, 'dist-learningwithagents/index.html'), path.join(bundle, 'workshops/index.html'));
  put(bundle, 'workshops/private.txt', 'extra');
  assert.throws(() => validatePair(bundle), /changed after freeze/);
  rmSync(path.join(bundle, 'workshops/private.txt'));
  symlinkSync(path.join(root, 'dist/index.html'), path.join(bundle, 'workshops/link.html'));
  assert.throws(() => validatePair(bundle), /Symlink in artifact/);
  rmSync(path.join(bundle, 'workshops/link.html'));
  put(bundle, 'personal/.local/plan.md', 'private');
  assert.throws(() => validatePair(bundle), /changed after freeze/);
});

test('workshop output rejects personal routes and private artifacts', t => {
  const { root } = fixture(t);
  put(root, 'dist-learningwithagents/login/index.html', 'private application');
  assert.throws(() => prepare(root, path.join(root, 'invalid'), { sourceSha: 'a'.repeat(40), sourceDigest: 'a'.repeat(64), releaseId: 'invalid' }), /Non-workshop artifact/);
  const probe = path.join(root, 'probe');
  mkdirSync(path.join(probe, '.git'), { recursive: true });
  assert.throws(() => inventory(probe), /Unsafe artifact/);
});

test('personal overlay preserves bootstrap files and old assets, retires managed documents, retains dotfiles', t => {
  const first = fixture(t);
  const destination = path.join(first.root, 'destination');
  put(destination, 'resume.pdf', 'existing resume');
  put(destination, 'assets/old-hash.js', 'existing bundle');
  overlay(destination, path.join(first.bundle, 'personal'), 'personal');
  put(first.root, 'dist/retired/index.html', 'retired page');
  const second = path.join(first.root, 'second');
  prepare(first.root, second, { sourceSha: 'b'.repeat(40), sourceDigest: 'b'.repeat(64), releaseId: 'release-b' });
  overlay(destination, path.join(second, 'personal'), 'personal');
  overlay(destination, path.join(first.bundle, 'personal'), 'personal');
  assert.equal(existsSync(path.join(destination, 'retired/index.html')), false);
  assert.equal(readFileSync(path.join(destination, 'resume.pdf'), 'utf8'), 'existing resume');
  assert.equal(readFileSync(path.join(destination, 'assets/old-hash.js'), 'utf8'), 'existing bundle');
  assert.equal(readFileSync(path.join(destination, '.well-known/ard.json'), 'utf8'), '{}');
});

test('publish verifies workshop first and retries a partial pair without duplicate commits', async t => {
  const { root, bundle } = fixture(t);
  const repos = repositories(root);
  const order = [];
  await assert.rejects(publishPair(bundle, { repositories: repos, skipSourceCheck: true, verify: async manifest => {
    order.push(manifest.role);
    if (manifest.role === 'personal') throw new Error('simulated propagation failure');
  } }), /simulated propagation/);
  assert.deepEqual(order, ['workshops', 'personal']);
  const before = Object.fromEntries(Object.entries(repos).map(([role, repo]) => [role, git(root, '--git-dir', repo, 'rev-parse', 'refs/heads/gh-pages')]));
  await publishPair(bundle, { repositories: repos, skipSourceCheck: true, verify: async manifest => order.push(manifest.role) });
  for (const [role, repo] of Object.entries(repos)) assert.equal(git(root, '--git-dir', repo, 'rev-parse', 'refs/heads/gh-pages'), before[role]);
  const workshop = checkout(root, repos.workshops, 'workshop-checkout');
  assert.equal(readFileSync(path.join(workshop, 'index.html'), 'utf8'), '<!doctype html><h1>a</h1>');
});

test('failed workshop verification leaves personal destination untouched; retry completes', async t => {
  const { root, bundle } = fixture(t);
  const repos = repositories(root);
  await assert.rejects(publishPair(bundle, { repositories: repos, skipSourceCheck: true, verify: async () => { throw new Error('workshop unavailable'); } }), /workshop unavailable/);
  assert.throws(() => git(root, '--git-dir', repos.personal, 'rev-parse', 'refs/heads/gh-pages'));
  await publishPair(bundle, { repositories: repos, skipSourceCheck: true, verify: async () => {} });
  assert.match(git(root, '--git-dir', repos.personal, 'rev-parse', 'refs/heads/gh-pages'), /^[a-f0-9]{40}$/);
});

test('out-of-band change between preflight and personal publication is rejected', async t => {
  const { root, bundle } = fixture(t);
  const repos = repositories(root);
  await assert.rejects(publishPair(bundle, { repositories: repos, skipSourceCheck: true, verify: async manifest => {
    if (manifest.role !== 'workshops') return;
    const intruder = path.join(root, 'intruder');
    git(root, 'init', '--quiet', intruder);
    put(intruder, 'unexpected.txt', 'external edit');
    git(intruder, 'add', '.');
    git(intruder, '-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '--quiet', '-m', 'External edit');
    git(intruder, 'push', '--quiet', repos.personal, 'HEAD:refs/heads/gh-pages');
  } }), /Destination changed/);
  const personal = checkout(root, repos.personal, 'external-checkout');
  assert.equal(readFileSync(path.join(personal, 'unexpected.txt'), 'utf8'), 'external edit');
});

test('live verification hashes every payload and preserved asset and rejects drift', async t => {
  const { bundle } = fixture(t);
  const manifest = validatePair(bundle).personal;
  const calls = [];
  const fetcher = async url => {
    const name = decodeURIComponent(new URL(url).pathname.slice(1));
    calls.push(name);
    const body = readFileSync(path.join(bundle, 'personal', name));
    return new Response(body, { status: 200 });
  };
  await verifyLive(manifest, 'https://example.invalid', { fetcher, attempts: 1 });
  assert.deepEqual(new Set(calls), new Set(['release-manifest.json', ...Object.keys(manifest.files)]));
  await assert.rejects(verifyLive(manifest, 'https://example.invalid', { attempts: 1, fetcher: async url => url.includes('index.html') ? new Response('drift') : fetcher(url) }), /Live file differs/);
});

test('explicit rollback creates forward commits and restores both payloads', async t => {
  const first = fixture(t);
  const second = fixture(t, 'b');
  const repos = repositories(first.root);
  await publishPair(first.bundle, { repositories: repos, skipSourceCheck: true, verify: async () => {} });
  await publishPair(second.bundle, { repositories: repos, skipSourceCheck: true, verify: async () => {} });
  const before = git(first.root, '--git-dir', repos.workshops, 'rev-parse', 'refs/heads/gh-pages');
  await publishPair(first.bundle, { repositories: repos, skipSourceCheck: true, allowRollback: true, verify: async () => {} });
  const after = git(first.root, '--git-dir', repos.workshops, 'rev-parse', 'refs/heads/gh-pages');
  assert.notEqual(before, after);
  assert.equal(git(first.root, '--git-dir', repos.workshops, 'rev-parse', `${after}^`), before);
  const workshop = checkout(first.root, repos.workshops, 'rolled-back');
  assert.equal(readFileSync(path.join(workshop, 'index.html'), 'utf8'), '<!doctype html><h1>a</h1>');
  assert.equal(existsSync(path.join(workshop, 'assets/workshop-b.css')), false);
});

test('stale queued releases do not mutate either destination', async t => {
  const { root, bundle } = fixture(t);
  const repos = repositories(root);
  let verified = false;
  await publishPair(bundle, { repositories: repos, sourceHead: async () => 'b'.repeat(40), verify: async () => { verified = true; } });
  assert.equal(verified, false);
  for (const repo of Object.values(repos)) assert.throws(() => git(root, '--git-dir', repo, 'rev-parse', 'refs/heads/gh-pages'));
});

test('a newer release recovers the frozen incomplete pair before advancing', async t => {
  const first = fixture(t);
  const second = fixture(t, 'b');
  const repos = repositories(first.root);
  await assert.rejects(publishPair(first.bundle, { repositories: repos, skipSourceCheck: true, verify: async () => { throw new Error('pending'); } }), /pending/);
  const order = [];
  let recovered = false;
  await publishPair(second.bundle, { repositories: repos, sourceHead: async () => 'b'.repeat(40), verify: async manifest => { order.push(`${manifest.releaseId}:${manifest.role}`); }, restoreArtifact: async (manifest, destination) => {
    assert.equal(manifest.releaseId, 'release-a');
    recovered = true;
    cpSync(first.bundle, destination, { recursive: true });
  } });
  assert.equal(recovered, true);
  assert.deepEqual(order.slice(0, 2), ['release-a:workshops', 'release-a:personal']);
  assert.deepEqual(order.slice(-2), ['release-b:workshops', 'release-b:personal']);
});

test('explicit rollback can abandon an unfinishable partial release', async t => {
  const first = fixture(t);
  const second = fixture(t, 'b');
  const repos = repositories(first.root);
  await publishPair(first.bundle, { repositories: repos, skipSourceCheck: true, verify: async () => {} });
  await assert.rejects(publishPair(second.bundle, { repositories: repos, skipSourceCheck: true, verify: async manifest => { if (manifest.role === 'workshops') throw new Error('bad release'); } }), /bad release/);
  let restoredArtifact = false;
  await publishPair(first.bundle, { repositories: repos, allowRollback: true, verify: async () => {}, restoreArtifact: async () => { restoredArtifact = true; } });
  assert.equal(restoredArtifact, false);
  const workshop = checkout(first.root, repos.workshops, 'partial-rollback');
  assert.equal(JSON.parse(readFileSync(path.join(workshop, 'release-manifest.json'))).releaseId, 'release-a');
});

test('public marker omits unlisted résumé paths while frozen inventory and live verification remain complete', async t => {
  const { root } = fixture(t);
  put(root, 'dist/latest-resume/index.html', 'known resume URL');
  put(root, 'dist/Aditya_Resume.pdf', 'resume document');
  const bundle = path.join(root, 'with-resume');
  const frozen = prepare(root, bundle, { sourceSha: 'c'.repeat(40), sourceDigest: 'c'.repeat(64), releaseId: 'release-c' }).personal;
  assert.ok(frozen.files['latest-resume/index.html']);
  const destination = path.join(root, 'published');
  put(destination, 'résumé/archived.pdf', 'retained accented path');
  const complete = overlay(destination, path.join(bundle, 'personal'), 'personal');
  const markerText = readFileSync(path.join(destination, 'release-manifest.json'), 'utf8');
  assert.doesNotMatch(markerText, /resume|résumé/i);
  assert.deepEqual(JSON.parse(markerText), publicManifest(complete));
  assert.ok(complete.retainedFiles['résumé/archived.pdf']);
  assert.ok(validatePair(bundle).personal.files['Aditya_Resume.pdf']);
  const calls = [];
  const fetcher = async url => {
    const name = decodeURIComponent(new URL(url).pathname.slice(1));
    calls.push(name);
    return new Response(readFileSync(path.join(destination, name)));
  };
  await verifyLive(complete, 'https://example.invalid', { fetcher, attempts: 1 });
  for (const name of ['latest-resume/index.html', 'Aditya_Resume.pdf', 'résumé/archived.pdf']) assert.ok(calls.includes(name));
  put(destination, 'Aditya_Resume.pdf', 'unexpected drift');
  await assert.rejects(verifyLive(complete, 'https://example.invalid', { fetcher, attempts: 1 }), /Live file differs/);
});

test('migration preserves unlisted documents from old manifests and publishes stable sanitized markers', async t => {
  const { root, bundle } = fixture(t);
  const destination = path.join(root, 'legacy');
  put(destination, 'latest-resume/index.html', 'existing hidden entry');
  const first = overlay(destination, path.join(bundle, 'personal'), 'personal');
  // Model the old publisher, including an unlisted HTML page as managed output.
  const legacy = { ...first, files: { ...first.files, 'latest-resume/index.html': first.retainedFiles['latest-resume/index.html'] }, retainedFiles: {} };
  put(destination, 'release-manifest.json', JSON.stringify(legacy));
  const next = overlay(destination, path.join(bundle, 'personal'), 'personal');
  assert.equal(readFileSync(path.join(destination, 'latest-resume/index.html'), 'utf8'), 'existing hidden entry');
  const marker = readFileSync(path.join(destination, 'release-manifest.json'), 'utf8');
  assert.doesNotMatch(marker, /resume/i);
  overlay(destination, path.join(bundle, 'personal'), 'personal');
  assert.equal(readFileSync(path.join(destination, 'release-manifest.json'), 'utf8'), marker);
  assert.ok(next.retainedFiles['latest-resume/index.html']);
  const fetcher = async url => {
    const name = decodeURIComponent(new URL(url).pathname.slice(1));
    return new Response(name === 'release-manifest.json' ? JSON.stringify(legacy) : readFileSync(path.join(destination, name)));
  };
  await assert.rejects(verifyLive(legacy, 'https://example.invalid', { fetcher, attempts: 1 }), /Live manifest/);
  await verifyLive(legacy, 'https://example.invalid', { fetcher, attempts: 1, allowLegacyMarker: true });
});

test('repeat publication keeps résumé files unlisted without another commit', async t => {
  const { root } = fixture(t);
  put(root, 'dist/latest-resume/index.html', 'resume');
  const bundle = path.join(root, 'repeat-unlisted');
  prepare(root, bundle, { sourceSha: 'd'.repeat(40), sourceDigest: 'd'.repeat(64), releaseId: 'release-d' });
  const repos = repositories(root);
  const verify = async manifest => {
    if (manifest.role === 'personal') assert.ok(manifest.files['latest-resume/index.html']);
  };
  await publishPair(bundle, { repositories: repos, skipSourceCheck: true, verify });
  const before = git(root, '--git-dir', repos.personal, 'rev-parse', 'refs/heads/gh-pages');
  await publishPair(bundle, { repositories: repos, skipSourceCheck: true, verify });
  assert.equal(git(root, '--git-dir', repos.personal, 'rev-parse', 'refs/heads/gh-pages'), before);
  assert.doesNotMatch(git(root, '--git-dir', repos.personal, 'show', 'refs/heads/gh-pages:release-manifest.json'), /resume/i);
  assert.equal(git(root, '--git-dir', repos.personal, 'show', 'refs/heads/gh-pages:latest-resume/index.html'), 'resume');
});

test('workflow never rebuilds a retry with a missing artifact and accepts an explicit available donor', t => {
  const { root } = fixture(t);
  const workflow = readFileSync(fileURLToPath(new URL('../.github/workflows/deploy.yml', import.meta.url)), 'utf8');
  const step = workflow.match(/      - name: Restore frozen release on retry\n([\s\S]*?)(?=\n      - name:)/)?.[1];
  assert.ok(step, 'restore step is present');
  const script = step.split('        run: |\n')[1].split('\n').map(line => line.replace(/^          /, '')).join('\n');
  const bin = path.join(root, 'bin');
  put(bin, 'gh', '#!/bin/sh\nif [ "$1" = api ]; then printf "%s\\n" "$TEST_ARTIFACT_NAME"; else printf "%s\\n" "$*" >> "$TEST_GH_CALLS"; fi\n');
  chmodSync(path.join(bin, 'gh'), 0o755);
  for (const scenario of [
    { name: 'fresh', attempt: '1', explicit: '', artifact: '', status: 0, restored: 'false' },
    { name: 'missing retry', attempt: '2', explicit: '', artifact: '', status: 1 },
    { name: 'missing explicit', attempt: '1', explicit: '123', artifact: '', status: 1 },
    { name: 'explicit donor on retry', attempt: '2', explicit: '123', artifact: 'paired-pages-abc', status: 0, restored: 'true' },
  ]) {
    const output = path.join(root, `output-${scenario.name}`);
    const calls = path.join(root, `calls-${scenario.name}`);
    const result = spawnSync('bash', ['-e', '-o', 'pipefail', '-c', script], {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, GITHUB_REPOSITORY: 'test/repo', ARTIFACT_RUN: '123', EXPLICIT_ARTIFACT: scenario.explicit, RUN_ATTEMPT: scenario.attempt, GITHUB_OUTPUT: output, TEST_ARTIFACT_NAME: scenario.artifact, TEST_GH_CALLS: calls },
    });
    assert.equal(result.status, scenario.status, `${scenario.name}: ${result.stderr}`);
    if (scenario.restored) assert.match(readFileSync(output, 'utf8'), new RegExp(`restored=${scenario.restored}`));
    else {
      assert.equal(existsSync(output), false);
      assert.match(result.stderr, /separate workflow/);
      assert.equal(existsSync(calls), false);
    }
    if (scenario.artifact) assert.match(readFileSync(calls, 'utf8'), /run download 123 .*--name paired-pages-abc/);
  }
});
