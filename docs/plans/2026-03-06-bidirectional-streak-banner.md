# Bidirectional Streak Banner Design

## Summary

Enhance the element tracker streak banner to support both positive streaks (consecutive "In My Element" days) and negative streaks (consecutive "Not In My Element" days). Each direction has 7 tiers — one per day from 1-6, plus a 7+ cap — with progressively escalating visual treatment. Honest and direct emotional register: positive tiers feel genuinely good, negative tiers don't sugarcoat.

## Current State

- `calculateStreak()` at `Progress.tsx:67-86` only counts consecutive `inElement: true` days backwards from today
- Banner at line 496-498: `🔥 X day streak` or `😔 0 day streak`
- Confetti milestones at 7, 14, 21, 30, 60, 90, 100, 365 positive days

## Changes

### Streak Calculation

Replace `calculateStreak()` with a bidirectional version:
- If today is logged, start from today. If unlogged, start from yesterday.
- If the first entry is `inElement: true`, count consecutive true days -> positive number
- If the first entry is `inElement: false`, count consecutive false days -> negative number
- No entries found -> 0

### Tier System

Pure function `getStreakTier(streak: number)` returns `{ emoji: string, label: string, className: string }`.

**Positive tiers:**

| Day | Emoji | Label | className | Visual |
|-----|-------|-------|-----------|--------|
| 1 | 🌱 | "a start" | `streak-pos-1` | faintest green bg |
| 2 | 🌿 | "growing" | `streak-pos-2` | soft green bg |
| 3 | ☀️ | "building" | `streak-pos-3` | medium green bg |
| 4 | 🔥 | "rolling" | `streak-pos-4` | bright green bg |
| 5 | ⚡ | "surging" | `streak-pos-5` | green bg, faint glow |
| 6 | 🌟 | "blazing" | `streak-pos-6` | gold-green bg, glow |
| 7+ | 👑 | "unstoppable" | `streak-pos-7` | gold bg, pulsing glow |

**Negative tiers:**

| Day | Emoji | Label | className | Visual |
|-----|-------|-------|-----------|--------|
| 1 | 😕 | "off track" | `streak-neg-1` | faint amber bg |
| 2 | 😔 | "drifting" | `streak-neg-2` | muted orange bg |
| 3 | 😟 | "slipping" | `streak-neg-3` | orange bg |
| 4 | 😰 | "sinking" | `streak-neg-4` | deep orange bg |
| 5 | 😨 | "spiraling" | `streak-neg-5` | orange-red bg, faint shadow |
| 6 | 🚨 | "in trouble" | `streak-neg-6` | red bg, shadow |
| 7+ | 🆘 | "crisis" | `streak-neg-7` | dark red bg, heavy shadow |

**Neutral (streak = 0):** 😐 "no streak", `streak-neutral`, flat dark card.

### Banner Format

`{emoji} {|count|} day {label}` — e.g. "⚡ 5 day surging" or "😰 4 day sinking"

### Visual Treatment (CSS)

- Positive tiers: bg shifts faintest green -> gold. Tiers 5+ get `box-shadow` glow. Tier 7+ gets slow CSS `pulse` animation.
- Negative tiers: bg shifts faint amber -> dark red. Tiers 5+ get `inset box-shadow`. No animations on negative (heavy, not lively).
- Neutral: existing dark card, no special treatment.

### Confetti (unchanged)

Existing milestones stay. Only fire on positive streaks.

## Files Changed

- `src/components/Progress/Progress.tsx` — replace `calculateStreak()`, add `getStreakTier()`, update banner JSX
- `src/components/Progress/Progress.css` — add 15 tier classes (7 positive, 7 negative, 1 neutral)

## Out of Scope

- Streak history/graphs
- Notification when streak is at risk
- Negative streak confetti/anti-celebrations
