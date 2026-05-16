import { useState } from 'react';
import type { Goal, SortMode } from '../../types';
import { sortGoals, totalMonthlyCosts } from '../../utils/calculations';
import { formatEuro } from '../../utils/formatting';
import { GoalForm } from './GoalForm';

interface GoalListProps {
  goals: Goal[];
  sortMode: SortMode;
  onAdd: (g: Goal) => void;
  onUpdate: (g: Goal) => void;
  onDelete: (id: string) => void;
}

export function GoalList({ goals, sortMode, onAdd, onUpdate, onDelete }: GoalListProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const sorted = sortGoals(goals, sortMode);
  const total = totalMonthlyCosts(goals);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Deine Ziele</h1>
          <p className="text-sm text-white/40">Gesamt: {formatEuro(total)} / Monat</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="bg-accent text-surface font-semibold px-4 py-2 rounded-xl text-sm hover:bg-accent-dim transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Neues Ziel hinzufügen"
        >
          + Ziel
        </button>
      </div>

      {adding && (
        <div className="bg-surface-1 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Neues Ziel</h2>
          <GoalForm
            onSave={(g) => { onAdd(g); setAdding(false); }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      <ul className="space-y-2" role="list" aria-label="Zielliste">
        {sorted.map((goal) => (
          <li key={goal.id} className="bg-surface-1 rounded-xl">
            {editingId === goal.id ? (
              <div className="p-4">
                <GoalForm
                  initial={goal}
                  onSave={(g) => { onUpdate(g); setEditingId(null); }}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-xl flex-shrink-0" aria-hidden="true">{goal.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{goal.name}</p>
                  <p className="text-xs text-white/40">{goal.category}</p>
                </div>
                <span className="text-sm font-semibold text-white/80 flex-shrink-0">
                  {formatEuro(goal.monthlyAmount)}
                </span>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => setEditingId(goal.id)}
                    aria-label={`${goal.name} bearbeiten`}
                    className="p-1.5 text-white/30 hover:text-white/70 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                  >
                    ✏️
                  </button>
                  {confirmDelete === goal.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => { onDelete(goal.id); setConfirmDelete(null); }}
                        aria-label={`${goal.name} wirklich löschen`}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                      >
                        Löschen
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        aria-label="Abbrechen"
                        className="text-xs text-white/40 hover:text-white/70 px-2 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(goal.id)}
                      aria-label={`${goal.name} löschen`}
                      className="p-1.5 text-white/30 hover:text-red-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
