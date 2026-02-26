# Element Tracker Implementation Plan — Phase 2

**Goal:** Empty `/progress` page loads behind authentication with base styling

**Architecture:** Create Progress component following existing component-per-directory pattern (Progress.tsx + Progress.css). Register in router.tsx wrapped in PrivateRoute + ErrorBoundary, matching existing `/lovesingy` and `/translate` routes.

**Tech Stack:** React 18, React Router v6, Firebase Auth (existing)

**Scope:** Phase 2 of 7 from original design

**Codebase verified:** 2026-02-25

---

## Acceptance Criteria Coverage

### element-tracker.AC1: Private route access
- **element-tracker.AC1.1 Success:** Authenticated user with whitelisted email can access `/progress`
- **element-tracker.AC1.2 Failure:** Unauthenticated user visiting `/progress` is redirected to `/login`
- **element-tracker.AC1.3 Failure:** Authenticated user with non-whitelisted email cannot read/write entries

---

<!-- START_SUBCOMPONENT_A (tasks 1-2) -->
<!-- START_TASK_1 -->
### Task 1: Create Progress component scaffold

**Verifies:** element-tracker.AC1.1 (authenticated access works)

**Files:**
- Create: `src/components/Progress/Progress.tsx`
- Create: `src/components/Progress/Progress.css`

**Implementation:**

Create `src/components/Progress/Progress.tsx`:

```tsx
import { useAuth } from '@/hooks/useAuth';
import './Progress.css';

const Progress = () => {
  const { user } = useAuth();

  return (
    <div className="progress-body">
      <div className="progress-container">
        <h1 className="progress-title">In My Element</h1>
        {user && (
          <p className="progress-subtitle">
            Tracking your element, {user.displayName?.split(' ')[0] || 'friend'}
          </p>
        )}
      </div>
    </div>
  );
};

export default Progress;
```

Create `src/components/Progress/Progress.css` with the deep blue-to-teal gradient background and base layout:

```css
.progress-body {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  overflow-y: auto;
  z-index: 1;
}

.progress-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 1rem;
  padding-top: 3rem;
}

.progress-title {
  color: #ffffff;
  font-size: max(1.8rem, 3vw);
  text-align: center;
  margin-bottom: 0.5rem;
}

.progress-subtitle {
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  font-size: 0.95rem;
  margin-bottom: 2rem;
}
```

**Verification:**
Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

<!-- END_TASK_1 -->

<!-- START_TASK_2 -->
### Task 2: Register /progress route in router

**Verifies:** element-tracker.AC1.1, element-tracker.AC1.2 (auth redirect)

**Files:**
- Modify: `src/router.tsx` — add new route entry for `/progress`

**Implementation:**

Add a lazy import for Progress at the top of `src/router.tsx` (following the pattern of other component imports):

```tsx
import Progress from '@/components/Progress/Progress';
```

Add a new route object inside the `children` array of the root route, alongside the existing `/lovesingy` route. Follow the exact same PrivateRoute + ErrorBoundary wrapping pattern:

```tsx
{
  path: "/progress",
  element: (
    <ErrorBoundary>
      <PrivateRoute>
        <Progress />
      </PrivateRoute>
    </ErrorBoundary>
  ),
},
```

**Verification:**
1. Run: `npm run build` — build succeeds
2. Run: `npm run dev` — open browser
3. Navigate to `/progress` while not logged in → redirected to `/login`
4. Log in with whitelisted email → see the "In My Element" page with blue gradient
5. The page should show the title and subtitle with the user's first name

**Commit:**
```bash
git add src/components/Progress/Progress.tsx src/components/Progress/Progress.css src/router.tsx
git commit -m "feat: add /progress route with Progress component scaffold"
```
<!-- END_TASK_2 -->
<!-- END_SUBCOMPONENT_A -->
