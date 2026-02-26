# Element Tracker — Human Test Plan

## Prerequisites
- Run `npm run dev` to start the development server
- Have a whitelisted email account for authentication
- Open browser at http://localhost:5173

---

## Test 1: Authentication (AC1)

- [ ] **AC1.1** Open incognito window, navigate to `/progress` while **not logged in** → redirected to `/login`
- [ ] **AC1.2** Log in with whitelisted email → page loads with blue gradient background and "In My Element" title
- [ ] **AC1.3** Verify Firestore rules: in Firebase Console Rules Simulator, test that non-whitelisted email is denied read/write to `element-tracker` collection

## Test 2: Daily Logging (AC2)

- [ ] **AC2.1** Select "In My Element", enter a reason, submit → entry saved (check Firestore console for document with `inElement: true`, correct date, reason, and timestamp)
- [ ] **AC2.2** Select "Not In My Element", enter a reason, submit → entry saved (check Firestore for `inElement: false`)
- [ ] **AC2.3** Select a choice but leave reason empty → submit button is disabled
- [ ] **AC2.4** Submit today's entry → saves immediately, NO confirmation dialog appears

## Test 3: Past Entry Editing (AC3)

- [ ] **AC3.1** Ensure today is logged and yesterday is not → "Yesterday is missing" nudge appears below today's section
- [ ] **AC3.2** Fill in yesterday's form and submit → confirmation dialog appears ("Save entry for [date]?")
- [ ] **AC3.3** Click "Confirm" in dialog → entry saved to Firestore, dialog closes
- [ ] **AC3.4** Submit another past entry, click "Cancel" → dialog closes, no Firestore write, original data unchanged

## Test 4: Heatmap Calendar (AC4)

- [ ] **AC4.1** Visual check: green cells for "in element" days, amber for "not in element", gray for unlogged
- [ ] **AC4.2** Click an empty heatmap cell → inline editor opens below calendar for that date
- [ ] **AC4.3** Submit a new entry → heatmap cell updates color immediately without page refresh

## Test 5: Donut Chart (AC5)

- [ ] **AC5.1** With known data (e.g., 3 in-element / 2 not = 60%) → chart shows ~60% and "3 of 5 days"
- [ ] **AC5.2** Submit a new entry → donut chart ratio updates smoothly without refresh

## Test 6: Mobile (AC6)

- [ ] **AC6.1** Chrome DevTools → device toolbar → iPhone SE (375px):
  - All buttons are tappable (no tiny targets)
  - Heatmap scrolls horizontally
  - Confirmation dialog is usable (nearly full-width)
  - No horizontal page overflow
- [ ] **AC6.2** Test permission error: temporarily change Firestore rules or test with rules simulator → friendly "Access denied" message shown
- [ ] **AC6.3** Disconnect network, then submit an entry → error message appears, form data is preserved, "Try again" button works

## Test 7: Delight & Animations (AC7)

- [ ] **AC7.1** Submit an entry → brief pulse/glow animation on the saved entry card
- [ ] **AC7.2** Create entries for 7 consecutive "in element" days → confetti fires on the 7th day; refresh page → confetti does NOT re-fire
- [ ] **AC7.3** After backfilling data via heatmap → colorful year view, meaningful donut chart ratio
- [ ] **AC7.4** Smooth transitions:
  - Click heatmap cell → inline editor slides in
  - Hover buttons → subtle scale effect
  - Change entry → donut chart animates to new ratio
  - Confirmation dialog fades in with backdrop
