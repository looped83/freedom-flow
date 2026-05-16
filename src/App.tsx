import { lazy, Suspense, useState } from 'react';
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
const LiveFlow = lazy(() =>
  import('./components/liveflow/LiveFlow').then(({ LiveFlow: C }) => ({ default: C })),
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
  const [focusGoalId, setFocusGoalId] = useState<string | null>(null);
  const { state, actions } = useAppState();

  function handleGoalClick(id: string) {
    setFocusGoalId(id);
    setTab('setup');
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
          onIncomeChange={handleIncomeChange}
          onGoalClick={handleGoalClick}
        />
      )}

      <Suspense fallback={<TabFallback />}>
        {tab === 'timeline' && (
          <FreedomTimeline portfolio={state.portfolio} goals={state.goals} />
        )}
        {tab === 'liveflow' && (
          <LiveFlow portfolio={state.portfolio} />
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
            focusGoalId={focusGoalId}
          />
        )}
      </Suspense>
    </div>
  );
}
