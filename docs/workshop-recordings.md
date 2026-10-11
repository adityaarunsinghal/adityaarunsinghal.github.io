## Workshop recordings

Recording facts live in `src/workshop/pages.ts`: `historicalRecordings` supplies
the three 2025 sessions, and `sessionRecordings` supplies the 2026 course.
The shared viewer renders complete HTML and uses
`public/workshops/session-recordings.js` for chapter search, in-place seeking
and links to a playback moment. Native chapter links open the corresponding
YouTube timestamp when the player enhancement is unavailable.

The 2025 viewer uses the archive's dark colors and sans-serif headings. The
2026 viewer uses the course's warm paper, Source Serif Subhead headings, teal
links and violet session labels. Shared layout and behavior stay scoped to
the two workshop years.

The 2025 chapters preserve the supplied YouTube descriptions' titles and times,
sorted chronologically. Dates follow the archived course schedule. Chapter
times are description metadata, not a fresh transcript alignment.

The 2026 Session 1 entry has 43 chapters on the original
2:02:32.321 timeline. Leave `youtubeId: null` until the actual video is supplied.
Set `youtubeId` to its 11-character video ID and rebuild. Its
embed, chapter list, YouTube button, hero link and schedule link then appear
together. An explicitly authorized upload can be deployed while YouTube is
still uploading or processing; playback becomes available when YouTube finishes
and the video's visibility permits it. If the final edit trims time or adds an
introduction, update the
chapter starts and duration to match the uploaded video before publication.

Add further sessions or parts as recording entries with unique IDs, the
recording date, duration and chronologically ordered chapter starts. The
`searchPlaceholder` should suggest terms that occur in that episode's chapter
titles. Each existing episode has its own examples. The
renderer rejects malformed IDs, duplicate recording IDs, invalid dates and
chapter starts outside the recording.

```sh
pnpm lint
pnpm build
pnpm check:workshop
uv run scripts/check-workshop-recordings.py --base-url http://127.0.0.1:4174
```

Use a physical server over `dist` for the recording browser check. The normal
check uses a local player fixture to exercise seeking, sharing, filtering,
multiple players, and blocked playback without depending on YouTube. Pass
`--live` for a separate real YouTube playback check. Vite development uses the
same renderer and shared recording stylesheet.

The local check also renders the 2026 player with a practice video in an
isolated browser fixture. It checks all 43 chapters, the Source Serif headings,
search examples and responsive accessibility without enabling a practice video
on the published 2026 page. Shared links retain their timestamp while the
player is cued, and the copy control appears once playback position is available.

For an archive-only release, stage the 2025 document, its content-hashed
stylesheet and `workshops/session-recordings.js`. Publish that directory using
the existing additive Pages publisher, then compare all previous Pages files
by hash and verify the live page and video controls.

For both years, include the current course document and its content-hashed
stylesheet as well. Keep an upload marked Coming Soon until its actual
video is supplied or the user authorizes its processing URL. Retain all
previously published assets.

## Public source hygiene

Commit the viewer, recording metadata, checks and this guide. Keep local editor
captures, transcript study files, browser reports, working logs and release
scratch in ignored storage. Python caches are ignored as well.

Run `pnpm check:public` after staging the intended source and building. It
checks tracked source and generated Pages artifacts for private paths, working
logs and known credential fingerprints. Check the default-branch trees of the
public website and both public workshop repositories for working logs after
pushing. The separate personal workshop repository must remain private.

## Published October 11, 2026

Viewer source: `e319184a8efba02e6f6de129e6a183c29fa8d97c`.
Pages release: `95285a30374f3cb7cc541baf267005e76e8a4d6c`.
GitHub Pages deployment `38101251893` completed successfully.

The 2025 archive publishes three recordings and 113 chapters with distinct
episode search examples. The approved 2026 paper and serif design is published
with Session 1 marked Coming Soon. Its 43 chapters are ready for the final
YouTube ID. No practice video is included on the published 2026 page.

Lint, build, static workshop checks, public-artifact checks and recording
browser checks passed. Both year styles match between development and
production. Recording layouts pass accessibility checks at 1440, 768, 390 and
320 pixels. The live site played all three 2025 videos after chapter seeks to
38:00, 52:30 and 53:00. The published documents and required assets match the
candidate hashes.

The additive release retains 116 other previously published files by content
hash. The existing archive course content is preserved. The website and both
public workshop repositories' current default-branch trees were checked for
working logs and are clean; the personal workshop repository remains private.

## Session 1 upload connected October 11, 2026

The 2026 Session 1 viewer uses YouTube ID `UtjOl-LPcCk`. Publication was authorized
while the upload was still processing. YouTube exposed the correct title and
description, permitted embedding and reported that processing was in progress.
All 43 chapter titles and times match the video's supplied description.

The viewer, chapter search, YouTube button and course navigation are enabled.
Share `/agentic-ai-workshop/#recordings` for the recording section, or
`/agentic-ai-workshop/#session-1-recording` for Session 1. Timestamp links use
`?recording=session-1-recording&t=SECONDS#session-1-recording`.

The browser check verified the supplied video ID, chapter search, a seek to
56:31, the YouTube timestamp link, mobile reflow and accessibility using the
local player fixture. Real video playback remains subject to YouTube finishing
processing and making the video viewable. A visibility or processing change on
YouTube requires no website redeployment; refresh a player opened during processing.
