import { useEffect, useMemo, useReducer } from 'react';
import type { AppState, Goal, GoalResult, Milestone, MilestoneResult, Portfolio } from '../types';
import { AUTO_EXPENSES_MS_ID, BONUS_GOAL_ID } from '../constants/defaultData';
import { loadState, resetState, saveState } from '../utils/storage';
import { computeGoalResults } from '../utils/calculations';
import { computeMilestoneResults } from '../utils/milestones';

type Action =
  | { type: 'SET_PORTFOLIO'; payload: Portfolio }
  | { type: 'PATCH_PORTFOLIO'; payload: Partial<Portfolio> }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; id: string }
  | { type: 'SET_TOTAL_EXPENSES'; payload: number }
  | { type: 'ADD_MILESTONE'; payload: Milestone }
  | { type: 'UPDATE_MILESTONE'; payload: Milestone }
  | { type: 'DELETE_MILESTONE'; id: string }
  | { type: 'RESET' };

function sumGoals(goals: Goal[]): number {
  let s = 0;
  for (const g of goals) s += g.monthlyAmount;
  return s;
}

/** Re-align the auto-managed "Alle Ausgaben / Monat" milestone with the
 *  current goal sum. Does nothing if the user deleted that milestone. */
function syncAutoMilestone(state: AppState): AppState {
  const total = sumGoals(state.goals);
  const ms = state.milestones.find((m) => m.id === AUTO_EXPENSES_MS_ID);
  if (!ms || ms.type !== 'dividend' || ms.dividendTarget === total) return state;
  return {
    ...state,
    milestones: state.milestones.map((m) =>
      m.id === AUTO_EXPENSES_MS_ID ? { ...m, dividendTarget: total } : m,
    ),
  };
}

/** Adjust or create the Bonus goal so that the goal sum matches `desired`.
 *  If `desired` is at or below the non-Bonus sum, the Bonus is removed and
 *  the desired total is silently rejected ("Eingabe ignorieren"). */
function applyDesiredTotal(state: AppState, desired: number): AppState {
  const withoutBonus = state.goals.filter((g) => g.id !== BONUS_GOAL_ID);
  const baseSum = sumGoals(withoutBonus);

  if (desired <= baseSum) {
    if (withoutBonus.length === state.goals.length) return state; // no Bonus to remove
    return { ...state, goals: withoutBonus };
  }

  const bonusAmount = desired - baseSum;
  const existing = state.goals.find((g) => g.id === BONUS_GOAL_ID);
  if (existing && existing.monthlyAmount === bonusAmount) return state;

  const bonus: Goal = {
    id: BONUS_GOAL_ID,
    name: 'Bonus',
    monthlyAmount: bonusAmount,
    category: 'Geschenke',
  };
  return {
    ...state,
    goals: existing
      ? state.goals.map((g) => (g.id === BONUS_GOAL_ID ? bonus : g))
      : [...state.goals, bonus],
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PORTFOLIO':
      return { ...state, portfolio: action.payload };
    case 'ADD_GOAL':
      return syncAutoMilestone({ ...state, goals: [...state.goals, action.payload] });
    case 'UPDATE_GOAL':
      return syncAutoMilestone({
        ...state,
        goals: state.goals.map((g) => (g.id === action.payload.id ? action.payload : g)),
      });
    case 'DELETE_GOAL':
      return syncAutoMilestone({ ...state, goals: state.goals.filter((g) => g.id !== action.id) });
    case 'SET_TOTAL_EXPENSES':
      return syncAutoMilestone(applyDesiredTotal(state, action.payload));
    case 'ADD_MILESTONE':
      return { ...state, milestones: [...state.milestones, action.payload] };
    case 'UPDATE_MILESTONE':
      return {
        ...state,
        milestones: state.milestones.map((m) => (m.id === action.payload.id ? action.payload : m)),
      };
    case 'DELETE_MILESTONE':
      return { ...state, milestones: state.milestones.filter((m) => m.id !== action.id) };
    case 'PATCH_PORTFOLIO':
      return { ...state, portfolio: { ...state.portfolio, ...action.payload } };
    case 'RESET':
      return resetState();
    default:
      return state;
  }
}

export type { GoalResult, MilestoneResult };

export interface AppActions {
  setPortfolio: (p: Portfolio) => void;
  patchPortfolio: (partial: Partial<Portfolio>) => void;
  addGoal: (g: Goal) => void;
  updateGoal: (g: Goal) => void;
  deleteGoal: (id: string) => void;
  setTotalExpenses: (v: number) => void;
  addMilestone: (m: Milestone) => void;
  updateMilestone: (m: Milestone) => void;
  deleteMilestone: (id: string) => void;
  reset: () => void;
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    const id = setTimeout(() => saveState(state), 500);
    return () => clearTimeout(id);
  }, [state]);

  // `dispatch` is stable for the lifetime of the component, so the entire
  // actions object can be built once. A stable reference unlocks React.memo
  // on every child that takes individual actions as props.
  const actions = useMemo<AppActions>(() => ({
    setPortfolio:     (p)  => dispatch({ type: 'SET_PORTFOLIO',      payload: p  }),
    patchPortfolio:   (partial) => dispatch({ type: 'PATCH_PORTFOLIO', payload: partial }),
    addGoal:          (g)  => dispatch({ type: 'ADD_GOAL',           payload: g  }),
    updateGoal:       (g)  => dispatch({ type: 'UPDATE_GOAL',        payload: g  }),
    deleteGoal:       (id) => dispatch({ type: 'DELETE_GOAL',        id }),
    setTotalExpenses: (v)  => dispatch({ type: 'SET_TOTAL_EXPENSES', payload: v  }),
    addMilestone:     (m)  => dispatch({ type: 'ADD_MILESTONE',      payload: m  }),
    updateMilestone:  (m)  => dispatch({ type: 'UPDATE_MILESTONE',   payload: m  }),
    deleteMilestone:  (id) => dispatch({ type: 'DELETE_MILESTONE',   id }),
    reset:            ()   => dispatch({ type: 'RESET' }),
  }), []);

  const { monthlyIncome, dividendGrowth, dividendYield, monthlySavings } = state.portfolio;

  // Computed once here; deps are the specific portfolio scalars that affect
  // projections — unrelated fields (lifetimeDividends, horizonYears, etc.)
  // changing won't cause an unnecessary recompute.
  const goalResults = useMemo<GoalResult[]>(
    () => computeGoalResults(state.goals, monthlyIncome, state.portfolio),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.goals, monthlyIncome, dividendGrowth, dividendYield, monthlySavings],
  );

  // All milestones evaluated (for Dashboard/LifeUnlocks).
  const milestoneResults = useMemo<MilestoneResult[]>(
    () => computeMilestoneResults(state.milestones, state.portfolio),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.milestones, monthlyIncome, dividendGrowth, dividendYield, monthlySavings],
  );

  // Expense-filtered view (for Timeline, MilestoneList): filter the already-computed
  // milestoneResults instead of running computeMilestoneResults a second time.
  const visibleMilestoneResults = useMemo<MilestoneResult[]>(() => {
    const total = state.goals.reduce((s, g) => s + g.monthlyAmount, 0);
    return milestoneResults.filter((r) => r.type !== 'dividend' || (r.dividendTarget ?? 0) <= total);
  }, [milestoneResults, state.goals]);

  return { state, actions, goalResults, milestoneResults, visibleMilestoneResults };
}
