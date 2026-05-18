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
  const [visitedTabs, setVisitedTabs] = useState<Set<Tab>>(() => new Set<Tab>());
  const [focusGoalId, setFocusGoalId] = useState<string | null>(null);
  const { state, actions } = useAppState();

  const handleTabChange = useCallback((next: Tab) => {
    setTab(next);
    setVisitedTabs((prev) => prev.has(next) ? prev : new Set([...prev, next]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGoalClick = useCallback((id: string) => {
    setFocusGoalId(id);
    setTab('setup');
    setVisitedTabs((prev) => prev.has('setup') ? prev : new Set([...prev, 'setup']));
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

      {/* Dashboard always mounted — no remount on tab switch, useMemo cache survives */}
      <div hidden={tab !== 'dashboard'}>
        <Dashboard
          portfolio={state.portfolio}
          goals={state.goals}
          milestones={state.milestones}
          onIncomeChange={handleIncomeChange}
          onTotalChange={actions.setTotalExpenses}
          onGoalClick={handleGoalClick}
        />
      </div>

      {/* Lazy tabs: JS chunk loads on first visit, component stays mounted (hidden) on return.
          Separate Suspense boundaries prevent one tab's loading from hiding another. */}
      <Suspense fallback={tab === 'timeline' ? <TabFallback /> : null}>
        {visitedTabs.has('timeline') && (
          <div hidden={tab !== 'timeline'}>
            <FreedomTimeline portfolio={state.portfolio} goals={state.goals} milestones={state.milestones} />
          </div>
        )}
      </Suspense>
      <Suspense fallback={tab === 'liveflow' ? <TabFallback /> : null}>
        {visitedTabs.has('liveflow') && (
          <div hidden={tab !== 'liveflow'}>
            <LiveFlow portfolio={state.portfolio} />
          </div>
        )}
      </Suspense>
      <Suspense fallback={tab === 'setup' ? <TabFallback /> : null}>
        {visitedTabs.has('setup') && (
          <div hidden={tab !== 'setup'}>
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
          </div>
        )}
      </Suspense>
    </div>
  );
}
