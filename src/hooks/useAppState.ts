import { useCallback, useEffect, useReducer } from 'react';
import type { AppState, Goal, Portfolio } from '../types';
import { loadState, resetState, saveState } from '../utils/storage';

type Action =
  | { type: 'SET_PORTFOLIO'; payload: Portfolio }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; id: string }
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
  reset: () => void;
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const actions: AppActions = {
    setPortfolio: useCallback((p: Portfolio) => dispatch({ type: 'SET_PORTFOLIO', payload: p }), []),
    addGoal: useCallback((g: Goal) => dispatch({ type: 'ADD_GOAL', payload: g }), []),
    updateGoal: useCallback((g: Goal) => dispatch({ type: 'UPDATE_GOAL', payload: g }), []),
    deleteGoal: useCallback((id: string) => dispatch({ type: 'DELETE_GOAL', id }), []),
    reset: useCallback(() => dispatch({ type: 'RESET' }), []),
  };

  return { state, actions };
}
