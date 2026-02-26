# Element Tracker Implementation Plan — Phase 6

**Goal:** Custom SVG donut chart showing overall in-element ratio with counts

**Architecture:** Pure SVG donut chart rendered inline — two arc paths (green for "in element", amber for "not") with centered text showing percentage and counts. No external library needed. Computed from the entries Map.

**Tech Stack:** React 18, inline SVG

**Scope:** Phase 6 of 7 from original design

**Codebase verified:** 2026-02-25

---

## Acceptance Criteria Coverage

### element-tracker.AC5: Pie chart
- **element-tracker.AC5.1 Success:** Pie chart shows correct ratio and day counts
- **element-tracker.AC5.2 Success:** Pie chart updates in real-time when entries change

---

<!-- START_TASK_1 -->
### Task 1: Build SVG donut chart component

**Verifies:** element-tracker.AC5.1, element-tracker.AC5.2

**Files:**
- Modify: `src/components/Progress/Progress.tsx`
- Modify: `src/components/Progress/Progress.css`

**Implementation:**

Create a donut chart section between the daily logger and the heatmap calendar.

The chart is a pure SVG element with:
- A circle (the donut ring) drawn using two `<circle>` elements with `stroke-dasharray` and `stroke-dashoffset` to create proportional arcs
- Or use SVG `<path>` with arc commands for more precise control

**Approach using stroke-dasharray (simpler, recommended first attempt — if precision issues arise, fall back to SVG `<path>` with arc commands `A rx ry rotation large-arc-flag sweep-flag x y`):**

```tsx
// Given: inCount (entries where inElement=true), totalCount (all entries)
const radius = 60;
const circumference = 2 * Math.PI * radius;
const inPercent = totalCount > 0 ? inCount / totalCount : 0;
const notPercent = 1 - inPercent;

// The "in element" arc covers inPercent of the circumference
// The "not in element" arc covers notPercent
```

Render an SVG with viewBox centered, two overlapping circles:
1. Background circle: full circumference, amber color (`#e17055`)
2. Foreground circle: `stroke-dasharray` = `${inPercent * circumference} ${circumference}`, green color (`#2ecc71`), rotated -90deg to start from top

Center text inside the SVG:
- Large: `${Math.round(inPercent * 100)}%`
- Small: `${inCount} of ${totalCount} days`

If no entries exist yet, show a placeholder message instead of an empty chart.

**Real-time updates (AC5.2):** The chart values are computed from the entries Map, which updates via `onSnapshot`. React re-renders the chart when entries change. No additional work needed.

**CSS additions:**
- `.progress-chart-section` — flex container centering the chart, padding
- `.progress-donut` — SVG styling, transition on stroke-dashoffset for smooth updates
- `.progress-chart-label` — styling for the centered text
- `.progress-chart-legend` — small legend below showing "In My Element" and "Not" with color dots

**Verification:**
1. Run: `npm run build` — succeeds
2. Run: `npm run dev`
3. See donut chart on /progress page
4. Chart shows correct percentage and counts
5. Add a new entry → chart updates without page refresh
6. Edit an entry (change in→not) → chart ratio updates

**Commit:**
```bash
git add src/components/Progress/Progress.tsx src/components/Progress/Progress.css
git commit -m "feat: add SVG donut chart showing element ratio"
```
<!-- END_TASK_1 -->
