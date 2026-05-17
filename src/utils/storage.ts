import type { AppState, Goal } from '../types';
import { DEFAULT_GOALS, DEFAULT_MILESTONES, DEFAULT_PORTFOLIO } from '../constants/defaultData';

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
    // Migration: initialise milestones list for older saves
    if (!Array.isArray((parsed as Partial<AppState>).milestones)) {
      parsed.milestones = DEFAULT_MILESTONES.map((m) => ({ ...m }));
    }
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
