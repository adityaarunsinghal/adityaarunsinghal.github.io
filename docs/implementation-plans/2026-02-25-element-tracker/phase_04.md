# Element Tracker Implementation Plan — Phase 4

**Goal:** Yesterday nudge when yesterday is unlogged, and past entry editing with confirmation dialog

**Architecture:** Reuse the daily logger form for past dates. Add a confirmation dialog component (simple modal overlay) that gates all past-date saves. Yesterday detection is a simple date comparison against the entries Map.

**Tech Stack:** React 18, Firebase Firestore

**Scope:** Phase 4 of 7 from original design

**Codebase verified:** 2026-02-25

---

## Acceptance Criteria Coverage

### element-tracker.AC3: Past entry editing with confirmation
- **element-tracker.AC3.1 Success:** Yesterday nudge appears when yesterday has no entry
- **element-tracker.AC3.2 Success:** Editing any past entry shows confirmation dialog before saving
- **element-tracker.AC3.3 Success:** Confirming saves the updated entry to Firestore
- **element-tracker.AC3.4 Success:** Cancelling confirmation discards changes, original entry unchanged

---

<!-- START_TASK_1 -->
### Task 1: Add yesterday nudge section

**Verifies:** element-tracker.AC3.1

**Files:**
- Modify: `src/components/Progress/Progress.tsx`
- Modify: `src/components/Progress/Progress.css`

**Implementation:**

Below the today section, add a "yesterday nudge" that appears only when:
- Yesterday's date has no entry in the entries Map
- Today's entry exists (don't show both today prompt and yesterday nudge simultaneously — today takes priority if both are unlogged)

Show a subtle card: "Yesterday is missing" with the same two-button + reason form as today, but labeled with yesterday's date (e.g., "February 24, 2026").

Use the same `getLocalDateString` helper, passing `new Date(Date.now() - 86400000)` for yesterday's date.

**CSS:** Style the yesterday nudge slightly more muted than today's section — lower opacity or smaller heading. Use a `.progress-nudge` class.

**Verification:**
1. Run: `npm run dev`
2. Log today's entry if not already logged
3. Ensure yesterday has no entry → "Yesterday is missing" nudge appears
4. If yesterday is logged → nudge does not appear

**Commit:**
```bash
git add src/components/Progress/Progress.tsx src/components/Progress/Progress.css
git commit -m "feat: add yesterday nudge when yesterday entry is missing"
```
<!-- END_TASK_1 -->

<!-- START_TASK_2 -->
### Task 2: Add confirmation dialog for past entries

**Verifies:** element-tracker.AC3.2, element-tracker.AC3.3, element-tracker.AC3.4

**Files:**
- Modify: `src/components/Progress/Progress.tsx`
- Modify: `src/components/Progress/Progress.css`

**Implementation:**

Create a simple confirmation dialog that appears as a modal overlay when saving any past entry (any date that is not today).

The dialog should:
- Show the date being saved formatted nicely (e.g., "Save entry for February 24, 2026?")
- Have two buttons: "Confirm" and "Cancel"
- On Confirm: call `setDoc` to Firestore, close dialog
- On Cancel: close dialog, discard pending changes (AC3.4)
- Backdrop click also cancels

State management: Add `pendingSave` state that holds `{ date, inElement, reason }` when a past entry form is submitted. When `pendingSave` is set, show the dialog. Confirm triggers the actual Firestore write. Cancel clears `pendingSave`.

Modify the yesterday nudge form's submit handler to set `pendingSave` instead of saving directly.

Also add an "Edit" affordance to yesterday's logged entry (same as today's edit).

**CSS additions:**
- `.progress-confirm-overlay` — fixed position, full screen, dark semi-transparent backdrop, z-index above content
- `.progress-confirm-dialog` — centered card, white/dark background, rounded corners, padding
- `.progress-confirm-actions` — flex row with gap for Confirm/Cancel buttons
- Slide-in animation for the dialog appearance

**Verification:**
1. Run: `npm run dev`
2. Submit a yesterday entry → confirmation dialog appears
3. Click "Cancel" → dialog closes, no entry saved in Firestore
4. Submit again → click "Confirm" → entry saved in Firestore
5. Edit yesterday's entry → confirmation dialog appears again

**Commit:**
```bash
git add src/components/Progress/Progress.tsx src/components/Progress/Progress.css
git commit -m "feat: add confirmation dialog for past entry saves"
```
<!-- END_TASK_2 -->
