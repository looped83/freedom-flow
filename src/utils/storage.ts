import type { AppState, Goal } from '../types';
import { AUTO_EXPENSES_MS_ID, DEFAULT_GOALS, DEFAULT_MILESTONES, DEFAULT_PORTFOLIO } from '../constants/defaultData';

const STORAGE_KEY   = 'dividend-goal-tracker-v1';
const DEFAULTS_KEY  = 'dividend-goal-tracker-defaults-v1';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.portfolio || !Array.isArray(parsed.goals)) return getDefaultState();
    // Migration: add monthlyIncome if missing from old data
    if (parsed.portfolio.monthlyIncome === undefined) {
      parsed.portfolio.monthlyIncome =
        (parsed.portfolio.value * parsed.portfolio.dividendYield) / 100 / 12;
    }
    // Migration: add lifetime dividend fields if missing from old data
    if (parsed.portfolio.lifetimeDividends === undefined) {
      parsed.portfolio.lifetimeDividends = 0;
    }
    if (parsed.portfolio.lifetimeStartYear === undefined) {
      parsed.portfolio.lifetimeStartYear = new Date().getFullYear();
    }
    // Migration: sync category of default goals so code-level changes take effect
    const defaultById = new Map(DEFAULT_GOALS.map((g) => [g.id, g]));
    parsed.goals = parsed.goals.map((g) => {
      const def = defaultById.get(g.id);
      const base = def ? { ...g, category: def.category } : g;
      // Migration: removed categories → remap to nearest replacement
      if ((base.category as string) === 'Medizin') return { ...base, category: 'Gesundheit' } as Goal;
      return base;
    });
    // Migration: add new default goals not yet in stored data
    const storedIds = new Set(parsed.goals.map((g) => g.id));
    const missing = DEFAULT_GOALS.filter((g) => !storedIds.has(g.id));
    if (missing.length > 0) parsed.goals = [...parsed.goals, ...missing];
    // Migration: initialise / extend milestones list
    if (!Array.isArray((parsed as Partial<AppState>).milestones)) {
      parsed.milestones = DEFAULT_MILESTONES.map((m) => ({ ...m }));
    } else {
      // Drop former default milestones that have since been removed
      // (themed/category targets, date targets, the static "Alle Fixkosten frei"
      // landmark — now replaced by the auto-managed AUTO_EXPENSES_MS_ID — and
      // the 2×/3×/5×/10.000 multiples).
      const REMOVED_DEFAULT_MS_IDS = new Set([
        'ms-4', 'ms-5', 'ms-6', 'ms-7', 'ms-8', 'ms-9', 'ms-10', 'ms-11', 'ms-12',
        'ms-16', 'ms-17',
        'ms-18', 'ms-19', 'ms-20', 'ms-21', 'ms-22',
      ]);
      parsed.milestones = parsed.milestones.filter((m) => !REMOVED_DEFAULT_MS_IDS.has(m.id));
      // Title migrations — only applied if the stored title still matches the
      // previous default verbatim, so user-edited titles are preserved.
      const TITLE_MIGRATIONS: Record<string, { from: string; to: string }> = {
        'ms-1': { from: 'Erste 100 € / Monat', to: '100 € / Monat' },
      };
      parsed.milestones = parsed.milestones.map((m) => {
        const rename = TITLE_MIGRATIONS[m.id];
        return rename && m.title === rename.from ? { ...m, title: rename.to } : m;
      });
      const storedMsIds = new Set(parsed.milestones.map((m) => m.id));
      const missingMs = DEFAULT_MILESTONES.filter((m) => !storedMsIds.has(m.id));
      if (missingMs.length > 0) parsed.milestones = [...parsed.milestones, ...missingMs];
    }
    // Migration: keep the auto-managed expenses milestone in sync with the
    // actual goal sum (in case persisted state drifted).
    const totalNow = parsed.goals.reduce((s, g) => s + g.monthlyAmount, 0);
    parsed.milestones = parsed.milestones.map((m) =>
      m.id === AUTO_EXPENSES_MS_ID && m.type === 'dividend' && m.dividendTarget !== totalNow
        ? { ...m, dividendTarget: totalNow }
        : m,
    );
    return parsed;
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
