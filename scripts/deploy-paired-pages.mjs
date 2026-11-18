import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const args = process.argv.slice(2);
const requestId = randomUUID();
const rollback = args.includes('--rollback');
const runIndex = args.indexOf('--artifact-run');
const artifactRun = runIndex >= 0 ? args[runIndex + 1] : '';
if (args.some((value, index) => value !== '--rollback' && value !== '--artifact-run' && !(runIndex >= 0 && index === runIndex + 1))) throw new Error('Usage: pnpm run deploy [--artifact-run RUN_ID] [--rollback]');
if (runIndex >= 0 && !artifactRun) throw new Error('--artifact-run requires a run ID');
if (artifactRun && !/^\d+$/.test(artifactRun)) throw new Error('Artifact run ID must be numeric');
if (rollback && !artifactRun) throw new Error('Rollback requires --artifact-run RUN_ID');
const run = (name, params, options = {}) => execFileSync(name, params, { encoding: 'utf8', ...options }).trim();
if (run('git', ['status', '--porcelain', '--untracked-files=normal'])) throw new Error('Commit the authored changes before dispatching a release.');
run('git', ['fetch', 'origin', 'master']);
const source = run('git', ['rev-parse', 'HEAD']);
const master = run('git', ['rev-parse', 'origin/master']);
if (source !== master && !artifactRun) throw new Error('Deploy from the pushed master tip. Push the reviewed source changes first.');
const repo = 'adityaarunsinghal/adityaarunsinghal.github.io';
const before = JSON.parse(run('gh', ['run', 'list', '--repo', repo, '--workflow', 'deploy.yml', '--limit', '100', '--json', 'databaseId']));
const known = new Set(before.map(item => item.databaseId));
run('gh', ['workflow', 'run', 'deploy.yml', '--repo', repo, '--ref', 'master', '-f', `source_sha=${source}`, '-f', `artifact_run_id=${artifactRun}`, '-f', `rollback=${rollback}`, '-f', `request_id=${requestId}`]);
console.log(`Dispatched paired Pages release for ${source}. Waiting for its shared production workflow.`);
// Match the exact workflow-dispatch revision, not an automatic push run.
let selected;
for (let attempt = 0; attempt < 30; attempt++) {
  const runs = JSON.parse(run('gh', ['run', 'list', '--repo', repo, '--workflow', 'deploy.yml', '--event', 'workflow_dispatch', '--limit', '30', '--json', 'databaseId,headSha,createdAt,displayTitle']));
  selected = runs.filter(item => !known.has(item.databaseId) && item.displayTitle.includes(requestId)).sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  if (selected) break;
  await new Promise(resolve => setTimeout(resolve, 2000));
}
if (!selected) throw new Error('Workflow was dispatched but not found yet; inspect gh run list --workflow deploy.yml.');
console.log(`Workflow run ${selected.databaseId}`);
execFileSync('gh', ['run', 'watch', String(selected.databaseId), '--repo', repo, '--exit-status'], { stdio: 'inherit' });
