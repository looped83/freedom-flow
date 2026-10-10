import type { AppState, Goal, Milestone, Portfolio } from '../types';
import {
  DEFAULT_GOALS,
  DEFAULT_MILESTONES,
  DEFAULT_PORTFOLIO,
  GOAL_CATEGORIES,
} from '../constants/defaultData';
import { MAX_YEARS, totalMonthlyCosts } from './calculations';
import { syncAutoMilestone } from './milestones';

const STORAGE_KEY   = 'dividend-goal-tracker-v1';
const DEFAULTS_KEY  = 'dividend-goal-tracker-defaults-v1';

/** IDs of every code-level default goal and milestone. Persisted with the
 *  state so a later load can tell "deleted by the user" apart from "added in
 *  a newer app version" — only the latter gets injected. */
const DEFAULT_IDS = [...DEFAULT_GOALS.map((g) => g.id), ...DEFAULT_MILESTONES.map((m) => m.id)];

interface StoredState extends AppState {
  knownDefaults?: string[];
}

// ── Migration helpers ────────────────────────────────────────────────────────

type LegacyPortfolio = Partial<Portfolio> & { value?: number };

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

/** Rebuilds the portfolio from known fields only: fills gaps with defaults,
 *  clamps the horizon and drops fields that are no longer used. */
function migratePortfolio(p: LegacyPortfolio): Portfolio {
  const d = DEFAULT_PORTFOLIO;
  const dividendYield = num(p.dividendYield, d.dividendYield);
  const startYear = num(p.lifetimeStartYear, d.lifetimeStartYear);
  return {
    monthlyIncome: num(p.monthlyIncome, p.value != null ? (p.value * dividendYield) / 1200 : d.monthlyIncome),
    dividendYield,
    dividendGrowth: num(p.dividendGrowth, d.dividendGrowth),
    monthlySavings: num(p.monthlySavings, d.monthlySavings),
    horizonYears: Math.min(MAX_YEARS, Math.max(1, Math.round(num(p.horizonYears, d.horizonYears)))),
    lifetimeDividends: num(p.lifetimeDividends, d.lifetimeDividends),
    lifetimeStartYear: startYear === 2012 ? d.lifetimeStartYear : startYear,
  };
}

const VALID_CATEGORIES = new Set<string>(GOAL_CATEGORIES);
const REMOVED_CATEGORY_MAP: Partial<Record<string, Goal['category']>> = {
  Medizin: 'Gesundheit',
};

/** Append code-level defaults the stored data has never seen. Defaults the
 *  user deleted stay deleted. */
function injectNewDefaults<T extends { id: string }>(items: T[], defaults: T[], known: Set<string>): T[] {
  const present = new Set(items.map((i) => i.id));
  const fresh = defaults.filter((d) => !known.has(d.id) && !present.has(d.id));
  return fresh.length > 0 ? [...items, ...fresh.map((d) => ({ ...d }))] : items;
}

function migrateGoals(goals: Goal[], known: Set<string>): Goal[] {
  const out = goals.map((g) => {
    const category = REMOVED_CATEGORY_MAP[g.category]
      ?? (VALID_CATEGORIES.has(g.category) ? g.category : 'Sonstiges');
    return category === g.category ? g : { ...g, category };
  });
  return injectNewDefaults(out, DEFAULT_GOALS, known);
}

const REMOVED_DEFAULT_MS_IDS = new Set([
  'ms-4', 'ms-5', 'ms-6', 'ms-7', 'ms-8', 'ms-9', 'ms-10', 'ms-11', 'ms-12',
  'ms-16', 'ms-17',
  'ms-18', 'ms-19', 'ms-20', 'ms-21', 'ms-22',
]);

const MS_TITLE_MIGRATIONS: Record<string, { from: string; to: string }> = {
  'ms-1': { from: 'Erste 100 € / Monat', to: '100 € / Monat' },
};

function migrateMilestones(stored: Milestone[] | undefined, known: Set<string>): Milestone[] {
  if (!Array.isArray(stored)) return DEFAULT_MILESTONES.map((m) => ({ ...m }));

  const out = stored
    .filter((m) => !REMOVED_DEFAULT_MS_IDS.has(m.id))
    .map((m) => {
      const rename = MS_TITLE_MIGRATIONS[m.id];
      return rename && m.title === rename.from ? { ...m, title: rename.to } : m;
    });
  return injectNewDefaults(out, DEFAULT_MILESTONES, known);
}

// ── Public API ───────────────────────────────────────────────────────────────

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (!parsed.portfolio || !Array.isArray(parsed.goals)) return getDefaultState();

    // Data saved before `knownDefaults` existed always contained every default
    // at load time, so treating all current defaults as known is safe.
    const known = new Set(parsed.knownDefaults ?? DEFAULT_IDS);
    const goals = migrateGoals(parsed.goals, known);
    return {
      portfolio: migratePortfolio(parsed.portfolio),
      goals,
      milestones: syncAutoMilestone(migrateMilestones(parsed.milestones, known), totalMonthlyCosts(goals)),
    };
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    const stored: StoredState = { ...state, knownDefaults: DEFAULT_IDS };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch { /* quota exceeded */ }
}

function loadDefaultGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(DEFAULTS_KEY);
    if (raw) return JSON.parse(raw) as Goal[];
  } catch { /* corrupt baseline → fall back to code defaults */ }
  return DEFAULT_GOALS.map((g) => ({ ...g }));
}

/** Persist one goal as part of the user-defined reset baseline. */
export function saveGoalDefault(goal: Goal): void {
  try {
    const defaults = loadDefaultGoals();
    const idx = defaults.findIndex((g) => g.id === goal.id);
    if (idx >= 0) defaults[idx] = goal;
    else defaults.push(goal);
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(defaults));
  } catch { /* quota exceeded */ }
}

export function getDefaultState(): AppState {
  const goals = loadDefaultGoals();
  return {
    portfolio: { ...DEFAULT_PORTFOLIO },
    goals,
    milestones: syncAutoMilestone(DEFAULT_MILESTONES.map((m) => ({ ...m })), totalMonthlyCosts(goals)),
  };
}
