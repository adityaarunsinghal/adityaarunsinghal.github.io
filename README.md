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
| `pnpm build` | Type-check, build the applications, and generate public/workshop HTML and discovery files. |
| `pnpm lint` | Run ESLint. |
| `pnpm check:site` | Check public HTML, metadata, app isolation, shortcuts and legacy routes. |
| `pnpm check:workshop` | Check workshop content, resources, assets and registration states. |
| `pnpm check:public` | Check tracked source and build output for known private-artifact and credential patterns. |
| `pnpm preview` | Preview the production build through Vite. |
| `pnpm analyze` | Build and write the bundle report to `temp/build-reports/stats.html`. |

## Code layout

| Location | Responsibility |
| --- | --- |
| `src/site/content.ts` | Public identity, profile links and reading map. |
| `src/site/home.html` | Homepage template. |
| `src/site/render.ts` | Homepage, shortcuts, 404, metadata and discovery rendering. |
| `src/site/routes.ts` | App/shortcut paths and legacy URL normalization. |
| `public/static/assets/` | Homepage styles and native browser enhancements. |
| `src/workshop/pages.ts` | Course facts, resource availability, recordings and chapter metadata. |
| `src/workshop/render.tsx` | Static workshop and information-page rendering. |
| `src/router.tsx`, `app.html` | React application routing and entry template. |
| `src/components/` | Application components and workshop presentation. |
| `src/firebase.ts`, `src/contexts/`, `src/hooks/` | Firebase initialization and authentication state. |
| `functions/` | Translation backend. |
| `scripts/build-site-pages.mjs`, `scripts/build-workshop-pages.mjs` | Public document generators. |
| `scripts/trmnl-sync.mjs`, `trmnl/` | Display synchronization and templates. |

Generated site files live in ignored `dist/`; temporary renderer output lives in ignored `dist-ssr/`.

## Routes

| Route | Behavior |
| --- | --- |
| `/` | Static personal homepage. |
| `/static/` | Compatibility copy of the homepage, canonicalized to `/`. |
| `/login/` | Google sign-in. |
| `/progress/` | Authenticated daily tracker. |
| `/lovesingy/` | Authenticated messaging and countdown utility. |
| `/translate/` | Authenticated speech translation utility. |
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

Source lives on `master`; GitHub Pages serves `gh-pages`. A source push does not publish the website.

Run the build checks above and review the intended output before publishing. For an incremental release, the existing publisher supports additive mode:

```bash
pnpm exec gh-pages --dist dist --add --nojekyll --message "Update website"
```

Additive publication retains prior assets needed by already-open pages. Remove obsolete documents deliberately, and review the complete resulting file set. After the Pages build succeeds, verify the changed documents, assets, routes and HTTP status codes on the live site.

`pnpm run deploy` remains a build-and-publish helper using the publisher's defaults. It does not perform the full checks or additive retention shown above. Firestore rules and Firebase Functions are separate deployments.

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
