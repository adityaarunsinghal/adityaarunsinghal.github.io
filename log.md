# Work Log — adityaarunsinghal.github.io

Append-only. Datetimed sections. Most recent at top within each session.

---

## 2026-07-15 — Dependabot remediation (39 alerts, two projects)

**Ask:** Adi: "fix as much dependabot autonomously as you can and push." Later
confirmed: OK with all upgrades incl. safe majors; deploy both site + functions.

**Key discovery — the 39 alerts span TWO projects, not one:**
- `pnpm-lock.yaml` (main SPA): **7** alerts
- `functions/package-lock.json` (a Firebase Cloud Functions subproject, npm-based,
  Node 22): **32** alerts. This subproject was easy to miss; it has its own
  manifest + lockfile and is deployed separately via `firebase deploy --only
  functions`.
- Method: `pnpm audit`'s endpoint is retired (410); source of truth was the
  GitHub Dependabot alerts API (`gh api .../dependabot/alerts`), parsed per
  manifest. `pnpm why` / `npm ls` used to separate real in-tree vulns from noise.

### Main site (pnpm) — 7 → 0, all via `package.json` `pnpm.overrides`
- `@grpc/grpc-js` pinned `>=1.9.16 <1.10.0` (MUST stay on 1.9.x: firestore
  requires `~1.9.0`, and the 1.14.x line has its OWN advisory — jumping there is
  a trap).
- `js-yaml >=4.2.0`, `postcss >=8.5.10`, `@babel/core >=7.29.6` (all transitive
  under eslint/vite; resolved to v5 / 8.5.19 / 8.0.1 respectively — lint still
  passes so the majors are fine here).
- `vite`: pinned EXACT `8.0.16` (see regression note below).
- protobufjs alerts were already moot (existing override resolves 8.6.1).

**Vite regression caught + corrected (the non-obvious part):**
- First bumped vite to latest `8.1.4`. Build still exited 0, but rolldown's
  changed default chunking merged ALL vendor code into one ~700kB entry chunk,
  collapsing the firebase/firestore code-split that recent `perf` commits
  established. Eager gzip stayed ~216kB (modulepreload), so first-load was flat,
  but firebase (123kB gz, near-static) would now bust cache on every app deploy.
- Tried the "obvious" fix `manualChunks: node_modules -> 'vendor'`: MEASURED it,
  it was WORSE — dragged lazy-only deps (firestore, confetti, react-spring,
  charts) onto the eager path, growing first-load to ~258kB gz. Pushed back on
  this with Adi (his pick), showed the numbers, he agreed to change course.
- Landed: pin vite `8.0.16` (minimal CVE patch) + a TARGETED `manualChunks` that
  splits only `firebase` and `react`. Result: firebase back in its own 408kB
  (123kB gz) chunk, react in 189kB, firestore/confetti/charts confirmed still
  lazy, eager total ~209kB gz (slightly better than original). Rationale + the
  rejected options are documented inline in `vite.config.ts`.

### Functions (npm) — 19 (npm audit) / 32 (Dependabot) → 0
- `npm update` (in-range) alone: 19 → 8 (cleared both criticals + all 4 highs,
  bumped firebase-functions 7.0.2 → 7.2.5).
- Remaining 8 were all the `uuid` buffer-bounds advisory chained up through the
  google-cloud stack.
- **firebase-admin@14 is a trap:** installing it left 7 moderates AND is
  peer-INVALID — `firebase-functions@7` (latest, incl. 7.3.0-rc) declares
  `peer firebase-admin@"^11||^12||^13"`, i.e. no v14 support yet. Backed down to
  `firebase-admin@^13.10.0` (newest peer-compatible).
- Even admin@13's latest google-cloud deps still pin old `uuid`, so added
  `overrides: { "uuid": ">=11.1.1" }` (safe: the stack uses `uuid.v4()`, stable
  API; forced to 14.0.1). Clean reinstall (rm node_modules + lockfile).
- Kept `node-fetch@2.7.0` (no open advisory; v3 is ESM-only and would need code
  changes for no security gain).

**Verified before commit:**
- Main: `pnpm lint` exit 0, `pnpm build` exit 0, chunk layout + eager
  modulepreload set inspected in `dist/`.
- Functions: `npm audit` → 0 vulns, `npm ls` → no peer warnings, all 8
  Dependabot-flagged transitives at/above fix versions (node-forge removed),
  `tsc` compiles clean to `lib/index.js`.

**Deploy + Dependabot reconciliation:** see follow-up entry after push.

---

## 2026-07-15 — Add /github vanity redirect

**Ask:** Adi asked whether `adityasinghal.com/github` worked. It didn't — no
route existed, so it fell through the `/*` catch-all to `<NotFound>`. (Note: every
SPA route returns HTTP 404 from GitHub Pages by design; the spa-github-pages
`404.html` trick rewrites the path and React Router resolves it client-side. So a
raw 404 status is not proof a route is broken — what matters is whether the router
has a matching entry. `/github` had none.)

**Change:** Mirrored the existing redirect pattern (LinkedIn/YouTube/etc).
- New `src/components/GitHubRedirect.tsx` → `window.location.href =
  'https://github.com/adityaarunsinghal'` in a `useEffect`.
- Wired into `src/router.tsx`: import + route variants
  `github` / `GitHub` / `GITHUB` / `Github` (added the `Github` casing on top of
  the usual three since it's the most common way people type it).

**Provenance of the target URL:** username `adityaarunsinghal` confirmed from the
git remote (`github.com/adityaarunsinghal/adityaarunsinghal.github.io.git`), not
guessed.

**Verified:**
- `pnpm build` (tsc + vite) passed clean in ~1.7s before commit.
- Committed 82837df, pushed to origin/master, `pnpm run deploy` → gh-pages
  ("Published").
- Deployed main bundle (`index-tcf3jkEy.js`) confirmed to contain the redirect
  target string.
- End-to-end browser drive of `https://adityasinghal.com/github` landed on
  `https://github.com/adityaarunsinghal` (title "adityaarunsinghal (Adi Singhal)
  · GitHub"). Full chain works: 404.html rewrite → app reload → router match →
  useEffect redirect.

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

### 404 asset optimized & deployed (2026-06-09, commit 43e843d)
Adi wanted the gif kept (likes it) — only imperceptible shrinking allowed, plus
lazy-load. Findings from measurement:
- Lossy WebP / palette reduction barely helped (it's 81 frames of motion, not
  per-frame quality). Aggressive lossy would visibly degrade — rejected.
- True LOSSLESS animated WebP (gif2webp default): 1315KB -> 1115KB (~15%),
  bit-for-bit identical (640x440, 81 frames, loops). near_lossless/mixed were
  actually larger for this content. Chose pure lossless.
- Bigger win: the gif was STATICALLY imported by ErrorBoundary (wraps every
  route), so it shipped in the main bundle to every visitor. Moved 404.webp to
  public/ and referenced by URL in both NotFound + ErrorBoundary, and lazy-loaded
  NotFound. Now the asset only downloads when error/404 renders.
- Verified in-browser: 404 page renders the webp (naturalWidth 640, decoded);
  home page makes ZERO requests for 404.webp. Deployed; live confirmed
  (https://adityasinghal.com/404.webp = 200 image/webp; old gif path 404s).

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
