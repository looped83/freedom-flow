import { lazy, Suspense, useState } from 'react';
import type { DisplayFilter } from './types';
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
  // Default: expensive goals shown first
  const [displayFilter, setDisplayFilter] = useState<DisplayFilter>({ mode: 'amount', dir: 'desc' });
  const { state, actions } = useAppState();

  function handleFilterChange(mode: DisplayFilter['mode']) {
    setDisplayFilter((prev) => ({
      mode,
      // Clicking the active filter toggles direction; new filter starts desc
      dir: prev.mode === mode ? (prev.dir === 'desc' ? 'asc' : 'desc') : 'desc',
    }));
  }

  function handleReset() {
    if (confirm('Alle Daten auf die 2026-Beispieldaten zurücksetzen?')) {
      actions.reset();
    }
  }

  return (
    <div className="min-h-screen bg-surface text-white pb-16 sm:pb-0">
      <Header onReset={handleReset} />
      <TabNav active={tab} onChange={setTab} />

      {tab === 'dashboard' && (
        <Dashboard
          portfolio={state.portfolio}
          goals={state.goals}
          displayFilter={displayFilter}
          onFilterChange={handleFilterChange}
        />
      )}

      <Suspense fallback={<TabFallback />}>
        {tab === 'goals' && (
          <GoalList
            goals={state.goals}
            onAdd={actions.addGoal}
            onUpdate={actions.updateGoal}
            onDelete={actions.deleteGoal}
          />
        )}
        {tab === 'projection' && (
          <ProjectionView portfolio={state.portfolio} goals={state.goals} />
        )}
        {tab === 'portfolio' && (
          <PortfolioForm portfolio={state.portfolio} onSave={actions.setPortfolio} />
        )}
      </Suspense>
    </div>
  );
}
