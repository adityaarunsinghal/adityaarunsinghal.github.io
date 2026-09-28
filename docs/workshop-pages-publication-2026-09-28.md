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

### Published result

Pages commit: `8855b9e42173a06009a3bb5bc95989396bf00b67`.
GitHub's Pages build and deployment completed successfully in [run 36362000956](https://github.com/adityaarunsinghal/adityaarunsinghal.github.io/actions/runs/36362000956).

- Current course: `https://adityasinghal.com/agentic-ai-workshop/`.
- Archive: `https://adityasinghal.com/agentic-ai-workshop-2025/`.

**Confirmed live:** the published tree matches the reviewed candidate; previous assets remain available. Direct HTTP checks match the deployed bytes for the course documents, homepage, fonts, stylesheets, social cards, sitemap, and protected shared files. Both slashless workshop URLs normalize to their physical directories.

Actual desktop and mobile rendering shows the approved copy, Source Serif headings, and Coming Soon materials without horizontal overflow or script errors. The registration controls use the supplied 2026 form. Archive navigation and the year-specific feedback destination work. The homepage link escapes its iframe. A returning service-worker-controlled client receives the current page. Essential content and registration links remain available with JavaScript disabled.

**Not exercised:** form authentication/submission, authenticated private application features, real-device Safari/Firefox, screen-reader use, or social-platform cache refresh. No backend deployment, domain-setting change, inference call, or external message was performed.
