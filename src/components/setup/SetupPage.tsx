import { useEffect, useState } from 'react';
import type { GoalResult, MilestoneResult, Portfolio } from '../../types';
import type { AppActions } from '../../hooks/useAppState';
import type { SetupTarget } from '../dashboard/Dashboard';
import { GoalList } from '../goals/GoalList';
import { MilestoneList } from '../milestones/MilestoneList';
import { PortfolioForm } from '../portfolio/PortfolioForm';
import { Page } from '../layout/Page';
import { IconSetup } from '../ui/Icons';

type SetupTab = 'goals' | 'milestones' | 'portfolio';

const TABS: { id: SetupTab; label: string }[] = [
  { id: 'goals',      label: 'Ausgaben'     },
  { id: 'milestones', label: 'Meilensteine' },
  { id: 'portfolio',  label: 'Dividenden'   },
];

export interface SetupFocus {
  target: SetupTarget;
  id: string;
}

interface SetupPageProps {
  goalResults: GoalResult[];
  totalExpenses: number;
  visibleMilestoneResults: MilestoneResult[];
  portfolio: Portfolio;
  actions: AppActions;
  /** Entry to expand and scroll to (deep link from the Dashboard). */
  focus: SetupFocus | null;
  onFocusConsumed: () => void;
}

export function SetupPage({ goalResults, totalExpenses, visibleMilestoneResults, portfolio, actions, focus, onFocusConsumed }: SetupPageProps) {
  const [active, setActive] = useState<SetupTab>('goals');
  // Bumping a tab's key when leaving it remounts the panel → filters, sort
  // and open forms are reset on return.
  const [tabKeys, setTabKeys] = useState<Record<SetupTab, number>>({ goals: 0, milestones: 0, portfolio: 0 });

  function changeTab(next: SetupTab) {
    if (next === active) return;
    setTabKeys((prev) => ({ ...prev, [active]: prev[active] + 1 }));
    setActive(next);
  }

  useEffect(() => {
    if (focus) setActive(focus.target === 'goal' ? 'goals' : 'milestones');
  }, [focus]);

  function handleTabKey(e: React.KeyboardEvent) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const idx = TABS.findIndex((t) => t.id === active);
    const next = TABS[(idx + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length].id;
    changeTab(next);
    document.getElementById(`setup-tab-${next}`)?.focus();
  }

  return (
    <Page icon={<IconSetup className="w-5 h-5" />} title="Setup">
      <div role="tablist" aria-label="Setup-Bereiche" onKeyDown={handleTabKey} className="flex rounded-xl bg-surface-2 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`setup-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            aria-controls={`setup-panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => changeTab(t.id)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              active === t.id ? 'bg-surface-1 text-white shadow-sm' : 'text-white/50 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id="setup-panel-goals" role="tabpanel" aria-labelledby="setup-tab-goals" hidden={active !== 'goals'}>
        <GoalList
          key={tabKeys.goals}
          goalResults={goalResults}
          total={totalExpenses}
          onAdd={actions.addGoal}
          onUpdate={actions.updateGoal}
          onDelete={actions.deleteGoal}
          focusId={focus?.target === 'goal' ? focus.id : null}
          onFocusConsumed={onFocusConsumed}
        />
      </div>
      <div id="setup-panel-milestones" role="tabpanel" aria-labelledby="setup-tab-milestones" hidden={active !== 'milestones'}>
        <MilestoneList
          key={tabKeys.milestones}
          milestoneResults={visibleMilestoneResults}
          onAdd={actions.addMilestone}
          onUpdate={actions.updateMilestone}
          onDelete={actions.deleteMilestone}
          focusId={focus?.target === 'milestone' ? focus.id : null}
          onFocusConsumed={onFocusConsumed}
        />
      </div>
      <div id="setup-panel-portfolio" role="tabpanel" aria-labelledby="setup-tab-portfolio" hidden={active !== 'portfolio'}>
        <PortfolioForm key={tabKeys.portfolio} portfolio={portfolio} onPatch={actions.patchPortfolio} onReset={actions.reset} />
      </div>
    </Page>
  );
}
