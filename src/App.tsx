import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { Header } from './components/layout/Header';
import { TabNav, type Tab } from './components/layout/TabNav';
import { Dashboard, type SetupTarget } from './components/dashboard/Dashboard';
import type { SetupFocus } from './components/setup/SetupPage';

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
    <div className="flex h-40 items-center justify-center" role="status" aria-label="Lade Inhalt…">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [visitedTabs, setVisitedTabs] = useState<ReadonlySet<Tab>>(() => new Set<Tab>(['dashboard']));
  const [focus, setFocus] = useState<SetupFocus | null>(null);
  const [setupResetKey, setSetupResetKey] = useState(0);
  const prevTabRef = useRef<Tab>(tab);
  const {
    state, actions, projection, totalExpenses, goalResults, milestoneResults, visibleMilestoneResults,
  } = useAppState();

  // Remount SetupPage when navigating away so nothing stays expanded on return.
  useEffect(() => {
    if (prevTabRef.current === 'setup' && tab !== 'setup') setSetupResetKey((k) => k + 1);
    prevTabRef.current = tab;
  }, [tab]);

  const showTab = useCallback((next: Tab, behavior: ScrollBehavior = 'smooth') => {
    setTab(next);
    setVisitedTabs((prev) => (prev.has(next) ? prev : new Set([...prev, next])));
    window.scrollTo({ top: 0, behavior });
  }, []);

  const openInSetup = useCallback((target: SetupTarget, id: string) => {
    setFocus({ target, id });
    showTab('setup', 'auto');
  }, [showTab]);

  const clearFocus = useCallback(() => setFocus(null), []);
  const handleIncomeChange = useCallback((v: number) => actions.patchPortfolio({ monthlyIncome: v }), [actions]);

  return (
    <div className="pb-nav min-h-screen bg-surface text-white sm:pb-0">
      <Header />
      <TabNav active={tab} onChange={showTab} />

      {/* Dashboard always mounted — no remount on tab switch, useMemo cache survives */}
      <div hidden={tab !== 'dashboard'}>
        <Dashboard
          projection={projection}
          totalExpenses={totalExpenses}
          goalResults={goalResults}
          milestoneResults={milestoneResults}
          onIncomeChange={handleIncomeChange}
          onTotalChange={actions.setTotalExpenses}
          onOpen={openInSetup}
        />
      </div>

      {/* Lazy tabs: JS chunk loads on first visit, component stays mounted (hidden) on return.
          Separate Suspense boundaries prevent one tab's loading from hiding another. */}
      <Suspense fallback={tab === 'timeline' ? <TabFallback /> : null}>
        {visitedTabs.has('timeline') && (
          <div hidden={tab !== 'timeline'}>
            <FreedomTimeline projection={projection} goals={state.goals} visibleMilestoneResults={visibleMilestoneResults} />
          </div>
        )}
      </Suspense>
      <Suspense fallback={tab === 'liveflow' ? <TabFallback /> : null}>
        {visitedTabs.has('liveflow') && (
          <div hidden={tab !== 'liveflow'}>
            <LiveFlow portfolio={state.portfolio} active={tab === 'liveflow'} />
          </div>
        )}
      </Suspense>
      <Suspense fallback={tab === 'setup' ? <TabFallback /> : null}>
        {visitedTabs.has('setup') && (
          <div hidden={tab !== 'setup'}>
            <SetupPage
              key={setupResetKey}
              goalResults={goalResults}
              totalExpenses={totalExpenses}
              visibleMilestoneResults={visibleMilestoneResults}
              portfolio={state.portfolio}
              actions={actions}
              focus={focus}
              onFocusConsumed={clearFocus}
            />
          </div>
        )}
      </Suspense>
    </div>
  );
}
