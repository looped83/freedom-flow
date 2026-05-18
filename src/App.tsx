import { lazy, Suspense, useCallback, useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { Header } from './components/layout/Header';
import { TabNav, type Tab } from './components/layout/TabNav';
import { Dashboard } from './components/dashboard/Dashboard';

const FreedomTimeline = lazy(async () => {
  const { FreedomTimeline } = await import('./components/timeline/FreedomTimeline');
  return { default: FreedomTimeline };
});
const SetupPage = lazy(async () => {
  const { SetupPage } = await import('./components/setup/SetupPage');
  return { default: SetupPage };
});
const LiveFlow = lazy(async () => {
  const { LiveFlow } = await import('./components/liveflow/LiveFlow');
  return { default: LiveFlow };
});

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

  // Tapping a tab — whether it's a new one or the active one — always
  // returns the user to the top of the page. Same convention as iOS.
  const handleTabChange = useCallback((next: Tab) => {
    setTab(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGoalClick = useCallback((id: string) => {
    setFocusGoalId(id);
    setTab('setup');
  }, []);

  const handleReset = useCallback(() => {
    if (confirm('Alle Daten zurücksetzen?')) {
      actions.reset();
    }
  }, [actions]);

  const handleIncomeChange = useCallback((v: number) => {
    actions.patchPortfolio({ monthlyIncome: v });
  }, [actions]);

  return (
    <div className="min-h-screen bg-surface text-white pb-28 sm:pb-0">
      <Header />
      <TabNav active={tab} onChange={handleTabChange} />

      {tab === 'dashboard' && (
        <Dashboard
          portfolio={state.portfolio}
          goals={state.goals}
          milestones={state.milestones}
          onIncomeChange={handleIncomeChange}
          onTotalChange={actions.setTotalExpenses}
          onGoalClick={handleGoalClick}
        />
      )}

      <Suspense fallback={<TabFallback />}>
        {tab === 'timeline' && (
          <FreedomTimeline portfolio={state.portfolio} goals={state.goals} milestones={state.milestones} />
        )}
        {tab === 'liveflow' && (
          <LiveFlow portfolio={state.portfolio} goals={state.goals} />
        )}
        {tab === 'setup' && (
          <SetupPage
            goals={state.goals}
            milestones={state.milestones}
            portfolio={state.portfolio}
            onAdd={actions.addGoal}
            onUpdate={actions.updateGoal}
            onDelete={actions.deleteGoal}
            onAddMilestone={actions.addMilestone}
            onUpdateMilestone={actions.updateMilestone}
            onDeleteMilestone={actions.deleteMilestone}
            onSavePortfolio={actions.setPortfolio}
            onReset={handleReset}
            focusGoalId={focusGoalId}
            onFocusConsumed={() => setFocusGoalId(null)}
          />
        )}
      </Suspense>
    </div>
  );
}
