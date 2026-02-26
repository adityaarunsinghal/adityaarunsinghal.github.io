# Element Tracker Implementation Plan — Phase 3

**Goal:** Daily logger for today's entry — select In/Not, enter reason, submit to Firestore, see current entry

**Architecture:** Add Firestore real-time listener (`onSnapshot`) and write (`setDoc`) to Progress component. Two-button selection reveals reason field. Entries keyed by `YYYY-MM-DD` date string as Firestore document ID. Today's entry saves immediately without confirmation.

**Tech Stack:** React 18, Firebase Firestore (`setDoc`, `onSnapshot`, `doc`, `collection`, `serverTimestamp`)

**Scope:** Phase 3 of 7 from original design

**Codebase verified:** 2026-02-25

---

## Acceptance Criteria Coverage

### element-tracker.AC2: Daily logging
- **element-tracker.AC2.1 Success:** User selects "In My Element", enters reason, submits — entry saved to Firestore with correct date, boolean, reason, and timestamp
- **element-tracker.AC2.2 Success:** User selects "Not In My Element", enters reason, submits — same behavior
- **element-tracker.AC2.3 Failure:** Submit is blocked if reason field is empty
- **element-tracker.AC2.4 Success:** Today's entry saves immediately without confirmation dialog

---

<!-- START_TASK_1 -->
### Task 1: Add Firestore real-time listener for entries

**Verifies:** Foundation for all AC2 criteria (data layer)

**Files:**
- Modify: `src/components/Progress/Progress.tsx`

**Implementation:**

Add Firestore imports and set up an `onSnapshot` listener on the `element-tracker` collection. Store entries in a `Map<string, Entry>` keyed by date string for O(1) lookup.

Define the Entry interface:
```tsx
interface Entry {
  id: string;        // document ID (YYYY-MM-DD)
  inElement: boolean;
  reason: string;
  date: string;       // YYYY-MM-DD
  updatedAt: Date | null;
}
```

In a `useEffect`, create an `onSnapshot` listener on `collection(db, 'element-tracker')`. Map each document to an `Entry` object and store in state as a `Map`. Handle `permission-denied` errors by setting an error state.

Import `db` from `@/firebase` — the `@/` alias is configured in `vite.config.ts` to resolve to `src/`. The file `src/firebase.ts` exports `{ auth, firebaseapp, db }`. Use: `import { db } from '@/firebase';`

The listener should return its unsubscribe function for cleanup.

**Verification:**
Run: `npm run build` — no TypeScript errors

**Commit:**
```bash
git add src/components/Progress/Progress.tsx
git commit -m "feat: add Firestore real-time listener for element-tracker entries"
```
<!-- END_TASK_1 -->

<!-- START_TASK_2 -->
### Task 2: Build today's daily logger UI

**Verifies:** element-tracker.AC2.1, element-tracker.AC2.2, element-tracker.AC2.3, element-tracker.AC2.4

**Files:**
- Modify: `src/components/Progress/Progress.tsx`
- Modify: `src/components/Progress/Progress.css`

**Implementation:**

Add a "Today" section to the Progress component:

**If today is NOT logged:**
- Show two full-width stacked buttons: "In My Element" and "Not In My Element"
- Tapping a button sets a `selectedChoice` state (true/false) and reveals a reason textarea + submit button
- Submit calls `setDoc(doc(db, 'element-tracker', todayDateString), { inElement, reason, date: todayDateString, updatedAt: serverTimestamp() })`
- Submit is disabled if reason is empty (AC2.3)
- No confirmation dialog for today (AC2.4) — save immediately on submit
- Show loading spinner during save, success feedback after

**If today IS logged:**
- Show the logged entry in a muted card: "In My Element" or "Not In My Element" with the reason text
- Small "Edit" link/button that switches back to the two-button form, pre-filled with current values

**Date helper:** Use `new Date().toISOString().split('T')[0]` for today's date string, or better: format in local timezone with:
```tsx
const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
```

**CSS additions to Progress.css:**
- `.progress-choice-btn` — full-width buttons with large tap targets (min-height 60px), rounded corners, bold text
- "In My Element" button: green background (`#2ecc71`), white text
- "Not In My Element" button: amber background (`#e17055`), white text
- `.progress-reason-input` — full-width textarea, dark background with light text, rounded corners
- `.progress-submit-btn` — submit button, disabled state when reason is empty
- `.progress-entry-card` — muted card showing logged entry with backdrop blur
- Mobile-first: buttons stack vertically, full-width

**Verification:**
1. Run: `npm run build` — succeeds
2. Run: `npm run dev`
3. Navigate to `/progress` → see two choice buttons
4. Tap "In My Element" → reason field appears
5. Try to submit with empty reason → submit button is disabled
6. Enter a reason, submit → entry appears in Firestore console
7. Refresh page → entry shows as logged (muted card)
8. Click "Edit" → form re-appears with current values

**Commit:**
```bash
git add src/components/Progress/Progress.tsx src/components/Progress/Progress.css
git commit -m "feat: add daily logger with Firestore write for today's entry"
```
<!-- END_TASK_2 -->
