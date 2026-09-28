## Workshop publication

Approved application source: `ef05c24`. The release publishes the reviewed 2026 workshop and the preserved 2025 archive through GitHub Pages.

### Release artifact

The previous Pages commit is `ea8d1b3151e30c38d7f81b991d13639e1def0d84`. Its root HTML matches the live site before publication. A complete archive and the reviewed candidate were retained for recovery.

Lint, production build, and workshop artifact checks passed. Existing changes outside content-hashed assets are limited to `index.html`, the homepage workshop link in `static/index.html`, and the generated bundle report. The service worker, CNAME, manifest, 404 handler, and original CSV match the previous release.

The approved source branch is integrated into `master` by fast-forward. Publication uses the installed static-site publisher:

```bash
pnpm exec gh-pages --dist dist --add --nojekyll --message "Publish 2026 workshop"
```

The additive option preserves previous files, including immutable assets needed by existing pages. The website's broader workflow also deploys backend services and database rules; this release uses the static publisher directly.

### Verification and recovery

After publication, check raw HTML and actual rendering at the current and archive routes, registration aliases, fonts, metadata assets, and homepage navigation. Compare the published tree against the candidate manifest and confirm prior files remain available.

The previous Pages tree can be recovered from the commit above. Restoring it with the additive publisher replaces its root HTML and original files while retaining the new archive directories. A complete rollback may also require a separately reviewed change to the new course directories. Recovery is an external publication and should use the approved incident scope.

Live verification results and the resulting Pages commit will be recorded here.
