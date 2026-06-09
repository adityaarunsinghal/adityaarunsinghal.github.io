# Work Log — adityaarunsinghal.github.io

Append-only. Datetimed sections. Most recent at top within each session.

---

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
