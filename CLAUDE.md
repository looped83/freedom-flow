# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start Vite dev server
npm run build      # tsc -b && vite build (type-check + bundle)
npm run lint       # ESLint
npm run preview    # serve the dist/ build locally
```

There is no test suite. TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`) acts as the primary static correctness gate — always run `npm run build` to verify changes.

## Architecture

### State & Persistence

All app state lives in a single `AppState` (`src/hooks/useAppState.ts`) managed by `useReducer`. State is persisted to `localStorage` via a 500 ms debounce on every change. On load, `storage.ts:loadState()` runs migrations (adding missing default goals, remapping removed categories). The two storage keys are:

- `dividend-goal-tracker-v1` — live state (portfolio + goals)
- `dividend-goal-tracker-defaults-v1` — user-saved reset baseline (via "Als Standard hinterlegen")

### Data Flow

```
App.tsx
  useAppState()          → AppState { portfolio, goals }
  Dashboard              → reads state, calls onIncomeChange
  SetupPage
    GoalList             → reads+mutates goals; receives portfolio for computeGoalResults
    PortfolioForm        → mutates portfolio
  FreedomTimeline        → reads state (lazy)
  LiveFlow               → reads portfolio only (lazy)
```

Dashboard, Timeline, LiveFlow are **read-only views**. All mutations flow through `useAppState` actions (`setPortfolio`, `addGoal`, `updateGoal`, `deleteGoal`, `reset`).

`SetupPage` lazy-loads via `React.lazy`. Dashboard is always eagerly loaded.

### Calculation Layer (`src/utils/calculations.ts`)

The core financial logic. Key functions:

- `projectMonthlyDividendsAtYear(portfolio, years)` — compound projection: existing dividends grow at `dividendGrowth`%, new savings contribute at `dividendYield`%
- `computeGoalResults(goals, monthly, portfolio)` — allocates income to goals cheapest-first; returns `GoalResult[]` with `status`, `coveredAmount`, `coveragePercent`, `achievedYear`
- `buildFreedomTimeline(goals, portfolio)` — returns chronological `TimelineEntry[]` including retrospective past entries (display layer reverses for future-at-top rendering)
- `buildLifeUnlocks(...)` — builds unlock cards sorted: achieved first, then by progress desc

**Allocation invariant**: goals are always covered in ascending `monthlyAmount` order (cheapest first), both for current coverage and future projections.

### Category System

`GoalCategory` is a union type in `src/types/index.ts`. Three files must stay in sync when adding/removing categories:

1. `src/types/index.ts` — union type definition
2. `src/components/goals/CategoryIcon.tsx` — `PATHS` record (SVG paths, one per category)
3. `src/components/goals/GoalForm.tsx` — `CATEGORIES` array (controls picker order)
4. `src/constants/defaultData.ts` — `CATEGORY_ORDER` record (numeric sort key)

When removing a category, add a migration in `storage.ts:loadState()` to remap existing stored goals. When adding new default goals, the migration in `loadState()` automatically injects missing entries into stored state.

### Formatting (`src/utils/formatting.ts`)

German locale throughout. `parseGerman()` handles both `1.000,00` and `6,5` and `42.90` forms. `liveFormatAmount()` formats on keystroke without interfering with cursor position. `Intl.NumberFormat` instances are module-level constants.

### Styling

Tailwind with custom design tokens (see `tailwind.config.js`):
- `surface` / `surface-1` / `surface-2` / `surface-3` — dark backgrounds (lightest = -3)
- `accent` — green (`#4ade80`), `accent-muted` — translucent green bg
- `gold` — amber (`#fbbf24`), `gold-muted` — translucent amber bg

All SVG icons are inline (no icon library). Icons use `fill="none"`, `stroke="currentColor"`, `strokeWidth="1.5"`, `strokeLinecap="round"`, `strokeLinejoin="round"`.

### Deployment

GitHub Actions deploys `dist/` to the `gh-pages` branch on push to `main`. Vite base path is `/freedom-flow/`. The deploy workflow uses plain git push, not the `actions/deploy-pages` action.
