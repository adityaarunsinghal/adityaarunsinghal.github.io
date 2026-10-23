## Workshop heading fonts

Source Serif 4 Display Regular is used for the main heading; Subhead Regular is used for section headings. The original font files are self-hosted. Their SIL Open Font License is retained in `LICENSE.md`.

Retrieved September 27, 2026 from Adobe’s source repository.

- `SourceSerif4Display-Regular.woff2`: https://github.com/adobe-fonts/source-serif/blob/80d3f8894c09c937bebfa9011247d2e1c79fd6f4/WOFF2/TTF/SourceSerif4Display-Regular.ttf.woff2
  - SHA-256: `c75301c83bef55b3787f3060c2f62cb5d902a6706419149b7ff9d0c7927055ac`
- `SourceSerif4Subhead-Regular.woff2`: https://github.com/adobe-fonts/source-serif/blob/80d3f8894c09c937bebfa9011247d2e1c79fd6f4/WOFF2/TTF/SourceSerif4Subhead-Regular.ttf.woff2
  - SHA-256: `5a70b3ca75f18a0655a16f70c78918cc851ee4bf1bd599a32cd9db7a7052981f`
- `LICENSE.md`: https://github.com/adobe-fonts/source-serif/blob/80d3f8894c09c937bebfa9011247d2e1c79fd6f4/LICENSE.md
  - SHA-256: `c21d7293d87b6d7ab1d0229a2f55b77f33a7613a6a4e66f6693d68d7d8d09464`

### Critical title subset — October 23, 2026

`WorkshopTitle-2026.woff2` contains the glyphs used by “Build an agent you can explain.” It is a 2,372-byte subset of the Display file above, generated with FontTools 4.62.0 and Brotli 1.2.0 without changing the glyph outlines. Its internal family is renamed to `Workshop Title` because the original font reserves the name “Source.” The same SIL Open Font License applies.

- SHA-256: `938250dab9c2cb3cde60795babf1fa11823d33ecbfa358b41df5e2719cee8ce8`
- Only the 2026 hero title uses this preloaded subset. The original Display face remains its fallback for additional characters and continues to serve other main headings.
