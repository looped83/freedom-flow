import { lazy, Suspense, useState } from 'react';
import type { SortMode } from './types';
import { useAppState } from './hooks/useAppState';
import { Header } from './components/layout/Header';
import { TabNav, type Tab } from './components/layout/TabNav';
import { Dashboard } from './components/dashboard/Dashboard';

const GoalList = lazy(() =>
  import('./components/goals/GoalList').then(({ GoalList: C }) => ({ default: C })),
);
const PortfolioForm = lazy(() =>
  import('./components/portfolio/PortfolioForm').then(({ PortfolioForm: C }) => ({ default: C })),
);
const ProjectionView = lazy(() =>
  import('./components/dashboard/ProjectionView').then(({ ProjectionView: C }) => ({ default: C })),
);

function TabFallback() {
  return (
    <div className="flex items-center justify-center h-40" role="status" aria-label="Lade Inhalt…">
      <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  );
}

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

      <Suspense fallback={<TabFallback />}>
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
          <PortfolioForm portfolio={state.portfolio} onSave={actions.setPortfolio} />
        )}
        {tab === 'projection' && (
          <ProjectionView portfolio={state.portfolio} goals={state.goals} />
        )}
      </Suspense>
    </div>
  );
}
