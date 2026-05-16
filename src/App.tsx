import { lazy, Suspense, useState } from 'react';
import type { DisplayFilter } from './types';
import { useAppState } from './hooks/useAppState';
import { Header } from './components/layout/Header';
import { TabNav, type Tab } from './components/layout/TabNav';
import { Dashboard } from './components/dashboard/Dashboard';

const FreedomTimeline = lazy(() =>
  import('./components/timeline/FreedomTimeline').then(({ FreedomTimeline: C }) => ({ default: C })),
);
const SetupPage = lazy(() =>
  import('./components/setup/SetupPage').then(({ SetupPage: C }) => ({ default: C })),
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
  const [displayFilter, setDisplayFilter] = useState<DisplayFilter>({ mode: 'amount', dir: 'desc' });
  const { state, actions } = useAppState();

  function handleFilterChange(mode: DisplayFilter['mode']) {
    setDisplayFilter((prev) => ({
      mode,
      dir: prev.mode === mode ? (prev.dir === 'desc' ? 'asc' : 'desc') : 'desc',
    }));
  }

  function handleReset() {
    if (confirm('Alle Daten zurücksetzen?')) {
      actions.reset();
      setTab('dashboard');
    }
  }

  function handleIncomeChange(v: number) {
    actions.setPortfolio({ ...state.portfolio, monthlyIncome: v });
  }

  return (
    <div className="min-h-screen bg-surface text-white pb-28 sm:pb-0">
      <Header />
      <TabNav active={tab} onChange={setTab} />

      {tab === 'dashboard' && (
        <Dashboard
          portfolio={state.portfolio}
          goals={state.goals}
          displayFilter={displayFilter}
          onFilterChange={handleFilterChange}
          onIncomeChange={handleIncomeChange}
        />
      )}

      <Suspense fallback={<TabFallback />}>
        {tab === 'timeline' && (
          <FreedomTimeline portfolio={state.portfolio} goals={state.goals} />
        )}
        {tab === 'setup' && (
          <SetupPage
            goals={state.goals}
            portfolio={state.portfolio}
            onAdd={actions.addGoal}
            onUpdate={actions.updateGoal}
            onDelete={actions.deleteGoal}
            onSavePortfolio={actions.setPortfolio}
            onReset={handleReset}
          />
        )}
      </Suspense>
    </div>
  );
}
