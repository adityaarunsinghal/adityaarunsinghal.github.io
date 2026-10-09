## Workshop pages

- `pages.ts` owns course facts, state, resource availability, destinations, and metadata.
- The current course and archive render as standalone HTML through `render.tsx`. Keep these components free of authentication, browser-only imports, and router context.
- Use native links and disclosures. A workshop page does not need a client application bundle.
- Keep 2026 resources Coming Soon until actual public destinations are supplied.
- Preserve the 2025 body and original CSV. Archive navigation and accessible presentation can evolve independently.
- No glowing dots or decorative animation in the workshop design.
- Use Source Serif 4 Display for the main heading and Subhead for section headings, with regular weight and relaxed spacing. Keep the newspaper's Georgia treatment.
- Avoid decorative rhetorical triples and repeated slogan fragments. Preserve actual curriculum lists, dates, and resource names.
- CSS must remain scoped to the relevant year. The document reset is only for standalone workshop HTML.
- Both years share the newspaper favicon in `public/workshops/workshop-favicon.svg`, linked by `render.tsx`. Edit the SVG source directly.
- Run `pnpm lint`, `pnpm build`, and `pnpm check:workshop`. Verify physical directory serving as well as Vite development.
- Publication requires approval. The broad deployment workflow also changes backend services.
- Instructor biographies, LinkedIn destinations and portrait paths are in `pages.ts`. Preserve supplied biography wording when moving it into structured data.
- Retain supplied portrait media in `scripts/assets/workshop-instructors/`. `scripts/workshop-instructor-portraits.mjs` generates GIFs and JPEG stills for the workshop build and development server; FFmpeg must be installed. Generated portrait assets remain uncommitted.
- Portraits initially render as still images. The independent wave enhancement respects reduced-motion preferences and exposes keyboard-accessible pause/play controls.
- The current dependency lockfile uses pnpm 10 overrides from `package.json`. When a newer global pnpm rejects them, use `COREPACK_ENABLE_AUTO_PIN=0 corepack pnpm@10.32.1` for the existing frozen install, lint, build and workshop checks.
- For a course-only release, stage the changed course document and its required assets, then publish that directory with the existing additive Pages publisher. Compare all prior Pages files by content hash and verify the live document and actual rendering.
