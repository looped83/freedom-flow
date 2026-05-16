import { useState } from 'react';
import type { SortMode } from './types';
import { useAppState } from './hooks/useAppState';
import { Header } from './components/layout/Header';
import { TabNav, type Tab } from './components/layout/TabNav';
import { Dashboard } from './components/dashboard/Dashboard';
import { GoalList } from './components/goals/GoalList';
import { PortfolioForm } from './components/portfolio/PortfolioForm';
import { ProjectionView } from './components/dashboard/ProjectionView';

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sortMode, setSortMode] = useState<SortMode>('amount');
  const { state, actions } = useAppState();

  function handleReset() {
    if (confirm('Alle Daten auf die 2026-Beispieldaten zurücksetzen?')) {
      actions.reset();
    }
  }

  return (
    <div className="min-h-screen bg-surface text-white">
      <Header onReset={handleReset} />
      <TabNav active={tab} onChange={setTab} />

      {tab === 'dashboard' && (
        <Dashboard
          portfolio={state.portfolio}
          goals={state.goals}
          sortMode={sortMode}
          onSortChange={setSortMode}
        />
      )}
      {tab === 'goals' && (
        <GoalList
          goals={state.goals}
          sortMode={sortMode}
          onAdd={actions.addGoal}
          onUpdate={actions.updateGoal}
          onDelete={actions.deleteGoal}
        />
      )}
      {tab === 'portfolio' && (
        <PortfolioForm
          portfolio={state.portfolio}
          onSave={actions.setPortfolio}
        />
      )}
      {tab === 'projection' && (
        <ProjectionView
          portfolio={state.portfolio}
          goals={state.goals}
        />
      )}
    </div>
  );
}
