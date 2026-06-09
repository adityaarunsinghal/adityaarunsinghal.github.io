# Repository Audit Report — 2026-06-09

Full-repository review of adityaarunsinghal.github.io: workflow failure diagnosis,
security, correctness bugs, dependency/CI health, and hygiene. Findings were
produced across five review dimensions and each was independently re-verified
before inclusion. Raw verified data: `audit-findings-raw-2026-06-09.json`.

## Headline

- The failing **TRMNL sync** GitHub workflow was diagnosed and fixed (root cause:
  an unpinned `firebase-admin` install jumped to v14, which removed the legacy
  default-export API the script used). Verified green in CI.
- All **production dependency CVEs cleared** — from 1 critical (CVSS 9.8) + several
  highs down to `pnpm audit --prod` reporting "No known vulnerabilities found".
- Several real **correctness bugs** fixed across LovesIngy, Progress, and the
  translator.
- Bundle **code-split**: the 795 KB single JS chunk became a 186 KB entry plus
  per-route chunks (Firebase isolated to an auth-only chunk).
- Dead code and stale docs removed; documentation brought back in sync.

## Fixed in this pass

### Failing workflow (root cause)
- **TRMNL sync** ran `npm install firebase-admin` with no version pin. `firebase-admin`
  v14 removed the namespaced default export, so `admin.credential.cert()` /
  `admin.firestore()` no longer existed. Migrated the script to the modular subpath
  API (`firebase-admin/app`, `firebase-admin/firestore`) and pinned the workflow
  install to `firebase-admin@^14`. Verified by a manual CI run.

### Security
- **protobufjs** `<7.5.5` reached the production tree via
  `firebase > @firebase/firestore > @grpc/proto-loader`, exposing a CVSS 9.8 RCE
  (CVE-2026-41242) plus 4 high / 4 moderate advisories. Resolved with a pnpm
  override (`protobufjs: ">=7.5.9"`).
- **react-router** `<7.15.0` had an open-redirect (moderate) and two DoS highs.
  Bumped `react-router-dom` to `^7.17.0`.
- **Cloud Function hardening:** added a `maxInstances` cap, request input
  validation with a length limit, a response-shape guard, and reduced
  personally-identifying data in logs.

### Correctness bugs
- **LovesIngy countdown deletion** deleted the wrong event (filtered-list index
  applied to the unfiltered array). Now deletes by object identity.
- **LovesIngy JSON import** could write `undefined`/`NaN` to the database; now
  validates fields and uses the correct timestamp API.
- **Progress streak** used a millisecond subtraction for "yesterday" that is wrong
  on daylight-saving transition days; switched to calendar-field date math.
- **Progress milestone celebration** ran side effects inside a state updater, which
  can double-fire under React StrictMode/concurrent rendering. Moved out.
- **Translator** could send `Authorization: Bearer undefined` before auth settled,
  and could loop forever on an expired token. Gated on a real token, clear the
  token cache on 401/403, capped retries, and stopped rebuilding speech recognition
  on connectivity changes.

### Performance & hygiene
- **Code-splitting** via `React.lazy` for the heavy routes.
- Removed the dead `/private` route (Vite starter boilerplate), the unused
  `RedirectToExternal` and `GivesIngy` components, the committed Vite cache at
  `deps/`, and stray `.DS_Store` files.
- Bumped deprecated GitHub Actions (`checkout`/`setup-node` v4 → v5) and made the
  deploy workflow consistently use pnpm.
- Rewrote a stale `README.md`, refreshed `CONFIGURATION.md`, and tombstoned
  completed planning docs (see `TOMBSTONE.md`).

## Known / deferred

- The speech-recognition stability fix should be verified on a real device
  (speech APIs cannot be exercised in headless testing).
- The `functions/` subdirectory intentionally remains on npm with its own lockfile.
- `src/images/404.gif` is ~1.3 MB (the largest asset); not on a hot path, but a
  candidate for optimization.

## Verification

- `pnpm build`, `pnpm lint`, and the functions build all pass.
- `pnpm audit --prod` → "No known vulnerabilities found".
- Browser smoke test of all routes on both the local production build and the live
  site: zero console errors, lazy chunks load, auth gating and the 404 fallback work.
