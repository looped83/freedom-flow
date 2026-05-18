import { useEffect, useState } from 'react';
import type { Goal, GoalResult, Milestone, MilestoneResult, Portfolio } from '../../types';
import { GoalList } from '../goals/GoalList';
import { MilestoneList } from '../milestones/MilestoneList';
import { PortfolioForm } from '../portfolio/PortfolioForm';
import { PageHeader } from '../layout/PageHeader';

type SetupTab = 'goals' | 'milestones' | 'portfolio';

interface SetupPageProps {
  goals: Goal[];
  goalResults: GoalResult[];
  visibleMilestoneResults: MilestoneResult[];
  portfolio: Portfolio;
  onAdd: (g: Goal) => void;
  onUpdate: (g: Goal) => void;
  onDelete: (id: string) => void;
  onAddMilestone: (m: Milestone) => void;
  onUpdateMilestone: (m: Milestone) => void;
  onDeleteMilestone: (id: string) => void;
  onSavePortfolio: (p: Portfolio) => void;
  onReset: () => void;
  focusGoalId?: string | null;
  onFocusConsumed?: () => void;
}

const SETUP_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

export function SetupPage({
  goals,
  goalResults,
  visibleMilestoneResults,
  portfolio,
  onAdd,
  onUpdate,
  onDelete,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  onSavePortfolio,
  onReset,
  focusGoalId,
  onFocusConsumed,
}: SetupPageProps) {
  const [active, setActive] = useState<SetupTab>('goals');

  // When navigating here via a goal click, always surface the Goals sub-tab.
  useEffect(() => {
    if (focusGoalId) setActive('goals');
  }, [focusGoalId]);

  return (
    <main className="max-w-4xl mx-auto">
      <div className="px-4 pt-6 pb-0">
        <PageHeader icon={SETUP_ICON} title="Setup" />
        <div
          className="flex gap-0 bg-surface-2 rounded-xl p-1"
          role="tablist"
          aria-label="Setup-Bereiche"
        >
          {([
            { id: 'goals',      label: 'Ausgaben'      },
            { id: 'milestones', label: 'Meilensteine'  },
            { id: 'portfolio',  label: 'Portfolio'     },
          ] as { id: SetupTab; label: string }[]).map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={active === t.id}
              onClick={() => setActive(t.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                active === t.id
                  ? 'bg-surface-1 text-white shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* All three panels stay mounted — CSS hidden preserves state between sub-tab switches */}
      <div role="tabpanel">
        <div hidden={active !== 'goals'}>
          <GoalList goals={goals} goalResults={goalResults} onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete} focusGoalId={focusGoalId} onFocusConsumed={onFocusConsumed} />
        </div>
        <div hidden={active !== 'milestones'}>
          <MilestoneList
            milestoneResults={visibleMilestoneResults}
            onAdd={onAddMilestone}
            onUpdate={onUpdateMilestone}
            onDelete={onDeleteMilestone}
          />
        </div>
        <div hidden={active !== 'portfolio'}>
          <PortfolioForm portfolio={portfolio} onSave={onSavePortfolio} onReset={onReset} />
        </div>
      </div>
    </main>
  );
}
