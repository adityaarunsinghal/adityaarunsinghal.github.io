# Element Tracker Implementation Plan — Phase 7

**Goal:** Error handling, mobile polish, animations, delight features (confetti for streaks), and backfill

**Architecture:** Add error handling for Firestore permission-denied errors, loading states, CSS animations (slideIn for editors, smooth transitions), mobile responsiveness refinements, and streak detection with canvas-confetti celebrations. Backfill is manual data entry via the heatmap interface.

**Tech Stack:** React 18, canvas-confetti (v1.9.3, already installed), CSS animations

**Scope:** Phase 7 of 7 from original design

**Codebase verified:** 2026-02-25

**External dependency research:** canvas-confetti v1.9.3 already installed and used in LovesIngy.tsx for heart shower celebrations. API: `confetti({ particleCount, spread, origin, shapes, colors })`.

---

## Acceptance Criteria Coverage

### element-tracker.AC6: Cross-cutting
- **element-tracker.AC6.1 Success:** Page is usable on mobile (full-width stacked buttons, appropriate tap targets, portrait-optimized)
- **element-tracker.AC6.2 Failure:** Firestore permission-denied error shows user-friendly message
- **element-tracker.AC6.3 Success:** Failed save does not lose form data

### element-tracker.AC7: Delight & micro-interactions
- **element-tracker.AC7.1 Success:** Submitting an entry triggers a satisfying visual response (animation, color shift, or subtle celebration)
- **element-tracker.AC7.2 Success:** Streak milestones (e.g., 7 days, 30 days consecutive "in element") trigger a small celebration (confetti via existing canvas-confetti dependency or equivalent)
- **element-tracker.AC7.3 Success:** Heatmap filling up over time provides visible sense of progress — no empty "cold start" feeling after backfill
- **element-tracker.AC7.4 Success:** Smooth transitions throughout (slide-in editors, animated pie chart segments, hover/tap feedback on interactive elements)

---

<!-- START_TASK_1 -->
### Task 1: Error handling and loading states

**Verifies:** element-tracker.AC6.2, element-tracker.AC6.3

**Files:**
- Modify: `src/components/Progress/Progress.tsx`
- Modify: `src/components/Progress/Progress.css`

**Implementation:**

**Error handling (AC6.2):**
- In the `onSnapshot` error callback, check for `error.code === 'permission-denied'` and show a friendly message: "Access denied. You do not have permission to view this page."
- For generic errors: "Something went wrong. Please refresh."
- Display errors in a styled error banner at the top of the page

**Failed save protection (AC6.3):**
- When `setDoc` fails, catch the error and display it inline near the form
- Do NOT clear the form fields on error — preserve the user's input
- Show a "Try again" option that re-attempts the save with the preserved data
- Add a `saving` loading state that disables the submit button and shows a spinner during save

**Loading state:**
- While `onSnapshot` is initializing (first load), show the Loading component
- Add a `loaded` boolean state, set to true after first snapshot callback

**CSS:**
- `.progress-error` — error banner styling (red/warning background, readable on dark theme)
- `.progress-saving` — spinner/disabled state for submit button

**Verification:**
1. Run: `npm run dev`
2. Disconnect network → submit an entry → error message appears, form data preserved
3. Reconnect → retry → entry saves

**Commit:**
```bash
git add src/components/Progress/Progress.tsx src/components/Progress/Progress.css
git commit -m "feat: add error handling and loading states"
```
<!-- END_TASK_1 -->

<!-- START_TASK_2 -->
### Task 2: Mobile responsiveness polish

**Verifies:** element-tracker.AC6.1

**Files:**
- Modify: `src/components/Progress/Progress.css`

**Implementation:**

Ensure all interactive elements work well on mobile:

- Choice buttons: min-height 56px (Material Design touch target), full-width, large text
- Reason textarea: min-height 100px, large enough to tap and type easily
- Submit button: full-width on mobile, min-height 48px
- Confirmation dialog: nearly full-width on mobile (max 90vw), large tap targets for Confirm/Cancel
- Heatmap calendar: horizontal scroll for full year view on narrow screens (overflow-x: auto)
- Donut chart: max-width constraint to not overwhelm on large screens, centered
- Edit buttons: min tap target 44x44px

Add media query for narrow screens:
```css
@media (max-width: 480px) {
  .progress-container {
    padding: 1rem 0.75rem;
    padding-top: 2rem;
  }
  /* Additional mobile refinements */
}
```

**Verification:**
1. Run: `npm run dev`
2. Open Chrome DevTools → toggle device toolbar → iPhone SE (375px)
3. All buttons are tappable (no tiny targets)
4. Heatmap scrolls horizontally if needed
5. Confirmation dialog is usable
6. No horizontal overflow on the main page

**Commit:**
```bash
git add src/components/Progress/Progress.css
git commit -m "feat: mobile responsiveness polish for /progress"
```
<!-- END_TASK_2 -->

<!-- START_TASK_3 -->
### Task 3: Animations and micro-interactions

**Verifies:** element-tracker.AC7.1, element-tracker.AC7.4

**Files:**
- Modify: `src/components/Progress/Progress.tsx`
- Modify: `src/components/Progress/Progress.css`

**Implementation:**

**Submit celebration (AC7.1):**
- After successful save, briefly flash the entry card green (or amber) with a scale-up animation
- Add a CSS class `.progress-entry-saved` that plays a brief pulse animation:
```css
@keyframes savedPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); box-shadow: 0 0 20px rgba(46, 204, 113, 0.4); }
  100% { transform: scale(1); }
}
```
- Apply for 0.6s after save, then remove

**Smooth transitions (AC7.4):**
- Inline editor slide-in: use `slideIn` keyframe (similar to LovesIngy pattern)
```css
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
```
- Confirmation dialog: fade-in backdrop + slide-up dialog
- Button hover/tap: `transform: scale(1.02)` with `transition: all 0.2s ease`
- Donut chart: `transition: stroke-dashoffset 0.8s ease` for smooth ratio changes
- Entry cards: subtle hover lift `transform: translateY(-2px)` with shadow

**Verification:**
1. Run: `npm run dev`
2. Submit an entry → see brief pulse animation on the saved entry
3. Click a heatmap cell → inline editor slides in smoothly
4. Hover buttons → subtle scale effect
5. Change an entry → donut chart animates smoothly to new ratio

**Commit:**
```bash
git add src/components/Progress/Progress.tsx src/components/Progress/Progress.css
git commit -m "feat: add animations and micro-interactions for delight"
```
<!-- END_TASK_3 -->

<!-- START_TASK_4 -->
### Task 4: Streak detection and confetti celebrations

**Verifies:** element-tracker.AC7.2, element-tracker.AC7.3

**Files:**
- Modify: `src/components/Progress/Progress.tsx`

**Implementation:**

**Streak calculation:**
- Compute current consecutive "in element" streak by walking backwards from today through the entries Map
- Count consecutive days where `inElement === true`
- Track streak milestones: 7, 14, 21, 30, 60, 90, 100, 365

**Confetti on milestones (AC7.2):**
- After a successful save, if the new entry makes the streak hit a milestone, fire confetti
- Use `canvas-confetti` (already installed, imported as `confetti` from `canvas-confetti`)
- Example from LovesIngy pattern:
```tsx
import confetti from 'canvas-confetti';

const celebrateStreak = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#2ecc71', '#27ae60', '#1abc9c', '#16a085'],
  });
};
```
- Only fire once per milestone hit (track `lastCelebratedStreak` in state or sessionStorage to avoid re-firing on page reload)

**Streak display:**
- Show current streak count near the title or below the donut chart: "🔥 12 day streak" (or similar, without emoji if not requested)
- Style to be visible but not dominant

**Progress feeling (AC7.3):**
- After backfill, the heatmap will be filled with colored cells, providing immediate visual progress
- The donut chart will show a meaningful ratio from day one
- This is inherently handled by backfill + the existing visualizations — no additional code needed beyond ensuring the UI looks good with data

**Verification:**
1. Run: `npm run dev`
2. Create entries for 7 consecutive days → confetti fires on the 7th
3. Streak counter shows correct number
4. On page refresh, confetti does not re-fire for already-celebrated milestones

**Commit:**
```bash
git add src/components/Progress/Progress.tsx
git commit -m "feat: add streak detection and confetti celebrations"
```
<!-- END_TASK_4 -->

<!-- START_TASK_5 -->
### Task 5: Backfill historical entries

**Verifies:** element-tracker.AC7.3 (visible progress after backfill)

**Files:** None (manual data entry)

**This is a manual step, not a code task.** After all previous tasks are complete:

1. Open `/progress` in the browser
2. Use the heatmap calendar to click on each day from January 1, 2026 through today
3. For each day, select "In My Element" or "Not In My Element" and enter the reason from your journal
4. Each past entry will require confirmation (via the confirmation dialog)
5. After backfill, the heatmap and donut chart should show a full, colorful picture of the year so far

**Estimated time:** ~56 entries at ~30 seconds each = ~30 minutes

**Verification:**
- Heatmap shows colored cells from Jan 1 through today — no large gray gaps
- Donut chart shows meaningful ratio
- Streak counter reflects actual streak data

**No commit needed** — this is data entry, not code change.
<!-- END_TASK_5 -->
