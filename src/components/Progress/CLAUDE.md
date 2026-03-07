# Progress Component

Last verified: 2026-03-06

## Purpose
Tracks daily "element" status to build awareness of when you're aligned with your best self. Provides visual feedback through heatmaps and celebrates consistency with streak animations.

## Contracts
- **Exposes**: Progress component (default export)
- **Guarantees**:
  - One entry per day (YYYY-MM-DD document ID)
  - Real-time sync with Firestore
  - Streak celebrations persist per session
- **Expects**:
  - Authenticated user via useAuth hook
  - Firestore connection available
  - User email in whitelist

## Dependencies
- **Uses**:
  - Firebase (Firestore, serverTimestamp)
  - react-activity-calendar (heatmap visualization)
  - canvas-confetti (celebrations)
  - useAuth hook (authentication)
- **Used by**: router.tsx (/progress route)
- **Boundary**: No direct imports from other feature components

## Data Model
```typescript
interface Entry {
  id: string;        // YYYY-MM-DD
  inElement: boolean;
  reason: string;
  date: string;      // YYYY-MM-DD
  updatedAt: Date | null;
}
```

## Key Decisions
- Document IDs are dates (YYYY-MM-DD): Enables O(1) lookups for specific days
- sessionStorage for streak state: Prevents confetti re-firing on reload
- Real-time listener: Immediate sync across devices
- Yesterday nudge: Encourages consistent tracking

## Invariants
- Every entry has exactly one boolean choice (inElement true/false)
- Past entries can be edited by clicking calendar dates
- Today's entry always shows at top
- Streak is bidirectional: positive for consecutive "in element", negative for consecutive "not in element"
- Streak skips today if unlogged (counts from yesterday)
- `getStreakTier()` maps streak value to one of 15 tiers (7 positive, 7 negative, 1 neutral) with emoji, label, and CSS class

## Key Files
- `Progress.tsx` - Main component with all logic
- `Progress.css` - Animations and responsive styles

## Gotchas
- Calendar uses local timezone for dates
- Confetti fires at 7, 14, 21, 30, 60, 90, 100, 365 day positive streaks only
- Empty reason field is valid (optional)
- Yesterday check happens on every mount