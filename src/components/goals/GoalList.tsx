import { useRef, useState } from 'react';
import type { Goal } from '../../types';
import { totalMonthlyCosts } from '../../utils/calculations';
import { formatEuro } from '../../utils/formatting';
import { saveGoalDefault } from '../../utils/storage';
import { GoalForm } from './GoalForm';

interface GoalListProps {
  goals: Goal[];
  onAdd: (g: Goal) => void;
  onUpdate: (g: Goal) => void;
  onDelete: (id: string) => void;
}

function sortDesc(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => b.monthlyAmount - a.monthlyAmount);
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3.5 h-3.5" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
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
    setEditingId(null);
    setInlineNameId(goal.id);
    setInlineNameValue(goal.name);
  }

  function saveInlineName(goal: Goal) {
    const trimmed = inlineNameValue.trim();
    if (trimmed && trimmed !== goal.name) onUpdate({ ...goal, name: trimmed });
    setInlineNameId(null);
  }

  function openFullEdit(goalId: string) {
    setInlineNameId(null);
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
                  onSaveAsDefault={saveGoalDefault}
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
                        onKeyDown={(e) => { if (e.key === 'Escape') setInlineNameId(null); }}
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
                    className="p-1.5 text-white/50 hover:text-white/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                  >
                    <IconEdit />
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
                        className="p-1.5 text-white/50 hover:text-white/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                      >
                        <IconX />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(goal.id)}
                      aria-label={`${goal.name} löschen`}
                      className="p-1.5 text-white/50 hover:text-red-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                    >
                      <IconTrash />
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
