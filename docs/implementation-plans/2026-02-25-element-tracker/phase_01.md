# Element Tracker Implementation Plan — Phase 1

**Goal:** Create the `element-tracker` Firestore collection security rules

**Architecture:** Add a new collection rule block to `firestore.rules` matching the existing email whitelist pattern used by `love-ingy-messages` and `trmnl-config`.

**Tech Stack:** Firebase Firestore Security Rules

**Scope:** Phase 1 of 7 from original design

**Codebase verified:** 2026-02-25

---

## Acceptance Criteria Coverage

This phase is infrastructure — verified operationally.

**Verifies:** None (infrastructure setup — verification is operational: rules deploy successfully, authorized users can read/write, unauthorized users are rejected)

---

<!-- START_TASK_1 -->
### Task 1: Add element-tracker collection to Firestore security rules

**Files:**
- Modify: `firestore.rules` (add new collection match block before closing braces)

**Step 1: Add the element-tracker rule block**

Open `firestore.rules` and add the following block inside the `match /databases/{database}/documents` block, after the existing `trmnl-config` rule:

```firestore
    // Element tracker daily entries
    match /element-tracker/{document} {
      allow read, write: if request.auth != null
        && request.auth.token.email in [
          'adityaarunsinghal@gmail.com',
          'johannefriedman@gmail.com',
          'johanne.friedman@gmail.com'
        ];
    }
```

The complete file should now have three collection rules: `love-ingy-messages`, `trmnl-config`, and `element-tracker`.

**Step 2: Verify rules are valid**

Run: `npx firebase-tools deploy --only firestore:rules --project aditya-singhal-website --dry-run` (if dry-run is available), OR validate syntax by checking the file parses correctly.

Alternatively, the rules can be validated via the Firebase console Rules editor by pasting the updated content.

**Step 3: Commit**

```bash
git add firestore.rules
git commit -m "feat: add element-tracker Firestore security rules"
```
<!-- END_TASK_1 -->
