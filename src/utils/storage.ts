import type { AppState, Goal } from '../types';
import { DEFAULT_GOALS, DEFAULT_PORTFOLIO } from '../constants/defaultData';

const STORAGE_KEY   = 'dividend-goal-tracker-v1';
const DEFAULTS_KEY  = 'dividend-goal-tracker-defaults-v1';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.portfolio || !Array.isArray(parsed.goals)) return getDefaultState();
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
  };
}

export function resetState(): AppState {
  const state = getDefaultState();
  saveState(state);
  return state;
}
