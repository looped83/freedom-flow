# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start Vite dev server
npm run build      # tsc -b && vite build (type-check + bundle)
npm run lint       # ESLint (typescript-eslint + react-hooks)
npm run preview    # serve the dist/ build locally
```

There is no test suite. TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`) is the primary correctness gate — always run `npm run build` and `npm run lint` to verify changes.

## Architecture

### State & Persistence

All app state lives in a single `AppState` (`src/hooks/useAppState.ts`) managed by `useReducer` (pure reducer, no side effects). State is persisted to `localStorage` via a 500 ms debounce on every change. The two storage keys are:

- `dividend-goal-tracker-v1` — live state (portfolio + goals + milestones) plus `knownDefaults`
- `dividend-goal-tracker-defaults-v1` — user-saved reset baseline for goals (via "Als Standard hinterlegen")

`storage.ts:loadState()` migrates stored data. Code-level defaults (`DEFAULT_GOALS`, `DEFAULT_MILESTONES`) are injected **only if their id is not in `knownDefaults`**, so entries the user deleted stay deleted while defaults added in a new version still appear. User-edited categories are never overwritten; removed categories are remapped via `REMOVED_CATEGORY_MAP`.

`useAppState()` returns `state`, `actions` (stable object), `projection`, `totalExpenses`, `goalResults`, `milestoneResults`, `visibleMilestoneResults`.

### Data Flow

```
App.tsx
  useAppState()          → state, actions, projection, results
  Dashboard              → Hero (inline edit income / expense total), Ziele list, time card
  LiveFlow (lazy)        → reads portfolio; ticks only while its tab is active
  FreedomTimeline (lazy) → reads projection + goals + visible milestones
  SetupPage (lazy)       → receives `actions`; GoalList, MilestoneList, PortfolioForm
```

Dashboard → Setup deep link: `onOpen(target, id)` sets a `SetupFocus`; the list expands and scrolls to that row.

### Calculation Layer (`src/utils/calculations.ts`)

All projections take a `ProjectionInput` (`monthlyIncome`, `dividendYield`, `dividendGrowth`, `monthlySavings`, `horizonYears`), memoized in `useAppState` so lifetime edits don't recompute results.

- `projectMonthlyDividendsAtYear(p, years)` — existing dividends grow at `dividendGrowth`%, monthly savings contribute at `dividendYield`%
- `projectMonthlyDividendsForYear(p, year)` — any calendar year (past, current, future)
- `computeGoalResults(goals, p)` — allocates income to goals cheapest-first; `achievedYear` within `horizonYears`
- `buildFreedomTimeline(goals, p)` — chronological `TimelineEntry[]` incl. retrospective past entries (display sorts future-first)

**One horizon**: `horizonYears` (editable in Setup › Dividenden, max `MAX_YEARS`) limits Dashboard years, milestone years and the Timeline alike.

**Allocation invariant**: goals are always covered in ascending `monthlyAmount` order (cheapest first), both for current coverage and future projections.

### Category System

`GoalCategory` is a union type in `src/types/index.ts`. Keep in sync when adding/removing categories:

1. `src/types/index.ts` — union type definition
2. `src/components/goals/CategoryIcon.tsx` — `PATHS` record (SVG paths, one per category)
3. `src/constants/defaultData.ts` — `GOAL_CATEGORIES` array (picker order, also used to validate stored data)

When removing a category, add it to `REMOVED_CATEGORY_MAP` in `storage.ts`.

### UI Building Blocks (`src/components/ui/`)

Reuse these instead of re-styling markup:

- `Page` (`layout/`) — page frame + title; `Card` — every card (tone `default` | `accent`), header with icon/title/right slot
- `SegmentedControl`, `SortControl` — all toggles/filters/sorts
- `StatTile` + `STAT_VALUE` — inset metric tiles; `EditableNumber` — tap-to-edit numbers (dotted underline affordance, clamps/snaps)
- `ProgressBar` — transform-based fill; `ConfirmButton` — two-step destructive actions (no `confirm()`)
- `EditableList` (`ListHeader`, `ListToolbar`, `ListRow`, `AddPanel`, `applyListView`) + `hooks/useEditableList` — Setup lists
- `Form` (`TextField`, `AmountField`, `FormActions`), `IconPicker`
- `Icons` — `Svg` base + named icons; `CategoryIcon` / `MilestoneIcon` build on `Svg`

### Wording

**Ziele** = umbrella term; **Ausgabe** (expense goal) and **Meilenstein** are the two kinds. Status label is always **Erreicht**. Status lines come from `formatProgressStatus()`.

### Formatting (`src/utils/formatting.ts`)

German locale throughout. `formatEuro(v, decimals)`, `formatNumber`, `formatPercent` share cached `Intl.NumberFormat` instances. `parseGerman()` handles `1.000,00`, `6,5` and `42.90`. `liveFormatAmount()` formats on keystroke; `useAmountInput` keeps the caret stable.

### Styling

Tailwind with custom design tokens (see `tailwind.config.js`):
- `surface` / `surface-1` / `surface-2` / `surface-3` — dark backgrounds (lightest = -3)
- `accent` — green (`#4ade80`) = dividends / achieved / active; `accent-muted` — translucent green bg
- `gold` — amber (`#fbbf24`) = open / partial / missing; `gold-muted` — translucent amber bg

Conventions: text tiers `text-white` / `text-white/70` / `text-white/50`; inset surfaces `bg-white/5`; borders `border-white/5` (cards), `border-white/10` (controls). Radii: cards `rounded-2xl`, rows/tiles `rounded-xl`, controls `rounded-lg`. Focus rings come from the global `:focus-visible` rule (`.focus-inset` inside `overflow-hidden`).

All SVG icons are inline (no icon library): `fill="none"`, `stroke="currentColor"`, `strokeWidth="1.5"`, round caps/joins — use `Svg` from `ui/Icons.tsx`.

### Deployment

GitHub Actions deploys `dist/` to the `gh-pages` branch on push to `main`. Vite base path is `/freedom-flow/`. The deploy workflow uses plain git push, not the `actions/deploy-pages` action.
