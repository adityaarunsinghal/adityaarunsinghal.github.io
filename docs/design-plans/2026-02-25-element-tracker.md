# Element Tracker Design

## Summary

**In My Element** is a private daily journaling tool that tracks whether the user felt "in their element" each day. The core interaction is a simple binary choice ("In My Element" / "Not In My Element") with a required reason field, optimized for quick daily logging. Data is stored directly in Firestore and visualized through two on-page charts: a GitHub-style heatmap calendar showing the full year's entries (green for "in", amber for "not", gray for unlogged) and a pie chart displaying the overall ratio. The page lives at `/progress` behind the existing email whitelist authentication pattern.

The implementation is entirely client-side with no Cloud Functions — React components talk directly to Firestore using real-time listeners for live updates. The design prioritizes frictionless daily ritual (today's entry saves immediately without confirmation) while protecting historical data (past entries require confirmation before saving). The heatmap calendar doubles as both visualization and editing interface, with cells clickable to edit any date. The design follows existing codebase patterns (private routes, Firestore listeners, component-scoped CSS) while critically evaluating them for improvements, and adds one new dependency: a lightweight heatmap visualization library.

## Definition of Done

1. `/progress` private web route with binary daily logger ("In My Element" / "Not In My Element"), reason always required, all entries always editable, optimized for quickly logging today and yesterday
2. Backfill capability for Jan 1 2026 through today, with older entry editing available but secondary to the daily logging flow
3. Two on-page visuals: GitHub-style streak heatmap calendar + pie chart of overall ratio, rendered from live Firestore data
4. Firestore collection `element-tracker` with security rules matching existing email whitelist pattern
5. No Cloud Functions — everything client-side, talking directly to Firestore
6. Total cost: $0 — Spark plan compatible, no secrets in public repo code

**Out of scope (separate future design):** Android APK / lock screen widget

## Acceptance Criteria

### element-tracker.AC1: Private route access
- **element-tracker.AC1.1 Success:** Authenticated user with whitelisted email can access `/progress`
- **element-tracker.AC1.2 Failure:** Unauthenticated user visiting `/progress` is redirected to `/login`
- **element-tracker.AC1.3 Failure:** Authenticated user with non-whitelisted email cannot read/write entries

### element-tracker.AC2: Daily logging
- **element-tracker.AC2.1 Success:** User selects "In My Element", enters reason, submits — entry saved to Firestore with correct date, boolean, reason, and timestamp
- **element-tracker.AC2.2 Success:** User selects "Not In My Element", enters reason, submits — same behavior
- **element-tracker.AC2.3 Failure:** Submit is blocked if reason field is empty
- **element-tracker.AC2.4 Success:** Today's entry saves immediately without confirmation dialog

### element-tracker.AC3: Past entry editing with confirmation
- **element-tracker.AC3.1 Success:** Yesterday nudge appears when yesterday has no entry
- **element-tracker.AC3.2 Success:** Editing any past entry shows confirmation dialog before saving
- **element-tracker.AC3.3 Success:** Confirming saves the updated entry to Firestore
- **element-tracker.AC3.4 Success:** Cancelling confirmation discards changes, original entry unchanged

### element-tracker.AC4: Heatmap calendar
- **element-tracker.AC4.1 Success:** Heatmap renders full year with correct colors (green = in element, amber = not, gray = unlogged)
- **element-tracker.AC4.2 Success:** Clicking any cell opens inline editor for that date
- **element-tracker.AC4.3 Success:** Heatmap updates in real-time when entries change

### element-tracker.AC5: Pie chart
- **element-tracker.AC5.1 Success:** Pie chart shows correct ratio and day counts
- **element-tracker.AC5.2 Success:** Pie chart updates in real-time when entries change

### element-tracker.AC6: Cross-cutting
- **element-tracker.AC6.1 Success:** Page is usable on mobile (full-width stacked buttons, appropriate tap targets, portrait-optimized)
- **element-tracker.AC6.2 Failure:** Firestore permission-denied error shows user-friendly message
- **element-tracker.AC6.3 Success:** Failed save does not lose form data

### element-tracker.AC7: Delight & micro-interactions
- **element-tracker.AC7.1 Success:** Submitting an entry triggers a satisfying visual response (animation, color shift, or subtle celebration)
- **element-tracker.AC7.2 Success:** Streak milestones (e.g., 7 days, 30 days consecutive "in element") trigger a small celebration (confetti via existing canvas-confetti dependency or equivalent)
- **element-tracker.AC7.3 Success:** Heatmap filling up over time provides visible sense of progress — no empty "cold start" feeling after backfill
- **element-tracker.AC7.4 Success:** Smooth transitions throughout (slide-in editors, animated pie chart segments, hover/tap feedback on interactive elements)

## Glossary

- **Firestore**: Google's NoSQL cloud database, used in this codebase for storing user-generated content with real-time synchronization
- **onSnapshot**: Firestore's real-time listener API that pushes database updates to the client without polling
- **serverTimestamp()**: Firestore function that records the server's current time, ensuring consistent timestamps across time zones
- **setDoc**: Firestore write operation that creates or overwrites a document at a specified ID (used here because document IDs are dates)
- **PrivateRoute**: Custom React component in this codebase that wraps protected pages and redirects unauthenticated users to `/login`
- **Heatmap calendar**: Grid visualization showing activity over time using color intensity (popularized by GitHub's contribution graph)
- **react-calendar-heatmap**: Third-party React library for rendering GitHub-style heatmap calendars (~4KB gzipped)
- **react-activity-calendar**: Alternative lighter-weight heatmap library (v3.0), mentioned as a possible substitute
- **Spark plan**: Firebase's free tier, supporting limited Firestore operations at zero cost
- **canvas-confetti**: Existing animation library in the codebase for celebratory visual effects
- **Backfill**: Retroactively entering historical data (entries from January 1, 2026 to present)
- **SVG donut chart**: Circular chart rendered as Scalable Vector Graphics, showing proportional data as colored arc segments with a hollow center
- **useAuth hook**: Custom React hook in this codebase that provides authentication state and user information

## Architecture

Private authenticated page at `/progress` for daily binary tracking ("In My Element" / "Not In My Element") with a required reason text field. Data stored in Firestore, rendered as a heatmap calendar and pie chart.

**Data model:** Firestore collection `element-tracker`. One document per day, document ID is `YYYY-MM-DD`. Fields: `inElement` (boolean), `reason` (string), `date` (string `YYYY-MM-DD`), `updatedAt` (serverTimestamp). Max ~365 docs/year.

**Component:** Single `Progress` component at `src/components/Progress/Progress.tsx` with co-located `Progress.css`. Registered in `src/router.tsx` wrapped in `PrivateRoute` + `ErrorBoundary`.

**Page layout (mobile-first, top to bottom):**

1. **Daily Logger** — Primary interaction zone. If today is unlogged: two full-width stacked buttons ("In My Element" / "Not In My Element"), tapping one reveals reason text field + submit. If today is logged: muted display of current entry with edit affordance. If yesterday is also unlogged: subtle nudge below with same two-button flow.
2. **Heatmap Calendar** — Full year view using react-calendar-heatmap (or react-activity-calendar as lighter alternative). Green cells = in element, amber cells = not, gray = unlogged. Clicking any cell opens inline editor for that date.
3. **Pie Chart** — Custom SVG donut showing ratio and counts (e.g., "41 of 56 days — 73% In My Element").

**Confirmation behavior:**
- Today's entry: saves immediately, no confirmation (daily ritual should be frictionless)
- Any past entry (including yesterday): confirmation dialog ("Save entry for [date]?") before writing to Firestore

**Real-time updates:** `onSnapshot` listener on the `element-tracker` collection. Entries stored in component state as `Map<string, Entry>` keyed by date string for O(1) lookup.

**Visual design:** Deep blue-to-teal gradient background (`#1a1a2e` → `#0f3460`). Green (`#2ecc71`) for "in element", muted amber (`#e17055`) for "not". White text on dark background with blur backdrop cards. Component-scoped CSS with slide-in animations.

## Existing Patterns

Investigation found these established patterns in the codebase that this design follows:

**Private route pattern** (`src/components/PrivateRoute.tsx`): Wraps component, redirects to `/login` if unauthenticated. Used by `/lovesingy` and `/translate`. This design adds `/progress` identically.

**Firestore real-time pattern** (`src/components/LovesIngy/LovesIngy.tsx`): Uses `onSnapshot` with `orderBy` query, maps snapshot docs to state, handles `permission-denied` errors explicitly, returns unsubscribe function in cleanup. This design follows the same pattern.

**Firestore write pattern** (`LovesIngy.tsx`): Uses `addDoc` with `serverTimestamp()`. This design uses `setDoc` instead (since document ID is the date), but same error handling approach.

**Component-scoped CSS** (all components): Each component has its own `.css` file with independent color palette, no shared design system. This design follows the same pattern with `Progress.css`.

**Native HTML date input** (`LovesIngy.tsx`, `GivesIngy.tsx`): Both use `<input type="date">` without custom calendar UI. This design does not need a date picker — the heatmap calendar serves as the date selection interface.

**Animation patterns** (`LovesIngy.css`): `slideIn` keyframe, `backdrop-filter: blur(10px)`, hover scale transforms. This design reuses similar animation patterns.

**Implementation guidance:** Existing patterns should be critically evaluated during implementation, not blindly copied. The codebase may contain suboptimal approaches that can be improved. Where better patterns are found, apply them — improvements that benefit the broader codebase are welcome, not just the new `/progress` route.

The only new addition is a third-party charting dependency (react-calendar-heatmap or react-activity-calendar), which is the first visualization library in the project.

## Implementation Phases

<!-- START_PHASE_1 -->
### Phase 1: Firestore Setup & Security Rules
**Goal:** Create the `element-tracker` collection and secure it with existing email whitelist pattern.

**Components:**
- `firestore.rules` — add `element-tracker` collection rules matching existing `love-ingy-messages` and `trmnl-config` pattern
- Manually create one test document in Firestore console to verify rules

**Dependencies:** None

**Done when:** Security rules deployed, authorized email can read/write `element-tracker` collection, unauthorized users are rejected.
<!-- END_PHASE_1 -->

<!-- START_PHASE_2 -->
### Phase 2: Route & Component Scaffold
**Goal:** Empty `/progress` page loads behind authentication.

**Components:**
- `src/components/Progress/Progress.tsx` — scaffold with `useAuth` hook, loading state, error boundary
- `src/components/Progress/Progress.css` — base styles (gradient background, layout)
- `src/router.tsx` — add `/progress` route wrapped in `PrivateRoute` + `ErrorBoundary`

**Dependencies:** Phase 1 (collection exists for real-time listener)

**Done when:** Navigating to `/progress` redirects to login if unauthenticated, shows empty styled page if authenticated. Covers `element-tracker.AC1.1`, `element-tracker.AC1.2`, `element-tracker.AC1.3`.
<!-- END_PHASE_2 -->

<!-- START_PHASE_3 -->
### Phase 3: Daily Logger — Today's Entry
**Goal:** Log today's "In My Element" / "Not In My Element" with reason. Core daily ritual.

**Components:**
- `src/components/Progress/Progress.tsx` — daily logger UI (two buttons, reason field, submit), Firestore `setDoc` write, `onSnapshot` listener for entries
- `src/components/Progress/Progress.css` — button styles, form styles, mobile-first layout

**Dependencies:** Phase 2 (component exists, route works)

**Done when:** Can select in/not, enter reason, submit. Entry appears in Firestore. Re-visiting page shows logged entry. Today's entry saves without confirmation. Covers `element-tracker.AC2.1`, `element-tracker.AC2.2`, `element-tracker.AC2.3`, `element-tracker.AC2.4`.
<!-- END_PHASE_3 -->

<!-- START_PHASE_4 -->
### Phase 4: Yesterday Nudge & Past Entry Editing
**Goal:** Prompt for yesterday if missed. Enable editing any past entry with confirmation.

**Components:**
- `src/components/Progress/Progress.tsx` — yesterday detection logic, inline editor for past dates, confirmation dialog, edit affordance on existing entries

**Dependencies:** Phase 3 (daily logger works)

**Done when:** Yesterday nudge appears when yesterday is unlogged. Editing any past entry requires confirmation. Existing entries can be edited. Covers `element-tracker.AC3.1`, `element-tracker.AC3.2`, `element-tracker.AC3.3`, `element-tracker.AC3.4`.
<!-- END_PHASE_4 -->

<!-- START_PHASE_5 -->
### Phase 5: Heatmap Calendar
**Goal:** Year-view heatmap showing all entries, clickable for editing.

**Components:**
- `react-calendar-heatmap` (or `react-activity-calendar`) — new npm dependency
- `src/components/Progress/Progress.tsx` — heatmap integration, cell click handler opening inline editor
- `src/components/Progress/Progress.css` — heatmap color overrides (green/amber/gray), responsive layout

**Dependencies:** Phase 4 (past entry editing works, so heatmap clicks can trigger it)

**Done when:** Heatmap renders full year, cells colored correctly by entry status, clicking a cell opens editor for that date (with confirmation for past dates). Covers `element-tracker.AC4.1`, `element-tracker.AC4.2`, `element-tracker.AC4.3`.
<!-- END_PHASE_5 -->

<!-- START_PHASE_6 -->
### Phase 6: Pie Chart
**Goal:** SVG donut chart showing overall in-element ratio.

**Components:**
- `src/components/Progress/Progress.tsx` — custom SVG donut component, computed from entries map
- `src/components/Progress/Progress.css` — pie chart styling

**Dependencies:** Phase 3 (entries data available from onSnapshot)

**Done when:** Pie chart renders with correct ratio and counts, updates in real-time as entries change. Covers `element-tracker.AC5.1`, `element-tracker.AC5.2`.
<!-- END_PHASE_6 -->

<!-- START_PHASE_7 -->
### Phase 7: Backfill & Polish
**Goal:** Backfill Jan 1–today data. Mobile UX polish and error handling.

**Components:**
- `src/components/Progress/Progress.tsx` — error handling (permission-denied, network), loading states, responsive refinements
- `src/components/Progress/Progress.css` — animations (slideIn, hover states), mobile tap target sizing
- Manual data entry for ~56 days of backfill via the heatmap interface

**Dependencies:** Phases 5, 6 (all UI complete)

**Done when:** All Jan 1–today entries backfilled. Page works well on mobile. Errors handled gracefully. Covers `element-tracker.AC6.1`, `element-tracker.AC6.2`, `element-tracker.AC6.3`.
<!-- END_PHASE_7 -->

## Additional Considerations

**No delete functionality.** Entries are always edited, never deleted. This matches the journaling discipline — every day gets a recorded value.

**Bundle impact.** react-calendar-heatmap adds ~4KB gzipped. This is the first visualization dependency in the project. If react-activity-calendar (v3.0) proves lighter at implementation time, it can be substituted — both have compatible APIs for this use case.

**Backfill is manual.** The ~56 days of historical data are entered through the normal heatmap-click editing flow, one day at a time. No bulk import mechanism. This is acceptable for a one-time 56-entry task and avoids building throwaway infrastructure.
