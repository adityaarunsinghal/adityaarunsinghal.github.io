## Workshop pages

- `pages.ts` owns course facts, state, resource availability, destinations, and metadata.
- The current course and archive render as standalone HTML through `render.tsx`. Keep these components free of authentication, browser-only imports, and router context.
- Use native links and disclosures. A workshop page does not need a client application bundle.
- Keep 2026 resources Coming Soon until actual public destinations are supplied.
- Preserve the 2025 body and original CSV. Archive navigation and accessible presentation can evolve independently.
- No glowing dots or decorative animation in the workshop design.
- CSS must remain scoped to the relevant year. The document reset is only for standalone workshop HTML.
- Run `pnpm lint`, `pnpm build`, and `pnpm check:workshop`. Verify physical directory serving as well as Vite development.
- Publication requires approval. The broad deployment workflow also changes backend services.
