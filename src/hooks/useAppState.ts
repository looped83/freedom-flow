import { useCallback, useEffect, useReducer } from 'react';
import type { AppState, Goal, Milestone, Portfolio } from '../types';
import { loadState, resetState, saveState } from '../utils/storage';

type Action =
  | { type: 'SET_PORTFOLIO'; payload: Portfolio }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; id: string }
  | { type: 'ADD_MILESTONE'; payload: Milestone }
  | { type: 'UPDATE_MILESTONE'; payload: Milestone }
  | { type: 'DELETE_MILESTONE'; id: string }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PORTFOLIO':
      return { ...state, portfolio: action.payload };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map((g) => (g.id === action.payload.id ? action.payload : g)),
      };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter((g) => g.id !== action.id) };
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
      return resetState();
    default:
      return state;
  }
}

export interface AppActions {
  setPortfolio: (p: Portfolio) => void;
  addGoal: (g: Goal) => void;
  updateGoal: (g: Goal) => void;
  deleteGoal: (id: string) => void;
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

  const actions: AppActions = {
    setPortfolio: useCallback((p: Portfolio) => dispatch({ type: 'SET_PORTFOLIO', payload: p }), []),
    addGoal: useCallback((g: Goal) => dispatch({ type: 'ADD_GOAL', payload: g }), []),
    updateGoal: useCallback((g: Goal) => dispatch({ type: 'UPDATE_GOAL', payload: g }), []),
    deleteGoal: useCallback((id: string) => dispatch({ type: 'DELETE_GOAL', id }), []),
    addMilestone: useCallback((m: Milestone) => dispatch({ type: 'ADD_MILESTONE', payload: m }), []),
    updateMilestone: useCallback((m: Milestone) => dispatch({ type: 'UPDATE_MILESTONE', payload: m }), []),
    deleteMilestone: useCallback((id: string) => dispatch({ type: 'DELETE_MILESTONE', id }), []),
    reset: useCallback(() => dispatch({ type: 'RESET' }), []),
  };

  return { state, actions };
}
