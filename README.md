# Aditya Singhal's Personal Website

A personal website with static public pages and authenticated React utilities, hosted on GitHub Pages at [adityasinghal.com](https://adityasinghal.com).

The homepage and workshop pages render complete HTML. The homepage uses native JavaScript for section navigation, particle interaction, video players and portrait motion. React and Firebase load only for the application routes.

## Local development

Use Node.js 22 (22.12 or newer), pnpm 10.32.1 (the version in `package.json`), and FFmpeg. CI and the Functions runtime use Node.js 22. FFmpeg generates workshop portrait assets during development and builds. Python 3 and [uv](https://docs.astral.sh/uv/) are needed for the optional browser checks.

```bash
git clone https://github.com/adityaarunsinghal/adityaarunsinghal.github.io.git
cd adityaarunsinghal.github.io
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

Fill in the Firebase web configuration in the local `.env` file. Keep server credentials out of `VITE_*` variables: those values are included in browser assets. Configure backend credentials separately from the browser build.

If a different global pnpm version is installed, run the repository's pinned version with `corepack pnpm@10.32.1` in place of `pnpm`.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Generate portrait assets and start Vite development. |
| `pnpm build` | Type-check, build the applications, and generate personal-site HTML and discovery files. |
| `pnpm build:paired` | Build `dist/` and the isolated workshop site in `dist-learningwithagents/`. |
| `pnpm lint` | Run ESLint. |
| `pnpm check:site` | Check public HTML, metadata, app isolation, shortcuts and legacy routes. |
| `pnpm check:agents` | Validate the public JSON contract, generated Markdown, discovery files, schema feeds and optional browser tools. |
| `pnpm check:workshop` | Check workshop content, resources, assets and registration states. |
| `pnpm check:public` | Check tracked source and build output for known private-artifact and credential patterns. |
| `pnpm check:learningwithagents` | Check the workshop-only allowlist, routes, dependencies and content parity. |
| `pnpm check:release` | Exercise paired publication, recovery, retention and live-verification safeguards in temporary repositories. |
| `pnpm preview` | Preview the production build through Vite. |
| `pnpm analyze` | Build and write the bundle report to `temp/build-reports/stats.html`. |

## Code layout

| Location | Responsibility |
| --- | --- |
| `src/site/content.ts` | Public identity, profile links and reading map. |
| `src/site/home.html` | Homepage template. |
| `src/site/render.ts` | Homepage, shortcuts, 404, metadata and discovery rendering. |
| `src/site/agents/` | Agent discovery, public JSON/OpenAPI documents and the canonical Ambipath integration. |
| `src/site/documents.ts` | Developer and privacy pages. |
| `scripts/markdown.mjs` | Generate Markdown twins from the same public HTML. |
| `src/site/routes.ts` | App/shortcut paths and legacy URL normalization. |
| `public/static/assets/` | Homepage styles and native browser enhancements. |
| `src/workshop/pages.ts` | Course facts, resource availability, recordings and chapter metadata. |
| `src/workshop/render.tsx` | Static workshop and information-page rendering. |
| `src/router.tsx`, `app.html` | React application routing and entry template. |
| `src/components/` | Application components and workshop presentation. |
| `src/firebase.ts`, `src/contexts/`, `src/hooks/` | Firebase initialization and authentication state. |
| `functions/` | Backend for the deprecated translation utility. |
| `scripts/build-site-pages.mjs`, `scripts/build-workshop-pages.mjs` | Public document generators. |
| `scripts/trmnl-sync.mjs`, `trmnl/` | Display synchronization and templates. |

Generated site files live in ignored `dist/`; temporary renderer output lives in ignored `dist-ssr/`.

## Routes

| Route | Behavior |
| --- | --- |
| `/` | Static personal homepage. |
| `/static/` | Compatibility copy of the homepage, canonicalized to `/`. |
| `/developers/`, `/privacy/` | Static public documentation and privacy information. |
| `/api/v1/*.json`, `/openapi.json` | Read-only public data and its typed API description. |
| `/index.md`, `/agentic-ai-workshop.md` | Generated Markdown views of public pages. |
| `/login/` | Google sign-in. |
| `/progress/` | Authenticated daily tracker. |
| `/lovesingy/` | Authenticated messaging and countdown utility. |
| `/translate/` | Deprecated speech translation utility; not currently configured for use. |
| `/agentic-ai-workshop/` | Current course. |
| `/agentic-ai-workshop-2025/` | Course archive. |
| Workshop registration and feedback paths | Static information pages with their configured destinations. |
| Profile shortcuts such as `/github/` and `/youtube/` | Static redirect documents with ordinary link fallbacks. |
| Unknown paths | A genuine HTTP 404 with the generated not-found document. |

Public pages work without JavaScript. App entry documents are `noindex`; Firebase authentication and Firestore rules control access to app data. Client route guards provide the sign-in flow, while server-side rules and backend validation enforce authorization.

## Verify a build

```bash
pnpm lint
pnpm build
pnpm check:site
pnpm check:agents
pnpm check:workshop
pnpm check:public
```

Use the physical-file preview to check production paths and status codes:

```bash
python3 scripts/serve-static-preview.py --port 4174
```

In another terminal, install the test browser and run the relevant checks against that same port:

```bash
uv run --with playwright==1.58.0 playwright install chromium
uv run scripts/check-site-browser.py --base-url http://127.0.0.1:4174
uv run scripts/check-workshop-browser.py --base-url http://127.0.0.1:4174
uv run scripts/check-workshop-recordings.py --base-url http://127.0.0.1:4174
```

The browser checks exercise local resources without signing in or submitting forms. Reports and screenshots go to ignored `temp/` directories. Vite development remains useful for editing, while the physical preview exposes missing files and real 404 behavior.

## Workshop maintenance

Edit course facts, release state and destinations in `src/workshop/pages.ts`. Keep unavailable resources unset until their public URLs exist. Recording entries supply the video ID, duration, chapters and search examples; the renderer uses those records for players and links.

Both years share the recording viewer. Keep year-specific styles scoped to their year and preserve the archive's content. Run the build and relevant workshop/recording checks after changes. See [recording configuration](docs/workshop-recordings.md) for the data and player details.

Workshop headings use self-hosted Source Serif 4. The current title uses a small subset of the same face; source references and font licenses are in `public/workshops/2026/fonts/`. Social cards are generated from an SVG template and bundled Lato fonts, whose license is in `scripts/assets/fonts/OFL.txt`.

## Publishing

Source lives on `master`. One workflow builds and checks both `dist/` (personal site) and `dist-learningwithagents/` (workshops), freezes their manifests, and publishes their respective `gh-pages` branches. Pushes publish automatically when the source repository variable `PAIRED_PAGES_ENABLED` is `true`. Manual dispatch remains available during bootstrap and for recovery.

The workflow requires Node.js 22, pnpm 10.32.1 and FFmpeg, and the separate SSH secrets `PERSONAL_PAGES_DEPLOY_KEY` and `WORKSHOPS_PAGES_DEPLOY_KEY`. Each key has write access only to its destination repository. `WORKSHOP_CANONICAL_ORIGIN=https://learningwithagents.com` enables the final personal-site workshop canonical URLs after the new domain passes HTTPS checks. Leave it unset during bootstrap.

From a clean, pushed `master` checkout, dispatch and wait for the same workflow:

```bash
pnpm run deploy
# Retry the immutable artifact from a previous workflow run:
pnpm run deploy --artifact-run RUN_ID
# Explicitly restore an older artifact on both sites using new commits:
pnpm run deploy --artifact-run RUN_ID --rollback
```

GitHub Actions' **Re-run jobs** also reuses that run's frozen artifact. Artifacts are retained for 90 days. Both outputs record the same source SHA, input digest and release ID in `release-manifest.json`. The workshop site publishes and passes live file-hash checks before the personal site advances. The shared concurrency lock does not cancel an in-progress pair. A newer run first recovers any incomplete prior pair from its artifact; missing or expired recovery artifacts stop publication visibly. Two Pages deployments are sequential, so a brief mismatch can exist while a pair is publishing.

The publisher uses normal descendant commits with an expected-head lease to reject concurrent destination changes. It keeps the initial personal-site inventory and old asset URLs, records retained file hashes, and removes obsolete managed documents. The dedicated workshop tree contains only its current allowlisted output. Dotfiles, including `.well-known/ard.json`, are preserved and verified. Avoid direct `gh-pages` pushes: they bypass the pair's checks and shared lock.

For local preparation without publishing:

```bash
pnpm build:paired
pnpm check:learningwithagents
node scripts/paired-pages.mjs prepare .paired-release
node scripts/paired-pages.mjs check .paired-release
```

Remove `.paired-release/` before preparing a new artifact; it is deliberately immutable once created. Firebase Functions and Firestore rules are separate, explicitly invoked operations and are absent from this publishing workflow.

### IndexNow

`scripts/notify-indexnow.mjs` compares canonical public pages with a previous Pages commit. It requires a local verification receipt identifying the current source/Pages commits and passing live file checks:

```bash
node scripts/notify-indexnow.mjs \
  --previous-ref PREVIOUS_PAGES_SHA \
  --verified-release ./path/to/verified-release.json
```

The default is a dry run. Add `--send` after reviewing the selected URLs. Submission receipt confirms delivery to IndexNow, not search indexing.

## License

See [LICENSE.txt](LICENSE.txt) for the existing Creative Commons Attribution 3.0 terms. Third-party code and fonts retain the licenses supplied with their assets.
