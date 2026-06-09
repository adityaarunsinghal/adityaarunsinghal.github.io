# Docs Tombstone

Records planning/spec docs removed from the working tree once their work shipped.
Nothing is lost: every file below is recoverable from git at the listed commit.

To restore any file:
```bash
git show <recovery-commit>:<path>          # view it
git checkout <recovery-commit> -- <path>   # bring it back
```

---

## Removed 2026-06-09 (recovery commit: `38fba1c`)

Removed after a repo audit confirmed each plan's work is fully implemented and
in production. They were design/implementation/test planning artifacts, not live
documentation.

| Path | What it was | Status |
|------|-------------|--------|
| `docs/dep-migration-plan.md` | Plan for the npm→pnpm + major dependency upgrade | Done; migration shipped (React 19, Vite 8, Router 7, TS 6, pnpm) |
| `docs/plans/2026-03-06-bidirectional-streak-banner.md` | Plan for the bidirectional streak banner | Done; implemented in `src/components/Progress/Progress.tsx` (`getStreakTier`) |
| `docs/design-plans/2026-02-25-element-tracker.md` | Element tracker design plan | Done; shipped as `/progress` |
| `docs/implementation-plans/2026-02-25-element-tracker/phase_01.md` … `phase_07.md` | Element tracker phased implementation plan (7 phases) | Done; shipped as `/progress` |
| `docs/implementation-plans/2026-02-25-element-tracker/test-requirements.md` | Element tracker test requirements | Done |
| `docs/test-plans/2026-02-25-element-tracker.md` | Element tracker manual test plan | Done |

Recover the whole element-tracker plan set:
```bash
git checkout 38fba1c -- docs/implementation-plans/2026-02-25-element-tracker/
```
