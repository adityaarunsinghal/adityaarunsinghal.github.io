export const meta = {
  name: 'repo-audit',
  description: 'Thorough multi-dimension audit of adityaarunsinghal.github.io with adversarial verification',
  phases: [
    { title: 'Audit', detail: 'parallel finders, one per dimension' },
    { title: 'Verify', detail: 'adversarially verify each finding' },
  ],
}

// ---- Shared context fed to every finder so they go deep instead of rediscovering basics ----
const REPO = '/Users/adi/Documents/GitHub/adityaarunsinghal.github.io'
const CONTEXT = `
Repo: ${REPO} (personal website + private mini-apps).
Stack: React 18 + Vite 6 + TypeScript 5, Firebase (Auth Google OAuth + Firestore),
Firebase Functions (functions/src/index.ts), hosted on GitHub Pages (gh-pages branch).
Package manager was just migrated npm -> pnpm. ~3,600 LOC, 47 source files.

ALREADY-KNOWN findings (do NOT re-report these as new; you may add depth/related issues):
- TRMNL sync was failing on firebase-admin v14 default-export removal; already fixed
  (scripts/trmnl-sync.mjs migrated to modular API, workflow pinned @^14).
- 'pnpm lint' is BROKEN: errors "No files matching the pattern src" — eslint flat
  config (eslint.config.ts) vs package.json lint script mismatch after pnpm migration.
- .github/workflows/deploy.yml is half-migrated: uses pnpm for the main install but
  still 'npm ci' / 'npm run build' for functions and 'npm install -g firebase-tools'.
- GitHub reports 39 Dependabot vulnerabilities (3 critical/17 high/16 mod/3 low) — may
  be partly stale after the dep migration; verify against pnpm-lock.yaml.
- actions/checkout@v4 + actions/setup-node@v4 run on deprecated Node 20.
- deps/ holds 12 tracked Vite pre-bundle artifacts referenced nowhere.
- The production build succeeds; main JS chunk is 879 KB (242 KB gzip), no code-splitting.

Be specific: cite file:line, give evidence, and a concrete fix. Severity scale:
critical/high/medium/low/info. Only report things you have actually read and verified.
Prefer fewer high-confidence findings over many speculative ones.
`

const FINDINGS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'severity', 'file', 'description', 'recommendation', 'confidence'],
        properties: {
          title: { type: 'string', description: 'short imperative title' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'info'] },
          category: { type: 'string' },
          file: { type: 'string', description: 'path:line, or path if no single line' },
          description: { type: 'string', description: 'what is wrong and why it matters' },
          evidence: { type: 'string', description: 'the actual code/config that proves it' },
          recommendation: { type: 'string', description: 'concrete fix' },
          effort: { type: 'string', enum: ['trivial', 'small', 'medium', 'large'] },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['verdict', 'reasoning'],
  properties: {
    verdict: { type: 'string', enum: ['confirmed', 'rejected', 'partial'] },
    reasoning: { type: 'string', description: 'why, citing the actual code you re-read' },
    corrected_severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'info', 'unchanged'] },
    corrected_fix: { type: 'string', description: 'better fix if the proposed one is wrong/incomplete; else empty' },
  },
}

const DIMENSIONS = [
  {
    key: 'security',
    agentType: 'code-modernization:security-auditor',
    prompt: `${CONTEXT}

DIMENSION: SECURITY. Audit for real security issues. Read these and trace auth end-to-end:
- firestore.rules (the ONLY real server-side authz — client checks are cosmetic)
- src/config.ts (ALLOWED_EMAILS), src/contexts/AuthContext.tsx, src/hooks/useAuth.ts,
  src/components/PrivateRoute.tsx, src/components/Login/Login.tsx
- src/firebase.ts (note window.__FIREBASE_DB__ / __FIRESTORE__ exposure in DEV — confirm it's truly DEV-gated and stripped from prod build)
- functions/src/index.ts (the translate function — API key handling, CORS, input validation, injection, abuse/rate-limit)
- scripts/trmnl-sync.mjs and scripts/seed-mock-data.ts (secret handling)
- .github/workflows/*.yml (secret usage, injection via untrusted input, token scope)
- Check: is the Firebase web apiKey exposure a real issue or expected? Are Firestore
  rules consistent with ALLOWED_EMAILS? Any collection lacking rules = default deny? Any
  email-list drift between rules and config.ts? XSS via dangerouslySetInnerHTML or
  unsanitized user message rendering in LovesIngy/GivesIngy/FeedbackForm?
Report concrete, exploitable or policy-violating issues. Skip generic boilerplate advice.`,
  },
  {
    key: 'react-bugs',
    prompt: `${CONTEXT}

DIMENSION: REACT / TYPESCRIPT CORRECTNESS BUGS. Read the components and hooks and find
actual bugs (not style): src/components/Progress/Progress.tsx (largest, most logic),
src/components/LovesIngy, GivesIngy, VisitsDenmark, AgenticAIWorkshop, FeedbackForm,
RegistrationForm, all *Redirect.tsx, NotFound, Loading, ErrorBoundary, PrivateRoute,
src/contexts/AuthContext.tsx, src/hooks/useAuth.ts, src/router.tsx, src/main.tsx.
Look for: useEffect missing/over-broad deps, stale closures, race conditions on async
setState after unmount, unhandled promise rejections, missing error/loading states,
key-prop issues in lists, incorrect cleanup, off-by-one or timezone bugs (note the
Eastern-time odd/even hour logic also exists in trmnl-sync.mjs — check the in-app
equivalents), null/undefined access, and TypeScript escape hatches (any, as unknown as,
non-null !) that hide real bugs. Cite file:line with the buggy code.`,
  },
  {
    key: 'deps-build',
    prompt: `${CONTEXT}

DIMENSION: DEPENDENCY, BUILD & CI HEALTH. Read package.json, pnpm-lock.yaml (scan, don't
read all), functions/package.json, eslint.config.ts, tsconfig*.json, vite.config.ts,
.github/workflows/deploy.yml, .github/workflows/trmnl-sync.yml, .pre-commit-config.yaml.
Investigate: (1) the broken 'pnpm lint' — read eslint.config.ts and package.json lint
script, give the exact fix; (2) deploy.yml npm/pnpm inconsistency — full corrected file
recommendation; (3) which of the 39 Dependabot vulns are real & in the prod dependency
tree vs devDeps/transitive — run 'pnpm audit --prod' style reasoning if useful; (4)
deprecated GH actions (checkout/setup-node v4 -> v5, peaceiris/actions-gh-pages); (5)
'pre-commit' field in package.json + .pre-commit-config.yaml — does this hook actually
run, and does it call npm or pnpm?; (6) functions still on npm — version skew; (7)
node engines >=20 vs CI node 22/24; (8) the 879KB unsplit bundle. Give concrete fixes.`,
  },
  {
    key: 'hygiene-deadcode',
    prompt: `${CONTEXT}

DIMENSION: REPO HYGIENE & DEAD CODE. Find clutter, stale docs, and dead code.
Investigate: (1) deps/ dir (12 tracked Vite artifacts) — confirm referenced nowhere,
recommend removal + gitignore; (2) firebase-debug.log (720KB on disk) — tracked? should
be gitignored; (3) CONFIGURATION.md (22KB) and README.md — are they stale vs the pnpm
migration and current routes/features? (4) docs/ subtree (design-plans, implementation-plans,
plans, test-plans, dep-migration-plan.md) — completed/obsolete? (5) src/components/
VisitsDenmark/{REQUIREMENTS,SETUP,TODOS}.md committed inside src — belong in docs? (6)
unused components/exports/images (src/images: react.svg, vite.svg — used?); (7) scripts/
backfill-data.json (gitignored) vs seed-mock-data.ts; (8) trmnl/ HTML templates — current?
(9) .DS_Store files; (10) duplicate/stale CLAUDE.md (root + src/components/Progress).
Use grep to prove a thing is unused before recommending deletion. Cite paths.`,
  },
  {
    key: 'functions-data',
    prompt: `${CONTEXT}

DIMENSION: FIREBASE FUNCTIONS & DATA LAYER. Deep-read functions/src/index.ts,
functions/package.json, functions/tsconfig.json, firebase.json, firestore.rules, and the
Firestore access patterns in src/components/Progress/Progress.tsx and LovesIngy/GivesIngy.
Look for: error handling in the Cloud Function, CORS config correctness, missing input
validation, cost/abuse exposure (unauthenticated callable?), region/runtime config,
Firestore query efficiency (unbounded reads, missing limits, N+1, missing indexes implied
by orderBy+where), data-shape assumptions that can throw (e.g. .toDate() on missing
timestamp, JSON.parse without try/catch), and consistency between client writes and rules.
Note firestore.rules has NO rule for any collection other than the 3 listed -> default
deny; confirm the app only uses those 3. Cite file:line.`,
  },
]

phase('Audit')
log(`Auditing ${DIMENSIONS.length} dimensions with adversarial verification`)

const results = await pipeline(
  DIMENSIONS,
  (d) => agent(d.prompt, {
    label: `audit:${d.key}`,
    phase: 'Audit',
    schema: FINDINGS_SCHEMA,
    ...(d.agentType ? { agentType: d.agentType } : {}),
  }).then((r) => ({ dim: d.key, findings: (r && r.findings) || [] })),
  (res) => {
    if (!res || !res.findings.length) return { dim: res ? res.dim : 'unknown', verified: [] }
    return parallel(res.findings.map((f) => () =>
      agent(`${CONTEXT}

You are an ADVERSARIAL verifier. A prior audit agent reported this finding in dimension "${res.dim}". Your job is to try to REFUTE it by re-reading the actual code. Default to skepticism: if the claim is not clearly supported by the real file contents, mark it rejected. If it's real but mis-scoped (wrong severity, wrong fix, partly true), mark it partial and correct it.

FINDING:
- title: ${f.title}
- severity: ${f.severity}
- file: ${f.file}
- description: ${f.description}
- evidence claimed: ${f.evidence || '(none given)'}
- proposed fix: ${f.recommendation}

Re-read the cited file(s) yourself before answering. Be precise.`,
        { label: `verify:${res.dim}:${(f.title || '').slice(0, 30)}`, phase: 'Verify', schema: VERDICT_SCHEMA }
      ).then((v) => ({ ...f, dim: res.dim, verdict: v }))
    )).then((arr) => ({ dim: res.dim, verified: arr.filter(Boolean) }))
  }
)

// Flatten everything that survived (not rejected) into a clean list
const all = results.filter(Boolean).flatMap((r) => r.verified || [])
const surviving = all.filter((f) => f.verdict && f.verdict.verdict !== 'rejected')
const rejected = all.filter((f) => f.verdict && f.verdict.verdict === 'rejected')

log(`Findings: ${all.length} raised, ${surviving.length} survived verification, ${rejected.length} rejected`)

return {
  surviving: surviving.map((f) => ({
    dim: f.dim,
    title: f.title,
    severity: f.verdict.corrected_severity && f.verdict.corrected_severity !== 'unchanged'
      ? f.verdict.corrected_severity : f.severity,
    original_severity: f.severity,
    file: f.file,
    description: f.description,
    evidence: f.evidence,
    recommendation: (f.verdict.corrected_fix && f.verdict.corrected_fix.length)
      ? f.verdict.corrected_fix : f.recommendation,
    effort: f.effort || 'unknown',
    confidence: f.confidence,
    verdict: f.verdict.verdict,
    verifier_note: f.verdict.reasoning,
  })),
  rejected: rejected.map((f) => ({ dim: f.dim, title: f.title, why_rejected: f.verdict.reasoning })),
}
