import { useState } from 'react';
import type { Goal, Portfolio } from '../../types';
import { GoalList } from '../goals/GoalList';
import { PortfolioForm } from '../portfolio/PortfolioForm';

type SetupTab = 'goals' | 'portfolio';

interface SetupPageProps {
  goals: Goal[];
  portfolio: Portfolio;
  onAdd: (g: Goal) => void;
  onUpdate: (g: Goal) => void;
  onDelete: (id: string) => void;
  onSavePortfolio: (p: Portfolio) => void;
  onReset: () => void;
}

export function SetupPage({ goals, portfolio, onAdd, onUpdate, onDelete, onSavePortfolio, onReset }: SetupPageProps) {
  const [active, setActive] = useState<SetupTab>('goals');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Sub-navigation */}
      <div className="px-4 pt-6 pb-0">
        <h1 className="text-lg font-bold text-white mb-4">Setup</h1>
        <div
          className="flex gap-0 bg-surface-2 rounded-xl p-1"
          role="tablist"
          aria-label="Setup-Bereiche"
        >
          {([
            { id: 'goals', label: 'Ziele' },
            { id: 'portfolio', label: 'Portfolio' },
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

      {/* Content */}
      <div role="tabpanel">
        {active === 'goals' ? (
          <GoalList
            goals={goals}
            onAdd={onAdd}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ) : (
          <PortfolioForm
            portfolio={portfolio}
            onSave={onSavePortfolio}
            onReset={onReset}
          />
        )}
      </div>
    </div>
  );
}
