import { useEffect, useMemo, useReducer } from 'react';
import type { AppState, Goal, GoalResult, Milestone, MilestoneResult, Portfolio, ProjectionInput } from '../types';
import { BONUS_GOAL_ID } from '../constants/defaultData';
import { getDefaultState, loadState, saveState } from '../utils/storage';
import { computeGoalResults, totalMonthlyCosts } from '../utils/calculations';
import { computeMilestoneResults, syncAutoMilestone } from '../utils/milestones';

type Action =
  | { type: 'PATCH_PORTFOLIO'; payload: Partial<Portfolio> }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; id: string }
  | { type: 'SET_TOTAL_EXPENSES'; payload: number }
  | { type: 'ADD_MILESTONE'; payload: Milestone }
  | { type: 'UPDATE_MILESTONE'; payload: Milestone }
  | { type: 'DELETE_MILESTONE'; id: string }
  | { type: 'RESET' };

/** Apply a goal change and keep the auto-managed expenses milestone in sync. */
function withGoals(state: AppState, goals: Goal[]): AppState {
  return { ...state, goals, milestones: syncAutoMilestone(state.milestones, totalMonthlyCosts(goals)) };
}

/** Adjust or create the Bonus goal so that the goal sum matches `desired`.
 *  If `desired` is at or below the non-Bonus sum, the Bonus is removed and
 *  the desired total is silently rejected ("Eingabe ignorieren"). */
function applyDesiredTotal(state: AppState, desired: number): AppState {
  const withoutBonus = state.goals.filter((g) => g.id !== BONUS_GOAL_ID);
  const baseSum = totalMonthlyCosts(withoutBonus);

  if (desired <= baseSum) {
    return withoutBonus.length === state.goals.length ? state : withGoals(state, withoutBonus);
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
  return withGoals(
    state,
    existing
      ? state.goals.map((g) => (g.id === BONUS_GOAL_ID ? bonus : g))
      : [...state.goals, bonus],
  );
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'PATCH_PORTFOLIO':
      return { ...state, portfolio: { ...state.portfolio, ...action.payload } };
    case 'ADD_GOAL':
      return withGoals(state, [...state.goals, action.payload]);
    case 'UPDATE_GOAL':
      return withGoals(state, state.goals.map((g) => (g.id === action.payload.id ? action.payload : g)));
    case 'DELETE_GOAL':
      return withGoals(state, state.goals.filter((g) => g.id !== action.id));
    case 'SET_TOTAL_EXPENSES':
      return applyDesiredTotal(state, action.payload);
    case 'ADD_MILESTONE':
      return { ...state, milestones: [...state.milestones, action.payload] };
    case 'UPDATE_MILESTONE':
      return {
        ...state,
        milestones: state.milestones.map((m) => (m.id === action.payload.id ? action.payload : m)),
      };
    case 'DELETE_MILESTONE':
      return { ...state, milestones: state.milestones.filter((m) => m.id !== action.id) };
    case 'RESET':
      return getDefaultState();
    default:
      return state;
  }
}

export interface AppActions {
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

  // Only the scalars that drive projections — editing lifetime fields does
  // not invalidate goal/milestone results or the timeline.
  const { monthlyIncome, dividendYield, dividendGrowth, monthlySavings, horizonYears } = state.portfolio;
  const projection = useMemo<ProjectionInput>(
    () => ({ monthlyIncome, dividendYield, dividendGrowth, monthlySavings, horizonYears }),
    [monthlyIncome, dividendYield, dividendGrowth, monthlySavings, horizonYears],
  );

  const totalExpenses = useMemo(() => totalMonthlyCosts(state.goals), [state.goals]);

  const goalResults = useMemo<GoalResult[]>(
    () => computeGoalResults(state.goals, projection),
    [state.goals, projection],
  );

  // All milestones evaluated (Dashboard).
  const milestoneResults = useMemo<MilestoneResult[]>(
    () => computeMilestoneResults(state.milestones, projection),
    [state.milestones, projection],
  );

  // Milestones up to the expense total (Timeline, Setup).
  const visibleMilestoneResults = useMemo<MilestoneResult[]>(
    () => milestoneResults.filter((r) => r.type !== 'dividend' || (r.dividendTarget ?? 0) <= totalExpenses),
    [milestoneResults, totalExpenses],
  );

  return { state, actions, projection, totalExpenses, goalResults, milestoneResults, visibleMilestoneResults };
}
