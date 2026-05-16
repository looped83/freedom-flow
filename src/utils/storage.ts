import type { AppState } from '../types';
import { DEFAULT_GOALS, DEFAULT_PORTFOLIO } from '../constants/defaultData';

const STORAGE_KEY = 'dividend-goal-tracker-v1';

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
  } catch {
    // Silently fail if storage quota exceeded
  }
}

export function getDefaultState(): AppState {
  return {
    portfolio: { ...DEFAULT_PORTFOLIO },
    goals: DEFAULT_GOALS.map((g) => ({ ...g })),
  };
}

export function resetState(): AppState {
  const state = getDefaultState();
  saveState(state);
  return state;
}
