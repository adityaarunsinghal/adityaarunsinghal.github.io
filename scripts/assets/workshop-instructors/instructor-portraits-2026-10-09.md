## Instructor portraits

Adi supplied `adi-wave-2026-10-09.gif` as his portrait and
`luca-wave-2026-10-09.mp4` as Luca Chang's portrait.

`scripts/workshop-instructor-portraits.mjs` preserves Adi's GIF and converts
Luca's complete clip to a GIF with a shared palette at 640 pixels wide and
15 frames per second. Both portraits have a JPEG still for paused playback,
reduced-motion preferences and access without JavaScript.

The workshop build generates the published assets into
`dist/workshops/2026/instructors/`. Generated assets remain uncommitted.
`pnpm dev` generates the same assets under the ignored
`public/workshops/2026/instructors/` directory before starting Vite.

Install FFmpeg through the operating system's package manager. Use the
repository's pnpm 10 dependency set:

```bash
node scripts/workshop-instructor-portraits.mjs
COREPACK_ENABLE_AUTO_PIN=0 corepack pnpm@10.32.1 install --frozen-lockfile
COREPACK_ENABLE_AUTO_PIN=0 corepack pnpm@10.32.1 build
```
