## Workshop pages

The current course lives at `/agentic-ai-workshop/`. Historical course content belongs at `/agentic-ai-workshop-2025/`.

### Content and compatibility

The 2026 page presents the October 8, 15, 22, and 29 course, registration, and Coming Soon materials. The archive retains the prior course's wording, dates, attribution, source quotations, public code, and highlights.

Both registration aliases use current-course information. Both feedback aliases explicitly identify the 2025 cohort and retain its form. The homepage workshop link opens the top-level document.

### Implementation

The existing SPA build remains the first build step. A separate React renderer then emits complete workshop HTML and content-hashed styles into the same distribution directory. Workshop pages use native anchors and disclosures and require no client application bundle.

The archive source checkpoint is `b349c17`. Its original component, stylesheet, and CSV remain recoverable from Git history.

### Release boundary

Local review precedes publication. A course release uses the static Pages path only. The general deployment workflow also deploys backend services and database rules.

### Local verification

Source implementation: `1a716ba`. Archive checkpoint: `c3d8d91`.

```bash
pnpm lint
pnpm build
pnpm check:workshop
pnpm preview --host 127.0.0.1 --port 4173 --strictPort
```

Current page: `http://127.0.0.1:4173/agentic-ai-workshop/`.
Archive: `http://127.0.0.1:4173/agentic-ai-workshop-2025/`.

The reproducible browser check and browser installation command are in the README. Its default evidence directory is ignored `temp/workshop-browser/`.

**Confirmed locally:** lint, both TypeScript configurations, production build, seven generated documents, initial metadata and local assets, four registration states, desktop/tablet/phone layouts, native keyboard controls, no-JavaScript access, doubled text sizes, homepage iframe escape, legacy case/query/fragment handling, signed-out private-route redirects, and returning service-worker behavior. The automated accessibility pass reports no violations; contrast candidates requiring manual inspection remain distinguished from a complete accessibility audit.

The archive retains its original course wording, dates, instructor attribution, CSV, highlights, code, and feedback destination. The generation credit was removed. Navigation and presentation changes make the historical content readable without animation.

Review fixes cover router matching tolerance, deterministic social-card fonts, and registration-state assertions. The fonts and license are bundled with their source provenance. Raster social cards and route HTML are generated outputs.

**Inferred:** GitHub Pages will normalize the new physical directory routes as it does existing directories. A plain local static server confirms the directory layout; the host's actual responses require publication.

**Not exercised:** deployment, live new-route behavior, Google sign-in or form submission, authenticated private-app features, screen-reader use, real-device Safari/Firefox, video playback, or external social-preview caches.

### Updating the course

Change course facts, registration state, and released resource links in `src/workshop/pages.ts`. Keep absent resource URLs null. Coordinate the October 5 cutoff with the form owner; rebuilding alone does not close the form or publish the new copy.

Regenerate and review the full distribution before any approved Pages release. The root SPA, service worker, CNAME, Firebase configuration, backend, and private application source retain their existing roles.

For rollback after a later publication, use the approved prior Pages artifact recorded at release time. `b349c17` is the source recovery checkpoint for the old workshop; it is not asserted to identify the currently deployed artifact. Restoring that source would return the base workshop URL to 2025, so a small approved 2026 content repair is preferable for isolated text or layout errors.
