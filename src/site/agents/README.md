# Agent discoverability and ease of use

Everything that helps AI agents find, read and use adityasinghal.com starts here.
Run `pnpm check:agents` after any change.

## Source in this folder

| File | What it produces |
|---|---|
| `discovery.ts` | `/agents.md`, `/auth.md`, section reading maps, `/.well-known/ard.json`, `/schemamap.xml`, and Markdown twin paths |
| `agent-data.ts` | Public data API: `/openapi.json` and `/api/v1/*.json` |
| `ambipath.ts` | Canonical assistant configuration, the supplied head snippet, generated ownership proof and Poppy 1.0/0.4 manifests, the assistant ARD entry, and shared connection guidance |

Copy deployment values from the Ambipath console's installation payload.
The setup code must never enter source control. The `.well-known` documents are
generated from this module; do not add duplicate copies under `public/`.

## Hooks elsewhere

| Location | Role |
|---|---|
| `../render.ts` | Homepage head, reading map, machine documents, sitemap and schema feed |
| `../documents.ts` | Developer/privacy pages and their assistant snippet |
| `../home.html` | Homepage template; the assistant loader comes from the generated head |
| `/public/site-agent-tools.js` | Optional read-only WebMCP browser tools |
| `/public/robots.txt` | Sitemap and schema map pointers |
| `/scripts/build-site-pages.mjs` | Writes documents, Markdown twins and `.nojekyll` |
| `/scripts/check-agent-pages.mjs`, `check-agent-data.mjs`, `markdown.test.mjs`, `site-agent-tools.test.mjs` | Agent checks |

The widget appears once on the homepage, its `/static/` compatibility copy,
the developer guide and the privacy page. Workshops, shortcuts, private apps
and the 404 page do not load it.

Checks preserve the public data resources and guest API guidance, keep private
routes and the résumé out of discovery, require 2–5 representative queries per
ARD entry, and forbid unsupported `agent-card.json`, `agent.json` and
`oauth-protected-resource` files.

Deploy with dotfiles enabled so `.nojekyll` and `/.well-known/` are published.
