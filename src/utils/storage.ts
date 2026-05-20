import type { AppState, Goal, Milestone, Portfolio } from '../types';
import { AUTO_EXPENSES_MS_ID, DEFAULT_GOALS, DEFAULT_MILESTONES, DEFAULT_PORTFOLIO } from '../constants/defaultData';

const STORAGE_KEY   = 'dividend-goal-tracker-v1';
const DEFAULTS_KEY  = 'dividend-goal-tracker-defaults-v1';

// ── Migration helpers ────────────────────────────────────────────────────────

function migratePortfolio(p: Portfolio): Portfolio {
  let out = p;
  if (out.monthlyIncome === undefined) {
    out = { ...out, monthlyIncome: (out.value * out.dividendYield) / 100 / 12 };
  }
  if (out.lifetimeDividends === undefined) {
    out = { ...out, lifetimeDividends: DEFAULT_PORTFOLIO.lifetimeDividends };
  }
  if (out.lifetimeStartYear === undefined || out.lifetimeStartYear === 2012) {
    out = { ...out, lifetimeStartYear: DEFAULT_PORTFOLIO.lifetimeStartYear };
  }
  return out;
}

const REMOVED_CATEGORY_MAP: Partial<Record<string, Goal['category']>> = {
  Medizin: 'Gesundheit',
};

function migrateGoals(goals: Goal[]): Goal[] {
  const defaultById = new Map(DEFAULT_GOALS.map((g) => [g.id, g]));

  // Sync category from code-level defaults; remap removed categories.
  let out = goals.map((g) => {
    const def = defaultById.get(g.id);
    const category = REMOVED_CATEGORY_MAP[def ? def.category : g.category]
      ?? (def ? def.category : g.category);
    return { ...g, category } as Goal;
  });

  // Inject new default goals not yet in stored data.
  const storedIds = new Set(out.map((g) => g.id));
  const missing = DEFAULT_GOALS.filter((g) => !storedIds.has(g.id));
  if (missing.length > 0) out = [...out, ...missing];

  return out;
}

const REMOVED_DEFAULT_MS_IDS = new Set([
  'ms-4', 'ms-5', 'ms-6', 'ms-7', 'ms-8', 'ms-9', 'ms-10', 'ms-11', 'ms-12',
  'ms-16', 'ms-17',
  'ms-18', 'ms-19', 'ms-20', 'ms-21', 'ms-22',
]);

const MS_TITLE_MIGRATIONS: Record<string, { from: string; to: string }> = {
  'ms-1': { from: 'Erste 100 € / Monat', to: '100 € / Monat' },
};

function migrateMilestones(stored: Milestone[] | undefined, goals: Goal[]): Milestone[] {
  let out: Milestone[];

  if (!Array.isArray(stored)) {
    out = DEFAULT_MILESTONES.map((m) => ({ ...m }));
  } else {
    out = stored.filter((m) => !REMOVED_DEFAULT_MS_IDS.has(m.id));

    out = out.map((m) => {
      const rename = MS_TITLE_MIGRATIONS[m.id];
      return rename && m.title === rename.from ? { ...m, title: rename.to } : m;
    });

    const storedIds = new Set(out.map((m) => m.id));
    const missing = DEFAULT_MILESTONES.filter((m) => !storedIds.has(m.id));
    if (missing.length > 0) out = [...out, ...missing];
  }

  // Keep the auto-managed expenses milestone in sync with the actual goal sum.
  const total = goals.reduce((s, g) => s + g.monthlyAmount, 0);
  return out.map((m) =>
    m.id === AUTO_EXPENSES_MS_ID && m.type === 'dividend' && m.dividendTarget !== total
      ? { ...m, dividendTarget: total }
      : m,
  );
}

// ── Public API ───────────────────────────────────────────────────────────────

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.portfolio || !Array.isArray(parsed.goals)) return getDefaultState();

    const portfolio  = migratePortfolio(parsed.portfolio);
    const goals      = migrateGoals(parsed.goals);
    const milestones = migrateMilestones((parsed as Partial<AppState>).milestones, goals);

    return { portfolio, goals, milestones };
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota exceeded */ }
}

/** Persist one goal as part of the user-defined reset baseline. */
export function saveGoalDefault(goal: Goal): void {
  try {
    const raw = localStorage.getItem(DEFAULTS_KEY);
    const defaults: Goal[] = raw ? JSON.parse(raw) : DEFAULT_GOALS.map(g => ({ ...g }));
    const idx = defaults.findIndex(g => g.id === goal.id);
    if (idx >= 0) defaults[idx] = goal;
    else defaults.push(goal);
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(defaults));
  } catch { /* quota exceeded */ }
}

function loadDefaultGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(DEFAULTS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_GOALS.map(g => ({ ...g }));
  } catch {
    return DEFAULT_GOALS.map(g => ({ ...g }));
  }
}

export function getDefaultState(): AppState {
  return {
    portfolio: { ...DEFAULT_PORTFOLIO },
    goals: loadDefaultGoals(),
    milestones: DEFAULT_MILESTONES.map((m) => ({ ...m })),
  };
}

export function resetState(): AppState {
  const state = getDefaultState();
  saveState(state);
  return state;
}
