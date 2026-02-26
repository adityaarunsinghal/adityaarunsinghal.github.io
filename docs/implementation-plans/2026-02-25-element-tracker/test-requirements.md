# Element Tracker — Test Requirements

This project has no automated testing infrastructure. All acceptance criteria are verified through manual testing (build + run + browser verification).

## Verification Approach

For each phase:
1. `npm run build` — TypeScript compilation succeeds (type safety)
2. `npm run dev` — development server starts
3. Manual browser verification per the criteria below

---

## AC1: Private route access

| ID | Criterion | Verification | Phase |
|----|-----------|--------------|-------|
| AC1.1 | Authenticated user with whitelisted email can access `/progress` | Log in with whitelisted email → page loads with gradient background and title | Phase 2 |
| AC1.2 | Unauthenticated user visiting `/progress` is redirected to `/login` | Open incognito → navigate to `/progress` → redirected to `/login` | Phase 2 |
| AC1.3 | Authenticated user with non-whitelisted email cannot read/write entries | Firestore rules reject non-whitelisted emails — verified via Firestore console rules simulator | Phase 1 |

## AC2: Daily logging

| ID | Criterion | Verification | Phase |
|----|-----------|--------------|-------|
| AC2.1 | "In My Element" + reason → saved to Firestore | Select "In My Element", enter reason, submit → check Firestore console for document with correct fields | Phase 3 |
| AC2.2 | "Not In My Element" + reason → saved to Firestore | Select "Not In My Element", enter reason, submit → check Firestore console | Phase 3 |
| AC2.3 | Empty reason blocks submit | Leave reason empty → submit button is disabled/inactive | Phase 3 |
| AC2.4 | Today's entry saves without confirmation | Submit today's entry → saves immediately, no dialog appears | Phase 3 |

## AC3: Past entry editing with confirmation

| ID | Criterion | Verification | Phase |
|----|-----------|--------------|-------|
| AC3.1 | Yesterday nudge appears when unlogged | Log today, ensure yesterday has no entry → "Yesterday is missing" nudge visible | Phase 4 |
| AC3.2 | Past entry edit shows confirmation dialog | Edit yesterday's entry → confirmation dialog appears before save | Phase 4 |
| AC3.3 | Confirming saves to Firestore | Click Confirm in dialog → entry appears in Firestore console | Phase 4 |
| AC3.4 | Cancelling discards changes | Click Cancel in dialog → no changes in Firestore, form closes | Phase 4 |

## AC4: Heatmap calendar

| ID | Criterion | Verification | Phase |
|----|-----------|--------------|-------|
| AC4.1 | Correct colors (green/amber/gray) | Visual check: in-element days green, not-in-element amber, unlogged gray | Phase 5 |
| AC4.2 | Clicking cell opens editor | Click an empty cell → inline editor opens for that date | Phase 5 |
| AC4.3 | Real-time updates | Submit a new entry → heatmap cell updates color without refresh | Phase 5 |

## AC5: Pie chart

| ID | Criterion | Verification | Phase |
|----|-----------|--------------|-------|
| AC5.1 | Correct ratio and counts | With known data (e.g., 3 in / 2 not = 60%) → chart shows 60% and "3 of 5 days" | Phase 6 |
| AC5.2 | Real-time updates | Submit a new entry → pie chart ratio updates without refresh | Phase 6 |

## AC6: Cross-cutting

| ID | Criterion | Verification | Phase |
|----|-----------|--------------|-------|
| AC6.1 | Mobile usable | Chrome DevTools device mode (iPhone SE 375px) → all buttons tappable, no overflow | Phase 7 |
| AC6.2 | Permission-denied error message | Test in Firestore rules simulator or disconnect auth → friendly error shown | Phase 7 |
| AC6.3 | Failed save preserves form data | Disconnect network → submit → error shown, form data still present | Phase 7 |

## AC7: Delight & micro-interactions

| ID | Criterion | Verification | Phase |
|----|-----------|--------------|-------|
| AC7.1 | Visual response on submit | Submit an entry → brief pulse/glow animation on the saved entry | Phase 7 |
| AC7.2 | Streak milestone confetti | Create 7 consecutive "in element" entries → confetti fires | Phase 7 |
| AC7.3 | Visible progress after backfill | After backfilling data → heatmap shows colorful year, donut shows meaningful ratio | Phase 7 |
| AC7.4 | Smooth transitions | Editors slide in, buttons have hover effects, chart animates on change | Phase 7 |

---

## Human Verification Justification

All criteria are verified manually because:
1. This project has zero automated testing infrastructure (no test framework, no test files, no CI test step)
2. The user explicitly chose manual verification to match existing project patterns
3. The acceptance criteria are primarily visual/interactive behaviors best verified in a real browser
4. TypeScript type checking (`tsc` during build) provides compile-time safety
