# Work Log — adityaarunsinghal.github.io

Append-only. Datetimed sections. Most recent at top within each session.

---

## 2026-06-09 (cont.) — Audit findings & fixes applied

Ran a 5-dimension adversarial audit workflow (security, react-bugs, deps-build,
hygiene, functions-data). 59 agents, ~2.1M tokens, ~9 min. 54 findings survived
verification, 0 rejected (several downgraded to "partial" with corrected
severity). Full raw findings: docs/audit-findings-raw-2026-06-09.json. Harness:
docs/audit-workflow.mjs.

Key discovery: the on-disk node_modules was the OLD npm install (vite 6, react 18,
eslint 8) and predated the pushed pnpm/major-dep migration. So my first
"build passes / lint broken" reads were against stale deps. After a clean
`pnpm install --frozen-lockfile`: build PASSES and `pnpm lint` PASSES against the
real migrated tree (vite 8, react 19, router 7, TS 6, eslint 9). The "lint is
broken" symptom was purely the stale eslint 8 — NOT a committed defect.

### Fixed & pushed
- **Security (commit b957260):** prod dependency CVEs cleared. Added pnpm override
  `protobufjs: ">=7.5.9"` (resolves 8.6.1) to kill CVE-2026-41242 (CVSS 9.8 RCE)
  + 4 high + 4 moderate via firebase>firestore>@grpc/proto-loader. Bumped
  react-router-dom to ^7.17.0 (resolves react-router 7.17.0) to clear open-redirect
  + 2 DoS highs. `pnpm audit --prod` => "No known vulnerabilities found".
- **LovesIngy bugs (commit d255914):** (1) countdown delete used a filtered-list
  index against the unfiltered array -> deleted wrong event; now deletes by object
  identity. (2) JSON-import path wrote message:undefined + Timestamp(NaN); now
  validates text:string + finite numeric ts and uses Timestamp.fromMillis. (3)
  "0 days" -> "Today!"/"1 day". (4) list key index -> date+name.
- **Hygiene (commit b45c304):** deleted dead components RedirectToExternal.tsx
  (also had navigate-as-render-side-effect bug) and GivesIngy/ (never routed);
  removed tracked deps/ Vite cache (12 files) + added /deps/ to .gitignore;
  moved VisitsDenmark {REQUIREMENTS,SETUP,TODOS}.md out of src/ into docs/.
- **CI (commit 072a34a):** checkout/setup-node v4->v5 in both workflows (v4 = Node
  20, deprecated after 2026-06-16); deploy.yml Build step npm->pnpm; firebase
  deploy via `pnpm dlx firebase-tools` with FIREBASE_TOKEN moved to env:. TRMNL
  sync re-verified green on v5 (run 27233402636).

### Second batch applied, deployed & verified live (2026-06-09)
- functions hardening (5a580e1): maxInstances:5 cap, text validation + 5000-char
  limit, Translate API response-shape guard. PII trim (585d2df): log uid not email,
  drop text/translation previews. (Committed; applies on next functions deploy.
  Adi: translate feature kept but unused, fine to leave until then.)
- Progress.tsx (4b258f9): DST-safe yesterday math, pure state updaters.
- VisitsDenmark (38fba1c): no Bearer undefined, stale-token cache clear + retry cap.
  (ce878a5): read isOnline via ref so speech recognition isn't rebuilt on
  connectivity flips. NEEDS on-device speech verification.
- CI (072a34a): actions v4->v5, deploy.yml pnpm consistency. TRMNL re-verified green.
- perf+cleanup (1c2660d): React.lazy code-splitting (795KB monolith -> 186KB entry +
  per-route chunks, firebase isolated to 408KB auth-only chunk); removed /private
  Vite boilerplate route + unused react.svg/vite.svg.
- docs (5f98578): README rewrite + TOMBSTONE.md for removed plan docs.
  (79c4107): CONFIGURATION.md refreshed for pnpm/current routes/collections.

**Verification:** build PASS, lint PASS, functions build PASS, `pnpm audit --prod`
= "No known vulnerabilities found". Playwright smoke test of all routes on the
built preview AND on live https://adityasinghal.com: zero console errors, lazy
chunks load, auth redirects work, /private 404s correctly.

**Deployed:** `pnpm run deploy` pushed to gh-pages (c4022243); live site serves the
new code-split bundle (index-RKLIPVMR.js), HTTP 200, verified in-browser.

### Still open (next batch / handed back to Adi)
- VisitsDenmark speech-recognition fix wants on-device verification (can't test
  speech headlessly).
- functions/ remains on npm (intentional, isolated subdir).
- 404.gif is 1.3MB (largest asset); could be optimized but it's lazy/not on hot path.
- functions/ @types/node ^20 vs engines.node 22 (cosmetic; build passes).
- functions/src/index.ts: add maxInstances cost cap (#15); validate text size (#16/#39);
  guard `data.data.translations[0]` API shape (#40). In-memory rate limiter is
  per-instance (#17/#38) — known Cloud Functions limitation, document or move to
  Firestore. Verbose PII logging (#45).
- Progress.tsx: DST-unsafe Date.now()-86400000 (#24); milestone side effects inside
  setEntries updater double-fire in StrictMode (#25).
- VisitsDenmark: rAF/SpeechRecognition recreated on online/offline (#5,#7); auth
  token cached 58min no refresh on 401 (#8); test-translation on mount can send
  Bearer undefined (#22).
- /private route serves Vite starter boilerplate & isn't PrivateRoute-wrapped
  (#37,#44) — product decision needed.
- Docs: README.md stale (#14), CONFIGURATION.md stale (#31), obsolete plan docs (#32,#33).
- Bundle: 795KB single chunk, no code-splitting (#30).

## 2026-06-09 — Fix failing GitHub workflow (TRMNL sync) + repo audit

### TRMNL sync failure — root cause & fix (DONE, verified in CI)

**Symptom:** "Sync to TRMNL" Actions workflow failing on every scheduled run
since 2026-06-08 ~23:39 UTC. Prior run at 22:13 UTC succeeded. Repo code had
not changed in that window.

**Error (from `gh run view --log-failed`):**
```
TypeError: Cannot read properties of undefined (reading 'cert')
  at scripts/trmnl-sync.mjs:16:32   ->  admin.credential.cert(serviceAccount)
```

**Root cause (confirmed by local repro in /tmp/trmnl-repro):**
- The workflow ran `npm install firebase-admin` with NO version pin.
- `firebase-admin` v14.0.0 released in that time window. v14 removed the legacy
  default-export namespace. On the default import, `admin.credential` is now
  `undefined`, and `admin.firestore` is also gone. `cert` / `initializeApp` are
  top-level named exports; Firestore moved to the `firebase-admin/firestore`
  subpath.
- So an unpinned dependency upgraded itself into a breaking major and broke a
  script that hadn't changed since January.

**Fix (commit 844b3a8, rebased onto pnpm migration, pushed as 9d480f2):**
1. `scripts/trmnl-sync.mjs` — migrated to the modular subpath API:
   `import { initializeApp, cert } from 'firebase-admin/app'` and
   `import { getFirestore } from 'firebase-admin/firestore'`. This API is stable
   across v12–v14+.
2. `.github/workflows/trmnl-sync.yml` — pinned install to `firebase-admin@^14`
   as a second guard so a future major can't silently re-break it.

**Verification:**
- Local repro: fixed script reaches into `cert()` (fails only on fake key crypto),
  TypeError gone.
- CI: manually triggered run 27232282566 → ✓ success in 40s.

**Push friction (resolved):** OAuth token lacked `workflow` scope; Adi ran
`gh auth refresh -s workflow`, then `gh auth setup-git` synced the keychain creds.

**Side note:** local `master` was 4 commits behind origin — remote had a pnpm
migration + major dependency upgrade. Rebased cleanly. CLAUDE.md now reflects pnpm.

### Observations queued for the audit
- GitHub flagged **39 Dependabot vulnerabilities** (3 critical / 17 high / 16 mod
  / 3 low) on push — may be partly stale post dep-migration; needs verification.
- `actions/checkout@v4` + `actions/setup-node@v4` run on **deprecated Node 20**
  (forced to Node 24 after 2026-06-16). Bump to @v5 where available.
- `deps/` dir holds **12 tracked Vite pre-bundle artifacts** (chunk-*.js, *.map)
  referenced nowhere in src/index.html/vite.config — likely stray, should be
  gitignored/removed.
- `firebase-debug.log` (720 KB) present on disk, untracked — fine, but clutter.
- `deploy.yml` still uses `npm ci` despite the pnpm migration — inconsistent.
