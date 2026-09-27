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

Verification results and exact preview commands will be recorded here when the implementation passes its checks.
