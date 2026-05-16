import { useRef, useState } from 'react';
import type { Goal } from '../../types';
import { totalMonthlyCosts } from '../../utils/calculations';
import { formatEuro } from '../../utils/formatting';
import { GoalForm } from './GoalForm';

interface GoalListProps {
  goals: Goal[];
  onAdd: (g: Goal) => void;
  onUpdate: (g: Goal) => void;
  onDelete: (id: string) => void;
}

// Always: expensive → cheap
function sortDesc(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => b.monthlyAmount - a.monthlyAmount);
}

export function GoalList({ goals, onAdd, onUpdate, onDelete }: GoalListProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [inlineNameId, setInlineNameId] = useState<string | null>(null);
  const [inlineNameValue, setInlineNameValue] = useState('');
  const inlineInputRef = useRef<HTMLInputElement>(null);

  const sorted = sortDesc(goals);
  const total = totalMonthlyCosts(goals);

  function startInlineEdit(goal: Goal) {
    setEditingId(null); // close full form if open
    setInlineNameId(goal.id);
    setInlineNameValue(goal.name);
  }

  function saveInlineName(goal: Goal) {
    const trimmed = inlineNameValue.trim();
    if (trimmed && trimmed !== goal.name) {
      onUpdate({ ...goal, name: trimmed });
    }
    setInlineNameId(null);
  }

  function openFullEdit(goalId: string) {
    setInlineNameId(null); // close inline edit if open
    setEditingId(goalId);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white">Deine Ziele</h1>
          <p className="text-sm text-white/65 mt-1">Gesamt: {formatEuro(total)} / Monat</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex-shrink-0 bg-accent text-surface font-semibold px-4 py-2 rounded-xl text-sm hover:bg-accent-dim transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Neues Ziel hinzufügen"
        >
          + Ziel
        </button>
      </div>

      {adding && (
        <div className="bg-surface-1 rounded-2xl p-5 mb-4">
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
                  {inlineNameId === goal.id ? (
                    <form
                      onSubmit={(e) => { e.preventDefault(); saveInlineName(goal); }}
                      className="flex items-center"
                    >
                      <input
                        ref={inlineInputRef}
                        autoFocus
                        type="text"
                        value={inlineNameValue}
                        onChange={(e) => setInlineNameValue(e.target.value)}
                        onBlur={() => saveInlineName(goal)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') setInlineNameId(null);
                        }}
                        aria-label={`Name von ${goal.name} bearbeiten`}
                        className="w-full bg-transparent text-sm font-medium text-white border-b border-accent focus:outline-none"
                      />
                    </form>
                  ) : (
                    <button
                      onClick={() => startInlineEdit(goal)}
                      title="Klicken zum Umbenennen"
                      aria-label={`${goal.name} umbenennen`}
                      className="text-sm font-medium text-white truncate text-left w-full hover:text-accent transition-colors cursor-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                    >
                      {goal.name}
                    </button>
                  )}
                  <p className="text-xs text-white/65 mt-0.5">{goal.category}</p>
                </div>

                <span className="text-sm font-semibold text-white/80 flex-shrink-0 tabular-nums">
                  {formatEuro(goal.monthlyAmount)}
                </span>

                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => openFullEdit(goal.id)}
                    aria-label={`${goal.name} bearbeiten`}
                    className="p-1.5 text-white/60 hover:text-white/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                  >
                    <span aria-hidden="true">✏️</span>
                  </button>

                  {confirmDelete === goal.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { onDelete(goal.id); setConfirmDelete(null); }}
                        aria-label={`${goal.name} endgültig löschen`}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                      >
                        Löschen
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        aria-label="Löschen abbrechen"
                        className="text-xs text-white/65 hover:text-white/90 px-2 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(goal.id)}
                      aria-label={`${goal.name} löschen`}
                      className="p-1.5 text-white/60 hover:text-red-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                    >
                      <span aria-hidden="true">🗑️</span>
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
