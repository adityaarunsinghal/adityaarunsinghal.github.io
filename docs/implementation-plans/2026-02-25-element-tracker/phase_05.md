# Element Tracker Implementation Plan — Phase 5

**Goal:** Year-view heatmap calendar showing all entries, clickable for editing any date

**Architecture:** Use `react-activity-calendar` (v3.1.1) — chosen over `react-calendar-heatmap` for built-in TypeScript support, dark mode theme, and active maintenance. Calendar displays full year of entries with green/amber/gray color coding. Clicking a cell opens the inline editor (reusing the confirmation dialog from Phase 4 for past dates).

**Tech Stack:** react-activity-calendar v3.1.1, React 18

**Scope:** Phase 5 of 7 from original design

**Codebase verified:** 2026-02-25

**External dependency research:** react-activity-calendar v3.1.1 — built-in TypeScript, theme prop for dark mode, renderBlock for click handling, data format requires {date, count, level} objects.

---

## Acceptance Criteria Coverage

### element-tracker.AC4: Heatmap calendar
- **element-tracker.AC4.1 Success:** Heatmap renders full year with correct colors (green = in element, amber = not, gray = unlogged)
- **element-tracker.AC4.2 Success:** Clicking any cell opens inline editor for that date
- **element-tracker.AC4.3 Success:** Heatmap updates in real-time when entries change

---

<!-- START_TASK_1 -->
### Task 1: Install react-activity-calendar

**Verifies:** None (infrastructure)

**Files:**
- Modify: `package.json` (via npm install)

**Step 1: Install the dependency**

```bash
npm install react-activity-calendar
```

This adds `react-activity-calendar` (with built-in TypeScript types). Its peer deps (`@floating-ui/react` and `date-fns`) are auto-installed by npm v7+ (this project uses npm 10+). If using an older npm version, install them manually: `npm install @floating-ui/react date-fns`.

**Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

**Commit:**
```bash
git add package.json package-lock.json
git commit -m "chore: add react-activity-calendar dependency"
```
<!-- END_TASK_1 -->

<!-- START_TASK_2 -->
### Task 2: Integrate heatmap calendar into Progress component

**Verifies:** element-tracker.AC4.1, element-tracker.AC4.2, element-tracker.AC4.3

**Files:**
- Modify: `src/components/Progress/Progress.tsx`
- Modify: `src/components/Progress/Progress.css`

**Implementation:**

Import `ActivityCalendar` from `react-activity-calendar`.

Transform the entries Map into the `ActivityData[]` format required by the library:

```tsx
// Map entries to ActivityCalendar data format
// For every day from Jan 1 to today:
// - If entry exists and inElement: { date, count: 1, level: 4 } (green)
// - If entry exists and !inElement: { date, count: 1, level: 2 } (amber)
// - If no entry: { date, count: 0, level: 0 } (gray/empty)
```

The library requires data for every day in the range (gaps cause rendering issues). Generate a complete array from Jan 1 of the current year to today.

**Theme configuration** for dark background:
```tsx
const heatmapTheme = {
  dark: ['#2d3436', '#e17055', '#e17055', '#2ecc71', '#2ecc71'],
  // level 0: gray (unlogged)
  // level 1-2: amber (not in element)
  // level 3-4: green (in element)
};
```

Note: Since we only have binary data (not graduated levels), we use level 2 for "not in element" and level 4 for "in element" to get distinct colors from the theme array.

**Click handling** via `renderBlock`:
```tsx
renderBlock={(block, activity) => (
  <MemoTooltip key={activity.date}>
    {React.cloneElement(block, {
      onClick: () => handleDateClick(activity.date),
      style: { ...block.props.style, cursor: 'pointer' },
    })}
  </MemoTooltip>
)}
```

The `handleDateClick` function should:
- If clicking today's date: scroll to / focus the today logger
- If clicking any other date: open the inline editor for that date (set an `editingDate` state)
- The inline editor reuses the two-button + reason form from Phase 3
- Saving triggers the confirmation dialog from Phase 4 (since it's a past date)

**Inline editor placement:** Below the heatmap, showing the selected date prominently (e.g., "February 12, 2026"). Pre-fill with existing entry values if editing.

**CSS additions:**
- `.progress-heatmap-section` — section wrapper with padding, responsive overflow-x: auto for mobile
- Override calendar styles to match the dark theme (text colors for month/day labels)
- `.progress-inline-editor` — the date-editing form below the heatmap, slide-in animation

**Real-time updates (AC4.3):** The heatmap data is derived from the entries Map, which is already updated in real-time by the `onSnapshot` listener from Phase 3. When entries change, React re-renders the heatmap with updated data. No additional work needed.

**Verification:**
1. Run: `npm run build` — succeeds
2. Run: `npm run dev`
3. See heatmap calendar on the /progress page
4. Green cells for "in element" days, amber for "not", gray for unlogged
5. Click an empty cell → inline editor opens for that date
6. Click a filled cell → inline editor opens pre-filled with current values
7. Submit a past entry → confirmation dialog → entry saved → heatmap cell updates in real-time

**Commit:**
```bash
git add src/components/Progress/Progress.tsx src/components/Progress/Progress.css
git commit -m "feat: add year-view heatmap calendar with click-to-edit"
```
<!-- END_TASK_2 -->
